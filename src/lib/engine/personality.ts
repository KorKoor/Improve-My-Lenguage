/**
 * «¿Cómo aprendes mejor?»: cuestionario breve de preferencias de aprendizaje.
 *
 * No es un test psicológico ni pretende clasificar «estilos de aprendizaje»
 * (la evidencia científica no respalda enseñar según ellos). Mide preferencias
 * que sí cambian la experiencia: ritmo, reto, estructura, profundidad de las
 * explicaciones, tono de la corrección y qué actividades te motivan. Con eso
 * ajustamos el planificador y el tutor, y siempre puedes cambiarlo.
 *
 * Puro y determinista → testeable.
 */
import type { BlockKind } from "./planner";

export type Dimension = "pace" | "challenge" | "structure" | "depth" | "feedback" | "social" | "ear" | "words";

export interface PersonalityQuestion {
  id: string;
  text: string;
  dimension: Dimension;
  /** +1 si «muy de acuerdo» empuja la dimensión hacia arriba; -1 si al revés. */
  sign: 1 | -1;
}

/** Escala Likert de 5 puntos. */
export const LIKERT = ["Nada que ver conmigo", "Poco", "A veces", "Bastante", "Totalmente yo"] as const;

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  { id: "q1", text: "Prefiero sesiones cortas y frecuentes a una larga de vez en cuando.", dimension: "pace", sign: -1 },
  { id: "q2", text: "Cuando tengo tiempo, me gusta encadenar varias actividades seguidas.", dimension: "pace", sign: 1 },
  { id: "q3", text: "Me motiva que los ejercicios sean un poco más difíciles de lo que domino.", dimension: "challenge", sign: 1 },
  { id: "q4", text: "Si fallo varias veces seguidas, pierdo las ganas.", dimension: "challenge", sign: -1 },
  { id: "q5", text: "Me gusta tener un plan claro de qué hacer cada día.", dimension: "structure", sign: 1 },
  { id: "q6", text: "Prefiero explorar libremente: una lectura, un audio, lo que me llame.", dimension: "structure", sign: -1 },
  { id: "q7", text: "Entiendo mejor cuando primero me explican la regla.", dimension: "depth", sign: 1 },
  { id: "q8", text: "Aprendo más viendo ejemplos que leyendo explicaciones.", dimension: "depth", sign: -1 },
  { id: "q9", text: "Quiero que me corrijan todo, aunque sea mucho.", dimension: "feedback", sign: 1 },
  { id: "q10", text: "Prefiero que me corrijan sólo lo importante, con tacto.", dimension: "feedback", sign: -1 },
  { id: "q11", text: "Me motivan las rachas, los logros y superar mis marcas.", dimension: "social", sign: 1 },
  { id: "q12", text: "Me gusta practicar escuchando: canciones, podcasts, voces.", dimension: "ear", sign: 1 },
  { id: "q13", text: "Me siento más cómodo leyendo que escuchando.", dimension: "ear", sign: -1 },
  { id: "q14", text: "Lo que más quiero es poder conversar, aunque cometa errores.", dimension: "words", sign: -1 },
  { id: "q15", text: "Me encanta aprender palabras nuevas y ampliar mi vocabulario.", dimension: "words", sign: 1 },
];

