import type { DocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import type { ComputedMetrics } from "@/lib/types";
import { COLL } from "./collections";
import type { DomainKey } from "@/lib/constants";

function docToComputedMetrics(doc: DocumentSnapshot): ComputedMetrics {
  const d = doc.data()!;
  return {
    id: doc.id,
    modelId: d.modelId ?? "",
    modelSlug: d.modelSlug ?? "",
    domain: d.domain as DomainKey,
    eloScore: d.eloScore ?? null,
    avgPrice1m: d.avgPrice1m ?? null,
    blendedPrice1m: d.blendedPrice1m ?? null,
    eloPerDollar: d.eloPerDollar ?? null,
    dollarPerElo: d.dollarPerElo ?? null,
    valueScore: d.valueScore ?? null,
    valueRank: d.valueRank ?? null,
    qualityPercentile: d.qualityPercentile ?? null,
    pricePercentile: d.pricePercentile ?? null,
    valuePercentile: d.valuePercentile ?? null,
    snapshotDate: d.snapshotDate ?? "",
    computedAt: d.computedAt ?? "",
  };
}

export async function getMetrics(
  modelId: string,
  domain?: DomainKey
): Promise<ComputedMetrics[]> {
  let q = adminDb
    .collection(COLL.computedMetrics)
    .where("modelId", "==", modelId);

  if (domain) {
    q = q.where("domain", "==", domain);
  }

  const snapshot = await q.get();
  return snapshot.docs.map((doc) => docToComputedMetrics(doc));
}

export async function getDataFreshness(): Promise<{
  arenaLastUpdated: string | null;
  pricingLastUpdated: string | null;
}> {
  const snapshots = await adminDb
    .collection(COLL.dataSnapshots)
    .where("status", "==", "completed")
    .limit(50)
    .get();

  const docs = snapshots.docs
    .filter((d) => d.data().completedAt)
    .sort(
      (a, b) =>
        (b.data().completedAt as string).localeCompare(
          a.data().completedAt as string
        )
    );

  let arenaLastUpdated: string | null = null;
  let pricingLastUpdated: string | null = null;

  for (const doc of docs) {
    const d = doc.data();
    const source = d.source as string;
    const completedAt = d.completedAt as string | null;
    if ((source === "arena" || source === "scrapeArena") && arenaLastUpdated == null && completedAt)
      arenaLastUpdated = completedAt;
    if ((source === "pricing" || source === "updatePricing") && pricingLastUpdated == null && completedAt)
      pricingLastUpdated = completedAt;
    if (arenaLastUpdated != null && pricingLastUpdated != null) break;
  }

  return { arenaLastUpdated, pricingLastUpdated };
}
