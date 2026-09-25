/**
 * Estudiar varios idiomas a la vez.
 *
 * Reparte el tiempo diario entre idiomas según la prioridad que elige el
 * alumno, los repasos pendientes (lo que se olvida si no se atiende hoy), el
 * abandono reciente y el objetivo de minutos de cada idioma. También ordena
 * los bloques para reducir la interferencia entre idiomas parecidos
 * (italiano ↔ portugués, alemán ↔ neerlandés…), que es la causa principal de
 * mezclas al estudiar lenguas cercanas el mismo día.
 */

export type LanguagePriority = "main" | "active" | "maintain";

export const PRIORITY_LABELS: Record<LanguagePriority, { label: string; hint: string; weight: number }> = {
  main: { label: "Principal", hint: "Tu foco: recibe la mayor parte del tiempo.", weight: 3 },
  active: { label: "En progreso", hint: "Avanza a buen ritmo, pero sin ser el foco.", weight: 2 },
  maintain: { label: "Mantener", hint: "Sólo repasos para no olvidarlo.", weight: 1 },
};

export interface LanguageStat {
  code: string;
  priority: LanguagePriority;
  /** Repasos vencidos ahora mismo. */
  due: number;
  /** Minutos estudiados en los últimos 7 días. */
  minutesWeek: number;
  /** Días desde la última actividad (null = nunca). */
  daysSince: number | null;
  /** Minutos diarios del objetivo de ese idioma (si lo hay). */
  goalMinutes?: number | null;
  /** Minutos ya estudiados hoy en ese idioma. */
  minutesToday?: number;
}

export interface Allocation {
  code: string;
  minutes: number;
  /** Qué conviene hacer: repasar lo pendiente o avanzar con material nuevo. */
  mode: "review" | "session";
  reasons: string[];
}

/** Segundos medios por repaso (incluye leer, responder y el feedback). */
const SECONDS_PER_REVIEW = 9;
const MIN_BLOCK = 5;

/** Minutos necesarios para vaciar los repasos pendientes (con tope). */
export function reviewMinutes(due: number): number {
  return Math.min(20, Math.ceil((due * SECONDS_PER_REVIEW) / 60));
}

/**
 * Reparte `total` minutos entre idiomas. Determinista. Los idiomas en
 * «mantener» sin repasos pendientes y estudiados hace poco descansan hoy
 * (alternar días funciona: el espaciado ya los protege).
 */
export function allocateTime(stats: LanguageStat[], total: number): Allocation[] {
  if (stats.length === 0 || total <= 0) return [];
  const budget = Math.max(MIN_BLOCK, Math.round(total));

  const scored = stats.map((s) => {
    const reasons: string[] = [];
    let w = PRIORITY_LABELS[s.priority].weight;
    const need = reviewMinutes(s.due);
    if (s.due > 0) {
      w += Math.min(2, s.due / 40);
      reasons.push(`${s.due} ${s.due === 1 ? "repaso pendiente" : "repasos pendientes"}`);
    }
    if (s.daysSince === null || s.daysSince >= 3) {
      w += 0.8;
      reasons.push(s.daysSince === null ? "aún no has empezado" : `hace ${s.daysSince} días que no lo tocas`);
    } else if (s.daysSince >= 2) {
      w += 0.4;
      reasons.push("ayer no lo estudiaste");
    }
    const goal = s.goalMinutes ?? null;
    const today = s.minutesToday ?? 0;
    if (goal && today >= goal) {
      w *= 0.35;
      reasons.push("ya cumpliste su objetivo de hoy");
    }
    // «Mantener» sólo entra si hay repasos o lleva días sin verse.
    const rests = s.priority === "maintain" && s.due === 0 && s.daysSince !== null && s.daysSince < 3;
    return { s, w: rests ? 0 : w, need, reasons };
  });

  let active = scored.filter((x) => x.w > 0).sort((a, b) => b.w - a.w || a.s.code.localeCompare(b.s.code));
  // Nunca más bloques de los que caben (mínimo 5 min cada uno).
  const maxBlocks = Math.max(1, Math.floor(budget / MIN_BLOCK));
  if (active.length > maxBlocks) active = active.slice(0, maxBlocks);
  if (active.length === 0) {
    // Todo en mantenimiento y al día: el principal (o el primero) se lleva el tiempo.
    const first = [...scored].sort((a, b) => PRIORITY_LABELS[b.s.priority].weight - PRIORITY_LABELS[a.s.priority].weight || a.s.code.localeCompare(b.s.code))[0]!;
    active = [{ ...first, w: 1 }];
  }

  const sumW = active.reduce((a, x) => a + x.w, 0);
  const raw = active.map((x) => ({ ...x, m: Math.max(MIN_BLOCK, (budget * x.w) / sumW) }));
  // Redondeo a bloques de 5 min que respeta el total (mayor resto primero).
  const units = Math.max(active.length, Math.round(budget / MIN_BLOCK));
  const exact = raw.map((x) => (x.m / raw.reduce((a, y) => a + y.m, 0)) * units);
  const alloc = exact.map((e) => Math.max(1, Math.floor(e)));
  let left = units - alloc.reduce((a, b) => a + b, 0);
  const order = exact.map((e, i) => ({ i, r: e - Math.floor(e) })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) alloc[order[k]!.i]! += 1;
  while (left < 0) {
    const i = alloc.indexOf(Math.max(...alloc));
    alloc[i]! -= 1;
    left++;
  }

  // El principal nunca recibe menos que otro (si hay margen para moverlo).
  const mainIdx = raw.findIndex((x) => x.s.priority === "main");
  if (mainIdx >= 0) {
    for (let guard = 0; guard < 20; guard++) {
      const rival = alloc.findIndex((u, i) => i !== mainIdx && u >= alloc[mainIdx]! && u > 1);
      if (rival < 0) break;
      alloc[rival]! -= 1;
      alloc[mainIdx]! += 1;
    }
  }

  return raw.map((x, i) => {
    const minutes = alloc[i]! * MIN_BLOCK;
    const mode: Allocation["mode"] = x.s.priority === "maintain" || (x.need > 0 && x.need >= minutes * 0.7) ? "review" : "session";
    if (x.s.priority === "main" && !x.reasons.length) x.reasons.push("es tu idioma principal");
    return { code: x.s.code, minutes, mode, reasons: x.reasons };
  });
}

