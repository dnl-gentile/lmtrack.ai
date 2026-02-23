import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { COLL } from "@/lib/queries/collections";
import { getModels } from "@/lib/queries/models";
import { getProviderConfig } from "@/lib/speed";
import { runProviderResponseCheck } from "@/lib/speedRunner";
import type {
  ArenaMode,
  ArenaPromptPreset,
  ArenaRunRequest,
  ArenaRunResponse,
  ArenaRunResponseSlot,
  Model,
} from "@/lib/types";

const ARENA_RATE_LIMIT_MAX_RUNS = 6;
const ARENA_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ARENA_MAX_PROMPT_LENGTH = 4000;
const ARENA_MAX_OUTPUT_TOKENS = 700;

const ARENA_MODES: ArenaMode[] = ["battle", "side_by_side", "direct"];
const PRESETS: ArenaPromptPreset[] = ["default", "concise", "creative", "coding", "factual"];

const PRESET_PREFIX: Record<ArenaPromptPreset, string> = {
  default: "",
  concise: "Respond briefly and directly. Keep the answer under 120 words unless asked otherwise.",
  creative: "Respond with originality and expressive tone while staying useful and accurate.",
  coding: "Respond like a senior software engineer. Prefer correct code, tradeoffs, and clear steps.",
  factual: "Respond with careful factual precision, avoid speculation, and note uncertainty clearly.",
};

