/**
 * Percentile rank of value in allValues (0–100). Higher value = higher percentile.
 */
export function percentileRank(value: number, allValues: number[]): number {
  if (allValues.length === 0) return 0;
  const sorted = [...allValues].sort((a, b) => a - b);
  let countBelow = 0;
  for (const v of sorted) {
    if (v < value) countBelow++;
    else break;
  }
  return (countBelow / sorted.length) * 100;
}

/**
 * Min-max normalization to [0, 1]. Returns 0 if min === max.
 */
export function minMaxNormalize(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 0;
  const n = (value - min) / (max - min);
  return Math.max(0, Math.min(1, n));
}
