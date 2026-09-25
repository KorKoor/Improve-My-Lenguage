import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getLanguage } from "../content";
import type { Language } from "../content/types";
import { ensureProfile, getProfile, getUserLanguage } from "../db/repositories";
import type { ProfileRow, UserLanguageRow } from "../db/types";
import { verifySession } from "../auth/session";
import { isBackendConfigured } from "../env";

export interface Viewer {
  userId: string;
  email: string | null;
  profile: ProfileRow;
}

export interface Learner extends Viewer {
  ul: UserLanguageRow;
  language: Language;
  native: string;
}

/** Usuario autenticado actual (cookie de sesión verificada por Firebase Admin) o null. Cacheado por request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Siempre dinámico: nunca prerenderizar una página privada en el build,
  // aunque en ese momento falten las variables de entorno.
  await connection();
  if (!isBackendConfigured()) return null;
  const user = await verifySession();
  if (!user) return null;
  const name = typeof user.name === "string" ? user.name : null;
  const profile = (await getProfile(user.uid)) ?? (await ensureProfile(user.uid, name ? name.split(" ")[0]! : null));
  return { userId: user.uid, email: user.email ?? null, profile };
});

export async function requireViewer(): Promise<Viewer> {
  await connection();
  if (!isBackendConfigured()) redirect("/setup");
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}

/** Requiere usuario con onboarding completo e idioma activo. */
export const requireLearner = cache(async (): Promise<Learner> => {
  const viewer = await requireViewer();
  const code = viewer.profile.activeLanguage;
  if (!viewer.profile.onboardedAt || !code) redirect("/app/onboarding");
  const language = getLanguage(code);
  const ul = await getUserLanguage(viewer.userId, code);
  if (!language || !ul) redirect("/app/onboarding");
  return { ...viewer, ul, language, native: viewer.profile.nativeLanguage };
});
