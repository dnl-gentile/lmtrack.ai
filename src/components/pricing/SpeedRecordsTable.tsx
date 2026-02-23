"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type { SpeedRecordEntry, SpeedRecordsResponse, SpeedTestKey } from "@/lib/types";

const TEST_ORDER: SpeedTestKey[] = ["overall", "short", "medium", "long"];

function formatLatency(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Math.round(value)} ms`;
}

const fetcher = async (url: string): Promise<SpeedRecordsResponse> => {
  const res = await fetch(url);
  const payload = (await res.json()) as SpeedRecordsResponse;
  if (!res.ok || payload.status === "error") {
    throw new Error(payload.message || "Failed to load speed records");
  }
  return payload;
};

export default function SpeedRecordsTable() {
  const { data, error, isLoading } = useSWR<SpeedRecordsResponse>(
    "/api/speed-tests/records?limit=1000",
    fetcher,
    { revalidateOnFocus: false }
  );

  const rows = useMemo(() => {
    const grouped = new Map<
      string,
      {
        modelId: string;
        modelSlug: string;
        modelName: string;
        vendorSlug: string;
        vendorName: string;
        updatedAt: string;
        latencies: Partial<Record<SpeedTestKey, number>>;
      }
    >();

    for (const record of data?.records ?? []) {
      const key = record.modelId;
      const current = grouped.get(key) ?? {
        modelId: record.modelId,
        modelSlug: record.modelSlug,
        modelName: record.modelName,
        vendorSlug: record.vendorSlug,
        vendorName: record.vendorName,
        updatedAt: record.updatedAt,
        latencies: {},
      };
      current.latencies[record.testKey] = record.bestMedianLatencyMs;
      if (record.updatedAt > current.updatedAt) {
        current.updatedAt = record.updatedAt;
      }
      grouped.set(key, current);
    }

    return [...grouped.values()].sort((a, b) => {
      const aOverall = a.latencies.overall ?? Number.MAX_SAFE_INTEGER;
      const bOverall = b.latencies.overall ?? Number.MAX_SAFE_INTEGER;
      if (aOverall !== bOverall) return aOverall - bOverall;
      return a.modelName.localeCompare(b.modelName);
    });
  }, [data?.records]);

  return (
    <section className="space-y-4 rounded-[20px] border border-line bg-table p-4 lg:p-5">
      <div className="space-y-1">
        <h2 className="text-xl font-serif font-normal text-primary tracking-tight">
          Speed Records
        </h2>
        <p className="text-sm text-muted">
          Best median latency per model and benchmark test from all recorded runs.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted">Loading speed records...</div>
      ) : error ? (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Failed to load speed records.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-md border border-line bg-background px-3 py-4 text-sm text-muted">
          No speed records available yet. Run a speed test from the Speed Test page.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-line bg-background">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="border-b border-line bg-table-header text-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium">Model</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Provider</th>
                {TEST_ORDER.map((key) => (
                  <th key={key} className="px-4 py-3 text-right text-xs font-medium capitalize">
                    {key}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.modelId} className="border-t border-line/70">
                  <td className="px-4 py-3 font-medium text-primary">{row.modelName}</td>
                  <td className="px-4 py-3 text-muted">{row.vendorName}</td>
                  {TEST_ORDER.map((key) => (
                    <td key={key} className="px-4 py-3 text-right text-primary">
                      {formatLatency(row.latencies[key] ?? null)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-muted">
                    {row.updatedAt
                      ? new Date(row.updatedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
