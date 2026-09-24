import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createAssessment,
  estimateTheta,
  isFinished,
  perSkillEstimates,
  recordResponse,
  selectNextItem,
  pCorrect,
} from "../src/lib/engine/assessment";
import { thetaToCefr, updateSkillOnline, defaultEstimate, overallTheta, progressWithinLevel } from "../src/lib/engine/levels";
import type { AssessmentItem } from "../src/lib/content/types";
import { mulberry32 } from "../src/lib/engine/random";

function bank(): AssessmentItem[] {
  const items: AssessmentItem[] = [];
  const skills = ["vocabulary", "grammar", "reading"] as const;
  let n = 0;
  for (let b = -3; b <= 3.01; b += 0.25) {
    for (const skill of skills) {
      items.push({
        id: `t:a:${n++}`,
        language: "t",
        skill,
        difficulty: Math.round(b * 100) / 100,
        prompt: "?",
        options: ["a", "b"],
        answer: "a",
      });
    }
  }
  return items;
}

function simulate(trueTheta: number, seed: number) {
  const items = bank();
  const rand = mulberry32(seed);
  let state = createAssessment("t");
  while (!isFinished(state, items.length)) {
    const item = selectNextItem(state, items)!;
    const correct = rand() < pCorrect(trueTheta, item.difficulty);
    state = recordResponse(state, item, correct, 3000);
  }
  return state;
}

test("EAP: todo correcto sube θ, todo incorrecto la baja, sin infinitos", () => {
  const hi = estimateTheta([2, 2.5, 3].map((d) => ({ difficulty: d, correct: true })));
  const lo = estimateTheta([-2, -2.5, -3].map((d) => ({ difficulty: d, correct: false })));
  assert.ok(hi.theta > 1 && Number.isFinite(hi.theta));
  assert.ok(lo.theta < -1 && Number.isFinite(lo.theta));
});

test("CAT recupera el nivel real con error razonable", () => {
  for (const trueTheta of [-2.5, -0.5, 1.5]) {
    let errSum = 0;
    const runs = 30;
    for (let s = 1; s <= runs; s++) {
      const st = simulate(trueTheta, s * 7919);
      errSum += Math.abs(estimateTheta(st.responses, st.priorMean, st.priorSd).theta - trueTheta);
    }
    const mae = errSum / runs;
    assert.ok(mae < 0.75, `MAE para θ=${trueTheta} fue ${mae.toFixed(2)}`);
  }
});

test("CAT alterna habilidades y no repite ítems", () => {
  const st = simulate(0, 42);
  const ids = st.responses.map((r) => r.itemId);
  assert.equal(new Set(ids).size, ids.length);
  const skills = new Set(st.responses.map((r) => r.skill));
  assert.equal(skills.size, 3);
  assert.ok(st.responses.length >= 8 && st.responses.length <= 18);
  const per = perSkillEstimates(st);
  assert.equal(per.size, 3);
});

test("θ → CEFR", () => {
  assert.equal(thetaToCefr(-3), "A1");
  assert.equal(thetaToCefr(-1.5), "A2");
  assert.equal(thetaToCefr(-0.2), "B1");
  assert.equal(thetaToCefr(0.4), "B2");
  assert.equal(thetaToCefr(1.9), "C1");
  assert.equal(thetaToCefr(3), "C2");
  const p = progressWithinLevel(-0.5);
  assert.ok(p > 0.4 && p < 0.6);
});

test("actualización online: acertar sube θ, fallar la baja, evidencia crece", () => {
  const e = defaultEstimate("grammar", 0);
  const up = updateSkillOnline(e, 0, true);
  const down = updateSkillOnline(e, 0, false);
  assert.ok(up.theta > 0 && down.theta < 0);
  assert.equal(up.evidence, 1);
  assert.ok(up.se < e.se);
});

test("nivel global ignora habilidades sin evidencia", () => {
  assert.equal(overallTheta([defaultEstimate("vocabulary")]), null);
  const o = overallTheta([
    { skill: "vocabulary", theta: 1, se: 0.3, evidence: 20 },
    { skill: "grammar", theta: -1, se: 0.3, evidence: 20 },
    { skill: "speaking", theta: 3, se: 1.5, evidence: 0 },
  ]);
  assert.ok(o !== null && Math.abs(o) < 0.01);
});
