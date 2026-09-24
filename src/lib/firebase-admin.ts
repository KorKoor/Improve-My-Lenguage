import "server-only";

import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

type RawServiceAccount = {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw || raw.trim() === "") {
    throw new Error("FIREBASE_SERVICE_ACCOUNT no está configurada.");
  }

  try {
    const parsed = JSON.parse(raw) as RawServiceAccount;

    return {
      projectId: parsed.projectId ?? parsed.project_id,
      clientEmail: parsed.clientEmail ?? parsed.client_email,
      privateKey: parsed.privateKey ?? parsed.private_key,
    };
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT no es un JSON válido.");
  }
}

export const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(getServiceAccount()),
      });

export const firebaseAuth = getAuth(firebaseAdminApp);
