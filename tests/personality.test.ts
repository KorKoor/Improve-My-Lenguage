import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePersonality, PERSONALITY_QUESTIONS, scorePersonality } from "../src/lib/engine/personality";
import { planSession } from "../src/lib/engine/planner";

const all = (v: number) => Object.fromEntries(PERSONALITY_QUESTIONS.map((q) => [q.id, v]));

test("personalidad: respuestas neutras ⇒ dimensiones 0 y ajustes equilibrados", () => {
  const r = scorePersonality(all(3));
  for (const v of Object.values(r.dims)) assert.equal(v, 0);
  assert.equal(r.archetype, "steady");
  assert.equal(r.tuning.preferredDifficulty, "balanced");
  assert.equal(r.tuning.explanationDepth, "balanced");
});

test("personalidad: a quien le gusta el reto y escuchar se le sube la dificultad y la escucha", () => {
  const answers = { ...all(3), q3: 5, q4: 1, q12: 5, q13: 1 };
  const r = scorePersonality(answers);
  assert.equal(r.dims.challenge, 1);
  assert.equal(r.dims.ear, 1);
  assert.equal(r.tuning.preferredDifficulty, "challenging");
  assert.ok((r.tuning.blockWeights.listening ?? 1) > 1.4);
  assert.ok(["challenger", "listener"].includes(r.archetype));
  assert.ok(r.tuning.favorites.includes("listen"));
});

test("personalidad: valores fuera de rango se ignoran (cuentan como neutros)", () => {
  const r = scorePersonality({ q1: 99, q2: -4, q3: 2.5 as number });
  assert.ok(Math.abs(r.dims.pace) < 1e-9);
  assert.ok(Object.values(r.dims).every((v) => v >= -1 && v <= 1));
});

test("personalidad: se serializa y se vuelve a leer", () => {
  const r = scorePersonality({ ...all(3), q7: 5, q8: 1 });
  const back = parsePersonality(JSON.parse(JSON.stringify(r)));
  assert.equal(back?.archetype, r.archetype);
  assert.equal(back?.tuning.explanationDepth, "detailed");
  assert.equal(parsePersonality({ version: 2 }), null);
});

test("planificador: los pesos de estilo reparten más minutos a lo preferido", () => {
  const base = {
    minutes: 30,
    dueReviews: 0,
    newWordsAvailable: 500,
    weaknesses: [],
    weaknessLabel: (c: string) => c,
    grammarForCategory: () => null,
    skills: [],
    aiAvailable: false,
    audioAvailable: true,
  };
  const neutral = planSession(base);
  const ear = planSession({ ...base, styleWeights: { listening: 1.6, new_words: 0.8 } });
  const mins = (p: typeof neutral, k: string) => p.blocks.find((b) => b.kind === k)?.minutes ?? 0;
  assert.ok(mins(ear, "listening") > mins(neutral, "listening"));
  assert.equal(ear.totalMinutes, neutral.totalMinutes);
  assert.match(ear.blocks.find((b) => b.kind === "listening")!.reason, /forma de aprender/);
});

test("tipo de ejercicio: quien prefiere escuchar recibe más dictados", async () => {
  const { pickVocabExerciseType } = await import("../src/lib/engine/exercises");
  const { mulberry32 } = await import("../src/lib/engine/random");
  const count = (style?: { ear: number; challenge: number }) => {
    const rand = mulberry32(7);
    let n = 0;
    for (let i = 0; i < 2000; i++) if (pickVocabExerciseType(3, rand, true, style) === "dictation") n++;
    return n;
  };
  assert.ok(count({ ear: 1, challenge: 0 }) > count() * 1.4);
  assert.ok(count({ ear: -1, challenge: 0 }) < count());
});

test("retención objetivo: el reto y el poco tiempo repasan algo menos; ir seguro, algo más", async () => {
  const { targetRetention } = await import("../src/lib/engine/fsrs");
  assert.equal(targetRetention({ dailyMinutes: 20 }), 0.9);
  assert.equal(targetRetention({ challenge: 0.8, dailyMinutes: 20 }), 0.88);
  assert.equal(targetRetention({ challenge: -0.8, dailyMinutes: 20 }), 0.92);
  assert.equal(targetRetention({ challenge: 0.8, dailyMinutes: 5 }), 0.87);
});
