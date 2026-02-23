import type { ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  className?: string;
}

export default function Pill({ children, className }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] text-muted border border-line px-2.5 py-1.5 rounded-md bg-chip ${
        className ?? ""
      }`.trim()}
    >
      {children}
    </span>
  );
}
