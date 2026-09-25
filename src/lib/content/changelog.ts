/** Novedades de la app (lo más reciente primero). La versión sirve para avisar una sola vez. */
export interface ChangelogItem {
  icon: string;
  title: string;
  text: string;
  href: string;
}

export const CHANGELOG_VERSION = "2026-09-25";

export const CHANGELOG: ChangelogItem[] = [
  { icon: "👨‍👩‍👧", title: "Familia y amigos", text: "Crea un grupo con un código, mira quién ya estudió hoy y mandaos ánimos (también como notificación).", href: "/app/group" },
  { icon: "🔤", title: "Entrenador de verbos", text: "Tablas de conjugación de cientos de verbos y práctica por tiempos según tu nivel. Los verbos también aparecen en tus sesiones.", href: "/app/verbs" },
  { icon: "🗺️", title: "Tu camino a C1", text: "Un mapa de A1 a C1 con criterios medibles: palabras, gramática y destrezas de cada nivel.", href: "/app/path" },
  { icon: "🎭", title: "Escenarios con misión", text: "Cafetería, médico, entrevista, debate… El tutor interpreta un papel y marca tus 3 objetivos. Con modo voz manos libres.", href: "/app/tutor" },
  { icon: "🎯", title: "Misiones diarias y niveles", text: "Tres misiones al día, XP y niveles. Completa las tres y ganas un protector de racha 🛡️.", href: "/app" },
  { icon: "🎙️", title: "Pronunciación", text: "Lee frases reales en voz alta y comprueba qué palabras se entienden. También dentro de las sesiones.", href: "/app/speak" },
  { icon: "🧲", title: "Palabras rebeldes", text: "Una sesión especial que vuelve a enseñarte las palabras que más se te resisten.", href: "/app/session?focus=leeches&minutes=5" },
  { icon: "📖", title: "Toca cualquier palabra", text: "En las lecturas, incluso las palabras fuera del vocabulario muestran su significado (Wiktionary).", href: "/app/read" },
  { icon: "📊", title: "Tu semana y tus datos", text: "Informe semanal justo (comparado con la semana pasada a estas alturas) y observaciones sobre tu memoria y tu ritmo.", href: "/app/progress" },
  { icon: "📚", title: "Mucho más vocabulario", text: "Coreano, sueco, chino, ruso, árabe e inglés crecen hasta 5 500–9 700 palabras, con traducciones más limpias.", href: "/app/vocabulary" },
];
