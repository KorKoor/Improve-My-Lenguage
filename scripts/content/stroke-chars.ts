/**
 * Lista de caracteres para build_strokes.py: kana completos (japonés) y los
 * kanji / hanzi de las palabras básicas, cada uno con una palabra de ejemplo.
 *
 *   npx tsx --conditions=react-server scripts/content/stroke-chars.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { catalog } from "../../src/lib/content";
import { alphabetFor, romanForms } from "../../src/lib/content/alphabets";
import { courseWords } from "../../src/lib/engine/course";
import { translationOf } from "../../src/lib/engine/exercises";
import { transliterate } from "../../src/lib/content/alphabets";

const HIRA = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
const KATA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";
const HAN = /\p{Script=Han}/u;
const MAX_HAN = { ja: 160, zh: 220 } as const;

type Row = { ch: string; kind: "hiragana" | "katakana" | "han"; r: string };

function han(lang: "ja" | "zh"): Row[] {
  const vocab = catalog.vocab(lang);
  const words = [...courseWords(vocab, "es", 210), ...vocab.slice(0, 1500)];
  const out = new Map<string, Row>();
  // Primero los caracteres de la Fase 0 (一 二 三 人…), en su orden.
  for (const l of alphabetFor(lang)?.groups.flatMap((g) => g.letters) ?? []) {
    if ([...l.g].length === 1 && HAN.test(l.g)) out.set(l.g, { ch: l.g, kind: "han", r: `${l.r} · ${(l.hint ?? "").split(" = ").pop()}` });
  }
  for (const v of words) {
    for (const ch of v.lemma) {
      if (!HAN.test(ch) || out.has(ch) || out.size >= MAX_HAN[lang]) continue;
      const own = vocab.find((x) => x.lemma === ch);
      const w = own ?? v;
      const parts = [w.lemma === ch ? "" : w.lemma, w.reading ?? "", translationOf(w, "es").slice(0, 2).join(", ")];
      out.set(ch, { ch, kind: "han", r: parts.filter(Boolean).join(" · ") });
    }
  }
  return [...out.values()];
}

/** ぢ y づ suenan como じ y ず (el transliterador no las trae). */
const KANA_EXTRA: Record<string, string> = { ぢ: "ji (di)", づ: "zu (du)", ヂ: "ji (di)", ヅ: "zu (du)" };
const kana = (s: string, kind: Row["kind"]): Row[] =>
  [...s].map((ch) => ({ ch, kind, r: KANA_EXTRA[ch] ?? romanForms(transliterate("ja", ch) ?? "")[0] ?? transliterate("ja", ch) ?? "" }));

const dir = path.join(process.cwd(), "scripts/content/.strokes");
mkdirSync(dir, { recursive: true });
const ja = [...kana(HIRA, "hiragana"), ...kana(KATA, "katakana"), ...han("ja")];
const zh = han("zh");
writeFileSync(path.join(dir, "chars.json"), JSON.stringify({ ja, zh }));
console.log(`ja: ${ja.length} · zh: ${zh.length}`);
