"use client";

import { useState, type ReactNode } from "react";

interface FilterPanelProps {
  children: ReactNode;
}

export default function FilterPanel({ children }: FilterPanelProps) {
  return (
    <div className="flex flex-col text-sm">
      {children}
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-line last:border-0 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-muted hover:text-primary transition-colors"
      >
        <span>{title}</span>
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
          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isExpanded && <div className="mt-3 animate-in slide-in-from-top-2 fade-in duration-200">{children}</div>}
    </div>
  );
}

FilterPanel.Section = FilterSection;
