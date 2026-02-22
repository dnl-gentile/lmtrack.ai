"use client";

import { VENDORS } from "@/lib/constants";

interface VendorFilterProps {
  selected: string[];
  onToggle: (slug: string) => void;
}

export default function VendorFilter({ selected, onToggle }: VendorFilterProps) {
  return (
    <ul className="flex flex-col gap-1.5">
      {VENDORS.map((v) => (
        <li key={v.slug} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`vendor-${v.slug}`}
            checked={selected.includes(v.slug)}
            onChange={() => onToggle(v.slug)}
            className="h-4 w-4 rounded border-line bg-background text-chip-active-border focus:ring-chip-active-border"
          />
          <label
            htmlFor={`vendor-${v.slug}`}
            className="cursor-pointer text-primary"
          >
            {v.name}
          </label>
        </li>
      ))}
    </ul>
  );
}
