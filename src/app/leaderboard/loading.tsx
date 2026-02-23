import Skeleton from "@/components/shared/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center">
      <div className="w-full space-y-4">
        <Skeleton width="80%" height="2.5rem" className="rounded-lg" />
        <Skeleton rows={10} height="2.5rem" className="rounded-lg" />
      </div>
    </div>
  );
}
