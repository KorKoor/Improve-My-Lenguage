import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPath } from "../src/lib/engine/path";

test("camino: estados y progreso por nivel", () => {
  const vocab = [
    ...Array.from({ length: 10 }, (_, i) => ({ id: `a1-${i}`, cefr: "A1" as const })),
    ...Array.from({ length: 10 }, (_, i) => ({ id: `a2-${i}`, cefr: "A2" as const })),
  ];
  const grammar = [{ id: "g1", cefr: "A1" as const }, { id: "g2", cefr: "A2" as const }];
  const knowledge = new Map<string, { learned: boolean; known: boolean; stability: number; reps: number }>();
  for (let i = 0; i < 10; i++) knowledge.set(`a1-${i}`, { learned: true, known: false, stability: 10, reps: 3 });
  for (let i = 0; i < 3; i++) knowledge.set(`a2-${i}`, { learned: false, known: true, stability: 0, reps: 0 });
  knowledge.set("g1", { learned: false, known: false, stability: 9, reps: 4 });
  const skills = [{ skill: "vocabulary", theta: -1.8 }, { skill: "grammar", theta: -2.2 }];
  const path = buildPath({ vocab, grammar, knowledge, skills });
  assert.equal(path[0]!.status, "done");
  assert.equal(path[0]!.progress, 1);
  assert.equal(path[1]!.status, "current");
  assert.equal(path[1]!.vocab.done, 3);
  assert.equal(path[2]!.status, "next");
  assert.equal(path[3]!.status, "locked");
  // A2: vocab 0.3·0.5 + gramática 0 + habilidades (1 de 2 ≥ -2.0)·0.2
  assert.equal(path[1]!.progress, 0.25);
});
