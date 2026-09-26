import assert from "node:assert/strict";
import { test } from "node:test";
import { catalog } from "../src/lib/content";
import { buildVocabExercise } from "../src/lib/engine/exercises";
import { optionInfoFor } from "../src/lib/engine/option-info";

test("opciones en otra escritura: lectura y significado de cada una", () => {
  for (const lang of ["ru", "ja", "zh", "ko", "ar"]) {
    const item = catalog.vocab(lang).find((v) => v.examples.length && v.cefr === "A1")!;
    const ex = buildVocabExercise("reverse_mc", item, catalog, "es", 7)!;
    const info = optionInfoFor(ex, "es", catalog.vocab)!;
    assert.ok(info, `${lang}: sin información`);
    for (const o of ex.options!) {
      assert.ok(info[o]?.meaning, `${lang}: «${o}» sin significado`);
    }
    assert.ok(Object.values(info).filter((x) => x.reading).length >= 2, `${lang}: casi sin lecturas`);
  }
});

test("opciones en español o en escritura latina: nada que añadir", () => {
  const ru = catalog.vocab("ru");
  assert.equal(optionInfoFor(buildVocabExercise("meaning_mc", ru[0]!, catalog, "es", 1)!, "es", catalog.vocab), undefined);
  const fr = catalog.vocab("fr");
  assert.equal(optionInfoFor(buildVocabExercise("reverse_mc", fr[0]!, catalog, "es", 1)!, "es", catalog.vocab), undefined);
});
