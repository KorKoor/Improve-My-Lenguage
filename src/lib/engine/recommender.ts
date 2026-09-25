/**
 * "¿Qué debería estudiar?" — recomendación única, determinista y explicada.
 */
import type { Skill } from "../content/types";
import type { SkillEstimate } from "./levels";
import type { Weakness } from "./weakness";

export type RecommendationKind =
  | "assessment"
  | "review"
  | "grammar"
  | "skill"
  | "new_words"
  | "session";

export interface Recommendation {
  kind: RecommendationKind;
  title: string;
  reason: string;
  href: string;
}

export interface RecommenderInput {
  assessed: boolean;
  dueReviews: number;
  weaknesses: Weakness[];
  weaknessLabel: (category: string) => string;
  grammarForCategory: (category: string) => string | null;
  skills: SkillEstimate[];
  topInterest: string | null;
  studiedToday: boolean;
}

const SKILL_HREF: Partial<Record<Skill, string>> = {
  vocabulary: "/app/session?focus=new_words",
  grammar: "/app/grammar",
  listening: "/app/listen",
  speaking: "/app/tutor",
  reading: "/app/read",
  writing: "/app/write",
};

const SKILL_ES: Partial<Record<Skill, string>> = {
  vocabulary: "vocabulario",
  grammar: "gramática",
  listening: "comprensión auditiva",
  speaking: "conversación",
  reading: "lectura",
  writing: "escritura",
};

export function recommend(input: RecommenderInput): Recommendation {
  if (!input.assessed) {
    return {
      kind: "assessment",
      title: "Haz tu diagnóstico",
      reason: "Todavía no conocemos tu nivel real. Son unos 5 minutos y todo lo demás se adapta a partir de ahí.",
      href: "/app/assessment",
    };
  }

  if (input.dueReviews >= 15) {
    return {
      kind: "review",
      title: `Repasa ${input.dueReviews} elementos`,
      reason: `Tienes ${input.dueReviews} palabras en su punto óptimo de repaso. Si esperas más, empezarás a olvidarlas.`,
      href: "/app/review",
    };
  }

  const w = input.weaknesses.find((x) => x.recurring);
  if (w) {
    const label = input.weaknessLabel(w.category);
    const grammar = input.grammarForCategory(w.category);
    return {
      kind: "grammar",
      title: `Trabaja ${label}`,
      reason:
        w.sessionsWithError > 0 && w.recentSessions > 0
          ? `Te recomendamos practicar ${label} porque has cometido errores relacionados en ${w.sessionsWithError} de tus últimas ${w.recentSessions} sesiones.`
          : `Te recomendamos practicar ${label}: has acumulado ${w.count} errores relacionados recientemente.`,
      href: grammar ? `/app/grammar/${encodeURIComponent(grammar)}` : "/app/session",
    };
  }

  const measured = input.skills.filter((s) => s.evidence >= 5 && SKILL_HREF[s.skill]);
  if (measured.length >= 2) {
    const sorted = [...measured].sort((a, b) => a.theta - b.theta);
    const weakest = sorted[0]!;
    const strongest = sorted[sorted.length - 1]!;
    if (strongest.theta - weakest.theta >= 0.8) {
      return {
        kind: "skill",
        title: `Refuerza ${SKILL_ES[weakest.skill]}`,
        reason: `Tu ${SKILL_ES[weakest.skill]} va notablemente por detrás de tu ${SKILL_ES[strongest.skill]}. Equilibrarlas acelera tu progreso general.`,
        href: SKILL_HREF[weakest.skill]!,
      };
    }
  }

  if (input.dueReviews > 0) {
    return {
      kind: "review",
      title: "Repaso rápido",
      reason: `Tienes ${input.dueReviews} ${input.dueReviews === 1 ? "elemento" : "elementos"} para repasar hoy. Es la forma más barata de no olvidar.`,
      href: "/app/review",
    };
  }

  if (!input.studiedToday) {
    return {
      kind: "session",
      title: "Empieza tu sesión de hoy",
      reason: "No tienes repasos pendientes ni debilidades urgentes: es un buen momento para avanzar con material nuevo.",
      href: "/app/session",
    };
  }

  return {
    kind: "new_words",
    title: input.topInterest ? `Vocabulario de ${input.topInterest}` : "Vocabulario nuevo",
    reason: "Ya estudiaste hoy y estás al día. Si quieres seguir, aprende palabras de un tema que te interesa.",
    href: "/app/session?focus=new_words",
  };
}

// ── Prácticas sugeridas (lectura, escucha, escritura, tutor) ─────────────────
export type PracticeKind = "read" | "listen" | "write" | "tutor";

export interface PracticePick {
  kind: PracticeKind;
  title: string;
  reason: string;
  href: string;
}

const PRACTICE: Record<PracticeKind, { skill: Skill; title: string; href: string; fav: string }> = {
  read: { skill: "reading", title: "Lee un artículo real", href: "/app/read", fav: "Te gusta aprender leyendo." },
  listen: { skill: "listening", title: "Entrena el oído", href: "/app/listen", fav: "Aprendes muy bien escuchando." },
  write: { skill: "writing", title: "Escribe un texto corto", href: "/app/write", fav: "Quieres comunicarte: escribir fija lo que sabes." },
  tutor: { skill: "speaking", title: "Conversa con tu tutor", href: "/app/tutor", fav: "Tu objetivo es conversar." },
};

/**
 * Ordena las prácticas por utilidad para esta persona: su habilidad más
 * floja pesa más, luego lo que prefiere (cuestionario) y lo que aún no probó.
 * Determinista y explicada: cada tarjeta dice por qué aparece.
 */
export function practicePicks(input: {
  skills: SkillEstimate[];
  favorites: string[];
  aiAvailable: boolean;
  limit?: number;
}): PracticePick[] {
  const measured = input.skills.filter((s) => s.evidence > 0);
  const mean = measured.length ? measured.reduce((a, s) => a + s.theta, 0) / measured.length : 0;
  const scored = (Object.keys(PRACTICE) as PracticeKind[])
    .filter((k) => k !== "tutor" || input.aiAvailable)
    .map((kind) => {
      const p = PRACTICE[kind];
      const est = input.skills.find((s) => s.skill === p.skill);
      let score = 1;
      let reason = "Practicar varias habilidades acelera el progreso general.";
      if (!est || est.evidence === 0) {
        score += 0.6;
        reason = `Aún no has practicado ${SKILL_ES[p.skill]}: mediremos tu nivel mientras practicas.`;
      } else if (measured.length >= 3 && est.theta < mean - 0.4) {
        score += 1 + (mean - est.theta) * 0.5;
        reason = `Tu ${SKILL_ES[p.skill]} va por detrás del resto: es donde más puedes crecer.`;
      }
      if (input.favorites.includes(kind)) {
        score += 0.8;
        if (!reason.startsWith("Tu ")) reason = p.fav;
      }
      return { kind, title: p.title, reason, href: p.href, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, input.limit ?? 3).map(({ score: _score, ...pick }) => pick);
}
