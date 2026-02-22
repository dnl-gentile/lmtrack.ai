"use client";

import Link from "next/link";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { DEFAULT_FILTER_STATE } from "@/lib/types";
import Skeleton from "@/components/shared/Skeleton";
import DomainTabs from "@/components/leaderboard/DomainTabs";

function DomainCard({ domain, title, icon }: { domain: "overall" | "coding", title: string, icon: React.ReactNode }) {
    const { data, isLoading, error } = useLeaderboard(domain, DEFAULT_FILTER_STATE, { sort: "valueScore", dir: "desc" });

    const top10 = data?.entries.slice(0, 10) || [];
    const lastUpdated = data?.dataFreshness.arenaLastUpdated ?? data?.dataFreshness.pricingLastUpdated;

    return (
        <div className="flex flex-col border border-line rounded-xl bg-background overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-line">
                <div className="flex items-center gap-2 text-primary font-medium">
                    {icon}
                    <h2 className="text-lg">{title}</h2>
                </div>
                {lastUpdated && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{new Date(lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-muted border-b border-line">
                        <tr>
                            <th className="px-4 py-2.5 text-xs font-medium">Rank</th>
                            <th className="px-4 py-2.5 text-xs font-medium">Model</th>
                            <th className="px-4 py-2.5 text-xs font-medium text-right">Score ↓</th>
                            <th className="px-4 py-2.5 text-xs font-medium text-right">Votes ↕</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3"><Skeleton className="h-4 w-6 rounded" /></td>
                                    <td className="px-4 py-3"><Skeleton className="h-4 w-32 rounded" /></td>
                                    <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 rounded ml-auto" /></td>
                                    <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 rounded ml-auto" /></td>
                                </tr>
                            ))
                        ) : error ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-red-500">Failed to load data</td>
                            </tr>
                        ) : top10.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted">No models found</td>
                            </tr>
                        ) : (
                            top10.map((entry, idx) => (
                                <tr key={entry.model.id} className="hover:bg-chip/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-muted">{idx + 1}</td>
                                    <td className="px-4 py-3 font-medium text-primary">
                                        <Link href={`/leaderboard/${domain}?search=${entry.model.slug}`} className="hover:underline">
                                            {entry.model.canonicalName}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-right text-primary">
                                        {entry.valueScore != null ? entry.valueScore.toLocaleString() : "Missing"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-muted">
                                        {entry.eloScore != null ? entry.eloScore.toLocaleString() : "Missing"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function OverviewClient() {
    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <DomainTabs activeDomain="overall" />

            <div className="space-y-3">
                <h1 className="text-2xl font-serif font-normal tracking-tight text-primary">Leaderboard Overview</h1>
                <p className="text-muted leading-relaxed max-w-4xl text-sm">
                    See how leading models stack up across text, code, vision, and beyond based on their value scores.
                    This page gives you a snapshot of each domain. You can explore deeper insights, filter by price, vendor,
                    and search for specific models in their dedicated tabs above.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <DomainCard
                    domain="overall"
                    title="Overall"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <line x1="10" y1="9" x2="8" y2="9" />
                        </svg>
                    }
                />
                <DomainCard
                    domain="coding"
                    title="Coding"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                        </svg>
                    }
                />
            </div>
        </div>
    );
}
