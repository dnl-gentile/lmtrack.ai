"use client";

import { useState, useMemo } from "react";

import OptimizationModeSelector from "@/components/filters/OptimizationMode";
import DomainTabs from "@/components/leaderboard/DomainTabs";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";

import Pill from "@/components/shared/Pill";
import DataFreshness from "@/components/shared/DataFreshness";
import Skeleton from "@/components/shared/Skeleton";
import { useFilters } from "@/hooks/useFilters";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { OPTIMIZATION_MODES } from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";

interface LeaderboardClientProps {
  domain: DomainKey;
}

export default function LeaderboardClient({ domain }: LeaderboardClientProps) {

  const { filters, setFilter, resetFilters } = useFilters(domain);
  const [sortOverride, setSortOverride] = useState<
    { sort: string; dir: "asc" | "desc" } | undefined
  >(undefined);
  const { data, isLoading, error } = useLeaderboard(domain, filters, sortOverride);

  const effectiveSort = useMemo(() => {
    if (sortOverride) return sortOverride.sort;
    const mode = OPTIMIZATION_MODES.find((m) => m.key === filters.optimizationMode);
    return mode?.sortField ?? "valueScore";
  }, [sortOverride, filters.optimizationMode]);
  const effectiveDir = useMemo((): "asc" | "desc" => {
    if (sortOverride) return sortOverride.dir;
    const mode = OPTIMIZATION_MODES.find((m) => m.key === filters.optimizationMode);
    return mode?.sortDir ?? "desc";
  }, [sortOverride, filters.optimizationMode]);

  const handleSort = (field: string) => {
    setSortOverride((prev) => {
      const nextDir =
        prev?.sort === field && prev.dir === "desc" ? "asc" : "desc";
      return { sort: field, dir: nextDir };
    });
  };

  const toggleDomain = (key: DomainKey) => {
    const next = filters.domains.includes(key)
      ? filters.domains.filter((d) => d !== key)
      : [...filters.domains, key];
    setFilter("domains", next);
  };

  const toggleVendor = (slug: string) => {
    const next = filters.vendors.includes(slug)
      ? filters.vendors.filter((v) => v !== slug)
      : [...filters.vendors, slug];
    setFilter("vendors", next);
  };

  const toggleModality = (m: "text" | "multimodal" | "image" | "video") => {
    const next = filters.modalities.includes(m)
      ? filters.modalities.filter((x) => x !== m)
      : [...filters.modalities, m];
    setFilter("modalities", next);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <DomainTabs activeDomain={domain} />
      <div className="flex flex-wrap items-center gap-2">
        {data != null && (
          <>
            <Pill>{data.total} models</Pill>
            <DataFreshness
              lastUpdated={
                data.dataFreshness.arenaLastUpdated ??
                data.dataFreshness.pricingLastUpdated
              }
            />
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <OptimizationModeSelector
          value={filters.optimizationMode}
          onChange={(v) => {
            setFilter("optimizationMode", v);
            setSortOverride(undefined);
          }}
        />
      </div>
      {error != null && (
        <p className="text-sm text-red-600">Failed to load leaderboard.</p>
      )}
      {isLoading && (
        <Skeleton rows={10} height="2.5rem" className="rounded-xl" />
      )}
      {!isLoading && data != null && (
        <LeaderboardTable
          entries={data.entries}
          sort={effectiveSort}
          dir={effectiveDir}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
