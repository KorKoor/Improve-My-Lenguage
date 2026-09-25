/**
 * Diagnóstico adaptativo (Computerized Adaptive Testing) con modelo de Rasch
 * y parámetro de adivinación (3PL con c fijo = 1/nº de opciones): acertar una
 * pregunta de opción múltiple al azar ya no sube el nivel como si se supiera.
 * «No lo sé» cuenta como fallo sin azar posible.
 *
 * - Estimación de θ por EAP (Expected A Posteriori) sobre una rejilla.
 *   Es robusta incluso con todas las respuestas correctas o incorrectas,
 *   a diferencia de la máxima verosimilitud.
 * - Selección del siguiente ítem: máxima información en θ actual
 *   (en Rasch ⇔ dificultad más cercana a θ), alternando habilidades.
 * - Parada: nº máximo de ítems o error estándar suficientemente bajo.
 */
import type { AssessmentItem, Skill } from "../content/types";

export interface AssessmentResponse {
  itemId: string;
  skill: Skill;
  difficulty: number;
  correct: boolean;
  timeMs: number;
  /** Probabilidad de acertar al azar (1/opciones). 0 = sin azar (p. ej. «No lo sé»). */
  guess?: number;
}

export interface AssessmentState {
  language: string;
  responses: AssessmentResponse[];
  /** Estimación previa (p. ej. nivel autodeclarado) para el prior. */
  priorMean: number;
  priorSd: number;
  maxItems: number;
  minItems: number;
  targetSe: number;
}

export interface ThetaEstimate {
  theta: number;
  se: number;
}

const GRID: number[] = (() => {
  const g: number[] = [];
  for (let x = -4; x <= 4.0001; x += 0.1) g.push(Math.round(x * 10) / 10);
  return g;
})();

export const pCorrect = (theta: number, b: number, guess = 0) => guess + (1 - guess) / (1 + Math.exp(-(theta - b)));

export function estimateTheta(
  responses: Pick<AssessmentResponse, "difficulty" | "correct" | "guess">[],
  priorMean = 0,
  priorSd = 1.5,
): ThetaEstimate {
  const logPost = GRID.map((t) => {
    let lp = -((t - priorMean) ** 2) / (2 * priorSd * priorSd);
    for (const r of responses) {
      const p = pCorrect(t, r.difficulty, r.guess ?? 0);
      lp += Math.log(r.correct ? p : 1 - p);
    }
    return lp;
  });
  const max = Math.max(...logPost);
  const w = logPost.map((lp) => Math.exp(lp - max));
  const z = w.reduce((a, b) => a + b, 0);
  const mean = GRID.reduce((acc, t, i) => acc + t * w[i]!, 0) / z;
  const variance = GRID.reduce((acc, t, i) => acc + (t - mean) ** 2 * w[i]!, 0) / z;
  return { theta: mean, se: Math.sqrt(variance) };
}

export function createAssessment(
  language: string,
  opts: Partial<Omit<AssessmentState, "language" | "responses">> = {},
): AssessmentState {
  return {
    language,
    responses: [],
    priorMean: opts.priorMean ?? -1,
    priorSd: opts.priorSd ?? 1.5,
    maxItems: opts.maxItems ?? 18,
    minItems: opts.minItems ?? 8,
    targetSe: opts.targetSe ?? 0.45,
  };
}

export function currentEstimate(state: AssessmentState): ThetaEstimate {
  return estimateTheta(state.responses, state.priorMean, state.priorSd);
}

export function isFinished(state: AssessmentState, bankSize: number): boolean {
  const n = state.responses.length;
  if (n >= state.maxItems || n >= bankSize) return true;
  // Principiante total: 5 fallos (o «No lo sé») seguidos desde el inicio bastan.
  if (n >= 5 && state.responses.every((r) => !r.correct)) return true;
  if (n < state.minItems) return false;
  return currentEstimate(state).se <= state.targetSe;
}

/**
 * Elige el siguiente ítem. Rota habilidades (vocab → gramática → lectura) para
 * que el diagnóstico cubra el vector de habilidades y no sólo una letra.
 */
export function selectNextItem(
  state: AssessmentState,
  bank: AssessmentItem[],
): AssessmentItem | null {
  const used = new Set(state.responses.map((r) => r.itemId));
  const available = bank.filter((i) => !used.has(i.id));
  if (available.length === 0) return null;

  const { theta } = currentEstimate(state);
  const skillsInBank = [...new Set(bank.map((i) => i.skill))];
  const counts = new Map<string, number>();
  for (const r of state.responses) counts.set(r.skill, (counts.get(r.skill) ?? 0) + 1);
  // Habilidad menos evaluada que aún tenga ítems disponibles.
  const targetSkill = skillsInBank
    .filter((s) => available.some((i) => i.skill === s))
    .sort((a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0))[0];

  const pool = available.filter((i) => i.skill === targetSkill);
  const candidates = pool.length > 0 ? pool : available;
  // Máxima información ⇔ |θ - b| mínimo. Desempate estable por id.
  return candidates.reduce((best, item) => {
    const d = Math.abs(item.difficulty - theta);
    const bd = Math.abs(best.difficulty - theta);
    if (d < bd - 1e-9) return item;
    if (Math.abs(d - bd) <= 1e-9 && item.id < best.id) return item;
    return best;
  });
}

export function recordResponse(
  state: AssessmentState,
  item: AssessmentItem,
  correct: boolean,
  timeMs: number,
  dontKnow = false,
): AssessmentState {
  const guess = dontKnow ? 0 : 1 / Math.max(2, item.options.length);
  return {
    ...state,
    responses: [
      ...state.responses,
      { itemId: item.id, skill: item.skill, difficulty: item.difficulty, correct: dontKnow ? false : correct, timeMs, guess },
    ],
  };
}

/** Respuesta especial del botón «No lo sé». */
export const DONT_KNOW = "__dont_know__";

/** θ por habilidad a partir de las respuestas del diagnóstico. */
export function perSkillEstimates(state: AssessmentState): Map<Skill, ThetaEstimate & { n: number }> {
  const overall = currentEstimate(state);
  const bySkill = new Map<Skill, AssessmentResponse[]>();
  for (const r of state.responses) {
    const list = bySkill.get(r.skill) ?? [];
    list.push(r);
    bySkill.set(r.skill, list);
  }
  const out = new Map<Skill, ThetaEstimate & { n: number }>();
  for (const [skill, rs] of bySkill) {
    // Prior centrado en el θ global: con pocos ítems por habilidad, se "encoge"
    // hacia la estimación general (shrinkage) en lugar de dar extremos.
    const est = estimateTheta(rs, overall.theta, 1.0);
    out.set(skill, { ...est, n: rs.length });
  }
  return out;
}
