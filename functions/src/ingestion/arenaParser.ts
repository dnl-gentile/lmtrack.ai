import * as cheerio from "cheerio";

export interface RawArenaEntry {
  modelName: string;
  organization: string;
  eloScore: number;
  eloCiLower: number | null;
  eloCiUpper: number | null;
  votes: number;
  rank: number;
}

function parseNum(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse arena.ai leaderboard HTML table into typed entries.
 * Handles missing columns and malformed numbers.
 */
export function parseArenaTable(html: string): RawArenaEntry[] {
  const entries: RawArenaEntry[] = [];
  const $ = cheerio.load(html);

  const rows = $("table tbody tr").toArray();
  if (rows.length === 0) {
    return entries;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = $(row).find("td").toArray();
    if (cells.length < 2) continue;

    const getText = (idx: number): string =>
      $(cells[idx]).text().trim().replace(/\s+/g, " ") || "";

    const modelName = getText(0) || getText(1);
    const organization = cells.length > 1 ? getText(1) : "";
    const rank = parseNum(String(i + 1)) ?? i + 1;

    let eloScore = 0;
    let eloCiLower: number | null = null;
    let eloCiUpper: number | null = null;
    let votes = 0;

    for (let c = 2; c < cells.length; c++) {
      const text = getText(c);
      const num = parseNum(text);
      if (num === null) continue;
      if (text.includes("±") || text.includes("+/-")) {
        eloCiLower = eloScore - num;
        eloCiUpper = eloScore + num;
      } else if (eloScore === 0 && num > 100 && num < 2000) {
        eloScore = num;
      } else if (num < 10000 && votes === 0 && c > 2) {
        votes = num;
      }
    }

    if (eloScore === 0 && cells.length >= 3) {
      const eloCell = parseNum(getText(2));
      if (eloCell !== null && eloCell > 100) eloScore = eloCell;
    }
    if (votes === 0 && cells.length >= 4) {
      const v = parseNum(getText(3));
      if (v !== null) votes = v;
    }

    entries.push({
      modelName: modelName || "Unknown",
      organization,
      eloScore,
      eloCiLower,
      eloCiUpper,
      votes,
      rank,
    });
  }

  return entries;
}
