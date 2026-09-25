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
  // Coreano
  { id: "ko:particles", label: "partículas de tema y sujeto", language: "ko", grammarId: "ko:g:topic-subject" },
  { id: "ko:verb-endings", label: "terminaciones verbales", language: "ko", grammarId: "ko:g:polite-present" },
  { id: "ko:past-tense", label: "pasado", language: "ko", grammarId: "ko:g:past" },
  { id: "ko:negation", label: "negación", language: "ko", grammarId: "ko:g:negation" },
  { id: "ko:modal", label: "querer y poder", language: "ko", grammarId: "ko:g:want-can" },
  { id: "ko:connectors", label: "conectores causales", language: "ko", grammarId: "ko:g:because" },
  { id: "ko:honorifics", label: "honoríficos", language: "ko", grammarId: "ko:g:honorific" },
  { id: "ko:reported-speech", label: "estilo indirecto", language: "ko", grammarId: "ko:g:reported" },
  // Árabe
  { id: "ar:article", label: "artículo definido", language: "ar", grammarId: "ar:g:article" },
  { id: "ar:nominal-sentence", label: "frase nominal", language: "ar", grammarId: "ar:g:nominal-sentence" },
  { id: "ar:gender", label: "género", language: "ar", grammarId: "ar:g:feminine" },
  { id: "ar:pronoun-suffixes", label: "pronombres sufijados", language: "ar", grammarId: "ar:g:possessive-suffixes" },
  { id: "ar:present", label: "presente", language: "ar", grammarId: "ar:g:present" },
  { id: "ar:past-tense", label: "pasado", language: "ar", grammarId: "ar:g:past" },
  { id: "ar:plural", label: "plural", language: "ar", grammarId: "ar:g:plurals-dual" },
  { id: "ar:kana-inna", label: "partículas كان e إنّ", language: "ar", grammarId: "ar:g:kana-inna" },
  // Neerlandés
  { id: "nl:articles", label: "artículos de y het", language: "nl", grammarId: "nl:g:de-het" },
  { id: "nl:word-order", label: "orden de palabras", language: "nl", grammarId: "nl:g:word-order" },
  { id: "nl:perfectum", label: "perfectum", language: "nl", grammarId: "nl:g:perfectum" },
  { id: "nl:separable-verbs", label: "verbos separables", language: "nl", grammarId: "nl:g:separable" },
  { id: "nl:subordinate", label: "subordinadas", language: "nl", grammarId: "nl:g:subordinate" },
  { id: "nl:er", label: "partícula er", language: "nl", grammarId: "nl:g:er" },
  { id: "nl:passive", label: "voz pasiva", language: "nl", grammarId: "nl:g:passive" },
  { id: "nl:conditional", label: "condicional", language: "nl", grammarId: "nl:g:conditional" },
  // Ruso
  { id: "ru:gender", label: "género", language: "ru", grammarId: "ru:g:gender" },
  { id: "ru:conjugation", label: "conjugación", language: "ru", grammarId: "ru:g:present" },
  { id: "ru:past-tense", label: "pasado", language: "ru", grammarId: "ru:g:past" },
  { id: "ru:cases", label: "casos", language: "ru", grammarId: "ru:g:accusative-prepositional" },
  { id: "ru:genitive", label: "genitivo", language: "ru", grammarId: "ru:g:genitive" },
  { id: "ru:aspect", label: "aspecto verbal", language: "ru", grammarId: "ru:g:aspect" },
  { id: "ru:motion-verbs", label: "verbos de movimiento", language: "ru", grammarId: "ru:g:motion" },
  { id: "ru:participles", label: "participios", language: "ru", grammarId: "ru:g:participles" },
  // Sueco
  { id: "sv:articles", label: "artículos en y ett", language: "sv", grammarId: "sv:g:en-ett" },
  { id: "sv:word-order", label: "orden de palabras", language: "sv", grammarId: "sv:g:v2" },
  { id: "sv:past-tense", label: "pasado", language: "sv", grammarId: "sv:g:past" },
  { id: "sv:adjectives", label: "adjetivos", language: "sv", grammarId: "sv:g:adjectives" },
  { id: "sv:subordinate", label: "subordinadas", language: "sv", grammarId: "sv:g:bisats" },
  { id: "sv:perfect", label: "perfecto", language: "sv", grammarId: "sv:g:perfect" },
  { id: "sv:passive", label: "voz pasiva", language: "sv", grammarId: "sv:g:passive" },
  { id: "sv:conditional", label: "condicional", language: "sv", grammarId: "sv:g:conditional" },
  // Chino mandarín
  { id: "zh:shi-de", label: "是 y 的", language: "zh", grammarId: "zh:g:shi-de" },
  { id: "zh:measure-words", label: "clasificadores", language: "zh", grammarId: "zh:g:measure-words" },
  { id: "zh:le", label: "partícula 了", language: "zh", grammarId: "zh:g:le" },
  { id: "zh:negation", label: "negación", language: "zh", grammarId: "zh:g:bu-mei" },
  { id: "zh:aspect", label: "aspecto", language: "zh", grammarId: "zh:g:guo-zai" },
  { id: "zh:complements", label: "complementos", language: "zh", grammarId: "zh:g:de-complement" },
  { id: "zh:ba", label: "construcción 把", language: "zh", grammarId: "zh:g:ba" },
  { id: "zh:bei", label: "voz pasiva con 被", language: "zh", grammarId: "zh:g:bei" },
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
