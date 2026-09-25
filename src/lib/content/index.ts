/**
 * Catálogo de contenido: punto de acceso único al contenido versionado.
 * Todo lo que el motor necesita saber del contenido pasa por aquí, de modo que
 * migrarlo a base de datos o a un CMS en el futuro sólo cambia este módulo.
 */
import { CEFR_CENTER, itemTheta } from "../engine/levels";
import type { Catalog } from "../engine/exercises";
import { EN_ASSESSMENT } from "./en/assessment";
import { EN_GRAMMAR } from "./en/grammar";
import { EN_VOCAB } from "./en/vocab";
import { FR_GRAMMAR, FR_VOCAB } from "./fr";
import { JA_GRAMMAR, JA_VOCAB } from "./ja";
import { DE_GRAMMAR, DE_VOCAB } from "./de";
import { IT_GRAMMAR, IT_VOCAB } from "./it";
import { PT_GRAMMAR, PT_VOCAB } from "./pt";
import { EN_GRAMMAR_ADVANCED } from "./en/grammar-advanced";
import { EN_GRAMMAR_CORE } from "./en/grammar-core";
import { DE_GRAMMAR_CORE } from "./de/grammar-core";
import { FR_GRAMMAR_CORE } from "./fr/grammar-core";
import { FR_GRAMMAR_ADVANCED } from "./fr/grammar-advanced";
import { DE_GRAMMAR_ADVANCED } from "./de/grammar-advanced";
import { IT_GRAMMAR_ADVANCED } from "./it/grammar-advanced";
import { PT_GRAMMAR_ADVANCED } from "./pt/grammar-advanced";
import { JA_GRAMMAR_ADVANCED } from "./ja/grammar-advanced";
import { getLanguage } from "./languages";
import { packVocab } from "./packs";
import { AR_GRAMMAR } from "./ar/grammar";
import { KO_GRAMMAR } from "./ko/grammar";
import { NL_GRAMMAR } from "./nl/grammar";
import { RU_GRAMMAR } from "./ru/grammar";
import { SV_GRAMMAR } from "./sv/grammar";
import { ZH_GRAMMAR } from "./zh/grammar";
import type { AssessmentItem, GrammarConcept, LanguageCode, VocabItem } from "./types";
import { translationOf } from "../engine/exercises";

/** Vocabulario escrito y revisado a mano: tiene prioridad sobre el generado. */
const CURATED_VOCAB: Record<LanguageCode, VocabItem[]> = { en: EN_VOCAB, fr: FR_VOCAB, ja: JA_VOCAB, pt: PT_VOCAB, it: IT_VOCAB, de: DE_VOCAB };
const GRAMMAR: Record<LanguageCode, GrammarConcept[]> = {
  en: [...EN_GRAMMAR, ...EN_GRAMMAR_CORE, ...EN_GRAMMAR_ADVANCED],
  fr: [...FR_GRAMMAR, ...FR_GRAMMAR_ADVANCED, ...FR_GRAMMAR_CORE],
  ja: [...JA_GRAMMAR, ...JA_GRAMMAR_ADVANCED],
  pt: [...PT_GRAMMAR, ...PT_GRAMMAR_ADVANCED],
  it: [...IT_GRAMMAR, ...IT_GRAMMAR_ADVANCED],
  de: [...DE_GRAMMAR, ...DE_GRAMMAR_ADVANCED, ...DE_GRAMMAR_CORE],
  ar: AR_GRAMMAR,
  ko: KO_GRAMMAR,
  nl: NL_GRAMMAR,
  ru: RU_GRAMMAR,
  sv: SV_GRAMMAR,
  zh: ZH_GRAMMAR,
};
const ASSESSMENT: Record<LanguageCode, AssessmentItem[]> = { en: EN_ASSESSMENT };

/** Rango aproximado para contenido curado sin rango (mitad de su banda CEFR). */
const DEFAULT_RANK: Record<string, number> = { A1: 250, A2: 700, B1: 1500, B2: 3400, C1: 7500, C2: 12000 };

const merged = new Map<LanguageCode, VocabItem[]>();
const vocabIndexes = new Map<LanguageCode, Map<string, VocabItem>>();

/**
 * Curado + generado desde datos públicos (data/packs), ordenado por
 * frecuencia real. Si una palabra existe en ambos, gana la curada (que
 * hereda el rango, la IPA y el audio de la generada si le faltan).
 */
