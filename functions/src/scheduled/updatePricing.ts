import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import type { DataSnapshot } from "../shared/types";
import { runPricingPipeline } from "../pricing/pipeline";

const COLL = {
  dataSnapshots: "dataSnapshots",
};

export const updatePricing = onSchedule(
  { schedule: "0 */12 * * *", timeZone: "UTC" },
  async () => {
    const db = getFirestore();
    const startedAt = new Date().toISOString();
    const snapshotAt = new Date().toISOString();
    let snapshotStatus: DataSnapshot["status"] = "completed";
    let recordsCount = 0;
    let errorMessage: string | null = null;

    try {
      const result = await runPricingPipeline(snapshotAt);
      snapshotStatus = result.status;
      recordsCount = result.recordsWritten;
      errorMessage =
        result.errors.length > 0 || result.modelsMissing.length > 0
          ? [
              result.errors.join(" | "),
              result.modelsMissing.length > 0
                ? `modelsMissing:${result.modelsMissing.slice(0, 25).join(",")}`
                : "",
            ]
              .filter(Boolean)
              .join(" | ")
          : null;
    } catch (err) {
      snapshotStatus = "failed";
      errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[updatePricing]", errorMessage);
    } finally {
      const snapshotDoc: Omit<DataSnapshot, "id"> & { id: string } = {
        id: `update_pricing_${Date.now()}`,
        source: "updatePricing",
        snapshotDate: snapshotAt,
        recordsCount,
        status: snapshotStatus,
        errorMessage,
        startedAt,
        completedAt: new Date().toISOString(),
      };
      await db.collection(COLL.dataSnapshots).doc(snapshotDoc.id).set(snapshotDoc);
    }
  }
);
