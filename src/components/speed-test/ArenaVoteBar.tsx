"use client";

import { ArrowLeft, ArrowRight, CircleOff, Equal } from "lucide-react";
import type { ArenaVoteChoice } from "@/lib/types";

interface ArenaVoteBarProps {
  disabled?: boolean;
  busy?: boolean;
  onVote: (vote: ArenaVoteChoice) => void;
}

const OPTIONS: Array<{
  value: ArenaVoteChoice;
  label: string;
  mobileLabel: string;
  icon: typeof ArrowLeft;
}> = [
  { value: "A", label: "A is better", mobileLabel: "A", icon: ArrowLeft },
  { value: "both_good", label: "Both are good", mobileLabel: "Good", icon: Equal },
  { value: "both_bad", label: "Both are bad", mobileLabel: "Bad", icon: CircleOff },
  { value: "B", label: "B is better", mobileLabel: "B", icon: ArrowRight },
];

export default function ArenaVoteBar({ disabled = false, busy = false, onVote }: ArenaVoteBarProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled || busy}
            onClick={() => onVote(option.value)}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-chip px-2 py-2 text-xs text-primary transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.mobileLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
