import MissingDataBadge from "@/components/shared/MissingDataBadge";

interface ScoreCellProps {
  score: number | null;
  ci?: string | null;
}

export default function ScoreCell({ score, ci }: ScoreCellProps) {
  if (score == null) {
    return <MissingDataBadge />;
  }
  return (
    <span className="tabular-nums text-primary">
      {Math.round(score)}
      {ci ? ` ${ci}` : ""}
    </span>
  );
}
