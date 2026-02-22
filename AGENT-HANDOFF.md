# market.ai - Agent Handoff Document

## Project Status After Wave 1 (Agent A Complete)

### What's Done
- Next.js 16 project initialized with App Router, TypeScript, Tailwind CSS v4
- Dark theme design system configured in `globals.css` with CSS variables
- Fonts: Inter (sans) + Playfair Display (serif) via next/font/google
- Root layout with metadata, font loading, dark theme
- `src/lib/constants.ts` - Domains, vendors, optimization modes, all config
- `src/lib/types.ts` - All TypeScript interfaces (40+ types)
- `src/lib/utils.ts` - Formatting helpers (currency, numbers, relative time, etc.)
- `.env.example` with Firebase config keys
- `.gitignore` configured for Next.js + Firebase
- All directory structure pre-created (components, lib, hooks, data, functions, etc.)
- `market-ai-logo.png` copied to `public/`
- Build passes successfully

### What's NOT Done Yet
- Firebase setup (Agent B)
- Seed data files (Agent C)
- All Cloud Functions (Agent D)
- All UI components (Agents E, F, G, H, I)
- All API routes
- All page implementations
- QA and deployment

---

## How to Use This Document

Each agent section below contains:
1. **Tool**: Which AI coding tool to use (Cursor, Codex, or Antigravity)
2. **Branch**: Git branch to work on
3. **Prompt**: The full prompt to paste into the AI tool
4. **Files Created**: What the agent should produce
5. **Verification**: How to check the work

### Execution Order

```
REMAINING WAVE 1 (run in parallel):
  ├── Agent B: Firebase Setup             [Cursor]
  └── Agent C: Seed Data Files            [Codex]

WAVE 2 (after Wave 1):
  ├── Agent D: Firebase Functions         [Cursor]
  ├── Agent E: Shared UI Components       [Codex]
  └── Agent F: Layout Components          [Antigravity]

WAVE 3 (after Wave 2):
  ├── Agent G: Leaderboard Feature        [Cursor]
  └── Agent H: Compare + Pricing          [Antigravity]

WAVE 4 (after Wave 3):
  ├── Agent I: Model Detail + About       [Codex]
  └── Agent J: Reviewer + QA + Deploy     [Cursor]
```

---

## CRITICAL CONTEXT FOR ALL AGENTS

### Design System (use these exact values)
```css
--bg: #0b0c0f
--panel: #111318
--panel2: #0e1014
--text: #e8eefc
--muted: #a6adbb
--line: rgba(255,255,255,0.08)
--good: rgba(80,230,140,0.15)
--mid: rgba(255,200,80,0.15)
--bad: rgba(255,90,120,0.15)
--chip-active-bg: rgba(155,211,255,0.12)
--chip-active-border: rgba(155,211,255,0.35)
```

### Tailwind v4 Color Usage
Colors are mapped in `globals.css` via `@theme inline`. Use them as:
- `bg-background`, `bg-panel`, `bg-panel2`
- `text-primary`, `text-muted`
- `border-line`
- `bg-good`, `bg-mid`, `bg-bad`
- `bg-chip`, `bg-chip-active-bg`, `border-chip-active-border`

### Existing Files to Reference
- `src/lib/constants.ts` - All domain keys, vendor slugs, optimization modes
- `src/lib/types.ts` - All interfaces (Model, Vendor, ArenaScore, Pricing, ComputedMetrics, LeaderboardEntry, CompareModel, FilterState, etc.)
- `src/lib/utils.ts` - formatCurrency, formatNumber, formatRelativeTime, formatElo, percentileRank, computeBlendedPrice, valueScoreColor, debounce
- `src/app/globals.css` - All CSS variables and Tailwind theme

### Firestore Collections (data model for ALL agents)
```
vendors/{id}: slug, name, logoUrl, websiteUrl, timestamps
models/{id}: vendorId, vendorSlug, vendorName, slug, canonicalName, family, modality, contextWindow, maxOutput, releaseDate, isOpenSource, isActive, aliases[], timestamps
arenaScores/{id}: modelId, modelSlug, domain, eloScore, eloCiLower, eloCiUpper, rank, votes, snapshotDate, createdAt
pricing/{id}: modelId, modelSlug, pricingType, inputPrice1m, outputPrice1m, cachedInput1m, batchInput1m, batchOutput1m, imagePrice, monthlyPriceUsd, planName, usageLimits, sourceUrl, snapshotDate, isCurrent, createdAt
computedMetrics/{id}: modelId, modelSlug, domain, eloScore, avgPrice1m, blendedPrice1m, eloPerDollar, dollarPerElo, valueScore, valueRank, qualityPercentile, pricePercentile, valuePercentile, snapshotDate, computedAt
dataSnapshots/{id}: source, snapshotDate, recordsCount, status, errorMessage, startedAt, completedAt
```

---

## AGENT B: Firebase Setup

**Tool**: Cursor (complex, multi-file config)
**Branch**: `feat/firebase-setup`

### Prompt

