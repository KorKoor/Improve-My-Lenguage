/**
 * Temporizador inteligente y descansos.
 *
 * Durante una sesión observa señales objetivas de fatiga —la precisión
 * reciente frente a la del inicio, respuestas cada vez más lentas, errores
 * seguidos y el tiempo transcurrido frente a tu capacidad de atención
 * habitual— y decide si seguir, hacer una micro-pausa o parar. La capacidad
 * de atención se aprende de tus sesiones anteriores (en qué minuto empezaste
 * a bajar), y la «mejor hora del día» sale de tu precisión real por franja.
 */

export interface FocusEvent {
  correct: boolean;
  timeMs: number;
  /** Minutos desde el inicio de la sesión en que ocurrió. */
  atMin: number;
}

export type FocusState = "warming" | "focused" | "tiring" | "tired";
export type FocusAdvice = "continue" | "micro_break" | "break" | "stop";

export interface FocusReading {
  state: FocusState;
  /** 0 = fresco, 1 = agotado. */
  fatigue: number;
  advice: FocusAdvice;
  reasons: string[];
}

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

/** Precisión con suavizado bayesiano (evita conclusiones con pocos datos). */
const smoothAcc = (xs: FocusEvent[], prior = 0.75, k = 3) => (xs.filter((x) => x.correct).length + prior * k) / (xs.length + k);

/**
 * Lee el estado de atención a partir de los eventos de la sesión.
 * `span` = minutos de atención sostenida habituales del alumno.
 * `sinceBreakMin` = minutos desde la última pausa (o desde el inicio).
 */
export function readFocus(events: FocusEvent[], opts: { span: number; sinceBreakMin: number }): FocusReading {
  const reasons: string[] = [];
  const n = events.length;
  const span = Math.max(5, opts.span);
  if (n < 6) {
    const f = Math.min(0.5, opts.sinceBreakMin / (span * 2));
    return { state: "warming", fatigue: f, advice: opts.sinceBreakMin >= span * 1.6 ? "micro_break" : "continue", reasons };
  }
  const base = events.slice(0, Math.min(8, Math.floor(n / 2)));
  const recent = events.slice(-6);

  // 1) Caída de precisión.
  const drop = Math.max(0, smoothAcc(base) - smoothAcc(recent));
  if (drop > 0.15) reasons.push("tu precisión está bajando");

  // 2) Lentitud: mediana reciente frente a la inicial (ignorando outliers >60 s).
  const t = (xs: FocusEvent[]) => median(xs.map((x) => Math.min(x.timeMs, 60_000)));
  const slow = t(base) > 0 ? t(recent) / t(base) : 1;
  const slowScore = Math.max(0, Math.min(1, (slow - 1.2) / 1.3));
  if (slow > 1.5) reasons.push("respondes más despacio que al principio");

  // 3) Errores seguidos al final.
  let streak = 0;
  for (let i = n - 1; i >= 0 && !events[i]!.correct; i--) streak++;
  if (streak >= 3) reasons.push(`${streak} fallos seguidos`);

  // 4) Tiempo frente a tu capacidad de atención habitual.
  const timeScore = Math.max(0, Math.min(1, (opts.sinceBreakMin - span * 0.6) / span));
  if (opts.sinceBreakMin >= span) reasons.push(`llevas ${Math.round(opts.sinceBreakMin)} min sin pausa`);

  const dropScore = Math.min(1, drop / 0.35);
  const fatigue = Math.min(1, dropScore * 0.35 + slowScore * 0.2 + Math.min(1, streak / 4) * 0.15 + timeScore * 0.3);
  const state: FocusState = fatigue >= 0.7 ? "tired" : fatigue >= 0.4 ? "tiring" : "focused";
  const advice: FocusAdvice =
    fatigue >= 0.8 && opts.sinceBreakMin >= 20 ? "stop" : fatigue >= 0.6 ? "break" : fatigue >= 0.4 || streak >= 3 ? "micro_break" : "continue";
  return { state, fatigue: Math.round(fatigue * 100) / 100, advice, reasons };
}

