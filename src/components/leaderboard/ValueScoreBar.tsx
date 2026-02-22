import { valueScoreColor } from "@/lib/utils";

interface ValueScoreBarProps {
  score: number;
  showLabel?: boolean;
}

export default function ValueScoreBar({
  score,
  showLabel = true,
}: ValueScoreBarProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const color = valueScoreColor(clamped);
  const barWidth = `${clamped}%`;

  return (
    <div className="flex w-full items-center gap-2">
      <div className="min-w-[60px] flex-1 overflow-hidden rounded-full bg-line/50">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: barWidth,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel ? (
        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted">
          {Math.round(clamped)}
        </span>
      ) : null}
    </div>
  );
}
