"use client";

import Chip from "@/components/shared/Chip";
import { MODALITIES } from "@/lib/constants";
import type { Modality } from "@/lib/constants";

interface ModalityFilterProps {
  selected: Modality[];
  onToggle: (m: Modality) => void;
}

export default function ModalityFilter({
  selected,
  onToggle,
}: ModalityFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MODALITIES.map((m) => (
        <Chip
          key={m}
          label={m}
          active={selected.includes(m)}
          onClick={() => onToggle(m)}
        />
      ))}
    </div>
  );
}
