"use client";

import type { MouseEvent } from "react";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export default function Chip({
  label,
  active = false,
  onClick,
  removable = false,
  onRemove,
}: ChipProps) {
  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.();
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs select-none transition-colors ${
        active
          ? "bg-chip-active-bg border-chip-active-border text-primary"
          : "bg-chip border-line text-muted"
      } cursor-pointer`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <span>{label}</span>
      {removable ? (
        <button
          type="button"
          onClick={handleRemoveClick}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted/80 hover:text-primary"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
