import { Suspense } from "react";
import type { Metadata } from "next";
import OverviewClient from "./OverviewClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    absolute: "Track Leaderboard | Track",
  },
};

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-6 text-muted">
          Loading overview...
        </div>
      }
    >
      <OverviewClient />
    </Suspense>
  );
}
