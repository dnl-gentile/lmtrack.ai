"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import OptimizationModeSelector from "@/components/filters/OptimizationMode";
import FilterColumn from "@/components/filters/FilterColumn";
import DomainTabs from "@/components/leaderboard/DomainTabs";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import Footer from "@/components/layout/Footer";

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
  const filterRailRef = useRef<HTMLDivElement>(null);
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

  const hasApiPayload = data?.status === "ok";
  const apiStatus = data?.status ?? "ok";
  const isUnconfigured = apiStatus === "unconfigured";
  const isApiError = apiStatus === "error";
  const mainRowClassName = "flex min-h-0 flex-1 items-stretch gap-0";
  const contentStackClassName = hasApiPayload ? "space-y-4" : "space-y-4 pt-4";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (filterRailRef.current) {
      filterRailRef.current.scrollTop = 0;
    }
  }, [domain]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="z-10 -mx-4 border-t border-b border-line bg-background px-4 lg:-mx-6 lg:px-6">
        <div className="w-full">
          <DomainTabs activeDomain={domain} />
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col">
        {hasApiPayload && (
          <div className="shrink-0 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{data.total} models</Pill>
              <DataFreshness
                lastUpdated={
                  data.dataFreshness.arenaLastUpdated ??
                  data.dataFreshness.pricingLastUpdated
                }
              />
            </div>
          </div>
        )}

        <div className={mainRowClassName}>
          <aside className="hidden w-[250px] shrink-0 border-r border-line bg-background pr-6 lg:block">
            <div
              key={domain}
              ref={filterRailRef}
              className="h-full min-h-0 overflow-y-auto overscroll-contain pr-1 scrollbar-hide"
            >
              <FilterColumn
                domain={domain}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1 lg:pl-6">
            <div className="min-h-0 h-full overflow-y-auto overscroll-contain pb-8 pr-1 lg:pr-0">
              <div className={contentStackClassName}>
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
                  <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                    Network error while loading leaderboard. Please refresh and try again.
                  </div>
                )}

                {isUnconfigured && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-medium">Leaderboard data source is not configured.</p>
                    <p className="mt-1">
                      Configure Firebase Admin credentials (or emulator variables) and reload this page.
                    </p>
                  </div>
                )}

                {isApiError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                    {data?.message ?? "Leaderboard API returned an error."}
                  </div>
                )}

                {isLoading && (
                  <Skeleton rows={10} height="2.5rem" className="rounded-lg" />
                )}

                {!isLoading && data != null && data.status === "ok" && (
                  <LeaderboardTable
                    entries={data.entries}
                    sort={effectiveSort}
                    dir={effectiveDir}
                    onSort={handleSort}
                  />
                )}
              </div>

              <div className="pt-4 lg:pt-6">
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
