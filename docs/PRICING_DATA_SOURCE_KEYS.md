# Pricing Data Source Keys

This document lists the keys used (or optionally recommended) for automated pricing ingestion.

## Required now

At this stage, no additional key is strictly required to run the base pipeline, because:

- the primary source is OpenRouter models endpoint,
- and the pipeline degrades safely to `partial` when data cannot be refreshed for all models.

## Recommended / optional keys

| Env var | Website |
|---|---|
| `OPENROUTER_API_KEY` | https://openrouter.ai/settings/keys |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| `GOOGLE_API_KEY` | https://aistudio.google.com/apikey |
| `DEEPSEEK_API_KEY` | https://platform.deepseek.com/api_keys |
| `XAI_API_KEY` | https://docs.x.ai/docs/overview |
| `MISTRAL_API_KEY` | https://console.mistral.ai/ |
| `PERPLEXITY_API_KEY` | https://docs.perplexity.ai/guides/getting-started |

## Vendor matrix (current rollout)

| Vendor | Primary source | Fallback | Depends on key | Breakage risk |
|---|---|---|---|---|
| OpenAI | OpenRouter Models API | Preserve last current rows (`isCurrent=true`) when refresh missing | No (recommended: `OPENROUTER_API_KEY`) | Low |
| Anthropic | OpenRouter Models API | Preserve last current rows | No (recommended: `OPENROUTER_API_KEY`) | Low |
| Google | OpenRouter Models API | Preserve last current rows | No (recommended: `OPENROUTER_API_KEY`) | Low |
| xAI | OpenRouter Models API | Preserve last current rows | No (recommended: `OPENROUTER_API_KEY`) | Medium |
| DeepSeek | OpenRouter Models API | Preserve last current rows | No (recommended: `OPENROUTER_API_KEY`) | Medium |
| Mistral | OpenRouter Models API | Preserve last current rows | No (recommended: `OPENROUTER_API_KEY`) | Medium |
| Perplexity | OpenRouter Models API | Preserve last current rows | No (recommended: `OPENROUTER_API_KEY`) | Medium |
| Meta (open source) | OpenRouter reference pricing (decision for this project) | Preserve last current rows | No (recommended: `OPENROUTER_API_KEY`) | Medium |

## Notes

- `OPENROUTER_API_KEY` is strongly recommended for reliability, higher limits, and better confidence classification.
- If a source fetch fails, the pipeline records `partial`/`failed` in `dataSnapshots` and does not purge current pricing for unaffected models.
- This avoids silent empty states while keeping historical pricing continuity.
