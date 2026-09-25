import "server-only";

import { applicationDefault, cert, getApps, initializeApp, type App, type Credential } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

/**
 * Firebase Admin (sólo servidor): Auth, Firestore y Cloud Messaging.
 *
 * Credenciales, por orden de preferencia:
 *  1. FIREBASE_SERVICE_ACCOUNT — JSON del service account en una sola línea (Vercel).
 *  2. GOOGLE_APPLICATION_CREDENTIALS — ruta a un archivo JSON (desarrollo local).
 * Se inicializa de forma perezosa: sin credenciales, la web pública y el build
 * funcionan y las áreas privadas muestran /setup.
 */
type RawServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function readCredential(): { credential: Credential; projectId?: string } | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (raw) {
    try {
      const sa = JSON.parse(raw) as RawServiceAccount;
      if (!sa.client_email || !sa.private_key) throw new Error("faltan client_email/private_key");
      return {
        credential: cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key.replace(/\n/g, "\n") }),
        projectId: sa.project_id,
      };
    } catch (err) {
      console.error("[firebase-admin] FIREBASE_SERVICE_ACCOUNT no es válido:", (err as Error).message);
      return null;
    }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    return { credential: applicationDefault(), projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID };
  }
  return null;
}

/** Emuladores locales (npm run dev:emulated): sin credenciales, nunca en producción. */
function usingEmulators(): boolean {
  return process.env.NODE_ENV !== "production" && Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);
}

const globalForFirebase = globalThis as unknown as { __imlAdmin?: App | null; __imlDb?: Firestore };

function adminApp(): App | null {
  if (globalForFirebase.__imlAdmin !== undefined) return globalForFirebase.__imlAdmin;
  const existing = getApps()[0];
  if (existing) return (globalForFirebase.__imlAdmin = existing);
  const cred = readCredential();
  if (cred) {
    globalForFirebase.__imlAdmin = initializeApp({ credential: cred.credential, projectId: cred.projectId });
  } else if (usingEmulators()) {
    globalForFirebase.__imlAdmin = initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-iml" });
  } else {
    globalForFirebase.__imlAdmin = null;
  }
  return globalForFirebase.__imlAdmin;
}

export function isAdminConfigured(): boolean {
  return adminApp() !== null;
}

function requireApp(): App {
  const app = adminApp();
  if (!app) throw new Error("Firebase Admin no está configurado (FIREBASE_SERVICE_ACCOUNT). Ver .env.example.");
  return app;
}

export function adminAuth(): Auth {
  return getAuth(requireApp());
}

export function firestore(): Firestore {
  if (!globalForFirebase.__imlDb) {
    const db = getFirestore(requireApp());
    // Firestore rechaza `undefined`; lo tratamos como "campo ausente".
    db.settings({ ignoreUndefinedProperties: true });
    globalForFirebase.__imlDb = db;
  }
  return globalForFirebase.__imlDb;
}

export interface PushMessage {
  title: string;
  body: string;
  link?: string;
}

/** Envía a varios dispositivos y devuelve los tokens caducados para borrarlos. */
export async function sendPush(tokens: string[], msg: PushMessage): Promise<{ sent: number; invalid: string[] }> {
  if (tokens.length === 0) return { sent: 0, invalid: [] };
  const res = await getMessaging(requireApp()).sendEachForMulticast({
    tokens,
    notification: { title: msg.title, body: msg.body },
    webpush: {
      headers: { Urgency: "normal", TTL: String(12 * 3600) },
      notification: { icon: "/icon.svg", badge: "/icon.svg" },
      fcmOptions: msg.link ? { link: msg.link } : undefined,
    },
  });
  const invalid: string[] = [];
  res.responses.forEach((r, i) => {
    const code = r.error?.code;
    if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
      invalid.push(tokens[i]!);
    }
  });
  return { sent: res.successCount, invalid };
}
