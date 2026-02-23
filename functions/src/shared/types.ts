import type { DomainKey } from "./constants";

export type Modality = "text" | "multimodal" | "image" | "video";

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
