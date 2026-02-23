import fs from "node:fs";
import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;

  try {
    // Preferred format for cloud environments.
    if (raw.startsWith("{")) {
      return JSON.parse(raw) as ServiceAccount;
    }

    // Local fallback: allow a filesystem path if it exists.
    if (fs.existsSync(raw)) {
      return JSON.parse(fs.readFileSync(raw, "utf8")) as ServiceAccount;
    }
  } catch (error) {
    console.warn("Invalid FIREBASE_SERVICE_ACCOUNT value:", error);
  }

  return null;
}

// In cloud runtimes, a local macOS path from .env.local breaks ADC.
const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (googleCredentialsPath && !fs.existsSync(googleCredentialsPath)) {
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

if (getApps().length === 0) {
  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp(); // Uses default credentials (emulator or GCP)
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
