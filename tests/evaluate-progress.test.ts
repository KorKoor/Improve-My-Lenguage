import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateText, evaluateChoice, levenshtein } from "../src/lib/engine/evaluate";
import {
  computeStreak,
  longestStreak,
  consistency,
  isLearned,
  mastery,
  summarizeVocabulary,
  localDay,
  type KnowledgeRow,
} from "../src/lib/engine/progress";
import { Fsrs, newCard } from "../src/lib/engine/fsrs";
import { newlyUnlocked } from "../src/lib/engine/achievements";

test("evaluación: mayúsculas, puntuación y contracciones", () => {
  assert.ok(evaluateText("  Although ", ["although"], "en").correct);
  assert.ok(evaluateText("I'm 20 years old.", ["I am 20 years old"], "en").correct);
  assert.ok(evaluateText("she doesn't know", ["She does not know."], "en").correct);
  assert.equal(evaluateText("", ["x"], "en").correct, false);
});

test("evaluación: erratas y acentos como casi-correcto", () => {
  const typo = evaluateText("dependancy", ["dependency"], "en");
  assert.ok(typo.correct && typo.nearMiss && typo.note === "typo");
  const accent = evaluateText("cafe", ["café"], "fr");
  assert.ok(accent.correct && accent.nearMiss && accent.note === "accent");
  assert.equal(evaluateText("cat", ["car"], "en").correct, false, "palabras cortas no toleran erratas");
  assert.equal(evaluateText("went", ["go"], "en").correct, false);
});

test("evaluación: escrituras no latinas", () => {
  assert.ok(evaluateText("ねこ", ["ねこ"], "ja").correct);
  assert.ok(evaluateText("ねこ。", ["ねこ"], "ja").correct);
  assert.ok(evaluateChoice("Aunque", "aunque").correct);
  assert.equal(levenshtein("kitten", "sitting"), 3);
});

test("racha, racha máxima y consistencia", () => {
  const days = ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-05", "2026-03-06"];
  assert.equal(computeStreak(days, "2026-03-06"), 2);
  assert.equal(computeStreak(days, "2026-03-07"), 2, "ayer cuenta si hoy aún no estudió");
  assert.equal(computeStreak(days, "2026-03-08"), 0);
  assert.equal(longestStreak(days), 3);
  assert.ok(Math.abs(consistency(days, "2026-03-06", 7) - 5 / 7) < 1e-9);
});

test("localDay respeta la zona horaria", () => {
  const d = new Date("2026-03-10T03:00:00Z");
  assert.equal(localDay(d, "UTC"), "2026-03-10");
  assert.equal(localDay(d, "America/Mexico_City"), "2026-03-09");
});

test("aprendida / maestría definidas sobre la memoria FSRS", () => {
  const f = new Fsrs();
  const t0 = new Date("2026-01-01T00:00:00Z");
  let c = f.review(newCard(t0), 3, t0);
  assert.equal(isLearned(c, t0), false, "1 repaso no basta");
  c = f.review(c, 3, c.due);
  c = f.review(c, 3, c.due);
  assert.ok(isLearned(c, c.lastReview!));
  const m = mastery(c, c.lastReview!);
  assert.ok(m > 0 && m <= 1);
  const rows: KnowledgeRow[] = [
    { ...c, itemId: "a", itemType: "vocab" },
    { ...newCard(t0), itemId: "b", itemType: "vocab" },
  ];
  const s = summarizeVocabulary(rows, c.lastReview!);
  assert.equal(s.seen, 1);
  assert.equal(s.learned, 1);
});

test("logros sólo se desbloquean una vez", () => {
  const stats = {
    sessionsCompleted: 1,
    wordsLearned: 0,
    currentStreak: 7,
    exercisesCompleted: 10,
    conversations: 0,
    minutesStudied: 60,
    assessmentsCompleted: 1,
    languagesStarted: 1,
  };
  const ids = newlyUnlocked(stats, new Set()).map((a) => a.id);
  assert.deepEqual(ids.sort(), ["first-assessment", "first-session", "streak-7"]);
  assert.equal(newlyUnlocked(stats, new Set(ids)).length, 0);
});
