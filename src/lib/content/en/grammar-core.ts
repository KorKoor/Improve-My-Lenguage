import type { GrammarConcept } from "../types";

/**
 * Inglés: temas que completan el programa A1 → C1 (ver grammar.ts y
 * grammar-advanced.ts). Escritos para hispanohablantes: cada error típico
 * nace de una interferencia real del español.
 */
const es = (t: string) => ({ es: t });

export const EN_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "en:g:to-be",
    language: "en",
    title: "El verbo to be: am, is, are",
    cefr: "A1",
    errorCategory: "en:to-be",
    summary:
      "To be equivale a «ser» y a «estar» a la vez. En presente tiene tres formas: I am, he/she/it is, you/we/they are. En inglés el sujeto siempre se dice: «Es tarde» es It is late.",
    whenToUse: ["Identidad y profesión: I am a teacher.", "Estados y lugares: She is tired. We are at home.", "Edad (¡no se usa have!): I am 30 years old."],
    formation: [
      "Afirmativa: I am (I'm) · you/we/they are ('re) · he/she/it is ('s).",
      "Negativa: I am not · isn't · aren't.",
      "Pregunta: invierte verbo y sujeto: Are you ready? Is it far?",
    ],
    commonMistakes: [
      { wrong: "I have 25 years.", right: "I am 25 years old.", why: "La edad se expresa con be, no con have." },
      { wrong: "Is very cold today.", right: "It is very cold today.", why: "El inglés necesita sujeto: para el tiempo y la hora se usa it." },
      { wrong: "She are my sister.", right: "She is my sister.", why: "He/she/it van con is." },
    ],
    examples: [
      { text: "We are from Mexico.", translation: es("Somos de México.") },
      { text: "Is the museum open today?", translation: es("¿Está abierto el museo hoy?") },
    ],
    contrasts: [{ a: "I am cold.", b: "I have a cold.", explanation: "«Tengo frío» usa be; «tengo un resfriado» usa have." }],
    exercises: [
      { type: "mc", prompt: "My parents ___ at work.", options: ["are", "is", "am", "be"], answers: ["are"], explanation: "Plural (they) → are." },
      { type: "mc", prompt: "___ you hungry?", options: ["Are", "Is", "Do", "Have"], answers: ["Are"], explanation: "Estado (hambre) con be; la pregunta invierte: Are you…?" },
      { type: "fill", prompt: "It ___ ten o'clock.", answers: ["is", "'s"], explanation: "La hora con it is." },
      { type: "correct", prompt: "I have 40 years.", answers: ["I am 40 years old.", "I'm 40 years old.", "I am 40.", "I'm 40."], explanation: "La edad se dice con be." },
    ],
  },
  {
    id: "en:g:present-simple-do",
    language: "en",
    title: "Presente simple: negación y preguntas con do/does",
    cefr: "A1",
    errorCategory: "en:do-support",
    summary:
      "Para negar o preguntar en presente simple se usa el auxiliar do (does con he/she/it). El verbo principal queda en su forma base: She doesn't like coffee (no «doesn't likes»).",
    whenToUse: ["Rutinas y hechos: Do you work on Saturdays?", "Gustos: He doesn't eat meat."],
    formation: [
      "Negativa: I/you/we/they don't + verbo · he/she/it doesn't + verbo.",
      "Pregunta: Do/Does + sujeto + verbo: Does she speak French?",
      "Respuestas cortas: Yes, I do. / No, she doesn't.",
    ],
    commonMistakes: [
      { wrong: "She don't like cats.", right: "She doesn't like cats.", why: "Con she se usa does(n't)." },
      { wrong: "Does he works here?", right: "Does he work here?", why: "La -s ya está en does; el verbo va en forma base." },
      { wrong: "You like pizza?", right: "Do you like pizza?", why: "En inglés la pregunta necesita do (en español basta la entonación)." },
    ],
    examples: [
      { text: "Do you live near here?", translation: es("¿Vives cerca de aquí?") },
      { text: "My brother doesn't drive.", translation: es("Mi hermano no maneja.") },
    ],
    contrasts: [{ a: "Are you happy?", b: "Do you like it?", explanation: "Con be se invierte el verbo; con cualquier otro verbo se usa do." }],
    exercises: [
      { type: "mc", prompt: "___ your sister live in Madrid?", options: ["Does", "Do", "Is", "Has"], answers: ["Does"], explanation: "Your sister = she → does." },
      { type: "mc", prompt: "I ___ understand this word.", options: ["don't", "doesn't", "not", "am not"], answers: ["don't"], explanation: "I → don't + verbo." },
      { type: "fill", prompt: "He doesn't ___ coffee. (drink)", answers: ["drink"], explanation: "Tras doesn't, forma base sin -s." },
      { type: "correct", prompt: "Does she speaks English?", answers: ["Does she speak English?"], explanation: "Does + forma base." },
    ],
  },
  {
    id: "en:g:there-is",
    language: "en",
    title: "There is / there are (hay)",
    cefr: "A1",
    errorCategory: "en:there-is",
    summary:
      "«Hay» se dice there is (singular o incontable) y there are (plural). Nunca se usa have para «hay».",
    whenToUse: ["Describir lugares: There is a bank on the corner.", "Cantidades: There are three bedrooms."],
    formation: [
      "Singular: There is (There's) a park.",
      "Plural: There are two parks.",
      "Negativa: There isn't / There aren't any… · Pregunta: Is there…? Are there…?",
    ],
    commonMistakes: [
      { wrong: "Have many people here.", right: "There are many people here.", why: "«Hay» = there is/are, no have." },
      { wrong: "There is two cars.", right: "There are two cars.", why: "Plural → there are." },
    ],
    examples: [
      { text: "Is there a pharmacy near here?", translation: es("¿Hay una farmacia cerca?") },
      { text: "There aren't any tickets left.", translation: es("No quedan entradas.") },
    ],
    contrasts: [{ a: "There is a cat in the garden.", b: "The cat is in the garden.", explanation: "There is presenta algo nuevo; con the hablamos de algo ya conocido." }],
    exercises: [
      { type: "mc", prompt: "___ a problem with my room.", options: ["There is", "There are", "It has", "Have"], answers: ["There is"], explanation: "Singular → there is." },
      { type: "mc", prompt: "___ any eggs in the fridge?", options: ["Are there", "Is there", "Have", "There are"], answers: ["Are there"], explanation: "Plural en pregunta → Are there…?" },
      { type: "fill", prompt: "There ___ five people in my family.", answers: ["are"], explanation: "Plural → are." },
      { type: "correct", prompt: "There is many restaurants in this street.", answers: ["There are many restaurants in this street.", "There are many restaurants on this street."], explanation: "Plural → there are." },
    ],
  },
  {
    id: "en:g:present-continuous",
    language: "en",
    title: "Presente continuo vs. presente simple",
    cefr: "A2",
    errorCategory: "en:continuous",
    summary:
      "El presente continuo (am/is/are + -ing) es para lo que pasa ahora o es temporal; el presente simple, para hábitos y verdades generales. Algunos verbos de estado (know, like, want) casi nunca van en continuo.",
    whenToUse: ["Ahora mismo: I'm cooking.", "Temporal: She's living with her parents this month.", "Planes cercanos: We're meeting at six."],
    formation: ["be + verbo-ing: They are waiting.", "Negativa: I'm not working today.", "Pregunta: Are you listening?"],
    commonMistakes: [
      { wrong: "I am knowing the answer.", right: "I know the answer.", why: "Know es un verbo de estado: presente simple." },
      { wrong: "Look! It rains.", right: "Look! It's raining.", why: "Lo que ocurre ahora mismo va en continuo." },
    ],
    examples: [
      { text: "What are you doing this weekend?", translation: es("¿Qué vas a hacer este fin de semana?") },
      { text: "He usually walks to work, but today he's taking the bus.", translation: es("Normalmente va andando al trabajo, pero hoy toma el autobús.") },
    ],
    contrasts: [{ a: "I work in a bank.", b: "I'm working from home this week.", explanation: "Trabajo habitual frente a situación temporal." }],
    exercises: [
      { type: "mc", prompt: "Be quiet! The baby ___.", options: ["is sleeping", "sleeps", "sleep", "sleeping"], answers: ["is sleeping"], explanation: "Ahora mismo → continuo." },
      { type: "mc", prompt: "She ___ three languages.", options: ["speaks", "is speaking", "speak", "are speaking"], answers: ["speaks"], explanation: "Capacidad/hecho general → simple." },
      { type: "fill", prompt: "We ___ dinner right now. (have)", answers: ["are having", "'re having"], explanation: "Right now → are having." },
      { type: "correct", prompt: "I am wanting a coffee.", answers: ["I want a coffee.", "I'd like a coffee."], explanation: "Want no va en continuo." },
    ],
  },
  {
    id: "en:g:comparatives",
    language: "en",
    title: "Comparativos y superlativos",
    cefr: "A2",
    errorCategory: "en:comparatives",
    summary:
      "Adjetivos cortos: -er / the -est (cheap, cheaper, the cheapest). Largos: more / the most (expensive, more expensive, the most expensive). Irregulares: good-better-best, bad-worse-worst.",
    whenToUse: ["Comparar dos cosas: This hotel is cheaper than that one.", "Destacar una entre varias: It's the best pizza in town."],
    formation: [
      "Corto: tall → taller than → the tallest. Termina en -y: happy → happier.",
      "Largo: interesting → more interesting → the most interesting.",
      "Igualdad: as + adjetivo + as: as fast as.",
    ],
    commonMistakes: [
      { wrong: "She is more tall than me.", right: "She is taller than me.", why: "Adjetivo corto → -er." },
      { wrong: "This is the more beautiful city.", right: "This is the most beautiful city.", why: "Superlativo → the most." },
      { wrong: "My English is more good now.", right: "My English is better now.", why: "Good es irregular: better." },
    ],
    examples: [
      { text: "Trains are faster than buses.", translation: es("Los trenes son más rápidos que los autobuses.") },
      { text: "It was the worst day of my life.", translation: es("Fue el peor día de mi vida.") },
    ],
    contrasts: [{ a: "It's cheaper than yours.", b: "It's the cheapest in the shop.", explanation: "Comparativo (entre dos) frente a superlativo (el que más de todos)." }],
    exercises: [
      { type: "mc", prompt: "Today is ___ than yesterday.", options: ["hotter", "more hot", "hottest", "the hotter"], answers: ["hotter"], explanation: "Hot → hotter (dobla la t)." },
      { type: "mc", prompt: "This is ___ book I've ever read.", options: ["the best", "the better", "the most good", "best"], answers: ["the best"], explanation: "Good → the best." },
      { type: "fill", prompt: "Spanish is ___ difficult than Chinese for me. (less/more)", answers: ["less"], explanation: "Less + adjetivo largo = menos." },
      { type: "correct", prompt: "He is more old than his wife.", answers: ["He is older than his wife.", "He's older than his wife."], explanation: "Old → older." },
    ],
  },
  {
    id: "en:g:future-will-going-to",
    language: "en",
    title: "Futuro: will vs. going to",
    cefr: "A2",
    errorCategory: "en:future",
    summary:
      "Going to expresa planes ya decididos y predicciones con evidencia; will, decisiones del momento, promesas y predicciones de opinión. Para citas acordadas se usa también el presente continuo.",
    whenToUse: ["Plan: I'm going to study medicine.", "Decisión espontánea: I'll help you!", "Evidencia: Look at those clouds — it's going to rain."],
    formation: ["will + verbo base (I'll call you).", "am/is/are going to + verbo base.", "Negativa: won't · isn't going to."],
    commonMistakes: [
      { wrong: "I will to call you tomorrow.", right: "I will call you tomorrow.", why: "Tras will, verbo sin to." },
      { wrong: "The phone is ringing. I'm going to answer it!", right: "The phone is ringing. I'll answer it!", why: "Decisión en el momento → will." },
    ],
    examples: [
      { text: "We're going to visit my grandparents in May.", translation: es("Vamos a visitar a mis abuelos en mayo.") },
      { text: "Don't worry, I won't tell anyone.", translation: es("Tranquilo, no se lo diré a nadie.") },
    ],
    contrasts: [{ a: "I'll have the fish, please.", b: "I'm going to have fish tonight.", explanation: "Decisión al pedir frente a plan previo." }],
    exercises: [
      { type: "mc", prompt: "I've decided: I ___ learn to drive this year.", options: ["am going to", "will to", "going", "am"], answers: ["am going to"], explanation: "Decisión previa → going to." },
      { type: "mc", prompt: "It's cold in here. — OK, I ___ close the window.", options: ["'ll", "'m going to", "go to", "close"], answers: ["'ll"], explanation: "Decisión espontánea → will." },
      { type: "fill", prompt: "I promise I ___ be late. (negativa de will)", answers: ["won't", "will not"], explanation: "Promesa negativa → won't." },
      { type: "correct", prompt: "She will to travel next summer.", answers: ["She will travel next summer.", "She is going to travel next summer."], explanation: "Will + verbo sin to." },
    ],
  },
  {
    id: "en:g:countable",
    language: "en",
    title: "Contables e incontables: much, many, some, any",
    cefr: "A2",
    errorCategory: "en:quantifiers",
    summary:
      "Many va con plurales contables (many books); much, con incontables (much money). Some en afirmativas y ofrecimientos; any en negativas y preguntas. Palabras como information, advice, news o furniture son incontables en inglés.",
    whenToUse: ["Cantidades: How many people? How much time?", "Negativas: I don't have any money."],
    formation: ["many / a few + plural · much / a little + incontable.", "a lot of: con ambos.", "some (afirmativa) · any (negativa y pregunta)."],
    commonMistakes: [
      { wrong: "Can you give me an information?", right: "Can you give me some information?", why: "Information es incontable: sin a/an y sin plural." },
      { wrong: "How much people came?", right: "How many people came?", why: "People es contable plural → many." },
      { wrong: "I don't have some money.", right: "I don't have any money.", why: "En negativa → any." },
    ],
    examples: [
      { text: "There isn't much traffic today.", translation: es("Hoy no hay mucho tráfico.") },
      { text: "Would you like some tea?", translation: es("¿Quieres té?") },
    ],
    contrasts: [{ a: "a few friends (algunos)", b: "a little help (un poco de)", explanation: "A few con contables; a little con incontables." }],
    exercises: [
      { type: "mc", prompt: "How ___ water do you drink a day?", options: ["much", "many", "few", "any"], answers: ["much"], explanation: "Water es incontable → much." },
      { type: "mc", prompt: "She gave me some good ___.", options: ["advice", "advices", "an advice", "advise"], answers: ["advice"], explanation: "Advice es incontable." },
      { type: "fill", prompt: "Are there ___ questions? (some/any)", answers: ["any"], explanation: "En preguntas generales → any." },
      { type: "correct", prompt: "I need an information about the course.", answers: ["I need some information about the course.", "I need information about the course."], explanation: "Information no lleva an." },
    ],
  },
  {
    id: "en:g:used-to",
    language: "en",
    title: "Used to: hábitos del pasado",
    cefr: "A2",
    errorCategory: "en:used-to",
    summary:
      "Used to + verbo describe hábitos o estados del pasado que ya no ocurren (equivale a nuestro imperfecto «solía»). En negativa y pregunta pierde la d: didn't use to, did you use to…?",
    whenToUse: ["Hábitos antiguos: I used to play football every day.", "Estados pasados: There used to be a cinema here."],
    formation: ["Afirmativa: used to + verbo base.", "Negativa: didn't use to + verbo.", "Pregunta: Did you use to…?"],
    commonMistakes: [
      { wrong: "I use to live in Lima.", right: "I used to live in Lima.", why: "En afirmativa pasada es used to." },
      { wrong: "I usually went to the beach as a child and now too.", right: "I usually go to the beach.", why: "Used to/usually past sólo para lo que ya no pasa; el hábito actual va en presente." },
    ],
    examples: [
      { text: "My grandmother used to tell us stories.", translation: es("Mi abuela nos contaba historias.") },
      { text: "Did you use to have long hair?", translation: es("¿Tenías el pelo largo?") },
    ],
    contrasts: [{ a: "I used to smoke.", b: "I'm used to working at night.", explanation: "Used to = hábito pasado; be used to + -ing = estar acostumbrado." }],
    exercises: [
      { type: "mc", prompt: "We ___ live in a small village.", options: ["used to", "use to", "were use to", "using to"], answers: ["used to"], explanation: "Hábito pasado → used to." },
      { type: "mc", prompt: "Did you ___ play an instrument?", options: ["use to", "used to", "using to", "uses to"], answers: ["use to"], explanation: "En pregunta con did → use to." },
      { type: "fill", prompt: "He didn't ___ to like vegetables.", answers: ["use"], explanation: "Didn't use to." },
      { type: "correct", prompt: "I use to go running when I was young.", answers: ["I used to go running when I was young."], explanation: "Afirmativa pasada → used to." },
    ],
  },
  {
    id: "en:g:obligation-modals",
    language: "en",
    title: "Obligación y consejo: must, have to, should",
    cefr: "B1",
    errorCategory: "en:obligation",
    summary:
      "Must expresa una obligación que siente quien habla o una norma escrita; have to, una obligación externa. Mustn't es prohibición, pero don't have to significa «no hace falta». Should es consejo.",
    whenToUse: ["Normas: You must wear a seatbelt.", "Obligación externa: I have to work on Saturday.", "Consejo: You should see a doctor."],
    formation: ["must / should + verbo base (sin to).", "have to / has to / had to + verbo.", "mustn't (prohibido) · don't have to (no es necesario)."],
    commonMistakes: [
      { wrong: "You must to be careful.", right: "You must be careful.", why: "Must y should van sin to." },
      { wrong: "You mustn't come if you're busy.", right: "You don't have to come if you're busy.", why: "«No hace falta» es don't have to; mustn't significa prohibido." },
    ],
    examples: [
      { text: "You shouldn't eat so much sugar.", translation: es("No deberías comer tanta azúcar.") },
      { text: "We had to wait two hours.", translation: es("Tuvimos que esperar dos horas.") },
    ],
    contrasts: [{ a: "You mustn't park here.", b: "You don't have to pay; it's free.", explanation: "Prohibición frente a ausencia de obligación." }],
    exercises: [
      { type: "mc", prompt: "It's free, so you ___ pay.", options: ["don't have to", "mustn't", "must", "should"], answers: ["don't have to"], explanation: "No es necesario → don't have to." },
      { type: "mc", prompt: "You look tired. You ___ go to bed.", options: ["should", "must to", "have", "ought"], answers: ["should"], explanation: "Consejo → should." },
      { type: "fill", prompt: "Yesterday I ___ to get up at 5. (have)", answers: ["had"], explanation: "Pasado de have to → had to." },
      { type: "correct", prompt: "You should to call her.", answers: ["You should call her."], explanation: "Should sin to." },
    ],
  },
  {
    id: "en:g:past-perfect",
    language: "en",
    title: "Past perfect: el pasado del pasado",
    cefr: "B1",
    errorCategory: "en:past-perfect",
    summary:
      "Had + participio indica que una acción ocurrió antes que otra acción pasada. Equivale al pluscuamperfecto español (había llegado).",
    whenToUse: ["Secuencia en el pasado: When I arrived, the film had started.", "Explicar causas: She was nervous because she hadn't studied."],
    formation: ["had + participio (I had eaten).", "Negativa: hadn't + participio.", "Pregunta: Had you been there before?"],
    commonMistakes: [
      { wrong: "When we got there, the train already left.", right: "When we got there, the train had already left.", why: "Lo anterior a otro pasado → past perfect." },
      { wrong: "I had went there before.", right: "I had gone there before.", why: "Se necesita el participio: gone." },
    ],
    examples: [
      { text: "I had never seen snow before that trip.", translation: es("Nunca había visto nieve antes de ese viaje.") },
      { text: "By the time she called, I had already left.", translation: es("Cuando llamó, yo ya me había ido.") },
    ],
    contrasts: [{ a: "When I arrived, they left.", b: "When I arrived, they had left.", explanation: "Se fueron al llegar yo / ya se habían ido antes." }],
    exercises: [
      { type: "mc", prompt: "I couldn't pay because I ___ my wallet.", options: ["had lost", "have lost", "lost had", "was lose"], answers: ["had lost"], explanation: "Perdió la cartera antes → had lost." },
      { type: "mc", prompt: "She ___ the film before, so she didn't want to see it.", options: ["had seen", "has seen", "saw had", "was seen"], answers: ["had seen"], explanation: "Anterior a otro pasado." },
      { type: "fill", prompt: "They ___ already eaten when we arrived.", answers: ["had"], explanation: "Had + participio." },
      { type: "correct", prompt: "When I woke up, everyone already went out.", answers: ["When I woke up, everyone had already gone out."], explanation: "Anterior a despertarme → had gone." },
    ],
  },
  {
    id: "en:g:wish",
    language: "en",
    title: "Wish / if only: deseos y lamentos",
    cefr: "B2",
    errorCategory: "en:wish",
    summary:
      "Wish + pasado expresa deseos sobre el presente (I wish I had more time = ojalá tuviera). Wish + past perfect, lamentos sobre el pasado (I wish I had studied = ojalá hubiera estudiado). Wish + would, quejas sobre lo que hace otro.",
    whenToUse: ["Presente irreal: I wish I spoke French.", "Pasado: If only I hadn't said that!", "Queja: I wish you would listen."],
    formation: ["wish + pasado simple (were para todas las personas en registro cuidado).", "wish + had + participio.", "wish + someone + would + verbo."],
    commonMistakes: [
      { wrong: "I wish I have a car.", right: "I wish I had a car.", why: "Deseo sobre el presente → pasado." },
      { wrong: "I wish I didn't go to that party.", right: "I wish I hadn't gone to that party.", why: "Lamento sobre el pasado → past perfect." },
    ],
    examples: [
      { text: "I wish I could come with you.", translation: es("Ojalá pudiera ir contigo.") },
      { text: "If only we had left earlier!", translation: es("¡Ojalá hubiéramos salido antes!") },
    ],
    contrasts: [{ a: "I wish I knew.", b: "I wish I had known.", explanation: "Ojalá lo supiera (ahora) / ojalá lo hubiera sabido (antes)." }],
    exercises: [
      { type: "mc", prompt: "I wish I ___ taller.", options: ["were", "am", "be", "will be"], answers: ["were"], explanation: "Presente irreal → were." },
      { type: "mc", prompt: "She wishes she ___ that email.", options: ["hadn't sent", "didn't send", "doesn't send", "won't send"], answers: ["hadn't sent"], explanation: "Lamento sobre el pasado → hadn't sent." },
      { type: "fill", prompt: "I wish you ___ stop interrupting me!", answers: ["would"], explanation: "Queja sobre otra persona → would." },
      { type: "correct", prompt: "I wish I have more free time.", answers: ["I wish I had more free time."], explanation: "Wish + pasado." },
    ],
  },
  {
    id: "en:g:causative",
    language: "en",
    title: "Causativa: have/get something done",
    cefr: "B2",
    errorCategory: "en:causative",
    summary:
      "Para decir que otra persona hace algo por nosotros (normalmente un servicio) se usa have/get + objeto + participio. «Me corté el pelo» en la peluquería es I had my hair cut.",
    whenToUse: ["Servicios: I'm having my car repaired.", "Algo que nos pasa: She had her phone stolen."],
    formation: ["have + objeto + participio (más formal).", "get + objeto + participio (más coloquial).", "Cualquier tiempo: I'll get it fixed · I've had it cleaned."],
    commonMistakes: [
      { wrong: "I cut my hair yesterday (en la peluquería).", right: "I had my hair cut yesterday.", why: "Si lo hizo otra persona, causativa." },
      { wrong: "We had painted the house by a professional.", right: "We had the house painted by a professional.", why: "El objeto va entre have y el participio." },
    ],
    examples: [
      { text: "Where do you get your glasses made?", translation: es("¿Dónde te hacen las gafas?") },
      { text: "We need to have the roof checked.", translation: es("Tenemos que hacer revisar el tejado.") },
    ],
    contrasts: [{ a: "I repaired my bike.", b: "I had my bike repaired.", explanation: "Lo hice yo / me lo hicieron." }],
    exercises: [
      { type: "mc", prompt: "She ___ her nails done every month.", options: ["has", "does", "makes", "is"], answers: ["has"], explanation: "Have + objeto + participio." },
      { type: "mc", prompt: "I need to get my passport ___.", options: ["renewed", "renew", "renewing", "to renew"], answers: ["renewed"], explanation: "Get + objeto + participio." },
      { type: "fill", prompt: "We had our kitchen ___ last year. (paint)", answers: ["painted"], explanation: "Participio: painted." },
      { type: "correct", prompt: "I had cut my hair at the new salon.", answers: ["I had my hair cut at the new salon.", "I got my hair cut at the new salon."], explanation: "Have + my hair + cut." },
    ],
  },
  {
    id: "en:g:inversion",
    language: "en",
    title: "Inversión enfática: Never have I…",
    cefr: "C1",
    errorCategory: "en:inversion",
    summary:
      "En registro formal o enfático, algunas expresiones negativas o restrictivas al inicio de la frase provocan inversión como en una pregunta: Never have I seen such a mess. Not only did she win, but she also broke the record.",
    whenToUse: ["Discursos y textos formales.", "Énfasis: Rarely do we get such an opportunity."],
    formation: [
      "Never / Rarely / Seldom + auxiliar + sujeto + verbo.",
      "Not only + auxiliar + sujeto …, but (also)…",
      "No sooner had + sujeto + participio … than … · Hardly had … when …",
    ],
    commonMistakes: [
      { wrong: "Never I have seen this before.", right: "Never have I seen this before.", why: "Tras never inicial, auxiliar antes del sujeto." },
      { wrong: "Not only she speaks French, but also German.", right: "Not only does she speak French, but also German.", why: "Presente simple → does + sujeto + verbo base." },
    ],
    examples: [
      { text: "Rarely have I felt so welcome.", translation: es("Pocas veces me he sentido tan bien recibido.") },
      { text: "No sooner had we arrived than it started to rain.", translation: es("Apenas llegamos, empezó a llover.") },
    ],
    contrasts: [{ a: "I have never seen such beauty.", b: "Never have I seen such beauty.", explanation: "Neutra frente a enfática/formal (mismo significado)." }],
    exercises: [
      { type: "mc", prompt: "Seldom ___ such a good film.", options: ["have I seen", "I have seen", "I saw", "did I saw"], answers: ["have I seen"], explanation: "Seldom inicial → inversión." },
      { type: "mc", prompt: "Not only ___ late, but he also forgot the tickets.", options: ["was he", "he was", "he is", "did he was"], answers: ["was he"], explanation: "Not only + was + sujeto." },
      { type: "fill", prompt: "No sooner ___ I sat down than the phone rang.", answers: ["had"], explanation: "No sooner had + sujeto + participio." },
      { type: "correct", prompt: "Never I have been so happy.", answers: ["Never have I been so happy."], explanation: "Inversión: have I." },
    ],
  },
  {
    id: "en:g:cleft",
    language: "en",
    title: "Oraciones escindidas: It was… that / What I need is…",
    cefr: "C1",
    errorCategory: "en:cleft",
    summary:
      "Para destacar una parte de la frase se «parte» en dos: It was Maria who called (fue María quien llamó) o What I love is the sea (lo que me encanta es el mar). Son muy naturales en la conversación y la escritura cuidada.",
    whenToUse: ["Corregir o contrastar: It wasn't me that broke it, it was Tom.", "Destacar: What surprised me was the price."],
    formation: ["It + be + elemento destacado + that/who + resto.", "What + sujeto + verbo + be + elemento destacado.", "All I want is… (lo único que…)."],
    commonMistakes: [
      { wrong: "The thing what I need is time.", right: "What I need is time.", why: "What ya significa «lo que»; no se combina con the thing." },
      { wrong: "Was Maria who called.", right: "It was Maria who called.", why: "Necesita el sujeto it." },
    ],
    examples: [
      { text: "What I really need is a holiday.", translation: es("Lo que de verdad necesito son unas vacaciones.") },
      { text: "It was in Paris that they met.", translation: es("Fue en París donde se conocieron.") },
    ],
    contrasts: [{ a: "I need a break.", b: "What I need is a break.", explanation: "Neutra frente a destacada." }],
    exercises: [
      { type: "mc", prompt: "___ was the noise that woke me up.", options: ["It", "What", "That", "There"], answers: ["It"], explanation: "It + was + elemento + that." },
      { type: "mc", prompt: "___ I don't understand is why he left.", options: ["What", "That", "Which", "It"], answers: ["What"], explanation: "What + sujeto + verbo…" },
      { type: "fill", prompt: "All I want ___ some peace and quiet.", answers: ["is"], explanation: "All I want is…" },
      { type: "correct", prompt: "Was my brother who told me.", answers: ["It was my brother who told me.", "It was my brother that told me."], explanation: "Falta it." },
    ],
  },
];
