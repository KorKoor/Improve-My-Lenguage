/**
 * Planificador de sesiones del Adaptive Learning Engine.
 *
 * Determinista y explicable: dada la disponibilidad de tiempo y el estado del
 * usuario, reparte minutos entre bloques y justifica cada uno. La IA no
 * interviene aquí (coste 0, sin alucinaciones, testeable).
 *
 * Prioridad = repetición espaciada vencida > debilidad recurrente >
 *             habilidad más baja > vocabulario nuevo de interés.
 */
import type { Skill } from "../content/types";
import type { SkillEstimate } from "./levels";
import { mulberry32 } from "./random";
import type { Weakness } from "./weakness";

export type BlockKind = "review" | "new_words" | "grammar" | "listening" | "tutor";

export interface PlanBlock {
  kind: BlockKind;
  minutes: number;
  reason: string;
  /** Categoría de error o concepto objetivo (para el bloque de gramática). */
  target?: string;
}

export interface PlannerInput {
  minutes: number;
  dueReviews: number;
  newWordsAvailable: number;
  weaknesses: Weakness[];
  /** Etiquetas legibles de las categorías de error. */
  weaknessLabel: (category: string) => string;
  /** Categoría → concepto gramatical practicable (si existe). */
  grammarForCategory: (category: string) => string | null;
  skills: SkillEstimate[];
  aiAvailable: boolean;
  audioAvailable: boolean;
  difficulty?: "easy" | "balanced" | "challenging";
  surprise?: boolean;
  seed?: number;
  /** Multiplicadores según tu forma de aprender (cuestionario de perfil). */
  styleWeights?: Partial<Record<BlockKind, number>>;
}

export interface SessionPlan {
  totalMinutes: number;
  blocks: PlanBlock[];
}

const MIN_BLOCK = 2;
/** Minutos aproximados por tarjeta de repaso. */
export const MINUTES_PER_REVIEW = 0.3;

const SKILL_LABEL: Partial<Record<Skill, string>> = {
  listening: "comprensión auditiva",
  vocabulary: "vocabulario",
  grammar: "gramática",
  speaking: "expresión oral",
  writing: "expresión escrita",
  reading: "comprensión lectora",
};

function weakestSkill(skills: SkillEstimate[], among: Skill[]): Skill | null {
  const relevant = skills.filter((s) => among.includes(s.skill) && s.evidence > 0);
  if (relevant.length < 2) return null;
  return relevant.sort((a, b) => a.theta - b.theta)[0]!.skill;
}

