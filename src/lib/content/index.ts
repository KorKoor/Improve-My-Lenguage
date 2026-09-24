/**
 * Catálogo de contenido: punto de acceso único al contenido versionado.
 * Todo lo que el motor necesita saber del contenido pasa por aquí, de modo que
 * migrarlo a base de datos o a un CMS en el futuro sólo cambia este módulo.
 */
import { CEFR_CENTER } from "../engine/levels";
import type { Catalog } from "../engine/exercises";
import { EN_ASSESSMENT } from "./en/assessment";
import { EN_GRAMMAR } from "./en/grammar";
import { EN_VOCAB } from "./en/vocab";
import { FR_GRAMMAR, FR_VOCAB } from "./fr";
import { JA_GRAMMAR, JA_VOCAB } from "./ja";
import { getLanguage } from "./languages";
import type { AssessmentItem, GrammarConcept, LanguageCode, VocabItem } from "./types";
import { translationOf } from "../engine/exercises";

const VOCAB: Record<LanguageCode, VocabItem[]> = { en: EN_VOCAB, fr: FR_VOCAB, ja: JA_VOCAB };
const GRAMMAR: Record<LanguageCode, GrammarConcept[]> = { en: EN_GRAMMAR, fr: FR_GRAMMAR, ja: JA_GRAMMAR };
const ASSESSMENT: Record<LanguageCode, AssessmentItem[]> = { en: EN_ASSESSMENT };

const vocabIndex = new Map<string, VocabItem>();
for (const list of Object.values(VOCAB)) for (const v of list) vocabIndex.set(v.id, v);
const grammarIndex = new Map<string, GrammarConcept>();
for (const list of Object.values(GRAMMAR)) for (const g of list) grammarIndex.set(g.id, g);

export function vocabFor(language: LanguageCode): VocabItem[] {
  return VOCAB[language] ?? [];
}

export function grammarFor(language: LanguageCode): GrammarConcept[] {
  return GRAMMAR[language] ?? [];
}

export function getVocab(id: string): VocabItem | undefined {
  return vocabIndex.get(id);
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
  for (const v of vocab) {
    const answer = translationOf(v, native)[0]!;
    const distractors = vocab
      .filter((o) => o.id !== v.id)
      .map((o) => translationOf(o, native)[0]!)
      .filter((t, i, arr) => t !== answer && arr.indexOf(t) === i)
      .slice(0, 12);
    // Selección determinista de 3 distractores.
    const start = v.id.length % Math.max(1, distractors.length - 3);
    items.push({
      id: `${language}:a:v:${v.id.split(":").pop()}`,
      language,
      skill: "vocabulary",
      difficulty: CEFR_CENTER[v.cefr] - 0.3,
      prompt: `¿Qué significa «${v.lemma}»${v.reading ? ` (${v.reading})` : ""}?`,
      options: [answer, ...distractors.slice(start, start + 3)].sort(),
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