interface RateLimitWindow {
  count: number;
  remaining: number;
  resetAt: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
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

async function getOptionalUser(request: Request): Promise<{ uid: string } | null> {
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

async function getRateLimitWindow(field: "ipHash" | "userId", value: string): Promise<RateLimitWindow> {
  const now = Date.now();
  const sinceIso = toIso(now - ARENA_RATE_LIMIT_WINDOW_MS);

  const snapshot = await adminDb
    .collection(COLL.speedArenaRuns)
    .where(field, "==", value)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  const roundToTimestamp = new Map<string, number>();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const createdAtRaw = String(data.createdAt ?? "");
    if (!createdAtRaw || createdAtRaw < sinceIso) continue;

    const roundId = String(data.roundId ?? "");
    if (!roundId) continue;

    const parsed = Date.parse(createdAtRaw);
    if (!Number.isFinite(parsed)) continue;

    const existing = roundToTimestamp.get(roundId);
    if (existing == null || parsed < existing) {
      roundToTimestamp.set(roundId, parsed);
    }
  }

  const timestamps = Array.from(roundToTimestamp.values()).sort((a, b) => a - b);
  const count = timestamps.length;
  const remaining = Math.max(0, ARENA_RATE_LIMIT_MAX_RUNS - count);
  const resetAt =
    count >= ARENA_RATE_LIMIT_MAX_RUNS
      ? new Date(timestamps[0] + ARENA_RATE_LIMIT_WINDOW_MS).toISOString()
      : new Date(now + ARENA_RATE_LIMIT_WINDOW_MS).toISOString();

  return { count, remaining, resetAt };
}

function toRateLimitResult(ipWindow: RateLimitWindow, userWindow: RateLimitWindow | null): RateLimitResult {
  if (!userWindow) {
    return {
      allowed: ipWindow.count < ARENA_RATE_LIMIT_MAX_RUNS,
      remaining: ipWindow.remaining,
      resetAt: ipWindow.resetAt,
    };
  }

  const allowed =
    ipWindow.count < ARENA_RATE_LIMIT_MAX_RUNS &&
    userWindow.count < ARENA_RATE_LIMIT_MAX_RUNS;

  if (ipWindow.remaining <= userWindow.remaining) {
    return {
      allowed,
      remaining: ipWindow.remaining,
      resetAt: ipWindow.resetAt,
    };
  }

  return {
    allowed,
    remaining: userWindow.remaining,
    resetAt: userWindow.resetAt,
  };
}

function normalizePrompt(rawPrompt: string): string {
  return rawPrompt.trim().replace(/\r\n/g, "\n");
}

function buildPrompt(preset: ArenaPromptPreset, prompt: string): string {
  const prefix = PRESET_PREFIX[preset];
  if (!prefix) return prompt;
  return `${prefix}\n\nUser prompt:\n${prompt}`;
}

function randomPair<T>(items: T[]): [T, T] {
  const firstIndex = Math.floor(Math.random() * items.length);
  let secondIndex = Math.floor(Math.random() * items.length);
  while (secondIndex === firstIndex) {
    secondIndex = Math.floor(Math.random() * items.length);
  }
  return [items[firstIndex], items[secondIndex]];
}

function isPreset(value: string): value is ArenaPromptPreset {
  return PRESETS.includes(value as ArenaPromptPreset);
}

function isMode(value: string): value is ArenaMode {
  return ARENA_MODES.includes(value as ArenaMode);
}

function makeResponseId(prefix: string): string {
  return `${prefix}_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

function toSafeText(text: string | null): string | null {
  if (text == null) return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toRunErrorResponse(
  message: string,
  statusCode: number,
  sessionId: string,
  mode: ArenaMode,
  prompt: string,
  rateLimit: { remaining: number; resetAt: string }
) {
  const response: ArenaRunResponse = {
    status: "error",
    roundId: "",
    sessionId,
    mode,
    prompt,
    responses: [],
    requiresVote: mode !== "direct",
    rateLimit,
    message,
  };
  return NextResponse.json(response, { status: statusCode });
}

function isEligibleModel(model: Model): boolean {
  const provider = getProviderConfig(model.vendorSlug);
  if (!provider) return false;
  return Boolean(process.env[provider.envKey]);
}

export async function POST(request: Request) {
  const rawBody = (await request.json().catch(() => ({}))) as Partial<ArenaRunRequest>;

  const mode = typeof rawBody.mode === "string" && isMode(rawBody.mode) ? rawBody.mode : null;
  if (!mode) {
    return NextResponse.json(
      { status: "error", message: "Invalid mode." },
      { status: 400 }
    );
  }

  const sessionIdRaw = typeof rawBody.sessionId === "string" ? rawBody.sessionId.trim() : "";
  const sessionId = sessionIdRaw || makeResponseId("arena_session");

  const promptRaw = typeof rawBody.prompt === "string" ? rawBody.prompt : "";
  const prompt = normalizePrompt(promptRaw);

  if (!prompt) {
    return toRunErrorResponse(
      "Prompt is required.",
      400,
      sessionId,
      mode,
      "",
      { remaining: 0, resetAt: new Date().toISOString() }
    );
  }

  if (prompt.length > ARENA_MAX_PROMPT_LENGTH) {
    return toRunErrorResponse(
      `Prompt is too long (max ${ARENA_MAX_PROMPT_LENGTH} characters).`,
      400,
      sessionId,
      mode,
      prompt,
      { remaining: 0, resetAt: new Date().toISOString() }
    );
  }

  const preset =
    typeof rawBody.preset === "string" && isPreset(rawBody.preset)
      ? rawBody.preset
      : "default";

  const user = await getOptionalUser(request);
  const ipHash = getIpHash(request);

  const ipWindow = await getRateLimitWindow("ipHash", ipHash);
  const userWindow = user ? await getRateLimitWindow("userId", user.uid) : null;
  const rateLimit = toRateLimitResult(ipWindow, userWindow);

  if (!rateLimit.allowed) {
    return toRunErrorResponse(
      "Rate limit reached. Please try again later.",
      429,
      sessionId,
      mode,
      prompt,
      { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
    );
  }

  const createdAt = new Date().toISOString();
  const country = request.headers.get("cf-ipcountry") ?? "unknown";
  const region = request.headers.get("x-vercel-ip-country-region") ?? "unknown";

  const allModels = await getModels({ active: true });
  const eligibleModels = allModels.filter(isEligibleModel);
  const eligibleBySlug = new Map(eligibleModels.map((model) => [model.slug, model]));

  let selectedA: Model | null = null;
  let selectedB: Model | null = null;
  let selectedDirect: Model | null = null;

  if (mode === "battle") {
    if (eligibleModels.length < 2) {
      return toRunErrorResponse(
        "Not enough eligible models are configured for Battle Mode.",
        400,
        sessionId,
        mode,
        prompt,
        { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
      );
    }
    [selectedA, selectedB] = randomPair(eligibleModels);
  }

  if (mode === "side_by_side") {
    const leftModelSlug = typeof rawBody.leftModelSlug === "string" ? rawBody.leftModelSlug.trim() : "";
    const rightModelSlug = typeof rawBody.rightModelSlug === "string" ? rawBody.rightModelSlug.trim() : "";

    if (!leftModelSlug || !rightModelSlug) {
      return toRunErrorResponse(
        "Select both models for Side by Side mode.",
        400,
        sessionId,
        mode,
        prompt,
        { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
      );
    }

    if (leftModelSlug === rightModelSlug) {
      return toRunErrorResponse(
        "Select two different models.",
        400,
        sessionId,
        mode,
        prompt,
        { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
      );
    }

    selectedA = eligibleBySlug.get(leftModelSlug) ?? null;
    selectedB = eligibleBySlug.get(rightModelSlug) ?? null;

    if (!selectedA || !selectedB) {
      return toRunErrorResponse(
        "One or both selected models are unavailable for this benchmark.",
        400,
        sessionId,
        mode,
        prompt,
        { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
      );
    }
  }

  if (mode === "direct") {
    const directModelSlug =
      typeof rawBody.directModelSlug === "string" ? rawBody.directModelSlug.trim() : "";

    if (!directModelSlug) {
      return toRunErrorResponse(
        "Select a model for Direct mode.",
        400,
        sessionId,
        mode,
        prompt,
        { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
      );
    }

    selectedDirect = eligibleBySlug.get(directModelSlug) ?? null;
    if (!selectedDirect) {
      return toRunErrorResponse(
        "The selected direct model is unavailable for this benchmark.",
        400,
        sessionId,
        mode,
        prompt,
        { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
      );
    }
  }

  const roundId = makeResponseId("arena_round");
  const composedPrompt = buildPrompt(preset, prompt);

  const persistRun = async (input: {
    slot: "A" | "B" | "direct";
    model: Model;
    latencyMs: number | null;
    text: string | null;
    error: string | null;
  }) => {
    await adminDb.collection(COLL.speedArenaRuns).add({
      roundId,
      sessionId,
      mode,
      slot: input.slot,
      modelId: input.model.id,
      modelSlug: input.model.slug,
      modelName: input.model.canonicalName,
      vendorSlug: input.model.vendorSlug,
      vendorName: input.model.vendorName,
      prompt,
      preset,
      latencyMs: input.latencyMs,
      text: input.text,
      textLength: input.text?.length ?? 0,
      success: input.text != null && input.error == null,
      error: input.error,
      ipHash,
      userId: user?.uid ?? null,
      country,
      region,
      createdAt,
    });
  };

  try {
    if (mode === "direct" && selectedDirect) {
      const directProbe = await runProviderResponseCheck({
        vendorSlug: selectedDirect.vendorSlug,
        modelSlug: selectedDirect.slug,
        prompt: composedPrompt,
        maxOutputTokens: ARENA_MAX_OUTPUT_TOKENS,
      });

      const directText = toSafeText(directProbe.text);
      const directError = directText ? null : directProbe.error ?? "No response generated.";

      await Promise.all([
        persistRun({
          slot: "direct",
          model: selectedDirect,
          latencyMs: directProbe.latencyMs,
          text: directText,
          error: directError,
        }),
        adminDb.collection(COLL.speedArenaRounds).doc(roundId).set({
          id: roundId,
          roundId,
          sessionId,
          mode,
          prompt,
          preset,
          requiresVote: false,
          status: directText ? "ok" : "error",
          directModel: {
            modelId: selectedDirect.id,
            modelSlug: selectedDirect.slug,
            modelName: selectedDirect.canonicalName,
            vendorSlug: selectedDirect.vendorSlug,
            vendorName: selectedDirect.vendorName,
          },
          ipHash,
          userId: user?.uid ?? null,
          country,
          region,
          createdAt,
        }),
      ]);

      const response: ArenaRunResponse = {
        status: directText ? "ok" : "error",
        roundId,
        sessionId,
        mode,
        prompt,
        responses: [],
        directResponse: {
          text: directText,
          latencyMs: directProbe.latencyMs,
          modelSlug: selectedDirect.slug,
          modelName: selectedDirect.canonicalName,
          vendorName: selectedDirect.vendorName,
          error: directError,
        },
        requiresVote: false,
        rateLimit: {
          remaining: Math.max(0, rateLimit.remaining - 1),
          resetAt: rateLimit.resetAt,
        },
        message: directText ? undefined : "The model did not return a usable response.",
      };

      return NextResponse.json(response);
    }

    if (!selectedA || !selectedB) {
      return toRunErrorResponse(
        "Model selection failed for comparison mode.",
        500,
        sessionId,
        mode,
        prompt,
        { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
      );
    }

    const [probeA, probeB] = await Promise.all([
      runProviderResponseCheck({
        vendorSlug: selectedA.vendorSlug,
        modelSlug: selectedA.slug,
        prompt: composedPrompt,
        maxOutputTokens: ARENA_MAX_OUTPUT_TOKENS,
      }),
      runProviderResponseCheck({
        vendorSlug: selectedB.vendorSlug,
        modelSlug: selectedB.slug,
        prompt: composedPrompt,
        maxOutputTokens: ARENA_MAX_OUTPUT_TOKENS,
      }),
    ]);

    const textA = toSafeText(probeA.text);
    const textB = toSafeText(probeB.text);
    const errorA = textA ? null : probeA.error ?? "No response generated.";
    const errorB = textB ? null : probeB.error ?? "No response generated.";

    const responses: ArenaRunResponseSlot[] = [
      {
        slot: "A",
        text: textA,
        latencyMs: probeA.latencyMs,
        error: errorA,
      },
      {
        slot: "B",
        text: textB,
        latencyMs: probeB.latencyMs,
        error: errorB,
      },
    ];

    const successA = Boolean(textA && !errorA);
    const successB = Boolean(textB && !errorB);

    const status: ArenaRunResponse["status"] =
      successA && successB ? "ok" : successA || successB ? "partial" : "error";

    await Promise.all([
      persistRun({
        slot: "A",
        model: selectedA,
        latencyMs: probeA.latencyMs,
        text: textA,
        error: errorA,
      }),
      persistRun({
        slot: "B",
        model: selectedB,
        latencyMs: probeB.latencyMs,
        text: textB,
        error: errorB,
      }),
      adminDb.collection(COLL.speedArenaRounds).doc(roundId).set({
        id: roundId,
        roundId,
        sessionId,
        mode,
        prompt,
        preset,
        requiresVote: true,
        status,
        pair: {
          A: {
            modelId: selectedA.id,
            modelSlug: selectedA.slug,
            modelName: selectedA.canonicalName,
            vendorSlug: selectedA.vendorSlug,
            vendorName: selectedA.vendorName,
          },
          B: {
            modelId: selectedB.id,
            modelSlug: selectedB.slug,
            modelName: selectedB.canonicalName,
            vendorSlug: selectedB.vendorSlug,
            vendorName: selectedB.vendorName,
          },
        },
        ipHash,
        userId: user?.uid ?? null,
        country,
        region,
        createdAt,
      }),
    ]);

    const response: ArenaRunResponse = {
      status,
      roundId,
      sessionId,
      mode,
      prompt,
      responses,
      requiresVote: true,
      rateLimit: {
        remaining: Math.max(0, rateLimit.remaining - 1),
        resetAt: rateLimit.resetAt,
      },
      message:
        status === "partial"
          ? "One side returned a partial result. You can still vote based on available output."
          : status === "error"
            ? "Both model responses failed for this round."
            : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("POST /api/speed-tests/arena/run error:", error);
    return toRunErrorResponse(
      "Failed to run arena benchmark.",
      500,
      sessionId,
      mode,
      prompt,
      { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt }
    );
  }
}
