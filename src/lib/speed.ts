import type { SpeedTestCase } from "./types";

export const BENCHMARK_REPEATS = 3;
export const SPEED_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const SPEED_RATE_LIMIT_MAX_RUNS = 8;

export const SPEED_TEST_CASES: SpeedTestCase[] = [
  {
    key: "short",
    label: "Short",
    prompt:
      "Write two concise bullet points explaining when to use retrieval-augmented generation.",
    maxOutputTokens: 80,
  },
  {
    key: "medium",
    label: "Medium",
    prompt:
      "Draft a practical implementation checklist for shipping a production chat assistant with monitoring, evaluation, and fallback handling.",
    maxOutputTokens: 250,
  },
  {
    key: "long",
    label: "Long",
    prompt:
      "Create a detailed architecture proposal for a multi-tenant AI platform, including model routing, rate limits, observability, data retention, and incident response.",
    maxOutputTokens: 700,
  },
];

const OVERALL_WEIGHTS: Record<SpeedTestCase["key"], number> = {
  short: 0.25,
  medium: 0.35,
  long: 0.4,
};

export interface ProviderConfig {
  vendorSlug: string;
  envKey: string;
  endpoint: "openai_compat" | "anthropic" | "google";
  baseUrl?: string;
}

export const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    vendorSlug: "openai",
    envKey: "OPENAI_API_KEY",
    endpoint: "openai_compat",
    baseUrl: "https://api.openai.com/v1/chat/completions",
  },
  {
    vendorSlug: "deepseek",
    envKey: "DEEPSEEK_API_KEY",
    endpoint: "openai_compat",
    baseUrl: "https://api.deepseek.com/chat/completions",
  },
  {
    vendorSlug: "xai",
    envKey: "XAI_API_KEY",
    endpoint: "openai_compat",
    baseUrl: "https://api.x.ai/v1/chat/completions",
  },
  {
    vendorSlug: "mistral",
    envKey: "MISTRAL_API_KEY",
    endpoint: "openai_compat",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
  },
  {
    vendorSlug: "perplexity",
    envKey: "PERPLEXITY_API_KEY",
    endpoint: "openai_compat",
    baseUrl: "https://api.perplexity.ai/chat/completions",
  },
  {
    vendorSlug: "anthropic",
    envKey: "ANTHROPIC_API_KEY",
    endpoint: "anthropic",
  },
  {
    vendorSlug: "google",
    envKey: "GOOGLE_API_KEY",
    endpoint: "google",
  },
];

export function getProviderConfig(vendorSlug: string): ProviderConfig | null {
  return PROVIDER_CONFIGS.find((c) => c.vendorSlug === vendorSlug) ?? null;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function computeOverallMedianLatency(input: {
  short: number | null;
  medium: number | null;
  long: number | null;
}): number | null {
  const weightedValues = (Object.keys(OVERALL_WEIGHTS) as Array<SpeedTestCase["key"]>)
    .map((key) => {
      const value = input[key];
      if (value == null) return null;
      return { value, weight: OVERALL_WEIGHTS[key] };
    })
    .filter(Boolean) as Array<{ value: number; weight: number }>;

  if (weightedValues.length === 0) return null;

  const totalWeight = weightedValues.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return null;

  const weightedLatency = weightedValues.reduce(
    (sum, item) => sum + item.value * item.weight,
    0
  );
  return weightedLatency / totalWeight;
}

export function resolveModelProviderName(vendorSlug: string, modelSlug: string): string {
  if (vendorSlug === "google") return `models/${modelSlug}`;
  return modelSlug;
}
