import "server-only";
import * as repo from "../db/repositories";
import { env } from "../env";

export async function exportData(userId: string) {
  await repo.track(userId, "data_exported");
  return repo.exportUserData(userId);
}

/**
 * Elimina la cuenta: primero todos los datos de la app (garantizado), luego la
 * identidad en Supabase Auth (Admin API si hay service role key; si no, SQL).
 */
export async function deleteAccount(userId: string): Promise<{ authDeleted: boolean }> {
  await repo.deleteUserData(userId);
  if (env.supabaseUrl && env.supabaseServiceRoleKey) {
    const res = await fetch(`${env.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { apikey: env.supabaseServiceRoleKey, authorization: `Bearer ${env.supabaseServiceRoleKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { authDeleted: true };
    console.error("[account] Admin API delete falló", res.status);
  }
  return { authDeleted: await repo.deleteAuthUserViaSql(userId) };
}
