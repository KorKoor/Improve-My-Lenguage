import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { isBackendConfigured } from "./env";
import { firestore } from "./firebase/admin";

/**
 * Registro de errores del servidor, sin servicios externos ni datos personales.
 *
 * - Escribe una línea JSON en los logs (Vercel los conserva y permite buscar).
 * - Cuenta los errores por día y por ámbito en `ops/errors-YYYY-MM-DD`, que
 *   `/api/health` resume. Nunca se guarda el mensaje completo ni la entrada del
 *   usuario: sólo el tipo de error y un mensaje corto depurado.
 */
import { scrub } from "./log-scrub";

export { scrub };

export function logError(scope: string, err: unknown): void {
  const name = err instanceof Error ? err.name : typeof err;
  const message = scrub(err instanceof Error ? err.message : String(err));
  console.error(JSON.stringify({ level: "error", scope, name, message, at: new Date().toISOString() }));
  if (!isBackendConfigured()) return;
  const day = new Date().toISOString().slice(0, 10);
  // Contador best effort: si falla, no debe romper nada más.
  void firestore()
    .collection("ops")
    .doc(`errors-${day}`)
    .set({ total: FieldValue.increment(1), by: { [scope.replace(/[^\w-]/g, "_").slice(0, 60)]: FieldValue.increment(1) } }, { merge: true })
    .catch(() => {});
}

/** Errores de hoy y de ayer (para /api/health). */
export async function recentErrorCounts(): Promise<{ today: number; yesterday: number; topToday: [string, number][] }> {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const [a, b] = await Promise.all([firestore().collection("ops").doc(`errors-${today}`).get(), firestore().collection("ops").doc(`errors-${yesterday}`).get()]);
  const by = (a.get("by") ?? {}) as Record<string, number>;
  return {
    today: Number(a.get("total") ?? 0),
    yesterday: Number(b.get("total") ?? 0),
    topToday: Object.entries(by).sort((x, y) => y[1] - x[1]).slice(0, 5),
  };
}
