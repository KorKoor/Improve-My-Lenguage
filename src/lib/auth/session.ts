import "server-only";
import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { adminAuth } from "../firebase/admin";
import { logError } from "../log";

/**
 * Sesión = cookie httpOnly firmada por Firebase (session cookie), emitida por
 * el servidor a partir de un ID token recién obtenido en el navegador. El SDK
 * cliente usa persistencia en memoria: no hay tokens en localStorage.
 */
export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE_S = 14 * 24 * 3600; // máximo permitido por Firebase

/** El ID token debe ser de un inicio de sesión reciente (evita reusar tokens robados). */
const MAX_AUTH_AGE_S = 5 * 60;

export async function createSessionFromIdToken(idToken: string): Promise<{ cookie: string; user: DecodedIdToken }> {
  const auth = adminAuth();
  const decoded = await auth.verifyIdToken(idToken, true);
  if (Date.now() / 1000 - decoded.auth_time > MAX_AUTH_AGE_S) throw new Error("recent_login_required");
  const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_S * 1000 });
  return { cookie, user: decoded };
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_S,
};

/** Usuario de la cookie de sesión, comprobando revocación (cierre de sesión global). */
export async function verifySession(): Promise<DecodedIdToken | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    return await adminAuth().verifySessionCookie(value, true);
  } catch {
    return null;
  }
}

/** Cierra la sesión en todos los dispositivos (revoca refresh tokens) y borra la cookie. */
export async function destroySession(uid: string | null): Promise<void> {
  if (uid) {
    try {
      await adminAuth().revokeRefreshTokens(uid);
    } catch (err) {
      logError("auth:revoke", err);
    }
  }
  (await cookies()).delete(SESSION_COOKIE);
}
