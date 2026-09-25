import assert from "node:assert/strict";
import { test } from "node:test";
import { weekStart } from "../src/lib/engine/progress";
import { reminderMessage } from "../src/lib/services/reminders";

test("weekStart agrupa por semana ISO (lunes, UTC)", () => {
  assert.equal(weekStart(new Date("2026-09-24T15:00:00Z")), "2026-09-21"); // jueves → lunes
  assert.equal(weekStart(new Date("2026-09-21T00:00:00Z")), "2026-09-21"); // lunes → mismo día
  assert.equal(weekStart(new Date("2026-09-27T23:59:59Z")), "2026-09-21"); // domingo → lunes anterior
  assert.equal(weekStart(new Date("2026-01-01T10:00:00Z")), "2025-12-29"); // cruza de año
});

test("el recordatorio prioriza repasos pendientes, luego la racha", () => {
  const due = reminderMessage({ displayName: "Carlos", due: 12, streakYesterday: true });
  assert.match(due.body, /12 palabras listas/);
  assert.equal(due.link, "/app/review");
  assert.match(reminderMessage({ displayName: null, due: 1, streakYesterday: false }).body, /1 palabra lista/);

  const streak = reminderMessage({ displayName: null, due: 0, streakYesterday: true });
  assert.match(streak.title, /racha/);
  assert.equal(streak.link, "/app/session");

  const daily = reminderMessage({ displayName: "Ana", due: 0, streakYesterday: false });
  assert.match(daily.body, /^Ana, tu sesión diaria está esperando/);
});
