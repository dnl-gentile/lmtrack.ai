import * as path from "path";
import * as fs from "fs";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import type { Model, Vendor, ArenaScore, Pricing, ComputedMetrics, DataSnapshot } from "../shared/types";
import { computeValueScores, type ValueScoreInput } from "../scoring/valueScore";

const COLL = {
  vendors: "vendors",
  models: "models",
  arenaScores: "arenaScores",
  pricing: "pricing",
  computedMetrics: "computedMetrics",
  dataSnapshots: "dataSnapshots",
};

interface SeedModel {
  vendorSlug: string;
  vendorName: string;
  slug: string;
  canonicalName: string;
  family: string | null;
  modality: string;
  contextWindow: number | null;
  maxOutput: number | null;
  releaseDate: string | null;
  isOpenSource: boolean;
  isActive: boolean;
  aliases: string[];
}

interface SeedPricing {
  modelSlug: string;
  pricingType: "api" | "consumer";
  inputPrice1m?: number | null;
  outputPrice1m?: number | null;
  cachedInput1m?: number | null;
  batchInput1m?: number | null;
  batchOutput1m?: number | null;
  imagePrice?: number | null;
  monthlyPriceUsd?: number | null;
  planName?: string | null;
  usageLimits?: string | null;
  sourceUrl?: string | null;
  snapshotDate: string;
}

