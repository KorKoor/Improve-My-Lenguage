/**
 * Minijuegos: lógica pura (sin React ni navegador) para que se pueda probar.
 * Los juegos usan las palabras del alumno (las que ya vio, y si no hay
 * bastantes, las más frecuentes de su nivel) y sus frases de ejemplo reales.
 */

export type GameId = "memory" | "rain" | "listen" | "order";

export interface GameMeta {
  id: GameId;
  title: string;
  text: string;
  emoji: string;
  /** Qué habilidad trabaja (para la etiqueta de la tarjeta). */
  skill: string;
  minutes: string;
}

export const GAMES: GameMeta[] = [
  { id: "rain", title: "Lluvia de palabras", text: "A Afi le llueven palabras de los audífonos. Atrapa cada una con su significado antes de que toque el suelo.", emoji: "🌧️", skill: "Vocabulario", minutes: "2–3 min" },
  { id: "memory", title: "Memorama", text: "Encuentra las parejas palabra–significado. Cada carta suena al darle la vuelta.", emoji: "🃏", skill: "Vocabulario", minutes: "2 min" },
  { id: "listen", title: "Oído rápido", text: "60 segundos: escucha una palabra y elige cuál es. Encadena aciertos para multiplicar puntos.", emoji: "👂", skill: "Comprensión auditiva", minutes: "1 min" },
  { id: "order", title: "Ordena la frase", text: "Frases reales desordenadas. Ponlas en orden con la traducción como pista.", emoji: "🧩", skill: "Gramática", minutes: "3 min" },
];

export function gameMeta(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Una palabra lista para jugar. */
export interface GameWord {
  id: string;
  /** Como se escribe en el idioma (o en letras latinas si el alumno lo pidió). */
  text: string;
  /** Lectura (kana, pinyin, rōmaji…) si es distinta del texto. */
  reading?: string;
  /** Lo que se lee en voz alta (siempre la escritura original). */
  speak: string;
  /** Significado en el idioma del alumno. */
  meaning: string;
}

/** Una frase de ejemplo real, ya partida en fichas. */
export interface GameSentence {
  tiles: string[];
  translation: string;
  speak: string;
}

/** Generador pseudoaleatorio con semilla (mulberry32): partidas reproducibles en pruebas. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(xs: readonly T[], rand: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Quita palabras con el mismo texto o el mismo significado (confundirían el juego). */
export function distinctWords(words: readonly GameWord[]): GameWord[] {
  const seenText = new Set<string>();
  const seenMeaning = new Set<string>();
  const out: GameWord[] = [];
  for (const w of words) {
    const t = w.text.toLowerCase();
    const m = w.meaning.toLowerCase();
    if (!w.text || !w.meaning || seenText.has(t) || seenMeaning.has(m)) continue;
    seenText.add(t);
    seenMeaning.add(m);
    out.push(w);
  }
  return out;
}

/** Opciones para una pregunta: la correcta y `n - 1` distractores distintos, mezclados. */
export function choices(target: GameWord, pool: readonly GameWord[], n: number, rand: () => number): GameWord[] {
  const others = shuffle(pool.filter((w) => w.id !== target.id && w.meaning !== target.meaning && w.text !== target.text), rand).slice(0, n - 1);
  return shuffle([target, ...others], rand);
}

// ── Memorama ──────────────────────────────────────────────────────────────

export interface MemoryCard {
  key: string;
  pair: string;
  face: "word" | "meaning";
  word: GameWord;
}

export function memoryDeck(pool: readonly GameWord[], pairs: number, rand: () => number): MemoryCard[] {
  const picked = shuffle(distinctWords(pool), rand).slice(0, pairs);
  return shuffle(
    picked.flatMap((w) => [
      { key: `${w.id}:w`, pair: w.id, face: "word" as const, word: w },
      { key: `${w.id}:m`, pair: w.id, face: "meaning" as const, word: w },
    ]),
    rand,
  );
}

/** Estrellas del memorama: con memoria perfecta harían falta `pairs` intentos. */
export function memoryStars(pairs: number, moves: number): 1 | 2 | 3 {
  if (moves <= pairs + 2) return 3;
  if (moves <= pairs * 2) return 2;
  return 1;
}

// ── Lluvia de palabras ────────────────────────────────────────────────────

/** Segundos que tarda una palabra en caer: empieza tranquilo y acelera, con un mínimo. */
export function rainFallSeconds(caught: number): number {
  return Math.max(3.2, 8 - caught * 0.35);
}

// ── Oído rápido ───────────────────────────────────────────────────────────

/** Puntos por acierto: 10 × multiplicador por racha (×1, ×2 desde 3 seguidas, ×3 desde 6). */
export function listenPoints(streak: number): number {
  return 10 * (streak >= 6 ? 3 : streak >= 3 ? 2 : 1);
}

// ── Ordena la frase ───────────────────────────────────────────────────────

const NO_SPACES = new Set(["ja", "zh"]);

/**
 * Parte una frase en fichas. Los idiomas sin espacios se juegan con su
 * lectura en letras latinas, que sí los tiene; si no la hay, el chino se parte
 * por caracteres (frases cortas) y el japonés no se usa en este juego.
 */
export function sentenceTiles(lang: string, text: string, reading?: string): string[] | null {
  const spaced = NO_SPACES.has(lang) ? reading && /\s/.test(reading.trim()) ? reading : undefined : text;
  if (!spaced && lang === "zh") {
    // Chino sin lectura con espacios: una ficha por carácter (frases cortas); la puntuación va con el anterior.
    const chars = [...text.replace(/[\s"“”「」『』]+/g, "")];
    const tiles: string[] = [];
    for (const c of chars) {
      if (/[\p{P}]/u.test(c) && tiles.length) tiles[tiles.length - 1] += c;
      else tiles.push(c);
    }
    return tiles.length >= 3 && tiles.length <= 8 ? tiles : null;
  }
  const src = spaced;
  if (!src) return null;
  const tiles = src.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return tiles.length >= 3 && tiles.length <= 9 ? tiles : null;
}

/** Fichas desordenadas: nunca en el orden correcto (si se puede). */
export function scramble(tiles: readonly string[], rand: () => number): string[] {
  if (new Set(tiles).size < 2) return [...tiles];
  for (let i = 0; i < 8; i++) {
    const s = shuffle(tiles, rand);
    if (s.join(" ") !== tiles.join(" ")) return s;
  }
  return [...tiles.slice(1), tiles[0]!];
}

/** ¿El orden elegido es correcto? Compara el texto (dos fichas iguales son intercambiables). */
export function isOrdered(answer: readonly string[], tiles: readonly string[]): boolean {
  return answer.join(" ") === tiles.join(" ");
}

// ── Récords ───────────────────────────────────────────────────────────────

export function bestKey(game: GameId, lang: string): string {
  return `iml-game-best:${game}:${lang}`;
}

/** Posiciones del banco que forman la frase correcta (fichas repetidas: cada una se usa una vez). */
export function solutionIndexes(bank: readonly string[], tiles: readonly string[]): number[] {
  const used = new Set<number>();
  return tiles.map((t) => {
    const k = bank.findIndex((b, j) => b === t && !used.has(j));
    used.add(k);
    return k;
  });
}