```
I'm setting up Firebase for an existing Next.js 16 project called market.ai. The project is already initialized with Next.js, TypeScript, and Tailwind CSS.

I need the FULL Firebase stack: Firestore, Cloud Functions (TypeScript), Firebase Auth, Firebase Hosting (with SSR for Next.js), Firebase Storage, and Emulators.

Please create these files:

1. firebase.json - Configure hosting for Next.js SSR. Use the "frameworks" experiment or Cloud Functions rewrite for SSR. Set up Firestore, Storage, and Functions.

2. .firebaserc - Set project ID placeholder.

3. firestore.rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

4. firestore.indexes.json - Create composite indexes:
- arenaScores: (domain ASC, eloScore DESC)
- arenaScores: (modelId ASC, domain ASC, snapshotDate DESC)
- pricing: (pricingType ASC, isCurrent ASC, modelId ASC)
- computedMetrics: (domain ASC, valueScore DESC)
- computedMetrics: (domain ASC, eloPerDollar DESC)

5. src/lib/firebase.ts - Firebase client SDK init:
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

6. src/lib/firebaseAdmin.ts - Firebase Admin SDK init:
```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
  } else {
    initializeApp(); // Uses default credentials (emulator or GCP)
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
```

7. functions/package.json:
```json
{
  "name": "market-ai-functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions"
  },
  "engines": { "node": "20" },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.0.0",
    "cheerio": "^1.0.0",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node-fetch": "^2.6.0"
  }
}
```

8. functions/tsconfig.json:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2020",
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "compileOnSave": true,
  "include": ["src"]
}
```

9. functions/src/index.ts - Empty exports placeholder:
```typescript
// Cloud Functions will be added by Agent D
// exports.scrapeArena = ...
// exports.updatePricing = ...
// exports.recomputeMetrics = ...
// exports.seedDatabase = ...
```

Make sure firebase.json is configured for the Next.js framework experiment if available, otherwise use standard hosting with Cloud Functions rewrites.
```

### Files Created
- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `firestore.indexes.json`
- `src/lib/firebase.ts`
- `src/lib/firebaseAdmin.ts`
- `functions/package.json`
- `functions/tsconfig.json`
- `functions/src/index.ts`

### Verification
- `cd functions && npm install && npm run build` should pass
- `firebase emulators:start` should launch Firestore + Functions emulators

---

## AGENT C: Seed Data Files

**Tool**: Codex (good at generating structured data)
**Branch**: `feat/seed-data`

### Prompt

```
Create data files for market.ai, an AI model cost-efficiency comparison site. Create these 3 JSON files plus 8 SVG logo placeholders.

1. data/models-seed.json - Array of AI model objects. Create 30+ entries using this exact schema:
{
  "vendorSlug": "openai",
  "vendorName": "OpenAI",
  "slug": "gpt-4o",
  "canonicalName": "GPT-4o",
  "family": "GPT-4",
  "modality": "multimodal",
  "contextWindow": 128000,
  "maxOutput": 16384,
  "releaseDate": "2024-05-13",
  "isOpenSource": false,
  "isActive": true,
  "aliases": ["gpt-4o-2024-11-20", "gpt-4o-2025-03-27", "gpt-4o-latest"]
}

Include ALL these models (look up accurate specs for each):
- OpenAI: GPT-4o (128K ctx, multimodal), GPT-4o-mini (128K, multimodal), o3 (200K, text), o3-mini (200K, text), o1 (200K, text), o1-mini (128K, text), GPT-4 Turbo (128K, multimodal), GPT-4.5 (128K, multimodal)
- Anthropic: Claude Opus 4.6 (200K, multimodal), Claude Sonnet 4.5 (200K, multimodal), Claude Haiku 4.5 (200K, multimodal), Claude Opus 4.5 (200K, multimodal)
- Google: Gemini 2.0 Flash (1M, multimodal), Gemini 2.0 Flash-Lite (1M, text), Gemini 2.5 Pro (1M, multimodal), Gemini 1.5 Pro (2M, multimodal)
- DeepSeek: DeepSeek V3 (128K, text), DeepSeek R1 (128K, text)
- xAI: Grok 4 (2M, multimodal), Grok 4.1 Fast (2M, multimodal), Grok 3 (128K, text)
- Mistral: Mistral Large (128K, text), Mistral Small (128K, text), Mistral Medium 3 (128K, text), Ministral 8B (128K, text)
- Meta: Llama 4 Maverick (1M, text, open source), Llama 3.3 70B (128K, text, open source)
- Perplexity: Sonar (128K, text), Sonar Pro (200K, text)

2. data/pricing-seed.json - Array of pricing objects:
{
  "modelSlug": "gpt-4o",
  "pricingType": "api",
  "inputPrice1m": 5.00,
  "outputPrice1m": 15.00,
  "cachedInput1m": 2.50,
  "batchInput1m": 2.50,
  "batchOutput1m": 7.50,
  "sourceUrl": "https://openai.com/api/pricing",
  "snapshotDate": "2026-02-21"
}

Use these EXACT prices (USD per 1M tokens):
- GPT-4o: in=$5.00, out=$15.00
- GPT-4o-mini: in=$0.15, out=$0.60
- o3: in=$2.00, out=$8.00
- o3-mini: in=$1.10, out=$4.40
- o1: in=$15.00, out=$60.00
- o1-mini: in=$1.10, out=$4.40
- GPT-4 Turbo: in=$10.00, out=$30.00
- GPT-4.5: in=$75.00, out=$150.00
- Claude Opus 4.6: in=$5.00, out=$25.00
- Claude Sonnet 4.5: in=$3.00, out=$15.00
- Claude Haiku 4.5: in=$0.80, out=$4.00
- Claude Opus 4.5: in=$15.00, out=$75.00
- Gemini 2.0 Flash: in=$0.10, out=$0.40
- Gemini 2.0 Flash-Lite: in=$0.075, out=$0.30
- Gemini 2.5 Pro: in=$1.25, out=$10.00
- Gemini 1.5 Pro: in=$1.25, out=$5.00
- DeepSeek V3: in=$0.14, out=$0.28
- DeepSeek R1: in=$0.55, out=$2.19
- Grok 4: in=$3.00, out=$15.00
- Grok 4.1 Fast: in=$0.20, out=$0.50
- Grok 3: in=$3.00, out=$15.00
- Mistral Large: in=$2.00, out=$6.00
- Mistral Small: in=$1.00, out=$3.00
- Mistral Medium 3: in=$0.40, out=$2.00
- Ministral 8B: in=$0.10, out=$0.10
- Llama 4 Maverick: in=$0.27, out=$0.85
- Llama 3.3 70B: in=$0.18, out=$0.18
- Sonar: in=$1.00, out=$1.00
- Sonar Pro: in=$3.00, out=$15.00

