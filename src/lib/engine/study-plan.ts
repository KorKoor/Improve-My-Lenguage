/**
 * «Modo estudio»: convierte el tiempo disponible en una secuencia de bloques
 * de estudio (por idioma y actividad) con descansos intercalados según la
 * capacidad de atención del alumno. Es el plan que sigue el temporizador.
 */
import { allocateTime, interference, orderForInterference, type LanguageStat } from "./multilang";
import type { BreakActivity } from "./focus";

export type StudyActivity = "session" | "review" | "read" | "listen" | "speak" | "verbs" | "write" | "tutor";

export const ACTIVITY_META: Record<StudyActivity, { label: string; icon: string; href: string }> = {
  session: { label: "Sesión guiada", icon: "🎯", href: "/app/session" },
  review: { label: "Repaso", icon: "🔁", href: "/app/review" },
  read: { label: "Lectura", icon: "📖", href: "/app/read" },
  listen: { label: "Escucha", icon: "🎧", href: "/app/listen" },
  speak: { label: "Pronunciación", icon: "🎙️", href: "/app/speak" },
  verbs: { label: "Verbos", icon: "🔤", href: "/app/verbs" },
  write: { label: "Escritura", icon: "🖋️", href: "/app/write" },
  tutor: { label: "Conversación", icon: "💬", href: "/app/tutor" },
};

export type PlanBlock =
  | { kind: "study"; code: string; activity: StudyActivity; minutes: number }
  | { kind: "break"; minutes: number; activity: BreakActivity };

export interface StudyPlan {
  total: number;
  studyMinutes: number;
  blocks: PlanBlock[];
}

export interface PlanOptions {
  /** Minutos disponibles en total (incluye descansos). */
  total: number;
  /** Capacidad de atención (min) antes de una pausa. */
  span: number;
  /** Actividades favoritas del alumno (personalidad), por orden. */
  favorites?: string[];
  /** Idiomas con tablas de conjugación. */
  verbLanguages?: string[];
  /** Hay tutor de IA disponible. */
  ai?: boolean;
  /** Semilla (p. ej. el día) para variar la actividad secundaria. */
  seed?: number;
}

const BREAK_ROTATION: BreakActivity[] = ["eyes", "stretch", "breathe", "water", "walk"];

function secondaryActivity(code: string, o: PlanOptions, i: number): StudyActivity {
  const pool: StudyActivity[] = [];
  for (const f of o.favorites ?? []) {
    if (f === "listen") pool.push("listen");
    else if (f === "read") pool.push("read");
    else if (f === "speak") pool.push("speak");
    else if (f === "write") pool.push("write");
    else if (f === "tutor" && o.ai) pool.push("tutor");
    else if (f === "grammar" && o.verbLanguages?.includes(code)) pool.push("verbs");
  }
  for (const a of ["read", "listen", "speak"] as StudyActivity[]) if (!pool.includes(a)) pool.push(a);
  if (o.verbLanguages?.includes(code) && !pool.includes("verbs")) pool.push("verbs");
  return pool[((o.seed ?? 0) + i) % pool.length]!;
}

/**
 * Construye el plan. Un idioma con ≥15 min se divide en núcleo (sesión o
 * repaso) + actividad de práctica; los descansos se insertan cuando el
 * estudio acumulado alcanza la capacidad de atención, y siempre entre dos
 * idiomas muy cercanos.
 */
export function buildStudyPlan(stats: LanguageStat[], o: PlanOptions): StudyPlan {
  const total = Math.max(5, Math.min(180, Math.round(o.total)));
  const span = Math.max(8, Math.min(45, o.span));
  // Estimación de descansos para reservarles tiempo (se recalcula al insertarlos).
  const estBreaks = total >= 20 ? Math.max(0, Math.ceil(total / (span + 2)) - 1) : 0;
  const studyMinutes = total - Math.min(estBreaks * 2 + (total >= 60 ? 3 : 0), Math.round(total * 0.2));

  const alloc = orderForInterference(allocateTime(stats, studyMinutes));
  const study: Extract<PlanBlock, { kind: "study" }>[] = [];
  alloc.forEach((a, i) => {
    if (a.minutes >= 15) {
      const core = Math.round((a.minutes * 0.6) / 5) * 5;
      study.push({ kind: "study", code: a.code, activity: a.mode, minutes: core });
      study.push({ kind: "study", code: a.code, activity: secondaryActivity(a.code, o, i), minutes: a.minutes - core });
    } else {
      study.push({ kind: "study", code: a.code, activity: a.mode, minutes: a.minutes });
    }
  });

  const blocks: PlanBlock[] = [];
  let sinceBreak = 0;
  let breakIdx = 0;
  let studied = 0;
  let longDone = false;
  for (let i = 0; i < study.length; i++) {
    const b = study[i]!;
    const prev = study[i - 1];
    const closeSwitch = Boolean(prev && prev.code !== b.code && interference(prev.code, b.code) === 2);
    if (total >= 20 && i > 0 && (sinceBreak + b.minutes > span || closeSwitch)) {
      const long: boolean = studied >= 45 && !longDone;
      longDone ||= long;
      const m = long ? 5 : closeSwitch && sinceBreak + b.minutes <= span ? 1 : 2;
      blocks.push({ kind: "break", minutes: m, activity: long ? "walk" : BREAK_ROTATION[(breakIdx++ + (o.seed ?? 0)) % BREAK_ROTATION.length]! });
      sinceBreak = 0;
    }
    blocks.push(b);
    sinceBreak += b.minutes;
    studied += b.minutes;
  }
  // Ajuste final: el redondeo a bloques de 5 y los descansos reales cambian
  // el total; los bloques de estudio más largos absorben la diferencia.
  let diff = total - blocks.reduce((a, x) => a + x.minutes, 0);
  const studyBlocks = blocks.filter((b): b is Extract<PlanBlock, { kind: "study" }> => b.kind === "study");
  while (diff !== 0) {
    const target = diff > 0 ? studyBlocks[studyBlocks.length - 1]! : studyBlocks.reduce((m, b) => (b.minutes > m.minutes ? b : m));
    if (diff < 0 && target.minutes <= 3) break;
    const step = diff > 0 ? diff : -1;
    target.minutes += step;
    diff -= step;
  }
  return { total, studyMinutes: blocks.filter((b) => b.kind === "study").reduce((a, b) => a + b.minutes, 0), blocks };
}
