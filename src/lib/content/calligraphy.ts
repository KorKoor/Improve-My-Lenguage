import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { StrokeChar } from "./strokes";

/**
 * Orden de trazos importado (scripts/content/build_strokes.py): KanjiVG para
 * japonés y Make Me a Hanzi para chino, con su fuente y licencia.
 */
export interface StrokeSet {
  source: string;
  url: string;
  author: string;
  license: string;
  licenseUrl: string;
  chars: (StrokeChar & { kind: "hiragana" | "katakana" | "han" })[];
}

const cache = new Map<string, StrokeSet | null>();

export function strokeSet(lang: string): StrokeSet | null {
  if (!cache.has(lang)) {
    const file = path.join(process.cwd(), "data/strokes", `${lang}.json`);
    cache.set(lang, /^[a-z]{2}$/.test(lang) && existsSync(file) ? (JSON.parse(readFileSync(file, "utf-8")) as StrokeSet) : null);
  }
  return cache.get(lang)!;
}

export interface CalligraphyGroup {
  id: string;
  title: string;
  chars: StrokeChar[];
}

const TITLES: Record<string, string> = { hiragana: "Hiragana", katakana: "Katakana", han: "Kanji básicos" };

/** Grupos para elegir qué practicar: hiragana, katakana, kanji / hanzi. */
export function calligraphyGroups(lang: string): CalligraphyGroup[] {
  const set = strokeSet(lang);
  if (!set) return [];
  const groups = new Map<string, StrokeChar[]>();
  for (const c of set.chars) {
    const list = groups.get(c.kind) ?? [];
    list.push({ ch: c.ch, r: c.r, strokes: c.strokes });
    groups.set(c.kind, list);
  }
  return [...groups.entries()].map(([id, chars]) => ({ id, title: lang === "zh" && id === "han" ? "Hanzi básicos" : TITLES[id] ?? id, chars }));
}

// Revisión nativa: pendiente
/** Letras rusas que a mano (cursiva) cambian mucho respecto a la letra impresa. */
export const RU_CURSIVE: { g: string; looks: string; note: string }[] = [
  { g: "т", looks: "m", note: "A mano se escribe como una «m» latina; a veces con una raya encima para no confundirla." },
  { g: "д", looks: "g", note: "A mano parece una «g» latina, con la cola hacia abajo (o hacia arriba, como ∂)." },
  { g: "и", looks: "u", note: "A mano parece una «u» latina: ¡no es la u! Es la i rusa." },
  { g: "й", looks: "ŭ", note: "Como la и, pero con un arquito encima." },
  { g: "п", looks: "n", note: "A mano parece una «n» latina." },
  { g: "л", looks: "λ", note: "Empieza con un ganchito abajo a la izquierda." },
  { g: "ш", looks: "w", note: "Tres palitos; a veces con una raya debajo para distinguirla de т (m)." },
  { g: "б", looks: "δ", note: "Una barriga con un rabito que sube y se curva a la derecha." },
];

// Revisión nativa: pendiente
/** Cómo se arma un bloque de hangul: la posición de la vocal decide la forma. */
export const KO_BLOCKS: { block: string; parts: string; note: string }[] = [
  { block: "가", parts: "ㄱ + ㅏ", note: "Vocal vertical (ㅏ ㅓ ㅣ): va a la derecha de la consonante." },
  { block: "고", parts: "ㄱ + ㅗ", note: "Vocal horizontal (ㅗ ㅜ ㅡ): va debajo de la consonante." },
  { block: "각", parts: "ㄱ + ㅏ + ㄱ", note: "La consonante final (batchim) va siempre abajo." },
  { block: "곰", parts: "ㄱ + ㅗ + ㅁ", note: "Consonante, vocal debajo y consonante final más abajo." },
  { block: "아", parts: "ㅇ + ㅏ", note: "Una sílaba que empieza por vocal lleva ㅇ mudo delante." },
  { block: "과", parts: "ㄱ + ㅗ + ㅏ", note: "Vocal compuesta: parte abajo y parte a la derecha." },
];
