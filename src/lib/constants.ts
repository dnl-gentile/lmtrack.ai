export type DomainKey =
  | "overall"
  | "coding"
  | "math"
  | "creative_writing"
  | "hard_prompts"
  | "instruction_following"
  | "vision"
  | "longer_query";

export interface DomainDef {
  key: DomainKey;
  label: string;
  arenaPath: string; // path on arena.ai
}

export const DOMAINS: DomainDef[] = [
  { key: "overall", label: "Overall", arenaPath: "/leaderboard" },
  { key: "coding", label: "Coding", arenaPath: "/leaderboard/code" },
  { key: "math", label: "Math", arenaPath: "/leaderboard" },
  {
    key: "creative_writing",
    label: "Creative Writing",
    arenaPath: "/leaderboard",
  },
  { key: "hard_prompts", label: "Hard Prompts", arenaPath: "/leaderboard" },
  {
    key: "instruction_following",
    label: "Instruction Following",
    arenaPath: "/leaderboard",
  },
  { key: "vision", label: "Vision", arenaPath: "/leaderboard/vision" },
  { key: "longer_query", label: "Longer Query", arenaPath: "/leaderboard" },
];

export const DOMAIN_MAP = Object.fromEntries(
  DOMAINS.map((d) => [d.key, d])
) as Record<DomainKey, DomainDef>;

export interface VendorDef {
  slug: string;
  name: string;
  color: string; // brand color for fallback logo
}

export const VENDORS: VendorDef[] = [
  { slug: "openai", name: "OpenAI", color: "#10a37f" },
  { slug: "anthropic", name: "Anthropic", color: "#d4a574" },
  { slug: "google", name: "Google", color: "#4285f4" },
  { slug: "deepseek", name: "DeepSeek", color: "#4d6bfe" },
  { slug: "xai", name: "xAI", color: "#ffffff" },
  { slug: "mistral", name: "Mistral", color: "#ff7000" },
  { slug: "meta", name: "Meta", color: "#0081fb" },
  { slug: "perplexity", name: "Perplexity", color: "#20b2aa" },
];

export const VENDOR_MAP = Object.fromEntries(
  VENDORS.map((v) => [v.slug, v])
) as Record<string, VendorDef>;

export type OptimizationMode = "best_value" | "best_quality" | "cheapest";

export const OPTIMIZATION_MODES: {
  key: OptimizationMode;
  label: string;
  sortField: string;
  sortDir: "asc" | "desc";
}[] = [
  {
    key: "best_value",
    label: "Best Value",
    sortField: "valueScore",
    sortDir: "desc",
  },
  {
    key: "best_quality",
    label: "Best Quality",
    sortField: "eloScore",
    sortDir: "desc",
  },
  {
    key: "cheapest",
    label: "Cheapest",
    sortField: "blendedPrice1m",
    sortDir: "asc",
  },
];

export const DEFAULT_DOMAIN: DomainKey = "overall";

export const DEFAULT_WEIGHTS: Record<DomainKey, number> = {
  overall: 1,
  coding: 1,
  math: 1,
  creative_writing: 1,
  hard_prompts: 1,
  instruction_following: 1,
  vision: 1,
  longer_query: 1,
};

export const MODALITIES = ["text", "multimodal", "image", "video"] as const;
export type Modality = (typeof MODALITIES)[number];

export const CONTEXT_WINDOW_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "32K+", value: 32000 },
  { label: "64K+", value: 64000 },
  { label: "128K+", value: 128000 },
  { label: "200K+", value: 200000 },
  { label: "1M+", value: 1000000 },
] as const;

export const BLENDED_PRICE_INPUT_WEIGHT = 0.3;
export const BLENDED_PRICE_OUTPUT_WEIGHT = 0.7;
