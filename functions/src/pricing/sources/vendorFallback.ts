import type { PricingSourceRecord } from "../types";

/**
 * Fallback layer placeholder for vendor-specific parsers.
 * For this rollout, OpenRouter is the primary structured source and vendor
 * fallback is represented by preserving existing current rows when a model
 * cannot be refreshed.
 */
export async function fetchVendorFallbackPricing(_snapshotAt: string): Promise<PricingSourceRecord[]> {
  return [];
}
