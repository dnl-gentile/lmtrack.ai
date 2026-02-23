"use client";

import type { DomainCategoryDef } from "@/lib/constants";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-500 shrink-0">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface DomainFilterProps {
  options: DomainCategoryDef[];
  selected: string;
  onSelect: (key: string) => void;
}

export default function DomainFilter({ options, selected, onSelect }: DomainFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((option) => {
        const isSelected = option.key === selected;
        return (
          <label
            key={option.key}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[14px] cursor-pointer transition-colors ${
              isSelected
                ? "bg-chip-active-bg text-primary"
                : "text-muted hover:text-primary hover:bg-chip/50"
            }`}
          >
            <span className="w-5 text-center shrink-0">{option.emoji}</span>
            <span className="flex-1 min-w-0">{option.label}</span>
            {isSelected && <CheckIcon />}
            <input
              type="radio"
              name="categoryFilter"
              className="sr-only"
              checked={isSelected}
              onChange={() => onSelect(option.key)}
            />
          </label>
        );
      })}
    </div>
  );
}
