import Skeleton from "@/components/shared/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Skeleton width="80%" height="2.5rem" className="rounded-lg" />
      <Skeleton rows={10} height="2.5rem" className="rounded-lg" />
    </div>
  );
}
