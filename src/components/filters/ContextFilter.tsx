"use client";

import { CONTEXT_WINDOW_OPTIONS } from "@/lib/constants";

interface ContextFilterProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ContextFilter({ value, onChange }: ContextFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-line bg-background px-2.5 py-2 text-sm text-primary outline-none focus:border-chip-active-border"
    >
      {CONTEXT_WINDOW_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
