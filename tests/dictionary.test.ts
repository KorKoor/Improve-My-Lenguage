import assert from "node:assert/strict";
import { test } from "node:test";
import { formOfLemma, lemmaIfOnlyForms, parseDefinitions, stripHtml } from "../src/lib/reading/dictionary-parse";

test("diccionario: limpia HTML y elige el idioma correcto", () => {
  assert.equal(stripHtml('<a href="/wiki/x">bank</a> of a <i>river</i> &amp; more'), "bank of a river & more");
  const data = {
    en: [{ partOfSpeech: "Noun", definitions: [{ definition: "English sense" }] }],
    fr: [
      { partOfSpeech: "Noun", definitions: [{ definition: "<b>bench</b>" }, { definition: "bank (financial)" }, { definition: "plural of foo" }] },
      { partOfSpeech: "Verb", definitions: [{ definition: "" }] },
    ],
  };
  const senses = parseDefinitions(data, "fr");
  assert.equal(senses.length, 1);
  assert.equal(senses[0]!.pos, "sustantivo");
  assert.deepEqual(senses[0]!.definitions, ["bench", "bank (financial)", "plural of foo"]);
  assert.deepEqual(parseDefinitions(data, "de"), []);
});

test("diccionario: detecta formas flexionadas y su lema", () => {
  assert.equal(formOfLemma("third-person singular simple present indicative of octopus"), "octopus");
  assert.equal(formOfLemma("plural of Haus"), "Haus");
  assert.equal(formOfLemma("first-person singular preterite of gehen."), "gehen");
  assert.equal(formOfLemma("a large sea creature"), null);
  assert.equal(lemmaIfOnlyForms([{ pos: "verbo", definitions: ["past participle of ver"] }]), "ver");
  assert.equal(lemmaIfOnlyForms([{ pos: "sustantivo", definitions: ["plural of cat", "a feline"] }]), null);
});
