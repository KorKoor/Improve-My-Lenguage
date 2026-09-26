import assert from "node:assert/strict";
import { test } from "node:test";
import { catalog } from "../src/lib/content";
import { buildVocabExercise } from "../src/lib/engine/exercises";
import { promptReadingFor } from "../src/lib/engine/option-info";
import { phaseZeroUnits } from "../src/lib/engine/phase-zero";

test("sólo letras latinas: el japonés se salta kana, kanji, trazos y palabras «para leer»", () => {
  const units = phaseZeroUnits("ja", true);
  assert.ok(units.length >= 1);
  assert.ok(units.every((u) => u.kind !== "letters" && u.kind !== "strokes" && u.kind !== "words"), JSON.stringify(units.map((u) => u.id)));
  assert.ok(phaseZeroUnits("ja").some((u) => u.kind === "letters"), "sin la opción, sigue enseñando kana");
});

test("sólo letras latinas: en chino se quedan el pinyin y los tonos, no los caracteres", () => {
  const ids = phaseZeroUnits("zh", true).map((u) => u.id);
  assert.ok(ids.some((id) => id.includes("zh-tones")), ids.join(", "));
  assert.ok(!ids.some((id) => id.includes("zh-first") || id === "strokes" || id.startsWith("words")), ids.join(", "));
});

test("la opción no afecta a otros idiomas", () => {
  assert.deepEqual(phaseZeroUnits("ru", true).map((u) => u.id), phaseZeroUnits("ru").map((u) => u.id));
});

test("el enunciado en otra escritura trae su lectura en letras latinas", () => {
  for (const lang of ["ja", "zh"]) {
    const item = catalog.vocab(lang).find((v) => v.cefr === "A1" && v.reading)!;
    const ex = buildVocabExercise("meaning_mc", item, catalog, "es", 1)!;
    const r = promptReadingFor(ex, catalog.vocab);
    assert.ok(r && /^[\p{Script=Latin}\s'’·.,-]+$/u.test(r.normalize("NFC")), `${lang}: «${item.lemma}» → ${r}`);
  }
});
