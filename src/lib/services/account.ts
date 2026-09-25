import "server-only";
import { destroySession } from "../auth/session";
import * as repo from "../db/repositories";
import { adminAuth } from "../firebase/admin";
import { logError } from "../log";

export async function exportData(userId: string) {
  await repo.track(userId, "data_exported");
  return repo.exportUserData(userId);
}

/**
 * Elimina la cuenta: primero todos los datos de la app (garantizado), luego la
 * identidad en Firebase Auth y por último la cookie de sesión.
 */
export async function deleteAccount(userId: string): Promise<{ authDeleted: boolean }> {
  await repo.deleteUserData(userId);
  let authDeleted = false;
  try {
    await adminAuth().deleteUser(userId);
    authDeleted = true;
  } catch (err) {
    logError("account:auth-delete", err);
  }
  await destroySession(authDeleted ? null : userId);
  return { authDeleted };
}
