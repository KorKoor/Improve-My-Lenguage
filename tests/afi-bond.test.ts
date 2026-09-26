import assert from "node:assert/strict";
import { test } from "node:test";
import { afiMilestones, afiObservations, afiWear, MIN_ROWS, streakMoment, type PatternRow } from "../src/lib/engine/afi-bond";
import { afiDashboardLine, afiPoke } from "../src/lib/engine/afi-voice";

test("Afi estrena accesorios sólo con hitos reales", () => {
  assert.deepEqual(afiWear({ bestStreak: 3, wordsLearned: 20, level: "A1" }), []);
  assert.deepEqual(afiWear({ bestStreak: 7, wordsLearned: 20, level: "A1" }), ["scarf"]);
  assert.deepEqual(afiWear({ bestStreak: 30, wordsLearned: 150, level: "B1" }), ["scarf", "glasses", "flower", "star"]);
  const m = afiMilestones({ bestStreak: 5, wordsLearned: 50, level: null });
  assert.equal(m.find((x) => x.wear === "scarf")!.count, "5 de 7 días");
  assert.equal(m.find((x) => x.wear === "glasses")!.progress, 0.5);
  assert.equal(m.find((x) => x.wear === "star")!.progress, 0);
});

test("momentos de racha: el día que se alcanzan y sólo si ya estudiaste", () => {
  assert.equal(streakMoment(7, false), null);
  assert.equal(streakMoment(8, true), null);
  assert.equal(streakMoment(7, true)?.big, true);
  assert.match(streakMoment(100, true)!.text, /100 días/);
  const line = afiDashboardLine({ studiedToday: true, streak: 30, bestStreak: 30, dueCount: 0, weaknesses: [] });
  assert.equal(line.mood, "celebrating");
  assert.match(line.text, /Treinta días/);
});

test("a veces Afi se equivoca… y se corrige", () => {
  const texts = Array.from({ length: 40 }, (_, i) => afiPoke(1, i * 3 + 1, 15).text);
  assert.ok(texts.some((t) => /Wolke/.test(t)));
});

const at = (iso: string) => new Date(iso);
function rows(): PatternRow[] {
  const out: PatternRow[] = [];
  // Mañanas (08:00 UTC) casi todo bien; noches (21:00 UTC) peor. Martes y jueves.
  const days = ["2026-09-01", "2026-09-03", "2026-09-08", "2026-09-10", "2026-09-15", "2026-09-17", "2026-09-22", "2026-09-24"];
  for (const [i, d] of days.entries()) {
    for (let k = 0; k < 4; k++) out.push({ at: at(`${d}T08:0${k}:00Z`), correct: k !== 3 || i % 2 === 0, type: "meaning_mc", timeMs: i >= 6 ? 2000 : 3500, nearMiss: false });
    for (let k = 0; k < 3; k++) out.push({ at: at(`${d}T21:0${k}:00Z`), correct: k === 0, type: "recall", timeMs: 5000, nearMiss: k === 1 });
  }
  return out;
}

test("Afi aprende cómo aprendes: hora, reconocer vs. recordar, días", () => {
  const obs = afiObservations(rows(), "UTC", at("2026-09-25T12:00:00Z"));
  const ids = obs.map((o) => o.id);
  assert.ok(ids.includes("time"));
  assert.match(obs.find((o) => o.id === "time")!.text, /por la mañana/);
  assert.ok(ids.includes("recall"));
  assert.match(obs.find((o) => o.id === "days")!.text, /martes|jueves/);
  // Con zona horaria de México (UTC-6) las 21:00 UTC son las 15:00: «por la tarde».
  const mx = afiObservations(rows(), "America/Mexico_City", at("2026-09-25T12:00:00Z"));
  assert.match(mx.find((o) => o.id === "time")?.text ?? "", /tarde|mañana|madrugada/);
});

test("con pocos datos, Afi todavía te está conociendo", () => {
  assert.deepEqual(afiObservations(rows().slice(0, MIN_ROWS - 1), "UTC", new Date()), []);
});
