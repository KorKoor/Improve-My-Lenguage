/**
 * «Escritura y ortografía» para todo alumno A1–A2 (no sólo para quien empieza
 * de cero): el abecedario con el nombre de cada letra (para deletrear), los
 * signos especiales y cómo escribirlos, y unidades cortas de puntuación,
 * mayúsculas y ortografía. Las reglas reutilizan el formato de las reglas de
 * lectura de la Fase 0 (una idea por pantalla, ejemplos y un mini ejercicio).
 */
import type { ReadingRule } from "../phase-zero/types";

export interface AlphabetName {
  /** La letra (mayúscula y minúscula si las tiene). */
  g: string;
  /** Cómo se llama, escrito para hispanohablantes («bé», «effe»). */
  name: string;
  /** Qué leer en voz alta para decir el nombre. */
  say: string;
}

export interface SpecialSign {
  g: string;
  /** Nombre del signo en español. */
  name: string;
  /** Para qué sirve, en una frase. */
  use: string;
  ex: { w: string; es: string };
}

export type WritingUnitKind = "signs" | "punctuation" | "capitals" | "spelling";

export interface WritingUnit {
  id: string;
  level: "A1" | "A2";
  kind: WritingUnitKind;
  title: string;
  rules: ReadingRule[];
}

export interface WritingSystem {
  /** Orden del abecedario con el nombre de cada letra (null: no se deletrea así). */
  alphabet: AlphabetName[] | null;
  /** Cómo se llama el orden del abecedario / diccionario en ese idioma. */
  alphabetNote: string;
  /** ¿Se deletrea letra a letra? (idiomas alfabéticos). */
  spelling: boolean;
  signs: SpecialSign[];
  /** Cómo escribir en este idioma en el móvil y en el ordenador. */
  typing: { phone: string; computer: string };
  units: WritingUnit[];
}
