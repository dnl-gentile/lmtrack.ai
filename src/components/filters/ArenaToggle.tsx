"use client";

interface ArenaToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ArenaToggle({ checked, onChange }: ArenaToggleProps) {
  return (
    <div className="flex bg-chip/50 dark:bg-chip/40 p-0.5 rounded-lg">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 py-1.5 px-3 text-[13px] text-center rounded-md transition-colors ${
          checked
            ? "bg-chip-active-bg text-primary font-medium border border-line shadow-sm"
            : "text-muted hover:bg-hover hover:text-primary"
        }`}
      >
        On
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 py-1.5 px-3 text-[13px] text-center rounded-md transition-colors ${
          !checked
            ? "bg-chip-active-bg text-primary font-medium border border-line shadow-sm"
            : "text-muted hover:bg-hover hover:text-primary"
        }`}
      >
        Off
      </button>
    </div>
  );
}
