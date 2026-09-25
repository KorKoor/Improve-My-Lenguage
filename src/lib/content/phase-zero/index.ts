/**
 * Fase 0: acceso único a las letras y reglas de lectura de cada idioma.
 *
 * - Letras: en ruso, árabe, coreano, japonés y chino son los grupos del
 *   alfabeto (`../alphabets.ts`); en los idiomas con letras latinas, los grupos
 *   de letras y combinaciones que suenan distinto al español.
 * - Reglas: ortografía y lectura, una por pantalla.
 *
 * Ids estables para la memoria (FSRS): «ru:l:к» (letra) y «ru:r:stress» (regla).
 */
import { alphabetFor, type Letter, type LetterGroup } from "../alphabets";
import type { LanguageCode } from "../types";
import { AR } from "./ar";
import { DE } from "./de";
import { EN } from "./en";
import { FR } from "./fr";
import { IT } from "./it";
import { JA } from "./ja";
import { KO } from "./ko";
import { NL } from "./nl";
import { PT } from "./pt";
import { RU } from "./ru";
import { SV } from "./sv";
import type { PhaseZeroContent, ReadingRule } from "./types";
import { ZH } from "./zh";

export type { PhaseZeroContent, ReadingRule, RuleCheck, RuleExample } from "./types";

const CONTENT: Record<string, PhaseZeroContent> = { en: EN, fr: FR, de: DE, it: IT, pt: PT, nl: NL, sv: SV, ru: RU, ar: AR, ja: JA, ko: KO, zh: ZH };

export function hasPhaseZero(lang: LanguageCode): boolean {
  return lang in CONTENT;
}

/** Grupos de letras del idioma, en el orden en que se enseñan. */
export function letterGroupsFor(lang: LanguageCode): LetterGroup[] {
  return alphabetFor(lang)?.groups ?? CONTENT[lang]?.letters ?? [];
}

export function rulesFor(lang: LanguageCode): ReadingRule[] {
  return CONTENT[lang]?.rules ?? [];
}

/** Letras por unidad: con más, una unidad pasa de 5 minutos. */
export const LETTERS_PER_UNIT = 7;

/** Un grupo grande se enseña en varias partes de tamaño parecido. */
export function letterChunks(group: LetterGroup): Letter[][] {
  const parts = Math.ceil(group.letters.length / LETTERS_PER_UNIT);
  const size = Math.ceil(group.letters.length / parts);
  return Array.from({ length: parts }, (_, p) => group.letters.slice(p * size, (p + 1) * size));
}

export const letterItemId = (lang: LanguageCode, g: string) => `${lang}:l:${g}`;
export const ruleItemId = (lang: LanguageCode, id: string) => `${lang}:r:${id}`;

export interface LetterRef {
  lang: LanguageCode;
  group: LetterGroup;
  letter: Letter;
  /** Letras del mismo conjunto (distractores y confusiones). */
  pool: Letter[];
  /** Letras del mismo conjunto ya enseñadas al llegar a esta (incluida): las opciones salen de aquí. */
  seen: Letter[];
}

let letterIndex: Map<string, LetterRef> | null = null;
/** «ru:l:к» → la letra, su grupo y su conjunto. */
export function letterById(id: string): LetterRef | null {
  if (!letterIndex) {
    letterIndex = new Map();
    for (const lang of Object.keys(CONTENT)) {
      const groups = letterGroupsFor(lang);
      groups.forEach((group, gi) => {
        const same = groups.filter((g) => g.set === group.set);
        const pool = same.flatMap((g) => g.letters);
        const before = groups.slice(0, gi).filter((g) => g.set === group.set).flatMap((g) => g.letters);
        let upTo: Letter[] = [];
        for (const chunk of letterChunks(group)) {
          upTo = [...upTo, ...chunk];
          const seen = [...before, ...upTo];
          for (const letter of chunk) letterIndex!.set(letterItemId(lang, letter.g), { lang, group, letter, pool, seen });
        }
      });
    }
  }
  return letterIndex.get(id) ?? null;
}

/** «ru:r:stress» → la regla. */
export function ruleById(id: string): { lang: LanguageCode; rule: ReadingRule } | null {
  const m = /^([a-z]{2,3}):r:(.+)$/.exec(id);
  if (!m) return null;
  const rule = rulesFor(m[1]!).find((r) => r.id === m[2]);
  return rule ? { lang: m[1]!, rule } : null;
}
