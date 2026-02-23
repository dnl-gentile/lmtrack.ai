"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Columns2, MessageSquare, Swords } from "lucide-react";
import type { ArenaMode } from "@/lib/types";

interface ArenaModeSelectorProps {
  mode: ArenaMode;
  onChange: (mode: ArenaMode) => void;
}

const MODE_OPTIONS: Array<{
  mode: ArenaMode;
  label: string;
  description: string;
  icon: typeof Swords;
}> = [
  {
    mode: "battle",
    label: "Battle Mode",
    description: "Battle 2 anonymous models",
    icon: Swords,
  },
  {
    mode: "side_by_side",
    label: "Side by Side",
    description: "Compare 2 models of your choice",
    icon: Columns2,
  },
  {
    mode: "direct",
    label: "Direct",
    description: "Chat with 1 model at a time",
    icon: MessageSquare,
  },
];

export default function ArenaModeSelector({ mode, onChange }: ArenaModeSelectorProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectedOption = MODE_OPTIONS.find((option) => option.mode === mode) ?? MODE_OPTIONS[0];
  const SelectedIcon = selectedOption.icon;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary transition-colors hover:bg-chip"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <SelectedIcon className="h-4 w-4" strokeWidth={1.8} />
        <span>{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-[280px] rounded-lg border border-line bg-panel p-1 shadow-xl">
          {MODE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = mode === option.mode;

            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => {
                  onChange(option.mode);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                  active ? "bg-chip text-primary" : "text-primary hover:bg-chip/80"
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                <span className="min-w-0">
                  <span className="block text-sm">{option.label}</span>
                  <span className="block text-xs text-muted">{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