export function planSession(input: PlannerInput): SessionPlan {
  const total = Math.max(5, Math.min(90, Math.round(input.minutes)));
  const rand = mulberry32(input.seed ?? 1);
  const weights = new Map<BlockKind, number>();
  const reasons = new Map<BlockKind, string>();
  let grammarTarget: string | undefined;

  // 1. Repasos vencidos: tienen prioridad, con tope del 45 % de la sesión.
  let reviewMinutes = 0;
  if (input.dueReviews > 0) {
    reviewMinutes = Math.min(
      Math.ceil(input.dueReviews * MINUTES_PER_REVIEW),
      Math.floor(total * 0.45),
    );
    reviewMinutes = Math.max(MIN_BLOCK, reviewMinutes);
    reasons.set(
      "review",
      `Tienes ${input.dueReviews} ${input.dueReviews === 1 ? "elemento listo" : "elementos listos"} para repasar antes de que se te olviden.`,
    );
  }

  // 2. Debilidad recurrente con gramática asociada.
  const top = input.weaknesses.find((w) => w.recurring && input.grammarForCategory(w.category));
  if (top) {
    grammarTarget = input.grammarForCategory(top.category) ?? undefined;
    weights.set("grammar", 3);
    const label = input.weaknessLabel(top.category);
    reasons.set(
      "grammar",
      top.sessionsWithError > 0 && top.recentSessions > 0
        ? `Practicamos ${label}: aparece en tus errores de ${top.sessionsWithError} de las últimas ${top.recentSessions} sesiones.`
        : `Practicamos ${label}: es tu error más frecuente últimamente (${top.count}).`,
    );
  } else {
    weights.set("grammar", 1.5);
    reasons.set("grammar", "Consolidamos gramática de tu nivel.");
  }

  // 3. Vocabulario nuevo.
  if (input.newWordsAvailable > 0) {
    weights.set("new_words", 2.5);
    reasons.set("new_words", "Añadimos vocabulario nuevo, útil y relacionado con tus intereses.");
  }

  // 4. Listening (requiere síntesis de voz en el navegador).
  if (input.audioAvailable) {
    weights.set("listening", 1.5);
    reasons.set("listening", "Entrenamos el oído con dictados cortos.");
  }

  // 5. Tutor conversacional (sólo si hay IA y tiempo suficiente).
  if (input.aiAvailable && total >= 15) {
    weights.set("tutor", 1.5);
    reasons.set("tutor", "Usas lo aprendido en una conversación breve con tu tutor.");
  }

  // La habilidad más débil recibe un empujón explícito.
  const weak = weakestSkill(input.skills, ["vocabulary", "grammar", "listening", "speaking"]);
  const boostKind: Partial<Record<Skill, BlockKind>> = {
    vocabulary: "new_words",
    grammar: "grammar",
    listening: "listening",
    speaking: "tutor",
  };
  if (weak) {
    const kind = boostKind[weak];
    if (kind && weights.has(kind)) {
      weights.set(kind, weights.get(kind)! * 1.6);
      reasons.set(kind, `${reasons.get(kind)} Es tu habilidad con más margen de mejora (${SKILL_LABEL[weak]}).`);
    }
  }

  if (input.difficulty === "easy") weights.set("new_words", (weights.get("new_words") ?? 0) * 0.7);
  if (input.difficulty === "challenging" && weights.has("tutor")) {
    weights.set("tutor", weights.get("tutor")! * 1.3);
  }

  // Tu forma de aprender: más peso a lo que te motiva, sin eliminar nada.
  for (const [kind, m] of Object.entries(input.styleWeights ?? {}) as [BlockKind, number][]) {
    if (!weights.has(kind) || !(m > 0)) continue;
    weights.set(kind, weights.get(kind)! * m);
    if (m >= 1.2) reasons.set(kind, `${reasons.get(kind)} Encaja con tu forma de aprender.`);
  }

  // "Sorpréndeme": perturbación suave y reproducible.
  if (input.surprise) {
    for (const [k, w] of weights) weights.set(k, w * (0.7 + rand() * 0.6));
  }

  // Reparto proporcional del tiempo restante.
  const remaining = total - reviewMinutes;
  const entries = [...weights.entries()].filter(([, w]) => w > 0);
  const sumW = entries.reduce((a, [, w]) => a + w, 0);
  let alloc = entries.map(([kind, w]) => ({ kind, minutes: (remaining * w) / sumW }));

  // Bloques demasiado cortos se eliminan y su tiempo se redistribuye.
  while (alloc.length > 1 && alloc.some((a) => a.minutes < MIN_BLOCK)) {
    alloc.sort((a, b) => a.minutes - b.minutes);
    const dropped = alloc.shift()!;
    const s = alloc.reduce((acc, a) => acc + a.minutes, 0);
    alloc = alloc.map((a) => ({ ...a, minutes: a.minutes + (dropped.minutes * a.minutes) / s }));
  }

  // Redondeo que preserva el total (método del mayor resto).
  const floored = alloc.map((a) => ({ ...a, int: Math.floor(a.minutes), frac: a.minutes % 1 }));
  let left = remaining - floored.reduce((acc, a) => acc + a.int, 0);
  floored.sort((a, b) => b.frac - a.frac);
  for (const f of floored) {
    if (left <= 0) break;
    f.int += 1;
    left -= 1;
  }

  const order: BlockKind[] = ["review", "new_words", "grammar", "listening", "tutor"];
  const blocks: PlanBlock[] = [];
  if (reviewMinutes > 0) {
    blocks.push({ kind: "review", minutes: reviewMinutes, reason: reasons.get("review")! });
  }
  for (const f of floored.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))) {
    if (f.int <= 0) continue;
    blocks.push({
      kind: f.kind,
      minutes: f.int,
      reason: reasons.get(f.kind)!,
      target: f.kind === "grammar" ? grammarTarget : undefined,
    });
  }
  return { totalMinutes: blocks.reduce((a, b) => a + b.minutes, 0), blocks };
}

/** Nº aproximado de ejercicios que caben en un bloque. */
export function exercisesForBlock(block: PlanBlock): number {
  const perMinute: Record<BlockKind, number> = {
    review: 1 / MINUTES_PER_REVIEW,
    new_words: 2,
    grammar: 2,
    listening: 1.5,
    tutor: 0,
  };
  return Math.max(1, Math.round(block.minutes * perMinute[block.kind]));
}
