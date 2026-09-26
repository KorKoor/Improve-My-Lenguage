/**
 * Recolecta los textos que deben sonar sin depender de las voces del
 * dispositivo: letras y reglas de la Fase 0, frases de Primeros pasos,
 * historias, pares mínimos y las palabras básicas (Camino guiado + las más
 * frecuentes). Escribe scripts/audio/.texts/<idioma>.json para build_audio.py.
 *
 *   npx tsx --conditions=react-server scripts/audio/collect-texts.ts [idiomas…]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { catalog } from "../../src/lib/content";
import { FIRST_STEPS, unitPhrases } from "../../src/lib/content/first-steps";
import { pairSetsFor } from "../../src/lib/content/minimal-pairs";
import { letterGroupsFor, rulesFor } from "../../src/lib/content/phase-zero";
import { storiesFor } from "../../src/lib/content/stories";
import { writingFor } from "../../src/lib/content/writing-system";
import { audioKey, speechText } from "../../src/lib/audio-key";
import { courseWords } from "../../src/lib/engine/course";

const LANGS = ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"];
/** Palabras más frecuentes además del núcleo del Camino guiado. */
const TOP_WORDS = 500;
const WORD_POS = new Set(["noun", "verb", "adjective", "interjection", "numeral", "adverb", "pronoun", "preposition", "conjunction", "determiner"]);

export function collect(lang: string): { key: string; text: string; kind: string }[] {
  const out = new Map<string, { key: string; text: string; kind: string }>();
  const add = (text: string | undefined, kind: string) => {
    if (!text) return;
    const t = speechText(text);
    if (!t || t.length > 220) return;
    const key = audioKey(t);
    if (!out.has(key)) out.set(key, { key, text: t, kind });
  };
  for (const g of letterGroupsFor(lang)) for (const l of g.letters) {
    add(l.say ?? l.g, "letter");
    add(l.ex?.w, "letter-example");
  }
  for (const r of rulesFor(lang)) {
    for (const e of r.examples) add(e.say ?? e.w, "rule");
    add(r.check.show, "rule");
    if (r.check.lang === "target") for (const o of r.check.options) add(o, "rule");
  }
  for (const u of FIRST_STEPS) for (const p of unitPhrases(u, lang)) add(p.text, "phrase");
  for (const s of storiesFor(lang)) {
    add(s.title, "story");
    for (const l of s.lines) add(l.t, "story");
  }
  for (const set of pairSetsFor(lang)) for (const p of set.pairs) {
    add(p.a, "pair");
    add(p.b, "pair");
  }
  for (const item of writingFor(lang)?.alphabet ?? []) add(item.say, "alphabet");
  const vocab = catalog.vocab(lang);
  for (const v of courseWords(vocab, "es", 210)) {
    add(v.lemma, "word");
    add(v.examples[0]?.text, "example");
  }
  for (const v of vocab.filter((x) => WORD_POS.has(x.pos)).slice(0, TOP_WORDS)) add(v.lemma, "word");
  return [...out.values()];
}

/** Audios que ya traen las palabras (Wiktionary → Commons): clave del texto → URL. */
export function wordsAudio(lang: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of catalog.vocab(lang)) {
    if (!v.audioUrl) continue;
    const key = audioKey(v.lemma);
    if (!out[key]) out[key] = v.audioUrl.replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
  }
  return out;
}

if (process.argv[1]?.endsWith("collect-texts.ts")) {
  const langs = process.argv.slice(2).length ? process.argv.slice(2) : LANGS;
  const dir = path.join(process.cwd(), "scripts/audio/.texts");
  mkdirSync(dir, { recursive: true });
  for (const lang of langs) {
    const items = collect(lang);
    writeFileSync(path.join(dir, `${lang}.json`), JSON.stringify(items));
    writeFileSync(path.join(dir, `${lang}.words-audio.json`), JSON.stringify(wordsAudio(lang)));
    console.log(`${lang}: ${items.length} textos`);
  }
}