// ── Descansos ─────────────────────────────────────────────────────────────
export type BreakActivity = "breathe" | "eyes" | "stretch" | "water" | "walk" | "recall";

export const BREAK_ACTIVITIES: Record<BreakActivity, { title: string; icon: string; steps: string[] }> = {
  breathe: {
    title: "Respira",
    icon: "🌬️",
    steps: ["Inhala por la nariz en 4 tiempos", "Mantén el aire 4 tiempos", "Exhala despacio en 6 tiempos", "Repite siguiendo el círculo"],
  },
  eyes: {
    title: "Descansa la vista",
    icon: "👀",
    steps: ["Aparta la vista de la pantalla", "Mira algo a más de 6 metros", "Parpadea despacio varias veces", "Regla 20-20-20: cada 20 min, 20 s mirando lejos"],
  },
  stretch: {
    title: "Estírate",
    icon: "🙆",
    steps: ["Sube los hombros y suéltalos 5 veces", "Gira el cuello despacio a cada lado", "Entrelaza las manos y estira los brazos hacia arriba", "Ponte de pie un momento"],
  },
  water: {
    title: "Bebe agua",
    icon: "💧",
    steps: ["Levántate y sirve un vaso de agua", "Bébelo sin mirar el móvil", "Una buena hidratación mejora la concentración"],
  },
  walk: {
    title: "Muévete",
    icon: "🚶",
    steps: ["Camina unos minutos, aunque sea por casa", "Si puedes, mira por la ventana o sal al aire libre", "Moverse consolida lo aprendido"],
  },
  recall: {
    title: "Repaso con los ojos cerrados",
    icon: "🧠",
    steps: ["Cierra los ojos", "Intenta recordar 3 palabras de hoy", "Dilas en voz baja con una frase cada una", "Recordar sin mirar fija la memoria"],
  },
};

export interface BreakPlan {
  seconds: number;
  activity: BreakActivity;
  /** Texto breve de por qué se propone. */
  why: string;
}

/**
 * Elige duración y actividad del descanso. Pausas cortas y frecuentes rinden
 * más que una larga; tras ~50 min de estudio acumulado conviene moverse.
 * `seed` hace la elección variada pero determinista.
 */
export function planBreak(reading: FocusReading, studiedMin: number, seed = 0): BreakPlan {
  const kind = reading.advice === "continue" ? "micro_break" : reading.advice;
  let seconds = kind === "micro_break" ? 60 : kind === "break" ? 180 : 300;
  if (studiedMin >= 50) seconds = Math.max(seconds, 300);
  let pool: BreakActivity[];
  if (studiedMin >= 45) pool = ["walk", "stretch", "water"];
  else if (reading.reasons.some((r) => r.includes("despacio"))) pool = ["eyes", "breathe", "stretch"];
  else if (reading.reasons.some((r) => r.includes("fallos") || r.includes("precisión"))) pool = ["breathe", "recall", "eyes"];
  else pool = ["eyes", "stretch", "breathe", "water"];
  const activity = pool[Math.abs(seed) % pool.length]!;
  const why = reading.reasons.length ? `Te propongo una pausa porque ${reading.reasons.slice(0, 2).join(" y ")}.` : "Una pausa breve a tiempo mantiene tu concentración alta.";
  return { seconds, activity, why };
}

// ── Capacidad de atención aprendida ───────────────────────────────────────
/**
 * Minuto a partir del cual la sesión empezó a decaer (o null si no decayó).
 * Se usa la curva de precisión móvil: primer punto donde la media de 5 cae
 * 20 puntos por debajo del mejor tramo anterior.
 */
