"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Search } from "lucide-react";
import type { PricingHistoryResponse, PricingResponse } from "@/lib/types";
import { computeBlendedPrice, formatCurrency } from "@/lib/utils";

interface PricingInsightsProps {
  data: PricingResponse;
}

type ChartType = "line" | "bar";
type MetricMode = "price" | "weighted" | "score";
type CurrencyCode = "USD" | "EUR" | "BRL";
type TimeWindow = "30d" | "90d" | "180d" | "365d" | "all";

const MAX_SELECTED_MODELS = 8;
const SERIES_COLORS = [
  "#9BC4F6",
  "#F6C7D3",
  "#C8E7C4",
  "#F5D8A8",
  "#C9C3F2",
  "#AEE3E3",
  "#F6B8A8",
  "#BBD4F5",
];

const CURRENCY_RATE: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  BRL: 5.0,
};

const WINDOW_LABEL: Record<TimeWindow, string> = {
  "30d": "30 days",
  "90d": "90 days",
  "180d": "180 days",
  "365d": "1 year",
  all: "All time",
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return (await res.json()) as PricingHistoryResponse;
};

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMetricValue(
  value: number | null | undefined,
  metricMode: MetricMode,
  currency: CurrencyCode,
  compact = false
): string {
  if (value == null) return "—";
  if (metricMode === "price") {
    return formatCurrency(value, currency, compact ? 2 : 4);
  }
  if (metricMode === "weighted") {
    return `${value.toFixed(1)}`;
  }
  return `${Math.round(value)}`;
}

