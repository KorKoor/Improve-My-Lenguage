/**
 * Configuración web de Firebase. Estos valores son públicos por diseño
 * (identifican el proyecto; la seguridad la dan las reglas de Firestore, que
 * niegan todo acceso desde el cliente, y el servidor). Se leen de variables de
 * entorno para no atar el código a un proyecto concreto.
 */
export const firebaseWebConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

export function isFirebaseWebConfigured(): boolean {
  return Boolean(firebaseWebConfig.apiKey && firebaseWebConfig.authDomain && firebaseWebConfig.projectId && firebaseWebConfig.appId);
}

export function isPushWebConfigured(): boolean {
  return isFirebaseWebConfigured() && Boolean(firebaseWebConfig.messagingSenderId && firebaseVapidKey);
}
