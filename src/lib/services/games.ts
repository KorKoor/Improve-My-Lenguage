import "server-only";
import { vocabFor } from "@/lib/content";
import { transliterate } from "@/lib/content/alphabets";
import type { LanguageCode, VocabItem } from "@/lib/content/types";
import { getAllKnowledge } from "@/lib/db/repositories";
import { translationOf } from "@/lib/engine/exercises";
import { distinctWords, sentenceTiles, type GameSentence, type GameWord } from "@/lib/engine/games";

const POOL = 60;
const CONTENT_POS = new Set(["noun", "verb", "adjective", "adverb"]);

/**
 * Palabras y frases para los minijuegos: primero las que el alumno ya vio
 * (repasarlas jugando es lo que más rinde), luego las más frecuentes de A1–A2.
 * Sólo palabras con traducción a su idioma.
 */
export async function gamePool(opts: { ulId: string; language: LanguageCode; native: LanguageCode; latin: boolean }): Promise<{ words: GameWord[]; sentences: GameSentence[] }> {
  const { language, native, latin } = opts;
  const seen = new Set((await getAllKnowledge(opts.ulId)).filter((k) => k.reps > 0).map((k) => k.itemId));
  // Un significado que se pueda jugar: sin notas gramaticales («(futuro) -ré, -rás…»).
  const meaningOf = (v: VocabItem) => translationOf(v, native).find((t) => !/[()…]|\.\.\.|^-/.test(t) && t.length <= 28);
  const withMeaning = vocabFor(language).filter((v) => meaningOf(v));
  // Palabras con significado propio (casa, comer, grande): «the = el» o «pues» no son un juego.
  const content = withMeaning.filter((v) => CONTENT_POS.has(v.pos));
  const all = content.length >= 24 ? content : withMeaning;
  const easy = (v: VocabItem) => v.cefr === "A1" || v.cefr === "A2";
  const ordered = [
    ...all.filter((v) => seen.has(v.id)),
    ...all.filter((v) => !seen.has(v.id) && easy(v)).sort((a, b) => a.frequencyBand - b.frequencyBand),
  ];

  const toWord = (v: VocabItem): GameWord => {
    const romanized = latin ? transliterate(language, v.lemma, v.reading) : null;
    const text = romanized ?? v.lemma;
    const reading = romanized ? v.lemma : v.reading && v.reading !== v.lemma ? v.reading : undefined;
    return { id: v.id, text, reading, speak: v.lemma, meaning: meaningOf(v)! };
  };
  const words = distinctWords(ordered.map(toWord)).slice(0, POOL);

  const ids = new Set(words.map((w) => w.id));
  const sentences: GameSentence[] = [];
  // Primero frases de sus palabras; si no hay bastantes, de cualquier palabra frecuente.
  for (const v of [...ordered.filter((x) => ids.has(x.id)), ...withMeaning.filter((x) => !ids.has(x.id)).sort((a, b) => a.frequencyBand - b.frequencyBand)]) {
    for (const ex of v.examples) {
      const translation = ex.translation?.[native];
      const tiles = translation ? sentenceTiles(language, ex.text, ex.reading) : null;
      if (tiles && translation && !sentences.some((s) => s.speak === ex.text)) sentences.push({ tiles, translation, speak: ex.text });
    }
    if (sentences.length >= 30) break;
  }
  return { words, sentences };
}
