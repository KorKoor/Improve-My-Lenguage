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
        options: ["a", "b", "c", "d"],
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
    const correct = rand() < pCorrect(trueTheta, item.difficulty, 0.25);
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

test("diagnóstico: un principiante total de francés no sale A2 (azar, cognados, «No lo sé»)", async () => {
  const { assessmentBankFor } = await import("../src/lib/content");
  const { cognateInfo } = await import("../src/lib/engine/cognates");
  const bank = assessmentBankFor("fr", "es");
  const run = (answer: (item: (typeof bank)[number], i: number) => "right" | "wrong" | "idk") => {
    let s = createAssessment("fr", { priorMean: -2.3, priorSd: 1.4, maxItems: 18, minItems: 8 });
    for (let i = 0; !isFinished(s, bank.length); i++) {
      const item = selectNextItem(s, bank)!;
      const a = answer(item, i);
      s = recordResponse(s, item, a === "right", 4000, a === "idk");
    }
    return s;
  };
  const isCognate = (item: (typeof bank)[number]) => {
    const m = /«(.+)»/.exec(item.prompt);
    return Boolean(m && cognateInfo(m[1]!, "fr", [item.answer])?.kind === "cognate");
  };
  // Adivina al azar (1 de cada 4) pero acierta siempre los cognados.
  const guesser = run((item, i) => (isCognate(item) || i % 4 === 0 ? "right" : "wrong"));
  const g = estimateTheta(guesser.responses, guesser.priorMean, guesser.priorSd);
  assert.equal(thetaToCefr(g.theta), "A1", `θ=${g.theta.toFixed(2)}`);
  // Pulsa «No lo sé» salvo en cognados: A1 y termina pronto.
  const honest = run((item) => (isCognate(item) ? "right" : "idk"));
  assert.equal(thetaToCefr(estimateTheta(honest.responses, honest.priorMean, honest.priorSd).theta), "A1");
  // Todo «No lo sé»: se detiene a las 5 preguntas.
  assert.equal(run(() => "idk").responses.length, 5);
});

test("diagnóstico: el parámetro de azar reduce el premio de acertar", () => {
  assert.ok(pCorrect(0, 0, 0.25) > pCorrect(0, 0));
  const lucky = [{ difficulty: 0, correct: true, guess: 0.25 }];
  const sure = [{ difficulty: 0, correct: true, guess: 0 }];
  assert.ok(estimateTheta(lucky, -2, 1.4).theta < estimateTheta(sure, -2, 1.4).theta);
});
