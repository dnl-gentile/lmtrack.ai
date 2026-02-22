# market.ai — QA Checklist

Use this checklist after merging feature branches or before each release to ensure everything works together.

**Run from project root:**
- `npm run qa:check` — TypeScript + production build
- `npm run emulators` — start Firestore + Functions emulators (uses `npx firebase-tools`)
- `npm run deploy` — deploy hosting, functions, rules, indexes (requires `firebase login`)

---

## 1. Merge order (if using feature branches)

Merge in this order to minimize conflicts:

```bash
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

---

## 2. Review checklist

Before running builds, verify:

| Check | Where |
|-------|--------|
| **TypeScript types** match between API routes, `src/lib/queries/`, and components | `src/app/api/*`, `src/lib/types.ts`, `src/lib/queries/*` |
| **Imports** resolve (no missing modules) | All `@/` and relative imports |
| **Firestore collection names** match | `functions/src/` (seed, triggers) vs `src/lib/queries/collections.ts` → `vendors`, `models`, `arenaScores`, `pricing`, `computedMetrics`, `dataSnapshots` |
| **`'use client'`** on components that use hooks or event handlers | All components under `src/components/` that use `useState`, `useEffect`, `onClick`, etc. |
| **Tailwind v4** — classes use tokens from `globals.css` | `bg-background`, `text-primary`, `text-muted`, `border-line`, `bg-panel`, `bg-panel2`, `bg-good`, `bg-mid`, `bg-bad`, etc. |

---

## 3. Fix: TypeScript and build

```bash
npx tsc --noEmit
```

Fix any type errors, then:

```bash
npm run build
```

Fix any build errors (missing exports, wrong imports, font/resource issues).

---

## 4. Test with Firebase Emulators

### 4.1 Start emulators

```bash
firebase emulators:start
```

(Optional: `--only firestore,functions` if you only need those.)

- Firestore: `localhost:8080`
- Functions: `localhost:5001`
- Hosting (if used): `localhost:5000`

### 4.2 Point app at emulators

When running the Next.js app, set:

```bash
export FIRESTORE_EMULATOR_HOST=localhost:8080
npm run dev
```

Open **http://localhost:3000** (or the port shown).

### 4.3 Seed Firestore

Run the seed function (e.g. call `seedDatabase` via the Functions emulator or your project’s seed script) so Firestore has vendors, models, pricing, and computed metrics.

### 4.4 Manual test matrix

| Page / action | What to verify |
|---------------|----------------|
| **http://localhost:3000/leaderboard** | Table renders with data; sorting by Value Score, Elo, Price works |
| **Filters** | Domain, vendor, price range, context, modality, arena toggle all update the table immediately |
| **http://localhost:3000/compare** | **True matrix**: columns = models, rows = metrics (no card layout) |
| **http://localhost:3000/pricing** | Prices match seed data; optional fields show “Missing” when absent |
| **http://localhost:3000/model/gpt-4o** | Model detail page: specs, API/consumer pricing, value metrics by domain |
| **Model without pricing** | Add a model in Firestore with no pricing doc → “Missing” badge appears where price would be |
| **Data freshness** | DataFreshness timestamp is visible (e.g. leaderboard header or sidebar) |
| **Viewports** | Test at **768px** and **1024px** (layout, filters, table scroll) |

---

## 5. Non-negotiable checks

These must pass; fix before considering QA done.

| Requirement | How to verify |
|-------------|----------------|
| **Compare page = true matrix** | Layout is table: columns = models, rows = metrics. Not cards. |
| **Filters update table immediately** | Changing any filter (domain, vendor, price, context, modality, arena) refreshes or re-filters the leaderboard without full reload. |
| **Missing data = “Missing” badge** | No blank cells for missing data; use `<MissingDataBadge />` (or explicit “Missing” text) everywhere. |
| **Data freshness visible** | At least one place (e.g. leaderboard or sidebar) shows when data was last updated. |
| **Logo in sidebar** | `market-ai-logo.png` appears in the sidebar (e.g. in `Sidebar.tsx` via `/market-ai-logo.png` from `public/`). |

---

## 6. Deploy

### 6.1 Deploy to Firebase

```bash
firebase deploy --only hosting,functions,firestore:rules,firestore:indexes
```

### 6.2 Seed production (if needed)

Run your seed function/script against the **production** project (use correct project and credentials).

### 6.3 Smoke test production URLs

- `/` — home
- `/leaderboard` — table and filters
- `/compare` — matrix layout
- `/pricing` — pricing table
- `/model/gpt-4o` (or a known slug) — model detail
- `/about` — about page

Check that data loads and the non-negotiable checks still hold in production.

---

## Quick reference

- **Firestore collections:** `vendors`, `models`, `arenaScores`, `pricing`, `computedMetrics`, `dataSnapshots`
- **Theme tokens:** `globals.css` → `@theme inline` and `:root` variables
- **Missing data:** Always use `MissingDataBadge` (default label “Missing”) for missing values in tables and detail views
