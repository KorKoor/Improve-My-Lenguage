import assert from "node:assert/strict";
import { test } from "node:test";
import { dailyQuests, levelFromXp, questValue, totalXp, xpForLevel } from "../src/lib/engine/quests";

const base = { day: "2026-09-25", userId: "u1", dueReviews: 0, dailyMinutes: 15, favorites: [] as string[], weakest: null, aiAvailable: false };

test("misiones: tres, deterministas por día y usuario, siempre con la sesión", () => {
  const a = dailyQuests({ ...base, favorites: [] });
  const b = dailyQuests({ ...base, favorites: [] });
  assert.equal(a.length, 3);
  assert.deepEqual(a, b);
  assert.equal(a[0]!.metric, "session");
  assert.equal(new Set(a.map((q) => q.id)).size, 3);
});

test("misiones: repaso si hay pendientes; nunca tutor sin IA", () => {
  for (let d = 1; d <= 28; d++) {
    const q = dailyQuests({ ...base, day: `2026-02-${String(d).padStart(2, "0")}`, dueReviews: 42, favorites: ["tutor"] });
    assert.equal(q[2]!.metric, "reviews");
    assert.ok(q.every((x) => x.metric !== "conversation"));
  }
});

test("misiones: el progreso sale de la actividad real", () => {
  const [session, , third] = dailyQuests({ ...base, dueReviews: 20 });
  const stats = { exercises: 12, correct: 9, minutes: 10, wordsReviewed: 25, events: { session_completed: 1 } };
  assert.equal(questValue(session!, stats), 1);
  assert.equal(questValue(third!, stats), 25);
});

test("XP y nivel: curva coherente", () => {
  assert.equal(levelFromXp(0).level, 1);
  assert.equal(levelFromXp(xpForLevel(5)).level, 5);
  assert.equal(levelFromXp(xpForLevel(5) - 1).level, 4);
  const l = levelFromXp(xpForLevel(3) + 10);
  assert.ok(l.progress > 0 && l.progress < 1);
  assert.equal(totalXp({ exercises: 10, correct: 5, readings: 1, writings: 0, listening: 0, speaking: 0, conversations: 0, achievements: 1, questXp: 50 }), 50 + 25 + 40 + 100 + 50);
});

test("protector de racha: cubre los días perdidos sólo si alcanza", async () => {
  const { computeStreak, freezeDaysNeeded } = await import("../src/lib/engine/progress");
  const active = ["2026-09-20", "2026-09-21", "2026-09-22"];
  // Hoy 24, ayer (23) sin actividad → 1 protector lo cubre.
  assert.deepEqual(freezeDaysNeeded(active, "2026-09-24", 1), ["2026-09-23"]);
  assert.equal(computeStreak([...active, "2026-09-23"], "2026-09-24"), 4);
  // Dos días perdidos con un solo protector: no alcanza, no se gasta.
  assert.deepEqual(freezeDaysNeeded(active, "2026-09-25", 1), []);
  assert.deepEqual(freezeDaysNeeded(active, "2026-09-25", 2), ["2026-09-24", "2026-09-23"]);
  // Ayer estudiaste: no hace falta.
  assert.deepEqual(freezeDaysNeeded(active, "2026-09-23", 2), []);
  // Sin historial nunca se consume.
  assert.deepEqual(freezeDaysNeeded([], "2026-09-23", 2), []);
});

test("misiones: la de verbos sólo aparece si el idioma conjuga", () => {
  for (let d = 1; d <= 28; d++) {
    const day = `2026-03-${String(d).padStart(2, "0")}`;
    const no = dailyQuests({ ...base, day, weakest: "grammar", hasVerbs: false });
    assert.ok(no.every((q) => q.metric !== "verbs"));
  }
  const some = Array.from({ length: 28 }, (_, d) => dailyQuests({ ...base, day: `2026-03-${String(d + 1).padStart(2, "0")}`, weakest: "grammar", hasVerbs: true }));
  assert.ok(some.some((qs) => qs.some((q) => q.metric === "verbs")));
});
