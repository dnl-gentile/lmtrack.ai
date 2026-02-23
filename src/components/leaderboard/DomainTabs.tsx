"use client";

import Link from "next/link";
import {
  DOMAIN_MAP,
  LEADERBOARD_TAB_LABEL_OVERRIDE,
  LEADERBOARD_TAB_ORDER,
} from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";

interface DomainTabsProps {
  activeDomain: DomainKey;
}

export default function DomainTabs({ activeDomain }: DomainTabsProps) {
  return (
    <nav
      className="scrollbar-hide -mx-1 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-1.5 py-2 whitespace-nowrap lg:mx-0 lg:gap-4 lg:px-0 lg:py-2.5"
      aria-label="Leaderboard domains"
    >
      {LEADERBOARD_TAB_ORDER.map((key) => {
        const isActive = key === activeDomain;
        const href =
          key === "overall" ? "/leaderboard" : `/leaderboard/${key}`;
        const label = LEADERBOARD_TAB_LABEL_OVERRIDE[key] ?? DOMAIN_MAP[key].label;
        return (
          <Link
            key={key}
            href={href}
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-[4px] px-4 py-2.5 text-[13px] font-normal leading-none tracking-[0.01em] transition-colors ${
              isActive
                ? "bg-chip-active-bg text-primary"
                : "text-muted hover:bg-chip hover:text-primary"
            }`}
          >
            {label.replaceAll(" ", "\u00A0")}
          </Link>
        );
      })}
    </nav>
  );
}
