/**
 * Métricas de progreso con definición explícita (ver docs/ADAPTIVE_ENGINE.md).
 * Nada de porcentajes inventados: cada número se deriva de datos observables.
 */
import { currentRetrievability, type CardMemory } from "./fsrs";

export interface KnowledgeRow extends CardMemory {
  itemId: string;
  itemType: "vocab" | "grammar" | "letter" | "rule";
}

/** Aprendida: ≥ 2 repasos, estabilidad ≥ 3 días y R actual ≥ 0.8. */
export function isLearned(row: CardMemory, now: Date): boolean {
  return row.reps >= 2 && row.stability >= 3 && currentRetrievability(row, now) >= 0.8;
}

/** Dominada: estabilidad ≥ 21 días (recuerdo fiable a 3 semanas vista). */
export function isMastered(row: CardMemory): boolean {
  return row.stability >= 21;
}

/**
 * Maestría de un ítem en [0, 1]:
 *   R_actual × min(1, ln(1+S) / ln(1+30))
 * Combina "¿lo recuerdas ahora?" con "¿cuánto aguanta ese recuerdo?".
 */
export function mastery(row: CardMemory, now: Date): number {
  if (row.reps === 0) return 0;
  const r = currentRetrievability(row, now);
  const durability = Math.min(1, Math.log(1 + row.stability) / Math.log(31));
  return Math.round(r * durability * 1000) / 1000;
}

export interface VocabularySummary {
  seen: number;
  learned: number;
  mastered: number;
  due: number;
}

export function summarizeVocabulary(rows: KnowledgeRow[], now: Date): VocabularySummary {
  let seen = 0;
  let learned = 0;
  let mastered = 0;
  let due = 0;
  for (const r of rows) {
    if (r.itemType !== "vocab" || r.reps === 0) continue;
    seen++;
    if (isLearned(r, now)) learned++;
    if (isMastered(r)) mastered++;
    if (r.due.getTime() <= now.getTime()) due++;
  }
  return { seen, learned, mastered, due };
}

/** Precisión = aciertos / intentos (null si no hay intentos). */
export function accuracy(correct: number, total: number): number | null {
  return total > 0 ? correct / total : null;
}

/** Fecha local YYYY-MM-DD en una zona horaria IANA. */
export function localDay(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts; // en-CA ya formatea como YYYY-MM-DD
}

/** Lunes (UTC) de la semana de una fecha, YYYY-MM-DD (agrupación semanal de precisión). */
export function weekStart(d: Date): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x.toISOString().slice(0, 10);
}

export function addDays(day: string, delta: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * Racha = días consecutivos con actividad terminando hoy o ayer
 * (si hoy aún no estudió, la racha de ayer sigue viva).
 */
export function computeStreak(activeDays: Iterable<string>, today: string): number {
  const set = new Set(activeDays);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(activeDays: Iterable<string>): number {
  const days = [...new Set(activeDays)].sort();
  let best = 0;
  let cur = 0;
  let prev: string | null = null;
  for (const d of days) {
    cur = prev && addDays(prev, 1) === d ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

/** Consistencia: % de días con actividad en los últimos N días. */
export function consistency(activeDays: Iterable<string>, today: string, windowDays = 28): number {
  const set = new Set(activeDays);
  let hits = 0;
  for (let i = 0; i < windowDays; i++) if (set.has(addDays(today, -i))) hits++;
  return hits / windowDays;
}



// ── Protector de racha ──────────────────────────────────────────────────────
export const MAX_STREAK_FREEZES = 2;

/**
 * Días que un protector debe cubrir para salvar la racha: los días sin
 * actividad entre ayer y el último día activo, si caben en los protectores
 * disponibles y hay racha que salvar. Devuelve [] si no hace falta o no alcanza.
 */
export function freezeDaysNeeded(covered: Iterable<string>, today: string, freezes: number): string[] {
  if (freezes <= 0) return [];
  const set = new Set(covered);
  const missing: string[] = [];
  let cursor = addDays(today, -1);
  while (!set.has(cursor)) {
    missing.push(cursor);
    if (missing.length > freezes) return [];
    cursor = addDays(cursor, -1);
  }
  return missing;
}
