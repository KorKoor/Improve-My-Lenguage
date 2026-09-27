/**
 * Afi evoluciona contigo, sin niveles absurdos: estrena pequeños accesorios
 * cuando consigues algo real (constancia, palabras, nivel) y va aprendiendo
 * cómo aprendes tú (a qué hora aciertas más, qué tipo de ejercicio te cuesta,
 * si tus fallos son casi aciertos…). Todo sale de tus datos; nada se inventa.
 * Funciones puras (se prueban sin base de datos).
 */
import type { CefrLevel } from "../content/types";

export type AfiWear = "scarf" | "glasses" | "flower" | "star";

export interface AfiMilestone {
  wear: AfiWear;
  title: string;
  /** Cómo se consigue. */
  how: string;
  earned: boolean;
  /** 0–1 hacia el hito. */
  progress: number;
  /** «5 de 7 días». */
  count: string;
}

export interface BondStats {
  bestStreak: number;
  wordsLearned: number;
  level: CefrLevel | null;
}

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function afiMilestones(s: BondStats): AfiMilestone[] {
  const lv = s.level ? LEVELS.indexOf(s.level) : -1;
  const frac = (n: number, of: number) => Math.max(0, Math.min(1, n / of));
  return [
    { wear: "scarf", title: "Bufanda de la constancia", how: "7 días seguidos estudiando", earned: s.bestStreak >= 7, progress: frac(s.bestStreak, 7), count: `${Math.min(s.bestStreak, 7)} de 7 días` },
    { wear: "glasses", title: "Gafas de lectora", how: "100 palabras aprendidas", earned: s.wordsLearned >= 100, progress: frac(s.wordsLearned, 100), count: `${Math.min(s.wordsLearned, 100)} de 100 palabras` },
    { wear: "flower", title: "Flor de los 30 días", how: "30 días seguidos (tu mejor racha)", earned: s.bestStreak >= 30, progress: frac(s.bestStreak, 30), count: `${Math.min(s.bestStreak, 30)} de 30 días` },
    { wear: "star", title: "Tercera estrella", how: "Llegar a nivel B1", earned: lv >= 2, progress: lv < 0 ? 0 : frac(lv + 1, 3), count: s.level ? `Nivel actual: ${s.level}` : "Aún sin nivel medido" },
  ];
}

export function afiWear(s: BondStats): AfiWear[] {
  return afiMilestones(s).filter((m) => m.earned).map((m) => m.wear);
}

/** Rachas que merecen celebración (el día que se alcanzan). */
export const STREAK_MOMENTS = [3, 7, 14, 30, 50, 100, 200, 365];

export function streakMoment(streak: number, studiedToday: boolean): { text: string; big: boolean } | null {
  if (!studiedToday || !STREAK_MOMENTS.includes(streak)) return null;
  if (streak === 3) return { text: "Tres días seguidos. Así empiezan los hábitos.", big: false };
  if (streak === 7) return { text: "¡Una semana entera! Me he puesto la bufanda para celebrarlo.", big: true };
  if (streak === 30) return { text: "Treinta días seguidos. Esto ya es parte de ti (y yo estreno flor).", big: true };
  return { text: `${streak} días seguidos. Tu memoria lo nota, y yo también.`, big: streak >= 50 };
}

// ── Cómo aprendes ─────────────────────────────────────────────────────────

export interface PatternRow {
  at: Date;
  correct: boolean;
  type: string;
  timeMs: number;
  nearMiss: boolean;
}

export interface AfiObservation {
  id: "time" | "recall" | "near" | "speed" | "days";
  icon: string;
  text: string;
  tip?: string;
}

const RECOGNIZE = new Set(["meaning_mc", "reverse_mc", "match", "phrase_pick", "listen_pick", "letter_see", "letter_pair", "rule_mc", "accent_pick", "tone_pick"]);
const PRODUCE = new Set(["recall", "cloze", "dictation", "dictation_word", "conjugate", "spell_word", "letter_name"]);
const PART_OF_DAY: { id: string; label: string; from: number; to: number }[] = [
  { id: "morning", label: "por la mañana", from: 6, to: 12 },
  { id: "afternoon", label: "por la tarde", from: 12, to: 19 },
  { id: "evening", label: "por la noche", from: 19, to: 24 },
  { id: "late", label: "de madrugada", from: 0, to: 6 },
];
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function localParts(d: Date, timeZone: string): { hour: number; weekday: number; day: string } {
  try {
    const f = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
    const get = (t: string) => f.find((p) => p.type === t)?.value ?? "";
    const hour = Number(get("hour") || d.getUTCHours()) % 24;
    const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { hour, weekday: wd < 0 ? d.getUTCDay() : wd, day: `${get("year")}-${get("month")}-${get("day")}` };
  } catch {
    return { hour: d.getUTCHours(), weekday: d.getUTCDay(), day: d.toISOString().slice(0, 10) };
  }
}

