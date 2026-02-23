"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { LogIn, LogOut, Menu } from "lucide-react";
import { auth } from "@/lib/firebase";
import type {
  ArenaMode,
  ArenaPromptPreset,
  ArenaRunRequest,
  ArenaRunResponse,
  ArenaSessionLocal,
  ArenaSessionRoundLocal,
  ArenaVoteChoice,
  ArenaVoteResponse,
  Model,
} from "@/lib/types";
import ArenaModeSelector from "@/components/speed-test/ArenaModeSelector";
import ArenaSessionRail from "@/components/speed-test/ArenaSessionRail";
import ArenaComposer from "@/components/speed-test/ArenaComposer";
import ArenaComparisonPanel from "@/components/speed-test/ArenaComparisonPanel";
import ArenaVoteBar from "@/components/speed-test/ArenaVoteBar";
import ArenaDirectPanel from "@/components/speed-test/ArenaDirectPanel";

const STORAGE_SESSIONS_KEY = "arena-speed-test-sessions-v1";
const STORAGE_ACTIVE_SESSION_KEY = "arena-speed-test-active-session-v1";
const MAX_STORED_SESSIONS = 20;

function nowIso(): string {
  return new Date().toISOString();
}

function makeClientId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function titleFromPrompt(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "New chat";
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}...` : trimmed;
}

function createSession(mode: ArenaMode): ArenaSessionLocal {
  const createdAt = nowIso();
  return {
    sessionId: makeClientId("arena_session_local"),
    mode,
    title: "New chat",
    createdAt,
    lastUpdatedAt: createdAt,
    roundCount: 0,
    preset: "default",
    selectedLeftModelSlug: "",
    selectedRightModelSlug: "",
    selectedDirectModelSlug: "",
    rounds: [],
  };
}

function sortAndTrimSessions(sessions: ArenaSessionLocal[]): ArenaSessionLocal[] {
  return [...sessions]
    .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt))
    .slice(0, MAX_STORED_SESSIONS);
}

function ensureComparisonSlots(round: ArenaSessionRoundLocal) {
  const bySlot = new Map(round.responses.map((item) => [item.slot, item]));
  return [
    bySlot.get("A") ?? { slot: "A" as const, text: null, latencyMs: null, error: null },
    bySlot.get("B") ?? { slot: "B" as const, text: null, latencyMs: null, error: null },
  ];
}

export default function SpeedTestPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [sessions, setSessions] = useState<ArenaSessionLocal[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");

  const [mode, setMode] = useState<ArenaMode>("battle");
  const [preset, setPreset] = useState<ArenaPromptPreset>("default");
  const [selectedLeftModelSlug, setSelectedLeftModelSlug] = useState("");
  const [selectedRightModelSlug, setSelectedRightModelSlug] = useState("");
  const [selectedDirectModelSlug, setSelectedDirectModelSlug] = useState("");

  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [pendingVoteRoundId, setPendingVoteRoundId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.sessionId === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const sessionItems = useMemo(
    () =>
      sessions.map((session) => ({
        sessionId: session.sessionId,
        title: session.title,
        mode: session.mode,
        roundCount: session.roundCount,
        lastUpdatedAt: session.lastUpdatedAt,
      })),
    [sessions]
  );

  useEffect(() => {
    let mounted = true;

    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const response = await fetch("/api/models?active=true");
        const payload = (await response.json()) as Model[];
        if (!mounted) return;

        const sorted = [...payload].sort((a, b) =>
          a.canonicalName.localeCompare(b.canonicalName)
        );
        setModels(sorted);
      } catch {
        if (!mounted) return;
        setError("Failed to load active models.");
      } finally {
        if (mounted) setLoadingModels(false);
      }
    };

    void loadModels();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let loadedSessions: ArenaSessionLocal[] = [];
    let loadedActiveId = "";

    try {
      const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
      const parsed = raw ? (JSON.parse(raw) as ArenaSessionLocal[]) : [];
      if (Array.isArray(parsed)) {
        loadedSessions = parsed.filter(
          (item): item is ArenaSessionLocal =>
            Boolean(item) && typeof item.sessionId === "string" && Array.isArray(item.rounds)
        );
      }
    } catch {
      loadedSessions = [];
    }

    try {
      loadedActiveId = localStorage.getItem(STORAGE_ACTIVE_SESSION_KEY) ?? "";
    } catch {
      loadedActiveId = "";
    }

    if (loadedSessions.length === 0) {
      const session = createSession("battle");
      loadedSessions = [session];
      loadedActiveId = session.sessionId;
    }

    const sorted = sortAndTrimSessions(loadedSessions);
    const hasActive = sorted.some((session) => session.sessionId === loadedActiveId);
    const nextActiveId = hasActive ? loadedActiveId : sorted[0].sessionId;

    setSessions(sorted);
    setActiveSessionId(nextActiveId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => setUser(nextUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeSession) return;

    setMode(activeSession.mode);
    setPreset(activeSession.preset ?? "default");
    setSelectedLeftModelSlug(activeSession.selectedLeftModelSlug ?? "");
    setSelectedRightModelSlug(activeSession.selectedRightModelSlug ?? "");
    setSelectedDirectModelSlug(activeSession.selectedDirectModelSlug ?? "");
  }, [activeSessionId]);

  useEffect(() => {
    if (models.length === 0) return;

    const defaultLeft = models[0]?.slug ?? "";
    const defaultRight = models[1]?.slug ?? models[0]?.slug ?? "";

    setSelectedLeftModelSlug((prev) =>
      models.some((model) => model.slug === prev) ? prev : defaultLeft
    );

    setSelectedRightModelSlug((prev) => {
      if (models.some((model) => model.slug === prev)) return prev;
      return defaultRight;
    });

    setSelectedDirectModelSlug((prev) =>
      models.some((model) => model.slug === prev) ? prev : defaultLeft
    );
  }, [models]);

  useEffect(() => {
    if (!activeSessionId) return;

    setSessions((prev) => {
      const next = prev.map((session) => {
        if (session.sessionId !== activeSessionId) return session;

        return {
          ...session,
          mode,
          preset,
          selectedLeftModelSlug,
          selectedRightModelSlug,
          selectedDirectModelSlug,
        };
      });

      return next;
    });
  }, [
    activeSessionId,
    mode,
    preset,
    selectedLeftModelSlug,
    selectedRightModelSlug,
    selectedDirectModelSlug,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_ACTIVE_SESSION_KEY, activeSessionId);
    } catch {
      // Ignore storage failures.
    }
  }, [sessions, activeSessionId, hydrated]);

  const updateSession = (
    sessionId: string,
    updater: (session: ArenaSessionLocal) => ArenaSessionLocal
  ) => {
    setSessions((prev) => {
      const next = prev.map((session) =>
        session.sessionId === sessionId ? updater(session) : session
      );
      return sortAndTrimSessions(next);
    });
  };

  const createNewSession = () => {
    const next = createSession(mode);
    next.preset = preset;
    next.selectedLeftModelSlug = selectedLeftModelSlug;
    next.selectedRightModelSlug = selectedRightModelSlug;
    next.selectedDirectModelSlug = selectedDirectModelSlug;

    setSessions((prev) => sortAndTrimSessions([next, ...prev]));
    setActiveSessionId(next.sessionId);
    setPrompt("");
    setError(null);
  };

  const buildAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (user) {
      try {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      } catch {
        // Ignore token errors and continue as guest.
      }
    }

    return headers;
  };

  const runArenaRound = async () => {
    if (!activeSession) return;
    if (running) return;

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Prompt is required.");
      return;
    }

    if (mode === "side_by_side" && selectedLeftModelSlug === selectedRightModelSlug) {
      setError("Select two different models for Side by Side mode.");
      return;
    }

    setError(null);
    setRunning(true);

    const pendingRoundId = makeClientId("arena_round_pending");
    const createdAt = nowIso();

    const pendingRound: ArenaSessionRoundLocal = {
      roundId: pendingRoundId,
      mode,
      prompt: trimmedPrompt,
      preset,
      createdAt,
      status: "ok",
      isPending: true,
      requiresVote: mode !== "direct",
      responses:
        mode === "direct"
          ? []
          : [
              { slot: "A", text: null, latencyMs: null, error: null },
              { slot: "B", text: null, latencyMs: null, error: null },
            ],
      directResponse:
        mode === "direct"
          ? {
              text: null,
              latencyMs: null,
              modelSlug: selectedDirectModelSlug,
              modelName:
                models.find((model) => model.slug === selectedDirectModelSlug)?.canonicalName ??
                "Selected model",
              vendorName:
                models.find((model) => model.slug === selectedDirectModelSlug)?.vendorName ?? "",
              error: null,
            }
          : undefined,
    };

    updateSession(activeSession.sessionId, (session) => {
      const nextRounds = [...session.rounds, pendingRound];
      return {
        ...session,
        title: session.roundCount === 0 ? titleFromPrompt(trimmedPrompt) : session.title,
        mode,
        preset,
        selectedLeftModelSlug,
        selectedRightModelSlug,
        selectedDirectModelSlug,
        rounds: nextRounds,
        roundCount: nextRounds.length,
        lastUpdatedAt: createdAt,
      };
    });

    setPrompt("");

    try {
      const headers = await buildAuthHeaders();
      const body: ArenaRunRequest = {
        mode,
        prompt: trimmedPrompt,
        preset,
        sessionId: activeSession.sessionId,
        leftModelSlug: mode === "side_by_side" ? selectedLeftModelSlug : undefined,
        rightModelSlug: mode === "side_by_side" ? selectedRightModelSlug : undefined,
        directModelSlug: mode === "direct" ? selectedDirectModelSlug : undefined,
      };

      const response = await fetch("/api/speed-tests/arena/run", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as ArenaRunResponse | { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Failed to run arena benchmark.");
      }

      const runPayload = payload as ArenaRunResponse;

      const resolvedRound: ArenaSessionRoundLocal = {
        roundId: runPayload.roundId,
        mode: runPayload.mode,
        prompt: runPayload.prompt,
        preset,
        createdAt,
        status: runPayload.status,
        isPending: false,
        requiresVote: runPayload.requiresVote,
        responses: runPayload.responses,
        directResponse: runPayload.directResponse,
        message: runPayload.message,
      };

      updateSession(activeSession.sessionId, (session) => {
        const nextRounds = session.rounds.map((round) =>
          round.roundId === pendingRoundId ? resolvedRound : round
        );
        return {
          ...session,
          rounds: nextRounds,
          roundCount: nextRounds.length,
          lastUpdatedAt: nowIso(),
        };
      });

      setError(runPayload.status === "error" ? runPayload.message ?? null : null);
    } catch (runError) {
      const message = runError instanceof Error ? runError.message : "Failed to run arena benchmark.";
      setError(message);

      updateSession(activeSession.sessionId, (session) => {
        const nextRounds = session.rounds.filter((round) => round.roundId !== pendingRoundId);
        return {
          ...session,
          rounds: nextRounds,
          roundCount: nextRounds.length,
          lastUpdatedAt: nowIso(),
        };
      });
    } finally {
      setRunning(false);
    }
  };

  const submitVote = async (roundId: string, vote: ArenaVoteChoice) => {
    if (!activeSession) return;
    if (pendingVoteRoundId) return;

    setPendingVoteRoundId(roundId);
    setError(null);

    try {
      const headers = await buildAuthHeaders();
      const response = await fetch("/api/speed-tests/arena/vote", {
        method: "POST",
        headers,
        body: JSON.stringify({
          roundId,
          vote,
          sessionId: activeSession.sessionId,
        }),
      });

      const payload = (await response.json()) as ArenaVoteResponse | { message?: string };
      if (!response.ok || (payload as ArenaVoteResponse).status !== "ok") {
        throw new Error(payload.message || "Failed to submit vote.");
      }

      const votePayload = payload as ArenaVoteResponse;
      updateSession(activeSession.sessionId, (session) => {
        const nextRounds = session.rounds.map((round) =>
          round.roundId === roundId
            ? {
                ...round,
                vote,
                reveal: votePayload.reveal,
                isPending: false,
              }
            : round
        );

        return {
          ...session,
          rounds: nextRounds,
          roundCount: nextRounds.length,
          lastUpdatedAt: nowIso(),
        };
      });
    } catch (voteError) {
      const message = voteError instanceof Error ? voteError.message : "Failed to submit vote.";
      setError(message);
    } finally {
      setPendingVoteRoundId(null);
    }
  };

  const activeRounds = activeSession?.rounds ?? [];

  return (
    <div className="flex h-full min-h-[calc(100vh-56px)] gap-3 py-3">
      <ArenaSessionRail
        sessions={sessionItems}
        activeSessionId={activeSessionId}
        onSelect={(sessionId) => {
          setActiveSessionId(sessionId);
          setPrompt("");
          setError(null);
        }}
        onCreate={createNewSession}
        mobileOpen={mobileRailOpen}
        onCloseMobile={() => setMobileRailOpen(false)}
      />

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-background">
        <header className="flex items-center gap-2 border-b border-line px-2.5 py-2">
          <button
            type="button"
            onClick={() => setMobileRailOpen(true)}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-chip hover:text-primary lg:hidden"
            aria-label="Open sessions"
          >
            <Menu className="h-4 w-4" strokeWidth={1.9} />
          </button>

          <ArenaModeSelector mode={mode} onChange={setMode} />

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  if (!auth) return;
                  await signOut(auth);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-line bg-chip px-2 py-1 text-xs text-primary transition-colors hover:bg-hover"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  if (!auth) {
                    setError("Firebase Auth is not configured.");
                    return;
                  }
                  try {
                    setError(null);
                    await signInWithPopup(auth, new GoogleAuthProvider());
                  } catch (signInError) {
                    const message =
                      signInError instanceof Error ? signInError.message : "Failed to sign in.";
                    setError(message);
                  }
                }}
                className="inline-flex items-center gap-1 rounded-md border border-line bg-chip px-2 py-1 text-xs text-primary transition-colors hover:bg-hover"
              >
                <LogIn className="h-3.5 w-3.5" strokeWidth={1.8} />
                Login
              </button>
            )}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {activeRounds.length === 0 ? (
              <div className="mx-auto mt-10 max-w-3xl space-y-4 text-center">
                <h1 className="text-4xl font-serif font-normal text-primary md:text-6xl">
                  Benchmark model speed <span className="bg-[#2ebf55] px-2 text-[#102017]">head-to-head</span>
                </h1>
                <p className="mx-auto max-w-2xl text-sm text-muted">
                  Run anonymous comparisons, vote on winners, and reveal model identities after each round.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeRounds.map((round) => (
                  <article key={round.roundId} className="space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-[90%] rounded-full bg-chip px-4 py-2 text-sm text-primary">
                        {round.prompt}
                      </div>
                    </div>

                    {round.mode === "direct" ? (
                      <ArenaDirectPanel response={round.directResponse} pending={Boolean(round.isPending)} />
                    ) : (
                      <ArenaComparisonPanel
                        responses={ensureComparisonSlots(round)}
                        reveal={round.reveal}
                      />
                    )}

                    {round.mode !== "direct" && round.requiresVote && !round.vote ? (
                      <ArenaVoteBar
                        disabled={Boolean(round.isPending)}
                        busy={pendingVoteRoundId === round.roundId}
                        onVote={(vote) => {
                          void submitVote(round.roundId, vote);
                        }}
                      />
                    ) : null}

                    {round.vote && round.reveal ? (
                      <p className="text-xs text-muted">
                        Revealed: A = {round.reveal.A.modelName} ({round.reveal.A.vendorName}) | B ={" "}
                        {round.reveal.B.modelName} ({round.reveal.B.vendorName})
                      </p>
                    ) : null}

                    {round.message ? <p className="text-xs text-muted">{round.message}</p> : null}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-line px-3 py-3">
            <ArenaComposer
              mode={mode}
              models={models}
              prompt={prompt}
              running={running || loadingModels || !hydrated}
              preset={preset}
              selectedLeftModelSlug={selectedLeftModelSlug}
              selectedRightModelSlug={selectedRightModelSlug}
              selectedDirectModelSlug={selectedDirectModelSlug}
              onPresetChange={setPreset}
              onPromptChange={setPrompt}
              onSubmit={() => {
                void runArenaRound();
              }}
              onSelectedLeftModelSlugChange={setSelectedLeftModelSlug}
              onSelectedRightModelSlugChange={setSelectedRightModelSlug}
              onSelectedDirectModelSlugChange={setSelectedDirectModelSlug}
            />

            {error ? (
              <div className="mt-2 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
