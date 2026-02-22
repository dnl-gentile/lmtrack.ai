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

function buildLeaderboardUrl(
  domain: DomainKey,
  filters: FilterState,
  sortOverride?: LeaderboardSortOverride
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
  return `/api/leaderboard?${params.toString()}`;
}

const fetcher = (url: string): Promise<LeaderboardResponse> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch leaderboard");
    return r.json();
  });

export function useLeaderboard(
  domain: DomainKey,
  filters: FilterState,
  sortOverride?: LeaderboardSortOverride
): {
  data: LeaderboardResponse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
} {
  const url = buildLeaderboardUrl(domain, filters, sortOverride);
  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    url,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { data, isLoading, error, mutate };
}
