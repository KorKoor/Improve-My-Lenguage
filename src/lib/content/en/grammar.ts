import type { GrammarConcept } from "../types";

/**
 * Gramática de inglés explicada para hispanohablantes: concepto, uso,
 * formación, errores típicos (con énfasis en interferencia del español),
 * contraste con estructuras cercanas y ejercicios.
 */
export const EN_GRAMMAR: GrammarConcept[] = [
  {
    id: "en:g:third-person-s",
    language: "en",
    title: "Presente simple: la -s de tercera persona",
    cefr: "A1",
    errorCategory: "subject-verb-agreement",
    summary:
      "En presente simple, con he, she, it (o un sujeto singular), el verbo lleva -s. Es el error más frecuente de todos los niveles porque en la conversación rápida la -s 'desaparece'.",
    whenToUse: [
      "Hábitos y rutinas: She works from home.",
      "Hechos generales: Water boils at 100 °C.",
      "Horarios fijos: The train leaves at 6.",
    ],
    formation: [
      "I / you / we / they + verbo base: I work.",
      "he / she / it + verbo + -s: She works.",
      "-es tras -s, -sh, -ch, -x, -o: watches, goes, does.",
      "consonante + y → -ies: study → studies.",
      "Negativa y pregunta usan does y el verbo vuelve a la forma base: She doesn't work. Does she work?",
    ],
    commonMistakes: [
      { wrong: "She work in a bank.", right: "She works in a bank.", why: "Tercera persona singular necesita -s." },
      { wrong: "He doesn't works on Fridays.", right: "He doesn't work on Fridays.", why: "Con does/doesn't la -s ya está en el auxiliar; el verbo va en forma base." },
      { wrong: "My brother have two cats.", right: "My brother has two cats.", why: "'have' es irregular: he/she/it has." },
    ],
    examples: [
      { text: "My sister lives in Monterrey.", translation: { es: "Mi hermana vive en Monterrey." } },
      { text: "The app saves your progress automatically.", translation: { es: "La app guarda tu progreso automáticamente." } },
    ],
    contrasts: [
      {
        a: "They play video games every day.",
        b: "He plays video games every day.",
        explanation: "Mismo verbo; sólo cambia el sujeto. La -s marca 'una sola persona que no soy yo ni tú'.",
      },
    ],
    exercises: [
      { type: "mc", prompt: "My dad ___ coffee every morning.", options: ["drink", "drinks", "drinking", "is drink"], answers: ["drinks"], explanation: "Sujeto singular (my dad = he) en presente simple → drinks." },
      { type: "fill", prompt: "She ___ (study) medicine at university.", answers: ["studies"], explanation: "Consonante + y → -ies: studies." },
      { type: "mc", prompt: "___ your brother play the guitar?", options: ["Do", "Does", "Is", "Has"], answers: ["Does"], explanation: "Pregunta en tercera persona singular → Does." },
      { type: "correct", prompt: "He don't like spicy food.", answers: ["He doesn't like spicy food.", "He does not like spicy food."], explanation: "Tercera persona: doesn't (does not), no don't." },
      { type: "fill", prompt: "The meeting ___ (start) at nine.", answers: ["starts"], explanation: "Horario fijo en presente simple; sujeto singular → starts." },
      { type: "correct", prompt: "My phone have a great camera.", answers: ["My phone has a great camera."], explanation: "have → has con he/she/it." },
    ],
  },
  {
    id: "en:g:past-simple",
    language: "en",
    title: "Pasado simple (regulares e irregulares)",
    cefr: "A2",
    errorCategory: "past-tense",
    summary:
      "El pasado simple describe acciones terminadas en un momento concreto del pasado. Los verbos regulares añaden -ed; los irregulares tienen formas propias que hay que memorizar.",
    whenToUse: [
      "Acciones terminadas con tiempo definido: I called her yesterday.",
      "Secuencias de hechos en una historia: He opened the door and walked in.",
      "Con marcadores como yesterday, last week, in 2019, ago.",
    ],
    formation: [
      "Regular: verbo + -ed (work → worked, study → studied, stop → stopped).",
      "Irregular: forma propia (go → went, buy → bought, see → saw).",
      "Negativa: didn't + verbo base (I didn't go).",
      "Pregunta: Did + sujeto + verbo base (Did you go?).",
    ],
    commonMistakes: [
      { wrong: "She go to school yesterday.", right: "She went to school yesterday.", why: "'yesterday' exige pasado; go es irregular → went." },
      { wrong: "I didn't went to the party.", right: "I didn't go to the party.", why: "Tras didn't el verbo va en forma base: el pasado ya está en el auxiliar." },
      { wrong: "Did you saw the game?", right: "Did you see the game?", why: "Tras did, forma base." },
    ],
    examples: [
      { text: "We visited Guanajuato last summer.", translation: { es: "Visitamos Guanajuato el verano pasado." } },
      { text: "I bought a new keyboard two weeks ago.", translation: { es: "Compré un teclado nuevo hace dos semanas." } },
    ],
    contrasts: [
      {
        a: "I lived in Monterrey for five years. (ya no vivo ahí)",
        b: "I have lived here for five years. (sigo viviendo aquí)",
        explanation: "El pasado simple cierra la acción; el present perfect la conecta con el presente.",
      },
    ],
    exercises: [
      { type: "mc", prompt: "I ___ a great movie last night.", options: ["see", "saw", "seen", "have seen"], answers: ["saw"], explanation: "'last night' = tiempo terminado → pasado simple: saw." },
      { type: "fill", prompt: "They ___ (buy) tickets yesterday.", answers: ["bought"], explanation: "buy es irregular: bought." },
      { type: "correct", prompt: "She go to school yesterday.", answers: ["She went to school yesterday."], explanation: "yesterday → pasado: went." },
      { type: "correct", prompt: "I didn't went to work on Monday.", answers: ["I didn't go to work on Monday.", "I did not go to work on Monday."], explanation: "didn't + forma base." },
      { type: "mc", prompt: "___ you finish the project on time?", options: ["Do", "Did", "Were", "Have"], answers: ["Did"], explanation: "Pregunta en pasado simple → Did." },
      { type: "fill", prompt: "We ___ (stop) at a gas station.", answers: ["stopped"], explanation: "Verbo corto terminado en consonante-vocal-consonante: se dobla la consonante → stopped." },
    ],
  },
  {
    id: "en:g:articles",
    language: "en",
    title: "Artículos: a / an / the / Ø",
    cefr: "A2",
    errorCategory: "articles",
    summary:
      "El inglés usa artículos de forma distinta al español: las generalizaciones van SIN artículo, y las profesiones llevan a/an.",
    whenToUse: [
      "a/an: algo no específico o mencionado por primera vez; profesiones (She is a doctor).",
      "the: algo específico o ya conocido por ambos (The book you lent me).",
      "Sin artículo (Ø): generalizaciones con plurales o incontables (Dogs are loyal. Life is short.).",
    ],
    formation: [
      "a + sonido consonántico: a university (/juː/), a car.",
      "an + sonido vocálico: an hour (h muda), an idea.",
      "the sirve para singular y plural.",
    ],
    commonMistakes: [
      { wrong: "The life is beautiful.", right: "Life is beautiful.", why: "Generalización con incontable: sin artículo (en español sí se usa 'la')." },
      { wrong: "She is engineer.", right: "She is an engineer.", why: "Las profesiones en singular llevan a/an." },
      { wrong: "I love the dogs.", right: "I love dogs.", why: "Hablas de los perros en general: sin artículo." },
    ],
    examples: [
      { text: "I saw a dog in the street. The dog was huge.", translation: { es: "Vi un perro en la calle. El perro era enorme." } },
      { text: "Music helps me concentrate.", translation: { es: "La música me ayuda a concentrarme." } },
    ],
    contrasts: [
      {
        a: "Coffee keeps me awake. (el café en general)",
        b: "The coffee in this café is excellent. (un café concreto)",
        explanation: "General → Ø. Específico → the.",
      },
    ],
    exercises: [
      { type: "mc", prompt: "My sister is ___ architect.", options: ["a", "an", "the", "—"], answers: ["an"], explanation: "Profesión + sonido vocálico → an." },
      { type: "mc", prompt: "___ people in this city are very friendly.", options: ["The", "A", "—", "An"], answers: ["The"], explanation: "'people in this city' es un grupo específico → The." },
      { type: "correct", prompt: "The money doesn't buy happiness.", answers: ["Money doesn't buy happiness.", "Money does not buy happiness."], explanation: "Generalización con incontable → sin artículo." },
      { type: "mc", prompt: "It takes ___ hour to get there.", options: ["a", "an", "the", "—"], answers: ["an"], explanation: "La h de hour es muda: sonido vocálico → an." },
      { type: "correct", prompt: "I want to be programmer.", answers: ["I want to be a programmer."], explanation: "Profesión en singular → a programmer." },
      { type: "mc", prompt: "I don't like ___ horror movies.", options: ["the", "a", "—", "an"], answers: ["—"], explanation: "Gustos generales con plurales → sin artículo." },
    ],
  },
  {
    id: "en:g:prepositions-time-place",
    language: "en",
    title: "Preposiciones de tiempo y lugar: in / on / at",
    cefr: "A2",
    errorCategory: "prepositions",
    summary:
      "El español usa 'en' para casi todo; el inglés distingue in, on y at según lo general o específico que sea el tiempo o el lugar.",
    whenToUse: [
      "Tiempo — in: meses, años, estaciones, partes del día (in May, in 2026, in the morning).",
      "Tiempo — on: días y fechas (on Monday, on July 4th).",
      "Tiempo — at: horas y momentos puntuales (at 7 pm, at night, at the weekend (UK)).",
      "Lugar — in: dentro de un espacio (in the room, in Mexico).",
      "Lugar — on: sobre una superficie (on the table, on the wall, on the bus).",
      "Lugar — at: un punto o sitio (at the door, at work, at home).",
    ],
    formation: ["Regla mental: in (grande/contenedor) → on (superficie/día) → at (punto exacto)."],
    commonMistakes: [
      { wrong: "I was born in March 5th.", right: "I was born on March 5th.", why: "Fecha concreta → on." },
      { wrong: "See you in Monday.", right: "See you on Monday.", why: "Días → on." },
      { wrong: "I'm in home.", right: "I'm at home.", why: "Expresión fija: at home, at work, at school." },
    ],
    examples: [
      { text: "The class starts at 8 on Tuesdays.", translation: { es: "La clase empieza a las 8 los martes." } },
      { text: "My keys are on the kitchen table.", translation: { es: "Mis llaves están en la mesa de la cocina." } },
    ],
    contrasts: [
      {
        a: "I'm in the car. (dentro de un vehículo pequeño)",
        b: "I'm on the bus. (transporte público grande)",
        explanation: "Vehículos en los que puedes caminar (bus, train, plane) → on.",
      },
    ],
    exercises: [
      { type: "mc", prompt: "My birthday is ___ October.", options: ["in", "on", "at"], answers: ["in"], explanation: "Mes → in." },
      { type: "mc", prompt: "The meeting is ___ Friday.", options: ["in", "on", "at"], answers: ["on"], explanation: "Día → on." },
      { type: "mc", prompt: "I'll call you ___ 5 o'clock.", options: ["in", "on", "at"], answers: ["at"], explanation: "Hora exacta → at." },
      { type: "fill", prompt: "She's not here, she's ___ work.", answers: ["at"], explanation: "Expresión fija: at work." },
      { type: "correct", prompt: "I was born in June 12th.", answers: ["I was born on June 12th.", "I was born on June 12."], explanation: "Fecha concreta → on." },
      { type: "mc", prompt: "There's a spider ___ the ceiling!", options: ["in", "on", "at"], answers: ["on"], explanation: "Superficie (aunque esté arriba) → on." },
    ],
  },
  {
    id: "en:g:present-perfect",
    language: "en",
    title: "Present perfect vs. pasado simple",
    cefr: "B1",
    errorCategory: "present-perfect",
    summary:
      "El present perfect (have + participio) conecta el pasado con el presente: experiencias sin fecha, acciones que siguen, o resultados que importan ahora.",
    whenToUse: [
      "Experiencias de vida sin momento concreto: I've been to Japan.",
      "Situaciones que empezaron en el pasado y continúan (for/since): I've lived here for five years.",
      "Acciones recientes con resultado presente: I've lost my keys (no las tengo).",
      "Con just, already, yet, ever, never.",
    ],
    formation: [
      "have/has + participio pasado: I have worked, she has gone.",
      "Negativa: haven't/hasn't + participio.",
      "Pregunta: Have/Has + sujeto + participio.",
      "for + duración (for two years); since + punto de inicio (since 2020).",
    ],
    commonMistakes: [
      { wrong: "I have seen him yesterday.", right: "I saw him yesterday.", why: "Con un tiempo terminado (yesterday) se usa pasado simple." },
      { wrong: "I live here since 2020.", right: "I have lived here since 2020.", why: "Acción que empezó en el pasado y continúa → present perfect (calco de 'vivo aquí desde')." },
      { wrong: "I work here for three years.", right: "I have worked here for three years.", why: "Duración hasta ahora → present perfect." },
    ],
    examples: [
      { text: "I have lived here for five years.", translation: { es: "Llevo cinco años viviendo aquí." } },
      { text: "Have you ever tried mole?", translation: { es: "¿Alguna vez has probado el mole?" } },
    ],
    contrasts: [
      {
        a: "I have lived here for five years.",
        b: "I lived there for five years.",
        explanation: "Present perfect: sigues viviendo aquí. Pasado simple: esa etapa terminó.",
      },
      {
        a: "I've finished the report. (el resultado importa ahora)",
        b: "I finished the report at 3 pm. (momento concreto)",
        explanation: "Si dices cuándo, usa pasado simple.",
      },
    ],
    exercises: [
      { type: "mc", prompt: "I ___ in this city since 2019.", options: ["live", "lived", "have lived", "am living"], answers: ["have lived"], explanation: "since + acción que continúa → present perfect." },
      { type: "mc", prompt: "She ___ to Paris last year.", options: ["has gone", "went", "has been", "goes"], answers: ["went"], explanation: "'last year' es tiempo terminado → pasado simple." },
      { type: "correct", prompt: "I have seen that movie yesterday.", answers: ["I saw that movie yesterday."], explanation: "yesterday → pasado simple." },
      { type: "fill", prompt: "Have you ever ___ (eat) sushi?", answers: ["eaten"], explanation: "Experiencia de vida: have + participio (eat → eaten)." },
      { type: "correct", prompt: "I work here for three years.", answers: ["I have worked here for three years.", "I've worked here for three years.", "I have been working here for three years.", "I've been working here for three years."], explanation: "Duración hasta el presente → present perfect." },
      { type: "mc", prompt: "We haven't finished the project ___.", options: ["already", "yet", "since", "ago"], answers: ["yet"], explanation: "'yet' en negativas y preguntas; 'already' en afirmativas." },
    ],
  },
  {
    id: "en:g:gerund-infinitive",
    language: "en",
    title: "Verbo + -ing o verbo + to",
    cefr: "B1",
    errorCategory: "verb-patterns",
    summary:
      "Algunos verbos van seguidos de -ing (enjoy doing) y otros de to + infinitivo (want to do). No hay una regla única: se aprenden por grupos.",
    whenToUse: [
      "+ -ing: enjoy, avoid, finish, mind, keep, suggest, consider, look forward to.",
      "+ to: want, need, decide, hope, plan, learn, promise, would like.",
      "Tras preposición siempre -ing: interested in learning, good at playing.",
    ],
    formation: ["verbo A + verbo-ing: I enjoy reading.", "verbo B + to + verbo base: I want to read."],
    commonMistakes: [
      { wrong: "I enjoy to read.", right: "I enjoy reading.", why: "enjoy + -ing." },
      { wrong: "I want learning English.", right: "I want to learn English.", why: "want + to." },
      { wrong: "I'm interested in learn Japanese.", right: "I'm interested in learning Japanese.", why: "Tras preposición → -ing." },
    ],
    examples: [
      { text: "I finished writing the tests.", translation: { es: "Terminé de escribir las pruebas." } },
      { text: "We decided to move to a new city.", translation: { es: "Decidimos mudarnos a otra ciudad." } },
    ],
    contrasts: [
      {
        a: "I stopped smoking. (dejé de fumar)",
        b: "I stopped to smoke. (me detuve para fumar)",
        explanation: "Con 'stop' el significado cambia según el patrón.",
      },
    ],
    exercises: [
      { type: "mc", prompt: "Do you mind ___ the window?", options: ["open", "to open", "opening"], answers: ["opening"], explanation: "mind + -ing." },
      { type: "mc", prompt: "I need ___ more sleep.", options: ["get", "to get", "getting"], answers: ["to get"], explanation: "need + to." },
      { type: "correct", prompt: "She avoids to talk about work.", answers: ["She avoids talking about work."], explanation: "avoid + -ing." },
      { type: "fill", prompt: "I'm good at ___ (solve) problems.", answers: ["solving"], explanation: "Tras preposición (at) → -ing." },
      { type: "mc", prompt: "They plan ___ a startup.", options: ["launching", "to launch", "launch"], answers: ["to launch"], explanation: "plan + to." },
    ],
  },
  {
    id: "en:g:conditionals",
    language: "en",
    title: "Condicionales: primero y segundo",
    cefr: "B1",
    errorCategory: "conditionals",
    summary:
      "El primer condicional habla de situaciones reales o probables; el segundo, de situaciones hipotéticas o poco probables.",
    whenToUse: [
      "1.º condicional (real/probable): If it rains, we will stay home.",
      "2.º condicional (hipotético): If I had more time, I would learn Korean.",
    ],
    formation: [
      "1.º: If + presente simple, will + verbo base.",
      "2.º: If + pasado simple, would + verbo base.",
      "Nunca 'will' ni 'would' en la parte del 'if' (en estos tipos).",
      "En el 2.º condicional es habitual 'If I were…' (registro cuidado).",
    ],
    commonMistakes: [
      { wrong: "If it will rain, we will stay home.", right: "If it rains, we will stay home.", why: "No va 'will' tras 'if'." },
      { wrong: "If I would have money, I would travel.", right: "If I had money, I would travel.", why: "2.º condicional: If + pasado simple." },
    ],
    examples: [
      { text: "If you practice every day, you will improve quickly.", translation: { es: "Si practicas todos los días, mejorarás rápido." } },
      { text: "If I lived in Japan, I would speak Japanese every day.", translation: { es: "Si viviera en Japón, hablaría japonés todos los días." } },
    ],
    contrasts: [
      {
        a: "If I win the lottery, I'll buy a house. (lo veo posible)",
        b: "If I won the lottery, I'd buy a house. (lo veo improbable)",
        explanation: "La elección muestra lo probable que ves la situación.",
      },
    ],
    exercises: [
      { type: "mc", prompt: "If it ___ tomorrow, we'll cancel the trip.", options: ["will rain", "rains", "rained", "would rain"], answers: ["rains"], explanation: "1.º condicional: If + presente." },
      { type: "mc", prompt: "If I ___ you, I would accept the offer.", options: ["am", "was being", "were", "will be"], answers: ["were"], explanation: "2.º condicional: If I were you (consejo)." },
      { type: "correct", prompt: "If I will see her, I will tell her.", answers: ["If I see her, I will tell her.", "If I see her, I'll tell her."], explanation: "Sin will tras if." },
      { type: "fill", prompt: "If I had more time, I ___ (learn) to play the piano.", answers: ["would learn", "'d learn"], explanation: "2.º condicional: would + verbo base." },
      { type: "correct", prompt: "If I would have a car, I would drive to work.", answers: ["If I had a car, I would drive to work.", "If I had a car, I'd drive to work."], explanation: "2.º condicional: If + pasado simple." },
    ],
  },
  {
    id: "en:g:questions",
    language: "en",
    title: "Formar preguntas con auxiliares",
    cefr: "A1",
    errorCategory: "question-formation",
    summary:
      "En inglés las preguntas necesitan un auxiliar antes del sujeto (do/does/did, is/are, can...). No basta con la entonación, como en español.",
    whenToUse: ["Cualquier pregunta de sí/no o con palabra interrogativa (what, where, why...)."],
    formation: [
      "(Palabra interrogativa) + auxiliar + sujeto + verbo: Where do you work?",
      "Con 'to be' se invierte directamente: Are you ready?",
      "Excepción: si la palabra interrogativa ES el sujeto, no hay do: Who called you?",
    ],
    commonMistakes: [
      { wrong: "You like coffee?", right: "Do you like coffee?", why: "Hace falta el auxiliar do (salvo en habla muy informal)." },
      { wrong: "Where you live?", right: "Where do you live?", why: "Falta el auxiliar." },
      { wrong: "What means this word?", right: "What does this word mean?", why: "Auxiliar does + verbo base." },
    ],
    examples: [
      { text: "What time does the store open?", translation: { es: "¿A qué hora abre la tienda?" } },
      { text: "Why did you choose this course?", translation: { es: "¿Por qué elegiste este curso?" } },
    ],
    contrasts: [
      {
        a: "Who did you call? (tú llamaste a alguien)",
        b: "Who called you? (alguien te llamó)",
        explanation: "Si 'who' es el sujeto, no se usa did.",
      },
    ],
    exercises: [
      { type: "mc", prompt: "___ you speak French?", options: ["Are", "Do", "Does", "Is"], answers: ["Do"], explanation: "Presente simple con 'you' → Do." },
      { type: "correct", prompt: "What means 'deadline'?", answers: ["What does 'deadline' mean?", "What does deadline mean?"], explanation: "What + does + sujeto + mean." },
      { type: "correct", prompt: "Where you work?", answers: ["Where do you work?"], explanation: "Falta el auxiliar do." },
      { type: "mc", prompt: "Who ___ the last cookie?", options: ["did eat", "ate", "did ate", "eats did"], answers: ["ate"], explanation: "'Who' es el sujeto: no hay auxiliar." },
      { type: "fill", prompt: "How long ___ it take to get there?", answers: ["does"], explanation: "Sujeto 'it' en presente → does." },
    ],
  },
];
