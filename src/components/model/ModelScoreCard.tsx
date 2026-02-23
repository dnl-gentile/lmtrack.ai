interface ModelScoreCardSubItem {
  label: string;
  value: string;
}

interface ModelScoreCardProps {
  title: string;
  mainValue: string | number;
  mainLabel: string;
  subItems: ModelScoreCardSubItem[];
  variant: "quality" | "pricing" | "value";
}

const accentClasses: Record<ModelScoreCardProps["variant"], string> = {
  quality: "text-accent",
  pricing: "text-accent-warm",
  value: "text-emerald-600",
};

export default function ModelScoreCard({
  title,
  mainValue,
  mainLabel,
  subItems,
  variant,
}: ModelScoreCardProps) {
  const subItemGridColumns = subItems.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <article className="rounded-xl border border-line bg-panel p-6">
      <p className="text-sm text-muted">{title}</p>
      <div className="mt-5 text-center">
        <p
          className={`text-3xl font-mono font-bold tabular-nums ${accentClasses[variant]}`}
        >
          {mainValue}
        </p>
        <p className="mt-1 text-xs uppercase tracking-wide text-muted">
          {mainLabel}
        </p>
      </div>
      <div className={`mt-6 grid gap-3 ${subItemGridColumns}`}>
        {subItems.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className="rounded-lg border border-line/70 bg-panel2 px-3 py-2"
          >
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-mono text-primary tabular-nums">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
