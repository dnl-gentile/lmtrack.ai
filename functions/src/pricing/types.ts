export type PricingProvider =
  | "openrouter"
  | "openai"
  | "anthropic"
  | "google"
  | "xai"
  | "deepseek"
  | "mistral"
  | "perplexity";

export type PricingConfidence = "high" | "medium" | "low";

export interface PricingSourceRecord {
  provider: PricingProvider;
  externalModelId: string;
  inputPrice1m: number | null;
  outputPrice1m: number | null;
  cachedInput1m: number | null;
  batchInput1m: number | null;
  batchOutput1m: number | null;
  imagePrice: number | null;
  sourceUrl: string;
  snapshotAt: string;
  confidence: PricingConfidence;
}

export interface PricingModelIndexItem {
  id: string;
  slug: string;
  canonicalName: string;
  vendorSlug: string;
  aliases: string[];
}

export interface MatchedPricingRecord extends PricingSourceRecord {
  modelId: string;
  modelSlug: string;
  sourceName: string;
}

export interface PricingPipelineResult {
  status: "completed" | "partial" | "failed";
  recordsWritten: number;
  modelsMatched: number;
  modelsMissing: string[];
  errors: string[];
}
