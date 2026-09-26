/**
 * Guías: responden preguntas reales de quien aprende un idioma y explican
 * cómo lo resuelve Improve My Languages, sin cifras inventadas. Cada guía
 * tiene una intención de búsqueda, una respuesta corta al principio (la que
 * citaría un buscador o un asistente), secciones, fuentes y enlaces internos.
 *
 * Formato del texto: [enlace](/ruta) y **negrita**.
 */
export interface GuideSection {
  h2: string;
  body: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  /** <title> y título de la tarjeta. */
  title: string;
  h1: string;
  description: string;
  /** Pregunta que intenta resolver la persona (intención principal). */
  question: string;
  answer: string;
  sections: GuideSection[];
  sources: { title: string; url?: string }[];
  related: string[];
  cta: { text: string; href: string };
  updated: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "aprendizaje-adaptativo",
    title: "Qué es el aprendizaje adaptativo de idiomas",
    h1: "¿Qué es el aprendizaje adaptativo de idiomas?",
    description: "Qué significa que un curso de idiomas se adapte a ti, qué datos usa y en qué se diferencia de un curso fijo o de una app de tarjetas.",
    question: "¿Qué es el aprendizaje adaptativo de idiomas y cómo funciona?",
    answer:
      "El aprendizaje adaptativo es un curso que decide qué practicas a partir de lo que ya sabes, de lo que estás a punto de olvidar y de los errores que repites. En lugar de seguir un temario igual para todos, mide tu nivel por habilidad, programa los repasos en el momento óptimo y construye cada sesión según esos datos.",
    sections: [
      {
        h2: "Curso fijo frente a curso adaptativo",
        body: [
          "Un curso tradicional ordena las lecciones una vez y todos las recorren igual. Si ya dominas un tema, lo repites; si otro te cuesta, avanzas igualmente. Un sistema adaptativo cambia el orden y la dosis: repite lo que falla, salta lo que ya sabes y sube el reto cuando aciertas con facilidad.",
        ],
      },
      {
        h2: "Qué datos usa un sistema adaptativo",
        body: ["En Improve My Languages el curso se ajusta con cuatro tipos de información, todos visibles en tu perfil:"],
        list: [
          "**Nivel por habilidad**: una estimación separada para vocabulario, gramática, lectura, escucha, escritura y habla, que se actualiza con cada respuesta ([cómo se mide tu nivel](/guias/nivel-mcer)).",
          "**Memoria de cada palabra y tema**: cuándo está a punto de olvidarse, con repetición espaciada FSRS ([repetición espaciada](/guias/repeticion-espaciada)).",
          "**Errores clasificados**: no sólo «incorrecto», sino qué tipo de error y cuántas veces aparece ([errores recurrentes](/guias/errores-recurrentes)).",
          "**Tu tiempo e intereses**: cuántos minutos tienes hoy y de qué temas te gusta leer.",
        ],
      },
      {
        h2: "Cómo se ve en una sesión",
        body: [
          "Dices cuántos minutos tienes y el planificador reparte el tiempo entre repasos pendientes, tu debilidad principal, vocabulario nuevo de tus intereses y la habilidad con más margen de mejora. Cada bloque explica por qué está ahí, por ejemplo: «Gramática · pasado simple: error en 4 de tus últimas 6 sesiones».",
          "Afi, la compañera de aprendizaje de Improve My Languages, traduce esos datos en frases cortas («He notado que este error aparece varias veces. Vamos a practicarlo.»), pero la decisión siempre sale de los datos, no de un guion.",
        ],
      },
      {
        h2: "Lo que el aprendizaje adaptativo no hace",
        body: [
          "No sustituye la práctica: sólo intenta que cada minuto se dedique a lo que más te ayuda ahora. Tampoco acierta desde el primer día: la estimación de tu nivel empieza con un [diagnóstico breve](/guias/nivel-mcer) y se vuelve más estable con cada ejercicio.",
        ],
      },
    ],
    sources: [
      { title: "Consejo de Europa — Marco Común Europeo de Referencia para las Lenguas", url: "https://www.coe.int/en/web/common-european-framework-reference-languages" },
      { title: "Open Spaced Repetition — algoritmo FSRS", url: "https://github.com/open-spaced-repetition/fsrs4anki" },
    ],
    related: ["nivel-mcer", "repeticion-espaciada", "errores-recurrentes"],
    cta: { text: "Haz el diagnóstico y recibe tu primera sesión adaptada", href: "/login?mode=signup" },
    updated: "2026-09-26",
  },
  {
    slug: "nivel-mcer",
    title: "Niveles MCER (A1–C2): cómo saber tu nivel real",
    h1: "Niveles MCER de A1 a C2: qué significan y cómo saber tu nivel real",
    description: "Qué describen los niveles A1, A2, B1, B2, C1 y C2 del Marco Común Europeo y cómo un test adaptativo estima tu nivel habilidad por habilidad.",
    question: "¿Cómo puedo saber mi nivel real de inglés (o de otro idioma)?",
    answer:
      "El Marco Común Europeo de Referencia (MCER, en inglés CEFR) describe seis niveles: A1 y A2 (usuario básico), B1 y B2 (independiente), C1 y C2 (competente). Para conocer tu nivel real conviene medir cada habilidad por separado con un test adaptativo: las preguntas se ajustan a tus respuestas hasta encontrar tu techo, en lugar de ponerte un examen fijo.",
    sections: [
      {
        h2: "Qué describe cada nivel",
        body: ["El MCER, publicado por el Consejo de Europa, describe lo que una persona **puede hacer** con el idioma, no cuántas palabras sabe. De forma resumida:"],
        list: [
          "**A1**: frases muy básicas sobre ti y tu entorno inmediato.",
          "**A2**: situaciones cotidianas sencillas y previsibles.",
          "**B1**: te desenvuelves en viajes y temas conocidos; describes experiencias.",
          "**B2**: conversas con fluidez con hablantes nativos sobre temas variados.",
          "**C1**: usas el idioma con flexibilidad en contextos sociales, académicos y profesionales.",
          "**C2**: comprendes prácticamente todo y te expresas con precisión.",
        ],
      },
      {
        h2: "Tu nivel es un perfil, no una letra",
        body: [
          "Es habitual leer como un B2 y hablar como un A2. Por eso Improve My Languages guarda una estimación para cada habilidad y te muestra el perfil completo. Tu plan diario apunta a la habilidad que más margen tiene, no a una media que esconde las diferencias.",
        ],
      },
      {
        h2: "Cómo funciona un test adaptativo",
        body: [
          "El diagnóstico empieza con preguntas de dificultad media. Si aciertas, la siguiente es más difícil; si fallas, más fácil. Con un modelo estadístico (modelo de Rasch) se calcula tu nivel y el margen de error; el test se detiene cuando el margen es suficientemente pequeño, normalmente entre 8 y 18 preguntas.",
          "Un consejo: si no sabes una respuesta, usa «No lo sé». Adivinar hace que el sistema te crea más avanzado y luego te proponga ejercicios demasiado difíciles.",
        ],
      },
      {
        h2: "Después del diagnóstico",
        body: [
          "El resultado es sólo el punto de partida. Cada ejercicio actualiza la estimación, así que tu nivel se afina con el uso. Si empiezas desde cero en un idioma con otra escritura, primero aprenderás a leer ([aprender otro alfabeto](/guias/leer-otro-alfabeto)).",
        ],
      },
    ],
    sources: [
      { title: "Consejo de Europa — Common European Framework of Reference for Languages (CEFR)", url: "https://www.coe.int/en/web/common-european-framework-reference-languages" },
      { title: "Instituto Cervantes — Marco común europeo de referencia (versión en español)", url: "https://cvc.cervantes.es/ensenanza/biblioteca_ele/marco/" },
      { title: "Rasch model (Wikipedia, en inglés)", url: "https://en.wikipedia.org/wiki/Rasch_model" },
    ],
    related: ["aprendizaje-adaptativo", "repeticion-espaciada", "leer-a-tu-nivel"],
    cta: { text: "Descubre tu nivel por habilidad en unos 5 minutos", href: "/login?mode=signup" },
    updated: "2026-09-26",
  },
  {
    slug: "repeticion-espaciada",
    title: "Repetición espaciada para idiomas: cómo funciona FSRS",
    h1: "Repetición espaciada: por qué conviene repasar justo antes de olvidar",
    description: "Qué es la repetición espaciada, por qué ayuda a recordar vocabulario y gramática, y cómo decide FSRS cuándo repasar cada palabra.",
    question: "¿Cómo funciona la repetición espaciada para aprender idiomas?",
    answer:
      "La repetición espaciada programa cada repaso cuando estás a punto de olvidar lo aprendido: cada vez que lo recuerdas, el siguiente repaso llega más tarde. Así repasas menos veces y recuerdas durante más tiempo. Improve My Languages usa FSRS, un algoritmo abierto que estima para cada palabra su estabilidad en la memoria y la probabilidad de que la recuerdes hoy.",
    sections: [
      {
        h2: "La curva del olvido",
        body: [
          "Hermann Ebbinghaus describió en 1885 que olvidamos rápido al principio y más despacio después. Cada repaso en el momento adecuado hace que la curva caiga más lentamente. Repasar demasiado pronto desperdicia tiempo; demasiado tarde obliga a reaprender.",
        ],
      },
      {
        h2: "Recordar activamente, no releer",
        body: [
          "Los repasos funcionan mejor cuando tienes que **recuperar** la respuesta (escribirla, elegirla, decirla) que cuando sólo la vuelves a leer. Por eso los repasos de Improve My Languages son ejercicios: traducir, completar, escuchar y escribir lo que oyes.",
        ],
      },
      {
        h2: "Cómo decide FSRS cuándo repasar",
        body: [
          "FSRS (Free Spaced Repetition Scheduler) modela tres cosas de cada elemento: su **dificultad**, su **estabilidad** (cuánto aguanta en la memoria) y la **probabilidad de recordarlo** hoy. Con cada respuesta ajusta esos valores y calcula la próxima fecha.",
          "En Improve My Languages no sólo cuenta si aciertas: también cuánto tardas, si necesitaste pistas y lo seguro que dijiste estar. Una palabra que aciertas dudando vuelve antes que una que sabes al instante.",
        ],
      },
      {
        h2: "Qué se repasa",
        body: [
          "Palabras, temas de gramática y, al empezar un idioma con otra escritura, también letras y reglas de lectura. Los errores recurrentes ([por qué repetimos errores](/guias/errores-recurrentes)) hacen que un tema vuelva antes a tus sesiones.",
        ],
      },
    ],
    sources: [
      { title: "Open Spaced Repetition — FSRS (código abierto)", url: "https://github.com/open-spaced-repetition/fsrs4anki" },
      { title: "Curva del olvido (Wikipedia)", url: "https://es.wikipedia.org/wiki/Curva_del_olvido" },
      { title: "Roediger y Karpicke (2006), «Test-enhanced learning», Psychological Science", url: "https://doi.org/10.1111/j.1467-9280.2006.01693.x" },
    ],
    related: ["aprendizaje-adaptativo", "errores-recurrentes", "nivel-mcer"],
    cta: { text: "Empieza a repasar con FSRS", href: "/login?mode=signup" },
    updated: "2026-09-26",
  },
  {
    slug: "errores-recurrentes",
    title: "Por qué repito siempre los mismos errores al aprender un idioma",
    h1: "¿Por qué repito siempre los mismos errores en otro idioma?",
    description: "De dónde vienen los errores que se repiten (traducción literal, reglas a medio aprender) y cómo detectarlos y practicarlos a propósito.",
    question: "¿Por qué sigo cometiendo los mismos errores de gramática?",
    answer:
      "Los errores que se repiten suelen tener una causa concreta: trasladar una estructura del español («I have 20 years»), una regla aprendida a medias o una forma que nunca se practicó lo suficiente. Se corrigen mejor cuando se identifica el tipo de error y se practica ese punto en varias sesiones seguidas, no con una corrección aislada.",
    sections: [
      {
        h2: "Tipos de error habituales",
        list: [
          "**Transferencia del español**: calcos como «I have 20 years» o «depend of».",
          "**Reglas a medio aprender**: «She go to school yesterday» (pasado simple).",
          "**Falsos amigos**: «actually» no significa «actualmente».",
          "**Ortografía y acentos**: tildes, mayúsculas de los sustantivos en alemán, letras especiales.",
        ],
        body: ["Los lingüistas llaman «interlengua» a ese sistema intermedio que construimos al aprender: tiene sus propias reglas, y algunas se quedan fijas si nadie las señala."],
      },
      {
        h2: "Clasificar en vez de marcar «incorrecto»",
        body: [
          "Improve My Languages guarda cada error con su categoría (pasado simple, artículos, traducción literal, acentos…). Cuando una categoría aparece varias veces en poco tiempo, pasa a ser una **debilidad**: la verás en tu perfil con el número de errores, y tus próximas sesiones incluirán ejercicios de ese tema.",
          "Afi lo dice en voz tranquila: «He notado que este error aparece varias veces. Vamos a practicarlo.» Un fallo no te quita puntos ni vidas: sirve para saber qué necesitas.",
        ],
      },
      {
        h2: "Qué puedes hacer tú",
        list: [
          "Lee la explicación del error, no sólo la respuesta correcta.",
          "Practica el mismo punto en días distintos: la [repetición espaciada](/guias/repeticion-espaciada) se encarga del calendario.",
          "Escribe textos cortos: al corregirlos aparecen los errores que en los ejercicios de opción múltiple no se ven.",
        ],
        body: [],
      },
    ],
    sources: [{ title: "Interlengua (Wikipedia)", url: "https://es.wikipedia.org/wiki/Interlengua" }],
    related: ["aprendizaje-adaptativo", "repeticion-espaciada", "ia-en-idiomas"],
    cta: { text: "Descubre qué errores repites", href: "/login?mode=signup" },
    updated: "2026-09-26",
  },
  {
    slug: "leer-otro-alfabeto",
    title: "Aprender un idioma con otro alfabeto desde cero",
    h1: "Cómo aprender un idioma con otro alfabeto (ruso, árabe, coreano, japonés, chino) desde cero",
    description: "Por qué conviene aprender primero a leer, en qué orden hacerlo y cómo practicar letras, sonidos y trazos sin depender del teclado.",
    question: "¿Cómo empiezo a aprender un idioma que se escribe con otro alfabeto?",
    answer:
      "Empieza por aprender a leer: letras y sonidos en grupos pequeños, luego las reglas de lectura y después palabras que ya puedes descifrar con lo aprendido. Oír cada letra, trazarla y escribirla con un teclado en pantalla hace que el vocabulario posterior sea mucho más fácil. En Improve My Languages esto es la Fase 0, antes de las lecciones.",
    sections: [
      {
        h2: "Por qué leer primero",
        body: [
          "Si no puedes leer una palabra, sólo puedes memorizar su dibujo. Con el alfabeto aprendido, cada palabra nueva se apoya en sonidos que ya conoces, y los errores de pronunciación se reducen.",
        ],
      },
      {
        h2: "El orden de la Fase 0",
        list: [
          "**Letras y sonidos** en grupos pequeños, con audio de cada letra.",
          "**Trazos**: el orden y la dirección de cada trazo (japonés, chino, coreano y árabe), con animación y práctica de calcar.",
          "**Reglas de lectura**: por ejemplo, la tilde rusa, las formas árabes al unirse o cómo se arma un bloque de hangul.",
          "**Palabras descifrables** y tus primeras frases.",
        ],
        body: [],
      },
      {
        h2: "Sin teclado nuevo",
        body: [
          "Cada ejercicio de escritura trae un teclado en pantalla con las letras del idioma, así que no necesitas instalar nada. Si ya sabes algo, una prueba corta te coloca en el punto correcto.",
        ],
      },
      {
        h2: "Idiomas con escritura latina",
        body: [
          "También hay una fase de lectura en francés, alemán, italiano, portugués, neerlandés, sueco e inglés: los sonidos que no existen en español, los signos especiales y cómo escribirlos en tu móvil o tu ordenador.",
        ],
      },
    ],
    sources: [
      { title: "KanjiVG — orden de trazos de kana y kanji (CC BY-SA 3.0)", url: "https://kanjivg.tagaini.net" },
      { title: "Make Me a Hanzi — orden de trazos del chino", url: "https://github.com/skishore/makemeahanzi" },
    ],
    related: ["nivel-mcer", "leer-a-tu-nivel", "aprendizaje-adaptativo"],
    cta: { text: "Aprende a leer tu nuevo idioma", href: "/login?mode=signup" },
    updated: "2026-09-26",
  },
  {
    slug: "leer-a-tu-nivel",
    title: "Qué leer para aprender un idioma: textos a tu nivel",
    h1: "Qué leer para aprender un idioma: textos en los que conoces casi todas las palabras",
    description: "Por qué conviene leer textos en los que ya conoces la gran mayoría de palabras y cómo encontrar lecturas reales a tu nivel.",
    question: "¿Qué debo leer para mejorar en un idioma?",
    answer:
      "Lee textos reales en los que ya conozcas casi todas las palabras: la investigación sobre lectura en otro idioma sitúa la comprensión cómoda en torno al 95–98 % de palabras conocidas. Improve My Languages calcula ese porcentaje para cada texto con tu propio vocabulario y te propone lecturas de Wikipedia, Wikinoticias, Wikiviajes y clásicos de dominio público ordenados por lo bien que encajan contigo.",
    sections: [
      {
        h2: "El problema de leer «demasiado difícil»",
        body: [
          "Con muchas palabras desconocidas por línea, leer se convierte en descifrar: se entiende poco y se recuerda menos. Con casi todo conocido, las pocas palabras nuevas se deducen por el contexto y se fijan.",
        ],
      },
      {
        h2: "Cómo elegimos tus lecturas",
        list: [
          "Cada texto se analiza palabra por palabra con tu vocabulario (lo que ya practicaste y lo que corresponde a tu nivel).",
          "Verás el porcentaje que conoces, el nivel estimado y cuántas palabras nuevas útiles tiene.",
          "Tocar una palabra muestra su traducción y la pronuncia; al terminar hay preguntas de comprensión.",
        ],
        body: [],
      },
      {
        h2: "Fuentes reales, con licencia",
        body: [
          "Artículos de proyectos Wikimedia (CC BY-SA), frases de Tatoeba escritas por personas con su traducción, y fábulas y cuentos de Wikisource de dominio público (Esopo, La Fontaine, los hermanos Grimm, Collodi, Tolstói…). Siempre enlazamos a la fuente original; los créditos completos están en [créditos y licencias](/creditos).",
        ],
      },
    ],
    sources: [
      { title: "Hu y Nation (2000), «Unknown vocabulary density and reading comprehension», Reading in a Foreign Language 13(1), 403–430" },
      { title: "Wikisource — biblioteca libre", url: "https://wikisource.org" },
    ],
    related: ["nivel-mcer", "aprendizaje-adaptativo", "leer-otro-alfabeto"],
    cta: { text: "Encuentra lecturas a tu nivel", href: "/login?mode=signup" },
    updated: "2026-09-26",
  },
  {
    slug: "ia-en-idiomas",
    title: "IA para aprender idiomas: qué personaliza de verdad",
    h1: "Tutor de idiomas con IA: qué puede personalizar de verdad",
    description: "Dónde aporta la inteligencia artificial al aprender idiomas (conversar, corregir textos) y dónde es mejor una lógica verificable.",
    question: "¿Cómo puede la IA personalizar el aprendizaje de idiomas?",
    answer:
      "La IA generativa es útil para conversar y para comentar textos libres, porque adapta sus respuestas a lo que escribes. Para medir tu nivel, programar repasos o decidir qué practicar es mejor una lógica verificable (tests adaptativos, repetición espaciada, clasificación de errores). Improve My Languages usa IA sólo en el tutor y en la corrección de escritura, y es opcional.",
    sections: [
      {
        h2: "Dónde usamos IA",
        list: [
          "**Tutor de conversación**: conoce tu nivel, tus intereses y tus errores recientes, y te da feedback al final, sin interrumpirte.",
          "**Corrección de escritura**: comentarios sobre lo que escribes, validados para que no se inventen errores.",
          "**«¿Por qué?»**: una explicación breve de un fallo cuando la pides.",
        ],
        body: ["La IA sólo se activa con tu consentimiento y puede desactivarse. Si no está disponible, el resto de la aplicación funciona igual."],
      },
      {
        h2: "Dónde no",
        body: [
          "Tu nivel, tus repasos y tu plan diario salen de modelos deterministas y explicables: el [diagnóstico adaptativo](/guias/nivel-mcer), la [repetición espaciada FSRS](/guias/repeticion-espaciada) y la [clasificación de errores](/guias/errores-recurrentes). Así cada recomendación tiene un porqué que puedes ver, y no depende de que un modelo de lenguaje acierte.",
        ],
      },
      {
        h2: "Y Afi",
        body: [
          "Afi no es un chatbot: es la cara amable del sistema. Te dice en una frase lo que los datos indican y te acompaña en los aciertos y en los fallos.",
        ],
      },
    ],
    sources: [],
    related: ["aprendizaje-adaptativo", "errores-recurrentes", "nivel-mcer"],
    cta: { text: "Prueba el tutor y el plan adaptativo", href: "/login?mode=signup" },
    updated: "2026-09-26",
  },
];

export function guideBySlug(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}
