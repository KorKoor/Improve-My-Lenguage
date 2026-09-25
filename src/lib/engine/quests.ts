/**
 * Misiones diarias y experiencia (XP).
 *
 * Tres misiones al día, elegidas de forma determinista (día + usuario) según
 * lo que te conviene: la sesión del día, algo de la habilidad que más te
 * cuesta o que prefieres, y repaso si tienes pendientes. El progreso se
 * calcula a partir de tu actividad real: no hay que «marcar» nada.
 *
 * La XP se deriva de lo que ya hiciste (ejercicios, aciertos, lecturas…)
 * más las misiones reclamadas: no hay contadores que se desincronicen.
 */
import { hashString, mulberry32 } from "./random";

export type QuestMetric =
  | "session"
  | "exercises"
  | "correct"
  | "minutes"
  | "reviews"
  | "article"
  | "listening"
  | "speaking"
  | "writing"
  | "conversation"
  | "verbs";

export interface Quest {
  id: string;
  metric: QuestMetric;
  target: number;
  title: string;
  icon: string;
  href: string;
  xp: number;
}

export interface DayStats {
  exercises: number;
  correct: number;
  minutes: number;
  wordsReviewed: number;
  /** Eventos de hoy por nombre (session_completed, article_completed…). */
  events: Record<string, number>;
}

const EVENT: Partial<Record<QuestMetric, string>> = {
  session: "session_completed",
  article: "article_completed",
  listening: "listening_completed",
  speaking: "speaking_completed",
  writing: "writing_submitted",
  conversation: "conversation_started",
  verbs: "verbs_completed",
};

export function questValue(q: Quest, s: DayStats): number {
  switch (q.metric) {
    case "exercises":
      return s.exercises;
    case "correct":
      return s.correct;
    case "minutes":
      return s.minutes;
    case "reviews":
      return s.wordsReviewed;
    default:
      return s.events[EVENT[q.metric]!] ?? 0;
  }
}

export interface QuestInput {
  day: string;
  userId: string;
  dueReviews: number;
  dailyMinutes: number;
  /** Actividades favoritas (cuestionario de perfil). */
  favorites: string[];
  /** Habilidad con más margen (si se sabe). */
  weakest: "reading" | "listening" | "speaking" | "writing" | "pronunciation" | "vocabulary" | "grammar" | null;
  aiAvailable: boolean;
  /** El idioma tiene tablas de conjugación (entrenador de verbos). */
  hasVerbs?: boolean;
}

const SKILL_QUEST: Record<string, Omit<Quest, "id">> = {
  read: { metric: "article", target: 1, title: "Lee un texto real hasta el final", icon: "📖", href: "/app/read", xp: 60 },
  listen: { metric: "listening", target: 1, title: "Completa una ronda de escucha", icon: "🎧", href: "/app/listen", xp: 50 },
  speak: { metric: "speaking", target: 1, title: "Lee 8 frases en voz alta", icon: "🎙️", href: "/app/speak", xp: 50 },
  write: { metric: "writing", target: 1, title: "Escribe y corrige un texto", icon: "🖋️", href: "/app/write", xp: 70 },
  tutor: { metric: "conversation", target: 1, title: "Conversa con tu tutor", icon: "💬", href: "/app/tutor", xp: 60 },
  verbs: { metric: "verbs", target: 1, title: "Completa una ronda de verbos", icon: "🔤", href: "/app/verbs", xp: 50 },
};

const WEAK_TO_KIND: Record<string, string> = {
  reading: "read",
  vocabulary: "read",
  listening: "listen",
  speaking: "speak",
  pronunciation: "speak",
  writing: "write",
  grammar: "verbs",
};

export function dailyQuests(input: QuestInput): Quest[] {
  const rand = mulberry32(hashString(`${input.userId}|quests|${input.day}`));
  const quests: Quest[] = [
    { id: "session", metric: "session", target: 1, title: "Completa tu sesión del día", icon: "🎯", href: "/app/session", xp: 50 },
  ];

  // Segunda: la habilidad débil (70 %) o una favorita; nunca el tutor sin IA.
  const kinds = Object.keys(SKILL_QUEST).filter((k) => (k !== "tutor" || input.aiAvailable) && (k !== "verbs" || input.hasVerbs));
  const fav = input.favorites.filter((f) => kinds.includes(f));
  const weakKind = input.weakest ? WEAK_TO_KIND[input.weakest] : undefined;
  let kind: string;
  const weak = weakKind && !kinds.includes(weakKind) && weakKind === "verbs" ? "write" : weakKind;
  if (weak && kinds.includes(weak) && rand() < 0.7) kind = weak;
  else if (fav.length) kind = fav[Math.floor(rand() * fav.length)]!;
  else kind = kinds[Math.floor(rand() * kinds.length)]!;
  quests.push({ id: `skill-${kind}`, ...SKILL_QUEST[kind]! });

  // Tercera: repaso si hay pendientes; si no, un reto de volumen.
  if (input.dueReviews >= 5) {
    const n = Math.min(30, Math.max(5, Math.round(input.dueReviews / 5) * 5));
    quests.push({ id: `reviews-${n}`, metric: "reviews", target: n, title: `Repasa ${n} palabras`, icon: "🔁", href: "/app/review", xp: 40 + n });
  } else if (rand() < 0.5) {
    const n = 15;
    quests.push({ id: `correct-${n}`, metric: "correct", target: n, title: `Consigue ${n} aciertos`, icon: "✅", href: "/app/session", xp: 50 });
  } else {
    const m = Math.max(5, Math.min(30, input.dailyMinutes));
    quests.push({ id: `minutes-${m}`, metric: "minutes", target: m, title: `Estudia ${m} minutos`, icon: "⏱️", href: "/app/explore", xp: 40 + m });
  }
  return quests;
}

// ── XP y nivel de jugador ─────────────────────────────────────────────────
export interface XpInput {
  exercises: number;
  correct: number;
  readings: number;
  writings: number;
  listening: number;
  speaking: number;
  conversations: number;
  achievements: number;
  questXp: number;
}

export function totalXp(s: XpInput): number {
  return (
    s.exercises * 5 +
    s.correct * 5 +
    s.readings * 40 +
    s.writings * 50 +
    s.listening * 30 +
    s.speaking * 30 +
    s.conversations * 40 +
    s.achievements * 100 +
    s.questXp
  );
}

/** XP necesaria para alcanzar el nivel L (curva cuadrática suave: 0, 250, 750, 1500…). */
export const xpForLevel = (level: number) => 125 * level * (level - 1);

export function levelFromXp(xp: number): { level: number; into: number; span: number; progress: number } {
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + (8 * Math.max(0, xp)) / 250)) / 2));
  const base = xpForLevel(level);
  const span = xpForLevel(level + 1) - base;
  return { level, into: xp - base, span, progress: (xp - base) / span };
}

export const LEVEL_TITLES = [
  "Curioso", "Explorador", "Aprendiz", "Viajero", "Conversador", "Lector", "Aventurero", "Políglota en ciernes",
  "Maestro de palabras", "Embajador", "Sabio", "Leyenda",
];

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 3))]!;
}
