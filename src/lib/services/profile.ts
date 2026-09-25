import "server-only";
import { getLanguage } from "../content";
import type { CefrLevel } from "../content/types";
import * as repo from "../db/repositories";
import { ACHIEVEMENT_RULES } from "../engine/achievements";
import { overallTheta, thetaToCefr } from "../engine/levels";
import { computeStreak, localDay, longestStreak } from "../engine/progress";
import type { Viewer } from "./viewer";

/** Avatares disponibles (lista cerrada: nada de URLs arbitrarias). */
export const AVATARS = ["🦊", "🐼", "🦉", "🐯", "🐙", "🐢", "🦋", "🐝", "🌻", "🌵", "🍀", "⭐", "🚀", "🎧", "📚", "🧠", "🌍", "🎨", "⚽", "🎸"] as const;

export interface ProfileOverview {
  displayName: string | null;
  email: string | null;
  avatar: string | null;
  memberSince: string;
  languages: { code: string; name: string; level: CefrLevel | null; assessed: boolean; active: boolean }[];
  stats: {
    streak: number;
    bestStreak: number;
    activeDays: number;
    minutes: number;
    exercises: number;
    readings: number;
    writings: number;
    listening: number;
    conversations: number;
  };
  achievements: { id: string; title: string; description: string; icon: string; unlockedAt: string | null }[];
}

export async function profileOverview(viewer: Viewer): Promise<ProfileOverview> {
  const uid = viewer.userId;
  const today = localDay(new Date(), viewer.profile.timezone);
  const [uls, days, activity, exercises, readings, writings, listening, conversations, unlocked] = await Promise.all([
    repo.listUserLanguages(uid),
    repo.allActiveDays(uid),
    repo.getActivity(uid, "2000-01-01"),
    repo.totalExercises(uid),
    repo.countReadings(uid),
    repo.countWritings(uid),
    repo.countEvents(uid, "listening_completed"),
    repo.countConversations(uid),
    repo.getUnlockedAchievements(uid),
  ]);
  const languages = await Promise.all(
    uls.map(async (ul) => {
      const est = (await repo.getSkillEstimates(ul.id)).filter((s) => s.evidence > 0);
      const theta = overallTheta(est);
      return {
        code: ul.languageCode,
        name: getLanguage(ul.languageCode)?.name ?? ul.languageCode,
        level: theta === null ? null : thetaToCefr(theta),
        assessed: Boolean(ul.assessedAt),
        active: ul.languageCode === viewer.profile.activeLanguage,
      };
    }),
  );
  const got = new Map(unlocked.map((a) => [a.achievementId, a.unlockedAt]));
  return {
    displayName: viewer.profile.displayName,
    email: viewer.email,
    avatar: viewer.profile.avatar,
    memberSince: viewer.profile.createdAt.toISOString(),
    languages: languages.sort((a, b) => Number(b.active) - Number(a.active)),
    stats: {
      streak: computeStreak(days, today),
      bestStreak: longestStreak(days),
      activeDays: days.length,
      minutes: Math.round(activity.reduce((a, r) => a + r.seconds, 0) / 60),
      exercises,
      readings,
      writings,
      listening,
      conversations,
    },
    achievements: ACHIEVEMENT_RULES.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      unlockedAt: got.get(r.id)?.toISOString() ?? null,
    })),
  };
}
