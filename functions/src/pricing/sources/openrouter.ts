import fetch from "node-fetch";
import { cleanPrice, toUsdPer1M } from "../normalizers";
import type { PricingSourceRecord } from "../types";

const OPENROUTER_MODELS_ENDPOINT = "https://openrouter.ai/api/v1/models";
const OPENROUTER_REFERER = "https://lmmarket.ai";

interface OpenRouterModel {
  id?: string;
  pricing?: {
    prompt?: unknown;
    completion?: unknown;
    image?: unknown;
    input_cache_read?: unknown;
    input_cache_write?: unknown;
  };
}

interface OpenRouterResponse {
  data?: OpenRouterModel[];
}

export async function fetchOpenRouterPricing(snapshotAt: string): Promise<PricingSourceRecord[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "HTTP-Referer": OPENROUTER_REFERER,
    "X-Title": "lmmarket.ai",
  };

  const key = process.env.OPENROUTER_API_KEY;
  if (key) {
    headers.Authorization = `Bearer ${key}`;
  }

  const res = await fetch(OPENROUTER_MODELS_ENDPOINT, { headers });
  if (!res.ok) {
    throw new Error(`OpenRouter returned ${res.status}`);
  }

  const payload = (await res.json()) as OpenRouterResponse;
  const rows = payload.data ?? [];

  const records: PricingSourceRecord[] = [];

  for (const row of rows) {
    if (!row.id) continue;

    const inputPrice1m = cleanPrice(toUsdPer1M(row.pricing?.prompt));
    const outputPrice1m = cleanPrice(toUsdPer1M(row.pricing?.completion));
    const cachedInput1m = cleanPrice(toUsdPer1M(row.pricing?.input_cache_read));
    const cacheWrite = cleanPrice(toUsdPer1M(row.pricing?.input_cache_write));
    const imagePrice = cleanPrice(toUsdPer1M(row.pricing?.image));

    if (inputPrice1m == null && outputPrice1m == null && imagePrice == null) {
      continue;
    }

    records.push({
      provider: "openrouter",
      externalModelId: row.id,
      inputPrice1m,
      outputPrice1m,
      cachedInput1m,
      // OpenRouter doesn't expose batch pricing in this endpoint.
      batchInput1m: cacheWrite,
      batchOutput1m: null,
      imagePrice,
      sourceUrl: "https://openrouter.ai/models",
      snapshotAt,
      confidence: key ? "high" : "medium",
    });
  }

  return records;
}
