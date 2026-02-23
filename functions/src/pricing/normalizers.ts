import type { PricingProvider } from "./types";

const PROVIDER_BY_VENDOR: Record<string, PricingProvider> = {
  openai: "openai",
  anthropic: "anthropic",
  google: "google",
  xai: "xai",
  deepseek: "deepseek",
  mistral: "mistral",
  perplexity: "perplexity",
  meta: "openrouter",
};

export function providerFromVendor(vendorSlug: string): PricingProvider {
  return PROVIDER_BY_VENDOR[vendorSlug] ?? "openrouter";
}

export function normalizeToken(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[.:/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeModelName(input: string): string {
  return normalizeToken(input)
    .replace(/-latest$/g, "")
    .replace(/-preview$/g, "")
    .replace(/-exp$/g, "")
    .replace(/-beta$/g, "")
    .replace(/-alpha$/g, "")
    .replace(/-(20\d{2})(\d{2})(\d{2})$/g, "")
    .replace(/-(20\d{2})-(\d{2})-(\d{2})$/g, "")
    .replace(/-\d{3}$/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toUsdPer1M(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw <= 0) return null;
    if (raw < 0.01) return raw * 1_000_000;
    return raw;
  }
  if (typeof raw === "string") {
    const n = Number(raw.trim());
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n < 0.01) return n * 1_000_000;
    return n;
  }
  return null;
}

export function cleanPrice(raw: number | null): number | null {
  if (raw == null || !Number.isFinite(raw) || raw <= 0) return null;
  return Number(raw.toFixed(6));
}