export type ArchetypeId = "explorer" | "strategist" | "challenger" | "steady" | "listener" | "conversational" | "wordsmith" | "analyst";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  icon: string;
  tagline: string;
  strengths: string[];
  tips: string[];
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  explorer: {
    id: "explorer",
    name: "Explorador curioso",
    icon: "🧭",
    tagline: "Aprendes siguiendo lo que te interesa: lecturas, audios y descubrimientos.",
    strengths: ["Mucha exposición real al idioma", "Motivación que dura"],
    tips: ["Guarda las palabras que tocas en Lecturas: así vuelven en tus repasos.", "Un repaso corto al día fija lo que exploras."],
  },
  strategist: {
    id: "strategist",
    name: "Estratega",
    icon: "🗺️",
    tagline: "Te va el plan claro y medir el avance paso a paso.",
    strengths: ["Constancia", "Progreso medible"],
    tips: ["Sigue el plan diario: está calculado para ti.", "Mira Progreso cada semana para ajustar el rumbo."],
  },
  challenger: {
    id: "challenger",
    name: "Retador",
    icon: "🔥",
    tagline: "Te crecen los retos: prefieres un paso más allá de tu nivel.",
    strengths: ["Avance rápido", "Te recuperas bien de los errores"],
    tips: ["Prueba lecturas «un reto» y escritura del nivel siguiente.", "No te saltes los repasos: consolidan lo que conquistas."],
  },
  steady: {
    id: "steady",
    name: "Constante tranquilo",
    icon: "🌱",
    tagline: "Poco a poco y sin agobios: la regularidad es tu superpoder.",
    strengths: ["Hábito sólido", "Menos olvido"],
    tips: ["5–10 minutos al día bastan: el sistema elige lo justo.", "Activa el audio lento si algo va muy rápido."],
  },
  listener: {
    id: "listener",
    name: "Buen oído",
    icon: "🎧",
    tagline: "Te entra por el oído: voces, ritmo y pronunciación.",
    strengths: ["Comprensión auditiva", "Pronunciación natural"],
    tips: ["Haz Escucha a 0,75× y súbela cuando aciertes.", "Escucha en voz alta los párrafos del lector."],
  },
  conversational: {
    id: "conversational",
    name: "Conversador",
    icon: "💬",
    tagline: "Quieres hablar cuanto antes: el idioma como herramienta para conectar.",
    strengths: ["Fluidez", "Pierdes el miedo a equivocarte"],
    tips: ["Charla con el tutor sobre tus intereses.", "Escribe mensajes cortos en Escritura: es conversación sin prisa."],
  },
  wordsmith: {
    id: "wordsmith",
    name: "Coleccionista de palabras",
    icon: "📚",
    tagline: "Disfrutas ampliando vocabulario y matices.",
    strengths: ["Vocabulario amplio", "Buena lectura"],
    tips: ["Lee artículos de Wikipedia de tus temas y guarda palabras.", "Usa las palabras nuevas en un texto corto para fijarlas."],
  },
  analyst: {
    id: "analyst",
    name: "Analítico",
    icon: "🔬",
    tagline: "Necesitas entender el porqué: reglas, patrones y excepciones.",
    strengths: ["Precisión gramatical", "Autocorrección"],
    tips: ["Abre la explicación de cada tema de gramática antes de practicar.", "Pide al tutor el porqué de cada corrección."],
  },
};

export interface Tuning {
  preferredDifficulty: "easy" | "balanced" | "challenging";
  explanationDepth: "brief" | "balanced" | "detailed";
  competitive: boolean;
  /** Multiplicadores por bloque del planificador (1 = neutro). */
  blockWeights: Partial<Record<BlockKind, number>>;
  /** Tono de la corrección del tutor. */
  correction: "gentle" | "thorough";
  /** Duración de sesión sugerida (minutos). */
  suggestedMinutes: number;
  /** Actividades destacadas en el inicio. */
  favorites: ("read" | "listen" | "write" | "tutor" | "speak" | "vocabulary" | "grammar")[];
}

export interface PersonalityResult {
  version: 1;
  /** Cada dimensión en [-1, 1]. */
  dims: Record<Dimension, number>;
  archetype: ArchetypeId;
  secondary: ArchetypeId | null;
  tuning: Tuning;
  takenAt: string;
}

