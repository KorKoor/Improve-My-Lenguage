/**
 * «Lo que dicen tus datos»: observaciones personalizadas, deterministas y
 * explicadas a partir de tu actividad real. Nada de frases motivacionales
 * genéricas: cada tarjeta nace de un número que puedes comprobar.
 */
import type { CefrLevel } from "../content/types";
import type { CardMemory } from "./fsrs";
import { currentRetrievability } from "./fsrs";

export interface Insight {
  id: string;
  icon: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  tone: "good" | "info" | "warn";
}

/** Lemas aproximados que cubre cada nivel (ver docs/content.md). */
export const CEFR_VOCAB: Record<Exclude<CefrLevel, "C2">, number> = { A1: 445, A2: 978, B1: 2150, B2: 4730, C1: 10400 };
const NEXT: Partial<Record<CefrLevel, Exclude<CefrLevel, "C2">>> = { A1: "A2", A2: "B1", B1: "B2", B2: "C1" };

// Zipf: la palabra de rango r aparece con frecuencia ∝ 1/r. H(60 000) ≈ 11.58.
const H_TOTAL = Math.log(60000) + 0.5772;

/** % aproximado de las palabras de un texto corriente que cubren estos rangos. */
export function textCoverage(ranks: number[]): number {
  let s = 0;
  for (const r of ranks) if (r > 0) s += 1 / r;
  return Math.min(0.98, s / H_TOTAL);
}

export interface InsightInput {
  now: Date;
  today: string;
  /** Días activos (YYYY-MM-DD), cualquier orden. */
  activeDays: string[];
  /** Tarjetas de vocabulario vistas, con su rango de frecuencia y lema. */
  vocab: { card: CardMemory; rank: number | null; lemma: string; lapses: number; incorrect: number; correct: number; learned: boolean }[];
  /** Precisión semanal (más antigua → más reciente). */
  weekly: { total: number; correct: number }[];
  level: CefrLevel | null;
  languageName: string;
}

const dayMs = 86_400_000;

/** Palabra «rebelde»: se olvida una y otra vez, o se falla más de lo que se acierta. */
export function isLeech(k: { lapses: number; incorrect: number; correct: number }): boolean {
  return k.lapses >= 3 || (k.incorrect >= 3 && k.incorrect > k.correct);
}

export function buildInsights(input: InsightInput): Insight[] {
  const out: Insight[] = [];
  const learned = input.vocab.filter((v) => v.learned);
  const seen = input.vocab.filter((v) => v.card.reps > 0);

  // 1. Cobertura de textos reales (Zipf) con las palabras aprendidas.
  if (learned.length >= 20) {
    const cov = Math.round(textCoverage(learned.map((v) => v.rank ?? 0)) * 100);
    out.push({
      id: "coverage",
      icon: "🔎",
      title: `Entiendes ~${cov} % de un texto corriente`,
      body: `Las ${learned.length} palabras que ya dominas son de las más usadas del ${input.languageName.toLowerCase()}, así que cubren alrededor del ${cov} % de las palabras de un texto típico.${cov < 90 ? " Con el 95 % se lee con fluidez." : " ¡Ya puedes leer textos reales con soltura!"}`,
      href: "/app/read",
      cta: "Ponlo a prueba",
      tone: "good",
    });
  }

  // 2. Previsión de nivel según tu ritmo real de palabras nuevas.
  const days = [...input.activeDays].sort();
  const first = days[0];
  const next = input.level ? NEXT[input.level] : "A1";
  if (first && next && seen.length >= 15) {
    const weeks = Math.max(1, (Date.parse(`${input.today}T12:00:00Z`) - Date.parse(`${first}T12:00:00Z`)) / (7 * dayMs));
    const rate = seen.length / weeks;
    const missing = CEFR_VOCAB[next] - learned.length;
    if (missing > 0 && rate >= 3) {
      const eta = Math.ceil(missing / rate);
      out.push({
        id: "forecast",
        icon: "🧭",
        title: eta <= 52 ? `Vocabulario de ${next} en ~${eta} ${eta === 1 ? "semana" : "semanas"}` : `Vocabulario de ${next}: a tu ritmo, más de un año`,
        body: `Incorporas unas ${Math.round(rate)} palabras nuevas por semana y ${next} ronda las ${CEFR_VOCAB[next].toLocaleString("es")}. Es una estimación aproximada: la gramática y la práctica real también cuentan.${eta > 26 ? " Subir 5 minutos al día lo acorta bastante." : ""}`,
        href: "/app/session?focus=new_words",
        cta: "Aprender palabras",
        tone: "info",
      });
    }
  }

  // 3. Palabras rebeldes: fallos repetidos.
  const leeches = seen
    .filter(isLeech)
    .sort((a, b) => b.lapses + b.incorrect - (a.lapses + a.incorrect))
    .slice(0, 5);
  if (leeches.length >= 2) {
    out.push({
      id: "leeches",
      icon: "🧲",
      title: `${leeches.length} palabras se te resisten`,
      body: `${leeches.map((l) => `«${l.lemma}»`).join(", ")}. Truco: inventa una frase personal con cada una o búscalas en una lectura; el contexto las fija mejor que repetir.`,
      href: "/app/session?focus=leeches&minutes=5",
      cta: "Reaprenderlas ahora",
      tone: "warn",
    });
  }

  // 4. Memoria actual: probabilidad media de recordar lo aprendido (FSRS).
  if (learned.length >= 10) {
    const r = learned.reduce((a, v) => a + currentRetrievability(v.card, input.now), 0) / learned.length;
    const pct = Math.round(r * 100);
    out.push({
      id: "retention",
      icon: pct >= 85 ? "🧠" : "⏳",
      title: `Recuerdas ~${pct} % de tus palabras ahora mismo`,
      body: pct >= 85 ? "Tus repasos están funcionando: la memoria se mantiene alta." : "Algunas palabras se están enfriando. Un repaso corto hoy las devuelve a su punto.",
      href: pct >= 85 ? undefined : "/app/review",
      cta: pct >= 85 ? undefined : "Repasar",
      tone: pct >= 85 ? "good" : "warn",
    });
  }

  // 5. Tendencia de precisión (últimas 2 semanas con datos vs. las 2 anteriores).
  const withData = input.weekly.filter((w) => w.total >= 10);
  if (withData.length >= 4) {
    const acc = (ws: typeof withData) => ws.reduce((a, w) => a + w.correct, 0) / Math.max(1, ws.reduce((a, w) => a + w.total, 0));
    const recent = acc(withData.slice(-2));
    const before = acc(withData.slice(-4, -2));
    const diff = Math.round((recent - before) * 100);
    if (Math.abs(diff) >= 5) {
      out.push({
        id: "trend",
        icon: diff > 0 ? "📈" : "📉",
        title: diff > 0 ? `Tu precisión subió ${diff} puntos` : `Tu precisión bajó ${-diff} puntos`,
        body:
          diff > 0
            ? `De ${Math.round(before * 100)} % a ${Math.round(recent * 100)} % en las últimas dos semanas. Si te resulta fácil, prueba la dificultad «con reto».`
            : `De ${Math.round(before * 100)} % a ${Math.round(recent * 100)} %. Es normal al subir de nivel; si se mantiene, bajamos un poco el ritmo de palabras nuevas.`,
        tone: diff > 0 ? "good" : "info",
      });
    }
  }

  // 6. Constancia en los últimos 7 días.
  const last7 = new Set(days.filter((d) => Date.parse(`${input.today}T12:00:00Z`) - Date.parse(`${d}T12:00:00Z`) < 7 * dayMs));
  if (days.length >= 3) {
    const n = last7.size;
    out.push({
      id: "consistency",
      icon: n >= 5 ? "🔥" : n >= 3 ? "🌱" : "📅",
      title: `${n} de los últimos 7 días`,
      body: n >= 5 ? "Constancia excelente: estudiar a menudo rinde más que sesiones largas y espaciadas." : n >= 3 ? "Buen ritmo. Un día más por semana marca una diferencia notable en la memoria." : "Pocos días esta semana. Incluso 5 minutos cuentan: mantienen vivos tus repasos.",
      tone: n >= 5 ? "good" : "info",
    });
  }

  return out;
}

