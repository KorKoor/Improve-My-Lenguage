/**
 * Entonación en el navegador, sin servidores: frecuencia fundamental (F0) por
 * autocorrelación, curva normalizada en semitonos y, para el chino, qué tono
 * se parece más a lo que dijiste. Funciones puras (se prueban con senos).
 */

const MIN_HZ = 70;
const MAX_HZ = 500;

/** F0 de una ventana (Hz) o null si no hay voz (silencio o ruido). */
export function detectPitch(frame: Float32Array, sampleRate: number): number | null {
  const n = frame.length;
  let energy = 0;
  for (let i = 0; i < n; i++) energy += frame[i]! * frame[i]!;
  if (Math.sqrt(energy / n) < 0.01) return null;
  const minLag = Math.floor(sampleRate / MAX_HZ);
  const maxLag = Math.min(n - 1, Math.ceil(sampleRate / MIN_HZ));
  // Función de diferencia normalizada (YIN simplificado).
  const d = new Float32Array(maxLag + 1);
  let running = 0;
  d[0] = 1;
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i + lag < n; i++) {
      const diff = frame[i]! - frame[i + lag]!;
      sum += diff * diff;
    }
    running += sum;
    d[lag] = running ? (sum * lag) / running : 1;
  }
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (d[lag]! < 0.15) {
      // Primer mínimo local por debajo del umbral, afinado con una parábola.
      while (lag + 1 <= maxLag && d[lag + 1]! < d[lag]!) lag++;
      const a = d[lag - 1] ?? d[lag]!;
      const b = d[lag]!;
      const c = d[lag + 1] ?? d[lag]!;
      const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
      return sampleRate / (lag + (Number.isFinite(shift) ? shift : 0));
    }
  }
  return null;
}

/** Curva de F0 cada `hopMs` milisegundos. */
export function pitchTrack(samples: Float32Array, sampleRate: number, hopMs = 10, windowMs = 40): (number | null)[] {
  const hop = Math.round((sampleRate * hopMs) / 1000);
  const win = Math.round((sampleRate * windowMs) / 1000);
  const out: (number | null)[] = [];
  for (let start = 0; start + win <= samples.length; start += hop) out.push(detectPitch(samples.subarray(start, start + win), sampleRate));
  return out;
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
};

/**
 * Curva comparable entre voces: sólo la parte con voz, saltos de octava
 * corregidos, suavizada, en semitonos respecto a la mediana del hablante y
 * con `points` puntos (así un hombre y una mujer se comparan bien).
 */
export function normalizeContour(track: (number | null)[], points = 40): number[] | null {
  const first = track.findIndex((x) => x !== null);
  let last = track.length - 1;
  while (last >= 0 && track[last] === null) last--;
  if (first < 0 || last - first < 4) return null;
  const voiced = track.slice(first, last + 1);
  const values = voiced.filter((x): x is number => x !== null);
  if (values.length < 5) return null;
  const med = median(values);
  // Semitonos respecto a la mediana; los huecos sin voz se rellenan con el vecino.
  let prev = 0;
  const st = voiced.map((hz) => {
    if (hz === null) return prev;
    let s = 12 * Math.log2(hz / med);
    // Errores de octava típicos de la autocorrelación.
    while (s > 9) s -= 12;
    while (s < -9) s += 12;
    prev = s;
    return s;
  });
  // Mediana móvil de 5 (quita picos) y luego media de 3.
  const med5 = st.map((_, i) => median(st.slice(Math.max(0, i - 2), i + 3)));
  const smooth = med5.map((_, i) => {
    const w = med5.slice(Math.max(0, i - 1), i + 2);
    return w.reduce((a, b) => a + b, 0) / w.length;
  });
  return Array.from({ length: points }, (_, k) => {
    const pos = (k / (points - 1)) * (smooth.length - 1);
    const i = Math.floor(pos);
    const t = pos - i;
    return smooth[i]! * (1 - t) + (smooth[i + 1] ?? smooth[i]!) * t;
  });
}

export type Tone = 1 | 2 | 3 | 4;

/**
 * Tono del chino mandarín que mejor describe una curva normalizada (una sílaba):
 * 1 alto y plano, 2 sube, 3 baja y (a veces) vuelve a subir, 4 cae con fuerza.
 */
export function classifyTone(contour: number[]): Tone {
  const n = contour.length;
  const seg = (a: number, b: number) => {
    const xs = contour.slice(Math.floor(a * n), Math.max(Math.floor(a * n) + 1, Math.floor(b * n)));
    return xs.reduce((s, x) => s + x, 0) / xs.length;
  };
  const start = seg(0, 0.2);
  const mid = seg(0.35, 0.65);
  const end = seg(0.8, 1);
  const min = Math.min(...contour);
  const minAt = contour.indexOf(min) / (n - 1);
  const range = Math.max(...contour) - min;
  const rise = end - start;
  if (range < 2) return 1;
  // Baja hasta el medio y sube al final: tercer tono.
  if (minAt > 0.25 && minAt < 0.8 && start - min > 1 && end - min > 1.5) return 3;
  if (rise <= -2.5) return mid > end ? 4 : 3;
  if (rise >= 2) return 2;
  if (rise < 0) return mid - end > 1 ? 4 : 1;
  return 1;
}

/** Forma de referencia de cada tono (0 = grave, 1 = agudo), para dibujarla. */
export const TONE_SHAPES: Record<Tone, number[]> = {
  1: [0.9, 0.9, 0.9, 0.9, 0.9],
  2: [0.5, 0.55, 0.65, 0.8, 0.95],
  3: [0.4, 0.2, 0.1, 0.25, 0.6],
  4: [1, 0.85, 0.6, 0.35, 0.1],
};

/** Descripción en palabras de una curva (para lectores de pantalla y para dar pistas). */
export function describeContour(contour: number[]): string {
  const n = contour.length;
  const a = contour.slice(0, Math.ceil(n / 4)).reduce((s, x) => s + x, 0) / Math.ceil(n / 4);
  const z = contour.slice(-Math.ceil(n / 4)).reduce((s, x) => s + x, 0) / Math.ceil(n / 4);
  const range = Math.max(...contour) - Math.min(...contour);
  if (range < 2) return "casi plana";
  const minAt = contour.indexOf(Math.min(...contour)) / (n - 1);
  const maxAt = contour.indexOf(Math.max(...contour)) / (n - 1);
  if (minAt > 0.25 && minAt < 0.75 && Math.min(a, z) - Math.min(...contour) > 1) return "baja y vuelve a subir";
  if (maxAt > 0.25 && maxAt < 0.75 && Math.max(...contour) - Math.max(a, z) > 1) return "sube y luego baja";
  return z > a ? "sube" : "baja";
}

/** Tono de una sílaba en pinyin por su marca (ā á ǎ à); null si es neutro o hay varias sílabas. */
export function pinyinTone(syllable: string): Tone | null {
  const s = syllable.normalize("NFD");
  if (/\s/.test(syllable.trim()) || !/^[a-zǜ-ͯ]+$/i.test(s)) return null;
  const marks = s.match(/[̄́̌̀]/g) ?? [];
  if (marks.length !== 1) return null;
  return ({ "̄": 1, "́": 2, "̌": 3, "̀": 4 } as const)[marks[0] as "̄"] ?? null;
}