const pct = (c: number, t: number) => Math.round((c / t) * 100);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)]! : 0;
};

/** Mínimo de respuestas para decir algo (con menos, Afi «todavía te está conociendo»). */
export const MIN_ROWS = 30;

export function afiObservations(rows: PatternRow[], timeZone: string, now: Date): AfiObservation[] {
  if (rows.length < MIN_ROWS) return [];
  const out: AfiObservation[] = [];

  // 1. A qué hora aciertas más (partes del día con ≥ 12 respuestas; diferencia ≥ 8 puntos).
  const byPart = new Map<string, { t: number; c: number }>();
  for (const r of rows) {
    const h = localParts(r.at, timeZone).hour;
    const part = PART_OF_DAY.find((p) => h >= p.from && h < p.to)!;
    const a = byPart.get(part.id) ?? { t: 0, c: 0 };
    a.t++;
    if (r.correct) a.c++;
    byPart.set(part.id, a);
  }
  const parts = [...byPart].filter(([, a]) => a.t >= 12).map(([id, a]) => ({ id, acc: pct(a.c, a.t) })).sort((x, y) => y.acc - x.acc);
  if (parts.length >= 2 && parts[0]!.acc - parts.at(-1)!.acc >= 8) {
    const best = PART_OF_DAY.find((p) => p.id === parts[0]!.id)!;
    const worst = PART_OF_DAY.find((p) => p.id === parts.at(-1)!.id)!;
    out.push({ id: "time", icon: "🕐", text: `Aciertas más ${best.label} (${parts[0]!.acc} %) que ${worst.label} (${parts.at(-1)!.acc} %).`, tip: `Si puedes, estudia lo nuevo ${best.label} y deja los repasos para el resto del día.` });
  }

  // 2. Reconocer vs. recordar (escribir de memoria).
  const rec = rows.filter((r) => RECOGNIZE.has(r.type));
  const pro = rows.filter((r) => PRODUCE.has(r.type));
  if (rec.length >= 10 && pro.length >= 10) {
    const a = pct(rec.filter((r) => r.correct).length, rec.length);
    const b = pct(pro.filter((r) => r.correct).length, pro.length);
    if (a - b >= 12) out.push({ id: "recall", icon: "🧠", text: `Reconoces muy bien las palabras (${a} %), pero al escribirlas de memoria bajas a ${b} %.`, tip: "Es normal: recordar cuesta más que reconocer. Lo que más te ayuda ahora son los ejercicios de escribir." });
    else if (b >= a - 3 && b >= 75) out.push({ id: "recall", icon: "🧠", text: `Escribes de memoria casi tan bien como reconoces (${b} % frente a ${a} %).`, tip: "Buena señal: el vocabulario ya está pasando a tu memoria activa." });
  }

  // 3. Casi aciertos.
  const wrong = rows.filter((r) => !r.correct);
  const near = wrong.filter((r) => r.nearMiss).length;
  if (wrong.length >= 10 && near / wrong.length >= 0.35) {
    out.push({ id: "near", icon: "🎯", text: `${pct(near, wrong.length)} % de tus fallos son casi aciertos: una tilde, una letra, el orden.`, tip: "Sabes la palabra; fíjate en los detalles antes de pulsar «Comprobar»." });
  }

  // 4. Velocidad: respuestas correctas de la última semana frente a las anteriores.
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const recent = rows.filter((r) => r.correct && r.at.getTime() >= weekAgo && r.timeMs > 0).map((r) => r.timeMs);
  const before = rows.filter((r) => r.correct && r.at.getTime() < weekAgo && r.timeMs > 0).map((r) => r.timeMs);
  if (recent.length >= 20 && before.length >= 20) {
    const gain = 1 - median(recent) / median(before);
    if (gain >= 0.15) out.push({ id: "speed", icon: "⚡", text: `Respondes un ${Math.round(gain * 100)} % más rápido que hace unas semanas.`, tip: "Cuando aciertas más rápido, la palabra se está automatizando." });
  }

  // 5. Qué días estudias (días distintos con actividad, no respuestas).
  const days = new Map<string, number>();
  for (const r of rows) {
    const { weekday, day } = localParts(r.at, timeZone);
    days.set(day, weekday);
  }
  const perWeekday = new Array(7).fill(0) as number[];
  for (const wd of days.values()) perWeekday[wd]!++;
  const total = perWeekday.reduce((a, b) => a + b, 0);
  const top = perWeekday.map((n, wd) => ({ n, wd })).sort((a, b) => b.n - a.n).slice(0, 2);
  if (total >= 6 && top[0]!.n + top[1]!.n >= total * 0.5 && top[1]!.n >= 2) {
    out.push({ id: "days", icon: "📅", text: `Estudias sobre todo los ${WEEKDAYS[top[0]!.wd]} y los ${WEEKDAYS[top[1]!.wd]}.`, tip: "Un repaso de 5 minutos los otros días mantiene fresco lo aprendido." });
  }
  return out;
}
