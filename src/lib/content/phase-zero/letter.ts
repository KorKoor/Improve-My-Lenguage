import type { Letter } from "../alphabets";

/** Letra o combinación de un idioma con letras latinas: `say` es una palabra corta donde se oye bien. */
export const S = (g: string, r: string, hint: string, ex: [string, string, string]): Letter => ({ g, r, hint, say: ex[0], ex: { w: ex[0], r: ex[1], es: ex[2] } });
