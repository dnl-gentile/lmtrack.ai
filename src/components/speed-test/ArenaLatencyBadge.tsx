interface ArenaLatencyBadgeProps {
  latencyMs: number | null;
  error?: string | null;
}

export default function ArenaLatencyBadge({ latencyMs, error }: ArenaLatencyBadgeProps) {
  const label = latencyMs != null ? `${Math.round(latencyMs)} ms` : "No latency";
  const toneClass =
    latencyMs != null
      ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200"
      : error
        ? "border-amber-500/35 bg-amber-500/10 text-amber-200"
        : "border-line bg-chip text-muted";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass}`}
      title={error ?? undefined}
    >
      {label}
    </span>
  );
}
