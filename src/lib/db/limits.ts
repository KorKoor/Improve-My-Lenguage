import "server-only";
import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../firebase/admin";

/**
 * Rate limiting con ventana fija en Firestore (sin Redis ni servicios de pago):
 * suficiente para una app personal / pequeña. Devuelve true si se permite.
 * La clave se guarda hasheada; los documentos caducados los borra
 * `pruneExpired()` desde el cron diario (el TTL nativo de Firestore exige
 * facturación activada).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const windowStart = Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000;
  const ref = firestore().collection("rateLimits").doc(`${cacheKey(key)}_${windowStart}`);
  const count = await firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = ((snap.get("count") as number | undefined) ?? 0) + 1;
    tx.set(ref, { count: next, expiresAt: Timestamp.fromMillis(windowStart + windowSeconds * 1000 + 86_400_000) });
    return next;
  });
  return count <= limit;
}

export function cacheKey(parts: unknown): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const snap = await firestore().collection("aiCache").doc(key).get();
  if (!snap.exists) return null;
  const expires = snap.get("expiresAt") as Timestamp | undefined;
  if (!expires || expires.toMillis() <= Date.now()) return null;
  try {
    return JSON.parse(String(snap.get("valueJson"))) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await firestore().collection("aiCache").doc(key).set({
    valueJson: JSON.stringify(value),
    expiresAt: Timestamp.fromMillis(Date.now() + ttlSeconds * 1000),
  });
}

/** Borra ventanas de rate limit y entradas de caché caducadas (lotes de 400). */
export async function pruneExpired(maxBatches = 10): Promise<number> {
  const db = firestore();
  let deleted = 0;
  for (const name of ["rateLimits", "aiCache"]) {
    for (let i = 0; i < maxBatches; i++) {
      const snap = await db.collection(name).where("expiresAt", "<", Timestamp.now()).limit(400).select().get();
      if (snap.empty) break;
      const batch = db.batch();
      for (const d of snap.docs) batch.delete(d.ref);
      await batch.commit();
      deleted += snap.size;
    }
  }
  return deleted;
}
