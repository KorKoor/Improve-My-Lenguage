import assert from "node:assert/strict";
import { test } from "node:test";
import { vocabFor, getVocab } from "../src/lib/content";
import { analyzeTokens, buildLookupIndex, buildQuiz, knownRankForTheta, splitSentences, tokenize } from "../src/lib/reading/text";
import { rankToTheta } from "../src/lib/engine/levels";
import { translationOf } from "../src/lib/engine/exercises";

test("tokenizador: enlaza formas flexionadas con su lema (alemán)", () => {
  const vocab = vocabFor("de");
  const idx = buildLookupIndex("de", vocab);
  const toks = tokenize("de", "Er geht heute nicht in die Schule.", idx, true);
  const words = toks.filter((t) => t.w);
  assert.equal(words.map((t) => t.t).join(" "), "Er geht heute nicht in die Schule");
  const geht = words.find((t) => t.t === "geht")!;
  assert.ok(geht.id, "«geht» debe reconocerse");
  assert.equal(getVocab(geht.id!)?.lemma, "gehen");
  // Reconstruir el texto a partir de los tokens no pierde nada.
  assert.equal(toks.map((t) => t.t).join(""), "Er geht heute nicht in die Schule.");
});

test("tokenizador: japonés sin espacios por palabra más larga", () => {
  const idx = buildLookupIndex("ja", vocabFor("ja"));
  const toks = tokenize("ja", "私は学校に行きます。", idx, false);
  assert.equal(toks.map((t) => t.t).join(""), "私は学校に行きます。");
  assert.ok(toks.some((t) => t.t === "学校" && t.id), "学校 debe segmentarse como una palabra");
});

test("tokenizador: francés con elisión (l'eau)", () => {
  const idx = buildLookupIndex("fr", vocabFor("fr"));
  const toks = tokenize("fr", "Je bois de l'eau.", idx, true);
  const eau = toks.find((t) => t.t.includes("eau"));
  assert.ok(eau?.id, "l'eau debe enlazar con eau");
});

test("análisis: más vocabulario conocido ⇒ más cobertura y el nivel refleja la frecuencia", () => {
  const vocab = vocabFor("en");
  const idx = buildLookupIndex("en", vocab);
  const easy = tokenize("en", "I have a big house and a good friend. We go to school every day.", idx, true);
  const beginner = analyzeTokens(easy, getVocab, 300, new Set());
  const advanced = analyzeTokens(easy, getVocab, 9000, new Set());
  assert.ok(advanced.coverage >= beginner.coverage);
  assert.ok(advanced.coverage > 0.9, `cobertura ${advanced.coverage}`);
  assert.ok(["A1", "A2"].includes(beginner.level), `nivel ${beginner.level}`);
  assert.ok(knownRankForTheta(rankToTheta(2000)) > 1900 && knownRankForTheta(rankToTheta(2000)) < 2100);
});

test("quiz: preguntas resolubles con la respuesta entre las opciones", () => {
  const vocab = vocabFor("en");
  const idx = buildLookupIndex("en", vocab);
  const text = "The government announced a new policy yesterday. Scientists believe the climate is changing faster than expected. Many farmers are worried about the harvest this year.";
  const toks = tokenize("en", text, idx, true);
  const a = analyzeTokens(toks, getVocab, 500, new Set());
  const quiz = buildQuiz({
    sentences: splitSentences(text),
    newWordIds: a.newWords,
    vocabById: getVocab,
    pool: vocab,
    translate: (v) => translationOf(v, "es")[0]!,
    language: "en",
    spaceSeparated: true,
    seed: "t",
  });
  assert.ok(quiz.length >= 3, `sólo ${quiz.length} preguntas`);
  for (const q of quiz) {
    assert.ok(q.options.includes(q.answer), q.prompt);
    assert.equal(new Set(q.options).size, q.options.length, "opciones repetidas");
  }
});
