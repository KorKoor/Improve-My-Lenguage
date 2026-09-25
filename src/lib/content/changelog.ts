/** Novedades de la app (lo más reciente primero). La versión sirve para avisar una sola vez. */
export interface ChangelogItem {
  icon: string;
  title: string;
  text: string;
  href: string;
}

export const CHANGELOG_VERSION = "2026-09-26b";

export const CHANGELOG: ChangelogItem[] = [
  { icon: "📚", title: "Historias para empezar", text: "Historias cortas A1–A2 en francés, inglés, italiano, portugués y alemán: frase a frase, audio lento, traducción al tocar y preguntas al final.", href: "/app/stories" },
  { icon: "🚩", title: "Reporta errores", text: "¿Una traducción rara o un audio que no suena bien? Pulsa «Reportar un error» en la tarjeta: lo revisamos y lo corregimos para todos.", href: "/app/session" },
  { icon: "👂", title: "Pares mínimos y tu voz", text: "Entrena el oído con palabras casi iguales (tu/tout, ship/sheep, 买/卖…) y graba tu voz para compararla con el modelo. En Pronunciación.", href: "/app/speak" },
  { icon: "🔊", title: "Mejor audio", text: "Usamos la voz más natural de tu dispositivo y grabaciones humanas cuando existen. Si tu equipo no tiene voz para el idioma, te explicamos cómo instalarla.", href: "/app/listen" },
  { icon: "🎯", title: "Tu nivel se ajusta solo", text: "En tus primeras sesiones de cada idioma, si fallas la mayoría bajamos el nivel (y si aciertas casi todo, lo subimos). Te avisamos cuando pasa.", href: "/app/session" },
  { icon: "🎧", title: "Diagnóstico con escucha y lectura", text: "El test incluye preguntas de escuchar y elegir, y textos cortos de A1 a C1 en francés, italiano, portugués y alemán.", href: "/app/assessment" },
  { icon: "💬", title: "Frases útiles en tus sesiones", text: "Si empiezas de cero, tus sesiones mezclan palabras con frases hechas de Primeros pasos: te comunicas antes.", href: "/app/session" },
  { icon: "👣", title: "Primeros pasos", text: "Diez unidades para quien no sabe nada: saludar, presentarte, cuando no entiendes, números, cafetería, orientarte, familia, compras, días y horas, y emergencias. Audio lento, escuchar y elegir, ordenar frases, y transcripción en ruso, japonés, coreano, chino y árabe.", href: "/app/first-steps" },
  { icon: "🧹", title: "Palabras básicas corregidas", text: "Arreglamos traducciones y confusiones en las palabras más frecuentes (por ejemplo «tu», «sous», «cela» o «maintenant» en francés, y contracciones en italiano y portugués).", href: "/app/vocabulary" },
  { icon: "🌱", title: "Pensado para quien empieza de cero", text: "Diagnóstico con «No lo sé» (y que ya no premia adivinar), opción «Empiezo desde cero», ejercicios de escuchar y elegir antes de escribir, pistas 💡, audio más lento y el botón «Esto es muy difícil» para bajar el nivel al momento.", href: "/app/session" },
  { icon: "⏱️", title: "Modo estudio", text: "Dices cuánto tiempo tienes y lo repartimos entre tus idiomas en bloques, con un temporizador que te guía y descansos en el momento justo.", href: "/app/study" },
  { icon: "🌍", title: "Varios idiomas a la vez", text: "Elige tu idioma principal, los que están en progreso y los que sólo quieres mantener. Cada día repartimos tus minutos y evitamos que se mezclen los parecidos.", href: "/app/languages" },
  { icon: "📅", title: "Previsión de repasos", text: "En «Mis idiomas» ves cuántos repasos llegan cada día de la semana, por idioma, para adelantarte a los días cargados.", href: "/app/languages" },
  { icon: "🌿", title: "Descansos inteligentes", text: "Durante la sesión detectamos cuándo baja tu atención (más fallos, respuestas más lentas) y te proponemos una pausa guiada (respirar, descansar la vista, estirarte). Si sigues cansado, la sesión se aligera sola. Se puede desactivar en Configuración.", href: "/app/session" },
  { icon: "🤝", title: "Palabras regalo y falsos amigos", text: "Al conocer una palabra nueva te avisamos si se parece al español (se aprende casi sola) o si es un falso amigo que engaña.", href: "/app/session" },
  { icon: "🧠", title: "Tu ritmo, aprendido", text: "Tu capacidad de atención y tu mejor hora del día se calculan con tus propias respuestas. Míralos en Progreso.", href: "/app/progress" },
  { icon: "📲", title: "Instálala en tu móvil", text: "Un icono en la pantalla de inicio (con instrucciones para iPhone) y una pestaña «Más» con todas las secciones.", href: "/app/settings" },
  { icon: "💡", title: "¿Por qué me equivoqué?", text: "Tras un fallo, pide a tu tutor una explicación breve y personalizada (con la IA activada).", href: "/app/session" },
  { icon: "🧩", title: "El doble de gramática", text: "Los 12 idiomas suman nuevas lecciones de A1 a C1 (hasta 27 en inglés), con errores típicos de hispanohablantes y ejercicios.", href: "/app/grammar" },
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
