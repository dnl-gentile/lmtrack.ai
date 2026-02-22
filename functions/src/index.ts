import { initializeApp } from "firebase-admin/app";
import { seedDatabase } from "./seed/seedDatabase";
import { scrapeArena } from "./scheduled/scrapeArena";
import { updatePricing } from "./scheduled/updatePricing";
import { onArenaScoreWritten, onPricingWritten } from "./triggers/recomputeMetrics";

initializeApp();

export { seedDatabase };
export { scrapeArena, updatePricing };
export { onArenaScoreWritten, onPricingWritten };

export {
  scrapeArenaLeaderboard,
} from "./ingestion/arenaScraper";
export { parseArenaTable, type RawArenaEntry } from "./ingestion/arenaParser";
export { matchArenaName } from "./ingestion/canonicalize";
export {
  computeBlendedPrice,
  computeEloPerDollar,
  computeValueScores,
  type ValueScoreInput,
  type ComputedMetricInput,
} from "./scoring/valueScore";
export { percentileRank, minMaxNormalize } from "./scoring/normalize";
