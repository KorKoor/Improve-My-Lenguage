import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Fsrs,
  newCard,
  retrievability,
  nextIntervalDays,
  ratingFromOutcome,
  currentRetrievability,
} from "../src/lib/engine/fsrs";

const DAY = 86_400_000;
const t0 = new Date("2026-01-01T10:00:00Z");

test("retrievability es 0.9 cuando t = S", () => {
  assert.ok(Math.abs(retrievability(10, 10) - 0.9) < 1e-9);
  assert.equal(retrievability(0, 5), 1);
});

test("intervalo con retención 0.9 ≈ estabilidad", () => {
  assert.ok(Math.abs(nextIntervalDays(7, 0.9) - 7) < 1e-6);
  assert.ok(nextIntervalDays(7, 0.95) < 7, "más retención ⇒ intervalos más cortos");
});

test("primera respuesta: Easy da más estabilidad que Again", () => {
  const f = new Fsrs();
  const again = f.review(newCard(t0), 1, t0);
  const easy = f.review(newCard(t0), 4, t0);
  assert.ok(easy.stability > again.stability);
  assert.ok(easy.difficulty < again.difficulty);
  assert.equal(again.state, "learning");
  assert.equal(easy.state, "review");
  assert.ok(again.due.getTime() - t0.getTime() < DAY, "fallo ⇒ vuelve el mismo día");
});

test("repasos exitosos espaciados hacen crecer la estabilidad", () => {
  const f = new Fsrs();
  let c = f.review(newCard(t0), 3, t0);
  let now = t0;
  const stabilities = [c.stability];
  for (let i = 0; i < 5; i++) {
    now = c.due;
    c = f.review(c, 3, now);
    stabilities.push(c.stability);
  }
  for (let i = 1; i < stabilities.length; i++) {
    assert.ok(stabilities[i]! > stabilities[i - 1]!, `S debe crecer: ${stabilities.join(", ")}`);
  }
  assert.ok(c.stability > 30, "tras 6 aciertos espaciados debería superar un mes");
});

test("olvidar tras un repaso cuenta como lapso y reduce estabilidad", () => {
  const f = new Fsrs();
  let c = f.review(newCard(t0), 3, t0);
  c = f.review(c, 3, c.due);
  const before = c.stability;
  const lapse = f.review(c, 1, new Date(c.due.getTime() + 2 * DAY));
  assert.equal(lapse.lapses, 1);
  assert.equal(lapse.state, "relearning");
  assert.ok(lapse.stability < before);
});

test("dificultad siempre en [1, 10]", () => {
  const f = new Fsrs();
  let c = f.review(newCard(t0), 1, t0);
  for (let i = 0; i < 20; i++) c = f.review(c, 1, new Date(c.due.getTime() + DAY));
  assert.ok(c.difficulty <= 10 && c.difficulty >= 1);
  let e = f.review(newCard(t0), 4, t0);
  for (let i = 0; i < 20; i++) e = f.review(e, 4, e.due);
  assert.ok(e.difficulty >= 1 && e.difficulty <= 10);
});

test("retrievability actual decae con el tiempo", () => {
  const f = new Fsrs();
  const c = f.review(newCard(t0), 3, t0);
  const r1 = currentRetrievability(c, new Date(t0.getTime() + DAY));
  const r10 = currentRetrievability(c, new Date(t0.getTime() + 10 * DAY));
  assert.ok(r1 > r10);
  assert.equal(currentRetrievability(newCard(t0), t0), 0);
});

test("ratingFromOutcome incorpora velocidad, intentos y confianza", () => {
  const base = { correct: true, timeMs: 5000, expectedMs: 6000, attempts: 1 };
  assert.equal(ratingFromOutcome({ ...base, correct: false }), 1);
  assert.equal(ratingFromOutcome({ ...base, attempts: 2 }), 2);
  assert.equal(ratingFromOutcome({ ...base, nearMiss: true }), 2);
  assert.equal(ratingFromOutcome({ ...base, timeMs: 15000 }), 2);
  assert.equal(ratingFromOutcome(base), 3);
  assert.equal(ratingFromOutcome({ ...base, timeMs: 2000 }), 4);
  assert.equal(ratingFromOutcome({ ...base, timeMs: 2000, confidence: 0.3 }), 2);
});
