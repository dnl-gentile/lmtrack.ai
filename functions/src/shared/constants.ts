export type DomainKey =
  | "overall"
  | "text"
  | "code"
  | "text-to-image"
  | "image-edit"
  | "text-to-video"
  | "image-to-video"
  | "vision"
  | "search";

export interface DomainDef {
  key: DomainKey;
  label: string;
  arenaPath: string;
}

export const DOMAINS: DomainDef[] = [
  { key: "overall", label: "Overall", arenaPath: "/leaderboard/text" },
  { key: "text", label: "Text", arenaPath: "/leaderboard/text" },
  { key: "code", label: "Code", arenaPath: "/leaderboard/code" },
  { key: "text-to-image", label: "Text to Image", arenaPath: "/leaderboard/text-to-image" },
  { key: "image-edit", label: "Image Edit", arenaPath: "/leaderboard/image-edit" },
  { key: "text-to-video", label: "Text to Video", arenaPath: "/leaderboard/text-to-video" },
  { key: "image-to-video", label: "Image to Video", arenaPath: "/leaderboard/image-to-video" },
  { key: "vision", label: "Vision", arenaPath: "/leaderboard/vision" },
  { key: "search", label: "Search", arenaPath: "/leaderboard/search" },
];

export const DOMAIN_MAP = Object.fromEntries(
  DOMAINS.map((d) => [d.key, d])
) as Record<DomainKey, DomainDef>;

export const BLENDED_PRICE_INPUT_WEIGHT = 0.3;
export const BLENDED_PRICE_OUTPUT_WEIGHT = 0.7;
