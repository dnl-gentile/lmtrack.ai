import { FieldPath, type DocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import type { Pricing, PricingResponse } from "@/lib/types";
import { COLL } from "./collections";
import { BLENDED_PRICE_INPUT_WEIGHT, BLENDED_PRICE_OUTPUT_WEIGHT } from "@/lib/constants";

function docToPricing(doc: DocumentSnapshot): Pricing {
  const d = doc.data()!;
  return {
    id: doc.id,
    modelId: d.modelId ?? "",
    modelSlug: d.modelSlug ?? "",
    pricingType: d.pricingType ?? "api",
    inputPrice1m: d.inputPrice1m ?? null,
    outputPrice1m: d.outputPrice1m ?? null,
    cachedInput1m: d.cachedInput1m ?? null,
    batchInput1m: d.batchInput1m ?? null,
    batchOutput1m: d.batchOutput1m ?? null,
    imagePrice: d.imagePrice ?? null,
    monthlyPriceUsd: d.monthlyPriceUsd ?? null,
    planName: d.planName ?? null,
    usageLimits: d.usageLimits ?? null,
    sourceUrl: d.sourceUrl ?? null,
    sourceName: d.sourceName ?? null,
    sourceConfidence: d.sourceConfidence ?? null,
    fetchedAt: d.fetchedAt ?? null,
    snapshotDate: d.snapshotDate ?? "",
    isCurrent: d.isCurrent ?? false,
    createdAt: d.createdAt ?? "",
  };
}

export interface GetPricingFilters {
  type?: "api" | "consumer";
  vendor?: string;
  sort?: string;
  dir?: "asc" | "desc";
}

export async function getPricing(
  filters?: GetPricingFilters
): Promise<PricingResponse> {
  let q = adminDb.collection(COLL.pricing).where("isCurrent", "==", true);

  if (filters?.type) {
    q = q.where("pricingType", "==", filters.type);
  }

  const pricingSnap = await q.get();
  const pricingByModel = new Map<string, Pricing[]>();
  for (const doc of pricingSnap.docs) {
    const p = docToPricing(doc);
    const list = pricingByModel.get(p.modelId) || [];
    list.push(p);
    pricingByModel.set(p.modelId, list);
  }

  const modelIds = [...new Set(pricingByModel.keys())];
  if (modelIds.length === 0) {
    return { models: [] };
  }

  const modelMap = new Map<string, { id: string; slug: string; canonicalName: string; vendorSlug: string; vendorName: string; contextWindow: number | null }>();
  const batchSize = 30;
  for (let i = 0; i < modelIds.length; i += batchSize) {
    const chunk = modelIds.slice(i, i + batchSize);
    const modelsSnap = await adminDb
      .collection(COLL.models)
      .where(FieldPath.documentId(), "in", chunk)
      .get();
    for (const doc of modelsSnap.docs) {
      const d = doc.data();
      modelMap.set(doc.id, {
        id: doc.id,
        slug: d.slug ?? "",
        canonicalName: d.canonicalName ?? "",
        vendorSlug: d.vendorSlug ?? "",
        vendorName: d.vendorName ?? "",
        contextWindow: d.contextWindow ?? null,
      });
    }
  }

  const models: PricingResponse["models"] = [];
  for (const modelId of modelIds) {
    const model = modelMap.get(modelId);
    if (!model) continue;
    const plans = pricingByModel.get(modelId) || [];
    const apiPricing = plans.find((p) => p.pricingType === "api");
    const consumerPlans = plans
      .filter((p) => p.pricingType === "consumer" && p.planName != null)
      .map((p) => ({
        planName: p.planName!,
        monthlyUsd: p.monthlyPriceUsd ?? 0,
        usageLimits: p.usageLimits ?? null,
      }));

    const input1m = apiPricing?.inputPrice1m ?? 0;
    const output1m = apiPricing?.outputPrice1m ?? 0;
    const blended =
      input1m != null && output1m != null
        ? input1m * BLENDED_PRICE_INPUT_WEIGHT + output1m * BLENDED_PRICE_OUTPUT_WEIGHT
        : 0;

    models.push({
      model,
      apiPricing: apiPricing
        ? {
            input1m: input1m ?? 0,
            output1m: output1m ?? 0,
            cached1m: apiPricing.cachedInput1m ?? null,
            batchIn1m: apiPricing.batchInput1m ?? null,
            batchOut1m: apiPricing.batchOutput1m ?? null,
          }
        : null,
      consumerPlans,
      sourceUrl: apiPricing?.sourceUrl ?? null,
      snapshotDate: apiPricing?.snapshotDate ?? "",
    });
  }

  let result = models;
  if (filters?.vendor) {
    result = result.filter((m) => m.model.vendorSlug === filters.vendor);
  }
  if (filters?.sort) {
    const dir = filters.dir === "asc" ? 1 : -1;
    result = [...result].sort((a, b) => {
      const aVal = a.apiPricing?.input1m ?? 0;
      const bVal = b.apiPricing?.input1m ?? 0;
      return (aVal - bVal) * dir;
    });
  }

  return { models: result };
}

export async function getPricingByModel(modelId: string): Promise<Pricing[]> {
  const snapshot = await adminDb
    .collection(COLL.pricing)
    .where("modelId", "==", modelId)
    .get();
  return snapshot.docs.map((doc) => docToPricing(doc));
}