// ── Interferencia entre idiomas ───────────────────────────────────────────
const FAMILY: Record<string, string> = {
  es: "romance", fr: "romance", it: "romance", pt: "romance",
  en: "germanic", de: "germanic", nl: "germanic", sv: "germanic",
  ru: "slavic", ar: "semitic", ja: "japonic", ko: "koreanic", zh: "sinitic",
};

/** Pares especialmente propensos a mezclarse (alta similitud léxica). */
const CLOSE_PAIRS = new Set(["es|it", "es|pt", "it|pt", "fr|it", "de|nl", "nl|sv", "de|sv", "fr|pt", "es|fr", "ja|zh", "ko|zh"]);
const pairKey = (a: string, b: string) => [a, b].sort().join("|");

/** 0 = sin riesgo, 1 = misma familia, 2 = muy cercanos. */
export function interference(a: string, b: string): 0 | 1 | 2 {
  if (a === b) return 0;
  if (CLOSE_PAIRS.has(pairKey(a, b))) return 2;
  return FAMILY[a] && FAMILY[a] === FAMILY[b] ? 1 : 0;
}

/**
 * Ordena los bloques para que dos idiomas cercanos no vayan seguidos cuando
 * hay una alternativa (se intercala uno lejano). Mantiene primero el de más
 * tiempo: empezar por lo importante con la mente fresca.
 */
export function orderForInterference<T extends { code: string }>(blocks: T[]): T[] {
  if (blocks.length <= 2) return [...blocks];
  const rest = [...blocks];
  const out: T[] = [rest.shift()!];
  while (rest.length) {
    const prev = out[out.length - 1]!;
    let best = 0;
    for (let i = 1; i < rest.length; i++) if (interference(prev.code, rest[i]!.code) < interference(prev.code, rest[best]!.code)) best = i;
    out.push(rest.splice(best, 1)[0]!);
  }
  return out;
}

export interface InterferenceTip {
  a: string;
  b: string;
  level: 1 | 2;
  text: string;
}

/**
 * Consejos para los pares que el alumno estudia (y su lengua materna).
 * `names` traduce códigos a nombres legibles.
 */
export function interferenceTips(codes: string[], native: string, names: (c: string) => string): InterferenceTip[] {
  const tips: InterferenceTip[] = [];
  const all = [...new Set(codes)];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i]!;
      const b = all[j]!;
      const lvl = interference(a, b);
      if (lvl === 2) tips.push({ a, b, level: 2, text: `${names(a)} y ${names(b)} se parecen mucho: estúdialos en bloques separados (con otro idioma o un descanso en medio) y fíjate en los «falsos amigos» entre ambos.` });
      else if (lvl === 1) tips.push({ a, b, level: 1, text: `${names(a)} y ${names(b)} son de la misma familia: te ayudarán mutuamente con el vocabulario, pero conviene no alternarlos seguidos.` });
    }
    const a = all[i]!;
    if (interference(a, native) === 2) {
      tips.push({ a, b: native, level: 2, text: `${names(a)} está muy cerca del ${names(native)}: vas a entender mucho enseguida, pero cuida la pronunciación y no des por hecho que las palabras parecidas significan lo mismo.` });
    }
  }
  for (const t of tips) t.text = t.text.charAt(0).toUpperCase() + t.text.slice(1);
  return tips.sort((x, y) => y.level - x.level);
}

/** ¿Estudió al menos `n` idiomas distintos el mismo día? (logro «Políglota»). */
export function polyglotDays(rows: { day: string; languageCode: string; exercises: number }[], n = 2): string[] {
  const byDay = new Map<string, Set<string>>();
  for (const r of rows) {
    if (r.exercises <= 0) continue;
    const s = byDay.get(r.day) ?? new Set<string>();
    s.add(r.languageCode);
    byDay.set(r.day, s);
  }
  return [...byDay].filter(([, s]) => s.size >= n).map(([d]) => d).sort();
}
