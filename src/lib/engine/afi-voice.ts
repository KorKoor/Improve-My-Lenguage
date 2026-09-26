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

/*
 * Afi cuando lo tocas: su personalidad fuera del motor adaptativo. Afi es una
 * nube que escucha cómo habla el mundo; cada idioma le llueve un poco en los
 * audífonos y sus estrellas se encienden cuando alguien aprende algo.
 * Colecciona palabras que suenan bonito y tiene cosquillas en los audífonos.
 * Todo lo que cuenta de los idiomas es verdad.
 */
export interface AfiReaction extends AfiLine {
  motion: "hop" | "wiggle" | "sway";
}

const POKE_LINES: AfiLine[] = [
  { text: "Colecciono palabras que suenan bonito. Hoy me gusta «mariposa»… y en alemán, «Schmetterling».", mood: "excited" },
  { text: "Mis estrellas brillan un poco más cada vez que aprendes algo.", mood: "proud" },
  { text: "En japonés, nube se dice 雲 (kumo). Suena suave, ¿verdad?", mood: "happy" },
  { text: "En francés soy un «nuage». Me gusta cómo suena.", mood: "happy" },
  { text: "La lluvia fuerte en japonés hace «zā zā» (ザーザー). Me la sé de memoria.", mood: "listening" },
  { text: "Cuidado con los audífonos: ahí guardo todos los sonidos.", mood: "curious" },
  { text: "Soy una nube, así que cuando llueven palabras no me mojo.", mood: "happy" },
];

/**
 * Qué hace Afi al tocarlo: `taps` son los toques seguidos (sin pausa),
 * `seed` elige la frase y `hour` es la hora local (0–23).
 */
export function afiPoke(taps: number, seed: number, hour: number): AfiReaction {
  if (taps >= 6) return { text: "Uy… me estoy mareando. ¿Y si practicamos un poco?", mood: "confused", motion: "sway" };
  if (taps >= 3) return { text: "Jiji, cosquillas no: se me mueven los audífonos.", mood: "excited", motion: "wiggle" };
  if (taps === 1 && seed % 3 === 0) {
    if (hour >= 22 || hour < 6) return { text: "Es tarde… pero un repaso cortito siempre cabe.", mood: "sleepy", motion: "hop" };
    if (hour < 12) return { text: "Buenos días. Ya tengo los audífonos puestos.", mood: "waving", motion: "hop" };
  }
  return { ...POKE_LINES[seed % POKE_LINES.length]!, motion: "hop" };
}

/** Al despertarlo después de quedarse dormido. */
export const AFI_WAKE: AfiReaction = { text: "¡Ah! Estaba soñando con verbos irregulares.", mood: "surprised", motion: "hop" };

/** Segundos sin actividad antes de que Afi se duerma (de noche, antes). */
export function afiSleepAfter(hour: number): number {
  return hour >= 22 || hour < 6 ? 25 : 60;
}

/**
 * Hacia dónde mira Afi (en unidades del dibujo) según dónde está el puntero,
 * relativo a su centro. Los ojos se mueven como mucho ±2,6 × ±2 y se
 * acercan al tope con suavidad (no hay saltos cerca del centro).
 */
export function afiGaze(dx: number, dy: number, size: number): { x: number; y: number } {
  const reach = Math.max(size, 80) * 3;
  const ease = (v: number) => Math.tanh(v / reach) * 1.35;
  const x = Math.max(-2.6, Math.min(2.6, ease(dx) * 2.6));
  const y = Math.max(-2, Math.min(2, ease(dy) * 2));
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}
