"use client";

import useSWR from "swr";
import type { LeaderboardResponse } from "@/lib/types";
import type { FilterState } from "@/lib/types";
import { OPTIMIZATION_MODES } from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";

export interface LeaderboardSortOverride {
  sort?: string;
  dir?: "asc" | "desc";
}

export interface LeaderboardQueryOptions {
  limit?: number;
  offset?: number;
}

function buildLeaderboardUrl(
  domain: DomainKey,
  filters: FilterState,
  sortOverride?: LeaderboardSortOverride,
  options?: LeaderboardQueryOptions
): string {
  const params = new URLSearchParams();
  params.set("domain", domain);
  if (sortOverride?.sort != null && sortOverride?.dir != null) {
    params.set("sort", sortOverride.sort);
    params.set("dir", sortOverride.dir);
  } else {
    const mode = OPTIMIZATION_MODES.find((m) => m.key === filters.optimizationMode);
    if (mode) {
      params.set("sort", mode.sortField);
      params.set("dir", mode.sortDir);
    } else {
      params.set("sort", "valueScore");
      params.set("dir", "desc");
    }
  }
  if (filters.vendors.length > 0) {
    params.set("vendors", filters.vendors.join(","));
  }
  params.set("priceMin", String(filters.priceRange[0]));
  params.set("priceMax", String(filters.priceRange[1]));
  params.set("contextMin", String(filters.contextMin));
  if (filters.modalities.length > 0) {
    params.set("modality", filters.modalities[0]);
  }
  if (filters.onlyWithArena) {
    params.set("arenaOnly", "true");
  }
  if (filters.searchQuery) {
    params.set("search", filters.searchQuery);
  }
  if (filters.rankBy !== "models") {
    params.set("rankBy", filters.rankBy);
  }
  if (options?.limit != null && Number.isFinite(options.limit)) {
    params.set("limit", String(Math.max(1, Math.floor(options.limit))));
  }
  if (options?.offset != null && Number.isFinite(options.offset)) {
    params.set("offset", String(Math.max(0, Math.floor(options.offset))));
  }
  return `/api/leaderboard?${params.toString()}`;
}

const fetcher = async (url: string): Promise<LeaderboardResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json()) as LeaderboardResponse;
  if (!response.ok && payload?.status == null) {
    throw new Error("Failed to fetch leaderboard");
  }
  return payload;
};

export function useLeaderboard(
  domain: DomainKey,
  filters: FilterState,
  sortOverride?: LeaderboardSortOverride,
  options?: LeaderboardQueryOptions
): {
  data: LeaderboardResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  const url = buildLeaderboardUrl(domain, filters, sortOverride, options);
  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    url,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { data, isLoading, error, mutate };
}
