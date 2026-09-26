/**
 * La voz de Afi: convierte datos del motor adaptativo en una frase corta y
 * tranquila (docs/BRAND.md → «Personalidad»). Nunca inventa: cada frase sale
 * de un dato que el alumno también puede ver. Sin exclamaciones infantiles,
 * sin culpa, sin superlativos.
 */
import type { AfiMood } from "@/components/afi/afi";

export interface AfiLine {
  text: string;
  mood: AfiMood;
}

export interface DashboardSignals {
  studiedToday: boolean;
  streak: number;
  bestStreak: number;
  dueCount: number;
  /** Errores recurrentes (categoría y veces en los últimos días). */
  weaknesses: { label: string; count: number }[];
}

/** Frase de Afi en el inicio, de lo más útil a lo más general. */
export function afiDashboardLine(d: DashboardSignals): AfiLine {
  const w = d.weaknesses[0];
  if (!d.studiedToday && w && w.count >= 3) return { text: `He notado que «${w.label.toLowerCase()}» aparece varias veces en tus errores. Hoy lo reforzamos un poco.`, mood: "thinking" };
  if (!d.studiedToday && d.dueCount >= 20) return { text: `Tienes ${d.dueCount} repasos en su punto justo: son los que más rinden hoy.`, mood: "studying" };
  if (d.studiedToday) return { text: "Ya practicaste hoy. Lo que hagas ahora es un extra.", mood: "proud" };
  if (d.streak === 0 && d.bestStreak > 0) return { text: "Qué bien verte de nuevo. Empezamos suave.", mood: "waving" };
  if (d.streak >= 3) return { text: `Llevas ${d.streak} días seguidos. Tu memoria lo nota.`, mood: "happy" };
  return { text: "¿Empezamos? Bastan unos minutos.", mood: "waving" };
}

/** Reacción a una respuesta: acompaña, nunca castiga. */
export function afiAnswerLine(correct: boolean, streakInSession: number, seed: number): AfiLine {
  if (correct) {
    if (streakInSession >= 5) return { text: "Esto ya está empezando a consolidarse.", mood: "proud" };
    const ok = ["Bien hecho.", "Eso es.", "Correcto."];
    return { text: ok[seed % ok.length]!, mood: "happy" };
  }
  const miss = [
    "No pasa nada. Este ejercicio nos ayuda a saber qué necesitas practicar.",
    "Lo apunto: volverá en el momento justo para fijarlo.",
    "Es de los que cuestan. Lo repasaremos pronto.",
  ];
  return { text: miss[seed % miss.length]!, mood: "supportive" };
}

/** Cierre de una sesión según la precisión. */
export function afiSessionLine(accuracy: number | null): AfiLine {
  if (accuracy === null) return { text: "Sesión completada. Tu perfil ya tiene los datos de hoy.", mood: "happy" };
  if (accuracy >= 90) return { text: "Muy buena sesión. Subiremos un poco el reto la próxima vez.", mood: "celebrating" };
  if (accuracy >= 70) return { text: "Bien hecho. Lo que falló hoy vuelve mañana, en su momento.", mood: "happy" };
  return { text: "Hoy costó un poco, y eso también sirve: ya sé qué reforzar contigo.", mood: "encouraging" };
}
