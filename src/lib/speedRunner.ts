import { getProviderConfig, resolveModelProviderName } from "./speed";

interface ProviderCallInput {
  vendorSlug: string;
  modelSlug: string;
  prompt: string;
  maxOutputTokens: number;
}

interface ProviderCallResult {
  latencyMs: number | null;
  error: string | null;
}

export interface ProviderResponseResult extends ProviderCallResult {
  text: string | null;
}

const REQUEST_TIMEOUT_MS = 60_000;

function withTimeout(signal?: AbortSignal): AbortController {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  controller.signal.addEventListener(
    "abort",
    () => {
      clearTimeout(timeout);
    },
    { once: true }
  );

  return controller;
}

function normalizeText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const combined = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          return normalizeText((item as { text?: unknown }).text) ?? "";
        }
        return "";
      })
      .join("\n")
      .trim();
    return combined.length > 0 ? combined : null;
  }

  return null;
}

function parseOpenAiCompatText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const maybeChoices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(maybeChoices) || maybeChoices.length === 0) return null;

  const first = maybeChoices[0] as {
    text?: unknown;
    message?: { content?: unknown };
  };

  return normalizeText(first.message?.content ?? first.text ?? null);
}

function parseAnthropicText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const content = (payload as { content?: unknown }).content;
  if (!Array.isArray(content)) return null;

  const text = content
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const entry = block as { type?: unknown; text?: unknown };
      if (entry.type === "text") return normalizeText(entry.text) ?? "";
      return "";
    })
    .join("\n")
    .trim();

  return text.length > 0 ? text : null;
}

function parseGoogleText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const parts = (candidates[0] as { content?: { parts?: unknown } }).content?.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      return normalizeText((part as { text?: unknown }).text) ?? "";
    })
    .join("\n")
    .trim();

  return text.length > 0 ? text : null;
}

async function fetchOpenAiCompatResponse(
  baseUrl: string,
  apiKey: string,
  input: ProviderCallInput,
  signal?: AbortSignal
): Promise<ProviderResponseResult> {
  const startedAt = performance.now();
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: resolveModelProviderName(input.vendorSlug, input.modelSlug),
      messages: [{ role: "user", content: input.prompt }],
      max_tokens: input.maxOutputTokens,
      temperature: 0,
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      latencyMs: null,
      text: null,
      error: `HTTP ${response.status}: ${body.slice(0, 200)}`,
    };
  }

  const payload = await response.json().catch(() => null);
  const text = parseOpenAiCompatText(payload);
  return {
    latencyMs: performance.now() - startedAt,
    text,
    error: text ? null : "No response text from provider.",
  };
}

async function fetchAnthropicResponse(
  apiKey: string,
  input: ProviderCallInput,
  signal?: AbortSignal
): Promise<ProviderResponseResult> {
  const startedAt = performance.now();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: resolveModelProviderName(input.vendorSlug, input.modelSlug),
      max_tokens: input.maxOutputTokens,
      temperature: 0,
      messages: [{ role: "user", content: input.prompt }],
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      latencyMs: null,
      text: null,
      error: `HTTP ${response.status}: ${body.slice(0, 200)}`,
    };
  }

  const payload = await response.json().catch(() => null);
  const text = parseAnthropicText(payload);
  return {
    latencyMs: performance.now() - startedAt,
    text,
    error: text ? null : "No response text from provider.",
  };
}

async function fetchGoogleResponse(
  apiKey: string,
  input: ProviderCallInput,
  signal?: AbortSignal
): Promise<ProviderResponseResult> {
  const startedAt = performance.now();
  const modelName = resolveModelProviderName(input.vendorSlug, input.modelSlug);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: input.prompt }] }],
      generationConfig: {
        maxOutputTokens: input.maxOutputTokens,
        temperature: 0,
      },
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      latencyMs: null,
      text: null,
      error: `HTTP ${response.status}: ${body.slice(0, 200)}`,
    };
  }

  const payload = await response.json().catch(() => null);
  const text = parseGoogleText(payload);
  return {
    latencyMs: performance.now() - startedAt,
    text,
    error: text ? null : "No response text from provider.",
  };
}

export async function runProviderResponseCheck(
  input: ProviderCallInput,
  abortSignal?: AbortSignal
): Promise<ProviderResponseResult> {
  const provider = getProviderConfig(input.vendorSlug);
  if (!provider) {
    return { latencyMs: null, text: null, error: `Unsupported provider: ${input.vendorSlug}` };
  }

  const apiKey = process.env[provider.envKey];
  if (!apiKey) {
    return { latencyMs: null, text: null, error: `Missing API key: ${provider.envKey}` };
  }

  const timeoutController = withTimeout(abortSignal);

  try {
    if (provider.endpoint === "openai_compat") {
      return await fetchOpenAiCompatResponse(
        provider.baseUrl!,
        apiKey,
        input,
        timeoutController.signal
      );
    }

    if (provider.endpoint === "anthropic") {
      return await fetchAnthropicResponse(apiKey, input, timeoutController.signal);
    }

    return await fetchGoogleResponse(apiKey, input, timeoutController.signal);
  } catch (error) {
    if (timeoutController.signal.aborted) {
      return { latencyMs: null, text: null, error: "Request timed out" };
    }
    const message = error instanceof Error ? error.message : "Unknown provider error";
    return { latencyMs: null, text: null, error: message };
  } finally {
    timeoutController.abort();
  }
}

export async function runProviderLatencyCheck(
  input: ProviderCallInput,
  abortSignal?: AbortSignal
): Promise<ProviderCallResult> {
  const result = await runProviderResponseCheck(input, abortSignal);
  if (result.latencyMs != null) {
    return { latencyMs: result.latencyMs, error: null };
  }
  return { latencyMs: null, error: result.error };
}
