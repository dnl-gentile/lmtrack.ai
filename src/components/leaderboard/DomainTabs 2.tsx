"use client";

import Link from "next/link";
import { DOMAINS } from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";

interface DomainTabsProps {
  activeDomain: DomainKey;
}

export default function DomainTabs({ activeDomain }: DomainTabsProps) {
  return (
    <nav className="flex flex-wrap gap-1" aria-label="Leaderboard domains">
      {DOMAINS.map((d) => {
        const isActive = d.key === activeDomain;
        const href =
          d.key === "overall" ? "/leaderboard" : `/leaderboard/${d.key}`;
        return (
          <Link
            key={d.key}
            href={href}
            className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${isActive
                ? "bg-chip-active-bg border border-chip-active-border text-primary font-medium"
                : "text-muted hover:bg-chip border border-transparent hover:text-primary font-medium"
              }`}
          >
            {d.label}
          </Link>
        );
      })}
    </nav>
  );
}