function mergedVocab(language: LanguageCode): VocabItem[] {
  let list = merged.get(language);
  if (list) return list;
  const curated = CURATED_VOCAB[language] ?? [];
  const generated = packVocab(language);
  const byLemma = new Map(generated.map((g) => [g.lemma.toLowerCase(), g]));
  const curatedLemmas = new Set(curated.map((c) => c.lemma.toLowerCase()));
  const curatedIds = new Set(curated.map((c) => c.id));
  const enriched = curated.map((c) => {
    const g = byLemma.get(c.lemma.toLowerCase());
    return g ? { ...c, rank: c.rank ?? g.rank, ipa: c.ipa ?? g.ipa, audioUrl: c.audioUrl ?? g.audioUrl } : c;
  });
  const extra = generated.filter((g) => !curatedLemmas.has(g.lemma.toLowerCase()) && !curatedIds.has(g.id));
  list = [...enriched, ...extra].sort((a, b) => (a.rank ?? DEFAULT_RANK[a.cefr]!) - (b.rank ?? DEFAULT_RANK[b.cefr]!));
  merged.set(language, list);
  return list;
}

function vocabIndexFor(language: LanguageCode): Map<string, VocabItem> {
  let idx = vocabIndexes.get(language);
  if (!idx) {
    idx = new Map(mergedVocab(language).map((v) => [v.id, v]));
    vocabIndexes.set(language, idx);
  }
  return idx;
}

const grammarIndex = new Map<string, GrammarConcept>();
for (const list of Object.values(GRAMMAR)) for (const g of list) grammarIndex.set(g.id, g);

export function vocabFor(language: LanguageCode): VocabItem[] {
  return mergedVocab(language);
}

export function grammarFor(language: LanguageCode): GrammarConcept[] {
  return GRAMMAR[language] ?? [];
}

export function getVocab(id: string): VocabItem | undefined {
  return vocabIndexFor(id.split(":")[0]!).get(id);
}

export function getGrammar(id: string): GrammarConcept | undefined {
  return grammarIndex.get(id);
}

export const catalog: Catalog = {
  vocab: vocabFor,
  vocabById: getVocab,
  grammarById: getGrammar,
  spaceSeparated: (code) => getLanguage(code)?.spaceSeparated ?? true,
};

/**
 * Banco de diagnóstico. Si un idioma no tiene banco curado, se genera uno a
 * partir del vocabulario (reconocimiento de significado) y de los ejercicios
 * de opción múltiple de gramática, con dificultad derivada del nivel CEFR.
 */
export function assessmentBankFor(language: LanguageCode, native: LanguageCode): AssessmentItem[] {
  const curated = ASSESSMENT[language];
  if (curated && curated.length > 0) return curated;

  const items: AssessmentItem[] = [];
  const vocab = vocabFor(language);
  // Con miles de palabras basta una muestra de ~300 repartida por todo el rango
  // de frecuencia: el test adaptativo sólo usa 8–18 ítems cercanos a tu nivel.
  const step = Math.max(1, Math.floor(vocab.length / 300));
  for (let i = 0; i < vocab.length; i += step) {
    const v = vocab[i]!;
    const answer = translationOf(v, native)[0];
    if (!answer) continue;
    // Distractores deterministas de frecuencia parecida (plausibles al mismo nivel).
    const distractors: string[] = [];
    for (let d = 1; distractors.length < 3 && d < 40; d++) {
      for (const j of [i + d * 3, i - d * 3]) {
        const o = vocab[j];
        const t = o ? translationOf(o, native)[0] : undefined;
        if (t && t.toLowerCase() !== answer.toLowerCase() && !distractors.includes(t) && distractors.length < 3) distractors.push(t);
      }
    }
    if (distractors.length < 3) continue;
    items.push({
      id: `${language}:a:v:${v.id.split(":").pop()}`,
      language,
      skill: "vocabulary",
      difficulty: itemTheta(v) - 0.3,
      prompt: `¿Qué significa «${v.lemma}»${v.reading ? ` (${v.reading})` : ""}?`,
      options: [answer, ...distractors].sort(),
      answer,
    });
  }
  for (const g of grammarFor(language)) {
    g.exercises.forEach((ex, i) => {
      if (ex.type !== "mc" || !ex.options) return;
      items.push({
        id: `${language}:a:g:${g.id.split(":").pop()}:${i}`,
        language,
        skill: "grammar",
        difficulty: CEFR_CENTER[g.cefr] + 0.2,
        prompt: ex.prompt,
        options: ex.options,
        answer: ex.answers[0]!,
        grammarId: g.id,
      });
    });
  }
  return items;
}

export function getAssessmentItem(id: string, native: LanguageCode): AssessmentItem | undefined {
  const language = id.split(":")[0]!;
  return assessmentBankFor(language, native).find((i) => i.id === id);
}

export { getLanguage, LANGUAGES, learnableLanguages } from "./languages";
export { TOPICS, topicLabel } from "./topics";
export { errorLabel, grammarForCategory, categoriesFor } from "./error-categories";
export type * from "./types";
