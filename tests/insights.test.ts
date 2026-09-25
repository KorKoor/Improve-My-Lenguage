import assert from "node:assert/strict";
import { test } from "node:test";
import type { CardMemory } from "../src/lib/engine/fsrs";
import { buildInsights, textCoverage } from "../src/lib/engine/insights";

const now = new Date("2026-09-25T12:00:00Z");
const card = (stability: number, daysAgo: number): CardMemory => ({
  stability,
  difficulty: 5,
  reps: 3,
  lapses: 0,
  state: "review",
  lastReview: new Date(now.getTime() - daysAgo * 86_400_000),
  due: new Date(now.getTime() + 86_400_000),
});

test("cobertura Zipf: las palabras frecuentes cubren mucho más texto", () => {
  const top = textCoverage(Array.from({ length: 500 }, (_, i) => i + 1));
  const rare = textCoverage(Array.from({ length: 500 }, (_, i) => i + 20000));
  assert.ok(top > 0.5 && top < 0.7, String(top));
  assert.ok(rare < 0.01);
});

test("insights: cobertura, previsión, palabras rebeldes y constancia", () => {
  const vocab = Array.from({ length: 120 }, (_, i) => ({
    card: card(20, 2),
    rank: i + 1,
    lemma: `w${i}`,
    lapses: i < 3 ? 4 : 0,
    incorrect: 0,
    correct: 3,
    learned: i >= 3,
  }));
  const activeDays = ["2026-08-28", "2026-09-20", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25"];
  const ins = buildInsights({ now, today: "2026-09-25", activeDays, vocab, weekly: [], level: "A1", languageName: "Inglés" });
  const ids = ins.map((i) => i.id);
  assert.ok(ids.includes("coverage"));
  assert.ok(ids.includes("forecast"));
  assert.ok(ids.includes("leeches"));
  assert.ok(ids.includes("consistency"));
  const f = ins.find((i) => i.id === "forecast")!;
  assert.match(f.title, /A2/);
  assert.match(ins.find((i) => i.id === "consistency")!.title, /^5 de los últimos 7/);
});

test("insights: sin datos suficientes no inventa nada", () => {
  const ins = buildInsights({ now, today: "2026-09-25", activeDays: [], vocab: [], weekly: [], level: null, languageName: "Inglés" });
  assert.deepEqual(ins, []);
});
