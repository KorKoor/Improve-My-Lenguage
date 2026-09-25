import assert from "node:assert/strict";
import { test } from "node:test";
import { withPronoun } from "../src/lib/content/conjugation";
import type { VocabItem } from "../src/lib/content/types";
import { buildVerbDrill, gradeConjugation } from "../src/lib/engine/verbs";
import { mulberry32 } from "../src/lib/engine/random";

const verb = (lemma: string, rank: number): VocabItem => ({
  id: `fr:w:${lemma}`,
  language: "fr",
  lemma,
  pos: "verb",
  translations: { es: ["x"] },
  examples: [],
  frequencyBand: 1,
  cefr: "A1",
  register: "neutral",
  topics: [],
  rank,
  conjugation: {
    "ind.pres": ["ai", "as", "a", "avons", "avez", "ont"],
    imp: [null, "aie", null, "ayons", "ayez", null],
  },
});

test("verbos: corrige aceptando pronombre, elisión y acentos como casi", () => {
  assert.equal(gradeConjugation("fr", "avons", 3, "avons").correct, true);
  assert.equal(gradeConjugation("fr", "avons", 3, "Nous avons").correct, true);
  assert.equal(gradeConjugation("fr", "ai", 0, "j'ai").correct, true);
  const g = gradeConjugation("fr", "êtes", 4, "etes");
  assert.equal(g.correct, true);
  assert.equal(g.nearMiss, true);
  assert.equal(gradeConjugation("fr", "avons", 3, "avez").correct, false);
});

test("verbos: el ejercicio respeta tiempos, personas válidas y variedad", () => {
  const items = buildVerbDrill({ verbs: [verb("avoir", 5), verb("aller", 20)], tenses: ["ind.pres", "imp"], count: 6, rand: mulberry32(3) });
  assert.equal(items.length, 6);
  for (const it of items) {
    if (it.tense === "imp") assert.ok([1, 3, 4].includes(it.person));
  }
  assert.ok(items.filter((i) => i.verbId === "fr:w:avoir").length <= 3);
  assert.equal(new Set(items.map((i) => i.key)).size, items.length);
});

test("verbos: pronombre con elisión francesa", () => {
  assert.equal(withPronoun("fr", 0, "ai"), "j'ai");
  assert.equal(withPronoun("fr", 0, "suis"), "je suis");
  assert.equal(withPronoun("de", 2, "hat"), "er hat");
});

test("verbos: en árabe las harakat no cuentan como error", () => {
  const g = gradeConjugation("ar", "كُنْتُ", 0, "كنت");
  assert.equal(g.correct, true);
  assert.equal(g.nearMiss, false);
});

test("ejercicio «conjugar»: se genera y se resuelve con o sin pronombre", async () => {
  const { buildVocabExercise, resolveExercise } = await import("../src/lib/engine/exercises");
  const v = verb("avoir", 5);
  const catalog = {
    vocab: () => [v],
    vocabById: (id: string) => (id === v.id ? v : undefined),
    grammarById: () => undefined,
    spaceSeparated: () => true,
  } as unknown as Parameters<typeof buildVocabExercise>[2];
  const ex = buildVocabExercise("conjugate", v, catalog, "es", 1)!;
  assert.equal(ex.type, "conjugate");
  assert.equal(ex.skill, "grammar");
  const r = resolveExercise(ex.key, catalog, "es")!;
  assert.equal(r.errorCategory, "conjugation");
  const [, , variant] = ex.key.split("|");
  const [tense, person] = variant!.split(":");
  const form = v.conjugation![tense as "ind.pres"]![Number(person)]!;
  assert.ok(r.accepted.includes(form));
  assert.ok(r.accepted.length >= 2);
});

test("ejercicio «speak»: frase corta del ejemplo, resuelto en modo voz", async () => {
  const { buildVocabExercise, resolveExercise } = await import("../src/lib/engine/exercises");
  const v = { ...verb("avoir", 5), examples: [{ text: "J'ai deux chats à la maison.", translation: { es: "Tengo dos gatos en casa." } }] };
  const catalog = {
    vocab: () => [v],
    vocabById: (id: string) => (id === v.id ? v : undefined),
    grammarById: () => undefined,
    spaceSeparated: () => true,
  } as unknown as Parameters<typeof buildVocabExercise>[2];
  const ex = buildVocabExercise("speak", v, catalog, "es")!;
  assert.equal(ex.input, "speech");
  assert.equal(ex.skill, "pronunciation");
  const r = resolveExercise(ex.key, catalog, "es")!;
  assert.equal(r.mode, "speech");
  assert.equal(r.accepted[0], "J'ai deux chats à la maison.");
});
