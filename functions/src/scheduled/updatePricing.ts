import { onSchedule } from "firebase-functions/v2/scheduler";

export const updatePricing = onSchedule(
  { schedule: "0 8 * * 1", timeZone: "UTC" },
  async () => {
    // Phase 1: Manual pricing mode - no automated updates
    console.log("Manual pricing mode - no automated updates");

    // Phase 2 (TODO): Call PricePerToken API to get updated prices
    // - Fetch current models from Firestore
    // - Call external pricing API
    // - Upsert pricing docs with isCurrent=true for new snapshot
  }
);
