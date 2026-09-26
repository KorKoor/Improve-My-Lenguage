import "server-only";
import * as repo from "../db/repositories";
import { phaseDone, phaseProgress, phaseZeroUnits, type PhaseProgress, type PhaseUnit } from "../engine/phase-zero";
import type { Learner } from "./viewer";

export interface PhaseZeroState {
  units: PhaseUnit[];
  done: Set<string>;
  progress: PhaseProgress;
  diagnosed: boolean;
  /** Letras y reglas vencidas en la memoria (repaso pendiente). */
  weakLetters: number;
}

/**
 * Estado de la Fase 0 del idioma activo. Quien ya aprobó lecciones del Camino
 * guiado (antes de que existiera la Fase 0) la tiene por superada: no se le
 * obliga a volver atrás, aunque puede entrar cuando quiera.
 */
export async function phaseZeroState(learner: Learner, courseDone?: number): Promise<PhaseZeroState> {
  const ulId = learner.ul.id;
  const [reading, letters, rules, course] = await Promise.all([
    repo.getReadingState(ulId),
    repo.getKnowledgeByType(ulId, "letter"),
    repo.getKnowledgeByType(ulId, "rule"),
    courseDone === undefined ? repo.getCourse(ulId) : Promise.resolve(null),
  ]);
  const lessons = courseDone ?? Object.keys(course ?? {}).length;
  const units = phaseZeroUnits(learner.language.code, learner.profile.latinScript);
  const done = phaseDone(reading.phase, reading.alphabet);
  // Modo accesible: trazar depende de ver las formas, así que ese paso no se exige.
  if (learner.profile.audioFirst) for (const u of units) if (u.kind === "strokes") done.add(u.id);
  const now = Date.now();
  const weakLetters = [...letters, ...rules].filter((k) => k.reps > 0 && k.status !== "known" && k.dueAt.getTime() <= now).length;
  return { units, done, progress: phaseProgress(units, done, reading.skipped || lessons > 0), diagnosed: reading.diagnosed, weakLetters };
}

/** Enlace para jugar una unidad (los trazos tienen su propia página). */
export function unitHref(unit: Pick<PhaseUnit, "id" | "kind">): string {
  return unit.kind === "strokes" ? "/app/start/strokes" : `/app/session?phase=${encodeURIComponent(unit.id)}`;
}
