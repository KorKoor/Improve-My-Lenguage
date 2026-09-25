import "server-only";
import { catalog, errorLabel, getLanguage, getVocab, grammarForCategory, topicLabel } from "../content";
import type { CefrLevel, Skill } from "../content/types";
import { overallTheta, progressWithinLevel, thetaToCefr, type SkillEstimate } from "../engine/levels";
import { planSession, type SessionPlan } from "../engine/planner";
import { buildInsights, pickWordOfDay, weekReport, type Insight, type WeekReport } from "../engine/insights";
import { hashString } from "../engine/random";
import { wordCard, type WordCard } from "../engine/session-builder";
import { knownRankForTheta } from "../reading/text";
import { addDays, accuracy, computeStreak, freezeDaysNeeded, consistency, isLearned, localDay, longestStreak, summarizeVocabulary } from "../engine/progress";
import { practicePicks, recommend, type PracticePick, type Recommendation } from "../engine/recommender";
import type { Weakness } from "../engine/weakness";
import * as repo from "../db/repositories";
import { cognateInfo } from "../engine/cognates";
import { sessionMinutesFor } from "./multilang";
import type { ActivityRow, GoalRow } from "../db/types";
import { aiAvailable } from "../ai/provider";
import { getSkills, getWeaknesses, knowledgeToCard } from "./learning";
import type { Learner } from "./viewer";

export interface SkillView {
  skill: Skill;
  level: CefrLevel;
  theta: number;
  progress: number; // dentro del nivel
  evidence: number;
  lowEvidence: boolean;
}

export interface DashboardData {
  greetingName: string | null;
  overall: { level: CefrLevel; theta: number; progress: number; next: CefrLevel | null } | null;
  assessed: boolean;
  plan: SessionPlan;
  dueCount: number;
  recommendation: Recommendation;
  streak: number;
  bestStreak: number;
  /** Protectores de racha disponibles y días que se acaban de cubrir. */
  streakFreezes: number;
  freezeUsed: string[];
  minutesTotal: number;
  minutesThisMonth: number;
  wordsLearned: number;
  accuracy30: number | null;
  skills: SkillView[];
  weaknesses: { category: string; label: string; count: number; grammarId: string | null }[];
  goal: GoalRow | null;
  week: { day: string; minutes: number }[];
  weekMinutes: number;
  activity: ActivityRow[];
  studiedToday: boolean;
  aiEnabled: boolean;
  /** Prácticas sugeridas (lectura/escucha/escritura/tutor), explicadas. */
  practice: PracticePick[];
  wordOfDay: WordCard | null;
}

const NEXT: Record<CefrLevel, CefrLevel | null> = { A1: "A2", A2: "B1", B1: "B2", B2: "C1", C1: "C2", C2: null };

export function skillViews(skills: SkillEstimate[]): SkillView[] {
  const order: Skill[] = ["vocabulary", "grammar", "listening", "reading", "speaking", "writing", "pronunciation"];
  return order
    .map((s) => skills.find((x) => x.skill === s))
    .filter((x): x is SkillEstimate => !!x)
    .map((s) => ({
      skill: s.skill,
      level: thetaToCefr(s.theta),
      theta: s.theta,
      progress: progressWithinLevel(s.theta),
      evidence: s.evidence,
      lowEvidence: s.evidence < 5,
    }));
}

