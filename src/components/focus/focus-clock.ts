"use client";

/** Reloj de uso continuado (por pestaña): cuándo empezó el tramo actual sin pausa. */
export const FOCUS_START = "iml:focus-start";
export const FOCUS_SNOOZE = "iml:focus-snooze";

export function readClock(key: string): number {
  try {
    return Number(sessionStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

export function writeClock(key: string, v: number) {
  try {
    sessionStorage.setItem(key, String(v));
  } catch {}
}

/** Marca un descanso hecho: el tramo de foco vuelve a empezar. */
export function markBreak() {
  writeClock(FOCUS_START, Date.now());
}
