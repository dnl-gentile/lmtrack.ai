interface RankBadgeProps {
  rank: number;
}

export default function RankBadge({ rank }: RankBadgeProps) {
  return (
    <span className="text-muted text-sm tabular-nums font-medium">{rank}</span>
  );
}
