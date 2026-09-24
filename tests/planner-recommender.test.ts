import { test } from "node:test";
import assert from "node:assert/strict";
import { planSession, type PlannerInput } from "../src/lib/engine/planner";
import { recommend, type RecommenderInput } from "../src/lib/engine/recommender";
import { detectWeaknesses, explainWeakness } from "../src/lib/engine/weakness";

const now = new Date("2026-03-10T12:00:00Z");
const day = (n: number) => new Date(now.getTime() - n * 86_400_000);

const baseInput: PlannerInput = {
  minutes: 24,
  dueReviews: 0,
  newWordsAvailable: 50,
  weaknesses: [],
  weaknessLabel: (c) => c,
  grammarForCategory: (c) => (c === "past-simple" ? "en:g:past-simple" : null),
  skills: [],
  aiAvailable: true,
  audioAvailable: true,
};

test("el plan suma exactamente los minutos disponibles", () => {
  for (const minutes of [5, 10, 20, 24, 30, 45, 60]) {
    for (const dueReviews of [0, 3, 40, 500]) {
      const plan = planSession({ ...baseInput, minutes, dueReviews });
      assert.equal(plan.totalMinutes, minutes, `minutes=${minutes} due=${dueReviews}`);
      assert.ok(plan.blocks.every((b) => b.minutes >= 1 && b.reason.length > 0));
    }
  }
});

test("repasos vencidos van primero y no superan el 45 %", () => {
  const plan = planSession({ ...baseInput, minutes: 20, dueReviews: 500 });
  assert.equal(plan.blocks[0]!.kind, "review");
  assert.ok(plan.blocks[0]!.minutes <= 9);
});

test("sin IA no hay bloque de tutor; con 5 minutos tampoco", () => {
  assert.ok(!planSession({ ...baseInput, aiAvailable: false }).blocks.some((b) => b.kind === "tutor"));
  assert.ok(!planSession({ ...baseInput, minutes: 5 }).blocks.some((b) => b.kind === "tutor"));
});

test("una debilidad recurrente dirige el bloque de gramática y lo explica", () => {
  const weaknesses = detectWeaknesses(
    [
      { category: "past-simple", createdAt: day(1), sessionId: "s1" },
      { category: "past-simple", createdAt: day(2), sessionId: "s2" },
      { category: "past-simple", createdAt: day(3), sessionId: "s3" },
      { category: "articles", createdAt: day(20), sessionId: null },
    ],
    [{ category: "past-simple", total: 10, correct: 4 }],
    ["s1", "s2", "s3", "s4", "s5", "s6"],
    now,
  );
  assert.equal(weaknesses[0]!.category, "past-simple");
  assert.ok(weaknesses[0]!.recurring);
  assert.match(explainWeakness(weaknesses[0]!, "pasado simple"), /3 de tus últimas 6 sesiones/);

  const plan = planSession({ ...baseInput, weaknesses });
  const g = plan.blocks.find((b) => b.kind === "grammar")!;
  assert.equal(g.target, "en:g:past-simple");
  assert.match(g.reason, /3 de las últimas 6/);
});

test("'Sorpréndeme' es reproducible con la misma semilla", () => {
  const a = planSession({ ...baseInput, surprise: true, seed: 7 });
  const b = planSession({ ...baseInput, surprise: true, seed: 7 });
  assert.deepEqual(a, b);
});

const rBase: RecommenderInput = {
  assessed: true,
  dueReviews: 0,
  weaknesses: [],
  weaknessLabel: (c) => c,
  grammarForCategory: () => null,
  skills: [],
  topInterest: "programación",
  studiedToday: false,
};

test("recomendador: prioridad diagnóstico > repasos > debilidad > habilidad", () => {
  assert.equal(recommend({ ...rBase, assessed: false, dueReviews: 99 }).kind, "assessment");
  assert.equal(recommend({ ...rBase, dueReviews: 20 }).kind, "review");
  const weak = detectWeaknesses(
    [1, 2, 3].map((d, i) => ({ category: "prepositions", createdAt: day(d), sessionId: `s${i}` })),
    [],
    ["s0", "s1", "s2", "s3"],
    now,
  );
  const r = recommend({ ...rBase, weaknesses: weak, weaknessLabel: () => "preposiciones" });
  assert.equal(r.kind, "grammar");
  assert.match(r.reason, /preposiciones/);
  const skill = recommend({
    ...rBase,
    skills: [
      { skill: "vocabulary", theta: 1, se: 0.3, evidence: 30 },
      { skill: "listening", theta: -0.5, se: 0.3, evidence: 30 },
    ],
  });
  assert.equal(skill.kind, "skill");
  assert.match(skill.title, /auditiva/);
  assert.equal(recommend(rBase).kind, "session");
  assert.equal(recommend({ ...rBase, studiedToday: true }).kind, "new_words");
});
