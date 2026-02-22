"use client";

import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom";
}

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const positionClasses =
    position === "bottom"
      ? "top-full left-1/2 -translate-x-1/2 mt-2"
      : "bottom-full left-1/2 -translate-x-1/2 mb-2";

  return (
    <div className="relative inline-flex group">
      {children}
      <div
        className={`pointer-events-none absolute z-50 whitespace-nowrap bg-[#1a1f2e] text-primary text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 invisible transition-opacity duration-150 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible ${positionClasses}`}
      >
        {content}
      </div>
    </div>
  );
}
