# Firebase setup handoff (Cursor / coding agents)

Use this to configure Firebase for local dev and deploy. **Never commit real keys or service account JSON.** Copy values into `.env.local` (gitignored) and keep this file with placeholders only.

---

## Project identifiers

Get these from [Firebase Console](https://console.firebase.google.com) → Project settings → General.

| Variable | Where | Example (placeholder) |
|----------|--------|------------------------|
| Project ID | General → Your project | `your-project-id` |
| Project number | General → Your project | `123456789012` |
| Hosting site ID | Hosting → (optional) | `your-site-id` |
| Measurement ID | General → Your apps → Measurement ID | `G-XXXXXXXXXX` |

---

## `.firebaserc`

At repo root. Use your real project ID for `default` only when working locally; do not commit if it’s sensitive.

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

---

## `.env.local` (create from `.env.example`)

Copy `.env.example` to `.env.local` and fill with values from Firebase Console → Project settings → General → Your apps (Web app).

```bash
cp .env.example .env.local
```

| Variable | Source | Notes |
|----------|--------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web app config | Public (client) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `YOUR_PROJECT_ID.firebaseapp.com` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `YOUR_PROJECT_ID.firebasestorage.app` | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Project number | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web app config | |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics Measurement ID | |
| `FIREBASE_HOSTING_SITE_ID` | Hosting (optional) | |

**Admin SDK (server / API routes)** — use one of:

- **A) File path**  
  Firebase Console → Project settings → Service accounts → Generate new private key → save as `./keys/firebase-admin.json` (add `keys/` to `.gitignore`).  
  In `.env.local`:
  ```bash
  GOOGLE_APPLICATION_CREDENTIALS=./keys/firebase-admin.json
  ```

- **B) JSON string**  
  In `.env.local` (single-line, escaped):
  ```bash
  FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
  ```
  e.g. `jq -c '.' keys/firebase-admin.json` and paste (do not commit).

**Optional**

- `CRON_SECRET` — secret for protecting cron/ingestion endpoints.

---

## Console setup (after project/plan chosen)

- **Firestore** — Create database (production mode), choose region, then seed (e.g. run seed function).
- **Auth** — Enable Email/Password and any other sign-in methods you need.
- **Storage** — Enable and choose region (if used).
- **Hosting** — Configure deploys (e.g. repo connection); optional.
- **Cloud Functions** — Requires Blaze plan for deployment and billing.

---

## Deploy and emulators

- `npm run deploy` — deploy hosting, functions, Firestore rules and indexes (requires `firebase login` or `npx firebase-tools login`).
- `npm run emulators` — start Firestore + Functions emulators locally.
- See **QA.md** for full test and deploy checklist.
