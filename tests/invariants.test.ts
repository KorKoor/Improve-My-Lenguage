/**
 * Invariantes del motor comprobadas con muchos casos aleatorios (semilla fija):
 * propiedades que deben cumplirse SIEMPRE, no sólo en los ejemplos a mano.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { mulberry32 } from "../src/lib/engine/random";
import { learnerStage, pickVocabExerciseType } from "../src/lib/engine/exercises";
import { allocateTime, type LanguagePriority } from "../src/lib/engine/multilang";
import { buildStudyPlan } from "../src/lib/engine/study-plan";
import { readFocus } from "../src/lib/engine/focus";
import { estimateTheta } from "../src/lib/engine/assessment";
import { Fsrs, newCard } from "../src/lib/engine/fsrs";

const rand = mulberry32(20260926);
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]!;
const CODES = ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"];
const PRIOS: LanguagePriority[] = ["main", "active", "maintain"];

function randomStats() {
  const n = 1 + Math.floor(rand() * 5);
  const codes = [...CODES].sort(() => rand() - 0.5).slice(0, n);
  return codes.map((code) => ({
    code,
    priority: pick(PRIOS),
    due: Math.floor(rand() * 200),
    minutesWeek: Math.floor(rand() * 300),
    daysSince: rand() < 0.2 ? null : Math.floor(rand() * 10),
    goalMinutes: rand() < 0.5 ? 5 + Math.floor(rand() * 30) : null,
    minutesToday: Math.floor(rand() * 30),
  }));
}

test("invariante: un novato nunca escribe ni hace dictados antes de su 3.ª repetición", () => {
  for (let i = 0; i < 5000; i++) {
    const reps = Math.floor(rand() * 4);
    const t = pickVocabExerciseType(reps, rand, rand() < 0.8, { ear: rand() * 2 - 1, challenge: rand() * 2 - 1 }, rand() < 0.5, "novice", pick(["novice", "beginner", "intermediate"] as const));
    assert.ok(!["recall", "cloze", "dictation", "dictation_word", "conjugate", "rearrange", "speak"].includes(t), `reps=${reps} → ${t}`);
  }
});

test("invariante: el dictado de frases nunca aparece si la escucha no es intermedia", () => {
  for (let i = 0; i < 5000; i++) {
    const listen = pick(["novice", "beginner"] as const);
    const t = pickVocabExerciseType(Math.floor(rand() * 20), rand, true, { ear: rand() * 2 - 1, challenge: rand() * 2 - 1 }, true, pick(["novice", "beginner", "intermediate"] as const), listen);
    assert.notEqual(t, "dictation");
  }
  assert.equal(learnerStage(-2.2), "novice");
});

test("invariante: el reparto suma el total, en bloques de 5 y el principal no recibe menos", () => {
  for (let i = 0; i < 2000; i++) {
    const stats = randomStats();
    const total = 5 * (1 + Math.floor(rand() * 24));
    const a = allocateTime(stats, total);
    assert.equal(a.reduce((s, x) => s + x.minutes, 0), total, JSON.stringify({ stats, total, a }));
    assert.ok(a.every((x) => x.minutes >= 5 && x.minutes % 5 === 0));
    const main = a.find((x) => stats.find((s) => s.code === x.code)?.priority === "main");
    if (main && a.length > 1 && total >= 15) assert.ok(a.every((x) => x.minutes <= main.minutes || x === main), JSON.stringify(a));
  }
});

test("invariante: el plan de estudio suma el total y nunca empieza, acaba ni repite descanso", () => {
  for (let i = 0; i < 1500; i++) {
    const total = 5 + Math.floor(rand() * 176);
    const p = buildStudyPlan(randomStats(), { total, span: 8 + Math.floor(rand() * 38), seed: i });
    assert.equal(p.blocks.reduce((s, b) => s + b.minutes, 0), p.total);
    assert.equal(p.blocks[0]!.kind, "study");
    assert.equal(p.blocks.at(-1)!.kind, "study");
    for (let k = 1; k < p.blocks.length; k++) assert.ok(!(p.blocks[k]!.kind === "break" && p.blocks[k - 1]!.kind === "break"));
    assert.ok(p.blocks.every((b) => b.minutes >= 1));
  }
});

test("invariante: la lectura de foco siempre está en [0,1] y no manda parar al calentar", () => {
  for (let i = 0; i < 3000; i++) {
    const n = Math.floor(rand() * 40);
    const events = Array.from({ length: n }, (_, k) => ({ correct: rand() < 0.6, timeMs: 500 + rand() * 60_000, atMin: k * 0.5 }));
    const r = readFocus(events, { span: 5 + rand() * 40, sinceBreakMin: rand() * 90 });
    assert.ok(r.fatigue >= 0 && r.fatigue <= 1);
    if (n < 6) assert.ok(r.advice === "continue" || r.advice === "micro_break");
  }
});

test("invariante: EAP finito y monótono (más aciertos → θ no menor)", () => {
  for (let i = 0; i < 500; i++) {
    const rs = Array.from({ length: 1 + Math.floor(rand() * 15) }, () => ({ difficulty: rand() * 6 - 3, correct: rand() < 0.5, guess: rand() < 0.5 ? 0.25 : 0 }));
    const base = estimateTheta(rs, -2, 1.4);
    assert.ok(Number.isFinite(base.theta) && base.se > 0);
    const flipped = rs.map((r, k) => (k === 0 ? { ...r, correct: true } : r));
    assert.ok(estimateTheta(flipped, -2, 1.4).theta >= base.theta - 1e-9);
  }
});

test("invariante: FSRS nunca programa en el pasado y acertar no acorta el intervalo", () => {
  const f = new Fsrs();
  for (let i = 0; i < 1000; i++) {
    let now = new Date(Date.UTC(2026, 0, 1));
    let card = newCard(now);
    for (let k = 0; k < 8; k++) {
      const rating = pick([1, 2, 3, 4] as const);
      card = f.review(card, rating, now);
      assert.ok(card.due.getTime() >= now.getTime(), "due en el pasado");
      now = new Date(card.due.getTime() + Math.floor(rand() * 3) * 86_400_000);
    }
    const good = f.review(card, 3, now);
    const easy = f.review(card, 4, now);
    assert.ok(easy.due.getTime() >= good.due.getTime());
  }
});
