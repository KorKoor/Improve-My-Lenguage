import "server-only";
import { createHash } from "node:crypto";
import { db } from "./client";

/**
 * Rate limiting con ventana fija en Postgres. Sin Redis ni servicios de pago:
 * suficiente para una app personal / pequeña. Devuelve true si se permite.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const windowStart = new Date(Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const rows = await db()<{ count: number }[]>`
    insert into rate_limits (key, window_start, count) values (${key}, ${windowStart}, 1)
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count`;
  return (rows[0]?.count ?? 0) <= limit;
}

export function cacheKey(parts: unknown): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const rows = await db()<{ value: T }[]>`
    select value from ai_cache where key = ${key} and expires_at > now()`;
  return rows[0]?.value ?? null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const sql = db();
  const expires = new Date(Date.now() + ttlSeconds * 1000);
  await sql`
    insert into ai_cache (key, value, expires_at) values (${key}, ${sql.json(value as never)}, ${expires})
    on conflict (key) do update set value = excluded.value, expires_at = excluded.expires_at`;
}
