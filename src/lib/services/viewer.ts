import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getLanguage } from "../content";
import type { Language } from "../content/types";
import { ensureProfile, getProfile, getUserLanguage } from "../db/repositories";
import type { ProfileRow, UserLanguageRow } from "../db/types";
import { isAuthConfigured } from "../env";
import { createSupabaseServer } from "../supabase/server";

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

/** Usuario autenticado actual (validado contra Supabase) o null. Cacheado por request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!isAuthConfigured()) return null;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const profile = (await getProfile(user.id)) ?? (await ensureProfile(user.id, name ? name.split(" ")[0]! : null));
  return { userId: user.id, email: user.email ?? null, profile };
});

export async function requireViewer(): Promise<Viewer> {
  if (!isAuthConfigured()) redirect("/setup");
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
