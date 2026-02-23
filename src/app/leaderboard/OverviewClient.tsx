"use client";

import Link from "next/link";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { DEFAULT_FILTER_STATE } from "@/lib/types";
import Skeleton from "@/components/shared/Skeleton";
import DomainTabs from "@/components/leaderboard/DomainTabs";
import {
  DOMAIN_MAP,
  LEADERBOARD_OVERVIEW_CARD_ORDER,
  LEADERBOARD_TAB_LABEL_OVERRIDE,
} from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";
import {
  Code2,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  ImagePlus,
  Search,
  Trophy,
  Video,
} from "lucide-react";

const DOMAIN_ICON_MAP: Record<DomainKey, LucideIcon> = {
  overall: Trophy,
  text: FileText,
  code: Code2,
  "text-to-image": ImageIcon,
  "image-edit": ImagePlus,
  "text-to-video": Video,
  "image-to-video": Video,
  vision: Eye,
  search: Globe,
};

function DomainCard({ domain }: { domain: DomainKey }) {
  const domainDef = DOMAIN_MAP[domain];
  const domainLabel = LEADERBOARD_TAB_LABEL_OVERRIDE[domain] ?? domainDef.label;
  const DomainIcon = DOMAIN_ICON_MAP[domain];
  const { data, isLoading, error } = useLeaderboard(
    domain,
    DEFAULT_FILTER_STATE,
    { sort: "valueScore", dir: "desc" },
    { limit: 10 }
  );

  const rows = data?.status === "ok" ? data.entries : [];
  const lastUpdated =
    data?.status === "ok"
      ? data.dataFreshness.arenaLastUpdated ?? data.dataFreshness.pricingLastUpdated
      : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-table">
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <div className="flex items-center gap-2 font-medium text-primary">
          <DomainIcon className="h-[18px] w-[18px] text-muted" strokeWidth={1.9} />
          <h2 className="text-lg font-serif leading-none">{domainLabel}</h2>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              {new Date(lastUpdated).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-sm bg-table">
          <thead className="border-b border-line bg-table-header text-muted">
            <tr>
              <th className="px-4 py-2.5 text-xs font-medium">Rank</th>
              <th className="px-4 py-2.5 text-xs font-medium">Model</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium">Score ↓</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium">Votes ↕</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-6 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32 rounded" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-12 rounded" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-12 rounded" />
                  </td>
                </tr>
              ))}

            {!isLoading && error != null && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-red-600">
                  Network error while loading data
                </td>
              </tr>
            )}

            {!isLoading && error == null && data?.status === "unconfigured" && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-amber-700">
                  Data source not configured
                </td>
              </tr>
            )}

            {!isLoading && error == null && data?.status === "error" && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-red-600">
                  {data.message ?? "Failed to load data"}
                </td>
              </tr>
            )}

            {!isLoading &&
              error == null &&
              data?.status === "ok" &&
              rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No models found
                  </td>
                </tr>
              )}

            {!isLoading &&
              error == null &&
              data?.status === "ok" &&
              rows.map((entry, idx) => {
                const href =
                  domain === "overall"
                    ? `/leaderboard?search=${entry.model.slug}`
                    : `/leaderboard/${domain}?search=${entry.model.slug}`;
                return (
                  <tr key={entry.model.id} className="transition-colors hover:bg-hover">
                    <td className="px-4 py-3 font-medium text-muted">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-primary">
                      <Link href={href} className="hover:underline">
                        {entry.model.canonicalName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-primary">
                      {entry.valueScore != null
                        ? entry.valueScore.toLocaleString()
                        : "Missing"}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {entry.votes != null ? entry.votes.toLocaleString() : "Missing"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OverviewClient() {
  return (
    <>
      <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-0 border-t border-b border-line bg-background px-4 lg:-mx-6 lg:-mt-6 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <DomainTabs activeDomain="overall" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-2 pt-12 pb-10 lg:space-y-6 lg:px-3 lg:pt-14 lg:pb-12">
        <div className="space-y-3">
          <h1 className="text-2xl font-serif font-normal tracking-tight text-primary">
            Leaderboard Overview
          </h1>
          <p className="max-w-4xl text-sm leading-relaxed text-muted">
            See how leading models stack up across overall, text, code, image,
            video, vision, and search using value-aware rankings. This page gives
            you a snapshot of each domain while preserving price-first filters for
            deeper exploration in every dedicated tab.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:gap-5 xl:grid-cols-2">
          {LEADERBOARD_OVERVIEW_CARD_ORDER.map((key) => (
            <DomainCard key={key} domain={key} />
          ))}
        </div>
      </div>
    </>
  );
}
