import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { checkTrace, resample, type Stroke } from "../src/lib/content/strokes";

type Set = { source: string; license: string; chars: { ch: string; kind: string; r: string; strokes: Stroke[] }[] };
const load = (lang: string) => JSON.parse(readFileSync(`data/strokes/${lang}.json`, "utf-8")) as Set;
const pts = (d: string) => {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  return Array.from({ length: n.length / 2 }, (_, i) => [n[2 * i]!, n[2 * i + 1]!] as [number, number]);
};

test("caligrafía: orden de trazos importado, con fuente y licencia", () => {
  const ja = load("ja");
  const zh = load("zh");
  assert.equal(ja.license, "CC BY-SA 3.0");
  assert.equal(zh.license, "Arphic Public License");
  const count = (s: Set, ch: string) => s.chars.find((c) => c.ch === ch)?.strokes.length;
  assert.equal(count(ja, "あ"), 3);
  assert.equal(count(ja, "ア"), 2);
  assert.equal(count(ja, "人"), 2);
  assert.equal(count(zh, "人"), 2);
  assert.equal(count(zh, "你"), 7);
  assert.equal(ja.chars.filter((c) => c.kind === "hiragana").length, 71);
  for (const s of [ja, zh]) for (const c of s.chars) {
    assert.ok(c.r, `${c.ch}: sin lectura`);
    for (const st of c.strokes) {
      assert.match(st.d, /^M[\d. L-]+$/, `${c.ch}: camino`);
      assert.ok(pts(st.d).every(([x, y]) => x >= -5 && x <= 105 && y >= -5 && y <= 105), `${c.ch}: fuera de la caja`);
      assert.match(st.desc, /^(Trazo \d+ de \d+|Un solo trazo): /);
    }
  }
});

test("calcar: el modelo pasa; al revés o con otra forma, no", () => {
  const ch = load("zh").chars.find((c) => c.ch === "人")!;
  const drawn = ch.strokes.map((s) => pts(s.d));
  assert.equal(checkTrace(ch.strokes, drawn), 0);
  assert.equal(checkTrace(ch.strokes, drawn.map((p) => [...p].reverse())), 1, "dirección contraria");
  assert.equal(checkTrace(ch.strokes, [drawn[1]!, drawn[0]!]), 1, "orden cambiado");
  // Mismo inicio y final pero dando un rodeo enorme por el camino.
  const d0 = drawn[0]!;
  const detour: [number, number][] = [d0[0]!, [95, 5], [95, 95], d0[d0.length - 1]!];
  assert.equal(checkTrace(ch.strokes, [detour, drawn[1]!]), 1, "forma distinta");
  assert.equal(resample([[0, 0], [10, 0]], 3)[1]![0], 5);
});