Also add consumer plan pricing entries (pricingType: "consumer") for:
- ChatGPT Plus (modelSlug "gpt-4o"): monthlyPriceUsd=20, planName="Plus"
- ChatGPT Pro (modelSlug "o3"): monthlyPriceUsd=200, planName="Pro"
- Claude Pro (modelSlug "claude-opus-4-6"): monthlyPriceUsd=20, planName="Pro"
- Claude Max (modelSlug "claude-opus-4-6"): monthlyPriceUsd=100, planName="Max"
- Gemini Advanced (modelSlug "gemini-2-5-pro"): monthlyPriceUsd=20, planName="Advanced"
- Perplexity Pro (modelSlug "sonar-pro"): monthlyPriceUsd=20, planName="Pro"

3. data/aliases.json - Object mapping Arena leaderboard names to model slugs. Include 3-5 aliases per model:
{
  "gpt-4o-2024-11-20": "gpt-4o",
  "gpt-4o-2025-03-27": "gpt-4o",
  "gpt-4o-latest": "gpt-4o",
  "chatgpt-4o-latest": "gpt-4o",
  "gpt-4o-mini-2024-07-18": "gpt-4o-mini",
  "o3-2025-04-16": "o3",
  "o3-mini-2025-01-31": "o3-mini",
  "o1-2024-12-17": "o1",
  "o1-preview-2024-09-12": "o1",
  "claude-opus-4-6": "claude-opus-4-6",
  "claude-opus-4-6-thinking": "claude-opus-4-6",
  "claude-sonnet-4-5-20250929": "claude-sonnet-4-5",
  "claude-3-5-sonnet-20241022": "claude-sonnet-4-5",
  "claude-haiku-4-5-20251001": "claude-haiku-4-5",
  "claude-3-5-haiku-20241022": "claude-haiku-4-5",
  "gemini-2.0-flash-001": "gemini-2-0-flash",
  "gemini-2.0-flash-exp": "gemini-2-0-flash",
  "gemini-2.5-pro-preview": "gemini-2-5-pro",
  "gemini-1.5-pro-002": "gemini-1-5-pro",
  "deepseek-v3-0324": "deepseek-v3",
  "deepseek-r1-0120": "deepseek-r1",
  "grok-4.1": "grok-4-1-fast",
  "grok-4.1-thinking": "grok-4",
  "grok-3-beta": "grok-3",
  "mistral-large-2411": "mistral-large",
  "mistral-small-2503": "mistral-small",
  "llama-4-maverick-400b": "llama-4-maverick",
  "meta-llama-3.3-70b": "llama-3-3-70b"
}

4. Create 8 simple SVG logo files in public/vendor-logos/ (one per vendor):
Each should be a 32x32 SVG with a colored circle and the vendor's first letter centered. Use these colors:
- openai.svg: #10a37f (green), letter "O"
- anthropic.svg: #d4a574 (tan), letter "A"
- google.svg: #4285f4 (blue), letter "G"
- deepseek.svg: #4d6bfe (purple-blue), letter "D"
- xai.svg: #ffffff on dark bg, letter "X"
- mistral.svg: #ff7000 (orange), letter "M"
- meta.svg: #0081fb (blue), letter "M"
- perplexity.svg: #20b2aa (teal), letter "P"

SVG template:
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="16" fill="COLOR"/>
  <text x="16" y="22" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">LETTER</text>
</svg>
```

### Files Created
- `data/models-seed.json`
- `data/pricing-seed.json`
- `data/aliases.json`
- `public/vendor-logos/openai.svg` (and 7 more)

### Verification
- Each JSON file should be valid JSON (run `node -e "require('./data/models-seed.json')"`)
- models-seed.json should have 30+ entries
- pricing-seed.json should have 29+ API entries + 6 consumer entries
- All SVG files should render in a browser

---

## AGENT D: Firebase Functions - Data Layer

**Tool**: Cursor (complex logic, scraping, scoring algorithms)
**Branch**: `feat/firebase-functions`

### Prompt

```
Build Firebase Cloud Functions for market.ai in the functions/src/ directory. The project uses Firestore with collections: vendors, models, arenaScores, pricing, computedMetrics, dataSnapshots.

Reference the existing types in src/lib/types.ts and constants in src/lib/constants.ts (they define Model, ArenaScore, Pricing, ComputedMetrics, DomainKey, etc.).

Create these files:

1. functions/src/ingestion/arenaScraper.ts:
- Export: scrapeArenaLeaderboard(domain: string): Promise<RawArenaEntry[]>
- Fetch https://arena.ai/leaderboard (+ /code, /vision for those domains)
- Use cheerio to parse the HTML table
- Extract: modelName, organization, eloScore (number), eloCi (lower/upper), votes (number), rank (number)
- If cheerio fails (JS-rendered page), return empty array and log warning
- Handle network errors gracefully

2. functions/src/ingestion/arenaParser.ts:
- Export: parseArenaTable(html: string): RawArenaEntry[]
- Parse HTML table rows using cheerio
- Handle missing columns, malformed numbers
- Return typed array

