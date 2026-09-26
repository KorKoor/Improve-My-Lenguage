// Revisión nativa: pendiente
/**
 * Orden de trazos de los signos más sencillos (japonés, chino, coreano y
 * árabe), dibujados a mano en una caja de 100 × 100. Cada trazo es un camino
 * SVG que empieza donde empieza el trazo real: así la animación muestra la
 * dirección y la práctica de calcar puede comprobar inicio y final.
 * Cada trazo lleva además su descripción en palabras (lector de pantalla).
 */
import type { LanguageCode } from "./types";

export interface Stroke {
  d: string;
  /** Descripción en español del trazo. */
  desc: string;
}

export interface StrokeChar {
  ch: string;
  r: string;
  strokes: Stroke[];
}

const STROKES: Record<string, StrokeChar[]> = {
  ja: [
    { ch: "く", r: "ku", strokes: [{ d: "M64 18 L34 50 L64 82", desc: "Un solo trazo: de arriba a la derecha baja en diagonal hacia la izquierda y vuelve a la derecha, como un pico." }] },
    { ch: "し", r: "shi", strokes: [{ d: "M40 18 L40 64 C40 82 56 84 74 68", desc: "Un solo trazo: baja recto y al final se curva hacia la derecha, subiendo un poco." }] },
    { ch: "つ", r: "tsu", strokes: [{ d: "M20 44 C44 30 80 30 78 50 C76 68 56 76 42 72", desc: "Un solo trazo: de izquierda a derecha en arco y se curva hacia abajo y atrás." }] },
    {
      ch: "い",
      r: "i",
      strokes: [
        { d: "M30 24 C27 48 30 68 40 78", desc: "Primer trazo, a la izquierda: baja curvándose un poco hacia la derecha." },
        { d: "M66 34 C73 44 76 55 72 66", desc: "Segundo trazo, a la derecha y más corto: baja en una curva suave." },
      ],
    },
    {
      ch: "こ",
      r: "ko",
      strokes: [
        { d: "M30 32 C44 29 57 29 68 32", desc: "Primer trazo: raya de izquierda a derecha, arriba." },
        { d: "M28 66 C44 74 60 74 74 66", desc: "Segundo trazo: raya curva de izquierda a derecha, abajo." },
      ],
    },
  ],
  zh: [
    { ch: "一", r: "yī (uno)", strokes: [{ d: "M18 50 L82 50", desc: "Una raya horizontal de izquierda a derecha." }] },
    {
      ch: "二",
      r: "èr (dos)",
      strokes: [
        { d: "M30 34 L70 34", desc: "Primer trazo: raya corta arriba, de izquierda a derecha." },
        { d: "M18 68 L82 68", desc: "Segundo trazo: raya más larga abajo, de izquierda a derecha." },
      ],
    },
    {
      ch: "三",
      r: "sān (tres)",
      strokes: [
        { d: "M28 26 L72 26", desc: "Primer trazo: raya de arriba, de izquierda a derecha." },
        { d: "M32 50 L68 50", desc: "Segundo trazo: raya del medio, más corta." },
        { d: "M18 76 L82 76", desc: "Tercer trazo: raya de abajo, la más larga." },
      ],
    },
    {
      ch: "十",
      r: "shí (diez)",
      strokes: [
        { d: "M18 46 L82 46", desc: "Primer trazo: raya horizontal de izquierda a derecha." },
        { d: "M50 16 L50 86", desc: "Segundo trazo: raya vertical de arriba abajo, cruzando la primera." },
      ],
    },
    {
      ch: "人",
      r: "rén (persona)",
      strokes: [
        { d: "M50 18 C48 44 38 64 18 82", desc: "Primer trazo: desde arriba baja curvándose hacia la izquierda." },
        { d: "M50 46 C58 62 70 74 84 82", desc: "Segundo trazo: desde el medio del primero baja hacia la derecha." },
      ],
    },
    {
      ch: "口",
      r: "kǒu (boca)",
      strokes: [
        { d: "M28 26 L28 78", desc: "Primer trazo: lado izquierdo, de arriba abajo." },
        { d: "M28 26 L72 26 L72 78", desc: "Segundo trazo: arriba de izquierda a derecha y baja por el lado derecho, en un solo movimiento." },
        { d: "M28 78 L72 78", desc: "Tercer trazo: cierra abajo, de izquierda a derecha." },
      ],
    },
  ],
  ko: [
    { ch: "ㄱ", r: "g/k", strokes: [{ d: "M24 30 L72 30 L72 82", desc: "Un solo trazo: de izquierda a derecha y baja por la derecha." }] },
    { ch: "ㄴ", r: "n", strokes: [{ d: "M30 20 L30 72 L80 72", desc: "Un solo trazo: baja por la izquierda y sigue hacia la derecha." }] },
    { ch: "ㅇ", r: "ng", strokes: [{ d: "M50 24 C31 24 24 40 24 52 C24 68 37 78 50 78 C64 78 76 68 76 52 C76 38 65 24 50 24", desc: "Un solo trazo: un círculo que empieza arriba y gira hacia la izquierda." }] },
    {
      ch: "ㅏ",
      r: "a",
      strokes: [
        { d: "M42 14 L42 86", desc: "Primer trazo: raya vertical larga de arriba abajo." },
        { d: "M42 50 L70 50", desc: "Segundo trazo: rayita corta desde el centro hacia la derecha." },
      ],
    },
    {
      ch: "ㅗ",
      r: "o",
      strokes: [
        { d: "M50 30 L50 62", desc: "Primer trazo: rayita vertical corta de arriba abajo." },
        { d: "M16 64 L84 64", desc: "Segundo trazo: raya horizontal larga de izquierda a derecha, debajo." },
      ],
    },
  ],
  ar: [
    { ch: "ا", r: "ā", strokes: [{ d: "M50 16 L50 84", desc: "Un solo trazo: raya vertical de arriba abajo." }] },
    {
      ch: "ب",
      r: "b",
      strokes: [
        { d: "M80 42 C82 60 72 64 50 64 C30 64 20 60 22 44", desc: "Primer trazo: empieza a la derecha, baja y recorre la base hacia la izquierda, como una barquita." },
        { d: "M50 80 L52 82", desc: "Segundo trazo: un punto debajo, en el centro." },
      ],
    },
    {
      ch: "ت",
      r: "t",
      strokes: [
        { d: "M80 50 C82 68 72 72 50 72 C30 72 20 68 22 52", desc: "Primer trazo: la misma barquita, de derecha a izquierda." },
        { d: "M58 36 L60 38", desc: "Segundo trazo: el punto de la derecha, encima." },
        { d: "M42 36 L44 38", desc: "Tercer trazo: el punto de la izquierda, encima." },
      ],
    },
    {
      ch: "ن",
      r: "n",
      strokes: [
        { d: "M76 40 C80 70 62 80 50 80 C36 80 22 70 25 46", desc: "Primer trazo: un cuenco hondo, de derecha a izquierda." },
        { d: "M50 30 L52 32", desc: "Segundo trazo: un punto encima, en el centro." },
      ],
    },
    { ch: "ل", r: "l", strokes: [{ d: "M68 14 L68 60 C68 78 56 82 42 80 C30 78 24 70 26 60", desc: "Un solo trazo: baja recto por la derecha y al final se curva hacia la izquierda y sube un poco." }] },
  ],
};

