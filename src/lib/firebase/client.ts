"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, inMemoryPersistence, setPersistence, type Auth } from "firebase/auth";
import { firebaseWebConfig } from "./config";

/**
 * Firebase en el navegador. Sólo se usa para autenticar y obtener un ID token;
 * la sesión real es una cookie httpOnly emitida por el servidor, por eso la
 * persistencia del SDK es en memoria (no queda nada en localStorage).
 */
export function firebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseWebConfig);
}

let authPromise: Promise<Auth> | null = null;

export function clientAuth(): Promise<Auth> {
  authPromise ??= (async () => {
    const auth = getAuth(firebaseApp());
    auth.languageCode = "es";
    const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
    if (emulator && process.env.NODE_ENV !== "production") connectAuthEmulator(auth, `http://${emulator}`, { disableWarnings: true });
    await setPersistence(auth, inMemoryPersistence);
    return auth;
  })();
  return authPromise;
}
