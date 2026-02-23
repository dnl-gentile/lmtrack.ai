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

export interface DomainCategoryDef {
  key: string;
  label: string;
  emoji: string;
}

export interface DomainDef {
  key: DomainKey;
  label: string;
  emoji: string;
  arenaPath: string; // path on arena.ai
  categories: DomainCategoryDef[];
  showStyleControl?: boolean;
  showContextFilter?: boolean;
  showModalityFilter?: boolean;
}

export const DOMAINS: DomainDef[] = [
  {
    key: "overall",
    label: "Overall",
    emoji: "🏆",
    arenaPath: "/leaderboard/text",
    categories: [{ key: "overall", label: "Overall", emoji: "🏆" }],
    showStyleControl: true,
    showContextFilter: true,
    showModalityFilter: true,
  },
  {
    key: "text",
    label: "Text",
    emoji: "📝",
    arenaPath: "/leaderboard/text",
    categories: [
      { key: "overall", label: "Overall", emoji: "🏆" },
      { key: "expert", label: "Expert", emoji: "🤓" },
      { key: "occupational", label: "Occupational", emoji: "💼" },
      { key: "math", label: "Math", emoji: "🧮" },
      { key: "instruction_following", label: "Instruction Following", emoji: "📝" },
      { key: "multi_turn", label: "Multi-Turn", emoji: "💬" },
      { key: "creative_writing", label: "Creative Writing", emoji: "✍️" },
      { key: "coding", label: "Coding", emoji: "💻" },
      { key: "hard_prompts", label: "Hard Prompts", emoji: "🌶️" },
      { key: "hard_prompts_en", label: "Hard Prompts (English)", emoji: "🧠" },
    ],
    showStyleControl: true,
    showContextFilter: true,
    showModalityFilter: true,
  },
  {
    key: "code",
    label: "Code",
    emoji: "💻",
    arenaPath: "/leaderboard/code",
    categories: [{ key: "webdev", label: "WebDev", emoji: "🌐" }],
    showStyleControl: false,
    showContextFilter: true,
    showModalityFilter: true,
  },
  {
    key: "text-to-image",
    label: "Text to Image",
    emoji: "🖼️",
    arenaPath: "/leaderboard/text-to-image",
    categories: [
      { key: "overall", label: "Overall", emoji: "🏆" },
      {
        key: "product_branding_commercial",
        label: "Product, Branding & Commercial",
        emoji: "🛍️",
      },
      { key: "three_d", label: "3D Imaging & Modeling", emoji: "🧊" },
      { key: "cartoon_anime_fantasy", label: "Cartoon, Anime & Fantasy", emoji: "🐉" },
      {
        key: "photorealistic_cinematic",
        label: "Photorealistic & Cinematic Images",
        emoji: "🌄",
      },
      { key: "art", label: "Art", emoji: "🎨" },
      { key: "portraits", label: "Portraits", emoji: "👤" },
      { key: "text_rendering", label: "Text Rendering", emoji: "📝" },
    ],
    showStyleControl: false,
    showContextFilter: false,
    showModalityFilter: false,
  },
  {
    key: "image-edit",
    label: "Image Edit",
    emoji: "🧰",
    arenaPath: "/leaderboard/image-edit",
    categories: [
      { key: "single_image_edit", label: "Single-Image Edit", emoji: "🖼️" },
      { key: "multi_image_edit", label: "Multi-Image Edit", emoji: "🔢" },
    ],
    showStyleControl: false,
    showContextFilter: false,
    showModalityFilter: false,
  },
  {
    key: "text-to-video",
    label: "Text to Video",
    emoji: "🎬",
    arenaPath: "/leaderboard/text-to-video",
    categories: [
      { key: "overall", label: "Overall", emoji: "🏆" },
      { key: "author_vote", label: "Author Vote", emoji: "👤" },
    ],
    showStyleControl: false,
    showContextFilter: false,
    showModalityFilter: false,
  },
  {
    key: "image-to-video",
    label: "Image to Video",
    emoji: "🖼️",
    arenaPath: "/leaderboard/image-to-video",
    categories: [
      { key: "overall", label: "Overall", emoji: "🏆" },
      { key: "author_vote", label: "Author Vote", emoji: "👤" },
    ],
    showStyleControl: false,
    showContextFilter: false,
    showModalityFilter: false,
  },
  {
    key: "vision",
    label: "Vision",
    emoji: "👁️",
    arenaPath: "/leaderboard/vision",
    categories: [
      { key: "overall", label: "Overall", emoji: "🏆" },
      { key: "english", label: "English", emoji: "🇬🇧" },
      { key: "chinese", label: "Chinese", emoji: "🇨🇳" },
      { key: "captioning", label: "Captioning", emoji: "🖼️" },
      { key: "creative_writing", label: "Creative Writing", emoji: "✍️" },
      { key: "diagram", label: "Diagram", emoji: "📊" },
      { key: "entity_recognition", label: "Entity Recognition", emoji: "🔍" },
      { key: "homework", label: "Homework", emoji: "📚" },
      { key: "humor", label: "Humor", emoji: "😄" },
      { key: "ocr", label: "OCR", emoji: "📝" },
    ],
    showStyleControl: true,
    showContextFilter: true,
    showModalityFilter: true,
  },
  {
    key: "search",
    label: "Search",
    emoji: "🔎",
    arenaPath: "/leaderboard/search",
    categories: [],
    showStyleControl: true,
    showContextFilter: true,
    showModalityFilter: false,
  },
];

export const DOMAIN_MAP = Object.fromEntries(
  DOMAINS.map((d) => [d.key, d])
) as Record<DomainKey, DomainDef>;

// Arena-like tab order for leaderboard navigation UI.
export const LEADERBOARD_TAB_ORDER: DomainKey[] = [
  "overall",
  "text",
  "code",
  "vision",
  "text-to-image",
  "image-edit",
  "search",
  "text-to-video",
  "image-to-video",
];

export const LEADERBOARD_OVERVIEW_CARD_ORDER = LEADERBOARD_TAB_ORDER.filter(
  (key) => key !== "overall"
) as Exclude<DomainKey, "overall">[];

export const LEADERBOARD_TAB_LABEL_OVERRIDE: Partial<Record<DomainKey, string>> =
  {
    overall: "Overview",
    "text-to-image": "Text-to-Image",
    "text-to-video": "Text-to-Video",
    "image-to-video": "Image-to-Video",
  };

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
export type RankBy = "models" | "labs";

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
  text: 1,
  code: 1,
  "text-to-image": 1,
  "image-edit": 1,
  "text-to-video": 1,
  "image-to-video": 1,
  vision: 1,
  search: 1,
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