export function fatigueOnset(events: FocusEvent[]): number | null {
  if (events.length < 12) return null;
  let best = 0;
  for (let i = 5; i <= events.length; i++) {
    const win = events.slice(i - 5, i);
    const acc = win.filter((e) => e.correct).length / 5;
    if (acc > best) best = acc;
    else if (best - acc >= 0.4 && i >= 10) return Math.round(win[win.length - 1]!.atMin);
  }
  return null;
}

/**
 * Capacidad de atención estimada (minutos). Combina la preferencia declarada
 * con lo observado: las sesiones que no decayeron cuentan como «al menos
 * esa duración».
 */
export function attentionSpan(history: { onsetMin: number | null; durationMin: number }[], preferred: number): number {
  const prior = Math.max(8, Math.min(40, preferred * 1.2));
  const recent = history.slice(-12).filter((h) => h.durationMin >= 5);
  if (recent.length < 3) return Math.round(prior);
  const obs = recent.map((h) => (h.onsetMin ?? Math.max(h.durationMin, prior * 0.9)));
  // Media ponderada con el prior (peso 3) para no oscilar.
  const est = (median(obs) * recent.length + prior * 3) / (recent.length + 3);
  return Math.round(Math.max(6, Math.min(45, est)));
}

// ── Mejor hora del día ────────────────────────────────────────────────────
export interface HourStat {
  hour: number;
  total: number;
  correct: number;
}

export const DAYPARTS = [
  { id: "madrugada", label: "de madrugada", from: 0, to: 6 },
  { id: "manana", label: "por la mañana", from: 6, to: 12 },
  { id: "tarde", label: "por la tarde", from: 12, to: 19 },
  { id: "noche", label: "por la noche", from: 19, to: 24 },
] as const;

export interface BestTime {
  daypart: (typeof DAYPARTS)[number]["id"];
  label: string;
  accuracy: number;
  /** Diferencia (puntos) frente a tu media. */
  lift: number;
  /** Franja horaria concreta con más aciertos, p. ej. 8 → «8–10 h». */
  peakHour: number;
  confident: boolean;
}

/** Franja con mejor precisión (suavizada). null si hay pocos datos o no hay diferencia. */
export function bestStudyTime(hours: HourStat[]): BestTime | null {
  const total = hours.reduce((a, h) => a + h.total, 0);
  const correct = hours.reduce((a, h) => a + h.correct, 0);
  if (total < 40) return null;
  const mean = correct / total;
  const k = 15; // pseudo-observaciones hacia la media
  const parts = DAYPARTS.map((p) => {
    const hs = hours.filter((h) => h.hour >= p.from && h.hour < p.to);
    const t = hs.reduce((a, h) => a + h.total, 0);
    const c = hs.reduce((a, h) => a + h.correct, 0);
    return { p, t, acc: (c + mean * k) / (t + k) };
  }).filter((x) => x.t >= 15);
  if (parts.length < 2) return null;
  parts.sort((a, b) => b.acc - a.acc);
  const top = parts[0]!;
  const lift = Math.round((top.acc - mean) * 100);
  if (lift < 2) return null;
  // Pico de dos horas dentro de la franja.
  let peakHour = top.p.from;
  let peak = -1;
  for (let h = top.p.from; h < top.p.to; h++) {
    const a = hours.find((x) => x.hour === h);
    const b = hours.find((x) => x.hour === h + 1);
    const t = (a?.total ?? 0) + (b?.total ?? 0);
    const c = (a?.correct ?? 0) + (b?.correct ?? 0);
    const s = (c + mean * 5) / (t + 5);
    if ((a?.total ?? 0) >= 3 && t >= 5 && s > peak) {
      peak = s;
      peakHour = h;
    }
  }
  return { daypart: top.p.id, label: top.p.label, accuracy: Math.round(top.acc * 100), lift, peakHour, confident: top.t >= 60 && lift >= 5 };
}

/** Formato «8–10 h». */
export const peakLabel = (h: number) => `${h}–${(h + 2) % 24} h`;
