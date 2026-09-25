"use client";

import { useSyncExternalStore } from "react";
import { ACTIVITY_META, type PlanBlock } from "@/lib/engine/study-plan";
import { getStudyPlanAction, syncStudyPlanAction } from "@/app/app/study-actions";

/**
 * Plan del modo estudio en curso. Es una comodidad de este dispositivo
 * (localStorage): si se pierde, el alumno sólo tiene que volver a empezarlo.
 */
export interface ActivePlan {
  v: 1;
  blocks: PlanBlock[];
  names: Record<string, { name: string; flag: string }>;
  idx: number;
  startedAt: number;
  blockStartedAt: number;
}

const KEY = "iml:study-plan";
const MAX_AGE = 6 * 3600_000;
const listeners = new Set<() => void>();
let cache: { raw: string | null; plan: ActivePlan | null } = { raw: null, plan: null };

function read(): ActivePlan | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cache.raw) return cache.plan;
  let plan: ActivePlan | null = null;
  try {
    const p = raw ? (JSON.parse(raw) as ActivePlan) : null;
    if (p && p.v === 1 && Array.isArray(p.blocks) && Date.now() - p.startedAt < MAX_AGE && p.idx < p.blocks.length) plan = p;
  } catch {}
  cache = { raw, plan };
  return plan;
}

function write(plan: ActivePlan | null, sync = true) {
  try {
    if (plan) localStorage.setItem(KEY, JSON.stringify(plan));
    else localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
  // El servidor guarda el plan para reanudarlo en otro dispositivo (localStorage es sólo caché).
  if (sync) void syncStudyPlanAction(plan).catch(() => {});
}

/** Al abrir la app en otro dispositivo: recupera el plan en curso del servidor. */
export async function restorePlanFromServer(): Promise<void> {
  if (read()) return;
  try {
    const r = await getStudyPlanAction();
    if (r.ok && r.data) write(r.data as ActivePlan, false);
  } catch {}
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => e.key === KEY && l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useActivePlan(): ActivePlan | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function startPlan(blocks: PlanBlock[], names: ActivePlan["names"]): ActivePlan {
  const now = Date.now();
  const plan: ActivePlan = { v: 1, blocks, names, idx: 0, startedAt: now, blockStartedAt: now };
  write(plan);
  return plan;
}

/** Avanza al siguiente bloque; devuelve el plan actualizado o null si terminó. */
export function advancePlan(): ActivePlan | null {
  const p = read();
  if (!p) return null;
  if (p.idx + 1 >= p.blocks.length) {
    write(null);
    return null;
  }
  const next = { ...p, idx: p.idx + 1, blockStartedAt: Date.now() };
  write(next);
  return next;
}

export function stopPlan() {
  write(null);
}

export function currentPlan(): ActivePlan | null {
  return read();
}

/** URL a la que lleva un bloque. */
export function blockHref(b: PlanBlock, idx: number): string {
  if (b.kind === "break") return `/app/study/break?i=${idx}`;
  if (b.activity === "session") return `/app/session?minutes=${Math.max(5, Math.min(60, b.minutes))}&plan=1`;
  return ACTIVITY_META[b.activity].href;
}

export function blockLabel(b: PlanBlock, names: ActivePlan["names"]): string {
  if (b.kind === "break") return `Descanso · ${b.minutes} min`;
  const n = names[b.code];
  return `${ACTIVITY_META[b.activity].label}${n ? ` · ${n.name}` : ""}`;
}
