import "server-only";
import { assessmentBankFor, getGrammar } from "../content";
import type { AssessmentItem, CefrLevel, Skill } from "../content/types";
import {
  createAssessment,
  currentEstimate,
  isFinished,
  perSkillEstimates,
  recordResponse,
  selectNextItem,
  type AssessmentState,
  DONT_KNOW,
} from "../engine/assessment";
import { evaluateChoice } from "../engine/evaluate";
import { cefrToTheta, thetaToCefr, type SkillEstimate } from "../engine/levels";
import * as repo from "../db/repositories";
import { checkAchievements } from "./learning";
import type { Learner } from "./viewer";

export interface ClientAssessmentItem {
  id: string;
  skill: AssessmentItem["skill"];
  prompt: string;
  passage?: string;
  audio?: string;
  options: string[];
}

export type AssessmentStep =
  | { done: false; assessmentId: string; item: ClientAssessmentItem; answered: number; maxItems: number }
  | { done: true; assessmentId: string; result: AssessmentResult };

export interface AssessmentResult {
  level: CefrLevel;
  theta: number;
  perSkill: { skill: Skill; level: CefrLevel; theta: number; n: number }[];
  answered: number;
  correct: number;
}

const toClient = (i: AssessmentItem): ClientAssessmentItem => ({
  id: i.id,
  skill: i.skill,
  prompt: i.prompt,
  passage: i.passage,
  audio: i.audio,
  // Orden alfabético: la posición nunca delata la respuesta correcta.
  options: [...i.options].sort((a, b) => a.localeCompare(b, "es")),
});

export async function startOrResumeAssessment(learner: Learner, restart = false): Promise<AssessmentStep> {
  const bank = assessmentBankFor(learner.language.code, learner.native);
  let row = restart ? null : await repo.getOpenAssessment(learner.ul.id);
  if (row && row.currentItemId) {
    const state = row.state as AssessmentState;
    const item = bank.find((i) => i.id === row!.currentItemId);
    if (item) return { done: false, assessmentId: row.id, item: toClient(item), answered: state.responses.length, maxItems: state.maxItems };
  }
  const self = learner.ul.selfReportedLevel;
  // Sin nivel declarado se parte de A1: es mejor subir rápido que abrumar.
  const state = createAssessment(learner.language.code, {
    priorMean: self ? cefrToTheta(self) : -2.3,
    priorSd: self ? 1.2 : 1.4,
    maxItems: Math.min(18, bank.length),
    minItems: Math.min(8, bank.length),
  });
  const first = selectNextItem(state, bank);
  if (!first) throw new Error("No hay banco de diagnóstico para este idioma");
  row = await repo.createAssessmentRow(learner.ul.id, state);
  await repo.updateAssessmentRow(row.id, learner.ul.id, { state, currentItemId: first.id });
  await repo.track(learner.userId, "assessment_started", { language: learner.language.code });
  return { done: false, assessmentId: row.id, item: toClient(first), answered: 0, maxItems: state.maxItems };
}

/**
 * «Empiezo desde cero»: sin diagnóstico. Todas las habilidades arrancan en
 * A1 bajo (θ = −3) con incertidumbre alta, así los primeros ejercicios son de
 * reconocimiento y el nivel sube solo en cuanto aciertes.
 */
export async function startFromZero(learner: Learner): Promise<void> {
  const skills: Skill[] = ["vocabulary", "grammar", "reading", "listening", "writing", "speaking", "pronunciation"];
  await repo.upsertSkillEstimates(learner.ul.id, skills.map((skill) => ({ skill, theta: -3, se: 0.9, evidence: 1 })));
  await repo.markAssessed(learner.ul.id);
  await repo.track(learner.userId, "assessment_skipped_beginner", { language: learner.language.code });
}

export async function answerAssessment(
  learner: Learner,
  assessmentId: string,
  itemId: string,
  choice: string,
  timeMs: number,
): Promise<AssessmentStep> {
  const row = await repo.getOpenAssessment(learner.ul.id);
  if (!row || row.id !== assessmentId) throw new Error("Diagnóstico no encontrado o caducado");
  // Sólo se acepta respuesta al ítem que el servidor entregó (evita saltarse ítems).
  if (row.currentItemId !== itemId) throw new Error("Ítem inesperado");
  const bank = assessmentBankFor(learner.language.code, learner.native);
  const item = bank.find((i) => i.id === itemId);
  if (!item) throw new Error("Ítem desconocido");

  const dontKnow = choice === DONT_KNOW;
  const correct = !dontKnow && evaluateChoice(choice, item.answer).correct;
  let state = recordResponse(row.state as AssessmentState, item, correct, Math.max(0, Math.min(timeMs, 600_000)), dontKnow);

  if (!isFinished(state, bank.length)) {
    const next = selectNextItem(state, bank);
    if (next) {
      await repo.updateAssessmentRow(row.id, learner.ul.id, { state, currentItemId: next.id });
      return { done: false, assessmentId: row.id, item: toClient(next), answered: state.responses.length, maxItems: state.maxItems };
    }
  }

  // ── Fin: resultados y siembra del perfil
  const overall = currentEstimate(state);
  const per = perSkillEstimates(state);
  const estimates: SkillEstimate[] = [];
  for (const [skill, est] of per) estimates.push({ skill, theta: est.theta, se: Math.max(0.35, est.se), evidence: est.n });
  // Habilidades no evaluadas: se inicializan con el nivel global pero con mucha incertidumbre.
  for (const skill of ["vocabulary", "grammar", "reading", "listening", "writing", "speaking", "pronunciation"] as Skill[]) {
    if (!per.has(skill)) estimates.push({ skill, theta: overall.theta - (skill === "speaking" || skill === "pronunciation" ? 0.3 : 0), se: 1.2, evidence: 0 });
  }
  await repo.upsertSkillEstimates(learner.ul.id, estimates);

  // Errores del diagnóstico en temas de gramática → primeras debilidades conocidas.
  const mistakes = state.responses
    .filter((r) => !r.correct)
    .map((r) => bank.find((i) => i.id === r.itemId))
    .filter((i): i is AssessmentItem => !!i?.grammarId)
    .map((i) => ({
      userLanguageId: learner.ul.id,
      sessionId: null,
      attemptId: null,
      source: "assessment" as const,
      category: getGrammar(i.grammarId!)?.errorCategory ?? "tense",
      subcategory: "diagnostic",
      userText: null,
      correctedText: i.answer,
      explanation: i.prompt,
    }));
  await repo.insertMistakes(mistakes);

  const result: AssessmentResult = {
    level: thetaToCefr(overall.theta),
    theta: overall.theta,
    perSkill: [...per.entries()].map(([skill, e]) => ({ skill, level: thetaToCefr(e.theta), theta: e.theta, n: e.n })),
    answered: state.responses.length,
    correct: state.responses.filter((r) => r.correct).length,
  };
  state = { ...state };
  await repo.updateAssessmentRow(row.id, learner.ul.id, { state, currentItemId: null, status: "completed", result });
  await repo.markAssessed(learner.ul.id);
  await repo.track(learner.userId, "assessment_completed", { level: result.level, n: result.answered });
  await checkAchievements(learner);
  return { done: true, assessmentId: row.id, result };
}
