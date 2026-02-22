import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { computeValueScores, type ValueScoreInput } from "../scoring/valueScore";
import type { DomainKey } from "../shared/constants";
import type { ComputedMetrics } from "../shared/types";

const COLL = {
  models: "models",
  arenaScores: "arenaScores",
  pricing: "pricing",
  computedMetrics: "computedMetrics",
};

async function recomputeMetricsForModelDomain(
  db: Firestore,
  modelId: string,
  modelSlug: string,
  domain: DomainKey,
  eloScore: number,
  inputPrice1m: number,
  outputPrice1m: number,
  allEntriesInDomain: ValueScoreInput[]
): Promise<void> {
  const entriesWithThis = allEntriesInDomain.length
    ? allEntriesInDomain
    : [
        {
          modelId,
          modelSlug,
          domain,
          elo: eloScore,
          inputPrice: inputPrice1m,
          outputPrice: outputPrice1m,
        },
      ];
  const computed = computeValueScores(entriesWithThis);
  const c = computed.find((x) => x.modelId === modelId && x.domain === domain);
  if (!c) return;

  const blended = c.blendedPrice1m ?? 0;
  const eloPerDollar = c.eloPerDollar ?? 0;
  const dollarPerElo = blended && eloScore ? blended / eloScore : null;

  const id = `metric_${modelId}_${domain}`;
  const ref = db.collection(COLL.computedMetrics).doc(id);
  const now = new Date().toISOString();
  const metric: Omit<ComputedMetrics, "id"> & { id: string } = {
    id,
    modelId,
    modelSlug,
    domain,
    eloScore,
    avgPrice1m: null,
    blendedPrice1m: blended || null,
    eloPerDollar: eloPerDollar || null,
    dollarPerElo,
    valueScore: c.valueScore ?? null,
    valueRank: c.valueRank ?? null,
    qualityPercentile: null,
    pricePercentile: null,
    valuePercentile: c.valueScore ?? null,
    snapshotDate: now.slice(0, 10),
    computedAt: now,
  };
  await ref.set(metric);
}

export const onArenaScoreWritten = onDocumentWritten(
  "arenaScores/{scoreId}",
  async (event) => {
    try {
      const snap = event.data?.after;
      if (!snap?.exists) return;
      const d = snap.data();
      if (!d) return;
      const modelId = d.modelId as string;
      const modelSlug = d.modelSlug as string;
      const domain = d.domain as DomainKey;
      const eloScore = Number(d.eloScore) || 0;

      const db = getFirestore();

      const pricingSnap = await db
        .collection(COLL.pricing)
        .where("modelId", "==", modelId)
        .where("isCurrent", "==", true)
        .limit(1)
        .get();
      if (pricingSnap.empty) return;
      const pricing = pricingSnap.docs[0].data();
      const inputPrice1m = Number(pricing.inputPrice1m) || 0;
      const outputPrice1m = Number(pricing.outputPrice1m) || 0;

      const arenaSnap = await db
        .collection(COLL.arenaScores)
        .where("domain", "==", domain)
        .get();
      const modelIds = [...new Set(arenaSnap.docs.map((doc) => doc.data().modelId))];
      const pricingByModel = new Map<string, { inputPrice1m: number; outputPrice1m: number }>();
      for (const mid of modelIds) {
        const ps = await db
          .collection(COLL.pricing)
          .where("modelId", "==", mid)
          .where("isCurrent", "==", true)
          .limit(1)
          .get();
        if (!ps.empty) {
          const p = ps.docs[0].data();
          pricingByModel.set(mid, {
            inputPrice1m: Number(p.inputPrice1m) || 0,
            outputPrice1m: Number(p.outputPrice1m) || 0,
          });
        }
      }
      const valueInputs: ValueScoreInput[] = [];
      arenaSnap.docs.forEach((doc) => {
        const data = doc.data();
        const pr = pricingByModel.get(data.modelId);
        if (!pr) return;
        valueInputs.push({
          modelId: data.modelId,
          modelSlug: data.modelSlug,
          domain: data.domain,
          elo: data.eloScore ?? 0,
          inputPrice: pr.inputPrice1m,
          outputPrice: pr.outputPrice1m,
        });
      });

      await recomputeMetricsForModelDomain(
        db,
        modelId,
        modelSlug,
        domain,
        eloScore,
        inputPrice1m,
        outputPrice1m,
        valueInputs
      );

      const allInDomain = await db
        .collection(COLL.computedMetrics)
        .where("domain", "==", domain)
        .get();
      interface MetricRow { id: string; valueScore?: number }
      const toUpdate: MetricRow[] = allInDomain.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MetricRow));
      const sorted = [...toUpdate].sort(
        (a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0)
      );
      const batch = db.batch();
      sorted.forEach((entry, i) => {
        const ref = db.collection(COLL.computedMetrics).doc(entry.id);
        batch.update(ref, { valueRank: i + 1 });
      });
      await batch.commit();
    } catch (err) {
      console.error("[onArenaScoreWritten]", err);
      throw err;
    }
  }
);

