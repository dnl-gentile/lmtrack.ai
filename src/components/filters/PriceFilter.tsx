"use client";

interface PriceFilterProps {
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export default function PriceFilter({
  min,
  max,
  onMinChange,
  onMaxChange,
}: PriceFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted">Price range ($/1M tokens)</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={0.1}
          value={min}
          onChange={(e) => onMinChange(Number(e.target.value) || 0)}
          className="w-full rounded-lg border border-line bg-background px-2.5 py-1.5 text-sm text-primary outline-none focus:border-chip-active-border"
        />
        <span className="text-muted">–</span>
        <input
          type="number"
          min={0}
          step={0.1}
          value={max}
          onChange={(e) => onMaxChange(Number(e.target.value) || 0)}
          className="w-full rounded-lg border border-line bg-background px-2.5 py-1.5 text-sm text-primary outline-none focus:border-chip-active-border"
        />
      </div>
    </div>
  );
}
