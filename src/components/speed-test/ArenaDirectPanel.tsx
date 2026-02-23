"use client";

import ArenaLatencyBadge from "./ArenaLatencyBadge";
import type { ArenaDirectResponse } from "@/lib/types";

interface ArenaDirectPanelProps {
  response?: ArenaDirectResponse;
  pending?: boolean;
}

export default function ArenaDirectPanel({ response, pending = false }: ArenaDirectPanelProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-panel">
      <header className="flex items-start justify-between gap-3 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-sm text-primary">{response?.modelName ?? "Direct response"}</div>
          {response?.vendorName ? <div className="truncate text-xs text-muted">{response.vendorName}</div> : null}
        </div>
        <ArenaLatencyBadge latencyMs={response?.latencyMs ?? null} error={response?.error ?? null} />
      </header>

      <div className="px-3 py-3">
        {response?.text ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-primary">{response.text}</p>
        ) : response?.error ? (
          <p className="text-sm text-amber-300">{response.error}</p>
        ) : pending ? (
          <p className="text-sm text-muted">Generating...</p>
        ) : (
          <p className="text-sm text-muted">No response available.</p>
        )}
      </div>
    </article>
  );
}
