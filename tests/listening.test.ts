import assert from "node:assert/strict";
import { test } from "node:test";
import { gradeDictation, words } from "../src/lib/listening/diff";

test("dictado perfecto (ignora mayúsculas y puntuación)", () => {
  const r = gradeDictation("Where are you going?", "where are you going");
  assert.equal(r.correct, true);
  assert.equal(r.score, 1);
  assert.ok(r.parts.every((p) => p.kind === "ok"));
});

test("dictado: palabra que falta y palabra que sobra", () => {
  const r = gradeDictation("I have never been to Paris", "I have been to the Paris");
  assert.deepEqual(r.parts.map((p) => `${p.kind}:${p.text}`), ["ok:i", "ok:have", "missing:never", "ok:been", "ok:to", "extra:the", "ok:paris"]);
  assert.equal(r.correct, false);
});

test("dictado: acentos y erratas cuentan como casi bien", () => {
  const r = gradeDictation("Él está en la biblioteca", "el esta en la bibloteca");
  assert.ok(r.parts.filter((p) => p.kind === "typo").length >= 2);
  assert.ok(r.score > 0.8, `score ${r.score}`);
});

test("dictado en japonés: se compara carácter a carácter", () => {
  assert.deepEqual(words("水をください。", false), ["水", "を", "く", "だ", "さ", "い"]);
  const r = gradeDictation("水をください。", "水をください", false);
  assert.equal(r.correct, true);
});
