import "server-only";
import { storiesFor } from "../content/stories";
import * as repo from "../db/repositories";
import { nextLesson } from "../engine/course";
import { nextStep, type NextStep } from "../engine/next-step";
import { localDay } from "../engine/progress";
import { courseFor, getSkills } from "./learning";
import { writingState } from "./orthography";
import { phaseZeroState } from "./phase-zero";
import type { Learner } from "./viewer";

/** Datos para el botón «Seguir aprendiendo» del modo sencillo. */
export async function simpleNextStep(learner: Learner, dueCount: number): Promise<NextStep> {
  const now = new Date();
  const today = localDay(now, learner.profile.timezone);
  const [done, activity, events] = await Promise.all([
    repo.getCourse(learner.ul.id),
    repo.getActivity(learner.userId, today, learner.language.code),
    repo.eventsSince(learner.userId, new Date(now.getTime() - 36 * 3600_000)),
  ]);
  const phase = await phaseZeroState(learner, Object.keys(done).length);
  // Escritura y ortografía: para todo alumno A1–A2 (θ de vocabulario por debajo de B1).
  const a1a2 = (await getSkills(learner.ul.id)).get("vocabulary")!.theta < -1;
  const writing = a1a2 ? await writingState(learner, Object.keys(done).length) : null;
  const todays = events.filter((e) => localDay(e.at, learner.profile.timezone) === today);
  const course = courseFor(learner);
  const stories = storiesFor(learner.language.code);
  return nextStep({
    dueCount,
    courseDone: Object.keys(done).length,
    courseTotal: course.length,
    nextLesson: nextLesson(done, course.length),
    lessonsToday: todays.filter((e) => e.name === "lesson_passed").length,
    minutesToday: Math.round(activity.reduce((a, r) => a + r.seconds, 0) / 60),
    dailyMinutes: learner.profile.dailyMinutes,
    storyId: stories.length ? stories[Number(today.replaceAll("-", "")) % stories.length]!.id : null,
    storiesToday: todays.filter((e) => e.name === "story_completed").length,
    phase: { next: phase.progress.next, done: phase.progress.done, total: phase.progress.total, diagnosed: phase.diagnosed },
    weakLetters: phase.weakLetters,
    writing: writing ? { due: writing.due, next: writing.pick ? { id: writing.pick.unit.id, title: writing.pick.unit.title } : null, reason: writing.pick?.reason } : undefined,
  });
}
