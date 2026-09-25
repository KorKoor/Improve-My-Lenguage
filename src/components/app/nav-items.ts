import { BarChart3, BookHeart, CaseSensitive, BookOpen, Footprints, Milestone, Globe2, Headphones, Home, Timer, Layers, MessageCircle, Mic, Newspaper, PenLine, Play, Repeat, Route, Sparkles, Type, UserRound, Users, type LucideIcon } from "lucide-react";

/** Secciones de la app (menú lateral, pantalla «Más»). Módulo sin "use client": lo usan servidor y cliente. */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number | null;
  soon?: boolean;
}

/** `alphabet`: el idioma activo usa otra escritura (ruso, árabe, coreano, japonés, chino). */
export function navItems(due: number, simple = false, alphabet = false): NavItem[] {
  const abc: NavItem[] = alphabet ? [{ href: "/app/alphabet", label: "Alfabeto", icon: CaseSensitive }] : [];
  if (simple) {
    // Modo sencillo: sólo lo esencial, con nombres cotidianos.
    return [
      { href: "/app", label: "Inicio", icon: Home },
      ...abc,
      { href: "/app/course", label: "Camino guiado", icon: Milestone },
      { href: "/app/session", label: "Practicar", icon: Play },
      { href: "/app/first-steps", label: "Primeros pasos", icon: Footprints },
      { href: "/app/stories", label: "Historias", icon: BookHeart },
      { href: "/app/review", label: "Repasar", icon: Repeat, badge: due > 0 ? due : null },
      { href: "/app/vocabulary", label: "Mis palabras", icon: BookOpen },
      { href: "/app/read", label: "Leer", icon: Newspaper },
      { href: "/app/listen", label: "Escuchar", icon: Headphones },
      { href: "/app/speak", label: "Hablar", icon: Mic },
      { href: "/app/progress", label: "Mi progreso", icon: BarChart3 },
      { href: "/app/group", label: "Mi familia", icon: Users },
    ];
  }
  return [
    { href: "/app", label: "Inicio", icon: Home },
    { href: "/app/session", label: "Sesión de hoy", icon: Play },
    { href: "/app/review", label: "Repaso", icon: Repeat, badge: due > 0 ? due : null },
    { href: "/app/study", label: "Modo estudio", icon: Timer },
    ...abc,
    { href: "/app/course", label: "Camino guiado", icon: Milestone },
    { href: "/app/first-steps", label: "Primeros pasos", icon: Footprints },
    { href: "/app/vocabulary", label: "Vocabulario", icon: BookOpen },
    { href: "/app/grammar", label: "Gramática", icon: Layers },
    { href: "/app/verbs", label: "Verbos", icon: Type },
    { href: "/app/read", label: "Lecturas", icon: Newspaper },
    { href: "/app/stories", label: "Historias", icon: BookHeart },
    { href: "/app/listen", label: "Escucha", icon: Headphones },
    { href: "/app/speak", label: "Pronunciación", icon: Mic },
    { href: "/app/write", label: "Escritura", icon: PenLine },
    { href: "/app/tutor", label: "Tutor", icon: MessageCircle },
    { href: "/app/progress", label: "Progreso", icon: BarChart3 },
    { href: "/app/languages", label: "Mis idiomas", icon: Globe2 },
    { href: "/app/path", label: "Camino a C1", icon: Route },
    { href: "/app/group", label: "Familia y amigos", icon: Users },
    { href: "/app/novedades", label: "Novedades", icon: Sparkles },
    { href: "/app/profile", label: "Mi perfil", icon: UserRound },
  ];
}

