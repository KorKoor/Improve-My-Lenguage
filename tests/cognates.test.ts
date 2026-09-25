import assert from "node:assert/strict";
import { test } from "node:test";
import { cognateInfo, cognateScore, levenshtein } from "../src/lib/engine/cognates";

test("cognados: correspondencias ortográficas típicas", () => {
  assert.equal(cognateInfo("conversation", "en", ["conversación"])?.kind, "cognate");
  assert.equal(cognateInfo("university", "en", ["universidad"])?.kind, "cognate");
  assert.equal(cognateInfo("université", "fr", ["universidad"])?.kind, "cognate");
  assert.equal(cognateInfo("decisione", "it", ["decisión"])?.kind, "cognate");
  assert.equal(cognateInfo("comunicação", "pt", ["comunicación"])?.kind, "cognate");
  assert.equal(cognateInfo("Situation", "de", ["situación"])?.kind, "cognate");
  assert.ok(cognateScore("family", "en", "familia") >= 0.8);
});

test("cognados: palabras distintas o cortas no cuentan", () => {
  assert.equal(cognateInfo("house", "en", ["casa"]), null);
  assert.equal(cognateInfo("pas", "fr", ["paso", "no"]), null);
  assert.equal(cognateInfo("Hund", "de", ["perro"]), null);
  // Idiomas sin escritura latina o nativos de otra lengua: nada.
  assert.equal(cognateInfo("テレビ", "ja", ["televisión"]), null);
  assert.equal(cognateInfo("conversation", "en", ["conversación"], "fr"), null);
});

test("falsos amigos: la lista curada manda sobre el parecido", () => {
  const f = cognateInfo("embarrassed", "en", ["avergonzado"])!;
  assert.equal(f.kind, "false_friend");
  assert.equal(f.looksLike, "embarazada");
  assert.equal(cognateInfo("burro", "it", ["mantequilla"])?.kind, "false_friend");
  assert.equal(cognateInfo("polvo", "pt", ["pulpo"])?.means, "pulpo");
  assert.equal(levenshtein("kitten", "sitting"), 3);
});
