/**
 * Escala de habilidad ↔ CEFR.
 *
 * Internamente cada habilidad se representa con θ (theta) en escala logit del
 * modelo de Rasch. Los niveles CEFR son una proyección legible de θ, no la
 * fuente de verdad. Ver docs/ADAPTIVE_ENGINE.md.
 */
import { CEFR_LEVELS, type CefrLevel, type Skill, type VocabItem } from "../content/types";

/** Centro (θ) de cada nivel. La dificultad de los ítems usa la misma escala. */
export const CEFR_CENTER: Record<CefrLevel, number> = {
  A1: -2.5,
  A2: -1.5,
  B1: -0.5,
  B2: 0.5,
  C1: 1.5,
  C2: 2.5,
};

/** Umbrales superiores: θ < umbral ⇒ ese nivel. */
const UPPER: [CefrLevel, number][] = [
  ["A1", -2],
  ["A2", -1],
  ["B1", 0],
  ["B2", 1],
  ["C1", 2],
  ["C2", Infinity],
];

/**
 * Dificultad (θ) de una palabra según su rango de frecuencia real:
 * θ = -2,5 + 1,27·ln(rango/300). Calibrada para que los umbrales CEFR caigan
 * en ~450 (A1), ~1 000 (A2), ~2 150 (B1), ~4 750 (B2) y ~10 400 (C1) palabras,
 * coherente con las estimaciones habituales de vocabulario por nivel.
 * Misma curva que el generador de paquetes (scripts/content/build_packs.py).
 */
export function rankToTheta(rank: number): number {
  return -2.5 + 1.27 * Math.log(Math.max(1, rank) / 300);
}

/** θ de una palabra: por frecuencia si la conocemos; si no, el centro de su nivel. */
export function itemTheta(item: Pick<VocabItem, "cefr" | "rank">): number {
  return item.rank ? Math.max(-3.5, Math.min(3.5, rankToTheta(item.rank))) : CEFR_CENTER[item.cefr];
}

export function thetaToCefr(theta: number): CefrLevel {
  for (const [level, upper] of UPPER) if (theta < upper) return level;
  return "C2";
}

export function cefrToTheta(level: CefrLevel): number {
  return CEFR_CENTER[level];
}

export function cefrIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

/**
 * Progreso dentro del nivel actual (0..1). Útil para barras del tipo
 * "B1 · 40 % hacia B2". Calculado linealmente dentro de la banda de 1 logit.
 */
export function progressWithinLevel(theta: number): number {
  const level = thetaToCefr(theta);
  const lower = CEFR_CENTER[level] - 0.5;
  if (level === "A1") return Math.min(1, Math.max(0, (theta + 3.5) / 1.5));
  if (level === "C2") return Math.min(1, Math.max(0, (theta - 2) / 1.5));
  return Math.min(1, Math.max(0, theta - lower));
}

export interface SkillEstimate {
  skill: Skill;
  theta: number;
  /** Error estándar de θ; alto = poca evidencia. */
  se: number;
  /** Número de observaciones que han contribuido. */
  evidence: number;
}

/** Pesos para el nivel global. Las habilidades sin evidencia no cuentan. */
const OVERALL_WEIGHTS: Record<Skill, number> = {
  vocabulary: 1,
  grammar: 1,
  reading: 1,
  listening: 1,
  writing: 0.8,
  speaking: 0.8,
  pronunciation: 0.4,
};

/**
 * Nivel global como media ponderada por peso y precisión (1/se²).
 * Devuelve null si no hay evidencia todavía.
 */
export function overallTheta(estimates: SkillEstimate[]): number | null {
  let num = 0;
  let den = 0;
  for (const e of estimates) {
    if (e.evidence <= 0) continue;
    const precision = 1 / Math.max(0.05, e.se * e.se);
    const w = OVERALL_WEIGHTS[e.skill] * precision;
    num += e.theta * w;
    den += w;
  }
  return den === 0 ? null : num / den;
}

/**
 * Actualización continua de θ tras cada ejercicio (tipo Elo/Rasch online).
 * K decrece con la evidencia acumulada: al principio el sistema se mueve
 * rápido; con meses de datos se vuelve estable.
 */
export function updateSkillOnline(
  est: SkillEstimate,
  itemDifficulty: number,
  correct: boolean,
): SkillEstimate {
  const p = 1 / (1 + Math.exp(-(est.theta - itemDifficulty)));
  const k = Math.max(0.04, 0.5 / Math.sqrt(1 + est.evidence / 4));
  const theta = Math.max(-4, Math.min(4, est.theta + k * ((correct ? 1 : 0) - p)));
  // Información de Fisher del ítem: p(1-p). Reduce el SE poco a poco.
  const info = p * (1 - p);
  const se = Math.max(0.2, 1 / Math.sqrt(1 / (est.se * est.se) + info));
  return { ...est, theta, se, evidence: est.evidence + 1 };
}

export function defaultEstimate(skill: Skill, theta = -1.5): SkillEstimate {
  return { skill, theta, se: 1.5, evidence: 0 };
}
