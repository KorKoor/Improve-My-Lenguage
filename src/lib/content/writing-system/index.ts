/**
 * «Escritura y ortografía» (A1–A2): abecedario, signos especiales,
 * puntuación, mayúsculas y ortografía de cada idioma. Ver types.ts.
 *
 * Ids estables: reglas «fr:o:a-a» (itemType rule, como las de lectura) y
 * nombres de letras «fr:n:B».
 */
import type { LanguageCode } from "../types";
import type { ReadingRule } from "../phase-zero/types";
import { AR_WRITING } from "./ar";
import { DE_WRITING } from "./de";
import { EN_WRITING } from "./en";
import { FR_WRITING } from "./fr";
import { IT_WRITING } from "./it";
import { JA_WRITING } from "./ja";
import { KO_WRITING } from "./ko";
import { NL_WRITING } from "./nl";
import { PT_WRITING } from "./pt";
import { RU_WRITING } from "./ru";
import { SV_WRITING } from "./sv";
import type { AlphabetName, WritingSystem, WritingUnit } from "./types";
import { ZH_WRITING } from "./zh";

export type { AlphabetName, SpecialSign, WritingSystem, WritingUnit, WritingUnitKind } from "./types";

const SYSTEMS: Record<string, WritingSystem> = { en: EN_WRITING, fr: FR_WRITING, de: DE_WRITING, it: IT_WRITING, pt: PT_WRITING, nl: NL_WRITING, sv: SV_WRITING, ru: RU_WRITING, ar: AR_WRITING, ja: JA_WRITING, ko: KO_WRITING, zh: ZH_WRITING };

export function writingFor(lang: LanguageCode): WritingSystem | null {
  return SYSTEMS[lang] ?? null;
}

/** Unidad «Abecedario y deletreo» (automática en los idiomas que se deletrean) + las del contenido. */
export function writingUnits(lang: LanguageCode): (WritingUnit | { id: "alphabet"; level: "A1"; kind: "alphabet"; title: string; rules: ReadingRule[] })[] {
  const w = writingFor(lang);
  if (!w) return [];
  const alphabet = w.spelling && w.alphabet ? [{ id: "alphabet" as const, level: "A1" as const, kind: "alphabet" as const, title: "El abecedario y cómo deletrear", rules: [] }] : [];
  return [...alphabet, ...w.units];
}

export const orthoRuleId = (lang: LanguageCode, id: string) => `${lang}:o:${id}`;
export const letterNameId = (lang: LanguageCode, g: string) => `${lang}:n:${g}`;

/** «fr:o:a-a» → la regla de escritura. */
export function orthoRuleById(id: string): { lang: LanguageCode; rule: ReadingRule; unit: WritingUnit } | null {
  const m = /^([a-z]{2,3}):o:(.+)$/.exec(id);
  const w = m ? writingFor(m[1]!) : null;
  if (!m || !w) return null;
  for (const unit of w.units) {
    const rule = unit.rules.find((r) => r.id === m[2]);
    if (rule) return { lang: m[1]!, rule, unit };
  }
  return null;
}

/** «fr:n:B» → la letra del abecedario (por su primera forma: «B» de «B b»). */
export function letterNameById(id: string): { lang: LanguageCode; item: AlphabetName; alphabet: AlphabetName[] } | null {
  const m = /^([a-z]{2,3}):n:(.+)$/.exec(id);
  const alphabet = m ? writingFor(m[1]!)?.alphabet : null;
  const item = alphabet?.find((a) => a.g.split(" ")[0] === m![2]);
  return m && alphabet && item ? { lang: m[1]!, item, alphabet } : null;
}

/**
 * Nombre de cada letra de una palabra, para deletrearla en voz alta
 * («chat» → cé, ache, a, té). null si alguna letra no está en el abecedario
 * (acentos, signos): esa palabra no se usa para deletrear.
 */
export function spellingOf(lang: LanguageCode, word: string, jamo: (ch: string) => string[] | null = () => null): AlphabetName[] | null {
  const alphabet = writingFor(lang)?.alphabet;
  if (!alphabet || !writingFor(lang)!.spelling) return null;
  const byLetter = new Map<string, AlphabetName>();
  for (const a of alphabet) for (const form of a.g.split(" ")) byLetter.set(form, a);
  const out: AlphabetName[] = [];
  for (const ch of word.normalize("NFC")) {
    const parts = lang === "ko" ? jamo(ch) : [ch];
    if (!parts) return null;
    for (const p of parts) {
      const a = byLetter.get(p) ?? byLetter.get(p.toUpperCase()) ?? byLetter.get(p.toLowerCase());
      if (!a) return null;
      out.push(a);
    }
  }
  return out;
}
