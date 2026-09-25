import "server-only";

/**
 * Defensa CSRF para route handlers con cookies: las mutaciones sólo se aceptan
 * desde el propio origen. (Las Server Actions ya lo comprueban en Next.js.)
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