// ── Palabra del día ─────────────────────────────────────────────────────────
/**
 * Una palabra nueva, justo por encima de lo que ya sabes, con ejemplo real
 * (y audio grabado si lo hay). Cambia cada día y es distinta para cada persona.
 */
export function pickWordOfDay<T extends { id: string; rank?: number; examples: unknown[]; audioUrl?: string }>(
  vocab: T[],
  seen: Set<string>,
  knownRank: number,
  seed: number,
): T | null {
  const lo = Math.max(1, Math.round(knownRank * 0.9));
  const hi = Math.max(lo + 200, Math.round(knownRank * 1.8));
  const pool = vocab.filter((v) => !seen.has(v.id) && v.examples.length > 0 && (v.rank ?? 0) >= lo && (v.rank ?? 0) <= hi);
  const withAudio = pool.filter((v) => v.audioUrl);
  const list = withAudio.length >= 10 ? withAudio : pool;
  if (list.length === 0) return null;
  return list[Math.abs(seed) % list.length]!;
}

// ── Informe semanal ─────────────────────────────────────────────────────────
export interface WeekTotals {
  minutes: number;
  exercises: number;
  correct: number;
  days: number;
  words: number;
}

export interface WeekReport {
  current: WeekTotals;
  previous: WeekTotals;
  /** Días del lunes al domingo de esta semana (minutos por día). */
  daily: { day: string; minutes: number }[];
}

const addDaysIso = (day: string, n: number) => new Date(Date.parse(`${day}T12:00:00Z`) + n * dayMs).toISOString().slice(0, 10);

/** Semana natural (lunes → domingo) en la zona del usuario, frente a la anterior a estas alturas. */
export function weekReport(activity: { day: string; seconds: number; exercises: number; correct: number; wordsReviewed: number }[], today: string): WeekReport {
  const dow = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  const monday = addDaysIso(today, -dow);
  const prevMonday = addDaysIso(monday, -7);
  const sum = (from: string, to: string): WeekTotals => {
    const rows = activity.filter((a) => a.day >= from && a.day < to);
    const byDay = new Set(rows.filter((r) => r.exercises > 0 || r.seconds > 0).map((r) => r.day));
    return {
      minutes: Math.round(rows.reduce((a, r) => a + r.seconds, 0) / 60),
      exercises: rows.reduce((a, r) => a + r.exercises, 0),
      correct: rows.reduce((a, r) => a + r.correct, 0),
      days: byDay.size,
      words: rows.reduce((a, r) => a + r.wordsReviewed, 0),
    };
  };
  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = addDaysIso(monday, i);
    return { day: d, minutes: Math.round(activity.filter((a) => a.day === d).reduce((s, r) => s + r.seconds, 0) / 60) };
  });
  // Comparación justa: la semana anterior hasta el mismo día de la semana.
  return { current: sum(monday, addDaysIso(monday, 7)), previous: sum(prevMonday, addDaysIso(prevMonday, dow + 1)), daily };
}
