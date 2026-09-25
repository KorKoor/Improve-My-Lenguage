/**
 * Corrección de dictados palabra por palabra (alineación LCS).
 * Pura y determinista: marca qué palabras acertaste, cuáles faltan y cuáles
 * sobran, tolerando mayúsculas, puntuación y (opcionalmente) acentos.
 */
export interface DiffPart {
  text: string;
  kind: "ok" | "missing" | "extra" | "typo";
}

export interface DictationResult {
  parts: DiffPart[];
  /** Proporción de palabras esperadas bien escritas (0–1). */
  score: number;
  correct: boolean;
}

const strip = (s: string) => s.normalize("NFD").replace(/\p{Mn}/gu, "").normalize("NFC");

export function words(text: string, spaceSeparated = true): string[] {
  if (!spaceSeparated) return [...text.replace(/[\s\p{P}\p{S}]/gu, "")];
  return text
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .split(/[^\p{L}\p{M}\p{N}']+/u)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter(Boolean);
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length]![b.length]!;
}

/** ¿Dos palabras coinciden? Exacto, sin acentos, o con una errata en palabras largas. */
function same(a: string, b: string): "ok" | "typo" | null {
  if (a === b) return "ok";
  if (strip(a) === strip(b)) return "typo";
  if (a.length >= 5 && editDistance(a, b) === 1) return "typo";
  return null;
}

export function gradeDictation(expected: string, typed: string, spaceSeparated = true): DictationResult {
  const e = words(expected, spaceSeparated);
  const t = words(typed, spaceSeparated);
  // LCS con coincidencia "blanda".
  const dp = Array.from({ length: e.length + 1 }, () => Array<number>(t.length + 1).fill(0));
  for (let i = e.length - 1; i >= 0; i--)
    for (let j = t.length - 1; j >= 0; j--)
      dp[i]![j] = same(e[i]!, t[j]!) ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const parts: DiffPart[] = [];
  let i = 0;
  let j = 0;
  let good = 0;
  while (i < e.length && j < t.length) {
    const m = same(e[i]!, t[j]!);
    if (m) {
      parts.push({ text: e[i]!, kind: m });
      good += m === "ok" ? 1 : 0.8;
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      parts.push({ text: e[i]!, kind: "missing" });
      i++;
    } else {
      parts.push({ text: t[j]!, kind: "extra" });
      j++;
    }
  }
  while (i < e.length) parts.push({ text: e[i++]!, kind: "missing" });
  while (j < t.length) parts.push({ text: t[j++]!, kind: "extra" });
  const extras = parts.filter((p) => p.kind === "extra").length;
  const score = e.length ? Math.max(0, (good - extras * 0.5) / e.length) : 0;
  return { parts, score, correct: score >= 0.85 };
}
