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
  listening: "/app/session?focus=listening",
  speaking: "/app/tutor",
};

const SKILL_ES: Partial<Record<Skill, string>> = {
  vocabulary: "vocabulario",
  grammar: "gramática",
  listening: "comprensión auditiva",
  speaking: "conversación",
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
