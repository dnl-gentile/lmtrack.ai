"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Model, SpeedRunModelSummary, SpeedRunResponse, SpeedTestKey } from "@/lib/types";

const TEST_FOCUS: Array<{ key: SpeedTestKey; label: string }> = [
  { key: "overall", label: "Overall" },
  { key: "short", label: "Short prompt" },
  { key: "medium", label: "Medium prompt" },
  { key: "long", label: "Long prompt" },
];

function formatLatency(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Math.round(value)} ms`;
}

function focusLatency(
  summary: SpeedRunModelSummary | null,
  focus: SpeedTestKey
): number | null {
  if (!summary) return null;
  if (focus === "overall") return summary.overallMedianLatencyMs ?? null;
  return summary.tests[focus]?.medianLatencyMs ?? null;
}

export default function SpeedTestPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelSlug, setSelectedModelSlug] = useState("");
  const [testFocus, setTestFocus] = useState<SpeedTestKey>("overall");
  const [user, setUser] = useState<User | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpeedRunResponse | null>(null);

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
        if (sorted.length > 0) {
          setSelectedModelSlug(sorted[0].slug);
        }
      } catch {
        if (!mounted) return;
        setError("Failed to load models.");
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
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => setUser(nextUser));
    return () => unsubscribe();
  }, []);

  const selectedModel = useMemo(
    () => models.find((model) => model.slug === selectedModelSlug) ?? null,
    [models, selectedModelSlug]
  );

  const resultModel = useMemo(
    () =>
      result?.models.find((item) => item.modelSlug === selectedModelSlug) ??
      result?.models[0] ??
      null,
    [result, selectedModelSlug]
  );
  const skippedModels = result?.skippedModels ?? [];

  const runSpeedTest = async () => {
    if (!user) {
      setError("Sign in with Google to run speed tests.");
      return;
    }
    if (!selectedModelSlug) {
      setError("Select a model.");
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/speed-tests/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ models: [selectedModelSlug] }),
      });

      const payload = (await response.json()) as SpeedRunResponse;
      if (!response.ok || payload.status === "error") {
        throw new Error(
          payload.message || payload.skippedModels[0]?.reason || "Speed test failed."
        );
      }

      setResult(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Speed test failed.";
      setError(message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pt-4 lg:pt-8">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-serif font-normal tracking-tight text-primary">
          Speed Test
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-muted">
          Run a benchmark for one model at a time and track global latency records.
        </p>
      </header>

      <section className="mx-auto w-full max-w-2xl rounded-[20px] border border-line bg-table p-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-primary" htmlFor="model-select">
              Model
            </label>
            <select
              id="model-select"
              value={selectedModelSlug}
              onChange={(e) => setSelectedModelSlug(e.target.value)}
              disabled={loadingModels || running}
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-primary outline-none"
            >
              {loadingModels && <option>Loading models...</option>}
              {!loadingModels &&
                models.map((model) => (
                  <option key={model.id} value={model.slug}>
                    {model.canonicalName} ({model.vendorName})
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-primary" htmlFor="focus-select">
              Test focus
            </label>
            <select
              id="focus-select"
              value={testFocus}
              onChange={(e) => setTestFocus(e.target.value as SpeedTestKey)}
              disabled={running}
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-primary outline-none"
            >
              {TEST_FOCUS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted">
              The run executes short, medium, and long prompts. Focus controls which result is emphasized.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {user ? (
              <span className="text-xs text-muted">Signed in as {user.email ?? user.uid}</span>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  if (!auth) {
                    setError("Firebase Auth is not configured.");
                    return;
                  }
                  setError(null);
                  try {
                    await signInWithPopup(auth, new GoogleAuthProvider());
                  } catch (err) {
                    const message =
                      err instanceof Error ? err.message : "Failed to sign in.";
                    setError(message);
                  }
                }}
                className="rounded-md border border-line bg-chip px-3 py-2 text-sm text-primary transition-colors hover:bg-hover"
              >
                Sign in with Google
              </button>
            )}
            <button
              type="button"
              onClick={runSpeedTest}
              disabled={running || !selectedModelSlug}
              className="rounded-md border border-line bg-primary px-4 py-2 text-sm text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? "Running benchmark..." : "Run speed test"}
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </section>

      {resultModel && (
        <section className="mx-auto w-full max-w-3xl space-y-4 rounded-[20px] border border-line bg-table p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-primary">{resultModel.modelName}</h2>
            <p className="text-xs text-muted">
              Provider: {resultModel.vendorName} • Focus:{" "}
              <span className="capitalize">{testFocus}</span>
            </p>
          </div>

          <div className="rounded-lg border border-line bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted">Focused latency</p>
            <p className="mt-1 text-2xl font-semibold text-primary">
              {formatLatency(focusLatency(resultModel, testFocus))}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-md border border-line bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted">Overall</p>
              <p className="mt-1 text-sm font-medium text-primary">
                {formatLatency(resultModel.overallMedianLatencyMs)}
              </p>
            </div>
            <div className="rounded-md border border-line bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted">Short</p>
              <p className="mt-1 text-sm font-medium text-primary">
                {formatLatency(resultModel.tests.short?.medianLatencyMs)}
              </p>
            </div>
            <div className="rounded-md border border-line bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted">Medium</p>
              <p className="mt-1 text-sm font-medium text-primary">
                {formatLatency(resultModel.tests.medium?.medianLatencyMs)}
              </p>
            </div>
            <div className="rounded-md border border-line bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted">Long</p>
              <p className="mt-1 text-sm font-medium text-primary">
                {formatLatency(resultModel.tests.long?.medianLatencyMs)}
              </p>
            </div>
          </div>

          {skippedModels.length > 0 && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
              {skippedModels[0].modelName}: {skippedModels[0].reason}
            </div>
          )}

          <p className="text-xs text-muted">
            Selected model:{" "}
            <span className="text-primary">
              {selectedModel ? `${selectedModel.canonicalName} (${selectedModel.vendorName})` : "—"}
            </span>
          </p>
        </section>
      )}
    </div>
  );
}