3. functions/src/ingestion/canonicalize.ts:
- Export: matchArenaName(arenaName: string, allModels: {slug: string, aliases: string[]}[]): string | null
- Matching strategy (in order):
  a) Exact match against any model's aliases array
  b) Lowercase both and compare
  c) Strip date suffixes (-YYYYMMDD, -YYYY-MM-DD) and compare
  d) Strip version suffixes (-001, -latest, -preview, -exp, -beta) and compare
  e) Return null if no match

4. functions/src/scoring/valueScore.ts:
- Export: computeBlendedPrice(inputPrice: number, outputPrice: number): number
  Formula: input * 0.3 + output * 0.7
- Export: computeEloPerDollar(elo: number, blendedPrice: number): number
  Formula: elo / blendedPrice
- Export: computeValueScores(entries: {modelId: string, modelSlug: string, domain: string, elo: number, inputPrice: number, outputPrice: number}[]): ComputedMetricInput[]
  For each entry: compute blendedPrice, eloPerDollar
  Then normalize eloPerDollar across all entries to 0-100 percentile scale as valueScore
  Also compute valueRank (1 = best value)

5. functions/src/scoring/normalize.ts:
- Export: percentileRank(value: number, allValues: number[]): number (0-100)
- Export: minMaxNormalize(value: number, min: number, max: number): number (0-1)

6. functions/src/seed/seedDatabase.ts:
- Firebase callable function: exports.seedDatabase = functions.https.onCall(async (data, context) => { ... })
- Read JSON from: ../../data/models-seed.json, ../../data/pricing-seed.json
- For each model in seed: create vendor doc if not exists, create model doc with aliases
- For each pricing entry: create pricing doc with isCurrent=true
- After all inserts: compute initial metrics for every model+domain combo that has both arena scores and pricing
- Log result to dataSnapshots collection
- Return { vendorsCreated, modelsCreated, pricingCreated }

7. functions/src/scheduled/scrapeArena.ts:
- Export scheduled function: runs daily at 6 AM UTC
- Scrape all domains: ['overall', 'coding', 'math', 'creative_writing', 'hard_prompts', 'instruction_following', 'vision', 'longer_query']
- For each domain: scrape, canonicalize names, upsert into arenaScores
- Log to dataSnapshots with status and records count

8. functions/src/scheduled/updatePricing.ts:
- Export scheduled function: runs weekly Monday 8 AM UTC
- Phase 1: Just log "Manual pricing mode - no automated updates"
- Phase 2 (TODO comment): Call PricePerToken API to get updated prices

9. functions/src/triggers/recomputeMetrics.ts:
- Firestore triggers: on arenaScores and pricing collection writes
- When a new arenaScore is written: find the model's current pricing, compute metrics, write to computedMetrics
- When pricing changes: find the model's arena scores, recompute metrics for all domains
- Recompute valueRank for all models in the affected domain

10. functions/src/index.ts:
- Import and export all functions from the above files

Use firebase-functions v6 (the latest). Use import syntax. Make sure all async functions handle errors and log appropriately.
```

### Files Created
- `functions/src/ingestion/arenaScraper.ts`
- `functions/src/ingestion/arenaParser.ts`
- `functions/src/ingestion/canonicalize.ts`
- `functions/src/scoring/valueScore.ts`
- `functions/src/scoring/normalize.ts`
- `functions/src/seed/seedDatabase.ts`
- `functions/src/scheduled/scrapeArena.ts`
- `functions/src/scheduled/updatePricing.ts`
- `functions/src/triggers/recomputeMetrics.ts`
- `functions/src/index.ts`

### Verification
- `cd functions && npm install && npm run build` should compile without errors

---

## AGENT E: Shared UI Components

**Tool**: Codex (boilerplate components with clear specs)
**Branch**: `feat/shared-components`

### Prompt

```
Create shared React components for market.ai in src/components/shared/.
Next.js 16, TypeScript, Tailwind CSS v4 (uses @theme inline in globals.css).

Use 'use client' directive for components that use hooks or event handlers.

The project has these Tailwind color tokens available (defined in globals.css @theme inline):
- bg-background, bg-panel, bg-panel2
- text-primary, text-muted
- border-line
- bg-good, bg-mid, bg-bad
- bg-chip, bg-chip-active-bg, border-chip-active-border

Import formatRelativeTime from '@/lib/utils' where needed.

Create these 10 component files:

1. src/components/shared/Badge.tsx:
Props: { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; children: React.ReactNode; size?: 'sm' | 'md' }
- Inline pill shape (inline-flex items-center rounded-full)
- sm: text-[10px] px-2 py-0.5, md: text-xs px-2.5 py-1
- success: bg-good text-emerald-300, warning: bg-mid text-amber-300, error: bg-bad text-red-300, info: bg-blue-500/15 text-blue-300, neutral: bg-white/5 text-muted

2. src/components/shared/Chip.tsx:
'use client'
Props: { label: string; active?: boolean; onClick?: () => void; removable?: boolean; onRemove?: () => void }
- Rounded-full (border-radius: 999px), cursor-pointer, select-none
- Active: bg-chip-active-bg border-chip-active-border text-primary
- Inactive: bg-chip border-line text-muted
- If removable: show X button on the right
- text-xs, px-2.5 py-1.5, border

3. src/components/shared/Pill.tsx:
Props: { children: React.ReactNode; className?: string }
- text-[11px] text-muted border border-line px-2.5 py-1.5 rounded-full bg-black/25

