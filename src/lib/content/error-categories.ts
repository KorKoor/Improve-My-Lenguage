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
  { id: "conjugation", label: "conjugación verbal", language: "*" },
  { id: "pronunciation", label: "pronunciación", language: "*" },
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
  // B2–C1 y ampliaciones (inglés, francés, alemán, italiano, portugués, japonés)
  { id: "passive", label: "voz pasiva", language: "en", grammarId: "en:g:passive" },
  { id: "reported-speech", label: "estilo indirecto", language: "en", grammarId: "en:g:reported-speech" },
  { id: "relative-clauses", label: "oraciones de relativo", language: "en", grammarId: "en:g:relative-clauses" },
  { id: "modals", label: "modales en pasado", language: "en", grammarId: "en:g:modal-perfects" },
  { id: "en:to-be", label: "verbo to be", language: "en", grammarId: "en:g:to-be" },
  { id: "en:do-support", label: "do/does en preguntas y negaciones", language: "en", grammarId: "en:g:present-simple-do" },
  { id: "en:there-is", label: "there is / there are", language: "en", grammarId: "en:g:there-is" },
  { id: "en:continuous", label: "presente continuo", language: "en", grammarId: "en:g:present-continuous" },
  { id: "en:comparatives", label: "comparativos y superlativos", language: "en", grammarId: "en:g:comparatives" },
  { id: "en:future", label: "futuro (will / going to)", language: "en", grammarId: "en:g:future-will-going-to" },
  { id: "en:quantifiers", label: "much, many, some, any", language: "en", grammarId: "en:g:countable" },
  { id: "en:used-to", label: "used to", language: "en", grammarId: "en:g:used-to" },
  { id: "en:obligation", label: "must, have to, should", language: "en", grammarId: "en:g:obligation-modals" },
  { id: "en:past-perfect", label: "past perfect", language: "en", grammarId: "en:g:past-perfect" },
  { id: "en:wish", label: "wish / if only", language: "en", grammarId: "en:g:wish" },
  { id: "en:causative", label: "causativa (have something done)", language: "en", grammarId: "en:g:causative" },
  { id: "en:inversion", label: "inversión enfática", language: "en", grammarId: "en:g:inversion" },
  { id: "en:cleft", label: "oraciones escindidas", language: "en", grammarId: "en:g:cleft" },
  { id: "fr:negation", label: "negación", language: "fr", grammarId: "fr:g:negation" },
  { id: "fr:pronouns", label: "pronombres de objeto", language: "fr", grammarId: "fr:g:object-pronouns" },
  { id: "fr:subjunctive", label: "subjuntivo presente", language: "fr", grammarId: "fr:g:subjonctif" },
  { id: "fr:conditional", label: "condicional y oraciones con si", language: "fr", grammarId: "fr:g:conditionnel" },
  { id: "fr:relatives", label: "pronombres relativos", language: "fr", grammarId: "fr:g:relatifs" },
  { id: "fr:reported-speech", label: "estilo indirecto y concordancia de tiempos", language: "fr", grammarId: "fr:g:discours-indirect" },
  { id: "de:negation", label: "negación", language: "de", grammarId: "de:g:negation" },
  { id: "de:perfekt", label: "perfekt", language: "de", grammarId: "de:g:perfekt" },
  { id: "de:modal-verbs", label: "verbos modales", language: "de", grammarId: "de:g:modalverben" },
  { id: "de:prepositions", label: "preposiciones de doble caso", language: "de", grammarId: "de:g:wechselpraepositionen" },
  { id: "de:adjectives", label: "terminaciones de los adjetivos", language: "de", grammarId: "de:g:adjektivendungen" },
  { id: "de:passive", label: "pasiva con werden", language: "de", grammarId: "de:g:passiv" },
  { id: "de:konjunktiv", label: "konjunktiv II", language: "de", grammarId: "de:g:konjunktiv2" },
  { id: "de:reported-speech", label: "konjunktiv I", language: "de", grammarId: "de:g:konjunktiv1" },
  { id: "it:prepositions", label: "preposiciones articuladas", language: "it", grammarId: "it:g:preposizioni-articolate" },
  { id: "it:imperfect", label: "imperfetto frente a passato prossimo", language: "it", grammarId: "it:g:imperfetto" },
  { id: "it:pronouns", label: "pronombres de objeto y ne", language: "it", grammarId: "it:g:pronomi" },
  { id: "it:future", label: "futuro simple", language: "it", grammarId: "it:g:futuro" },
  { id: "it:subjunctive", label: "congiuntivo presente", language: "it", grammarId: "it:g:congiuntivo" },
  { id: "it:conditional", label: "condicional y periodo hipotético", language: "it", grammarId: "it:g:condizionale" },
  { id: "pt:ser-estar", label: "ser, estar y ficar", language: "pt", grammarId: "pt:g:ser-estar-ficar" },
  { id: "pt:imperfect", label: "pretérito imperfeito", language: "pt", grammarId: "pt:g:imperfeito" },
  { id: "pt:pronouns", label: "pronombres en Brasil", language: "pt", grammarId: "pt:g:pronomes-br" },
  { id: "pt:future-subjunctive", label: "futuro do subjuntivo", language: "pt", grammarId: "pt:g:futuro-subjuntivo" },
  { id: "pt:personal-infinitive", label: "infinitivo personal", language: "pt", grammarId: "pt:g:infinitivo-pessoal" },
  { id: "pt:subjunctive", label: "presente do subjuntivo", language: "pt", grammarId: "pt:g:subjuntivo-presente" },
  { id: "ja:adjectives", label: "adjetivos い y adjetivos な", language: "ja", grammarId: "ja:g:adjectives" },
  { id: "ja:te-form", label: "la forma て", language: "ja", grammarId: "ja:g:te-form" },
  { id: "ja:plain-form", label: "forma llana y ～と思う / ～たい", language: "ja", grammarId: "ja:g:plain-form" },
  { id: "ja:conditionals", label: "condicionales", language: "ja", grammarId: "ja:g:conditionals" },
  { id: "ja:passive-causative", label: "pasiva y causativa", language: "ja", grammarId: "ja:g:passive-causative" },
  { id: "ja:keigo", label: "keigo", language: "ja", grammarId: "ja:g:keigo" },
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
