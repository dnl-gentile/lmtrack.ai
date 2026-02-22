/**
 * Format a number as currency string.
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = "USD",
  decimals: number = 2
): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number with commas and optional suffix (K, M).
 */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-US");
}

/**
 * Format context window tokens into human-readable string.
 */
export function formatContextWindow(
  tokens: number | null | undefined
): string {
  if (tokens == null) return "—";
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M`;
  if (tokens >= 1_000) return `${tokens / 1_000}K`;
  return tokens.toString();
}

/**
 * Format an Elo score with optional confidence interval.
 */
export function formatElo(
  score: number | null | undefined,
  ci?: number | null
): string {
  if (score == null) return "—";
  const base = Math.round(score).toString();
  if (ci != null) return `${base} ±${ci}`;
  return base;
}

/**
 * Format a date as relative time string (e.g., "2h ago", "3 days ago").
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (date == null) return "Unknown";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Compute percentile rank of a value within an array (0-100).
 * Higher value = higher percentile.
 */
export function percentileRank(value: number, allValues: number[]): number {
  if (allValues.length === 0) return 0;
  const sorted = [...allValues].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
  return (below / sorted.length) * 100;
}

/**
 * Min-max normalize a value to 0-1 range.
 */
export function minMaxNormalize(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Compute blended price: input * 0.3 + output * 0.7
 */
export function computeBlendedPrice(
  inputPrice: number,
  outputPrice: number
): number {
  return inputPrice * 0.3 + outputPrice * 0.7;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a CSS color for a value score (0-100).
 * 0-33: red, 34-66: yellow, 67-100: green
 */
export function valueScoreColor(score: number): string {
  if (score >= 67) return "#9ed1a0";
  if (score >= 34) return "#e9a62c";
  return "#e9a4a0";
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
