/**
 * Opciones en otra escritura (ruso, árabe, coreano, japonés, chino): cada una
 * con su lectura en letras latinas y su significado, para aprender también
 * de las opciones que no eran. La lectura se muestra según el nivel de
 * transcripción del alumno; el significado, sólo después de responder
 * (antes regalaría la respuesta).
 */
import { hasAlphabet, transliterate } from "../content/alphabets";
import { FIRST_STEPS, unitPhrases } from "../content/first-steps";
import type { LanguageCode, VocabItem } from "../content/types";
import { translationOf, type Exercise } from "./exercises";
import type { SessionStep } from "./session-builder";

export interface OptionInfo {
  reading?: string;
  meaning?: string;
}

/** ¿Las opciones están en el idioma que se aprende? (mismo criterio que la interfaz). */
export function optionsInTarget(ex: Pick<Exercise, "optionsLang" | "type">): boolean {
  return ex.optionsLang ? ex.optionsLang === "target" : !(ex.type === "meaning_mc" || ex.type === "listen_mc" || ex.type === "phrase_listen");
}

type Entry = { reading?: string; meaning: (native: LanguageCode) => string[] };
const indexes = new Map<string, Map<string, Entry>>();
/** Palabra o frase hecha → su lectura y su traducción (por idioma, una vez). */
function lemmaIndex(lang: LanguageCode, vocab: (l: LanguageCode) => VocabItem[]): Map<string, Entry> {
  let idx = indexes.get(lang);
  if (!idx) {
    idx = new Map();
    for (const v of vocab(lang)) if (!idx.has(v.lemma)) idx.set(v.lemma, { reading: v.reading, meaning: (n) => translationOf(v, n) });
    for (const u of FIRST_STEPS) for (const p of unitPhrases(u, lang)) if (!idx.has(p.text)) idx.set(p.text, { reading: p.roman, meaning: () => [p.es] });
    indexes.set(lang, idx);
  }
  return idx;
}

export function optionInfoFor(ex: Exercise, native: LanguageCode, vocab: (l: LanguageCode) => VocabItem[]): Record<string, OptionInfo> | undefined {
  const lang = ex.language;
  if (!ex.options?.length || !hasAlphabet(lang) || !optionsInTarget(ex)) return undefined;
  const idx = lemmaIndex(lang, vocab);
  const out: Record<string, OptionInfo> = {};
  for (const o of ex.options) {
    const v = idx.get(o);
    const reading = transliterate(lang, o, v?.reading) ?? undefined;
    const meaning = v ? v.meaning(native).slice(0, 2).join(", ") || undefined : undefined;
    if (reading || meaning) out[o] = { reading, meaning };
  }
  return Object.keys(out).length ? out : undefined;
}

/** Añade `optionInfo` a los ejercicios de una sesión. */
export function annotateOptions(steps: SessionStep[], native: LanguageCode, vocab: (l: LanguageCode) => VocabItem[]): SessionStep[] {
  return steps.map((s) => {
    if (s.kind !== "exercise") return s;
    const info = optionInfoFor(s.exercise, native, vocab);
    return info ? { ...s, exercise: { ...s.exercise, optionInfo: info } } : s;
  });
}
