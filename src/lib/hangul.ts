/**
 * Escritura coreana con el teclado en pantalla: las letras (jamo) se juntan
 * solas en bloques silábicos, como en un teclado coreano de verdad
 * (ㅎ + ㅏ + ㄴ → 한). Puro: se prueba sin navegador.
 */

const BASE = 0xac00;
export const CHO = [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
export const JUNG = [..."ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"];
/** Índice 0 = sin consonante final. */
export const JONG = ["", ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"];

const VOWEL_PAIRS: Record<string, string> = { "ㅗㅏ": "ㅘ", "ㅗㅐ": "ㅙ", "ㅗㅣ": "ㅚ", "ㅜㅓ": "ㅝ", "ㅜㅔ": "ㅞ", "ㅜㅣ": "ㅟ", "ㅡㅣ": "ㅢ" };
const FINAL_PAIRS: Record<string, string> = { "ㄱㅅ": "ㄳ", "ㄴㅈ": "ㄵ", "ㄴㅎ": "ㄶ", "ㄹㄱ": "ㄺ", "ㄹㅁ": "ㄻ", "ㄹㅂ": "ㄼ", "ㄹㅅ": "ㄽ", "ㄹㅌ": "ㄾ", "ㄹㅍ": "ㄿ", "ㄹㅎ": "ㅀ", "ㅂㅅ": "ㅄ" };
const split = (pairs: Record<string, string>, c: string): [string, string] | null => {
  const k = Object.keys(pairs).find((p) => pairs[p] === c);
  return k ? [k[0]!, k[1]!] : null;
};

export interface Syllable {
  cho: number;
  jung: number;
  jong: number;
}

export function decompose(ch: string): Syllable | null {
  const code = ch.codePointAt(0)! - BASE;
  if (ch.length !== 1 || code < 0 || code > 11171) return null;
  return { cho: Math.floor(code / 588), jung: Math.floor((code % 588) / 28), jong: code % 28 };
}

export function compose(s: Syllable): string {
  return String.fromCodePoint(BASE + s.cho * 588 + s.jung * 28 + s.jong);
}

const isVowel = (j: string) => JUNG.includes(j);

/** Añade una letra al final del texto, uniéndola a la última sílaba si se puede. */
export function typeJamo(text: string, jamo: string): string {
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const syl = last ? decompose(last) : null;

  if (isVowel(jamo)) {
    if (syl && syl.jong) {
      // La consonante final pasa a empezar la sílaba nueva: 한 + ㅏ → 하나.
      const pair = split(FINAL_PAIRS, JONG[syl.jong]!);
      const [keep, move] = pair ?? ["", JONG[syl.jong]!];
      const cho = CHO.indexOf(move);
      if (cho < 0) return text + jamo;
      return head + compose({ ...syl, jong: JONG.indexOf(keep) }) + compose({ cho, jung: JUNG.indexOf(jamo), jong: 0 });
    }
    if (syl) {
      const joined = VOWEL_PAIRS[JUNG[syl.jung]! + jamo];
      return joined ? head + compose({ ...syl, jung: JUNG.indexOf(joined) }) : text + jamo;
    }
    const cho = CHO.indexOf(last);
    if (last && cho >= 0) return head + compose({ cho, jung: JUNG.indexOf(jamo), jong: 0 });
    const vowel = last && isVowel(last) ? VOWEL_PAIRS[last + jamo] : undefined;
    return vowel ? head + vowel : text + jamo;
  }

  if (syl && !syl.jong) {
    const jong = JONG.indexOf(jamo);
    return jong > 0 ? head + compose({ ...syl, jong }) : text + jamo;
  }
  if (syl && syl.jong) {
    const joined = FINAL_PAIRS[JONG[syl.jong]! + jamo];
    return joined ? head + compose({ ...syl, jong: JONG.indexOf(joined) }) : text + jamo;
  }
  return text + jamo;
}

/** Borrar deshace la última letra, no la sílaba entera: 한 → 하 → ㅎ → «». */
export function backspaceJamo(text: string): string {
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const syl = last ? decompose(last) : null;
  if (!syl) {
    const pair = last ? split(VOWEL_PAIRS, last) : null;
    return pair ? head + pair[0] : head;
  }
  if (syl.jong) {
    const pair = split(FINAL_PAIRS, JONG[syl.jong]!);
    return head + compose({ ...syl, jong: pair ? JONG.indexOf(pair[0]) : 0 });
  }
  const pair = split(VOWEL_PAIRS, JUNG[syl.jung]!);
  if (pair) return head + compose({ ...syl, jung: JUNG.indexOf(pair[0]) });
  return head + CHO[syl.cho]!;
}

// Romanización revisada, simplificada (sin reglas de sandhi): sirve para
// enseñar qué letra suena cómo dentro de una palabra.
const R_CHO = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const R_JUNG = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const R_JONG = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];

export function romanizeSyllable(ch: string): string | null {
  const s = decompose(ch);
  return s ? R_CHO[s.cho]! + R_JUNG[s.jung]! + R_JONG[s.jong]! : null;
}
