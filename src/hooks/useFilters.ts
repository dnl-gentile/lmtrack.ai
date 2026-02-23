"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { FilterState } from "@/lib/types";
import { DEFAULT_FILTER_STATE } from "@/lib/types";
import type { DomainKey, Modality, OptimizationMode, RankBy } from "@/lib/constants";

function parseFiltersFromSearchParams(
  searchParams: URLSearchParams
): Partial<FilterState> {
  const domainsParam = searchParams.get("domains");
  const domains = domainsParam
    ? (domainsParam.split(",").filter(Boolean) as DomainKey[])
    : undefined;

  const vendorsParam = searchParams.get("vendors");
  const vendors = vendorsParam
    ? vendorsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const priceRange =
    priceMin != null || priceMax != null
      ? [
          priceMin != null && priceMin !== "" ? Number(priceMin) : 0,
          priceMax != null && priceMax !== "" ? Number(priceMax) : 100,
        ] as [number, number]
      : undefined;

  const contextMinParam = searchParams.get("contextMin");
  const contextMin =
    contextMinParam != null && contextMinParam !== ""
      ? Number(contextMinParam)
      : undefined;

  const modalitiesParam = searchParams.get("modalities");
  const modalities = modalitiesParam
    ? (modalitiesParam.split(",").filter(Boolean) as Modality[])
    : undefined;

  const onlyWithArenaParam = searchParams.get("arenaOnly");
  const onlyWithArena =
    onlyWithArenaParam === "true"
      ? true
      : onlyWithArenaParam === "false"
        ? false
        : undefined;

  const searchQuery = searchParams.get("search") ?? undefined;
  const rankByParam = searchParams.get("rankBy");
  const rankBy =
    rankByParam === "models" || rankByParam === "labs"
      ? (rankByParam as RankBy)
      : undefined;
  const optimizationMode = (searchParams.get("optimization") as OptimizationMode | null) ?? undefined;

  return {
    ...(domains && domains.length > 0 && { domains }),
    ...(vendors && vendors.length > 0 && { vendors }),
    ...(priceRange && { priceRange }),
    ...(contextMin !== undefined && contextMin > 0 && { contextMin }),
    ...(modalities && modalities.length > 0 && { modalities }),
    ...(onlyWithArena !== undefined && { onlyWithArena }),
    ...(searchQuery != null && searchQuery !== "" && { searchQuery }),
    ...(rankBy && { rankBy }),
    ...(optimizationMode && { optimizationMode }),
  };
}

function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.domains.length > 0) {
    params.set("domains", filters.domains.join(","));
  }
  if (filters.vendors.length > 0) {
    params.set("vendors", filters.vendors.join(","));
  }
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) {
    params.set("priceMin", String(filters.priceRange[0]));
    params.set("priceMax", String(filters.priceRange[1]));
  }
  if (filters.contextMin > 0) {
    params.set("contextMin", String(filters.contextMin));
  }
  if (filters.modalities.length > 0) {
    params.set("modalities", filters.modalities.join(","));
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
  if (filters.optimizationMode !== "best_value") {
    params.set("optimization", filters.optimizationMode);
  }
  return params;
}

export function useFilters(domain: DomainKey): {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  resetFilters: () => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: FilterState = useMemo(() => {
    const parsed = parseFiltersFromSearchParams(searchParams);
    return {
      ...DEFAULT_FILTER_STATE,
      ...parsed,
    };
  }, [searchParams]);

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      const next: FilterState = { ...filters, [key]: value };
      const params = filtersToSearchParams(next);
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router.push(url, { scroll: false });
    },
    [filters, pathname, router]
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, setFilter, resetFilters };
}
