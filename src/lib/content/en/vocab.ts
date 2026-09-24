import type { CefrLevel, PartOfSpeech, Register, VocabItem } from "../types";

/**
 * Vocabulario semilla de inglés (IPA en inglés americano general).
 * Cada palabra se enseña en contexto: ≥ 1 ejemplo con traducción.
 * Revisión humana recomendada antes de ampliar (ver docs/CONTENT_PIPELINE.md).
 */
type Ex = [text: string, es: string];

function v(
  slug: string,
  lemma: string,
  pos: PartOfSpeech,
  cefr: CefrLevel,
  frequencyBand: VocabItem["frequencyBand"],
  ipa: string,
  es: string[],
  examples: Ex[],
  topics: string[],
  extra: { usageNote?: string; register?: Register; synonyms?: string[]; antonyms?: string[] } = {},
): VocabItem {
  return {
    id: `en:w:${slug}`,
    language: "en",
    lemma,
    pos,
    cefr,
    frequencyBand,
    ipa,
    translations: { es },
    examples: examples.map(([text, t]) => ({ text, translation: { es: t } })),
    topics,
    register: extra.register ?? "neutral",
    usageNote: extra.usageNote,
    synonyms: extra.synonyms,
    antonyms: extra.antonyms,
  };
}

export const EN_VOCAB: VocabItem[] = [
  // ── Vida diaria (A1–A2)
  v("house", "house", "noun", "A1", 1, "/haʊs/", ["casa"], [["They live in a small house near the park.", "Viven en una casa pequeña cerca del parque."]], ["everyday"], {
    usageNote: "'house' es el edificio; 'home' es tu hogar. Se dice 'at home', no 'at house'.",
  }),
  v("home", "home", "noun", "A1", 1, "/hoʊm/", ["casa", "hogar"], [["I left my keys at home.", "Dejé mis llaves en casa."], ["Let's go home.", "Vámonos a casa."]], ["everyday"], {
    usageNote: "Con verbos de movimiento no lleva 'to': 'go home', no 'go to home'.",
  }),
  v("water", "water", "noun", "A1", 1, "/ˈwɔːtər/", ["agua"], [["Can I have a glass of water, please?", "¿Me das un vaso de agua, por favor?"]], ["everyday", "food"]),
  v("friend", "friend", "noun", "A1", 1, "/frɛnd/", ["amigo", "amiga"], [["My best friend lives in Canada.", "Mi mejor amigo vive en Canadá."]], ["everyday"]),
  v("work", "work", "verb", "A1", 1, "/wɜːrk/", ["trabajar", "funcionar"], [["I work from home on Fridays.", "Trabajo desde casa los viernes."], ["The new version doesn't work.", "La nueva versión no funciona."]], ["everyday", "work"]),
  v("eat", "eat", "verb", "A1", 1, "/iːt/", ["comer"], [["We usually eat dinner at eight.", "Normalmente cenamos a las ocho."]], ["everyday", "food"]),
  v("happy", "happy", "adjective", "A1", 1, "/ˈhæpi/", ["feliz", "contento"], [["She looks happy today.", "Hoy se ve feliz."]], ["feelings"], { antonyms: ["sad"] }),
  v("tired", "tired", "adjective", "A1", 2, "/ˈtaɪərd/", ["cansado"], [["I'm too tired to go out tonight.", "Estoy demasiado cansado para salir esta noche."]], ["feelings", "everyday"]),
  v("morning", "morning", "noun", "A1", 1, "/ˈmɔːrnɪŋ/", ["mañana (parte del día)"], [["I drink coffee every morning.", "Tomo café todas las mañanas."]], ["everyday"], {
    usageNote: "'morning' es la parte del día; 'tomorrow' es el día siguiente.",
  }),
  v("buy", "buy", "verb", "A1", 1, "/baɪ/", ["comprar"], [["I need to buy some bread.", "Necesito comprar pan."]], ["everyday"]),
  v("always", "always", "adverb", "A1", 1, "/ˈɔːlweɪz/", ["siempre"], [["She always arrives on time.", "Ella siempre llega a tiempo."]], ["everyday"], {
    usageNote: "Va antes del verbo principal ('she always arrives') pero después de 'to be' ('she is always late').",
  }),
  v("because", "because", "conjunction", "A1", 1, "/bɪˈkʌz/", ["porque"], [["I stayed home because it was raining.", "Me quedé en casa porque estaba lloviendo."]], ["connectors"]),
  v("breakfast", "breakfast", "noun", "A1", 2, "/ˈbrɛkfəst/", ["desayuno"], [["I never skip breakfast.", "Nunca me salto el desayuno."]], ["food", "everyday"]),
  v("expensive", "expensive", "adjective", "A1", 2, "/ɪkˈspɛnsɪv/", ["caro"], [["This phone is too expensive.", "Este teléfono es demasiado caro."]], ["everyday", "travel"], { antonyms: ["cheap"] }),
  v("cheap", "cheap", "adjective", "A1", 2, "/tʃiːp/", ["barato"], [["The hostel was cheap but clean.", "El hostal era barato pero limpio."]], ["everyday", "travel"], { antonyms: ["expensive"] }),
  v("years-old", "years old", "phrase", "A1", 1, "/jɪrz oʊld/", ["años (de edad)"], [["I am 20 years old.", "Tengo 20 años."]], ["everyday"], {
    usageNote: "La edad se dice con 'to be', no con 'have': ✗ I have 20 years → ✓ I am 20 years old. Es un calco del español muy común.",
  }),
  v("level", "level", "noun", "A1", 1, "/ˈlɛvəl/", ["nivel"], [["I finally finished the last level.", "Por fin terminé el último nivel."]], ["gaming"]),

  // ── A2
  v("borrow", "borrow", "verb", "A2", 2, "/ˈbɑːroʊ/", ["pedir prestado"], [["Can I borrow your pen?", "¿Me prestas tu pluma? (lit. ¿Puedo pedir prestada tu pluma?)"]], ["everyday"], {
    usageNote: "'borrow' = recibir prestado; 'lend' = dar prestado. ✗ Can you borrow me…? → ✓ Can you lend me…?",
  }),
  v("lend", "lend", "verb", "A2", 2, "/lɛnd/", ["prestar"], [["Could you lend me ten dollars?", "¿Me podrías prestar diez dólares?"]], ["everyday"], {
    usageNote: "'lend' = dar prestado. Contrario de 'borrow'.",
  }),
  v("remember", "remember", "verb", "A2", 1, "/rɪˈmɛmbər/", ["recordar", "acordarse"], [["I don't remember his name.", "No recuerdo su nombre."]], ["everyday"], { antonyms: ["forget"] }),
  v("forget", "forget", "verb", "A2", 1, "/fərˈɡɛt/", ["olvidar"], [["Don't forget to call your mother.", "No olvides llamar a tu mamá."]], ["everyday"], { antonyms: ["remember"] }),
  v("library", "library", "noun", "A2", 2, "/ˈlaɪbrɛri/", ["biblioteca"], [["I study at the library after work.", "Estudio en la biblioteca después del trabajo."]], ["false-friends", "everyday"], {
    usageNote: "Falso amigo: 'library' es biblioteca. Librería se dice 'bookstore'.",
  }),
  v("weather", "weather", "noun", "A2", 1, "/ˈwɛðər/", ["clima", "tiempo (meteorológico)"], [["The weather is beautiful today.", "Hoy hace un tiempo precioso."]], ["everyday", "travel"], {
    usageNote: "No confundir con 'whether' (si, condicional), que se pronuncia igual.",
  }),
  v("trip", "trip", "noun", "A2", 2, "/trɪp/", ["viaje", "excursión"], [["We took a trip to the mountains.", "Hicimos un viaje a la montaña."]], ["travel"], {
    usageNote: "'trip' = viaje corto con ida y vuelta; 'journey' = el trayecto en sí; 'travel' suele ser verbo o sustantivo incontable.",
  }),
  v("goal", "goal", "noun", "A2", 1, "/ɡoʊl/", ["meta", "objetivo", "gol"], [["My goal is to reach B2 this year.", "Mi meta es llegar a B2 este año."]], ["work", "everyday"]),
  v("enough", "enough", "determiner", "A2", 1, "/ɪˈnʌf/", ["suficiente", "bastante"], [["We don't have enough time.", "No tenemos suficiente tiempo."], ["Is it big enough?", "¿Es lo bastante grande?"]], ["everyday"], {
    usageNote: "Antes del sustantivo ('enough time') pero después del adjetivo ('big enough').",
  }),
  v("usually", "usually", "adverb", "A2", 1, "/ˈjuːʒuəli/", ["normalmente", "por lo general"], [["I usually wake up at seven.", "Normalmente me despierto a las siete."]], ["everyday"]),
  v("meeting", "meeting", "noun", "A2", 1, "/ˈmiːtɪŋ/", ["reunión", "junta"], [["The meeting starts at ten.", "La junta empieza a las diez."]], ["work"]),
  v("bug", "bug", "noun", "A2", 2, "/bʌɡ/", ["error (de software)", "bicho"], [["I found a bug in the login page.", "Encontré un error en la página de inicio de sesión."]], ["tech"]),
  v("teammate", "teammate", "noun", "A2", 3, "/ˈtiːmmeɪt/", ["compañero de equipo"], [["My teammate saved me in the last round.", "Mi compañero de equipo me salvó en la última ronda."]], ["gaming", "work"]),
  v("luggage", "luggage", "noun", "A2", 3, "/ˈlʌɡɪdʒ/", ["equipaje"], [["My luggage didn't arrive.", "Mi equipaje no llegó."]], ["travel"], {
    usageNote: "Incontable: ✗ two luggages → ✓ two pieces of luggage / two bags.",
  }),
  v("spicy", "spicy", "adjective", "A2", 3, "/ˈspaɪsi/", ["picante"], [["Is this sauce very spicy?", "¿Esta salsa pica mucho?"]], ["food"]),
  v("recipe", "recipe", "noun", "A2", 3, "/ˈrɛsəpi/", ["receta (de cocina)"], [["This recipe is from my grandmother.", "Esta receta es de mi abuela."]], ["food"], {
    usageNote: "La receta médica se dice 'prescription'.",
  }),
  v("customer", "customer", "noun", "A2", 2, "/ˈkʌstəmər/", ["cliente"], [["The customer asked for a refund.", "El cliente pidió un reembolso."]], ["business", "work"]),
  v("muscle", "muscle", "noun", "A2", 3, "/ˈmʌsəl/", ["músculo"], [["Stretch the muscle slowly.", "Estira el músculo despacio."]], ["fitness"]),
  v("proud", "proud", "adjective", "A2", 2, "/praʊd/", ["orgulloso"], [["I'm proud of my progress.", "Estoy orgulloso de mi progreso."]], ["feelings"], {
    usageNote: "Se usa con 'of': proud of something/someone.",
  }),
  v("worried", "worried", "adjective", "A2", 2, "/ˈwɜːrid/", ["preocupado"], [["She is worried about the exam.", "Ella está preocupada por el examen."]], ["feelings"], {
    usageNote: "Se usa con 'about': worried about something.",
  }),
  v("excited", "excited", "adjective", "A2", 2, "/ɪkˈsaɪtɪd/", ["emocionado", "ilusionado"], [["We are excited about the trip.", "Estamos emocionados por el viaje."]], ["feelings"], {
    usageNote: "'excited' (emocionado) vs 'exciting' (emocionante). Evita 'I'm exciting'.",
  }),
  v("carpet", "carpet", "noun", "A2", 3, "/ˈkɑːrpɪt/", ["alfombra", "moqueta"], [["The cat is sleeping on the carpet.", "El gato está durmiendo en la alfombra."]], ["false-friends", "everyday"], {
    usageNote: "Falso amigo: 'carpet' es alfombra. Carpeta se dice 'folder'.",
  }),

  // ── B1
  v("although", "although", "conjunction", "B1", 2, "/ɔːlˈðoʊ/", ["aunque", "a pesar de que"], [["Although it was raining, we went outside.", "Aunque estaba lloviendo, salimos."]], ["connectors"], {
    usageNote: "Introduce una oración completa (sujeto + verbo). Con sustantivo usa 'despite'.",
    synonyms: ["though", "even though"],
  }),
  v("actually", "actually", "adverb", "B1", 1, "/ˈæktʃuəli/", ["en realidad", "de hecho"], [["I thought he was American, but actually he's Canadian.", "Pensé que era estadounidense, pero en realidad es canadiense."]], ["false-friends", "connectors"], {
    usageNote: "Falso amigo: NO significa 'actualmente'. Actualmente = 'currently' / 'nowadays'.",
  }),
  v("embarrassed", "embarrassed", "adjective", "B1", 3, "/ɪmˈbærəst/", ["avergonzado", "apenado"], [["I was so embarrassed when I forgot her name.", "Me dio muchísima pena cuando olvidé su nombre."]], ["false-friends", "feelings"], {
    usageNote: "Falso amigo clásico: NO significa 'embarazada' (= pregnant).",
  }),
  v("attend", "attend", "verb", "B1", 2, "/əˈtɛnd/", ["asistir a"], [["I attend a French class on Tuesdays.", "Asisto a una clase de francés los martes."]], ["false-friends", "work"], {
    usageNote: "'attend' = asistir (estar presente). 'assist' = ayudar. Sin preposición: attend a meeting (no 'attend to a meeting').",
  }),
  v("realize", "realize", "verb", "B1", 2, "/ˈriːəlaɪz/", ["darse cuenta"], [["I didn't realize it was so late.", "No me di cuenta de que era tan tarde."]], ["false-friends"], {
    usageNote: "Falso amigo: NO significa 'realizar' (= carry out, do).",
  }),
  v("journey", "journey", "noun", "B1", 2, "/ˈdʒɜːrni/", ["viaje", "trayecto"], [["The journey took six hours.", "El trayecto duró seis horas."]], ["travel"]),
  v("improve", "improve", "verb", "B1", 1, "/ɪmˈpruːv/", ["mejorar"], [["I want to improve my English.", "Quiero mejorar mi inglés."]], ["everyday", "work"]),
  v("achieve", "achieve", "verb", "B1", 2, "/əˈtʃiːv/", ["lograr", "alcanzar"], [["She wants to achieve her goal in six months.", "Quiere lograr su meta en seis meses."]], ["work"]),
  v("deadline", "deadline", "noun", "B1", 2, "/ˈdɛdlaɪn/", ["fecha límite", "plazo"], [["The deadline for the project is Friday.", "La fecha límite del proyecto es el viernes."]], ["work", "tech"]),
  v("schedule", "schedule", "noun", "B1", 2, "/ˈskɛdʒuːl/", ["horario", "agenda", "calendario"], [["Let me check my schedule.", "Déjame revisar mi agenda."]], ["work"]),
  v("skill", "skill", "noun", "B1", 1, "/skɪl/", ["habilidad", "destreza"], [["Communication is an important skill.", "La comunicación es una habilidad importante."]], ["work"]),
  v("however", "however", "adverb", "B1", 1, "/haʊˈɛvər/", ["sin embargo"], [["The plan is good. However, it is expensive.", "El plan es bueno. Sin embargo, es caro."]], ["connectors"]),
  v("challenge", "challenge", "noun", "B1", 2, "/ˈtʃælɪndʒ/", ["reto", "desafío"], [["Learning Japanese is a big challenge.", "Aprender japonés es un gran reto."]], ["everyday", "work"]),
  v("get-along", "get along with", "phrase", "B1", 2, "/ɡɛt əˈlɔːŋ wɪð/", ["llevarse bien con"], [["I get along with my coworkers.", "Me llevo bien con mis compañeros de trabajo."]], ["work", "everyday"]),
  v("look-forward", "look forward to", "phrase", "B1", 2, "/lʊk ˈfɔːrwərd tuː/", ["tener ganas de", "esperar con ilusión"], [["I look forward to hearing from you.", "Quedo en espera de su respuesta."]], ["work"], {
    usageNote: "'to' aquí es preposición: va seguido de -ing. ✗ look forward to hear → ✓ look forward to hearing.",
  }),
  v("give-up", "give up", "phrase", "B1", 1, "/ɡɪv ʌp/", ["rendirse", "dejar (un hábito)"], [["Don't give up on your dreams.", "No renuncies a tus sueños."]], ["everyday"]),
  v("figure-out", "figure out", "phrase", "B1", 2, "/ˈfɪɡjər aʊt/", ["averiguar", "descifrar", "entender"], [["I can't figure out this bug.", "No logro entender este error."]], ["tech", "everyday"]),
  v("run-out-of", "run out of", "phrase", "B1", 2, "/rʌn aʊt əv/", ["quedarse sin"], [["Did we run out of coffee?", "¿Nos quedamos sin café?"]], ["everyday"]),
  v("thought", "thought", "noun", "B1", 1, "/θɔːt/", ["pensamiento", "idea"], [["That's an interesting thought.", "Es una idea interesante."]], ["everyday"], {
    usageNote: "También es el pasado de 'think'. Ojo a la pronunciación: /θɔːt/, con TH sorda.",
  }),
  v("through", "through", "preposition", "B1", 1, "/θruː/", ["a través de", "por"], [["We walked through the park.", "Caminamos por el parque."]], ["everyday"], {
    usageNote: "No confundir: through /θruː/, though /ðoʊ/, thought /θɔːt/, tough /tʌf/.",
  }),
  v("debug", "debug", "verb", "B1", 3, "/diːˈbʌɡ/", ["depurar"], [["It took me two hours to debug this function.", "Me tomó dos horas depurar esta función."]], ["tech"], { register: "technical" }),
  v("commit", "commit", "noun", "B1", 3, "/kəˈmɪt/", ["commit", "confirmación de cambios"], [["Write a clear message for every commit.", "Escribe un mensaje claro en cada commit."]], ["tech"], {
    register: "technical",
    usageNote: "Fuera de la programación, 'commit' (verbo) significa comprometerse o cometer (un delito).",
  }),
  v("branch", "branch", "noun", "B1", 2, "/bræntʃ/", ["rama", "sucursal"], [["Create a new branch for each feature.", "Crea una rama nueva para cada funcionalidad."]], ["tech", "business"]),
  v("feature", "feature", "noun", "B1", 1, "/ˈfiːtʃər/", ["función", "característica"], [["The new feature will ship next week.", "La nueva función saldrá la próxima semana."]], ["tech"]),
  v("release", "release", "noun", "B1", 2, "/rɪˈliːs/", ["versión", "lanzamiento"], [["The next release includes dark mode.", "La próxima versión incluye modo oscuro."]], ["tech", "music"]),
  v("quest", "quest", "noun", "B1", 4, "/kwɛst/", ["misión", "búsqueda"], [["This quest takes about an hour.", "Esta misión toma como una hora."]], ["gaming"]),
  v("checkpoint", "checkpoint", "noun", "B1", 4, "/ˈtʃɛkpɔɪnt/", ["punto de control"], [["The game saves at every checkpoint.", "El juego guarda en cada punto de control."]], ["gaming"]),
  v("beat", "beat", "verb", "B1", 2, "/biːt/", ["vencer", "ganar a", "pasarse (un nivel)"], [["I can't beat the final boss.", "No puedo vencer al jefe final."]], ["gaming"]),
  v("craft", "craft", "verb", "B1", 3, "/kræft/", ["fabricar", "craftear"], [["You need wood to craft a table.", "Necesitas madera para fabricar una mesa."]], ["gaming"]),
  v("booking", "booking", "noun", "B1", 3, "/ˈbʊkɪŋ/", ["reservación", "reserva"], [["I made a booking for two nights.", "Hice una reservación para dos noches."]], ["travel"]),
  v("delay", "delay", "noun", "B1", 2, "/dɪˈleɪ/", ["retraso"], [["There was a two-hour delay at the airport.", "Hubo un retraso de dos horas en el aeropuerto."]], ["travel", "work"]),
  v("abroad", "abroad", "adverb", "B1", 3, "/əˈbrɔːd/", ["en el extranjero", "al extranjero"], [["I'd like to study abroad.", "Me gustaría estudiar en el extranjero."]], ["travel"], {
    usageNote: "Sin preposición: ✗ go to abroad → ✓ go abroad.",
  }),
  v("salary", "salary", "noun", "B1", 2, "/ˈsæləri/", ["sueldo", "salario"], [["The salary is paid every two weeks.", "El sueldo se paga cada dos semanas."]], ["business", "work"]),
  v("research", "research", "noun", "B1", 1, "/ˈriːsɜːrtʃ/", ["investigación"], [["Their research focuses on memory.", "Su investigación se centra en la memoria."]], ["science"], {
    usageNote: "Incontable: ✗ a research / researches → ✓ research, a study.",
  }),
  v("lyrics", "lyrics", "noun", "B1", 3, "/ˈlɪrɪks/", ["letra (de una canción)"], [["I love the lyrics of this song.", "Me encanta la letra de esta canción."]], ["music"]),
  v("workout", "workout", "noun", "B1", 3, "/ˈwɜːrkaʊt/", ["entrenamiento", "rutina de ejercicio"], [["Today's workout was really hard.", "El entrenamiento de hoy estuvo muy pesado."]], ["fitness"]),
  v("stretch", "stretch", "verb", "B1", 3, "/strɛtʃ/", ["estirar"], [["Always stretch before you run.", "Siempre estira antes de correr."]], ["fitness"]),

  // ── B2
  v("therefore", "therefore", "adverb", "B2", 2, "/ˈðɛrfɔːr/", ["por lo tanto", "por consiguiente"], [["He was sick; therefore, he stayed home.", "Estaba enfermo; por lo tanto, se quedó en casa."]], ["connectors"], { register: "formal" }),
  v("meanwhile", "meanwhile", "adverb", "B2", 3, "/ˈmiːnwaɪl/", ["mientras tanto"], [["Meanwhile, the others were waiting outside.", "Mientras tanto, los demás esperaban afuera."]], ["connectors"]),
  v("despite", "despite", "preposition", "B2", 2, "/dɪˈspaɪt/", ["a pesar de"], [["Despite the rain, the game continued.", "A pesar de la lluvia, el partido continuó."]], ["connectors"], {
    usageNote: "Va seguido de sustantivo o -ing, nunca de 'of': ✗ despite of → ✓ despite / in spite of.",
  }),
  v("reliable", "reliable", "adjective", "B2", 2, "/rɪˈlaɪəbəl/", ["confiable", "fiable"], [["We need a reliable internet connection.", "Necesitamos una conexión a internet confiable."]], ["tech", "work"]),
  v("turn-down", "turn down", "phrase", "B2", 2, "/tɜːrn daʊn/", ["rechazar", "bajar (el volumen)"], [["She decided to turn down the job offer.", "Decidió rechazar la oferta de trabajo."]], ["work"]),
  v("outcome", "outcome", "noun", "B2", 2, "/ˈaʊtkʌm/", ["resultado", "desenlace"], [["Nobody expected that outcome.", "Nadie esperaba ese resultado."]], ["business", "science"]),
  v("awareness", "awareness", "noun", "B2", 3, "/əˈwɛrnəs/", ["conciencia", "concienciación"], [["The campaign raised awareness about climate change.", "La campaña generó conciencia sobre el cambio climático."]], ["science"]),
  v("deploy", "deploy", "verb", "B2", 3, "/dɪˈplɔɪ/", ["desplegar", "publicar"], [["We deploy to production every Friday.", "Desplegamos a producción cada viernes."]], ["tech"], { register: "technical" }),
  v("repository", "repository", "noun", "B2", 4, "/rɪˈpɑːzətɔːri/", ["repositorio"], [["Clone the repository and install the dependencies.", "Clona el repositorio e instala las dependencias."]], ["tech"], { register: "technical" }),
  v("framework", "framework", "noun", "B2", 3, "/ˈfreɪmwɜːrk/", ["framework", "marco de trabajo"], [["Next.js is a popular React framework.", "Next.js es un framework popular de React."]], ["tech"], { register: "technical" }),
  v("dependency", "dependency", "noun", "B2", 3, "/dɪˈpɛndənsi/", ["dependencia"], [["Remove the unused dependency from the project.", "Quita la dependencia que no se usa del proyecto."]], ["tech"], { register: "technical" }),
  v("requirement", "requirement", "noun", "B2", 2, "/rɪˈkwaɪərmənt/", ["requisito"], [["Security is a key requirement for this app.", "La seguridad es un requisito clave para esta app."]], ["tech", "work"]),
  v("backlog", "backlog", "noun", "B2", 4, "/ˈbæklɔːɡ/", ["pendientes", "trabajo acumulado"], [["The backlog has more than fifty tasks.", "El backlog tiene más de cincuenta tareas."]], ["tech", "work"]),
  v("workaround", "workaround", "noun", "B2", 4, "/ˈwɜːrkəraʊnd/", ["solución provisional", "parche"], [["We found a workaround until the fix is ready.", "Encontramos una solución provisional hasta que esté lista la corrección."]], ["tech"]),
  v("respawn", "respawn", "verb", "B2", 5, "/ˌriːˈspɔːn/", ["reaparecer", "revivir"], [["You respawn at the last checkpoint.", "Reapareces en el último punto de control."]], ["gaming"], { register: "informal" }),
  v("negotiate", "negotiate", "verb", "B2", 2, "/nɪˈɡoʊʃieɪt/", ["negociar"], [["We need to negotiate a better price.", "Tenemos que negociar un mejor precio."]], ["business"]),
  v("evidence", "evidence", "noun", "B2", 2, "/ˈɛvɪdəns/", ["evidencia", "pruebas"], [["There is strong evidence that sleep helps memory.", "Hay pruebas sólidas de que dormir ayuda a la memoria."]], ["science"], {
    usageNote: "Incontable: ✗ an evidence → ✓ a piece of evidence.",
  }),
  v("tune", "tune", "noun", "B2", 3, "/tuːn/", ["melodía", "canción"], [["I can't get this tune out of my head.", "No me puedo sacar esta melodía de la cabeza."]], ["music"]),
  v("sensible", "sensible", "adjective", "B2", 3, "/ˈsɛnsəbəl/", ["sensato", "razonable"], [["That's a sensible decision.", "Es una decisión sensata."]], ["false-friends"], {
    usageNote: "Falso amigo: 'sensible' = sensato. Sensible (emocional) se dice 'sensitive'.",
  }),

  // ── C1–C2
  v("whereas", "whereas", "conjunction", "C1", 3, "/wɛrˈæz/", ["mientras que"], [["I like tea, whereas my wife prefers coffee.", "A mí me gusta el té, mientras que mi esposa prefiere el café."]], ["connectors"], { register: "formal" }),
  v("nevertheless", "nevertheless", "adverb", "C1", 3, "/ˌnɛvərðəˈlɛs/", ["no obstante", "aun así"], [["It was risky. Nevertheless, they decided to try.", "Era arriesgado. No obstante, decidieron intentarlo."]], ["connectors"], { register: "formal" }),
  v("thorough", "thorough", "adjective", "C1", 3, "/ˈθɜːroʊ/", ["minucioso", "exhaustivo"], [["She did a thorough review of the code.", "Hizo una revisión minuciosa del código."]], ["work", "tech"]),
  v("runtime", "runtime", "noun", "C1", 5, "/ˈrʌntaɪm/", ["tiempo de ejecución", "entorno de ejecución"], [["The error only happens at runtime.", "El error sólo ocurre en tiempo de ejecución."]], ["tech"], { register: "technical" }),
  v("troubleshoot", "troubleshoot", "verb", "C1", 4, "/ˈtrʌbəlʃuːt/", ["diagnosticar y resolver problemas"], [["Let's troubleshoot the network issue.", "Vamos a diagnosticar el problema de red."]], ["tech"]),
  v("enhance", "enhance", "verb", "C1", 3, "/ɪnˈhæns/", ["mejorar", "potenciar"], [["Good lighting can enhance your photos.", "Una buena iluminación puede mejorar tus fotos."]], ["tech", "work"]),
  v("overwhelming", "overwhelming", "adjective", "C1", 3, "/ˌoʊvərˈwɛlmɪŋ/", ["abrumador"], [["The amount of information was overwhelming.", "La cantidad de información era abrumadora."]], ["feelings"]),
  v("nuance", "nuance", "noun", "C1", 4, "/ˈnuːɑːns/", ["matiz"], [["Translation often loses nuance.", "La traducción a menudo pierde matices."]], ["connectors"]),
  v("revenue", "revenue", "noun", "C1", 3, "/ˈrɛvənuː/", ["ingresos"], [["The company's revenue grew by 20%.", "Los ingresos de la empresa crecieron un 20 %."]], ["business"]),
  v("stakeholder", "stakeholder", "noun", "C1", 4, "/ˈsteɪkhoʊldər/", ["parte interesada"], [["We presented the plan to every stakeholder.", "Presentamos el plan a cada parte interesada."]], ["business", "work"]),
  v("hypothesis", "hypothesis", "noun", "C1", 3, "/haɪˈpɑːθəsɪs/", ["hipótesis"], [["The data supports our hypothesis.", "Los datos respaldan nuestra hipótesis."]], ["science"]),
  v("ubiquitous", "ubiquitous", "adjective", "C2", 5, "/juːˈbɪkwɪtəs/", ["omnipresente", "ubicuo"], [["Smartphones have become ubiquitous.", "Los smartphones se han vuelto omnipresentes."]], ["tech"], { register: "formal" }),
  v("serendipity", "serendipity", "noun", "C2", 5, "/ˌsɛrənˈdɪpəti/", ["casualidad afortunada", "serendipia"], [["Finding that café was pure serendipity.", "Encontrar ese café fue pura casualidad afortunada."]], ["feelings"]),
];
