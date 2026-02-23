import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { COLL } from "@/lib/queries/collections";
import { getModels } from "@/lib/queries/models";
import { SPEED_RATE_LIMIT_MAX_RUNS, SPEED_RATE_LIMIT_WINDOW_MS, SPEED_TEST_CASES, BENCHMARK_REPEATS, computeOverallMedianLatency, getProviderConfig, median } from "@/lib/speed";
import { runProviderLatencyCheck } from "@/lib/speedRunner";
import type { SpeedRunModelSummary, SpeedRunResponse } from "@/lib/types";

interface RunRequestBody {
  models?: string[];
}

function toIso(input: number): string {
  return new Date(input).toISOString();
}

function getIpHash(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
  const salt = process.env.SPEED_IP_HASH_SALT || "track-default-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

async function getVerifiedUser(request: Request): Promise<{ uid: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Date.now();
  const since = toIso(now - SPEED_RATE_LIMIT_WINDOW_MS);

  const snapshot = await adminDb
    .collection(COLL.speedRuns)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const recent = snapshot.docs.filter((doc) => {
    const createdAt = String(doc.data().createdAt ?? "");
    return createdAt >= since;
  });

  return recent.length < SPEED_RATE_LIMIT_MAX_RUNS;
}

async function upsertSpeedRecord(input: {
  modelId: string;
  modelSlug: string;
  modelName: string;
  vendorSlug: string;
  vendorName: string;
  testKey: "overall" | "short" | "medium" | "long";
  bestMedianLatencyMs: number;
  updatedAt: string;
}) {
  const docId = `${input.modelId}_${input.testKey}`;
  const ref = adminDb.collection(COLL.speedRecords).doc(docId);
  const snapshot = await ref.get();
  const current = snapshot.data();
  const existing = typeof current?.bestMedianLatencyMs === "number" ? current.bestMedianLatencyMs : null;

  if (existing != null && existing <= input.bestMedianLatencyMs) return;

  await ref.set(
    {
      id: docId,
      ...input,
    },
    { merge: true }
  );
}

export async function POST(request: Request) {
  const user = await getVerifiedUser(request);
  if (!user) {
    return NextResponse.json(
      { status: "error", message: "Authentication required to run speed tests." },
      { status: 401 }
    );
  }

  const allowed = await checkRateLimit(user.uid);
  if (!allowed) {
    return NextResponse.json(
      {
        status: "error",
        message: "Rate limit reached for speed tests. Please try again later.",
      },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as RunRequestBody;
  const requestedSlugs = (body.models ?? [])
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (requestedSlugs.length === 0) {
    const response: SpeedRunResponse = {
      status: "error",
      runId: "",
      models: [],
      skippedModels: [],
      message: "Select at least one model.",
    };
    return NextResponse.json(response, { status: 400 });
  }

  const allModels = await getModels({ active: true });
  const selectedModels = allModels.filter((m) => requestedSlugs.includes(m.slug));

  const runId = `speed_run_${Date.now()}`;
  const createdAt = new Date().toISOString();
  const ipHash = getIpHash(request);
  const country = request.headers.get("cf-ipcountry") ?? "unknown";
  const region = request.headers.get("x-vercel-ip-country-region") ?? "unknown";

  const results: SpeedRunModelSummary[] = [];
  const skippedModels: SpeedRunResponse["skippedModels"] = [];

  for (const model of selectedModels) {
    const provider = getProviderConfig(model.vendorSlug);
    if (!provider) {
      skippedModels.push({
        modelId: model.id,
        modelSlug: model.slug,
        modelName: model.canonicalName,
        vendorSlug: model.vendorSlug,
        reason: `Unsupported provider: ${model.vendorSlug}`,
      });
      continue;
    }

    if (!process.env[provider.envKey]) {
      skippedModels.push({
        modelId: model.id,
        modelSlug: model.slug,
        modelName: model.canonicalName,
        vendorSlug: model.vendorSlug,
        reason: `Missing provider key: ${provider.envKey}`,
      });
      continue;
    }

    const summary: SpeedRunModelSummary = {
      modelId: model.id,
      modelSlug: model.slug,
      modelName: model.canonicalName,
      vendorSlug: model.vendorSlug,
      vendorName: model.vendorName,
      tests: { short: null, medium: null, long: null },
      overallMedianLatencyMs: null,
    };

    for (const testCase of SPEED_TEST_CASES) {
      const latencies: number[] = [];
      let lastError: string | null = null;

      for (let attempt = 0; attempt < BENCHMARK_REPEATS; attempt += 1) {
        const probe = await runProviderLatencyCheck({
          vendorSlug: model.vendorSlug,
          modelSlug: model.slug,
          prompt: testCase.prompt,
          maxOutputTokens: testCase.maxOutputTokens,
        });

        if (probe.latencyMs != null) {
          latencies.push(probe.latencyMs);
        } else if (probe.error) {
          lastError = probe.error;
        }
      }

      const medianLatencyMs = median(latencies);
      const testResult = {
        modelId: model.id,
        modelSlug: model.slug,
        modelName: model.canonicalName,
        vendorSlug: model.vendorSlug,
        vendorName: model.vendorName,
        testKey: testCase.key,
        attemptLatenciesMs: latencies,
        medianLatencyMs,
        success: medianLatencyMs != null,
        error: medianLatencyMs == null ? lastError ?? "No successful attempts" : null,
      } as const;

      summary.tests[testCase.key] = testResult;

      await adminDb.collection(COLL.speedRuns).add({
        runId,
        userId: user.uid,
        source: "manual",
        modelId: model.id,
        modelSlug: model.slug,
        modelName: model.canonicalName,
        vendorSlug: model.vendorSlug,
        vendorName: model.vendorName,
        testKey: testCase.key,
        attemptLatenciesMs: latencies,
        medianLatencyMs,
        success: medianLatencyMs != null,
        error: testResult.error,
        ipHash,
        country,
        region,
        createdAt,
      });

      if (medianLatencyMs != null) {
        await upsertSpeedRecord({
          modelId: model.id,
          modelSlug: model.slug,
          modelName: model.canonicalName,
          vendorSlug: model.vendorSlug,
          vendorName: model.vendorName,
          testKey: testCase.key,
          bestMedianLatencyMs: medianLatencyMs,
          updatedAt: createdAt,
        });
      }
    }

    const overall = computeOverallMedianLatency({
      short: summary.tests.short?.medianLatencyMs ?? null,
      medium: summary.tests.medium?.medianLatencyMs ?? null,
      long: summary.tests.long?.medianLatencyMs ?? null,
    });
    summary.overallMedianLatencyMs = overall;

    if (overall != null) {
      await upsertSpeedRecord({
        modelId: model.id,
        modelSlug: model.slug,
        modelName: model.canonicalName,
        vendorSlug: model.vendorSlug,
        vendorName: model.vendorName,
        testKey: "overall",
        bestMedianLatencyMs: overall,
        updatedAt: createdAt,
      });
    }

    results.push(summary);
  }

  const failures = results.some((item) =>
    Object.values(item.tests).some((test) => test != null && !test.success)
  );
  const status: SpeedRunResponse["status"] =
    results.length === 0 ? "error" : skippedModels.length > 0 || failures ? "partial" : "ok";

  const response: SpeedRunResponse = {
    status,
    runId,
    models: results,
    skippedModels,
    message:
      status === "partial"
        ? "Some models or tests were skipped or failed. Check each row for details."
        : undefined,
  };

  return NextResponse.json(response);
}
