import assert from "node:assert/strict";
import { test } from "node:test";
import { afiAnswerLine, afiDashboardLine, afiSessionLine } from "../src/lib/engine/afi-voice";

const base = { studiedToday: false, streak: 0, bestStreak: 0, dueCount: 0, weaknesses: [] };

test("Afi habla de datos reales, en orden de utilidad", () => {
  assert.match(afiDashboardLine({ ...base, weaknesses: [{ label: "Preposiciones", count: 4 }] }).text, /«preposiciones» aparece varias veces/);
  assert.match(afiDashboardLine({ ...base, dueCount: 25 }).text, /25 repasos/);
  assert.equal(afiDashboardLine({ ...base, studiedToday: true, dueCount: 40 }).mood, "proud");
  assert.match(afiDashboardLine({ ...base, bestStreak: 9 }).text, /verte de nuevo/);
  assert.match(afiDashboardLine({ ...base, streak: 5 }).text, /5 días seguidos/);
});

test("tono de Afi: sin exclamaciones ni culpa", () => {
  const all = [
    afiDashboardLine(base), afiDashboardLine({ ...base, streak: 4 }), afiSessionLine(null), afiSessionLine(95), afiSessionLine(75), afiSessionLine(40),
    ...[0, 1, 2].flatMap((s) => [afiAnswerLine(true, 1, s), afiAnswerLine(false, 0, s)]), afiAnswerLine(true, 6, 0),
  ];
  for (const l of all) {
    assert.doesNotMatch(l.text, /!|¡|mal hecho|fallaste|incorrecto/i, l.text);
    assert.ok(l.text.length <= 110, l.text);
  }
});
