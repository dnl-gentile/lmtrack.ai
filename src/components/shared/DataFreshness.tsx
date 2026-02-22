import Pill from "@/components/shared/Pill";
import { formatRelativeTime } from "@/lib/utils";

interface DataFreshnessProps {
  lastUpdated: Date | string | null;
  source?: string;
}

export default function DataFreshness({
  lastUpdated,
  source,
}: DataFreshnessProps) {
  const parsedDate =
    lastUpdated == null
      ? null
      : typeof lastUpdated === "string"
        ? new Date(lastUpdated)
        : lastUpdated;
  const hasValidDate =
    parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime());
  const staleThresholdMs = 48 * 60 * 60 * 1000;
  const isStale =
    hasValidDate && Date.now() - parsedDate.getTime() > staleThresholdMs;

  const label = source
    ? `${source} data from ${
        hasValidDate
          ? parsedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Unknown"
      }`
    : `Updated ${formatRelativeTime(hasValidDate ? parsedDate : null)}`;

  return (
    <Pill
      className={
        isStale ? "text-amber-700 border-amber-300 bg-amber-50" : ""
      }
    >
      {isStale ? (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-[10px] font-semibold text-amber-700">
          !
        </span>
      ) : null}
      <span>{label}</span>
    </Pill>
  );
}
