import assert from "node:assert/strict";
import { test } from "node:test";
import { catalog, grammarFor } from "../src/lib/content";
import { buildCourse, COURSE_LENGTH, lessonPassed, lessonSteps, nextLesson } from "../src/lib/engine/course";

const LANGS = ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"] as const;

test("camino guiado: 30 lecciones en los 12 idiomas, palabras sin repetir", () => {
  for (const lang of LANGS) {
    const c = buildCourse(lang, catalog.vocab(lang), grammarFor(lang), "es", ["a", "b"]);
    assert.equal(c.length, COURSE_LENGTH, lang);
    const ids = c.flatMap((l) => l.wordIds);
    assert.equal(new Set(ids).size, ids.length, `${lang}: palabras repetidas`);
    assert.ok(c.every((l) => l.wordIds.length >= 5), `${lang}: lecciones con pocas palabras`);
    assert.ok(c.slice(0, 10).every((l) => l.unitIdx !== null), `${lang}: las 10 primeras llevan frases`);
    assert.ok(c.slice(10).every((l) => l.unitIdx === null));
    assert.ok(c.some((l) => l.grammarId), `${lang}: sin gramática`);
    assert.deepEqual(c.map((l) => l.n), Array.from({ length: 30 }, (_, i) => i + 1));
  }
});

test("camino guiado: una lección sólo tiene ejercicios de reconocimiento y repasa la anterior", () => {
  const grammar = grammarFor("fr");
  const c = buildCourse("fr", catalog.vocab("fr"), grammar, "es");
  for (const n of [1, 5, 11, 12, 30]) {
    const steps = lessonSteps(c[n - 1]!, c[n - 2] ?? null, "fr", "es", catalog, grammar, 42);
    const types = steps.flatMap((s) => (s.kind === "exercise" ? [s.exercise.type] : []));
    for (const t of ["recall", "cloze", "dictation", "dictation_word", "conjugate", "speak"]) assert.ok(!types.includes(t as never), `lección ${n}: ${t}`);
    assert.ok(steps.filter((s) => s.kind === "intro").length >= 5, `lección ${n}: pocas fichas`);
    assert.ok(types.length >= 8, `lección ${n}: ${types.length} ejercicios`);
    if (n > 1) assert.ok(steps.some((s) => s.kind === "exercise" && s.block === "review"));
    if (n <= 10) assert.ok(types.some((t) => t.startsWith("phrase_")));
    const keys = steps.flatMap((s) => (s.kind === "exercise" ? [s.exercise.key] : []));
    assert.equal(new Set(keys).size, keys.length, "ejercicios repetidos");
  }
});

test("camino guiado: aprobar con 60 % y la siguiente es la primera sin aprobar", () => {
  assert.ok(lessonPassed(6, 10));
  assert.ok(!lessonPassed(5, 10));
  assert.ok(!lessonPassed(0, 0));
  assert.equal(nextLesson({}), 1);
  assert.equal(nextLesson({ 1: 2, 2: 1, 4: 3 }), 3);
  assert.equal(nextLesson(Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, 1]))), 30);
});

test("seguir aprendiendo: un solo botón que elige bien el siguiente paso", async () => {
  const { nextStep } = await import("../src/lib/engine/next-step");
  const base = { dueCount: 0, courseDone: 3, courseTotal: 30, nextLesson: 4, lessonsToday: 0, minutesToday: 0, dailyMinutes: 15, storyId: "cafe", storiesToday: 0 };
  assert.equal(nextStep(base).kind, "lesson");
  assert.equal(nextStep(base).href, "/app/session?lesson=4");
  assert.equal(nextStep({ ...base, dueCount: 12 }).kind, "review");
  assert.equal(nextStep({ ...base, lessonsToday: 2, minutesToday: 8 }).kind, "story");
  assert.equal(nextStep({ ...base, lessonsToday: 2, minutesToday: 8, storiesToday: 1 }).kind, "session");
  assert.equal(nextStep({ ...base, lessonsToday: 2, minutesToday: 20 }).kind, "done");
  assert.equal(nextStep({ ...base, courseDone: 30, minutesToday: 0 }).kind, "session");
});

test("errores dirigidos: con 3 fallos de género en francés, la sesión practica género (≥ 2 ejercicios)", async () => {
  const { planSession } = await import("../src/lib/engine/planner");
  const { buildSessionSteps } = await import("../src/lib/engine/session-builder");
  const { errorLabel, grammarForCategory } = await import("../src/lib/content");
  const { defaultEstimate } = await import("../src/lib/engine/levels");
  const weak = { category: "fr:articles-gender", count: 3, sessionsWithError: 2, recentSessions: 3, errorRate: 0.4, score: 3, recurring: true };
  for (const seed of [1, 2, 3, 4, 5]) {
    const plan = planSession({
      minutes: 15, dueReviews: 0, newWordsAvailable: 500, weaknesses: [weak], weaknessLabel: errorLabel, grammarForCategory,
      skills: (["vocabulary", "grammar", "reading", "listening"] as const).map((s) => defaultEstimate(s, -1.5)), aiAvailable: false, audioAvailable: true, seed,
    });
    const steps = buildSessionSteps({ plan, language: "fr", native: "es", catalog, grammar: grammarFor("fr"), knowledge: [], due: [], vocabTheta: -1.5, grammarTheta: -1.5, interests: [], seed });
    const gender = steps.filter((s) => s.kind === "exercise" && s.exercise.grammarId === "fr:g:gender-articles");
    assert.ok(gender.length >= 2, `seed ${seed}: ${gender.length} ejercicios de género · bloques ${plan.blocks.map((b) => b.kind + ":" + (b.target ?? "")).join(",")}`);
  }
});
