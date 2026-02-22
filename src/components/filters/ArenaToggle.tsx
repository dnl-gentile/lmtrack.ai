"use client";

interface ArenaToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ArenaToggle({ checked, onChange }: ArenaToggleProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label
        htmlFor="arena-only"
        className="cursor-pointer text-primary"
      >
        Only models with Arena data
      </label>
      <button
        type="button"
        id="arena-only"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors ${
          checked
            ? "border-chip-active-border bg-chip-active-bg"
            : "border-line bg-chip"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
