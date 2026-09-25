/**
 * Logros: pocos, ligados a hábitos que sí predicen aprendizaje
 * (constancia, volumen de práctica, uso real). Sin gamificación vacía.
 */
export interface AchievementStats {
  sessionsCompleted: number;
  wordsLearned: number;
  currentStreak: number;
  exercisesCompleted: number;
  conversations: number;
  minutesStudied: number;
  assessmentsCompleted: number;
  languagesStarted: number;
  /** Artículos leídos hasta el final (lector). */
  readingsCompleted?: number;
  /** Textos escritos y corregidos. */
  writingsCompleted?: number;
  /** Sesiones de escucha terminadas. */
  listeningSessions?: number;
  /** Escenarios de role-play completados (3/3 objetivos). */
  scenariosCompleted?: number;
  /** Sesiones de pronunciación terminadas. */
  speakingSessions?: number;
  /** Rondas del entrenador de verbos terminadas. */
  verbDrills?: number;
  /** Misiones diarias reclamadas (en total). */
  questsClaimed?: number;
  /** Pertenece a un grupo familiar o de estudio. */
  inGroup?: boolean;
  /** Hizo el cuestionario «¿Cómo aprendes mejor?». */
  personalityDone?: boolean;
  /** Días en que estudió 2 o más idiomas. */
  polyglotDays?: number;
  /** Planes del modo estudio completados. */
  studyPlans?: number;
  /** Descansos guiados completados. */
  breaksCompleted?: number;
}

export interface AchievementRule {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: (s: AchievementStats) => boolean;
}

export const ACHIEVEMENT_RULES: AchievementRule[] = [
  { id: "first-assessment", title: "Punto de partida", description: "Completaste tu primer diagnóstico.", icon: "🧭", unlocked: (s) => s.assessmentsCompleted >= 1 },
  { id: "first-session", title: "Primera sesión", description: "Completaste tu primera sesión de estudio.", icon: "🌱", unlocked: (s) => s.sessionsCompleted >= 1 },
  { id: "streak-7", title: "Una semana seguida", description: "7 días consecutivos estudiando.", icon: "🔥", unlocked: (s) => s.currentStreak >= 7 },
  { id: "streak-30", title: "Hábito formado", description: "30 días consecutivos estudiando.", icon: "🏔️", unlocked: (s) => s.currentStreak >= 30 },
  { id: "words-500", title: "500 palabras", description: "500 palabras aprendidas: ya entiendes gran parte de lo cotidiano.", icon: "📘", unlocked: (s) => s.wordsLearned >= 500 },
  { id: "words-1000", title: "Mil palabras", description: "1 000 palabras aprendidas. Nivel de conversación real.", icon: "🏛️", unlocked: (s) => s.wordsLearned >= 1000 },
  { id: "streak-100", title: "Cien días", description: "100 días seguidos. Esto ya es parte de tu vida.", icon: "💎", unlocked: (s) => s.currentStreak >= 100 },
  { id: "first-verbs", title: "Conjugador", description: "Completaste tu primera ronda de verbos.", icon: "🔤", unlocked: (s) => (s.verbDrills ?? 0) >= 1 },
  { id: "quests-10", title: "Cazador de misiones", description: "Reclamaste 10 misiones diarias.", icon: "🎯", unlocked: (s) => (s.questsClaimed ?? 0) >= 10 },
  { id: "family", title: "En familia", description: "Te uniste a un grupo para aprender acompañado.", icon: "👨‍👩‍👧", unlocked: (s) => Boolean(s.inGroup) },
  { id: "words-100", title: "100 palabras", description: "100 palabras aprendidas (con repasos exitosos).", icon: "📚", unlocked: (s) => s.wordsLearned >= 100 },
  { id: "exercises-100", title: "100 ejercicios", description: "Completaste 100 ejercicios.", icon: "✍️", unlocked: (s) => s.exercisesCompleted >= 100 },
  { id: "first-conversation", title: "Primera conversación", description: "Hablaste con tu tutor por primera vez.", icon: "💬", unlocked: (s) => s.conversations >= 1 },
  { id: "hours-30", title: "30 horas", description: "30 horas de estudio acumuladas.", icon: "⏳", unlocked: (s) => s.minutesStudied >= 1800 },
  { id: "first-article", title: "Primer artículo", description: "Leíste tu primer texto real en el idioma.", icon: "📰", unlocked: (s) => (s.readingsCompleted ?? 0) >= 1 },
  { id: "reader-10", title: "Lector constante", description: "10 textos reales leídos.", icon: "📖", unlocked: (s) => (s.readingsCompleted ?? 0) >= 10 },
  { id: "first-writing", title: "Primera redacción", description: "Escribiste y corregiste tu primer texto.", icon: "🖋️", unlocked: (s) => (s.writingsCompleted ?? 0) >= 1 },
  { id: "first-listening", title: "Buen oído", description: "Completaste tu primera sesión de escucha.", icon: "🎧", unlocked: (s) => (s.listeningSessions ?? 0) >= 1 },
  { id: "first-speaking", title: "Primera voz", description: "Leíste frases en voz alta y te entendimos.", icon: "🎙️", unlocked: (s) => (s.speakingSessions ?? 0) >= 1 },
  { id: "first-scenario", title: "Primera misión", description: "Cumpliste los 3 objetivos de un escenario con el tutor.", icon: "🎭", unlocked: (s) => (s.scenariosCompleted ?? 0) >= 1 },
  { id: "self-aware", title: "Te conoces", description: "Descubriste cómo aprendes mejor.", icon: "🪞", unlocked: (s) => Boolean(s.personalityDone) },
  { id: "polyglot", title: "Políglota en progreso", description: "Empezaste a estudiar un segundo idioma.", icon: "🌍", unlocked: (s) => s.languagesStarted >= 2 },
  { id: "polyglot-day", title: "Día políglota", description: "Estudiaste dos idiomas el mismo día.", icon: "🗺️", unlocked: (s) => (s.polyglotDays ?? 0) >= 1 },
  { id: "polyglot-10", title: "Mente multilingüe", description: "10 días estudiando varios idiomas.", icon: "🧠", unlocked: (s) => (s.polyglotDays ?? 0) >= 10 },
  { id: "first-plan", title: "Plan cumplido", description: "Completaste tu primer plan del modo estudio.", icon: "🏁", unlocked: (s) => (s.studyPlans ?? 0) >= 1 },
  { id: "mindful-breaks", title: "Pausas sabias", description: "Completaste 5 descansos guiados.", icon: "🌿", unlocked: (s) => (s.breaksCompleted ?? 0) >= 5 },
];

export function newlyUnlocked(stats: AchievementStats, already: Set<string>): AchievementRule[] {
  return ACHIEVEMENT_RULES.filter((r) => !already.has(r.id) && r.unlocked(stats));
}
