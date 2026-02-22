import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { scrapeArenaLeaderboard } from "../ingestion/arenaScraper";
import { matchArenaName } from "../ingestion/canonicalize";
import { DOMAINS, type DomainKey } from "../shared/constants";
import type { ArenaScore, DataSnapshot } from "../shared/types";

const COLL = {
  models: "models",
  arenaScores: "arenaScores",
  dataSnapshots: "dataSnapshots",
};

export const scrapeArena = onSchedule(
  { schedule: "0 6 * * *", timeZone: "UTC" },
  async () => {
    const db = getFirestore();
    const startedAt = new Date().toISOString();
    let totalRecords = 0;
    let status: "completed" | "failed" | "partial" = "completed";
    let errorMessage: string | null = null;

    try {
      const modelsSnap = await db.collection(COLL.models).get();
      const allModels = modelsSnap.docs.map((d) => {
        const dta = d.data();
        return {
          slug: dta.slug as string,
          aliases: (dta.aliases as string[]) || [],
        };
      });

      for (const d of DOMAINS) {
        const domain = d.key;
        try {
          const rawEntries = await scrapeArenaLeaderboard(domain);
          const snapshotDate = new Date().toISOString().slice(0, 10);

          for (const raw of rawEntries) {
            const modelSlug = matchArenaName(raw.modelName, allModels);
            if (!modelSlug) continue;

            const modelDoc = modelsSnap.docs.find(
              (d) => (d.data() as { slug: string }).slug === modelSlug
            );
            if (!modelDoc) continue;
            const modelId = modelDoc.id;

            const docId = `arena_${modelId}_${domain}_${snapshotDate}`;
            const score: Omit<ArenaScore, "id"> & { id: string } = {
              id: docId,
              modelId,
              modelSlug,
              domain,
              eloScore: raw.eloScore,
              eloCiLower: raw.eloCiLower,
              eloCiUpper: raw.eloCiUpper,
              rank: raw.rank,
              votes: raw.votes,
              snapshotDate,
              createdAt: new Date().toISOString(),
            };
            await db.collection(COLL.arenaScores).doc(docId).set(score);
            totalRecords++;
          }
        } catch (domainErr) {
          const msg = domainErr instanceof Error ? domainErr.message : String(domainErr);
          console.warn(`[scrapeArena] domain ${domain} failed: ${msg}`);
          status = "partial";
          if (!errorMessage) errorMessage = msg;
        }
      }

      const snapshotDoc: Omit<DataSnapshot, "id"> & { id: string } = {
        id: `scrape_arena_${Date.now()}`,
        source: "scrapeArena",
        snapshotDate: startedAt.slice(0, 10),
        recordsCount: totalRecords,
        status,
        errorMessage,
        startedAt,
        completedAt: new Date().toISOString(),
      };
      await db.collection(COLL.dataSnapshots).doc(snapshotDoc.id).set(snapshotDoc);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[scrapeArena]", message);
      status = "failed";
      errorMessage = message;
      const snapshotDoc: Omit<DataSnapshot, "id"> & { id: string } = {
        id: `scrape_arena_${Date.now()}`,
        source: "scrapeArena",
        snapshotDate: startedAt.slice(0, 10),
        recordsCount: totalRecords,
        status: "failed",
        errorMessage: message,
        startedAt,
        completedAt: new Date().toISOString(),
      };
      await getFirestore().collection(COLL.dataSnapshots).doc(snapshotDoc.id).set(snapshotDoc);
    }
  }
);