export function strokesFor(lang: LanguageCode): StrokeChar[] {
  return STROKES[lang] ?? [];
}

/** Punto inicial y final de un trazo (primer y último par de números del camino). */
export function strokeEnds(d: string): { from: [number, number]; to: [number, number] } {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  return { from: [n[0] ?? 0, n[1] ?? 0], to: [n[n.length - 2] ?? 0, n[n.length - 1] ?? 0] };
}

/**
 * Comprobación tolerante de lo calcado: mismo número de trazos y, en cada uno,
 * inicio y final cerca de los del modelo (en orden). Los puntos (trazos muy
 * cortos) sólo tienen que caer cerca. Devuelve el primer trazo mal hecho (1…n)
 * o 0 si todo está bien; -1 si el número de trazos no coincide.
 */
export function checkTrace(model: Stroke[], drawn: [number, number][][], tolerance = 24): number {
  const strokes = drawn.filter((s) => s.length > 0);
  if (strokes.length !== model.length) return -1;
  const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  for (let i = 0; i < model.length; i++) {
    const { from, to } = strokeEnds(model[i]!.d);
    const s = strokes[i]!;
    // Un punto es un trazo recto muy corto (un círculo también acaba donde empieza, pero no es un punto).
    const isDot = dist(from, to) < 6 && !/C/.test(model[i]!.d);
    const start = s[0]!;
    const end = s[s.length - 1]!;
    if (isDot) {
      if (dist(start, from) > tolerance) return i + 1;
      continue;
    }
    if (dist(start, from) > tolerance || dist(end, to) > tolerance) return i + 1;
    // Trazos importados (polilíneas): además, la forma por el camino, punto a punto.
    if (!/C/.test(model[i]!.d)) {
      const m = polyline(model[i]!.d);
      if (m.length > 2) {
        const a = resample(m, 10);
        const b = resample(s, 10);
        const mean = a.reduce((sum, p, k) => sum + dist(p, b[k]!), 0) / a.length;
        if (mean > tolerance * 0.9) return i + 1;
      }
    }
  }
  return 0;
}

/** Puntos de un camino hecho sólo de M y L. */
function polyline(d: string): [number, number][] {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i]!, n[i + 1]!]);
  return out;
}

/** `count` puntos repartidos a igual distancia a lo largo de una polilínea. */
export function resample(pts: [number, number][], count: number): [number, number][] {
  if (pts.length === 1) return Array.from({ length: count }, () => pts[0]!);
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i]![0], p[1] - pts[i]![1]));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  const out: [number, number][] = [];
  for (let k = 0; k < count; k++) {
    let target = (total * k) / (count - 1);
    let i = 0;
    while (i < seg.length - 1 && target > seg[i]!) target -= seg[i++]!;
    const t = seg[i] ? Math.min(1, target / seg[i]!) : 0;
    const a = pts[i]!;
    const b = pts[i + 1] ?? a;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}
