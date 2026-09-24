/**
 * Detección de debilidades recurrentes a partir del historial de errores.
 *
 * score = Σ decaimiento(edad) · (1 + tasaDeError)
 * con vida media de 7 días: un error de hoy pesa 1, uno de hace una semana 0.5.
 * Se considera "recurrente" cuando aparece en ≥ 2 sesiones distintas y
 * suma ≥ 3 errores en la ventana.
 */

export interface MistakeRecord {
  category: string;
  createdAt: Date;
  sessionId: string | null;
}

export interface CategoryAttempts {
  category: string;
  total: number;
  correct: number;
}

export interface Weakness {
  category: string;
  count: number;
  sessionsWithError: number;
  recentSessions: number;
  errorRate: number | null;
  score: number;
  recurring: boolean;
}

const HALF_LIFE_DAYS = 7;
const DAY = 86_400_000;

export function detectWeaknesses(
  mistakes: MistakeRecord[],
  attempts: CategoryAttempts[],
  recentSessionIds: string[],
  now: Date,
  windowDays = 28,
): Weakness[] {
  const since = now.getTime() - windowDays * DAY;
  const byCat = new Map<string, MistakeRecord[]>();
  for (const m of mistakes) {
    if (m.createdAt.getTime() < since) continue;
    const list = byCat.get(m.category) ?? [];
    list.push(m);
    byCat.set(m.category, list);
  }
  const attemptMap = new Map(attempts.map((a) => [a.category, a]));
  const recent = new Set(recentSessionIds);

  const out: Weakness[] = [];
  for (const [category, list] of byCat) {
    const decayed = list.reduce((acc, m) => {
      const age = (now.getTime() - m.createdAt.getTime()) / DAY;
      return acc + Math.pow(0.5, age / HALF_LIFE_DAYS);
    }, 0);
    const a = attemptMap.get(category);
    const errorRate = a && a.total > 0 ? 1 - a.correct / a.total : null;
    const sessions = new Set(
      list.map((m) => m.sessionId).filter((s): s is string => !!s && recent.has(s)),
    );
    const score = decayed * (1 + (errorRate ?? 0.5));
    out.push({
      category,
      count: list.length,
      sessionsWithError: sessions.size,
      recentSessions: recent.size,
      errorRate,
      score,
      recurring: list.length >= 3 && (sessions.size >= 2 || recent.size === 0),
    });
  }
  return out.sort((a, b) => b.score - a.score || a.category.localeCompare(b.category));
}

/** Frase explicativa (explicabilidad de recomendaciones). */
export function explainWeakness(w: Weakness, label: string): string {
  if (w.recentSessions > 0 && w.sessionsWithError > 0) {
    return `Has cometido errores de ${label} en ${w.sessionsWithError} de tus últimas ${w.recentSessions} sesiones.`;
  }
  return `Has cometido ${w.count} ${w.count === 1 ? "error" : "errores"} de ${label} recientemente.`;
}
