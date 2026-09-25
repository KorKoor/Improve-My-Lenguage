/**
 * «Seguir aprendiendo»: decide el siguiente paso con un solo botón (modo
 * sencillo). Orden: repasos acumulados → letras o reglas débiles → Fase 0
 * (aprender a leer: letras, reglas, primeras palabras y frases) → lección del
 * Camino guiado (hasta 2 al día) → práctica diaria hasta cumplir los minutos →
 * historia → listo.
 * Puro y determinista.
 */
export interface NextStepInput {
  dueCount: number;
  /** Lecciones aprobadas del Camino guiado y total. */
  courseDone: number;
  courseTotal: number;
  nextLesson: number;
  /** Lecciones hechas hoy. */
  lessonsToday: number;
  minutesToday: number;
  dailyMinutes: number;
  /** Historia sugerida (si hay para el idioma). */
  storyId: string | null;
  storiesToday: number;
  /** Fase 0: siguiente unidad (null si está terminada o saltada) y progreso. */
  phase?: { next: { id: string; title: string; kind: string } | null; done: number; total: number; diagnosed: boolean };
  /** Letras y reglas de lectura vencidas en la memoria. */
  weakLetters?: number;
}

export interface NextStep {
  kind: "review" | "letters" | "phase" | "lesson" | "session" | "story" | "done";
  href: string;
  title: string;
  subtitle: string;
}

export const MAX_LESSONS_PER_DAY = 2;

/** Letras débiles a partir de las cuales se repasan antes de seguir. */
export const WEAK_LETTERS = 3;

/** Paso de la Fase 0 (null si ya está terminada). La primera vez, a su portada con la prueba de 1 minuto. */
export function phaseStep(phase: NextStepInput["phase"]): NextStep | null {
  if (!phase?.next) return null;
  if (phase.done === 0 && !phase.diagnosed) {
    return { kind: "phase", href: "/app/start", title: "Aprende a leer desde cero", subtitle: "Primero las letras y los sonidos. ¿Ya sabes algo? Haz la prueba de un minuto." };
  }
  const href = phase.next.kind === "strokes" ? "/app/start/strokes" : `/app/session?phase=${encodeURIComponent(phase.next.id)}`;
  return { kind: "phase", href, title: phase.next.title, subtitle: `Aprender a leer · paso ${phase.done + 1} de ${phase.total}.` };
}

export function nextStep(i: NextStepInput): NextStep {
  if (i.dueCount >= 10) {
    return { kind: "review", href: "/app/review", title: "Repasar lo aprendido", subtitle: `${i.dueCount} palabras están a punto de olvidarse: primero las repasamos.` };
  }
  if ((i.weakLetters ?? 0) >= WEAK_LETTERS) {
    return { kind: "letters", href: "/app/session?focus=letters", title: "Repasar letras", subtitle: `${i.weakLetters} letras o reglas se te están olvidando: un repaso rápido y seguimos.` };
  }
  const phase = phaseStep(i.phase);
  if (phase) return phase;
  if (i.courseDone < i.courseTotal && i.lessonsToday < MAX_LESSONS_PER_DAY) {
    return { kind: "lesson", href: `/app/session?lesson=${i.nextLesson}`, title: `Lección ${i.nextLesson}`, subtitle: i.courseDone === 0 ? "Empezamos desde cero, con calma." : `Vas por la lección ${i.nextLesson} de ${i.courseTotal}.` };
  }
  if (i.minutesToday < i.dailyMinutes) {
    const left = Math.max(5, Math.round((i.dailyMinutes - i.minutesToday) / 5) * 5);
    if (i.storyId && i.storiesToday === 0 && i.lessonsToday > 0) {
      return { kind: "story", href: `/app/stories/${i.storyId}`, title: "Una historia corta", subtitle: "Para leer y escuchar lo que ya sabes." };
    }
    return { kind: "session", href: `/app/session?minutes=${Math.min(20, left)}`, title: "Practicar un poco más", subtitle: `Unos ${Math.min(20, left)} minutos de ejercicios cortos.` };
  }
  return { kind: "done", href: i.dueCount > 0 ? "/app/review" : "/app/session?minutes=5", title: "¡Ya cumpliste por hoy!", subtitle: "Si te apetece, 5 minutos más nunca sobran." };
}
