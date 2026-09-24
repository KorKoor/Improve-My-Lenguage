/**
 * Implementación propia de FSRS-5 (Free Spaced Repetition Scheduler).
 *
 * Referencia del algoritmo (público, MIT): https://github.com/open-spaced-repetition
 * Se implementa aquí sin dependencias para poder probarlo aisladamente y
 * extenderlo con señales propias (velocidad de respuesta, confianza) que se
 * traducen a una calificación 1–4 en `ratingFromOutcome`.
 *
 * Unidades: tiempos en días (fraccionarios), fechas como Date.
 */

export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export type CardState = "new" | "learning" | "review" | "relearning";

export interface CardMemory {
  stability: number; // días hasta que R cae a 90 %
  difficulty: number; // 1..10
  reps: number;
  lapses: number;
  state: CardState;
  lastReview: Date | null;
  due: Date;
}

export const DEFAULT_WEIGHTS: readonly number[] = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575,
  0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655,
  0.6621,
];

const DECAY = -0.5;
const FACTOR = 19 / 81; // garantiza R(S, S) = 0.9
const DAY_MS = 86_400_000;

export interface FsrsOptions {
  weights?: readonly number[];
  /** Retención objetivo: probabilidad de recordar en la fecha de repaso. */
  requestRetention?: number;
  maximumIntervalDays?: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function newCard(now: Date): CardMemory {
  return {
    stability: 0,
    difficulty: 0,
    reps: 0,
    lapses: 0,
    state: "new",
    lastReview: null,
    due: now,
  };
}

/** Probabilidad de recordar tras `elapsedDays` con estabilidad `stability`. */
export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

export function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / DAY_MS;
}

/** Retrievability actual de una tarjeta (0 si nunca se ha repasado). */
export function currentRetrievability(card: CardMemory, now: Date): number {
  if (!card.lastReview || card.stability <= 0) return 0;
  return retrievability(daysBetween(card.lastReview, now), card.stability);
}

export function nextIntervalDays(
  stability: number,
  requestRetention = 0.9,
  maximumIntervalDays = 365,
): number {
  const raw = (stability / FACTOR) * (Math.pow(requestRetention, 1 / DECAY) - 1);
  return clamp(raw, 1 / 1440, maximumIntervalDays); // mínimo 1 minuto
}

export class Fsrs {
  private readonly w: readonly number[];
  private readonly retention: number;
  private readonly maxInterval: number;

  constructor(opts: FsrsOptions = {}) {
    this.w = opts.weights ?? DEFAULT_WEIGHTS;
    if (this.w.length !== 19) throw new Error("FSRS-5 requiere 19 pesos");
    this.retention = clamp(opts.requestRetention ?? 0.9, 0.7, 0.99);
    this.maxInterval = opts.maximumIntervalDays ?? 365;
  }

  private initStability(g: Rating): number {
    return Math.max(this.w[g - 1]!, 0.1);
  }

  private initDifficulty(g: Rating): number {
    return clamp(this.w[4]! - Math.exp(this.w[5]! * (g - 1)) + 1, 1, 10);
  }

  private nextDifficulty(d: number, g: Rating): number {
    const delta = -this.w[6]! * (g - 3);
    const damped = d + (delta * (10 - d)) / 9; // amortiguación lineal (FSRS-5)
    const reverted = this.w[7]! * this.initDifficulty(4) + (1 - this.w[7]!) * damped;
    return clamp(reverted, 1, 10);
  }

  private recallStability(d: number, s: number, r: number, g: Rating): number {
    const hardPenalty = g === 2 ? this.w[15]! : 1;
    const easyBonus = g === 4 ? this.w[16]! : 1;
    return (
      s *
      (1 +
        Math.exp(this.w[8]!) *
          (11 - d) *
          Math.pow(s, -this.w[9]!) *
          (Math.exp((1 - r) * this.w[10]!) - 1) *
          hardPenalty *
          easyBonus)
    );
  }

  private forgetStability(d: number, s: number, r: number): number {
    const sf =
      this.w[11]! *
      Math.pow(d, -this.w[12]!) *
      (Math.pow(s + 1, this.w[13]!) - 1) *
      Math.exp((1 - r) * this.w[14]!);
    return Math.min(sf, s);
  }

  private shortTermStability(s: number, g: Rating): number {
    return s * Math.exp(this.w[17]! * (g - 3 + this.w[18]!));
  }

  /** Aplica un repaso y devuelve el nuevo estado de memoria (inmutable). */
  review(card: CardMemory, g: Rating, now: Date): CardMemory {
    let stability: number;
    let difficulty: number;
    let lapses = card.lapses;
    let state: CardState;

    if (card.state === "new" || !card.lastReview || card.stability <= 0) {
      stability = this.initStability(g);
      difficulty = this.initDifficulty(g);
      // Un fallo en la primera exposición no cuenta como lapso.
      state = g === 1 ? "learning" : "review";
    } else {
      const elapsed = daysBetween(card.lastReview, now);
      const r = retrievability(elapsed, card.stability);
      difficulty = this.nextDifficulty(card.difficulty, g);
      if (elapsed < 1) {
        // Repaso dentro del mismo día: fórmula de corto plazo de FSRS-5.
        stability = this.shortTermStability(card.stability, g);
      } else if (g === 1) {
        stability = this.forgetStability(card.difficulty, card.stability, r);
      } else {
        stability = this.recallStability(card.difficulty, card.stability, r, g);
      }
      if (g === 1) {
        lapses += card.state === "review" ? 1 : 0;
        state = card.state === "review" ? "relearning" : card.state;
      } else {
        state = "review";
      }
    }

    stability = clamp(stability, 0.01, 36500);

    // Tarjetas falladas vuelven a salir pronto (10 min) dentro de la sesión.
    const intervalDays =
      g === 1 ? 10 / 1440 : nextIntervalDays(stability, this.retention, this.maxInterval);

    return {
      stability,
      difficulty,
      reps: card.reps + 1,
      lapses,
      state,
      lastReview: now,
      due: new Date(now.getTime() + intervalDays * DAY_MS),
    };
  }
}

export interface AnswerOutcome {
  correct: boolean;
  /** Tiempo de respuesta en ms. */
  timeMs: number;
  /** Tiempo "esperado" para este tipo de ejercicio en ms. */
  expectedMs: number;
  /** Intentos usados (1 = a la primera). */
  attempts: number;
  /** Autoevaluación opcional 0..1 (p. ej. "estaba adivinando" = 0.2). */
  confidence?: number;
  /** Respuesta casi correcta (errata tolerada). */
  nearMiss?: boolean;
}

/**
 * Traduce el resultado observable de un ejercicio a una calificación FSRS.
 * Aquí es donde el sistema incorpora velocidad, intentos y confianza.
 */
export function ratingFromOutcome(o: AnswerOutcome): Rating {
  if (!o.correct) return 1;
  const lowConfidence = o.confidence !== undefined && o.confidence < 0.5;
  if (o.attempts > 1 || o.nearMiss || lowConfidence) return 2;
  const speed = o.timeMs / Math.max(1, o.expectedMs);
  if (speed > 2) return 2; // correcto pero con mucho esfuerzo
  if (speed < 0.5 && (o.confidence === undefined || o.confidence >= 0.8)) return 4;
  return 3;
}