export async function getDashboard(learner: Learner): Promise<DashboardData> {
  const now = new Date();
  const tz = learner.profile.timezone;
  const today = localDay(now, tz);
  const ulId = learner.ul.id;
  const monthStart = today.slice(0, 8) + "01";
  const [skillsMap, weaknesses, knowledge, dueCount, days, activity, totals30, goal] = await Promise.all([
    getSkills(ulId),
    getWeaknesses(ulId, now),
    repo.getAllKnowledge(ulId),
    repo.countDue(ulId, now),
    repo.allActiveDays(learner.userId),
    repo.getActivity(learner.userId, addDays(today, -140), learner.language.code),
    repo.attemptTotals(ulId, new Date(now.getTime() - 30 * 86_400_000)),
    repo.getActiveGoal(ulId),
  ]);
  const skills = [...skillsMap.values()];
  const measured = skills.filter((s) => s.evidence > 0);
  const theta = overallTheta(measured);
  // Protector de racha: cubre automáticamente los días perdidos si alcanza.
  const covered = [...days, ...learner.profile.frozenDays];
  const need = freezeDaysNeeded(covered, today, learner.profile.streakFreezes);
  let freezeUsed: string[] = [];
  if (need.length && (await repo.consumeStreakFreezes(learner.userId, need))) {
    freezeUsed = need;
    covered.push(...need);
    await repo.track(learner.userId, "streak_freeze_used", { days: need.length });
  }
  const vocab = summarizeVocabulary(
    knowledge.map((k) => ({ ...knowledgeToCard(k, now), itemId: k.itemId, itemType: k.itemType })),
    now,
  );
  const seen = new Set(knowledge.filter((k) => k.reps > 0).map((k) => k.itemId));
  const assessed = Boolean(learner.ul.assessedAt);
  const aiEnabled = aiAvailable() && learner.profile.aiConsent;

  const plan = planSession({
    minutes: await sessionMinutesFor(learner),
    dueReviews: dueCount,
    newWordsAvailable: catalog.vocab(learner.language.code).length - seen.size,
    weaknesses,
    weaknessLabel: errorLabel,
    grammarForCategory,
    skills,
    aiAvailable: aiEnabled,
    audioAvailable: true,
    difficulty: learner.profile.preferredDifficulty,
    styleWeights: learner.profile.personality?.tuning.blockWeights,
    seed: 1,
  });

  const studiedToday = days.includes(today);
  const recommendation = recommend({
    assessed,
    dueReviews: dueCount,
    weaknesses,
    weaknessLabel: errorLabel,
    grammarForCategory,
    skills,
    topInterest: learner.profile.interests[0] ? topicLabel(learner.profile.interests[0]).toLowerCase() : null,
    studiedToday,
  });

  const byDay = new Map(activity.map((a) => [a.day, a]));
  const week: { day: string; minutes: number }[] = [];
  // Semana actual lunes→domingo en la zona del usuario.
  const dow = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, i - dow);
    week.push({ day: d, minutes: Math.round((byDay.get(d)?.seconds ?? 0) / 60) });
  }
  const allActivity = await repo.getActivity(learner.userId, "2000-01-01");
  const minutesTotal = Math.round(allActivity.reduce((a, r) => a + r.seconds, 0) / 60);
  const minutesThisMonth = Math.round(allActivity.filter((r) => r.day >= monthStart).reduce((a, r) => a + r.seconds, 0) / 60);

  return {
    greetingName: learner.profile.displayName,
    overall: theta === null ? null : { level: thetaToCefr(theta), theta, progress: progressWithinLevel(theta), next: NEXT[thetaToCefr(theta)] },
    assessed,
    plan,
    dueCount,
    recommendation,
    streak: computeStreak(covered, today),
    bestStreak: longestStreak(covered),
    streakFreezes: learner.profile.streakFreezes - freezeUsed.length,
    freezeUsed,
    minutesTotal,
    minutesThisMonth,
    wordsLearned: vocab.learned,
    accuracy30: accuracy(totals30.correct, totals30.total),
    skills: skillViews(skills),
    weaknesses: topWeaknesses(weaknesses),
    goal,
    week,
    weekMinutes: week.reduce((a, d) => a + d.minutes, 0),
    activity,
    studiedToday,
    aiEnabled,
    wordOfDay: (() => {
      const vocabTheta = skillsMap.get("vocabulary");
      const known = knownRankForTheta(vocabTheta && vocabTheta.evidence > 0 ? vocabTheta.theta : -2.5);
      const v = pickWordOfDay(catalog.vocab(learner.language.code), seen, known, hashString(`${today}:${learner.userId}`));
      return v ? wordCard(v, learner.native) : null;
    })(),
    practice: practicePicks({ skills, favorites: learner.profile.personality?.tuning.favorites ?? [], aiAvailable: aiEnabled }),
  };
}

export function topWeaknesses(ws: Weakness[]) {
  return ws.slice(0, 5).map((w) => ({
    category: w.category,
    label: errorLabel(w.category),
    count: w.count,
    grammarId: grammarForCategory(w.category),
  }));
}

