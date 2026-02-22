import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/queries/leaderboard";
import type { DomainKey } from "@/lib/constants";
import type { LeaderboardResponse } from "@/lib/types";

const DOMAINS: DomainKey[] = [
  "overall",
  "coding",
  "math",
  "creative_writing",
  "hard_prompts",
  "instruction_following",
  "vision",
  "longer_query",
];

function parseNum(value: string | null, fallback: number): number {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainParam = searchParams.get("domain") ?? "overall";
    const domain = DOMAINS.includes(domainParam as DomainKey)
      ? (domainParam as DomainKey)
      : "overall";
    const sort = searchParams.get("sort") ?? "valueScore";
    const dir = searchParams.get("dir") === "asc" ? "asc" : "desc";
    const vendorsParam = searchParams.get("vendors");
    const vendors = vendorsParam
      ? vendorsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;
    const priceMin = parseNum(searchParams.get("priceMin"), 0);
    const priceMax = parseNum(searchParams.get("priceMax"), 1_000_000);
    const contextMin = parseNum(searchParams.get("contextMin"), 0);
    const modality = searchParams.get("modality") as "text" | "multimodal" | "image" | "video" | null;
    const arenaOnly = searchParams.get("arenaOnly") === "true";
    const search = searchParams.get("search") ?? undefined;
    const limit = Math.min(parseNum(searchParams.get("limit"), 100), 200);
    const offset = Math.max(parseNum(searchParams.get("offset"), 0), 0);

    const result = await getLeaderboard({
      domain,
      sort,
      dir,
      vendors,
      priceMin,
      priceMax,
      contextMin,
      modality: modality ?? undefined,
      arenaOnly,
      search,
      limit,
      offset,
    });

    const response: LeaderboardResponse = {
      entries: result.entries,
      total: result.total,
      domain,
      dataFreshness: result.freshness,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    // Return empty data instead of 500 so UI shows empty state (e.g. before Firebase is set up or DB is seeded)
    const emptyResponse: LeaderboardResponse = {
      entries: [],
      total: 0,
      domain: "overall",
      dataFreshness: { arenaLastUpdated: null, pricingLastUpdated: null },
    };
    return NextResponse.json(emptyResponse);
  }
}
