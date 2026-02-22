import { adminDb } from "@/lib/firebaseAdmin";
import type { LeaderboardEntry } from "@/lib/types";
import { COLL } from "./collections";
import type { DomainKey } from "@/lib/constants";
import { getModels } from "./models";
import { getDataFreshness } from "./metrics";
import {
  BLENDED_PRICE_INPUT_WEIGHT,
  BLENDED_PRICE_OUTPUT_WEIGHT,
} from "@/lib/constants";
import type { Modality } from "@/lib/constants";

export interface GetLeaderboardParams {
  domain: DomainKey;
  sort: string;
  dir: "asc" | "desc";
  vendors?: string[];
  priceMin?: number;
  priceMax?: number;
  contextMin?: number;
  modality?: Modality;
  arenaOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetLeaderboardResult {
  entries: LeaderboardEntry[];
  total: number;
  freshness: {
    arenaLastUpdated: string | null;
    pricingLastUpdated: string | null;
  };
}

function formatEloCi(ciLower: number | null, ciUpper: number | null): string | null {
  if (ciLower == null || ciUpper == null) return null;
  const half = Math.round((ciUpper - ciLower) / 2);
  return half > 0 ? `±${half}` : null;
}

export async function getLeaderboard(
  params: GetLeaderboardParams
): Promise<GetLeaderboardResult> {
  const {
    domain,
    sort: sortField,
    dir: sortDir,
    vendors,
    priceMin = 0,
    priceMax = Number.MAX_SAFE_INTEGER,
    contextMin = 0,
    modality,
    arenaOnly = false,
    search,
    limit = 100,
    offset = 0,
  } = params;

  const [freshness, modelsSnap, arenaSnap, pricingSnap, metricsSnap] =
    await Promise.all([
      getDataFreshness(),
      getModels({
        modality,
        active: true,
        search,
      }),
      adminDb
        .collection(COLL.arenaScores)
        .where("domain", "==", domain)
        .get(),
      adminDb
        .collection(COLL.pricing)
        .where("isCurrent", "==", true)
        .get(),
      adminDb
        .collection(COLL.computedMetrics)
        .where("domain", "==", domain)
        .get(),
    ]);

  const models = vendors?.length
    ? modelsSnap.filter((m) => vendors.includes(m.vendorSlug))
    : modelsSnap;

  const latestArenaByModel = new Map<
    string,
    {
      eloScore: number;
      ciLower: number | null;
      ciUpper: number | null;
      votes: number | null;
    }
  >();
  let latestSnapshotDate: string | null = null;
  arenaSnap.docs.forEach((doc) => {
    const d = doc.data();
    const sd = d.snapshotDate as string;
    if (
      latestSnapshotDate == null ||
      (sd && sd > latestSnapshotDate)
    ) {
      latestSnapshotDate = sd;
    }
  });
  arenaSnap.docs.forEach((doc) => {
    const d = doc.data();
    if (d.snapshotDate !== latestSnapshotDate) return;
    const modelId = d.modelId as string;
    latestArenaByModel.set(modelId, {
      eloScore: Number(d.eloScore) || 0,
      ciLower: d.eloCiLower ?? null,
      ciUpper: d.eloCiUpper ?? null,
      votes: d.votes ?? null,
    });
  });

  const pricingByModel = new Map<
    string,
    {
      inputPrice1m: number | null;
      outputPrice1m: number | null;
      blendedPrice1m: number;
    }
  >();
  pricingSnap.docs.forEach((doc) => {
    const d = doc.data();
    if (d.pricingType !== "api") return;
    const modelId = d.modelId as string;
    const input = d.inputPrice1m ?? null;
    const output = d.outputPrice1m ?? null;
    const blended =
      input != null && output != null
        ? input * BLENDED_PRICE_INPUT_WEIGHT +
          output * BLENDED_PRICE_OUTPUT_WEIGHT
        : 0;
    pricingByModel.set(modelId, {
      inputPrice1m: input,
      outputPrice1m: output,
      blendedPrice1m: blended,
    });
  });

  const metricsByModel = new Map<
    string,
    {
      eloScore: number | null;
      blendedPrice1m: number | null;
      eloPerDollar: number | null;
      valueScore: number | null;
      valueRank: number | null;
    }
  >();
  metricsSnap.docs.forEach((doc) => {
    const d = doc.data();
    const modelId = d.modelId as string;
    metricsByModel.set(modelId, {
      eloScore: d.eloScore ?? null,
      blendedPrice1m: d.blendedPrice1m ?? null,
      eloPerDollar: d.eloPerDollar ?? null,
      valueScore: d.valueScore ?? null,
      valueRank: d.valueRank ?? null,
    });
  });

  const modelList = models.filter((m) => {
    if (contextMin > 0 && (m.contextWindow == null || m.contextWindow < contextMin))
      return false;
    const pricing = pricingByModel.get(m.id);
    if (pricing) {
      if (pricing.blendedPrice1m < priceMin || pricing.blendedPrice1m > priceMax)
        return false;
    }
    if (arenaOnly) {
      if (!latestArenaByModel.has(m.id)) return false;
    }
    return true;
  });

  const entries: LeaderboardEntry[] = modelList.map((m) => {
    const arena = latestArenaByModel.get(m.id);
    const pricing = pricingByModel.get(m.id);
    const metrics = metricsByModel.get(m.id);
    const eloScore = arena?.eloScore ?? metrics?.eloScore ?? null;
    const ci = arena
      ? formatEloCi(arena.ciLower, arena.ciUpper)
      : null;
    const blendedPrice1m =
      pricing?.blendedPrice1m ?? metrics?.blendedPrice1m ?? null;
    const inputPrice1m = pricing?.inputPrice1m ?? null;
    const outputPrice1m = pricing?.outputPrice1m ?? null;
    const eloPerDollar = metrics?.eloPerDollar ?? null;
    const valueScore = metrics?.valueScore ?? null;
    const valueRank = metrics?.valueRank ?? null;

    return {
      rank: 0,
      model: {
        id: m.id,
        slug: m.slug,
        canonicalName: m.canonicalName,
        family: m.family,
        modality: m.modality,
        contextWindow: m.contextWindow,
        vendorSlug: m.vendorSlug,
        vendorName: m.vendorName,
        isOpenSource: m.isOpenSource,
      },
      eloScore,
      eloCi: ci,
      votes: arena?.votes ?? null,
      blendedPrice1m,
      inputPrice1m,
      outputPrice1m,
      eloPerDollar,
      valueScore,
      valueRank,
      domainScores: { [domain]: eloScore },
      hasArenaData: arena != null,
      hasPricingData: pricing != null,
    };
  });

  const mult = sortDir === "asc" ? 1 : -1;
  entries.sort((a, b) => {
    let aVal: number | string | null;
    let bVal: number | string | null;
    switch (sortField) {
      case "eloScore":
        aVal = a.eloScore;
        bVal = b.eloScore;
        break;
      case "valueScore":
        aVal = a.valueScore;
        bVal = b.valueScore;
        break;
      case "blendedPrice1m":
        aVal = a.blendedPrice1m;
        bVal = b.blendedPrice1m;
        break;
      case "votes":
        aVal = a.votes;
        bVal = b.votes;
        break;
      default:
        aVal = a.valueScore;
        bVal = b.valueScore;
    }
    const aNum = typeof aVal === "number" ? aVal : 0;
    const bNum = typeof bVal === "number" ? bVal : 0;
    if (aNum !== bNum) return (aNum - bNum) * mult;
    return (a.model.canonicalName.localeCompare(b.model.canonicalName)) * mult;
  });

  const total = entries.length;
  const sliced = entries.slice(offset, offset + limit);
  sliced.forEach((e, i) => {
    e.rank = offset + i + 1;
  });

  return {
    entries: sliced,
    total,
    freshness,
  };
}
