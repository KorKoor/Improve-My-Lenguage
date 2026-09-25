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
