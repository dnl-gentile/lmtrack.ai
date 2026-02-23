/**
 * Firestore collection names. Must match functions/src (seed, triggers).
 */
export const COLL = {
  vendors: "vendors",
  models: "models",
  arenaScores: "arenaScores",
  pricing: "pricing",
  computedMetrics: "computedMetrics",
  dataSnapshots: "dataSnapshots",
  benchmarkJobs: "benchmarkJobs",
  speedRuns: "speedRuns",
  speedRecords: "speedRecords",
  speedArenaRuns: "speedArenaRuns",
  speedArenaRounds: "speedArenaRounds",
  speedArenaVotes: "speedArenaVotes",
} as const;
