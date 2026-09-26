import assert from "node:assert/strict";
import { test } from "node:test";
import { afiPhase } from "../src/components/afi/afi";
import { AFI_WAKE, afiGaze, afiPoke, afiSleepAfter } from "../src/lib/engine/afi-voice";

test("Afi reacciona distinto según cuántas veces seguidas lo tocas", () => {
  assert.equal(afiPoke(1, 1, 15).motion, "hop");
  assert.equal(afiPoke(3, 1, 15).motion, "wiggle");
  assert.match(afiPoke(3, 1, 15).text, /cosquillas/);
  assert.equal(afiPoke(6, 1, 15).mood, "confused");
  assert.match(afiPoke(9, 1, 15).text, /mareando/);
});

test("Afi saluda según la hora al primer toque", () => {
  assert.match(afiPoke(1, 3, 8).text, /Buenos días/);
  assert.equal(afiPoke(1, 3, 23).mood, "sleepy");
  assert.doesNotMatch(afiPoke(1, 4, 8).text, /Buenos días/);
});

test("las frases varían con la semilla y nunca están vacías", () => {
  const texts = new Set(Array.from({ length: 20 }, (_, i) => afiPoke(1, i * 3 + 1, 15).text));
  assert.ok(texts.size >= 5);
  for (const t of texts) assert.ok(t.length > 10);
  assert.equal(AFI_WAKE.mood, "surprised");
});

test("de noche Afi se duerme antes", () => {
  assert.ok(afiSleepAfter(23) < afiSleepAfter(15));
  assert.ok(afiSleepAfter(3) < afiSleepAfter(10));
});

test("la mirada sigue al puntero sin salirse de los ojos", () => {
  assert.deepEqual(afiGaze(0, 0, 96), { x: 0, y: 0 });
  const right = afiGaze(400, 0, 96);
  assert.ok(right.x > 1 && right.x <= 2.6 && right.y === 0);
  const far = afiGaze(-99999, 99999, 96);
  assert.equal(far.x, -2.6);
  assert.equal(far.y, 2);
  assert.ok(afiGaze(50, 0, 96).x < afiGaze(300, 0, 96).x);
});

test("cada Afi tiene su propio ritmo de parpadeo, estable entre servidor y cliente", () => {
  assert.equal(afiPhase("happy96"), afiPhase("happy96"));
  assert.notEqual(afiPhase("happy96"), afiPhase("waving180"));
  for (const k of ["a", "happy96", "sleepy40"]) assert.ok(afiPhase(k) >= 0 && afiPhase(k) < 6);
});
