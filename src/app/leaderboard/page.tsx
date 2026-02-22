import { Suspense } from "react";
import OverviewClient from "./OverviewClient";

export const dynamic = "force-dynamic";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted">Loading overview...</div>}>
      <OverviewClient />
    </Suspense>
  );
}