4. src/components/shared/Tooltip.tsx:
'use client'
Props: { content: string; children: React.ReactNode; position?: 'top' | 'bottom' }
- Wrapper div with relative positioning
- On hover: show absolute-positioned tooltip with bg-[#1a1f2e] text-primary text-xs px-3 py-2 rounded-lg shadow-lg
- Default position: top

5. src/components/shared/Skeleton.tsx:
Props: { width?: string; height?: string; className?: string; rows?: number }
- Animated pulse placeholder: animate-pulse bg-white/[0.06] rounded-xl
- If rows > 1: render multiple skeleton blocks with gap-2

6. src/components/shared/VendorLogo.tsx:
Props: { vendor: string; size?: number; showName?: boolean; className?: string }
- Try to render <img src={`/vendor-logos/${vendor}.svg`} />
- Use next/image with width/height from size prop (default 24)
- If showName: add text-sm text-primary next to it
- Wrap in flex items-center gap-2

7. src/components/shared/DataFreshness.tsx:
Props: { lastUpdated: Date | string | null; source?: string }
- Uses formatRelativeTime from @/lib/utils
- Renders: "Updated {relativeTime}" or "{source} data from {date}"
- If > 48 hours stale: show with text-amber-400 and warning indicator
- Styled as a Pill

8. src/components/shared/MissingDataBadge.tsx:
Props: { label?: string }
- Small inline badge: bg-white/[0.04] text-muted/60 text-[10px] px-2 py-0.5 rounded-full
- Default label: "Missing"

9. src/components/shared/EmptyState.tsx:
Props: { title: string; description?: string; icon?: React.ReactNode }
- Centered column: flex flex-col items-center justify-center py-16
- icon at top (if provided), title as text-lg text-primary, description as text-sm text-muted mt-2

10. src/components/shared/SearchInput.tsx:
'use client'
Props: { value: string; onChange: (value: string) => void; placeholder?: string; debounceMs?: number }
- Input with search icon (inline SVG magnifying glass)
- Debounced onChange (default 300ms) using useEffect + setTimeout
- Style: w-full bg-black/25 border border-line rounded-xl px-3 py-2.5 text-primary text-sm outline-none focus:border-chip-active-border transition
- Placeholder text: text-muted
```

### Files Created
- 10 files in `src/components/shared/`

### Verification
- All files should be valid TypeScript
- Imports should reference `@/lib/utils` and `@/components/shared/*` correctly

---

## AGENT F: Layout Components

**Tool**: Antigravity (independent, well-scoped)
**Branch**: `feat/layout-components`

### Prompt

```
Create layout components for market.ai in src/components/layout/.
Next.js 16, TypeScript, Tailwind CSS v4. Dark theme.

Use 'use client' for components using hooks (usePathname, useState).

Available Tailwind tokens: bg-panel, bg-panel2, text-primary, text-muted, border-line, bg-background.

The project logo is at /market-ai-logo.png. Import next/image for it.

Create 4 files:

1. src/components/layout/Sidebar.tsx:
'use client'
Props: { children?: React.ReactNode }
- Fixed 320px width on desktop (hidden on mobile < 1024px: hidden lg:flex)
- h-screen overflow-y-auto
- Background: bg-panel border-r border-line
- Padding: p-3.5, flex flex-col gap-3
- Header: logo image (48x48) + "market.ai" text (text-lg font-bold) + subtitle "AI Model Value Rankings" (text-xs text-muted)
- Nav section with NavLink components for: Leaderboard (/leaderboard), Compare (/compare), Pricing (/pricing), About (/about)
  Use simple inline SVG icons for each nav item (bar chart, columns, dollar sign, info circle)
- Separator: <hr className="border-line my-2" />
- {children} slot for filter content
- Bottom: DataFreshness component (import from @/components/shared/DataFreshness)

2. src/components/layout/TopBar.tsx:
'use client'
Props: { onMenuOpen: () => void }
- Only visible on mobile (lg:hidden)
- Sticky top-0, z-50
- Background: bg-panel/95 backdrop-blur-md border-b border-line
- Flex row: hamburger button (left), "market.ai" text (center), search icon placeholder (right)
- Height: h-14, px-4

3. src/components/layout/NavLink.tsx:
'use client'
Props: { href: string; icon: React.ReactNode; label: string }
- Uses next/link and usePathname from next/navigation
- Active state (pathname starts with href): bg-white/[0.08] text-primary font-medium
- Inactive: text-muted hover:bg-white/[0.04]
- Layout: flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors

4. src/components/layout/MobileMenu.tsx:
'use client'
Props: { isOpen: boolean; onClose: () => void; children: React.ReactNode }
- Overlay: fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
- Panel: fixed left-0 top-0 h-full w-80 bg-panel transform transition-transform
- When isOpen: translate-x-0, otherwise: -translate-x-full
- Close button (X) in top right of panel
- {children} rendered inside the panel
- Click on overlay backdrop closes menu
```

### Files Created
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/NavLink.tsx`
- `src/components/layout/MobileMenu.tsx`

### Verification
- All files should be valid TypeScript with 'use client' directive

---

## AGENT G: Leaderboard Feature

**Tool**: Cursor (most complex feature - data fetching, filtering, sorting, URL sync)
**Branch**: `feat/leaderboard`

### Prompt

```
Build the complete leaderboard feature for market.ai - the core page of the site. Next.js 16, TypeScript, Tailwind CSS v4, Firebase/Firestore.

IMPORTANT: Read the existing files first:
- src/lib/types.ts (all interfaces)
- src/lib/constants.ts (domains, vendors, modes)
- src/lib/utils.ts (formatters)
- src/lib/firebaseAdmin.ts (Firestore admin client)
- src/components/shared/* (Badge, Chip, Pill, VendorLogo, Skeleton, etc.)
- src/components/layout/* (Sidebar, TopBar, etc.)

Build in this order:

PART 1: Firestore Query Helpers (src/lib/queries/)

models.ts:
- getModels(filters?: {vendor?, modality?, active?, search?}): Promise<Model[]>
- getModelBySlug(slug: string): Promise<Model | null>
Uses adminDb from firebaseAdmin.ts

leaderboard.ts:
- getLeaderboard(params: {domain, sort, dir, vendors?, priceMin?, priceMax?, contextMin?, modality?, arenaOnly?, search?, limit?, offset?}): Promise<{entries: LeaderboardEntry[], total: number, freshness: {...}}>
Queries models, joins with latest arenaScores (where snapshotDate = most recent) and latest pricing (where isCurrent=true) and computedMetrics
Sorts by the specified field
Returns typed LeaderboardEntry[] from types.ts

pricing.ts:
- getPricing(filters?: {type?, vendor?, sort?, dir?}): Promise<PricingResponse>
- getPricingByModel(modelId: string): Promise<Pricing[]>

metrics.ts:
- getMetrics(modelId: string, domain?: string): Promise<ComputedMetrics[]>
- getDataFreshness(): Promise<{arenaLastUpdated: string | null, pricingLastUpdated: string | null}>

PART 2: API Routes (src/app/api/)

models/route.ts: GET handler, parses query params, calls getModels
leaderboard/route.ts: GET handler with all filter params, calls getLeaderboard

PART 3: Leaderboard Components (src/components/leaderboard/)

DomainTabs.tsx: Horizontal tab bar for domains. Active tab: bg-white/[0.08] text-primary. Uses Next.js Link to /leaderboard/{domain}. Props: {activeDomain: DomainKey}

SortHeader.tsx: Props {label, field, currentSort, currentDir, onSort}. Clickable th with arrow indicator.

RankBadge.tsx: Props {rank: number}. #1: gold circle, #2: silver, #3: bronze. 4+: plain number text-muted.

ScoreCell.tsx: Props {score: number|null, ci?: string}. Shows "1505 ±8" or MissingDataBadge.

PriceCell.tsx: Props {price: number|null}. Shows "$5.00" via formatCurrency or MissingDataBadge.

ValueScoreBar.tsx: Props {score: number (0-100), showLabel?: boolean}. Horizontal bar, width = score%, color gradient (0-33 red/bg-bad, 34-66 yellow/bg-mid, 67-100 green/bg-good). Number label on right.

LeaderboardRow.tsx: Props {entry: LeaderboardEntry, rank: number}. Full <tr> with all cells. VendorLogo + canonical name in first cell.

LeaderboardTable.tsx: Props {entries: LeaderboardEntry[], sort, dir, onSort}. <table> with sticky glassmorphism header (bg-[rgba(16,20,33,0.95)] backdrop-blur-lg). Maps entries to LeaderboardRow. Shows EmptyState if no entries.

Table columns: # | Model | Elo | Votes | $/1M tok | Value Score | Coding | Math | Creative

PART 4: Filter Components (src/components/filters/)

FilterPanel.tsx: Container wrapping all filters. Section headers ("Domain", "Vendor", "Price", etc.)
DomainFilter.tsx: Chip multi-selector using DOMAINS constant.
VendorFilter.tsx: Checkbox list using VENDORS constant.
PriceFilter.tsx: Dual input fields (min/max, type=number). Label: "Price range ($/1M tokens)".
ContextFilter.tsx: <select> dropdown using CONTEXT_WINDOW_OPTIONS constant.
ModalityFilter.tsx: Chip selector using MODALITIES constant.
ArenaToggle.tsx: Toggle switch. Label: "Only models with Arena data".
OptimizationMode.tsx: Segmented control with 3 buttons from OPTIMIZATION_MODES constant.

PART 5: Hooks (src/hooks/)

useFilters.ts: Syncs FilterState to URL search params via useSearchParams + useRouter. Returns {filters, setFilter, resetFilters}.
useLeaderboard.ts: Uses SWR to fetch /api/leaderboard with current filters. Returns {data: LeaderboardResponse, isLoading, error}.

PART 6: Pages

/leaderboard/page.tsx: Server component default. Client wrapper renders: Sidebar (with FilterPanel) | Main (DomainTabs + stats Pill row + OptimizationMode + LeaderboardTable).
/leaderboard/[domain]/page.tsx: Same but domain from params.
/leaderboard/loading.tsx: Skeleton table with 10 rows.
```

### Files Created
- `src/lib/queries/models.ts`
- `src/lib/queries/leaderboard.ts`
- `src/lib/queries/pricing.ts`
- `src/lib/queries/metrics.ts`
- `src/app/api/models/route.ts`
- `src/app/api/leaderboard/route.ts`
- 8 files in `src/components/leaderboard/`
- 8 files in `src/components/filters/`
- `src/hooks/useFilters.ts`
- `src/hooks/useLeaderboard.ts`
- `src/app/leaderboard/page.tsx`
- `src/app/leaderboard/[domain]/page.tsx`
- `src/app/leaderboard/loading.tsx`

### Verification
- `npm run build` should pass
- Loading /leaderboard should show the page structure

---

## AGENT H: Compare + Pricing Features

**Tool**: Antigravity (independent features with clear specs)
**Branch**: `feat/compare-pricing`

### Prompt

```
Build the Compare and Pricing features for market.ai. Next.js 16, TypeScript, Tailwind CSS v4, Firebase/Firestore.

Read existing files:
- src/lib/types.ts (CompareModel, CompareResponse, PricingResponse, FilterState)
- src/lib/constants.ts (DOMAINS, VENDORS)
- src/lib/utils.ts (formatCurrency, formatNumber, formatElo)
- src/lib/queries/* (use getModels, getPricing)
- src/components/shared/* (Badge, Chip, VendorLogo, MissingDataBadge, EmptyState, SearchInput)

PART 1: API Routes

src/app/api/compare/route.ts:
GET ?models=slug1,slug2,slug3
- Look up each model by slug
- Fetch arena scores across all domains
- Fetch current pricing
- Fetch computed metrics
- Return CompareResponse

src/app/api/pricing/route.ts:
GET ?type=api|consumer&vendor=&sort=inputPrice1m&dir=asc
- Fetch all models with pricing data
- Return PricingResponse

src/app/api/metrics/route.ts:
GET ?model=slug&domain=overall&weights=coding:0.5,math:0.3
- Fetch model metrics
- If weights provided: compute weighted value score
- Return MetricsResponse

PART 2: Compare Components (src/components/compare/)

ModelSelector.tsx ('use client'):
- Search input (uses SearchInput component) that fetches /api/models?search=query
- Dropdown shows matching models
- Selected models shown as removable Chips below
- Max 8 models
- Props: {selectedSlugs: string[], onChange: (slugs: string[]) => void}

MetricRow.tsx:
Props: {label: string, values: (number|string|null)[], format: 'number'|'currency'|'score'|'text'|'context', higherIsBetter: boolean}
- Renders one <tr> in the matrix
- Find best/worst non-null values
- Best: text-emerald-300 bg-good
- Worst: text-muted/50
- null: MissingDataBadge
- Format values based on format prop

CompareColumn.tsx:
Props: {model: {slug, canonicalName, vendorSlug, vendorName}, onRemove: () => void}
- <th> column header with VendorLogo + name + X remove button
- min-w-[180px]

CompareMatrix.tsx ('use client'):
Props: {models: CompareModel[]}
- True matrix layout: sticky first column (200px) for metric labels, scrollable model columns
- Section headers: "Quality Scores", "Pricing", "Value Metrics", "Specifications" (span full width, bg-panel2)
- Metric rows (in order):
  Arena Elo (Overall), Arena Elo (Coding), Arena Elo (Math), Arena Elo (Creative), Arena Elo (Vision),
  Input $/1M, Output $/1M, Blended $/1M,
  Elo per Dollar, Value Score,
  Context Window, Modality, Release Date
- Use MetricRow for each row

PART 3: Pricing Components (src/components/pricing/)

PricingTable.tsx ('use client'):
Props: {data: PricingResponse}
- Toggle button: "API Pricing" | "Consumer Plans"
- API view columns: # | Model | Vendor | Input $/1M | Output $/1M | Cached | Batch In | Batch Out | Context | Source
- Consumer view columns: # | Model | Vendor | Plan | Monthly $ | Limits
- Sortable columns
- Uses existing table styling (sticky header, glassmorphism)

PricingRow.tsx:
Props for API: {model, pricing, rank}
Props for Consumer: {model, plan, rank}
- Links model name to /model/{slug}

PriceRangeSlider.tsx ('use client'):
Props: {min: number, max: number, value: [number, number], onChange: (v: [number,number]) => void}
- Two input[type=range] overlaid on a track
- Shows current values as labels
- Track: bg-line, active range: bg-blue-500/30, handles: bg-white rounded-full

PART 4: Weight Components (src/components/weights/)

WeightSliders.tsx ('use client'):
Props: {weights: Record<DomainKey, number>, onChange: (weights: Record<DomainKey, number>) => void}
- One slider (0-10) per domain from DOMAINS constant
- Label + current value on each line
- Real-time updates

WeightPresets.tsx:
Props: {onSelect: (weights: Record<DomainKey, number>) => void}
- Buttons: "Balanced" (all 1s), "Coding Focus" (coding:5, rest:1), "Creative Focus" (creative:5), "Math Focus" (math:5)
- Uses Chip component

PART 5: Hooks

src/hooks/useCompare.ts: Manages selected slugs synced to URL ?models=. Uses SWR to fetch /api/compare.
src/hooks/useWeights.ts: Manages domain weights synced to URL. Uses SWR to fetch /api/metrics.

PART 6: Pages

/compare/page.tsx: Full width layout (Sidebar nav but no filter panel). ModelSelector at top. CompareMatrix below. If no models: show "Select models to compare" with top 3 value models as suggestions.

/pricing/page.tsx: Sidebar (with VendorFilter and PriceFilter) + main area (PricingTable). Default sort: inputPrice1m ascending.
```

### Files Created
- `src/app/api/compare/route.ts`
- `src/app/api/pricing/route.ts`
- `src/app/api/metrics/route.ts`
- 4 files in `src/components/compare/`
- 3 files in `src/components/pricing/`
- 2 files in `src/components/weights/`
- `src/hooks/useCompare.ts`
- `src/hooks/useWeights.ts`
- `src/app/compare/page.tsx`
- `src/app/pricing/page.tsx`

### Verification
- `npm run build` should pass
- Loading /compare and /pricing should show page structure

---

## AGENT I: Model Detail + About Pages

**Tool**: Codex (well-defined pages, moderate complexity)
**Branch**: `feat/model-about-pages`

### Prompt

```
Build the Model Detail and About pages for market.ai. Next.js 16, TypeScript, Tailwind CSS v4, Firebase/Firestore.

Read existing files for types, constants, utils, and shared components.

PART 1: Model Components (src/components/model/)

ModelHeader.tsx:
Props: {model: Model, vendor: Vendor}
- Large VendorLogo (size 48) + canonical name (text-2xl font-serif font-bold) + family subtitle (text-muted)
- Row of Badge components: modality, isOpenSource ("Open Source" success badge), isActive
- Release date formatted
- Full width, py-8

ModelScoreCard.tsx:
Props: {title: string, mainValue: string | number, mainLabel: string, subItems: {label: string, value: string}[], variant: 'quality' | 'pricing' | 'value'}
- Card (bg-panel border-line rounded-2xl p-6)
- Large centered number (text-3xl font-mono font-bold)
- Accent color: quality = text-blue-400, pricing = text-amber-400, value = text-emerald-400
- Sub-items as grid below
- Title at top in text-sm text-muted

ModelPricingCard.tsx:
Props: {pricing: Pricing[]}
- Card showing API pricing (input/output/blended) and consumer plans
- Table layout inside the card
- If no pricing: MissingDataBadge

PART 2: Model Detail Page (/model/[slug]/page.tsx)

Server component that:
- Fetches model by slug from Firestore (using getModelBySlug from queries/models.ts)
- Fetches arena scores, pricing, and computed metrics for the model
- If not found: return notFound()
- Renders:
  a) ModelHeader
  b) Grid of 3 ModelScoreCards:
    - Arena Quality: mainValue=eloScore, subItems=[rank, votes, domain]
    - API Pricing: mainValue=blendedPrice, subItems=[input, output]
    - Value Score: mainValue=valueScore, subItems=[valueRank, eloPerDollar]
  c) Domain Breakdown table: columns = Domain | Elo | Value Score | Rank
  d) Link: "Back to Leaderboard" using next/link

PART 3: About Page (/about/page.tsx)

Static content page, max-w-3xl mx-auto:
- Title: "About market.ai" (text-3xl font-serif)
- Sections with h2 headings:
  1. "What is market.ai?" - Brief explanation
  2. "How Value Score Works" - Explain the formula:
     blendedPrice = inputPrice × 0.3 + outputPrice × 0.7
     eloPerDollar = eloScore / blendedPrice
     valueScore = percentileRank(eloPerDollar) × 100
  3. "Data Sources" - Arena.ai for quality, manual + PricePerToken for pricing
  4. "Update Frequency" - Arena: daily, Pricing: weekly
  5. "Limitations" - Reasoning tokens hidden costs, missing data for some models
  6. "Contact" - Placeholder

Style: prose-like with text-muted for body, text-primary for headings

PART 4: Update Metadata

Add proper <title> and OpenGraph metadata to:
- /model/[slug]/page.tsx: dynamic title = "Model Name | market.ai"
- /about/page.tsx: title = "About"
```

### Files Created
- `src/components/model/ModelHeader.tsx`
- `src/components/model/ModelScoreCard.tsx`
- `src/components/model/ModelPricingCard.tsx`
- `src/app/model/[slug]/page.tsx`
- `src/app/about/page.tsx`

### Verification
- `npm run build` should pass
- Loading /about should show the methodology page

---

## AGENT J: Reviewer + QA + Deploy

**Tool**: Cursor (needs full codebase understanding, debugging ability)
**Branch**: `main` (merges all feature branches)

**Checklist**: See **[QA.md](./QA.md)** for the full step-by-step QA checklist (merge order, review, fix, emulator tests, non-negotiable checks, deploy).

### Prompt

```
You are the QA reviewer for market.ai. The project was built by multiple agents in parallel. Your job is to make everything work together.

STEP 1 - MERGE: Merge all feature branches in this order:
feat/firebase-setup -> feat/seed-data -> feat/shared-components -> feat/layout-components -> feat/firebase-functions -> feat/leaderboard -> feat/compare-pricing -> feat/model-about-pages

STEP 2 - REVIEW: Read all files and check:
- TypeScript types match between API routes, queries, and components
- All imports resolve correctly (no missing modules)
- Firestore collection names match between functions/src/ and src/lib/queries/
- 'use client' directive present on all components using hooks/event handlers
- CSS classes use correct Tailwind v4 tokens from globals.css

STEP 3 - FIX: Run `npx tsc --noEmit` and fix all type errors. Then `npm run build` and fix all build errors.

STEP 4 - TEST with Firebase Emulators:
- Start emulators: firebase emulators:start
- Run seed function to populate Firestore
- Open http://localhost:3000/leaderboard - verify table renders with data
- Test sorting by Value Score, Elo, Price
- Test all filters (domain, vendor, price range, context, modality, arena toggle)
- Open /compare - verify true MATRIX layout (columns=models, rows=metrics), NOT cards
- Open /pricing - verify correct prices from seed data
- Open /model/gpt-4o - verify model detail page
- Add a model without pricing in Firestore - verify "Missing" badge appears
- Check DataFreshness timestamp displays
- Test at 768px and 1024px viewports

STEP 5 - NON-NEGOTIABLE CHECKS (fix if failing):
- Compare page MUST show a true matrix (columns = models, rows = metrics)
- All filters MUST update the table immediately
- Missing data MUST show "Missing" badge explicitly (never blank)
- Data freshness MUST be visible
- market-ai-logo.png MUST appear in the sidebar

STEP 6 - DEPLOY:
- firebase deploy --only hosting,functions,firestore:rules,firestore:indexes
- Run seed function against production
- Smoke test all production URLs
```

---

## Quick Reference: Git Workflow

```bash
# Create branch for each agent
git checkout -b feat/firebase-setup  # Agent B
git checkout -b feat/seed-data       # Agent C
git checkout -b feat/shared-components  # Agent E
git checkout -b feat/layout-components  # Agent F
git checkout -b feat/firebase-functions # Agent D
git checkout -b feat/leaderboard     # Agent G
git checkout -b feat/compare-pricing # Agent H
git checkout -b feat/model-about-pages  # Agent I

# Merge order (Agent J)
git checkout main
git merge feat/firebase-setup
git merge feat/seed-data
git merge feat/shared-components
git merge feat/layout-components
git merge feat/firebase-functions
git merge feat/leaderboard
git merge feat/compare-pricing
git merge feat/model-about-pages
```
