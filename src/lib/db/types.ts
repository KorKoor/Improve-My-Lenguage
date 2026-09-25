import type { PersonalityResult } from "../engine/personality";
import type { CefrLevel, Skill } from "../content/types";
import type { CardState } from "../engine/fsrs";
import type { LanguagePriority } from "../engine/multilang";

export interface ProfileRow {
  id: string;
  displayName: string | null;
  nativeLanguage: string;
  activeLanguage: string | null;
  timezone: string;
  theme: "light" | "dark" | "system";
  dailyMinutes: number;
  explanationDepth: "brief" | "balanced" | "detailed";
  preferredDifficulty: "easy" | "balanced" | "challenging";
  competitive: boolean;
  motivation: string | null;
  interests: string[];
  interactionPrefs: string[];
  onboardedAt: Date | null;
  consentAt: Date | null;
  aiConsent: boolean;
  /** Comodidad (accesibilidad): tamaño de letra de toda la app. */
  textSize: TextSize;
  /** Modo sencillo: inicio con una sola acción clara y menos opciones. */
  simpleMode: boolean;
  /** Audio más lento por defecto (0,8×). */
  slowAudio: boolean;
  /** Descansos inteligentes (sugerencias de pausa); activados por defecto. */
  smartBreaks: boolean;
  /** Cuándo terminó (o saltó) el tutorial de bienvenida. */
  tutorialDoneAt: Date | null;
  /** Avatar elegido (emoji de una lista cerrada). */
  avatar: string | null;
  /** Resultado del cuestionario «¿Cómo aprendes mejor?». */
  personality: PersonalityResult | null;
  /** Protectores de racha disponibles (0–2) y días que ya cubrieron. */
  streakFreezes: number;
  frozenDays: string[];
  /** Grupo familiar o de estudio al que pertenece (código), si lo hay. */
  groupId: string | null;
  /** Historial de atención de las últimas sesiones (para el temporizador inteligente). */
  focusHistory: FocusHistoryEntry[];
  createdAt: Date;
}

export interface FocusHistoryEntry {
  /** Minuto en que empezó a decaer la precisión (null = no decayó). */
  onsetMin: number | null;
  durationMin: number;
  breaks: number;
  at: string;
}

export type TextSize = "normal" | "large" | "xl";

export interface UserLanguageRow {
  id: string;
  userId: string;
  languageCode: string;
  selfReportedLevel: CefrLevel | null;
  assessedAt: Date | null;
  /** Prioridad al repartir el tiempo entre varios idiomas (null = por defecto). */
  priority: LanguagePriority | null;
  createdAt: Date;
}

export interface SkillEstimateRow {
  userLanguageId: string;
  skill: Skill;
  theta: number;
  se: number;
  evidence: number;
}

export interface GoalRow {
  id: string;
  userLanguageId: string;
  targetLevel: CefrLevel;
  deadline: string | null;
  minutesPerDay: number;
  reason: string | null;
  createdAt: Date;
}

export interface KnowledgeDbRow {
  userLanguageId: string;
  itemId: string;
  itemType: "vocab" | "grammar";
  status: "learning" | "known" | "difficult" | "saved";
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: CardState;
  dueAt: Date;
  lastReviewAt: Date | null;
  exposureCount: number;
  correctCount: number;
  incorrectCount: number;
  avgResponseMs: number | null;
}

export interface SessionRow {
  id: string;
  userLanguageId: string;
  kind: "daily" | "review" | "focus" | "surprise";
  plannedMinutes: number;
  plan: unknown;
  startedAt: Date;
  completedAt: Date | null;
  durationSeconds: number;
  exercisesCount: number;
  correctCount: number;
}

export interface ActivityRow {
  day: string;
  seconds: number;
  exercises: number;
  correct: number;
  wordsReviewed: number;
  sessions: number;
}
