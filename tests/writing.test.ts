import assert from "node:assert/strict";
import { test } from "node:test";
import { getVocab, vocabFor } from "../src/lib/content";
import { buildLookupIndex } from "../src/lib/reading/text";
import { analyzeWriting, buildSpellIndex } from "../src/lib/writing/analyze";

function run(language: string, text: string) {
  const idx = buildLookupIndex(language, vocabFor(language));
  return analyzeWriting({ language, text, idx, spell: buildSpellIndex(idx), vocabById: getVocab, spaceSeparated: true });
}

test("escritura: detecta erratas con sugerencia", () => {
  const a = run("en", "Yesterday I went to the libary with my freind.");
  const spelling = a.issues.filter((i) => i.kind === "spelling").map((i) => i.suggestion);
  assert.ok(spelling.includes("library"), JSON.stringify(a.issues));
  assert.ok(spelling.includes("friend"), JSON.stringify(a.issues));
});

test("escritura: mayúsculas (inicio de frase, «I» en inglés)", () => {
  const a = run("en", "i like music. we play guitar.");
  const caps = a.issues.filter((i) => i.kind === "capital").map((i) => i.suggestion);
  assert.ok(caps.includes("I"));
  assert.ok(caps.includes("We"));
});

test("escritura: acentos en francés", () => {
  const a = run("fr", "Je suis tres fatigue apres le travail.");
  assert.ok(a.issues.some((i) => i.kind === "accent" && i.suggestion === "après"), JSON.stringify(a.issues));
});

test("escritura: sustantivos alemanes en minúscula", () => {
  const a = run("de", "Ich habe ein haus und einen hund.");
  const caps = a.issues.filter((i) => i.kind === "capital").map((i) => i.suggestion);
  assert.ok(caps.includes("Haus") && caps.includes("Hund"), JSON.stringify(caps));
});

test("escritura: un texto correcto puntúa alto y se estima su nivel", () => {
  const a = run("en", "I live in a small house near the park. Every morning I drink coffee and read the news.");
  assert.ok(a.score >= 90, `score ${a.score}`);
  assert.ok(["A1", "A2", "B1"].includes(a.level), a.level);
  assert.equal(a.sentences, 2);
});
