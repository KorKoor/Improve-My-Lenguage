import "server-only";
import * as repo from "../db/repositories";
import { afiMilestones, afiObservations, MIN_ROWS, type AfiMilestone, type AfiObservation, type BondStats } from "../engine/afi-bond";
import { overallTheta, thetaToCefr } from "../engine/levels";
import { getSkills } from "./learning";
import type { Learner } from "./viewer";

export interface AfiBondView {
  milestones: AfiMilestone[];
  observations: AfiObservation[];
  /** Respuestas analizadas y cuántas faltan para que Afi pueda decir algo. */
  answers: number;
  needed: number;
}

/** Lo que Afi ha aprendido de ti (últimas 8 semanas) y su colección de accesorios. */
export async function afiBond(learner: Learner, stats: Omit<BondStats, "level">): Promise<AfiBondView> {
  const now = new Date();
  const [rows, skills] = await Promise.all([
    repo.patternRows(learner.ul.id, new Date(now.getTime() - 56 * 86_400_000)),
    getSkills(learner.ul.id),
  ]);
  const theta = overallTheta([...skills.values()].filter((s) => s.evidence > 0));
  return {
    milestones: afiMilestones({ ...stats, level: theta === null ? null : thetaToCefr(theta) }),
    observations: afiObservations(rows, learner.profile.timezone, now),
    answers: rows.length,
    needed: Math.max(0, MIN_ROWS - rows.length),
  };
}
