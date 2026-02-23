"use client";

import { Plus, X } from "lucide-react";
import type { ArenaMode } from "@/lib/types";

interface ArenaSessionRailItem {
  sessionId: string;
  title: string;
  mode: ArenaMode;
  lastUpdatedAt: string;
  roundCount: number;
}

interface ArenaSessionRailProps {
  sessions: ArenaSessionRailItem[];
  activeSessionId: string;
  onSelect: (sessionId: string) => void;
  onCreate: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function formatTimestamp(iso: string): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return "";

  const diffMinutes = Math.max(0, Math.round((Date.now() - parsed) / 60_000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(parsed).toLocaleDateString();
}

function modeLabel(mode: ArenaMode): string {
  if (mode === "battle") return "Battle";
  if (mode === "side_by_side") return "Side by Side";
  return "Direct";
}

function SessionList({
  sessions,
  activeSessionId,
  onSelect,
  onCreate,
}: {
  sessions: ArenaSessionRailItem[];
  activeSessionId: string;
  onSelect: (sessionId: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <h2 className="text-sm font-medium text-primary">Sessions</h2>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-chip px-2 py-1 text-xs text-primary transition-colors hover:bg-hover"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1.5">
          {sessions.map((session) => {
            const active = session.sessionId === activeSessionId;
            return (
              <button
                key={session.sessionId}
                type="button"
                onClick={() => onSelect(session.sessionId)}
                className={`w-full rounded-md border px-2.5 py-2 text-left transition-colors ${
                  active
                    ? "border-line bg-chip text-primary"
                    : "border-transparent text-primary hover:border-line/60 hover:bg-chip/50"
                }`}
              >
                <div className="truncate text-sm">{session.title || "Untitled"}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                  <span>{modeLabel(session.mode)}</span>
                  <span>{session.roundCount} rounds</span>
                </div>
                <div className="mt-0.5 text-[10px] text-muted/90">{formatTimestamp(session.lastUpdatedAt)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function ArenaSessionRail({
  sessions,
  activeSessionId,
  onSelect,
  onCreate,
  mobileOpen,
  onCloseMobile,
}: ArenaSessionRailProps) {
  return (
    <>
      <aside className="hidden h-full w-[250px] shrink-0 overflow-hidden rounded-xl border border-line bg-panel lg:flex lg:flex-col">
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={onSelect}
          onCreate={onCreate}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close sessions"
            onClick={onCloseMobile}
          />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] overflow-hidden border-r border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <h2 className="text-sm font-medium text-primary">Sessions</h2>
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-chip hover:text-primary"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
            <SessionList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelect={(sessionId) => {
                onSelect(sessionId);
                onCloseMobile();
              }}
              onCreate={() => {
                onCreate();
                onCloseMobile();
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
