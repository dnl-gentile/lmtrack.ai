import fetch from "node-fetch";
import { parseArenaTable, type RawArenaEntry } from "./arenaParser";
import { DOMAIN_MAP } from "../shared/constants";
import type { DomainKey } from "../shared/constants";

const BASE_URL = "https://arena.ai";
const REQUEST_TIMEOUT_MS = 15000;

function getArenaPath(domain: string): string {
  const def = DOMAIN_MAP[domain as DomainKey];
  return def?.arenaPath ?? "/leaderboard";
}

/**
 * Fetch arena.ai leaderboard HTML for a domain and return parsed entries.
 * Uses /leaderboard, /leaderboard/code, /leaderboard/vision per DOMAIN_MAP.
 * Returns empty array and logs warning if page is JS-rendered or request fails.
 */
export async function scrapeArenaLeaderboard(
  domain: string
): Promise<RawArenaEntry[]> {
  const path = getArenaPath(domain);
  const url = `${BASE_URL}${path}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "market-ai-functions/1.0 (Firebase; +https://market.ai)",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[arenaScraper] ${domain} ${url} returned ${res.status}`);
      return [];
    }

    const html = await res.text();
    const entries = parseArenaTable(html);

    if (entries.length === 0 && html.length > 500) {
      console.warn(
        `[arenaScraper] ${domain}: no table rows parsed (page may be JS-rendered)`
      );
    }
    return entries;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[arenaScraper] ${domain} fetch error: ${message}`);
    return [];
  }
}
