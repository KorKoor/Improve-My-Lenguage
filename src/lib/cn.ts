import { twMerge } from "tailwind-merge";

/**
 * Une clases condicionales y resuelve conflictos de Tailwind: la última gana
 * (p. ej. `inline-flex` del componente + `hidden sm:inline-flex` del llamador).
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
