import "server-only";
import { cache } from "react";
import { aiAvailable } from "../ai/provider";
import * as repo from "../db/repositories";
import { localDay, MAX_STREAK_FREEZES } from "../engine/progress";
import { dailyQuests, levelFromXp, levelTitle, questValue, totalXp, type DayStats, type Quest, type QuestInput } from "../engine/quests";
import { checkAchievements, getSkills } from "./learning";
import type { Learner } from "./viewer";

export interface QuestView extends Quest {
  value: number;
  done: boolean;
  claimed: boolean;
}

export interface XpView {
  total: number;
  level: number;
  title: string;
  into: number;
  span: number;
  progress: number;
}

async function dayStats(learner: Learner, today: string): Promise<DayStats> {
  const since = new Date(Date.now() - 36 * 3600_000);
  const [activity, events] = await Promise.all([repo.getActivity(learner.userId, today), repo.eventsSince(learner.userId, since)]);
  const rows = activity.filter((a) => a.day === today);
  const counts: Record<string, number> = {};
  for (const e of events) {
    if (localDay(e.at, learner.profile.timezone) !== today) continue;
    counts[e.name] = (counts[e.name] ?? 0) + 1;
  }
  return {
    exercises: rows.reduce((a, r) => a + r.exercises, 0),
    correct: rows.reduce((a, r) => a + r.correct, 0),
    minutes: Math.round(rows.reduce((a, r) => a + r.seconds, 0) / 60),
    wordsReviewed: rows.reduce((a, r) => a + r.wordsReviewed, 0),
    events: counts,
  };
}

const WEAKEST_AMONG = ["reading", "listening", "writing", "pronunciation", "grammar", "vocabulary"] as const;

export const getXp = cache(async (userId: string): Promise<XpView> => {
  const [activity, readings, writings, listening, speaking, conversations, achievements, questXp] = await Promise.all([
    repo.getActivity(userId, "2000-01-01"),
    repo.countReadings(userId),
    repo.countWritings(userId),
    repo.countEvents(userId, "listening_completed"),
    repo.countEvents(userId, "speaking_completed"),
    repo.countConversations(userId),
    repo.getUnlockedAchievements(userId),
    repo.totalQuestXp(userId),
  ]);
  const total = totalXp({
    exercises: activity.reduce((a, r) => a + r.exercises, 0),
    correct: activity.reduce((a, r) => a + r.correct, 0),
    readings,
    writings,
    listening,
    speaking,
    conversations,
    achievements: achievements.length,
    questXp,
  });
  const l = levelFromXp(total);
  return { total, ...l, title: levelTitle(l.level) };
});

export async function questBoard(learner: Learner, dueReviews: number): Promise<{ day: string; quests: QuestView[] }> {
  const today = localDay(new Date(), learner.profile.timezone);
  const [stats, stored] = await Promise.all([dayStats(learner, today), repo.getQuestDay(learner.userId, today)]);
  const quests = (stored.quests as Quest[] | null) ?? (await generate(learner, today, dueReviews));
  return {
    day: today,
    quests: quests.map((q) => {
      const value = Math.min(q.target, questValue(q, stats));
      return { ...q, value, done: value >= q.target, claimed: stored.claimed.includes(q.id) };
    }),
  };
}

async function generate(learner: Learner, today: string, dueReviews: number): Promise<Quest[]> {
  const skills = await getSkills(learner.ul.id);
  const measured = WEAKEST_AMONG.map((s) => skills.get(s)!).filter((s) => s && s.evidence > 0);
  const weakest = measured.length >= 2 ? ([...measured].sort((a, b) => a.theta - b.theta)[0]!.skill as QuestInput["weakest"]) : null;
  const quests = dailyQuests({
    day: today,
    userId: learner.userId,
    dueReviews,
    dailyMinutes: learner.profile.dailyMinutes,
    favorites: learner.profile.personality?.tuning.favorites ?? [],
    weakest,
    aiAvailable: aiAvailable() && learner.profile.aiConsent,
  });
  await repo.saveQuestSet(learner.userId, today, quests);
  return quests;
}

export async function claimDailyQuest(learner: Learner, questId: string, dueReviews: number) {
  const board = await questBoard(learner, dueReviews);
  const q = board.quests.find((x) => x.id === questId);
  if (!q) throw new Error("Misión desconocida");
  if (!q.done) throw new Error("Aún no has completado esta misión");
  const before = await getXp(learner.userId);
  const ok = await repo.claimQuest(learner.userId, board.day, q.id, q.xp);
  const total = before.total + (ok ? q.xp : 0);
  const after = levelFromXp(total);
  if (ok) {
    await repo.track(learner.userId, "quest_claimed", { quest: q.id, xp: q.xp });
    await checkAchievements(learner);
  }
  const allDone = board.quests.every((x) => x.id === q.id || x.claimed);
  // Completar las tres misiones del día regala un protector de racha.
  const freezes = ok && allDone ? await repo.grantStreakFreeze(learner.userId, MAX_STREAK_FREEZES) : null;
  return {
    freezeEarned: freezes !== null,
    xpGained: ok ? q.xp : 0,
    xp: { total, ...after, title: levelTitle(after.level) } satisfies XpView,
    leveledUp: after.level > before.level,
    allDone,
  };
}
