import { getFirestore } from "firebase-admin/firestore";
import { fetchOpenRouterPricing } from "./sources/openrouter";
import { fetchVendorFallbackPricing } from "./sources/vendorFallback";
import { matchPricingRecords } from "./matchModel";
import { providerFromVendor } from "./normalizers";
import type {
  MatchedPricingRecord,
  PricingModelIndexItem,
  PricingPipelineResult,
} from "./types";

const COLL = {
  models: "models",
  pricing: "pricing",
};

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

async function loadModels(): Promise<PricingModelIndexItem[]> {
  const db = getFirestore();
  const snap = await db.collection(COLL.models).where("isActive", "==", true).get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      slug: (d.slug ?? "") as string,
      canonicalName: (d.canonicalName ?? "") as string,
      vendorSlug: (d.vendorSlug ?? "") as string,
      aliases: (d.aliases ?? []) as string[],
    };
  });
}

async function setPreviousRowsNotCurrent(modelId: string): Promise<void> {
  const db = getFirestore();
  const snap = await db
    .collection(COLL.pricing)
    .where("modelId", "==", modelId)
    .where("pricingType", "==", "api")
    .where("isCurrent", "==", true)
    .get();

  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.update(doc.ref, { isCurrent: false }));
  await batch.commit();
}

async function writePricingRows(records: MatchedPricingRecord[]): Promise<number> {
  const db = getFirestore();
  const now = new Date().toISOString();
  let writes = 0;

  for (const record of records) {
    await setPreviousRowsNotCurrent(record.modelId);

    const docId = `pricing_${record.modelId}_${record.snapshotAt}_api`;
    await db.collection(COLL.pricing).doc(docId).set({
      id: docId,
      modelId: record.modelId,
      modelSlug: record.modelSlug,
      pricingType: "api",
      inputPrice1m: record.inputPrice1m,
      outputPrice1m: record.outputPrice1m,
      cachedInput1m: record.cachedInput1m,
      batchInput1m: record.batchInput1m,
      batchOutput1m: record.batchOutput1m,
      imagePrice: record.imagePrice,
      monthlyPriceUsd: null,
      planName: null,
      usageLimits: null,
      sourceUrl: record.sourceUrl,
      sourceName: record.sourceName,
      sourceConfidence: record.confidence,
      fetchedAt: now,
      snapshotDate: record.snapshotAt,
      isCurrent: true,
      createdAt: now,
    });

    writes += 1;
  }

  return writes;
}

async function loadCurrentApiPricingModelIds(modelIds: string[]): Promise<Set<string>> {
  const db = getFirestore();
  const chunks: string[][] = [];

  for (let i = 0; i < modelIds.length; i += 30) {
    chunks.push(modelIds.slice(i, i + 30));
  }

  const existing = new Set<string>();
  for (const chunk of chunks) {
    if (chunk.length === 0) continue;
    const snap = await db
      .collection(COLL.pricing)
      .where("modelId", "in", chunk)
      .where("pricingType", "==", "api")
      .where("isCurrent", "==", true)
      .get();
    snap.docs.forEach((doc) => {
      const d = doc.data();
      if (d.modelId) existing.add(d.modelId as string);
    });
  }

  return existing;
}

export async function runPricingPipeline(snapshotAt: string): Promise<PricingPipelineResult> {
  const models = await loadModels();

  const errors: string[] = [];
  const missingExternalIds: string[] = [];

  let openRouterMatched: MatchedPricingRecord[] = [];

  try {
    const openRouterRows = await fetchOpenRouterPricing(snapshotAt);
    const openRouterMatch = matchPricingRecords(models, openRouterRows, "OpenRouter Models API");
    openRouterMatched = openRouterMatch.matched;
    missingExternalIds.push(...openRouterMatch.missingExternalIds);
  } catch (err) {
    errors.push(`openrouter:${err instanceof Error ? err.message : String(err)}`);
  }

  let fallbackMatched: MatchedPricingRecord[] = [];
  try {
    const fallbackRows = await fetchVendorFallbackPricing(snapshotAt);
    const fallbackMatch = matchPricingRecords(models, fallbackRows, "Vendor fallback");
    fallbackMatched = fallbackMatch.matched;
    missingExternalIds.push(...fallbackMatch.missingExternalIds);
  } catch (err) {
    errors.push(`fallback:${err instanceof Error ? err.message : String(err)}`);
  }

  const preferredByModel = new Map<string, MatchedPricingRecord>();

  for (const record of [...fallbackMatched, ...openRouterMatched]) {
    const current = preferredByModel.get(record.modelId);
    if (!current) {
      preferredByModel.set(record.modelId, record);
      continue;
    }

    // Prefer OpenRouter over fallback when both exist.
    if (current.provider !== "openrouter" && record.provider === "openrouter") {
      preferredByModel.set(record.modelId, record);
    }
  }

  const rowsToWrite = [...preferredByModel.values()];
  const recordsWritten = await writePricingRows(rowsToWrite);

  const allModelIds = models.map((m) => m.id);
  const currentModelIds = await loadCurrentApiPricingModelIds(allModelIds);
  const missingModelIds = models.filter((m) => !currentModelIds.has(m.id)).map((m) => m.slug);

  // Also mark as missing if provider mismatch indicates mapping blind spot.
  const likelyMissingByVendor = models
    .filter((m) => !currentModelIds.has(m.id))
    .filter((m) => providerFromVendor(m.vendorSlug) !== "openrouter")
    .map((m) => `${m.vendorSlug}/${m.slug}`);

  const combinedMissing = uniq([...missingModelIds, ...likelyMissingByVendor]);

  const status: PricingPipelineResult["status"] =
    errors.length > 0
      ? recordsWritten > 0
        ? "partial"
        : "failed"
      : combinedMissing.length > 0
      ? "partial"
      : "completed";

  return {
    status,
    recordsWritten,
    modelsMatched: rowsToWrite.length,
    modelsMissing: combinedMissing,
    errors: uniq([...errors, ...missingExternalIds.slice(0, 25).map((id) => `unmatched:${id}`)]),
  };
}
