import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/queries/leaderboard";
import { DOMAINS } from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";
import type { LeaderboardResponse } from "@/lib/types";

const VALID_DOMAINS = new Set<DomainKey>(DOMAINS.map((d) => d.key));

function parseNum(value: string | null, fallback: number): number {
  if (value == null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isUnconfiguredError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("default credentials") ||
    msg.includes("project id") ||
    msg.includes("initializeapp") ||
    msg.includes("service account") ||
    msg.includes("failed to determine project id")
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domainParam = searchParams.get("domain") ?? "overall";
  const domain = VALID_DOMAINS.has(domainParam as DomainKey)
    ? (domainParam as DomainKey)
    : "overall";

  try {
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
    const rankBy = searchParams.get("rankBy") === "labs" ? "labs" : "models";
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
      rankBy,
      limit,
      offset,
    });

    const response: LeaderboardResponse = {
      status: "ok",
      entries: result.entries,
      total: result.total,
      domain,
      dataFreshness: result.freshness,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    const unconfigured = isUnconfiguredError(error);
    const response: LeaderboardResponse = {
      status: unconfigured ? "unconfigured" : "error",
      message: unconfigured
        ? "Leaderboard data source is not configured. Set Firebase admin credentials or emulator settings."
        : "Failed to load leaderboard data.",
      entries: [],
      total: 0,
      domain,
      dataFreshness: { arenaLastUpdated: null, pricingLastUpdated: null },
    };
    return NextResponse.json(response);
  }
}