export const onPricingWritten = onDocumentWritten(
  "pricing/{pricingId}",
  async (event) => {
    try {
      const snap = event.data?.after;
      if (!snap?.exists) return;
      const d = snap.data();
      if (!d) return;
      const modelId = d.modelId as string;
      const modelSlug = d.modelSlug as string;
      const isCurrent = d.isCurrent === true;
      if (!isCurrent) return;

      const db = getFirestore();
      const inputPrice1m = Number(d.inputPrice1m) || 0;
      const outputPrice1m = Number(d.outputPrice1m) || 0;

      const arenaSnap = await db
        .collection(COLL.arenaScores)
        .where("modelId", "==", modelId)
        .get();

      const pricingSnap = await db
        .collection(COLL.pricing)
        .where("modelId", "==", modelId)
        .where("isCurrent", "==", true)
        .limit(1)
        .get();
      const pricingByModel = new Map<string, { inputPrice1m: number; outputPrice1m: number }>();
      pricingSnap.docs.forEach((doc) => {
        const p = doc.data();
        if (!p.modelId) return;
        pricingByModel.set(p.modelId as string, {
          inputPrice1m: Number(p.inputPrice1m) || 0,
          outputPrice1m: Number(p.outputPrice1m) || 0,
        });
      });

      const domains = new Set<DomainKey>();
      const valueInputsByDomain = new Map<DomainKey, ValueScoreInput[]>();

      for (const doc of arenaSnap.docs) {
        const data = doc.data();
        if (!data) continue;
        const domain = data.domain as DomainKey;
        domains.add(domain);
        const pr = pricingByModel.get(modelId);
        if (!pr) continue;
        if (!valueInputsByDomain.has(domain)) {
          const allInDomain = await db
            .collection(COLL.arenaScores)
            .where("domain", "==", domain)
            .get();
          const inputs: ValueScoreInput[] = [];
          for (const ad of allInDomain.docs) {
            const adata = ad.data();
            if (!adata?.modelId) continue;
            const pr2 = pricingByModel.get(adata.modelId as string);
            if (!pr2) continue;
            inputs.push({
              modelId: adata.modelId,
              modelSlug: adata.modelSlug,
              domain: adata.domain,
              elo: adata.eloScore ?? 0,
              inputPrice: pr2.inputPrice1m,
              outputPrice: pr2.outputPrice1m,
            });
          }
          valueInputsByDomain.set(domain, inputs);
        }
        const entries = valueInputsByDomain.get(domain)!;
        await recomputeMetricsForModelDomain(
          db,
          modelId,
          modelSlug,
          domain,
          data.eloScore ?? 0,
          inputPrice1m,
          outputPrice1m,
          entries
        );
      }

      interface MetricRow { id: string; valueScore?: number }
      for (const domain of domains) {
        const allInDomain = await db
          .collection(COLL.computedMetrics)
          .where("domain", "==", domain)
          .get();
        const toUpdate: MetricRow[] = allInDomain.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MetricRow));
        const sorted = [...toUpdate].sort(
          (a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0)
        );
        const batch = db.batch();
        sorted.forEach((entry, i) => {
          const ref = db.collection(COLL.computedMetrics).doc(entry.id);
          batch.update(ref, { valueRank: i + 1 });
        });
        await batch.commit();
      }
    } catch (err) {
      console.error("[onPricingWritten]", err);
      throw err;
    }
  }
);
