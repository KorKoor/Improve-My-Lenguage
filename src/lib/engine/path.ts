/**
 * «Tu camino a C1»: cuánto has completado de cada nivel CEFR, con criterios
 * explícitos y comprobables (no un porcentaje inventado):
 *   - vocabulario: palabras del nivel aprendidas (FSRS) o marcadas como sabidas;
 *   - gramática: temas del nivel practicados con memoria estable (≥ 7 días);
 *   - habilidades: cuántas de tus habilidades medidas alcanzan ya el nivel.
 * Un nivel se da por completado al 90 %. Puro → testeable.
 */
import type { CefrLevel } from "../content/types";
import { CEFR_CENTER } from "./levels";

export const PATH_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export interface PathInput {
  vocab: { id: string; cefr: CefrLevel }[];
  grammar: { id: string; cefr: CefrLevel }[];
  /** itemId → estado de memoria. */
  knowledge: Map<string, { learned: boolean; known: boolean; stability: number; reps: number }>;
  /** θ de las habilidades con evidencia. */
  skills: { skill: string; theta: number }[];
}

export interface PathLevel {
  level: CefrLevel;
  vocab: { done: number; total: number };
  grammar: { done: number; practiced: number; total: number };
  skills: { done: number; total: number };
  progress: number;
  status: "done" | "current" | "next" | "locked";
}

const WEIGHTS = { vocab: 0.5, grammar: 0.3, skills: 0.2 };

export function buildPath(input: PathInput): PathLevel[] {
  const ratio = (d: number, t: number) => (t > 0 ? Math.min(1, d / t) : 1);
  const levels = PATH_LEVELS.map((level) => {
    const words = input.vocab.filter((v) => v.cefr === level);
    const vocabDone = words.filter((v) => {
      const k = input.knowledge.get(v.id);
      return Boolean(k && (k.learned || k.known));
    }).length;
    const concepts = input.grammar.filter((g) => g.cefr === level);
    const practiced = concepts.filter((g) => (input.knowledge.get(g.id)?.reps ?? 0) > 0).length;
    const solid = concepts.filter((g) => (input.knowledge.get(g.id)?.stability ?? 0) >= 7).length;
    // Una habilidad «alcanza» el nivel cuando su θ llega a la frontera inferior de la banda.
    const skillsDone = input.skills.filter((s) => s.theta >= CEFR_CENTER[level] - 0.5).length;
    const progress =
      WEIGHTS.vocab * ratio(vocabDone, words.length) +
      WEIGHTS.grammar * ratio(solid + 0.5 * (practiced - solid), concepts.length) +
      WEIGHTS.skills * (input.skills.length ? skillsDone / input.skills.length : 0);
    return {
      level,
      vocab: { done: vocabDone, total: words.length },
      grammar: { done: solid, practiced, total: concepts.length },
      skills: { done: skillsDone, total: input.skills.length },
      progress: Math.round(progress * 1000) / 1000,
    };
  });
  // Actual = el primero sin completar; los anteriores, hechos; el siguiente, a la vista.
  const cur = levels.findIndex((l) => l.progress < 0.9);
  return levels.map((l, i): PathLevel => ({
    ...l,
    status: cur < 0 || i < cur ? "done" : i === cur ? "current" : i === cur + 1 ? "next" : "locked",
  }));
}
