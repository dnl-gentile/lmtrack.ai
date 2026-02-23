# lmtrack.ai

Track AI model latency with repeatable benchmark tests.

## What changed in this fork

- Rebranded from `lmmarket.ai`/`Market` to `lmtrack.ai`/`Track`.
- Firebase project switched to `track-ai-amt`.
- `/compare` now runs authenticated speed tests (short/medium/long prompt battery).
- New speed APIs:
  - `POST /api/speed-tests/run`
  - `GET /api/speed-tests/records`
- Pricing page now includes a global **Speed Records** table.

## Quick start

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Ensure Firebase Admin credentials are available locally:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/Users/dnl_gentile/Downloads/track-ai-amt-firebase-adminsdk-fbsvc-7d2ba5ddc1.json
```

3. Install and run:

```bash
npm install
npm run dev
```

## Required provider keys for speed tests

Set one or more in `.env.local`:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `DEEPSEEK_API_KEY`
- `XAI_API_KEY`
- `MISTRAL_API_KEY`
- `PERPLEXITY_API_KEY`

Missing provider keys are handled gracefully: those models are skipped during benchmark runs.
