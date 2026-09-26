import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyTone, describeContour, detectPitch, normalizeContour, pitchTrack } from "../src/lib/pitch";

const SR = 16000;
/** Voz sintética: tono con frecuencia f(t) (Hz), con armónicos como una voz. */
function voice(f: (t: number) => number, seconds = 0.5, silence = 0.1): Float32Array {
  const pad = Math.round(SR * silence);
  const n = Math.round(SR * seconds);
  const out = new Float32Array(n + 2 * pad);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    phase += (2 * Math.PI * f(i / n)) / SR;
    out[pad + i] = 0.5 * Math.sin(phase) + 0.25 * Math.sin(2 * phase) + 0.12 * Math.sin(3 * phase);
  }
  return out;
}

test("F0: reconoce la frecuencia de una voz grave y de una aguda", () => {
  for (const hz of [110, 220, 300]) {
    const s = voice(() => hz, 0.1, 0);
    const p = detectPitch(s.subarray(0, 640), SR)!;
    assert.ok(Math.abs(p - hz) / hz < 0.03, `${hz} → ${p}`);
  }
  assert.equal(detectPitch(new Float32Array(640), SR), null, "silencio");
});

test("curva: sólo la parte con voz, en semitonos, igual para un hombre y una mujer", () => {
  const man = normalizeContour(pitchTrack(voice((t) => 110 + 60 * t), SR))!;
  const woman = normalizeContour(pitchTrack(voice((t) => 220 + 120 * t), SR))!;
  assert.equal(man.length, 40);
  assert.ok(man[39]! - man[0]! > 5, "sube");
  const diff = man.reduce((s, x, i) => s + Math.abs(x - woman[i]!), 0) / man.length;
  assert.ok(diff < 1, `misma forma (${diff})`);
  assert.equal(normalizeContour(pitchTrack(new Float32Array(SR), SR)), null);
});

test("tonos del chino: plano, sube, baja y sube, cae", () => {
  const tone = (f: (t: number) => number) => classifyTone(normalizeContour(pitchTrack(voice(f), SR))!);
  assert.equal(tone(() => 260), 1);
  assert.equal(tone((t) => 180 + 110 * t), 2);
  assert.equal(tone((t) => 200 - 180 * t + 200 * t * t), 3);
  assert.equal(tone((t) => 300 - 160 * t), 4);
  assert.equal(describeContour(normalizeContour(pitchTrack(voice((t) => 300 - 160 * t), SR))!), "baja");
});
