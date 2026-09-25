import assert from "node:assert/strict";
import { test } from "node:test";
import { splitGoals } from "../src/lib/ai/prompts";
import { SCENARIOS, scenarioFromTopic } from "../src/lib/content/scenarios";

test("escenarios: el marcador de objetivos se separa y valida", () => {
  assert.deepEqual(splitGoals("Sure! Here is your coffee.\n[[goals:1, 2]]"), { text: "Sure! Here is your coffee.", goals: [1, 2] });
  assert.deepEqual(splitGoals("Hello! What can I get you?\n[[goals:]]"), { text: "Hello! What can I get you?", goals: [] });
  assert.deepEqual(splitGoals("Hi [[goals:1,7,0,3,3]]").goals, [1, 3]);
  assert.deepEqual(splitGoals("No marker here").goals, []);
});

test("escenarios: ids únicos, 3 objetivos en los dos idiomas y tema reversible", () => {
  assert.equal(new Set(SCENARIOS.map((s) => s.id)).size, SCENARIOS.length);
  for (const s of SCENARIOS) {
    assert.equal(s.goals.length, 3);
    assert.equal(s.goalsEn.length, 3);
    assert.equal(scenarioFromTopic(`scenario:${s.id}`)?.id, s.id);
  }
  assert.equal(scenarioFromTopic("scenario:nope"), undefined);
  assert.equal(scenarioFromTopic("Mi día"), undefined);
});
