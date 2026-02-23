"use client";

import type { LeaderboardEntry } from "@/lib/types";
import EmptyState from "@/components/shared/EmptyState";
import SortHeader from "./SortHeader";
import LeaderboardRow from "./LeaderboardRow";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  sort: string;
  dir: "asc" | "desc";
  onSort: (field: string) => void;
}

export default function LeaderboardTable({
  entries,
  sort,
  dir,
  onSort,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No models match your filters"
        description="Try adjusting filters or domain to see more results."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-[20px] border border-line bg-table">
      <table className="w-full min-w-[720px] border-collapse bg-table text-sm">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-line bg-table-header">
            <th
              scope="col"
              className="w-12 px-3 py-2.5 text-left text-xs font-medium text-muted"
            >
              Rank
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-left text-xs font-medium text-muted"
            >
              Model
            </th>
            <SortHeader
              label="Score"
              field="eloScore"
              currentSort={sort}
              currentDir={dir}
              onSort={onSort}
            />
            <SortHeader
              label="Votes"
              field="votes"
              currentSort={sort}
              currentDir={dir}
              onSort={onSort}
            />
            <SortHeader
              label="$/1M tok"
              field="blendedPrice1m"
              currentSort={sort}
              currentDir={dir}
              onSort={onSort}
            />
            <SortHeader
              label="Value Score"
              field="valueScore"
              currentSort={sort}
              currentDir={dir}
              onSort={onSort}
            />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <LeaderboardRow
              key={entry.model.id}
              entry={entry}
              rank={entry.rank}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
