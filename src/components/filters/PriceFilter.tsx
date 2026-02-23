"use client";

import { useRef, useState, useEffect } from "react";

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
  const minPct = Math.min(100, Math.max(0, min));
  const maxPct = Math.min(100, Math.max(0, max));
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging || !trackRef.current) return;
    const el = trackRef.current;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const clamped = Math.max(0, Math.min(100, pct));
      if (dragging === "min") onMinChange(Math.min(clamped, maxPct));
      else onMaxChange(Math.max(clamped, minPct));
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, minPct, maxPct, onMinChange, onMaxChange]);

  const thumbClasses =
    "absolute w-4 h-4 -ml-2 -mt-[7px] bg-background border border-line rounded-full shadow-sm cursor-grab active:cursor-grabbing hover:border-muted transition-colors z-10";

  return (
    <div className="space-y-4">
      <div className="relative h-6 flex items-center">
        <div
          ref={trackRef}
          className="flex-1 h-1.5 bg-line rounded-full relative cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            const clamped = Math.max(0, Math.min(100, pct));
            if (clamped < (minPct + maxPct) / 2) {
              onMinChange(Math.min(clamped, maxPct));
            } else {
              onMaxChange(Math.max(clamped, minPct));
            }
          }}
        >
          <div
            className="absolute h-full rounded-full bg-muted/70 pointer-events-none"
            style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
          />
          <div
            className={thumbClasses}
            style={{ left: `${minPct}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragging("min");
            }}
          />
          <div
            className={thumbClasses}
            style={{ left: `${maxPct}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDragging("max");
            }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[12px] text-muted font-medium">
        <span>Min {min}</span>
        <span>Max {max}</span>
      </div>
    </div>
  );
}