function toDateKey(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default function PricingInsights({ data }: PricingInsightsProps) {
  const [metricMode, setMetricMode] = useState<MetricMode>("price");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("90d");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const apiModels = useMemo(
    () =>
      data.models
        .filter((m) => m.apiPricing != null)
        .map((m) => ({
          slug: m.model.slug,
          canonicalName: m.model.canonicalName,
          vendorName: m.model.vendorName,
          input1m: m.apiPricing?.input1m ?? null,
          output1m: m.apiPricing?.output1m ?? null,
          blendedPrice1m:
            m.apiPricing != null
              ? computeBlendedPrice(m.apiPricing.input1m, m.apiPricing.output1m)
              : null,
          snapshotDate: m.snapshotDate,
        })),
    [data.models]
  );

  useEffect(() => {
    if (apiModels.length === 0 || selectedSlugs.length > 0) return;
    const defaults = [...apiModels]
      .sort((a, b) => (a.blendedPrice1m ?? Infinity) - (b.blendedPrice1m ?? Infinity))
      .slice(0, 4)
      .map((m) => m.slug);
    setSelectedSlugs(defaults);
  }, [apiModels, selectedSlugs.length]);

  const historyUrl = useMemo(() => {
    if (selectedSlugs.length === 0) return null;
    const params = new URLSearchParams();
    params.set("slugs", selectedSlugs.join(","));
    params.set("window", timeWindow);
    return `/api/pricing/history?${params.toString()}`;
  }, [selectedSlugs, timeWindow]);

  const {
    data: historyData,
    error: historyError,
    isLoading: historyLoading,
  } = useSWR<PricingHistoryResponse>(historyUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const modelBySlug = useMemo(
    () => new Map(apiModels.map((m) => [m.slug, m])),
    [apiModels]
  );

  const historyBySlug = useMemo(() => {
    const map = new Map<string, PricingHistoryResponse["series"][number]["points"]>();
    for (const series of historyData?.series ?? []) {
      map.set(series.modelSlug, series.points);
    }
    return map;
  }, [historyData]);

  const selectedSeries = useMemo(() => {
    return selectedSlugs
      .map((slug, index) => {
        const model = modelBySlug.get(slug);
        if (!model) return null;

        let points = [...(historyBySlug.get(slug) ?? [])];
        if (points.length === 0) {
          points = [
            {
              snapshotDate: toDateKey(model.snapshotDate),
              input1m: model.input1m,
              output1m: model.output1m,
              blendedPrice1m: model.blendedPrice1m,
              valueScore: null,
              eloScore: null,
            },
          ];
        }

        return {
          slug,
          name: model.canonicalName,
          vendorName: model.vendorName,
          color: SERIES_COLORS[index % SERIES_COLORS.length],
          points: points.sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate)),
        };
      })
      .filter(Boolean) as Array<{
      slug: string;
      name: string;
      vendorName: string;
      color: string;
      points: PricingHistoryResponse["series"][number]["points"];
    }>;
  }, [historyBySlug, modelBySlug, selectedSlugs]);

  const getPointValue = (
    point: PricingHistoryResponse["series"][number]["points"][number]
  ): number | null => {
    if (metricMode === "weighted") return point.valueScore;
    if (metricMode === "score") return point.eloScore;
    if (point.blendedPrice1m == null) return null;
    return point.blendedPrice1m * CURRENCY_RATE[currency];
  };

  const lineDates = useMemo(() => {
    const keys = new Set<string>();
    for (const series of selectedSeries) {
      for (const point of series.points) keys.add(point.snapshotDate);
    }
    return [...keys].sort((a, b) => a.localeCompare(b));
  }, [selectedSeries]);

  const lineSeries = useMemo(
    () =>
      selectedSeries.map((series) => {
        const pointMap = new Map(
          series.points.map((point) => [point.snapshotDate, point])
        );
        return {
          ...series,
          values: lineDates.map((date) => ({
            date,
            value: getPointValue(
              pointMap.get(date) ?? {
                snapshotDate: date,
                input1m: null,
                output1m: null,
                blendedPrice1m: null,
                valueScore: null,
                eloScore: null,
              }
            ),
          })),
        };
      }),
    [lineDates, selectedSeries, metricMode, currency]
  );

  const lineValues = useMemo(
    () =>
      lineSeries.flatMap((series) =>
        series.values
          .map((v) => v.value)
          .filter((v): v is number => v != null)
      ),
    [lineSeries]
  );

  const barData = useMemo(() => {
    return selectedSeries
      .map((series) => {
        const latestPoint = [...series.points]
          .reverse()
          .find((point) => getPointValue(point) != null);
        if (!latestPoint) return null;
        return {
          slug: series.slug,
          name: series.name,
          color: series.color,
          value: getPointValue(latestPoint),
          snapshotDate: latestPoint.snapshotDate,
        };
      })
      .filter((d): d is { slug: string; name: string; color: string; value: number | null; snapshotDate: string } => d != null);
  }, [selectedSeries, metricMode, currency]);

  const barValues = barData
    .map((d) => d.value)
    .filter((v): v is number => v != null);

  const chartValues = chartType === "line" ? lineValues : barValues;
  const hasChartData = chartValues.length > 0;

  const yDomain = useMemo(() => {
    if (!hasChartData) return { min: 0, max: 1 };
    const min = Math.min(...chartValues);
    const max = Math.max(...chartValues);
    if (chartType === "bar") {
      return {
        min: 0,
        max: max * 1.1 || 1,
      };
    }
    if (min === max) {
      return { min: min * 0.9, max: max * 1.1 || 1 };
    }
    const pad = (max - min) * 0.08;
    return { min: min - pad, max: max + pad };
  }, [chartType, chartValues, hasChartData]);

  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return apiModels;
    return apiModels.filter(
      (m) =>
        m.canonicalName.toLowerCase().includes(q) ||
        m.vendorName.toLowerCase().includes(q)
    );
  }, [apiModels, searchQuery]);

  const toggleModel = (slug: string) => {
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SELECTED_MODELS) return prev;
      return [...prev, slug];
    });
  };

  const tableRows = useMemo(() => {
    const rows = apiModels.map((model) => {
      const points = historyBySlug.get(model.slug) ?? [];
      const pricePoints = points
        .map((p) => p.blendedPrice1m)
        .filter((p): p is number => p != null);
      const minPrice = pricePoints.length
        ? Math.min(...pricePoints)
        : model.blendedPrice1m;
      const maxPrice = pricePoints.length
        ? Math.max(...pricePoints)
        : model.blendedPrice1m;
      const latest = points.length > 0 ? points[points.length - 1] : null;
      return {
        ...model,
        selected: selectedSlugs.includes(model.slug),
        minPrice,
        maxPrice,
        latestValueScore: latest?.valueScore ?? null,
        latestEloScore: latest?.eloScore ?? null,
      };
    });

    return rows.sort((a, b) => {
      if (a.selected !== b.selected) return a.selected ? -1 : 1;
      return a.canonicalName.localeCompare(b.canonicalName);
    });
  }, [apiModels, historyBySlug, selectedSlugs]);

  const chartLegend = selectedSeries;

  const chartTitle =
    metricMode === "price"
      ? "Price history"
      : metricMode === "weighted"
      ? "Value score history"
      : "Arena score history";

  return (
    <section className="space-y-5 rounded-[20px] border border-line bg-table p-4 lg:p-5">
      <div className="space-y-1">
        <h2 className="text-xl font-serif font-normal tracking-tight text-primary">
          Interactive Pricing Explorer
        </h2>
        <p className="text-sm text-muted">
          Compare multiple models in {chartTitle.toLowerCase()} mode, switch chart style,
          and inspect model-level min/max ranges in the table below.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">
            Metric
          </span>
          <select
            value={metricMode}
            onChange={(e) => setMetricMode(e.target.value as MetricMode)}
            className="rounded-md border border-line bg-background px-3 py-2 text-sm text-primary outline-none focus-visible:border-chip-active-border"
          >
            <option value="price">Price (blended)</option>
            <option value="weighted">Score weighted by price</option>
            <option value="score">Arena score</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">
            Chart Type
          </span>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="rounded-md border border-line bg-background px-3 py-2 text-sm text-primary outline-none focus-visible:border-chip-active-border"
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">
            Time Window
          </span>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
            className="rounded-md border border-line bg-background px-3 py-2 text-sm text-primary outline-none focus-visible:border-chip-active-border"
          >
            <option value="30d">{WINDOW_LABEL["30d"]}</option>
            <option value="90d">{WINDOW_LABEL["90d"]}</option>
            <option value="180d">{WINDOW_LABEL["180d"]}</option>
            <option value="365d">{WINDOW_LABEL["365d"]}</option>
            <option value="all">{WINDOW_LABEL.all}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">
            Currency
          </span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            disabled={metricMode !== "price"}
            className="rounded-md border border-line bg-background px-3 py-2 text-sm text-primary outline-none focus-visible:border-chip-active-border disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="BRL">BRL</option>
          </select>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">
            Models ({selectedSlugs.length}/{MAX_SELECTED_MODELS})
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model or vendor"
              className="w-full rounded-md border border-line bg-background py-2 pl-8 pr-3 text-sm text-primary outline-none placeholder:text-muted focus-visible:border-chip-active-border"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-line bg-background p-2">
        <div className="max-h-32 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
            {filteredModels.map((model) => {
              const selected = selectedSlugs.includes(model.slug);
              return (
                <button
                  key={model.slug}
                  type="button"
                  onClick={() => toggleModel(model.slug)}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "border-chip-active-border bg-chip-active-bg text-primary"
                      : "border-line text-muted hover:bg-hover hover:text-primary"
                  }`}
                >
                  <span className="min-w-0 truncate">{model.canonicalName}</span>
                  <span className="ml-3 shrink-0 text-xs">{selected ? "Selected" : model.vendorName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-line bg-background p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {chartLegend.map((series) => (
            <button
              key={series.slug}
              type="button"
              onClick={() => toggleModel(series.slug)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-chip px-2.5 py-1 text-xs text-primary"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <span>{series.name}</span>
            </button>
          ))}
          {chartLegend.length === 0 && (
            <span className="text-xs text-muted">Select at least one model.</span>
          )}
        </div>

        <div className="h-[340px] w-full">
          {historyLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Loading chart data...
            </div>
          ) : historyError ? (
            <div className="flex h-full items-center justify-center text-sm text-red-600">
              Failed to load chart history.
            </div>
          ) : !hasChartData ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No data available in the selected range.
            </div>
          ) : chartType === "line" ? (
            <LineChartView
              dates={lineDates}
              series={lineSeries}
              yMin={yDomain.min}
              yMax={yDomain.max}
              metricMode={metricMode}
              currency={currency}
            />
          ) : (
            <BarChartView
              data={barData}
              yMin={yDomain.min}
              yMax={yDomain.max}
              metricMode={metricMode}
              currency={currency}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-line bg-table">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-line bg-table-header text-muted">
            <tr>
              <th className="px-4 py-3 text-xs font-medium">Pick</th>
              <th className="px-4 py-3 text-xs font-medium">Model</th>
              <th className="px-4 py-3 text-xs font-medium">Vendor</th>
              <th className="px-4 py-3 text-right text-xs font-medium">Input / 1M</th>
              <th className="px-4 py-3 text-right text-xs font-medium">Output / 1M</th>
              <th className="px-4 py-3 text-right text-xs font-medium">Blended</th>
              <th className="px-4 py-3 text-right text-xs font-medium">Min</th>
              <th className="px-4 py-3 text-right text-xs font-medium">Max</th>
              <th className="px-4 py-3 text-right text-xs font-medium">Weighted</th>
              <th className="px-4 py-3 text-right text-xs font-medium">Arena</th>
              <th className="px-4 py-3 text-right text-xs font-medium">Latest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tableRows.map((row) => (
              <tr
                key={row.slug}
                className={`transition-colors hover:bg-hover ${
                  row.selected ? "bg-chip-active-bg/40" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleModel(row.slug)}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      row.selected
                        ? "border-chip-active-border bg-chip-active-bg text-primary"
                        : "border-line text-muted"
                    }`}
                  >
                    {row.selected ? "Selected" : "Select"}
                  </button>
                </td>
                <td className="px-4 py-3 font-medium text-primary">{row.canonicalName}</td>
                <td className="px-4 py-3 text-muted">{row.vendorName}</td>
                <td className="px-4 py-3 text-right text-primary">
                  {formatMetricValue(
                    row.input1m != null ? row.input1m * CURRENCY_RATE[currency] : null,
                    "price",
                    currency,
                    true
                  )}
                </td>
                <td className="px-4 py-3 text-right text-primary">
                  {formatMetricValue(
                    row.output1m != null ? row.output1m * CURRENCY_RATE[currency] : null,
                    "price",
                    currency,
                    true
                  )}
                </td>
                <td className="px-4 py-3 text-right text-primary">
                  {formatMetricValue(
                    row.blendedPrice1m != null
                      ? row.blendedPrice1m * CURRENCY_RATE[currency]
                      : null,
                    "price",
                    currency,
                    true
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted">
                  {formatMetricValue(
                    row.minPrice != null ? row.minPrice * CURRENCY_RATE[currency] : null,
                    "price",
                    currency,
                    true
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted">
                  {formatMetricValue(
                    row.maxPrice != null ? row.maxPrice * CURRENCY_RATE[currency] : null,
                    "price",
                    currency,
                    true
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted">
                  {formatMetricValue(row.latestValueScore, "weighted", currency, true)}
                </td>
                <td className="px-4 py-3 text-right text-muted">
                  {formatMetricValue(row.latestEloScore, "score", currency, true)}
                </td>
                <td className="px-4 py-3 text-right text-muted">
                  {row.snapshotDate ? formatDateLabel(toDateKey(row.snapshotDate)) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface LineChartViewProps {
  dates: string[];
  series: Array<{
    slug: string;
    name: string;
    color: string;
    values: { date: string; value: number | null }[];
  }>;
  yMin: number;
  yMax: number;
  metricMode: MetricMode;
  currency: CurrencyCode;
}

function LineChartView({
  dates,
  series,
  yMin,
  yMax,
  metricMode,
  currency,
}: LineChartViewProps) {
  const width = 980;
  const height = 330;
  const margin = { top: 20, right: 18, bottom: 44, left: 62 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const yRange = yMax - yMin || 1;
  const xDen = Math.max(1, dates.length - 1);

  const x = (index: number) => margin.left + (index / xDen) * chartWidth;
  const y = (value: number) =>
    margin.top + ((yMax - value) / yRange) * chartHeight;

  const yTicks = 5;
  const dateTickStep = Math.max(1, Math.ceil(dates.length / 6));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const ratio = i / yTicks;
        const value = yMax - ratio * yRange;
        const yPos = margin.top + ratio * chartHeight;
        return (
          <g key={i}>
            <line
              x1={margin.left}
              y1={yPos}
              x2={width - margin.right}
              y2={yPos}
              stroke="var(--line)"
              strokeOpacity={0.55}
              strokeDasharray="3 4"
            />
            <text
              x={margin.left - 8}
              y={yPos + 3}
              textAnchor="end"
              fill="var(--muted)"
              fontSize="10"
            >
              {formatMetricValue(value, metricMode, currency, true)}
            </text>
          </g>
        );
      })}

      {series.map((entry) => {
        let path = "";
        let open = false;
        entry.values.forEach((point, i) => {
          if (point.value == null) {
            open = false;
            return;
          }
          path += `${open ? "L" : "M"} ${x(i)} ${y(point.value)} `;
          open = true;
        });

        return (
          <g key={entry.slug}>
            <path
              d={path}
              fill="none"
              stroke={entry.color}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            {entry.values.map((point, i) =>
              point.value == null ? null : (
                <circle
                  key={`${entry.slug}-${point.date}`}
                  cx={x(i)}
                  cy={y(point.value)}
                  r={3}
                  fill={entry.color}
                />
              )
            )}
          </g>
        );
      })}

      {dates.map((date, i) => {
        if (i % dateTickStep !== 0 && i !== dates.length - 1) return null;
        return (
          <text
            key={date}
            x={x(i)}
            y={height - 14}
            textAnchor="middle"
            fill="var(--muted)"
            fontSize="10"
          >
            {formatDateLabel(date)}
          </text>
        );
      })}
    </svg>
  );
}

interface BarChartViewProps {
  data: Array<{
    slug: string;
    name: string;
    color: string;
    value: number | null;
  }>;
  yMin: number;
  yMax: number;
  metricMode: MetricMode;
  currency: CurrencyCode;
}

function BarChartView({
  data,
  yMin,
  yMax,
  metricMode,
  currency,
}: BarChartViewProps) {
  const width = 980;
  const height = 330;
  const margin = { top: 20, right: 18, bottom: 64, left: 62 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const yRange = yMax - yMin || 1;
  const valueData = data.filter((d): d is { slug: string; name: string; color: string; value: number } => d.value != null);
  const barDen = Math.max(1, valueData.length);
  const band = chartWidth / barDen;
  const barWidth = Math.min(44, band * 0.58);
  const y = (value: number) =>
    margin.top + ((yMax - value) / yRange) * chartHeight;

  const yTicks = 5;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const ratio = i / yTicks;
        const value = yMax - ratio * yRange;
        const yPos = margin.top + ratio * chartHeight;
        return (
          <g key={i}>
            <line
              x1={margin.left}
              y1={yPos}
              x2={width - margin.right}
              y2={yPos}
              stroke="var(--line)"
              strokeOpacity={0.55}
              strokeDasharray="3 4"
            />
            <text
              x={margin.left - 8}
              y={yPos + 3}
              textAnchor="end"
              fill="var(--muted)"
              fontSize="10"
            >
              {formatMetricValue(value, metricMode, currency, true)}
            </text>
          </g>
        );
      })}

      {valueData.map((entry, i) => {
        const xPos = margin.left + i * band + (band - barWidth) / 2;
        const yPos = y(entry.value);
        const h = margin.top + chartHeight - yPos;
        const label = entry.name.length > 16 ? `${entry.name.slice(0, 16)}…` : entry.name;
        return (
          <g key={entry.slug}>
            <rect
              x={xPos}
              y={yPos}
              width={barWidth}
              height={Math.max(1, h)}
              rx={8}
              fill={entry.color}
              fillOpacity={0.95}
            />
            <text
              x={xPos + barWidth / 2}
              y={yPos - 6}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="10"
            >
              {formatMetricValue(entry.value, metricMode, currency, true)}
            </text>
            <text
              x={xPos + barWidth / 2}
              y={height - 20}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="10"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
