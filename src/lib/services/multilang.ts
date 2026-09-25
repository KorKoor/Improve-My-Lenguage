import "server-only";
import { getLanguage, vocabFor } from "../content";
import * as repo from "../db/repositories";
import type { UserLanguageRow } from "../db/types";
import { attentionSpan, bestStudyTime, type BestTime } from "../engine/focus";
import { overallTheta, thetaToCefr } from "../engine/levels";
import { allocateTime, interferenceTips, polyglotDays, type Allocation, type InterferenceTip, type LanguagePriority, type LanguageStat } from "../engine/multilang";
import { addDays, localDay } from "../engine/progress";
import { buildStudyPlan, type StudyPlan } from "../engine/study-plan";
import type { CefrLevel } from "../content/types";
import { aiAvailable } from "../ai/provider";
import type { Viewer } from "./viewer";

export interface LanguageCard {
  code: string;
  name: string;
  flag: string;
  priority: LanguagePriority;
  level: CefrLevel | null;
  due: number;
  minutesToday: number;
  minutesWeek: number;
  daysSince: number | null;
  goalMinutes: number | null;
  targetLevel: CefrLevel | null;
  /** Minutos por día de la última semana (7 valores, del más antiguo a hoy). */
  week: number[];
  /** Repasos que vencen en cada uno de los próximos 7 días. */
  forecast: number[];
  active: boolean;
}

export interface LanguagesOverview {
  cards: LanguageCard[];
  allocation: Allocation[];
  budget: number;
  tips: InterferenceTip[];
  polyglotDays: number;
  weekTotal: number;
}

/** Prioridad efectiva: la guardada o, por defecto, el primero es el principal. */
export function effectivePriority(ul: UserLanguageRow, index: number, all: UserLanguageRow[]): LanguagePriority {
  if (ul.priority) return ul.priority;
  const hasMain = all.some((x) => x.priority === "main");
  return !hasMain && index === 0 ? "main" : "active";
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

export async function languagesOverview(viewer: Viewer): Promise<LanguagesOverview> {
  const now = new Date();
  const tz = viewer.profile.timezone;
  const today = localDay(now, tz);
  const since = addDays(today, -59);
  const [langs, rows] = await Promise.all([repo.listUserLanguages(viewer.userId), repo.getActivityByLanguage(viewer.userId, since)]);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  const cards = await Promise.all(
    langs.map(async (ul, i): Promise<LanguageCard> => {
      const [skills, due, goal, forecast] = await Promise.all([repo.getSkillEstimates(ul.id), repo.countDue(ul.id, now), repo.getActiveGoal(ul.id), repo.dueForecast(ul.id, now)]);
      const t = overallTheta(skills.filter((s) => s.evidence > 0));
      const mine = rows.filter((r) => r.languageCode === ul.languageCode);
      const minutesOn = (day: string) => Math.round(mine.filter((r) => r.day === day).reduce((a, r) => a + r.seconds, 0) / 60);
      const last = mine.filter((r) => r.exercises > 0 || r.seconds > 0).map((r) => r.day).sort().at(-1) ?? null;
      const week = weekDays.map(minutesOn);
      const l = getLanguage(ul.languageCode);
      return {
        code: ul.languageCode,
        name: l?.name ?? ul.languageCode,
        flag: l?.flagEmoji ?? "🌐",
        priority: effectivePriority(ul, i, langs),
        level: t === null ? ul.selfReportedLevel : thetaToCefr(t),
        due,
        minutesToday: minutesOn(today),
        minutesWeek: week.reduce((a, b) => a + b, 0),
        daysSince: last ? daysBetween(last, today) : null,
        goalMinutes: goal?.minutesPerDay ?? null,
        targetLevel: goal?.targetLevel ?? null,
        week,
        forecast,
        active: ul.languageCode === viewer.profile.activeLanguage,
      };
    }),
  );

  const budget = viewer.profile.dailyMinutes;
  const allocation = allocateTime(cards.map(toStat), budget);
  return {
    cards,
    allocation,
    budget,
    tips: interferenceTips(cards.map((c) => c.code), viewer.profile.nativeLanguage, (c) => getLanguage(c)?.name.toLowerCase() ?? c),
    polyglotDays: polyglotDays(rows).length,
    weekTotal: cards.reduce((a, c) => a + c.minutesWeek, 0),
  };
}

const toStat = (c: LanguageCard): LanguageStat => ({
  code: c.code,
  priority: c.priority,
  due: c.due,
  minutesWeek: c.minutesWeek,
  daysSince: c.daysSince,
  goalMinutes: c.goalMinutes,
  minutesToday: c.minutesToday,
});

/** Capacidad de atención actual del alumno (min), aprendida de sus sesiones. */
export function viewerAttentionSpan(viewer: Viewer): number {
  const preferred = viewer.profile.personality?.tuning.suggestedMinutes ?? Math.min(25, Math.max(10, viewer.profile.dailyMinutes));
  return attentionSpan(viewer.profile.focusHistory, preferred);
}

export interface StudyModeData {
  overview: LanguagesOverview;
  span: number;
  plans: Record<number, StudyPlan>;
  best: BestTime | null;
  names: Record<string, { name: string; flag: string }>;
}

export const STUDY_DURATIONS = [15, 25, 45, 60, 90] as const;

export async function studyModeData(viewer: Viewer): Promise<StudyModeData> {
  const overview = await languagesOverview(viewer);
  const span = viewerAttentionSpan(viewer);
  const today = localDay(new Date(), viewer.profile.timezone);
  const seed = Number(today.replaceAll("-", "")) % 97;
  const stats = overview.cards.map(toStat);
  const opts = {
    span,
    favorites: viewer.profile.personality?.tuning.favorites ?? [],
    verbLanguages: overview.cards.filter((c) => vocabFor(c.code).some((v) => v.conjugation)).map((c) => c.code),
    ai: aiAvailable() && viewer.profile.aiConsent,
    seed,
  };
  const durations = [...new Set([...STUDY_DURATIONS, viewer.profile.dailyMinutes])].sort((a, b) => a - b);
  const plans = Object.fromEntries(durations.map((d) => [d, buildStudyPlan(stats, { ...opts, total: d })]));
  const best = await studyTimeInsight(viewer);
  return {
    overview,
    span,
    plans,
    best,
    names: Object.fromEntries(overview.cards.map((c) => [c.code, { name: c.name, flag: c.flag }])),
  };
}

/** «Tu mejor hora»: precisión por franja del día en los últimos 45 días. */
export async function studyTimeInsight(viewer: Viewer): Promise<BestTime | null> {
  const langs = await repo.listUserLanguages(viewer.userId);
  const hours = await repo.hourlyAccuracy(langs.map((l) => l.id), new Date(Date.now() - 45 * 86_400_000), viewer.profile.timezone);
  return bestStudyTime(hours);
}
