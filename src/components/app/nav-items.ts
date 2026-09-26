import { BarChart3, BookA, Gamepad2, SpellCheck, BookHeart, CaseSensitive, BookOpen, Footprints, Milestone, Globe2, Headphones, Home, Timer, Layers, MessageCircle, Mic, Newspaper, PenLine, Play, Repeat, Route, Sparkles, Type, UserRound, Users, type LucideIcon } from "lucide-react";

/** Secciones de la app (menú lateral, pantalla «Más»). Módulo sin "use client": lo usan servidor y cliente. */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number | null;
  soon?: boolean;
  /** Etiqueta corta para destacar algo nuevo. */
  fresh?: boolean;
  /** Una línea que explica para qué sirve (pantalla «Más»). */
  hint?: string;
}

/** Un grupo del menú (Hoy, Aprender, Practicar, Jugar, Tú). */
export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** `alphabet`: el idioma activo usa otra escritura (ruso, árabe, coreano, japonés, chino). */
export function navGroups(due: number, simple = false, alphabet = false): NavGroup[] {
  const badge = due > 0 ? due : null;
  // Aprender a leer (Fase 0) en todos los idiomas; la tabla del alfabeto, en los de otra escritura.
  const abc: NavItem[] = [
    { href: "/app/start", label: "Aprender a leer", icon: BookA, hint: "Letras, sonidos y reglas de lectura desde cero." },
    ...(alphabet ? [{ href: "/app/alphabet", label: "Alfabeto", icon: CaseSensitive, hint: "Todas las letras con su sonido." }] : []),
    { href: "/app/writing-system", label: "Ortografía", icon: SpellCheck, hint: "Cómo se escribe: acentos, mayúsculas y signos." },
  ];
  const games: NavItem = { href: "/app/games", label: "Minijuegos", icon: Gamepad2, fresh: true, hint: "Lluvia de palabras, memorama y más: 1–3 minutos." };
  if (simple) {
    // Modo sencillo: sólo lo esencial, con nombres cotidianos.
    return [
      { id: "today", label: "Hoy", items: [
        { href: "/app", label: "Inicio", icon: Home, hint: "Lo que toca hoy." },
        { href: "/app/session", label: "Practicar", icon: Play, hint: "Unos minutos de práctica hecha para ti." },
        { href: "/app/review", label: "Repasar", icon: Repeat, badge, hint: "Las palabras que estás a punto de olvidar." },
      ] },
      { id: "learn", label: "Aprender", items: [
        ...abc,
        { href: "/app/course", label: "Camino guiado", icon: Milestone, hint: "Lección a lección, en orden." },
        { href: "/app/first-steps", label: "Primeros pasos", icon: Footprints, hint: "Saludar, presentarte, pedir algo." },
      ] },
      { id: "practice", label: "Practicar", items: [
        { href: "/app/stories", label: "Historias", icon: BookHeart, hint: "Cuentos cortos a tu nivel." },
        { href: "/app/vocabulary", label: "Mis palabras", icon: BookOpen, hint: "Todas las palabras que estás aprendiendo." },
        { href: "/app/read", label: "Leer", icon: Newspaper, hint: "Textos reales; toca una palabra y la entiendes." },
        { href: "/app/listen", label: "Escuchar", icon: Headphones, hint: "Frases reales a la velocidad que elijas." },
        { href: "/app/speak", label: "Hablar", icon: Mic, hint: "Lee en voz alta y mira qué se entiende." },
      ] },
      { id: "play", label: "Jugar", items: [games] },
      { id: "you", label: "Tú", items: [
        { href: "/app/progress", label: "Mi progreso", icon: BarChart3, hint: "Cuánto has avanzado." },
        { href: "/app/group", label: "Mi familia", icon: Users, hint: "Aprende junto a los tuyos." },
      ] },
    ];
  }
  return [
    { id: "today", label: "Hoy", items: [
      { href: "/app", label: "Inicio", icon: Home, hint: "Tu plan de hoy y lo que Afi ha notado." },
      { href: "/app/session", label: "Sesión de hoy", icon: Play, hint: "La mezcla que más te conviene ahora mismo." },
      { href: "/app/review", label: "Repaso", icon: Repeat, badge, hint: "Las palabras en su punto justo para repasar." },
      { href: "/app/study", label: "Modo estudio", icon: Timer, hint: "Bloques con descansos para varios idiomas." },
    ] },
    { id: "learn", label: "Aprender", items: [
      ...abc,
      { href: "/app/course", label: "Camino guiado", icon: Milestone, hint: "Lección a lección, en orden." },
      { href: "/app/first-steps", label: "Primeros pasos", icon: Footprints, hint: "Frases para sobrevivir desde el primer día." },
      { href: "/app/grammar", label: "Gramática", icon: Layers, hint: "Lecciones claras de A1 a C1." },
      { href: "/app/verbs", label: "Verbos", icon: Type, hint: "Conjugación de los verbos más usados." },
      { href: "/app/path", label: "Camino a C1", icon: Route, hint: "Qué te falta para cada nivel." },
    ] },
    { id: "practice", label: "Practicar", items: [
      { href: "/app/vocabulary", label: "Vocabulario", icon: BookOpen, hint: "Miles de palabras por utilidad." },
      { href: "/app/read", label: "Lecturas", icon: Newspaper, hint: "Artículos reales a tu nivel." },
      { href: "/app/stories", label: "Historias", icon: BookHeart, hint: "Cuentos cortos con audio." },
      { href: "/app/listen", label: "Escucha", icon: Headphones, hint: "Dictados y frases reales." },
      { href: "/app/speak", label: "Pronunciación", icon: Mic, hint: "Lee en voz alta y compara tu entonación." },
      { href: "/app/write", label: "Escritura", icon: PenLine, hint: "Escribe y recibe correcciones." },
      { href: "/app/tutor", label: "Tutor", icon: MessageCircle, hint: "Conversa sobre lo que te interesa." },
    ] },
    { id: "play", label: "Jugar", items: [games] },
    { id: "you", label: "Tú", items: [
      { href: "/app/progress", label: "Progreso", icon: BarChart3, hint: "Tu nivel por habilidad y tu constancia." },
      { href: "/app/languages", label: "Mis idiomas", icon: Globe2, hint: "Añade o cambia de idioma." },
      { href: "/app/group", label: "Familia y amigos", icon: Users, hint: "Grupo para animaros entre todos." },
      { href: "/app/profile", label: "Mi perfil", icon: UserRound, hint: "Tu nombre, tu foto y tu forma de aprender." },
      { href: "/app/novedades", label: "Novedades", icon: Sparkles, hint: "Lo último que hemos añadido." },
    ] },
  ];
}

/** Todas las secciones en una lista (buscador, compatibilidad). */
export function navItems(due: number, simple = false, alphabet = false): NavItem[] {
  return navGroups(due, simple, alphabet).flatMap((g) => g.items);
}
