import type { DomainKey, Modality, OptimizationMode, RankBy } from "./constants";
export type { DomainKey, Modality, OptimizationMode, RankBy };

// ─── Firestore Document Types ──────────────────────────────────

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: string;
  vendorId: string;
  vendorSlug: string;
  vendorName: string;
  slug: string;
  canonicalName: string;
  family: string | null;
  modality: Modality;
  contextWindow: number | null;
  maxOutput: number | null;
  releaseDate: string | null;
  isOpenSource: boolean;
  isActive: boolean;
  aliases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArenaScore {
  id: string;
  modelId: string;
  modelSlug: string;
  domain: DomainKey;
  eloScore: number;
  eloCiLower: number | null;
  eloCiUpper: number | null;
  rank: number | null;
  votes: number | null;
  snapshotDate: string;
  createdAt: string;
}

export interface Pricing {
  id: string;
  modelId: string;
  modelSlug: string;
  pricingType: "api" | "consumer";
  inputPrice1m: number | null;
  outputPrice1m: number | null;
  cachedInput1m: number | null;
  batchInput1m: number | null;
  batchOutput1m: number | null;
  imagePrice: number | null;
  monthlyPriceUsd: number | null;
  planName: string | null;
  usageLimits: string | null;
  sourceUrl: string | null;
  sourceName?: string | null;
  sourceConfidence?: "high" | "medium" | "low" | null;
  fetchedAt?: string | null;
  snapshotDate: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface ComputedMetrics {
  id: string;
  modelId: string;
  modelSlug: string;
  domain: DomainKey;
  eloScore: number | null;
  avgPrice1m: number | null;
  blendedPrice1m: number | null;
  eloPerDollar: number | null;
  dollarPerElo: number | null;
  valueScore: number | null;
  valueRank: number | null;
  qualityPercentile: number | null;
  pricePercentile: number | null;
  valuePercentile: number | null;
  snapshotDate: string;
  computedAt: string;
}

export interface DataSnapshot {
  id: string;
  source: string;
  snapshotDate: string;
  recordsCount: number;
  status: "completed" | "failed" | "partial";
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

// ─── UI / API Response Types ──────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  model: {
    id: string;
    slug: string;
    canonicalName: string;
    family: string | null;
    modality: Modality;
    contextWindow: number | null;
    vendorSlug: string;
    vendorName: string;
    isOpenSource: boolean;
  };
  eloScore: number | null;
  eloCi: string | null; // "+/- 8"
  votes: number | null;
  blendedPrice1m: number | null;
  inputPrice1m: number | null;
  outputPrice1m: number | null;
  eloPerDollar: number | null;
  valueScore: number | null;
  valueRank: number | null;
  domainScores: Partial<Record<DomainKey, number | null>>;
  hasArenaData: boolean;
  hasPricingData: boolean;
}

export interface CompareModel {
  model: Model & { vendor: Vendor };
  arenaScores: Partial<
    Record<
      DomainKey,
      {
        elo: number;
        ci: string | null;
        votes: number | null;
        rank: number | null;
      } | null
    >
  >;
  pricing: {
    api: {
      input1m: number;
      output1m: number;
      blended1m: number;
      cached1m: number | null;
      batchIn1m: number | null;
      batchOut1m: number | null;
    } | null;
    consumer: { plan: string; monthlyUsd: number; limits: string | null }[];
  };
  valueMetrics: Partial<
    Record<
      DomainKey,
      {
        eloPerDollar: number;
        valueScore: number;
        valueRank: number;
      } | null
    >
  >;
}

export interface FilterState {
  domains: DomainKey[];
  vendors: string[];
  priceRange: [number, number];
  contextMin: number;
  modalities: Modality[];
  onlyWithArena: boolean;
  searchQuery: string;
  rankBy: RankBy;
  optimizationMode: OptimizationMode;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  domains: [],
  vendors: [],
  priceRange: [0, 100],
  contextMin: 0,
  modalities: [],
  onlyWithArena: false,
  searchQuery: "",
  rankBy: "models",
  optimizationMode: "best_value",
};

// ─── API Response Types ──────────────────────────────────

export interface LeaderboardResponse {
  status: "ok" | "unconfigured" | "error";
  message?: string;
  entries: LeaderboardEntry[];
  total: number;
  domain: DomainKey;
  dataFreshness: {
    arenaLastUpdated: string | null;
    pricingLastUpdated: string | null;
  };
}

export interface CompareResponse {
  models: CompareModel[];
}

export interface PricingResponse {
  status?: "ok" | "partial" | "error";
  message?: string;
  models: {
    model: Pick<Model, "id" | "slug" | "canonicalName" | "vendorSlug" | "vendorName" | "contextWindow">;
    apiPricing: {
      input1m: number;
      output1m: number;
      cached1m: number | null;
      batchIn1m: number | null;
      batchOut1m: number | null;
    } | null;
    consumerPlans: {
      planName: string;
      monthlyUsd: number;
      usageLimits: string | null;
    }[];
    sourceUrl: string | null;
    snapshotDate: string;
  }[];
}

export interface PricingHistoryPoint {
  snapshotDate: string;
  input1m: number | null;
  output1m: number | null;
  blendedPrice1m: number | null;
  valueScore: number | null;
  eloScore: number | null;
}

export interface PricingHistorySeries {
  modelSlug: string;
  points: PricingHistoryPoint[];
}

export interface PricingHistoryResponse {
  series: PricingHistorySeries[];
}

export interface MetricsResponse {
  model: Pick<Model, "id" | "slug" | "canonicalName">;
  metrics: Partial<
    Record<
      DomainKey,
      {
        eloScore: number | null;
        blendedPrice: number | null;
        eloPerDollar: number | null;
        valueScore: number | null;
        valueRank: number | null;
      }
    >
  >;
  weightedValueScore: number | null;
}