/** Respuestas 1–5; las que falten cuentan como neutras. */
export function scorePersonality(answers: Record<string, number>, now = new Date()): PersonalityResult {
  const sum: Record<Dimension, number> = { pace: 0, challenge: 0, structure: 0, depth: 0, feedback: 0, social: 0, ear: 0, words: 0 };
  const n: Record<Dimension, number> = { ...sum };
  for (const q of PERSONALITY_QUESTIONS) {
    const raw = answers[q.id];
    const v = typeof raw === "number" && raw >= 1 && raw <= 5 ? Math.round(raw) : 3;
    sum[q.dimension] += ((v - 3) / 2) * q.sign;
    n[q.dimension] += 1;
  }
  const dims = Object.fromEntries(
    (Object.keys(sum) as Dimension[]).map((d) => [d, Math.round((sum[d] / Math.max(1, n[d])) * 100) / 100]),
  ) as Record<Dimension, number>;

  // Afinidad con cada arquetipo: combinación lineal de dimensiones.
  const affinity: Record<ArchetypeId, number> = {
    explorer: -dims.structure * 1.2 + dims.words * 0.3 + dims.pace * 0.2,
    strategist: dims.structure * 1.2 + dims.social * 0.3,
    challenger: dims.challenge * 1.2 + dims.pace * 0.4 + dims.social * 0.2,
    steady: -dims.pace * 0.9 - dims.challenge * 0.6 + dims.structure * 0.2,
    listener: dims.ear * 1.3,
    conversational: -dims.words * 1.1 - dims.depth * 0.3,
    wordsmith: dims.words * 1.1 - dims.ear * 0.3,
    analyst: dims.depth * 1.2 + dims.feedback * 0.3,
  };
  const ranked = (Object.entries(affinity) as [ArchetypeId, number][]).sort((a, b) => b[1] - a[1]);
  const archetype = ranked[0]![1] > 0.15 ? ranked[0]![0] : "steady";
  const secondary = ranked[1] && ranked[1][1] > 0.25 && ranked[1][0] !== archetype ? ranked[1][0] : null;

  return { version: 1, dims, archetype, secondary, tuning: tuningFor(dims), takenAt: now.toISOString() };
}

const clampW = (x: number) => Math.round(Math.max(0.5, Math.min(1.8, x)) * 100) / 100;

export function tuningFor(dims: Record<Dimension, number>): Tuning {
  const favorites: Tuning["favorites"] = [];
  if (dims.ear > 0.2) favorites.push("listen");
  if (dims.ear < -0.2 || dims.words > 0.3) favorites.push("read");
  if (dims.words < -0.2) favorites.push("speak", "tutor", "write");
  if (dims.depth > 0.3) favorites.push("grammar");
  if (dims.words > 0.3) favorites.push("vocabulary");
  if (favorites.length === 0) favorites.push("read", "listen");
  return {
    preferredDifficulty: dims.challenge > 0.3 ? "challenging" : dims.challenge < -0.3 ? "easy" : "balanced",
    explanationDepth: dims.depth > 0.3 ? "detailed" : dims.depth < -0.3 ? "brief" : "balanced",
    competitive: dims.social > 0.25,
    blockWeights: {
      listening: clampW(1 + dims.ear * 0.6),
      new_words: clampW(1 + dims.words * 0.5),
      grammar: clampW(1 + dims.depth * 0.5),
      tutor: clampW(1 - dims.words * 0.5),
    },
    correction: dims.feedback > 0.2 ? "thorough" : "gentle",
    suggestedMinutes: dims.pace < -0.3 ? 10 : dims.pace > 0.4 ? 25 : 15,
    favorites: [...new Set(favorites)].slice(0, 3),
  };
}

export function parsePersonality(raw: unknown): PersonalityResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<PersonalityResult>;
  if (r.version !== 1 || !r.dims || !r.archetype || !(r.archetype in ARCHETYPES)) return null;
  return { ...r, tuning: tuningFor(r.dims) } as PersonalityResult;
}

/** Frases legibles para explicar cada dimensión en el perfil. */
export const DIMENSION_LABELS: Record<Dimension, { low: string; high: string; title: string }> = {
  pace: { title: "Ritmo", low: "Sesiones cortas", high: "Sesiones largas" },
  challenge: { title: "Reto", low: "Paso seguro", high: "Me gusta el reto" },
  structure: { title: "Organización", low: "Exploro libre", high: "Sigo un plan" },
  depth: { title: "Explicaciones", low: "Ejemplos primero", high: "Regla primero" },
  feedback: { title: "Corrección", low: "Sólo lo importante", high: "Corrígeme todo" },
  social: { title: "Motivación", low: "A mi aire", high: "Rachas y logros" },
  ear: { title: "Canal favorito", low: "Leer", high: "Escuchar" },
  words: { title: "Objetivo", low: "Conversar", high: "Vocabulario" },
};
