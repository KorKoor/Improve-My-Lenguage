import assert from "node:assert/strict";
import { test } from "node:test";
import { buildVocabExercise, learnerStage, letterHint, pickVocabExerciseType, resolveExercise } from "../src/lib/engine/exercises";
import { mulberry32 } from "../src/lib/engine/random";
import { catalog } from "../src/lib/content";

const WRITE = new Set(["recall", "cloze", "dictation", "dictation_word", "conjugate", "rearrange"]);

function types(reps: number, stage: ReturnType<typeof learnerStage>, n = 400) {
  const rand = mulberry32(7);
  const seen = new Set<string>();
  for (let i = 0; i < n; i++) seen.add(pickVocabExerciseType(reps, rand, true, undefined, true, stage, stage));
  return seen;
}

test("escalera: un novato nunca escribe ni hace dictados en sus primeras repeticiones", () => {
  for (const reps of [0, 1, 2, 3]) {
    const t = types(reps, "novice");
    for (const w of WRITE) assert.ok(!t.has(w as never), `reps=${reps} incluye ${w}`);
  }
  // Tras varias repeticiones puede escribir la palabra (con pista), pero nunca dictado de frase.
  assert.ok(types(5, "novice").has("recall"));
  assert.ok(!types(8, "novice").has("dictation"));
});

test("escalera: el dictado de frases sólo llega en nivel intermedio", () => {
  assert.ok(!types(6, "beginner").has("dictation"));
  assert.ok(types(6, "beginner").has("dictation_word"));
  assert.ok(types(6, "intermediate").has("dictation"));
  assert.equal(learnerStage(-2.5), "novice");
  assert.equal(learnerStage(-1.5), "beginner");
  assert.equal(learnerStage(0), "intermediate");
});

test("ejercicios de escucha con opciones: sin texto visible y con respuesta en el servidor", () => {
  const v = catalog.vocab("fr").find((x) => x.examples.length > 0 && (x.translations.es?.length ?? 0) > 0)!;
  const mc = buildVocabExercise("listen_mc", v, catalog, "es")!;
  assert.equal(mc.prompt, "");
  assert.equal(mc.audioText, v.lemma);
  assert.equal(mc.options!.length, 4);
  const r = resolveExercise(mc.key, catalog, "es")!;
  assert.ok(mc.options!.includes(r.accepted[0]!));
  const pick = buildVocabExercise("listen_pick", v, catalog, "es")!;
  assert.ok(pick.options!.includes(v.lemma));
  const w = buildVocabExercise("dictation_word", v, catalog, "es")!;
  assert.equal(resolveExercise(w.key, catalog, "es")!.accepted[0], v.lemma);
  assert.equal(letterHint("maison"), "m _ _ _ _ _");
  assert.equal(letterHint("l'eau"), "l ' _ _ _");
});

test("primeros pasos: 10 unidades completas en los 12 idiomas, con transcripción en escrituras no latinas", async () => {
  const { FIRST_STEPS, hasFirstSteps, unitPhrases } = await import("../src/lib/content/first-steps");
  assert.equal(FIRST_STEPS.length, 10);
  for (const lang of ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ja", "ko", "zh", "ar"] as const) {
    assert.ok(hasFirstSteps(lang), lang);
    for (const u of FIRST_STEPS) {
      const ps = unitPhrases(u, lang);
      assert.equal(new Set(ps.map((p) => p.text)).size, ps.length, `${lang}/${u.id}: frases repetidas`);
      if (["ru", "ja", "ko", "zh", "ar"].includes(lang)) assert.ok(ps.every((p) => p.roman), `${lang}/${u.id}: falta transcripción`);
    }
  }
});

test("recalibración: sólo al principio, con datos suficientes y en ambos sentidos", async () => {
  const { calibrationStep } = await import("../src/lib/engine/calibration");
  assert.equal(calibrationStep({ sessionNumber: 1, total: 5, correct: 0 }), null);
  assert.equal(calibrationStep({ sessionNumber: 2, total: 20, correct: 4 })!.delta, -0.8);
  assert.equal(calibrationStep({ sessionNumber: 2, total: 20, correct: 8 })!.delta, -0.5);
  assert.equal(calibrationStep({ sessionNumber: 3, total: 20, correct: 12 }), null);
  assert.equal(calibrationStep({ sessionNumber: 3, total: 20, correct: 19 })!.delta, 0.3);
  assert.equal(calibrationStep({ sessionNumber: 9, total: 20, correct: 2 }), null);
});

test("frases útiles en sesión: se resuelven en el servidor y no mezclan idiomas", async () => {
  const { buildPhraseExercise, phraseById } = await import("../src/lib/engine/exercises");
  const listen = buildPhraseExercise("ja", 0, 6, "phrase_listen")!;
  assert.equal(listen.prompt, "");
  assert.equal(listen.audioText, "ありがとう");
  const r = resolveExercise(listen.key, catalog, "es")!;
  assert.equal(r.accepted[0], "Gracias");
  assert.ok(listen.options!.includes("Gracias"));
  assert.match(r.display, /arigatō/);
  const pick = buildPhraseExercise("fr", 3, 1, "phrase_pick")!;
  assert.equal(resolveExercise(pick.key, catalog, "es")!.accepted[0], "deux");
  assert.equal(phraseById("fr:p:no-existe:0"), null);
});

test("sesión de novato: incluye frases útiles y nada de escribir ni dictados", async () => {
  const { buildSessionSteps } = await import("../src/lib/engine/session-builder");
  const { grammarFor } = await import("../src/lib/content");
  const plan = { totalMinutes: 10, blocks: [{ kind: "new_words" as const, minutes: 6, reason: "" }, { kind: "listening" as const, minutes: 4, reason: "" }] };
  const steps = buildSessionSteps({ plan, language: "fr", native: "es", catalog, grammar: grammarFor("fr"), knowledge: [], due: [], vocabTheta: -2.8, grammarTheta: -2.8, interests: [], seed: 7 });
  const types = steps.flatMap((s) => (s.kind === "exercise" ? [s.exercise.type] : []));
  assert.ok(types.some((t) => t === "phrase_listen" || t === "phrase_pick"), types.join(","));
  for (const t of ["recall", "cloze", "dictation", "dictation_word", "conjugate"]) assert.ok(!types.includes(t as never), `incluye ${t}`);
});

test("historias: bien formadas (respuesta entre las opciones, sin frases vacías)", async () => {
  const { STORIES } = await import("../src/lib/content/stories");
  for (const [lang, stories] of Object.entries(STORIES)) {
    assert.equal(new Set(stories!.map((s) => s.id)).size, stories!.length, lang);
    for (const s of stories!) {
      assert.ok(s.lines.length >= 5 && s.lines.every((l) => l.t && l.es), `${lang}/${s.id}`);
      assert.ok(s.questions.length >= 3 && s.questions.every((q) => q.options.includes(q.answer) && new Set(q.options).size === q.options.length), `${lang}/${s.id}`);
    }
  }
});
