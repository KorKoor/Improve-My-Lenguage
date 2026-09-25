import type { CefrLevel, LanguageCode, TenseKey } from "./types";

/**
 * Metadatos para mostrar y practicar las tablas de conjugación de los paquetes.
 * Los nombres de los tiempos se adaptan al idioma (el «pretérito» alemán es el
 * Präteritum; el portugués, el pretérito perfeito…).
 */
export const TENSE_ORDER: TenseKey[] = ["ind.pres", "ind.pret", "ind.past", "ind.impf", "ind.fut", "cond", "subj.pres", "imp"];

const GENERIC: Record<TenseKey, string> = {
  "ind.pres": "Presente",
  "ind.pret": "Pretérito",
  "ind.past": "Pasado",
  "ind.impf": "Imperfecto",
  "ind.fut": "Futuro",
  cond: "Condicional",
  "subj.pres": "Subjuntivo presente",
  imp: "Imperativo",
};

const BY_LANGUAGE: Partial<Record<LanguageCode, Partial<Record<TenseKey, string>>>> = {
  de: { "ind.pret": "Präteritum (pasado)", "subj.pres": "Konjunktiv I" },
  pt: { "ind.pret": "Pretérito perfeito", "ind.impf": "Pretérito imperfeito", "subj.pres": "Presente do subjuntivo" },
  fr: { "ind.impf": "Imparfait", "ind.fut": "Futur simple", cond: "Conditionnel", "subj.pres": "Subjonctif présent" },
  it: { "ind.impf": "Imperfetto", "ind.fut": "Futuro semplice", cond: "Condizionale", "subj.pres": "Congiuntivo presente" },
  nl: { "ind.past": "Verleden tijd (pasado)" },
  sv: { "ind.past": "Preteritum (pasado)" },
};

export function tenseLabel(language: LanguageCode, tense: TenseKey): string {
  return BY_LANGUAGE[language]?.[tense] ?? GENERIC[tense];
}

/** Pronombres en el orden de las tablas: yo, tú, él/ella, nosotros, vosotros, ellos. */
const PRONOUNS: Partial<Record<LanguageCode, string[]>> = {
  fr: ["je", "tu", "il/elle", "nous", "vous", "ils/elles"],
  it: ["io", "tu", "lui/lei", "noi", "voi", "loro"],
  pt: ["eu", "tu", "ele/ela", "nós", "vós", "eles/elas"],
  de: ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"],
  nl: ["ik", "jij", "hij/zij", "wij", "jullie", "zij"],
  sv: ["jag", "du", "han/hon", "vi", "ni", "de"],
  ru: ["я", "ты", "он/она", "мы", "вы", "они"],
  ar: ["أنا", "أنتَ", "هو", "نحن", "أنتم", "هم"],
  en: ["I", "you", "he/she", "we", "you", "they"],
};

export const PERSON_ES = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"];

export function pronouns(language: LanguageCode): string[] {
  return PRONOUNS[language] ?? PERSON_ES;
}

/** Elisión francesa: «je» + vocal → «j'ai». */
export function withPronoun(language: LanguageCode, person: number, form: string): string {
  const p = pronouns(language)[person]!.split("/")[0]!;
  if (language === "fr" && p === "je" && /^[aeiouyhâéèêîôû]/i.test(form)) return `j'${form}`;
  return `${p} ${form}`;
}

/** Tiempos que se practican según el nivel (los demás se ven en la tabla). */
export function tensesForLevel(level: CefrLevel): TenseKey[] {
  switch (level) {
    case "A1":
      return ["ind.pres"];
    case "A2":
      return ["ind.pres", "ind.pret", "ind.past", "imp"];
    case "B1":
      return ["ind.pres", "ind.pret", "ind.past", "ind.impf", "ind.fut", "imp"];
    default:
      return TENSE_ORDER;
  }
}

/** Dificultad relativa de cada tiempo (logits que se suman a la del verbo). */
export const TENSE_DIFFICULTY: Record<TenseKey, number> = {
  "ind.pres": 0,
  "ind.pret": 0.5,
  "ind.past": 0.4,
  "ind.impf": 0.7,
  "ind.fut": 0.6,
  cond: 0.9,
  "subj.pres": 1.2,
  imp: 0.5,
};