function loadJson<T>(filePath: string): T {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Seed file not found: ${fullPath}`);
  }
  const raw = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(raw) as T;
}

export const seedDatabase = onCall(
  { timeoutSeconds: 300 },
  async (request) => {
    try {
      const db = getFirestore();
      const now = new Date().toISOString();
      let vendorsCreated = 0;
      let modelsCreated = 0;
      let pricingCreated = 0;

      // Path relative to compiled lib/seed/seedDatabase.js -> functions/data/
      // For local runs: copy or symlink project data into functions/data/
      const modelsPath = path.join(__dirname, "..", "..", "data", "models-seed.json");
      const pricingPath = path.join(__dirname, "..", "..", "data", "pricing-seed.json");

      const seedModels = loadJson<SeedModel[]>(modelsPath);
      const seedPricing = loadJson<SeedPricing[]>(pricingPath);

      const vendorIds = new Map<string, string>();

      for (const m of seedModels) {
        const vendorId = `vendor_${m.vendorSlug}`;
        if (!vendorIds.has(m.vendorSlug)) {
          const ref = db.collection(COLL.vendors).doc(vendorId);
          const snap = await ref.get();
          if (!snap.exists) {
            const vendor: Omit<Vendor, "id"> & { id: string } = {
              id: vendorId,
              slug: m.vendorSlug,
              name: m.vendorName,
              logoUrl: "",
              websiteUrl: "",
              createdAt: now,
              updatedAt: now,
            };
            await ref.set(vendor);
            vendorsCreated++;
          }
          vendorIds.set(m.vendorSlug, vendorId);
        }

        const modelId = `model_${m.vendorSlug}_${m.slug}`;
        const modelRef = db.collection(COLL.models).doc(modelId);
        const modelSnap = await modelRef.get();
        if (!modelSnap.exists) {
          const model: Omit<Model, "id"> & { id: string } = {
            id: modelId,
            vendorId: vendorIds.get(m.vendorSlug)!,
            vendorSlug: m.vendorSlug,
            vendorName: m.vendorName,
            slug: m.slug,
            canonicalName: m.canonicalName,
            family: m.family ?? null,
            modality: m.modality as Model["modality"],
            contextWindow: m.contextWindow ?? null,
            maxOutput: m.maxOutput ?? null,
            releaseDate: m.releaseDate ?? null,
            isOpenSource: m.isOpenSource,
            isActive: m.isActive,
            aliases: m.aliases ?? [],
            createdAt: now,
            updatedAt: now,
          };
          await modelRef.set(model);
          modelsCreated++;
        }
      }

      for (const p of seedPricing) {
        const modelSnap = await db
          .collection(COLL.models)
          .where("slug", "==", p.modelSlug)
          .limit(1)
          .get();
        if (modelSnap.empty) continue;
        const modelDoc = modelSnap.docs[0];
        const modelId = modelDoc.id;
        const pricingId = `pricing_${modelId}_${p.snapshotDate}_${p.pricingType}`;
        const pricingRef = db.collection(COLL.pricing).doc(pricingId);
        const existing = await pricingRef.get();
        if (!existing.exists) {
          const pricing: Omit<Pricing, "id"> & { id: string } = {
            id: pricingId,
            modelId,
            modelSlug: p.modelSlug,
            pricingType: p.pricingType,
            inputPrice1m: p.inputPrice1m ?? null,
            outputPrice1m: p.outputPrice1m ?? null,
            cachedInput1m: p.cachedInput1m ?? null,
            batchInput1m: p.batchInput1m ?? null,
            batchOutput1m: p.batchOutput1m ?? null,
            imagePrice: p.imagePrice ?? null,
            monthlyPriceUsd: p.monthlyPriceUsd ?? null,
            planName: p.planName ?? null,
            usageLimits: p.usageLimits ?? null,
            sourceUrl: p.sourceUrl ?? null,
            snapshotDate: p.snapshotDate,
            isCurrent: true,
            createdAt: now,
          };
          await pricingRef.set(pricing);
          pricingCreated++;
        }
      }

      const [arenaSnap, pricingSnap, modelsSnap] = await Promise.all([
        db.collection(COLL.arenaScores).get(),
        db.collection(COLL.pricing).where("isCurrent", "==", true).get(),
        db.collection(COLL.models).get(),
      ]);

      const modelById = new Map<string, { slug: string }>();
      modelsSnap.docs.forEach((d) => {
        const dta = d.data();
        modelById.set(d.id, { slug: dta.slug });
      });

      const pricingByModel = new Map<string, { inputPrice1m: number; outputPrice1m: number }>();
      pricingSnap.docs.forEach((d) => {
        const dta = d.data();
        const input = dta.inputPrice1m ?? 0;
        const output = dta.outputPrice1m ?? 0;
        if (input > 0 || output > 0) {
          pricingByModel.set(dta.modelId, { inputPrice1m: input, outputPrice1m: output });
        }
      });

      const valueInputs: ValueScoreInput[] = [];
      arenaSnap.docs.forEach((d) => {
        const dta = d.data();
        const pr = pricingByModel.get(dta.modelId);
        if (!pr) return;
        valueInputs.push({
          modelId: dta.modelId,
          modelSlug: dta.modelSlug,
          domain: dta.domain as string,
          elo: dta.eloScore ?? 0,
          inputPrice: pr.inputPrice1m,
          outputPrice: pr.outputPrice1m,
        });
      });

      const computed = computeValueScores(valueInputs);
      const batch = db.batch();
      for (const c of computed) {
        const id = `metric_${c.modelId}_${c.domain}`;
        const ref = db.collection(COLL.computedMetrics).doc(id);
        const metric: Omit<ComputedMetrics, "id"> & { id: string } = {
          id,
          modelId: c.modelId,
          modelSlug: c.modelSlug,
          domain: c.domain,
          eloScore: c.eloScore,
          avgPrice1m: null,
          blendedPrice1m: c.blendedPrice1m,
          eloPerDollar: c.eloPerDollar,
          dollarPerElo: c.blendedPrice1m && c.eloScore ? c.blendedPrice1m / c.eloScore : null,
          valueScore: c.valueScore,
          valueRank: c.valueRank,
          qualityPercentile: null,
          pricePercentile: null,
          valuePercentile: c.valueScore,
          snapshotDate: now.slice(0, 10),
          computedAt: now,
        };
        batch.set(ref, metric);
      }
      await batch.commit();

      const snapshotDoc: Omit<DataSnapshot, "id"> & { id: string } = {
        id: `seed_${Date.now()}`,
        source: "seedDatabase",
        snapshotDate: now.slice(0, 10),
        recordsCount: vendorsCreated + modelsCreated + pricingCreated,
        status: "completed",
        errorMessage: null,
        startedAt: now,
        completedAt: new Date().toISOString(),
      };
      await db.collection(COLL.dataSnapshots).doc(snapshotDoc.id).set(snapshotDoc);

      return {
        vendorsCreated,
        modelsCreated,
        pricingCreated,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[seedDatabase]", message);
      throw new HttpsError("internal", message);
    }
  }
);
