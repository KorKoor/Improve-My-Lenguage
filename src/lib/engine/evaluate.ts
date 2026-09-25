/**
 * Evaluación de respuestas escritas, agnóstica al idioma.
 *
 * - Normaliza mayúsculas, espacios, puntuación y comillas tipográficas.
 * - Acentos: en idiomas donde los diacríticos son distintivos (fr, es, pt, de...)
 *   una respuesta sin acento se acepta como "casi" (nearMiss) y se señala.
 * - Erratas: distancia de Levenshtein ≤ 1 (≤ 2 en palabras largas) ⇒ nearMiss.
 * - Escrituras sin mayúsculas/espacios (ja, zh, ko) se comparan tal cual tras
 *   normalizar anchura (NFKC).
 */
import { romanKey } from "../content/alphabets";

export interface EvaluationResult {
  correct: boolean;
  nearMiss: boolean;
  /** Motivo legible del nearMiss ("acento", "errata", escrita en transcripción latina). */
  note?: "accent" | "typo" | "roman";
  matched?: string;
}

const PUNCT = /[.,;:!?¡¿"'“”‘’«»()[\]{}…。、！？「」『』・]/g;

export function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(PUNCT, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/** Contracciones inglesas frecuentes: "I'm" ≡ "I am". */
const EN_EXPANSIONS: [RegExp, string][] = [
  [/\bi'm\b/g, "i am"],
  [/\b(\w+)'re\b/g, "$1 are"],
  [/\b(\w+)'ve\b/g, "$1 have"],
  [/\b(\w+)'ll\b/g, "$1 will"],
  [/\bcan't\b/g, "cannot"],
  [/\bwon't\b/g, "will not"],
  [/\b(\w+)n't\b/g, "$1 not"],
  [/\bcan not\b/g, "cannot"],
];

function canonical(s: string, language: string): string {
  let n = normalize(s);
  if (language === "en") {
    for (const [re, rep] of EN_EXPANSIONS) n = n.replace(re, rep);
  }
  return n.replace(/'/g, "").replace(/\s+/g, " ").trim();
}

export function evaluateText(
  response: string,
  accepted: string[],
  language: string,
  opts: { typos?: boolean } = {},
): EvaluationResult {
  const allowTypos = opts.typos ?? true;
  const r = canonical(response, language);
  if (!r) return { correct: false, nearMiss: false };

  for (const a of accepted) {
    if (r === canonical(a, language)) return { correct: true, nearMiss: false, matched: a };
  }
  for (const a of accepted) {
    const ca = canonical(a, language);
    if (stripDiacritics(r) === stripDiacritics(ca)) {
      return { correct: true, nearMiss: true, note: "accent", matched: a };
    }
  }
  // En gramática una "errata" suele ser justo el error que se evalúa
  // (have→has, stoped→stopped), así que allí no se tolera.
  if (!allowTypos) return { correct: false, nearMiss: false };
  for (const a of accepted) {
    const ca = canonical(a, language);
    const tolerance = ca.length >= 10 ? 2 : ca.length >= 4 ? 1 : 0;
    if (tolerance > 0 && levenshtein(stripDiacritics(r), stripDiacritics(ca)) <= tolerance) {
      return { correct: true, nearMiss: true, note: "typo", matched: a };
    }
  }
  return { correct: false, nearMiss: false };
}

/**
 * Respuesta escrita en letras latinas en un idioma de otra escritura
 * («spasibo» por «спасибо», «arigatou» por «ありがとう»): cuenta como acierto
 * con aviso, para que el teclado no impida practicar. `roman` ya viene
 * normalizado con `romanKey`.
 */
export function evaluateRoman(response: string, roman: string[], expected: string): EvaluationResult | null {
  const r = romanKey(response);
  if (!r || !roman.length) return null;
  // Variantes habituales: romaji «ou»/«oo» por «ō», «ei» por «ē»; en ruso «j» por «y» (svoj = svoy).
  const loose = (x: string) => x.replace(/ou|oo/g, "o").replace(/uu/g, "u").replace(/ei/g, "e").replace(/aa/g, "a").replace(/ii/g, "i").replace(/j/g, "y");
  const hit = roman.some((a) => a === r || loose(a) === loose(r));
  return hit ? { correct: true, nearMiss: true, note: "roman", matched: expected } : null;
}

/** Para ejercicios de opción múltiple / emparejar: comparación exacta normalizada. */
export function evaluateChoice(response: string, answer: string): EvaluationResult {
  const ok = normalize(response) === normalize(answer);
  return { correct: ok, nearMiss: false, matched: ok ? answer : undefined };
}
