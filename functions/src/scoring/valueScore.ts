import {
  BLENDED_PRICE_INPUT_WEIGHT,
  BLENDED_PRICE_OUTPUT_WEIGHT,
} from "../shared/constants";
import type { DomainKey } from "../shared/constants";
import { percentileRank } from "./normalize.js";

export interface ValueScoreInput {
  modelId: string;
  modelSlug: string;
  domain: string;
  elo: number;
  inputPrice: number;
  outputPrice: number;
}

export interface ComputedMetricInput {
  modelId: string;
  modelSlug: string;
  domain: DomainKey;
  eloScore: number | null;
  blendedPrice1m: number | null;
  eloPerDollar: number | null;
  valueScore: number | null;
  valueRank: number | null;
}

export function computeBlendedPrice(
  inputPrice: number,
  outputPrice: number
): number {
  return (
    inputPrice * BLENDED_PRICE_INPUT_WEIGHT +
    outputPrice * BLENDED_PRICE_OUTPUT_WEIGHT
  );
}

export function computeEloPerDollar(
  elo: number,
  blendedPrice: number
): number {
  if (blendedPrice <= 0) return 0;
  return elo / blendedPrice;
}

/**
 * Compute value scores and ranks from entries with elo + pricing.
 * valueScore = 0–100 percentile of eloPerDollar; valueRank 1 = best value.
 */
export function computeValueScores(
  entries: ValueScoreInput[]
): ComputedMetricInput[] {
  const withBlended = entries.map((e) => ({
    ...e,
    blendedPrice: computeBlendedPrice(e.inputPrice, e.outputPrice),
    eloPerDollar: computeEloPerDollar(
      e.elo,
      computeBlendedPrice(e.inputPrice, e.outputPrice)
    ),
  }));

  const allEpd = withBlended.map((e) => e.eloPerDollar).filter((n) => n > 0);
  const epdMin = allEpd.length ? Math.min(...allEpd) : 0;
  const epdMax = allEpd.length ? Math.max(...allEpd) : 0;

  const withPercentile = withBlended.map((e) => ({
    ...e,
    valueScore:
      epdMin === epdMax
        ? 50
        : percentileRank(e.eloPerDollar, withBlended.map((x) => x.eloPerDollar)),
  }));

  const byDomain = new Map<string, typeof withPercentile>();
  for (const e of withPercentile) {
    const key = e.domain;
    if (!byDomain.has(key)) byDomain.set(key, []);
    byDomain.get(key)!.push(e);
  }

  const result: ComputedMetricInput[] = [];
  for (const [, domainEntries] of byDomain) {
    const sorted = [...domainEntries].sort(
      (a, b) => (b.valueScore ?? 0) - (a.valueScore ?? 0)
    );
    sorted.forEach((e, i) => {
      result.push({
        modelId: e.modelId,
        modelSlug: e.modelSlug,
        domain: e.domain as DomainKey,
        eloScore: e.elo,
        blendedPrice1m: e.blendedPrice,
        eloPerDollar: e.eloPerDollar,
        valueScore: e.valueScore ?? null,
        valueRank: i + 1,
      });
    });
  }
  return result;
}
