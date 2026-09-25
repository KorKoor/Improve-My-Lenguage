/**
 * «Seguir aprendiendo»: decide el siguiente paso con un solo botón (modo
 * sencillo). Orden: repasos acumulados → alfabeto (idiomas de otra escritura,
 * un grupo de letras por delante de las lecciones) → lección del Camino guiado
 * (hasta 2 al día) → práctica diaria hasta cumplir los minutos → historia → listo.
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
  /** Grupos de letras practicados y total (sólo idiomas que no usan letras latinas). */
  alphabet?: { done: number; total: number };
}

export interface NextStep {
  kind: "review" | "alphabet" | "lesson" | "session" | "story" | "done";
  href: string;
  title: string;
  subtitle: string;
}

export const MAX_LESSONS_PER_DAY = 2;

/**
 * ¿Toca un grupo de letras antes de la siguiente lección? El alfabeto va
 * siempre dos grupos por delante del Camino guiado: sin saber leer las letras,
 * las lecciones no se entienden.
 */
export function alphabetDue(alphabet: { done: number; total: number } | undefined, courseDone: number): boolean {
  return Boolean(alphabet && alphabet.done < Math.min(alphabet.total, courseDone + 2));
}

export function nextStep(i: NextStepInput): NextStep {
  if (i.dueCount >= 10) {
    return { kind: "review", href: "/app/review", title: "Repasar lo aprendido", subtitle: `${i.dueCount} palabras están a punto de olvidarse: primero las repasamos.` };
  }
  if (alphabetDue(i.alphabet, i.courseDone)) {
    return { kind: "alphabet", href: "/app/alphabet", title: i.alphabet!.done === 0 ? "Aprende a leer las letras" : "Más letras", subtitle: i.alphabet!.done === 0 ? "Antes de la primera lección: cómo se escriben y cómo suenan." : `Grupo ${i.alphabet!.done + 1} de ${i.alphabet!.total} del alfabeto.` };
  }
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
