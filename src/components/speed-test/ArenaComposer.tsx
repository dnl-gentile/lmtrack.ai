"use client";

import { ArrowRight, Code2, PenTool, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { ArenaMode, ArenaPromptPreset, Model } from "@/lib/types";

interface ArenaComposerProps {
  mode: ArenaMode;
  models: Model[];
  prompt: string;
  running: boolean;
  preset: ArenaPromptPreset;
  selectedLeftModelSlug: string;
  selectedRightModelSlug: string;
  selectedDirectModelSlug: string;
  onPresetChange: (preset: ArenaPromptPreset) => void;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
  onSelectedLeftModelSlugChange: (slug: string) => void;
  onSelectedRightModelSlugChange: (slug: string) => void;
  onSelectedDirectModelSlugChange: (slug: string) => void;
}

const PRESET_OPTIONS: Array<{
  preset: ArenaPromptPreset;
  label: string;
  icon: typeof Sparkles;
}> = [
  { preset: "default", label: "Default", icon: Sparkles },
  { preset: "concise", label: "Concise", icon: Zap },
  { preset: "creative", label: "Creative", icon: PenTool },
  { preset: "coding", label: "Coding", icon: Code2 },
  { preset: "factual", label: "Factual", icon: ShieldCheck },
];

function renderModelOption(model: Model) {
  return (
    <option key={model.id} value={model.slug}>
      {model.canonicalName} ({model.vendorName})
    </option>
  );
}

export default function ArenaComposer({
  mode,
  models,
  prompt,
  running,
  preset,
  selectedLeftModelSlug,
  selectedRightModelSlug,
  selectedDirectModelSlug,
  onPresetChange,
  onPromptChange,
  onSubmit,
  onSelectedLeftModelSlugChange,
  onSelectedRightModelSlugChange,
  onSelectedDirectModelSlugChange,
}: ArenaComposerProps) {
  const submitDisabled = running || prompt.trim().length === 0;

  return (
    <div className="rounded-xl border border-line bg-panel2 p-3">
      {mode === "battle" ? (
        <div className="mb-2 rounded-md border border-line bg-chip/40 px-2.5 py-2 text-xs text-muted">
          Battle Mode picks 2 random eligible active models per round.
        </div>
      ) : null}

      {mode === "side_by_side" ? (
        <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-muted">Left model</span>
            <select
              value={selectedLeftModelSlug}
              onChange={(event) => onSelectedLeftModelSlugChange(event.target.value)}
              className="w-full rounded-md border border-line bg-background px-2.5 py-2 text-sm text-primary"
              disabled={running}
            >
              {models.map(renderModelOption)}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-muted">Right model</span>
            <select
              value={selectedRightModelSlug}
              onChange={(event) => onSelectedRightModelSlugChange(event.target.value)}
              className="w-full rounded-md border border-line bg-background px-2.5 py-2 text-sm text-primary"
              disabled={running}
            >
              {models.map(renderModelOption)}
            </select>
          </label>
        </div>
      ) : null}

      {mode === "direct" ? (
        <label className="mb-2 block space-y-1">
          <span className="text-xs text-muted">Direct model</span>
          <select
            value={selectedDirectModelSlug}
            onChange={(event) => onSelectedDirectModelSlugChange(event.target.value)}
            className="w-full rounded-md border border-line bg-background px-2.5 py-2 text-sm text-primary"
            disabled={running}
          >
            {models.map(renderModelOption)}
          </select>
        </label>
      ) : null}

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder={running ? "Running benchmark..." : "Ask anything..."}
          className="min-h-[92px] w-full resize-y rounded-md border border-line bg-background px-3 py-3 pr-14 text-sm text-primary"
          maxLength={4000}
          disabled={running}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled}
          className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-primary text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Run"
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {PRESET_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = option.preset === preset;

          return (
            <button
              key={option.preset}
              type="button"
              onClick={() => onPresetChange(option.preset)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                active
                  ? "border-line bg-chip text-primary"
                  : "border-line/70 bg-background text-muted hover:bg-chip hover:text-primary"
              }`}
              aria-pressed={active}
              disabled={running}
              title={`${option.label} preset`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
