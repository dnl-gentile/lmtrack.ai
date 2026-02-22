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
  arenaPath: string;
}

export const DOMAINS: DomainDef[] = [
  { key: "overall", label: "Overall", arenaPath: "/leaderboard" },
  { key: "coding", label: "Coding", arenaPath: "/leaderboard/code" },
  { key: "math", label: "Math", arenaPath: "/leaderboard" },
  { key: "creative_writing", label: "Creative Writing", arenaPath: "/leaderboard" },
  { key: "hard_prompts", label: "Hard Prompts", arenaPath: "/leaderboard" },
  { key: "instruction_following", label: "Instruction Following", arenaPath: "/leaderboard" },
  { key: "vision", label: "Vision", arenaPath: "/leaderboard/vision" },
  { key: "longer_query", label: "Longer Query", arenaPath: "/leaderboard" },
];

export const DOMAIN_MAP = Object.fromEntries(
  DOMAINS.map((d) => [d.key, d])
) as Record<DomainKey, DomainDef>;

export const BLENDED_PRICE_INPUT_WEIGHT = 0.3;
export const BLENDED_PRICE_OUTPUT_WEIGHT = 0.7;
