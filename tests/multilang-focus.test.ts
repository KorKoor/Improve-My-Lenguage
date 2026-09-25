import assert from "node:assert/strict";
import { test } from "node:test";
import { allocateTime, interference, interferenceTips, orderForInterference, polyglotDays, reviewMinutes, type LanguageStat } from "../src/lib/engine/multilang";
import { attentionSpan, bestStudyTime, fatigueOnset, planBreak, readFocus, type FocusEvent } from "../src/lib/engine/focus";
import { buildStudyPlan } from "../src/lib/engine/study-plan";

const lang = (code: string, p: Partial<LanguageStat> = {}): LanguageStat => ({ code, priority: "active", due: 0, minutesWeek: 30, daysSince: 1, ...p });

test("reparto: respeta el total, bloques de 5 y da más al principal", () => {
  const a = allocateTime([lang("en", { priority: "main" }), lang("it"), lang("de")], 30);
  assert.equal(a.reduce((s, x) => s + x.minutes, 0), 30);
  assert.ok(a.every((x) => x.minutes % 5 === 0 && x.minutes >= 5));
  const en = a.find((x) => x.code === "en")!;
  assert.ok(a.every((x) => x.minutes <= en.minutes));
});

test("reparto: «mantener» al día descansa; con repasos entra en modo repaso", () => {
  const rest = allocateTime([lang("en", { priority: "main" }), lang("fr", { priority: "maintain", due: 0, daysSince: 1 })], 20);
  assert.deepEqual(rest.map((x) => x.code), ["en"]);
  assert.equal(rest[0]!.minutes, 20);
  const due = allocateTime([lang("en", { priority: "main" }), lang("fr", { priority: "maintain", due: 30, daysSince: 1 })], 20);
  const fr = due.find((x) => x.code === "fr")!;
  assert.equal(fr.mode, "review");
  assert.ok(fr.reasons.some((r) => r.includes("30")));
});

test("reparto: no crea más bloques de los que caben y el abandonado sube", () => {
  const a = allocateTime([lang("en"), lang("fr"), lang("de"), lang("ja", { daysSince: 6 })], 10);
  assert.equal(a.length, 2);
  assert.ok(a.some((x) => x.code === "ja"));
  assert.equal(reviewMinutes(0), 0);
  assert.ok(reviewMinutes(1000) <= 20);
});

test("interferencia: idiomas cercanos no van seguidos si se puede evitar", () => {
  assert.equal(interference("it", "pt"), 2);
  assert.equal(interference("en", "de"), 1);
  assert.equal(interference("ja", "fr"), 0);
  const o = orderForInterference([{ code: "it" }, { code: "pt" }, { code: "ja" }]);
  assert.deepEqual(o.map((x) => x.code), ["it", "ja", "pt"]);
  const tips = interferenceTips(["it", "pt"], "es", (c) => c.toUpperCase());
  assert.ok(tips.length >= 3); // it-pt, it-es, pt-es
  assert.equal(tips[0]!.level, 2);
});

test("políglota: días con varios idiomas", () => {
  const rows = [
    { day: "2026-09-01", languageCode: "en", exercises: 4 },
    { day: "2026-09-01", languageCode: "it", exercises: 2 },
    { day: "2026-09-02", languageCode: "en", exercises: 3 },
    { day: "2026-09-02", languageCode: "it", exercises: 0 },
  ];
  assert.deepEqual(polyglotDays(rows), ["2026-09-01"]);
});

const ev = (pattern: string, ms = 4000, step = 0.5): FocusEvent[] => [...pattern].map((c, i) => ({ correct: c === "1", timeMs: ms, atMin: i * step }));

test("foco: fresco y acertando → seguir", () => {
  const r = readFocus(ev("1111111111"), { span: 15, sinceBreakMin: 5 });
  assert.equal(r.advice, "continue");
  assert.ok(r.fatigue < 0.4);
});

test("foco: precisión que cae, lentitud y tiempo → pausa", () => {
  const events = [...ev("11111111"), ...ev("000100", 12_000)].map((e, i) => ({ ...e, atMin: i * 1.5 }));
  const r = readFocus(events, { span: 12, sinceBreakMin: 20 });
  assert.ok(["break", "stop"].includes(r.advice), r.advice);
  assert.ok(r.reasons.length >= 2);
  const b = planBreak(r, 20, 1);
  assert.ok(b.seconds >= 180);
  assert.match(b.why, /porque/);
});

test("foco: calentando con pocos datos nunca manda parar", () => {
  const r = readFocus(ev("00"), { span: 10, sinceBreakMin: 3 });
  assert.equal(r.state, "warming");
  assert.equal(r.advice, "continue");
});

test("atención: detecta el inicio de la fatiga y aprende el promedio", () => {
  const onset = fatigueOnset(ev("111111111111000000", 4000, 1));
  assert.ok(onset !== null && onset >= 10 && onset <= 17, String(onset));
  assert.equal(fatigueOnset(ev("1111111111111111")), null);
  assert.equal(attentionSpan([], 15), 18);
  const learned = attentionSpan(Array.from({ length: 10 }, () => ({ onsetMin: 9, durationMin: 20 })), 15);
  assert.ok(learned < 15 && learned >= 9, String(learned));
});

test("mejor hora: exige datos y diferencia real", () => {
  assert.equal(bestStudyTime([{ hour: 9, total: 10, correct: 9 }]), null);
  const hours = [
    { hour: 8, total: 40, correct: 38 },
    { hour: 9, total: 40, correct: 37 },
    { hour: 21, total: 60, correct: 36 },
    { hour: 22, total: 40, correct: 22 },
  ];
  const b = bestStudyTime(hours)!;
  assert.equal(b.daypart, "manana");
  assert.equal(b.peakHour, 8);
  assert.ok(b.lift >= 5 && b.confident);
});

test("plan de estudio: suma el total, descansos entre bloques y separa cercanos", () => {
  const p = buildStudyPlan([lang("it", { priority: "main" }), lang("pt"), lang("ja")], { total: 45, span: 15, seed: 0 });
  const sum = p.blocks.reduce((a, b) => a + b.minutes, 0);
  assert.equal(sum, 45);
  assert.ok(p.blocks.some((b) => b.kind === "break"));
  assert.equal(p.blocks[0]!.kind, "study");
  assert.notEqual(p.blocks.at(-1)!.kind, "break");
  // Nunca dos descansos seguidos, ni it→pt sin nada en medio.
  for (let i = 1; i < p.blocks.length; i++) {
    const a = p.blocks[i - 1]!;
    const b = p.blocks[i]!;
    assert.ok(!(a.kind === "break" && b.kind === "break"));
    if (a.kind === "study" && b.kind === "study" && a.code !== b.code) assert.ok(interference(a.code, b.code) < 2, `${a.code}->${b.code}`);
  }
  // Tiempo corto: sin descansos.
  const short = buildStudyPlan([lang("en")], { total: 10, span: 15 });
  assert.ok(short.blocks.every((b) => b.kind === "study"));
  assert.equal(short.studyMinutes, 10);
});
