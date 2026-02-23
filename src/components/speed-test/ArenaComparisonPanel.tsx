"use client";

import { Copy, Expand } from "lucide-react";
import type { ArenaRunResponseSlot, ArenaVoteResponse } from "@/lib/types";
import ArenaLatencyBadge from "./ArenaLatencyBadge";
import ArenaMobileCarousel from "./ArenaMobileCarousel";

interface ArenaComparisonPanelProps {
  responses: ArenaRunResponseSlot[];
  reveal?: ArenaVoteResponse["reveal"];
}

function slotLabel(slot: "A" | "B", reveal?: ArenaVoteResponse["reveal"]) {
  if (!reveal) return `Assistant ${slot}`;
  const model = reveal[slot];
  return model.modelName;
}

function slotSubLabel(slot: "A" | "B", reveal?: ArenaVoteResponse["reveal"]) {
  if (!reveal) return null;
  return reveal[slot].vendorName;
}

function ComparisonCard({
  response,
  reveal,
}: {
  response: ArenaRunResponseSlot;
  reveal?: ArenaVoteResponse["reveal"];
}) {
  const header = slotLabel(response.slot, reveal);
  const subLabel = slotSubLabel(response.slot, reveal);

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-panel">
      <header className="flex items-start justify-between gap-3 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-sm text-primary">{header}</div>
          {subLabel ? <div className="truncate text-xs text-muted">{subLabel}</div> : null}
        </div>

        <div className="flex items-center gap-1.5">
          <ArenaLatencyBadge latencyMs={response.latencyMs} error={response.error} />
          <button
            type="button"
            className="rounded-md p-1 text-muted transition-colors hover:bg-chip hover:text-primary"
            aria-label="Copy response"
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="rounded-md p-1 text-muted transition-colors hover:bg-chip hover:text-primary"
            aria-label="Expand response"
            title="Expand"
          >
            <Expand className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div className="px-3 py-3">
        {response.text ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-primary">{response.text}</p>
        ) : response.error ? (
          <p className="text-sm text-amber-300">{response.error}</p>
        ) : (
          <p className="text-sm text-muted">Generating...</p>
        )}
      </div>
    </article>
  );
}

export default function ArenaComparisonPanel({ responses, reveal }: ArenaComparisonPanelProps) {
  const orderedResponses = [...responses].sort((a, b) => a.slot.localeCompare(b.slot));

  return (
    <>
      <div className="hidden gap-3 md:grid md:grid-cols-2">
        {orderedResponses.map((response) => (
          <ComparisonCard key={response.slot} response={response} reveal={reveal} />
        ))}
      </div>

      <div className="md:hidden">
        <ArenaMobileCarousel
          items={orderedResponses.map((response) => ({
            id: response.slot,
            content: <ComparisonCard response={response} reveal={reveal} />,
          }))}
        />
      </div>
    </>
  );
}
