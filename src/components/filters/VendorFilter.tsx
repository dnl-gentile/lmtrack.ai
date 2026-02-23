"use client";

import { VENDORS } from "@/lib/constants";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-500 shrink-0">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface VendorFilterProps {
  selected: string[];
  onToggle: (slug: string) => void;
}

export default function VendorFilter({ selected, onToggle }: VendorFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      {VENDORS.map((v) => {
        const isSelected = selected.includes(v.slug);
        return (
          <label
            key={v.slug}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[14px] cursor-pointer transition-colors ${
              isSelected
                ? "bg-chip-active-bg text-primary"
                : "text-muted hover:text-primary hover:bg-chip/50"
            }`}
          >
            <span className="flex-1 min-w-0">{v.name}</span>
            {isSelected && <CheckIcon />}
            <input
              type="checkbox"
              className="sr-only"
              checked={isSelected}
              onChange={() => onToggle(v.slug)}
            />
          </label>
        );
      })}
    </div>
  );
}