export interface ProgressData {
  skills: SkillView[];
  vocabulary: { seen: number; learned: number; mastered: number; due: number; total: number };
  weekly: { week: string; total: number; correct: number }[];
  skillAccuracy: { skill: Skill; total: number; correct: number }[];
  activity: ActivityRow[];
  streak: number;
  bestStreak: number;
  consistency28: number;
  weaknesses: ReturnType<typeof topWeaknesses>;
  achievements: { achievementId: string; unlockedAt: Date }[];
  totals: { attempts: number; correct: number };
  insights: Insight[];
  week: WeekReport;
}

export async function getProgress(learner: Learner): Promise<ProgressData> {
  const now = new Date();
  const today = localDay(now, learner.profile.timezone);
  const ulId = learner.ul.id;
  const [skillsMap, knowledge, weekly, skillAcc, activity, days, weaknesses, achievements, totals] = await Promise.all([
    getSkills(ulId),
    repo.getAllKnowledge(ulId),
    repo.weeklyAccuracy(ulId, 12),
    repo.skillAccuracy(ulId, new Date(now.getTime() - 30 * 86_400_000)),
    repo.getActivity(learner.userId, addDays(today, -181)),
    repo.allActiveDays(learner.userId),
    getWeaknesses(ulId, now),
    repo.getUnlockedAchievements(learner.userId),
    repo.attemptTotals(ulId, null),
  ]);
  const vocab = summarizeVocabulary(
    knowledge.map((k) => ({ ...knowledgeToCard(k, now), itemId: k.itemId, itemType: k.itemType })),
    now,
  );
  // Otros idiomas (días sin estudiarlos) y palabras regalo por venir.
  const langs = await repo.listUserLanguages(learner.userId);
  const byLang = await repo.getActivityByLanguage(learner.userId, addDays(today, -60));
  const otherLanguages = await Promise.all(
    langs
      .filter((l) => l.languageCode !== learner.language.code)
      .map(async (l) => {
        const last = byLang.filter((r) => r.languageCode === l.languageCode && (r.exercises > 0 || r.seconds > 0)).map((r) => r.day).sort().at(-1);
        return {
          name: getLanguage(l.languageCode)?.name ?? l.languageCode,
          daysSince: last ? Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${last}T12:00:00Z`)) / 86_400_000) : null,
          due: await repo.countDue(l.id, now),
        };
      }),
  );
  const seenIds = new Set(knowledge.map((k) => k.itemId));
  const upcoming = catalog.vocab(learner.language.code).filter((v) => !seenIds.has(v.id)).slice(0, 300);
  const cognateShare =
    learner.native === "es" && upcoming.length >= 50
      ? upcoming.filter((v) => cognateInfo(v.lemma, v.language, v.translations.es ?? [])?.kind === "cognate").length / upcoming.length
      : null;
  return {
    skills: skillViews([...skillsMap.values()]),
    vocabulary: { ...vocab, total: catalog.vocab(learner.language.code).length },
    weekly,
    skillAccuracy: skillAcc,
    activity,
    streak: computeStreak([...days, ...learner.profile.frozenDays], today),
    bestStreak: longestStreak([...days, ...learner.profile.frozenDays]),
    consistency28: consistency(days, today, 28),
    weaknesses: topWeaknesses(weaknesses),
    achievements,
    totals: { attempts: totals.total, correct: totals.correct },
    week: weekReport(activity, today),
    insights: buildInsights({
      now,
      today,
      activeDays: days,
      vocab: knowledge
        .filter((k) => k.itemType === "vocab" && k.reps > 0)
        .map((k) => {
          const card = knowledgeToCard(k, now);
          const v = getVocab(k.itemId);
          return { card, rank: v?.rank ?? null, lemma: v?.lemma ?? k.itemId, lapses: k.lapses, incorrect: k.incorrectCount, correct: k.correctCount, learned: isLearned(card, now) };
        }),
      weekly,
      level: (() => {
        const t = overallTheta([...skillsMap.values()].filter((x) => x.evidence > 0));
        return t === null ? null : thetaToCefr(t);
      })(),
      languageName: learner.language.name,
      otherLanguages,
      cognateShare,
    }),
  };
}
