/**
 * Recalibración del nivel en las primeras sesiones de un idioma.
 *
 * El diagnóstico da una primera estimación, pero con 8–18 preguntas puede
 * equivocarse (sobre todo con cognados o adivinando). Las primeras sesiones
 * son la mejor evidencia: si fallas la mayoría, el nivel baja; si aciertas
 * casi todo, sube. Sólo actúa al principio y con suficientes respuestas, para
 * no oscilar; después, la actualización online por ejercicio basta.
 */

export interface CalibrationInput {
  /** Nº de sesiones completadas en este idioma, incluida la actual. */
  sessionNumber: number;
  total: number;
  correct: number;
}

export interface Calibration {
  delta: number;
  reason: string;
}

export const CALIBRATION_SESSIONS = 5;

export function calibrationStep(i: CalibrationInput): Calibration | null {
  if (i.sessionNumber > CALIBRATION_SESSIONS || i.total < 8) return null;
  const acc = i.correct / i.total;
  if (acc < 0.5) {
    const delta = acc < 0.3 ? -0.8 : -0.5;
    return { delta, reason: `acertaste ${Math.round(acc * 100)} % de los ejercicios` };
  }
  if (acc >= 0.9 && i.total >= 10) return { delta: 0.3, reason: `acertaste ${Math.round(acc * 100)} % de los ejercicios` };
  return null;
}
