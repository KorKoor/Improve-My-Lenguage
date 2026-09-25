import type { CefrLevel, LanguageCode, PartOfSpeech, VocabItem } from "./types";

/**
 * Constructor compacto de vocabulario para los paquetes de idioma.
 * Cada palabra lleva al menos un ejemplo con traducción (nunca "palabra = traducción"
 * a secas) y, cuando aplica, una nota de uso: falsos amigos, género, etc.
 */
export type Ex = [text: string, es: string];

export interface WordSpec {
  slug: string;
  lemma: string;
  pos: PartOfSpeech;
  cefr: CefrLevel;
  band: VocabItem["frequencyBand"];
  ipa: string;
  es: string[];
  examples: Ex[];
  topics: string[];
  note?: string;
  accepted?: string[];
}

export function word(language: LanguageCode, w: WordSpec): VocabItem {
  return {
    id: `${language}:w:${w.slug}`,
    language,
    lemma: w.lemma,
    pos: w.pos,
    cefr: w.cefr,
    frequencyBand: w.band,
    ipa: w.ipa,
    translations: { es: w.es },
    examples: w.examples.map(([text, t]) => ({ text, translation: { es: t } })),
    topics: w.topics,
    register: "neutral",
    usageNote: w.note,
    acceptedForms: w.accepted,
  };
}

/** Atajo posicional (mismo orden que los paquetes de francés/inglés). */
export function wordsFor(language: LanguageCode) {
  return (
    slug: string,
    lemma: string,
    pos: PartOfSpeech,
    cefr: CefrLevel,
    band: VocabItem["frequencyBand"],
    ipa: string,
    es: string[],
    examples: Ex[],
    topics: string[],
    note?: string,
    accepted?: string[],
  ): VocabItem => word(language, { slug, lemma, pos, cefr, band, ipa, es, examples, topics, note, accepted });
}
