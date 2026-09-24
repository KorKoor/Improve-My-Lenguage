import "server-only";
import postgres from "postgres";
import { env } from "../env";

/**
 * Conexión Postgres (postgres.js). Portable: funciona con Supabase, Neon,
 * RDS o un Postgres propio — sólo cambia DATABASE_URL.
 *
 * En Vercel (serverless) usa el *pooler en modo transacción* de Supabase
 * (puerto 6543) y `prepare: false`, porque PgBouncer en modo transacción no
 * soporta sentencias preparadas.
 */
export type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { __imlSql?: Sql };

export function db(): Sql {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL no está configurada. Revisa .env.local (ver .env.example).");
  }
  if (!globalForDb.__imlSql) {
    globalForDb.__imlSql = postgres(env.databaseUrl, {
      prepare: false,
      max: process.env.NODE_ENV === "production" ? 3 : 5,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: env.databaseUrl.includes("localhost") || env.databaseUrl.includes("127.0.0.1") ? false : "require",
      // snake_case en BD ↔ camelCase en TypeScript (sólo nombres de columna).
      transform: { ...postgres.camel, undefined: null },
    });
  }
  return globalForDb.__imlSql;
}
