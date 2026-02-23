import { Suspense } from "react";
import type { Metadata } from "next";
import OverviewClient from "./OverviewClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    absolute: "Market Leaderboard | Compare",
  },
};

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted">Loading overview...</div>}>
      <OverviewClient />
    </Suspense>
  );
}
