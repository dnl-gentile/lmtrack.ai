"use client";

import Chip from "@/components/shared/Chip";
import { DOMAINS } from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";

interface DomainFilterProps {
  selected: DomainKey[];
  onToggle: (key: DomainKey) => void;
}

export default function DomainFilter({ selected, onToggle }: DomainFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DOMAINS.map((d) => (
        <Chip
          key={d.key}
          label={d.label}
          active={selected.includes(d.key)}
          onClick={() => onToggle(d.key)}
        />
      ))}
    </div>
  );
}
