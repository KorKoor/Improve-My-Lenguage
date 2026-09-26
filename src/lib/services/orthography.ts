import "server-only";
import { writingUnits } from "../content/writing-system";
import * as repo from "../db/repositories";
import { pickWritingUnit, writingDue, type WritingPick, type WritingUnitRef } from "../engine/writing";
import type { Learner } from "./viewer";

const DAY = 86_400_000;

export interface WritingState {
  units: WritingUnitRef[];
  done: Set<string>;
  /** Errores de escritura de las últimas 4 semanas por categoría. */
  mistakes: Record<string, number>;
  pick: WritingPick | null;
  /** ¿Se propone ya en «Seguir aprendiendo»? */
  due: boolean;
}

/** Estado de «Escritura y ortografía» del idioma activo. */
export async function writingState(learner: Learner, courseDone?: number): Promise<WritingState> {
  const ulId = learner.ul.id;
  const [reading, recent, course] = await Promise.all([
    repo.getReadingState(ulId),
    repo.recentMistakes(ulId, new Date(Date.now() - 28 * DAY)),
    courseDone === undefined ? repo.getCourse(ulId) : Promise.resolve(null),
  ]);
  const lessons = courseDone ?? Object.keys(course ?? {}).length;
  const mistakes: Record<string, number> = {};
  for (const m of recent) mistakes[m.category] = (mistakes[m.category] ?? 0) + 1;
  const units = writingUnits(learner.language.code);
  const done = new Set(Object.keys(reading.writing).filter((k) => (reading.writing[k] ?? 0) > 0));
  const pick = pickWritingUnit(learner.language.code, done, mistakes);
  return { units, done, mistakes, pick, due: writingDue(lessons, done.size, pick, mistakes) };
}

export const writingHref = (unitId: string) => `/app/session?writing=${encodeURIComponent(unitId)}`;
