/**
 * Taxonomía de errores. Las categorías son estables (se guardan en BD) y se
 * enlazan con el concepto gramatical que las trabaja cuando existe.
 * La IA sólo puede clasificar en estas categorías (ver src/lib/ai/prompts.ts).
 */
export interface ErrorCategory {
  id: string;
  label: string;
  /** Idioma al que aplica, o "*" si es transversal. */
  language: string;
  grammarId?: string;
}

export const ERROR_CATEGORIES: ErrorCategory[] = [
  // Transversales
  { id: "vocabulary", label: "vocabulario", language: "*" },
  { id: "vocabulary-in-context", label: "vocabulario en contexto", language: "*" },
  { id: "listening", label: "comprensión auditiva", language: "*" },
  { id: "word-order", label: "orden de palabras", language: "*" },
  { id: "spelling", label: "ortografía", language: "*" },
  { id: "literal-translation", label: "traducción literal del español", language: "*" },
  { id: "register", label: "registro (formal/informal)", language: "*" },
  { id: "tense", label: "tiempos verbales", language: "*" },
  // Inglés
  { id: "subject-verb-agreement", label: "concordancia sujeto-verbo", language: "en", grammarId: "en:g:third-person-s" },
  { id: "past-tense", label: "pasado simple", language: "en", grammarId: "en:g:past-simple" },
  { id: "articles", label: "artículos", language: "en", grammarId: "en:g:articles" },
  { id: "prepositions", label: "preposiciones", language: "en", grammarId: "en:g:prepositions-time-place" },
  { id: "present-perfect", label: "present perfect", language: "en", grammarId: "en:g:present-perfect" },
  { id: "verb-patterns", label: "verbo + -ing / to", language: "en", grammarId: "en:g:gerund-infinitive" },
  { id: "conditionals", label: "condicionales", language: "en", grammarId: "en:g:conditionals" },
  { id: "question-formation", label: "formación de preguntas", language: "en", grammarId: "en:g:questions" },
  // Francés
  { id: "fr:articles-gender", label: "género y artículos", language: "fr", grammarId: "fr:g:gender-articles" },
  { id: "fr:past-tense", label: "passé composé", language: "fr", grammarId: "fr:g:passe-compose" },
  // Portugués
  { id: "pt:contractions", label: "contracciones (no, na, do, da)", language: "pt", grammarId: "pt:g:contractions" },
  { id: "pt:past-tense", label: "pretérito perfeito", language: "pt", grammarId: "pt:g:preterito-perfeito" },
  // Italiano
  { id: "it:articles", label: "artículos", language: "it", grammarId: "it:g:articles" },
  { id: "it:past-tense", label: "passato prossimo", language: "it", grammarId: "it:g:passato-prossimo" },
  // Alemán
  { id: "de:articles-cases", label: "artículos y casos", language: "de", grammarId: "de:g:articles-cases" },
  { id: "de:word-order", label: "orden de palabras", language: "de", grammarId: "de:g:word-order" },
  // Japonés
  { id: "ja:particles", label: "partículas", language: "ja", grammarId: "ja:g:particles-wa-ga-o" },
  { id: "ja:polite-form", label: "forma cortés (～ます)", language: "ja", grammarId: "ja:g:masu-form" },
];

export function categoriesFor(language: string): ErrorCategory[] {
  return ERROR_CATEGORIES.filter((c) => c.language === "*" || c.language === language);
}

export function errorLabel(id: string): string {
  return ERROR_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function grammarForCategory(id: string): string | null {
  return ERROR_CATEGORIES.find((c) => c.id === id)?.grammarId ?? null;
}
