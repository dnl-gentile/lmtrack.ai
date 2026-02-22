"use client";

import { OPTIMIZATION_MODES } from "@/lib/constants";
import type { OptimizationMode } from "@/lib/constants";

interface OptimizationModeProps {
  value: OptimizationMode;
  onChange: (value: OptimizationMode) => void;
}

export default function OptimizationModeSelector({
  value,
  onChange,
}: OptimizationModeProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-line bg-chip p-0.5"
      role="group"
      aria-label="Optimization mode"
    >
      {OPTIMIZATION_MODES.map((mode) => (
        <button
          key={mode.key}
          type="button"
          onClick={() => onChange(mode.key)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            value === mode.key
              ? "bg-background text-primary shadow-sm"
              : "text-muted hover:text-primary"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
