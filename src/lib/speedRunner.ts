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

async function fetchOpenAiCompat(
  baseUrl: string,
  apiKey: string,
  input: ProviderCallInput,
  signal?: AbortSignal
): Promise<ProviderCallResult> {
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
      error: `HTTP ${response.status}: ${body.slice(0, 200)}`,
    };
  }

  return { latencyMs: performance.now() - startedAt, error: null };
}

async function fetchAnthropic(
  apiKey: string,
  input: ProviderCallInput,
  signal?: AbortSignal
): Promise<ProviderCallResult> {
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
      error: `HTTP ${response.status}: ${body.slice(0, 200)}`,
    };
  }

  return { latencyMs: performance.now() - startedAt, error: null };
}

async function fetchGoogle(
  apiKey: string,
  input: ProviderCallInput,
  signal?: AbortSignal
): Promise<ProviderCallResult> {
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
      error: `HTTP ${response.status}: ${body.slice(0, 200)}`,
    };
  }

  return { latencyMs: performance.now() - startedAt, error: null };
}

export async function runProviderLatencyCheck(
  input: ProviderCallInput,
  abortSignal?: AbortSignal
): Promise<ProviderCallResult> {
  const provider = getProviderConfig(input.vendorSlug);
  if (!provider) {
    return { latencyMs: null, error: `Unsupported provider: ${input.vendorSlug}` };
  }

  const apiKey = process.env[provider.envKey];
  if (!apiKey) {
    return { latencyMs: null, error: `Missing API key: ${provider.envKey}` };
  }

  const timeoutController = withTimeout(abortSignal);

  try {
    if (provider.endpoint === "openai_compat") {
      return await fetchOpenAiCompat(provider.baseUrl!, apiKey, input, timeoutController.signal);
    }

    if (provider.endpoint === "anthropic") {
      return await fetchAnthropic(apiKey, input, timeoutController.signal);
    }

    return await fetchGoogle(apiKey, input, timeoutController.signal);
  } catch (error) {
    if (timeoutController.signal.aborted) {
      return { latencyMs: null, error: "Request timed out" };
    }
    const message = error instanceof Error ? error.message : "Unknown provider error";
    return { latencyMs: null, error: message };
  } finally {
    timeoutController.abort();
  }
}
