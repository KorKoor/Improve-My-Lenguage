import type { GrammarConcept } from "../types";

/** Ruso: programa gramatical A1 → C1. Revisión humana recomendada antes de ampliar. */
const es = (t: string) => ({ es: t });

export const RU_GRAMMAR: GrammarConcept[] = [
  {
    id: "ru:g:gender",
    language: "ru",
    title: "Género y el verbo «ser» que no se dice",
    cefr: "A1",
    errorCategory: "ru:gender",
    summary:
      "Los sustantivos rusos son masculinos (terminan en consonante o -й), femeninos (-а, -я) o neutros (-о, -е). En presente, el verbo «ser/estar» se omite: «Я студент» = «Yo (soy) estudiante». No hay artículos.",
    whenToUse: ["Para concordar adjetivos, posesivos y el pasado.", "Frases de identidad: Это мой дом (Esta es mi casa)."],
    formation: [
      "Masculino: дом, стол, музей · Femenino: мама, книга, неделя · Neutro: окно, море.",
      "-ь puede ser masculino (день) o femenino (ночь): hay que memorizarlo.",
      "Posesivos: мой (m), моя (f), моё (n).",
    ],
    commonMistakes: [
      { wrong: "Я есть студент.", right: "Я студент.", why: "En presente no se dice «есть» como verbo copulativo." },
      { wrong: "мой книга", right: "моя книга", why: "книга es femenino → моя." },
    ],
    examples: [
      { text: "Это моя сестра.", reading: "Eto moya sestra.", translation: es("Esta es mi hermana.") },
      { text: "Мой брат — врач.", reading: "Moy brat — vrach.", translation: es("Mi hermano es médico.") },
    ],
    contrasts: [{ a: "мой дом (m)", b: "моё окно (n)", explanation: "El posesivo cambia con el género del sustantivo." }],
    exercises: [
      { type: "mc", prompt: "Это ___ книга.", options: ["моя", "мой", "моё", "мои"], answers: ["моя"], explanation: "книга (-а) es femenino." },
      { type: "mc", prompt: "Это ___ окно.", options: ["моё", "мой", "моя", "мои"], answers: ["моё"], explanation: "окно (-о) es neutro." },
      { type: "mc", prompt: "Я ___ студент.", options: ["—", "есть", "быть", "был"], answers: ["—"], explanation: "En presente no se usa verbo: «Я студент»." },
      { type: "mc", prompt: "Это ___ дом.", options: ["мой", "моя", "моё", "мою"], answers: ["мой"], explanation: "дом es masculino." },
    ],
  },
  {
    id: "ru:g:present",
    language: "ru",
    title: "Presente: las dos conjugaciones",
    cefr: "A1",
    errorCategory: "ru:conjugation",
    summary: "Casi todos los verbos siguen una de dos conjugaciones: la 1.ª (читать → читаю, читаешь…) y la 2.ª (говорить → говорю, говоришь…).",
    whenToUse: ["Acciones presentes y habituales."],
    formation: [
      "1.ª (-ать/-ять…): я читаю, ты читаешь, он читает, мы читаем, вы читаете, они читают.",
      "2.ª (-ить…): я говорю, ты говоришь, он говорит, мы говорим, вы говорите, они говорят.",
    ],
    commonMistakes: [
      { wrong: "Я читаешь.", right: "Я читаю.", why: "я → -ю/-у." },
      { wrong: "Они говорют.", right: "Они говорят.", why: "2.ª conjugación: они → -ят/-ат." },
    ],
    examples: [
      { text: "Я читаю книгу.", reading: "Ya chitayu knigu.", translation: es("Leo un libro.") },
      { text: "Вы говорите по-испански?", reading: "Vy govorite po-ispanski?", translation: es("¿Habla usted español?") },
    ],
    contrasts: [{ a: "он читает (1.ª)", b: "он говорит (2.ª)", explanation: "La vocal de la terminación delata la conjugación." }],
    exercises: [
      { type: "mc", prompt: "Я ___ по-русски. (говорить)", options: ["говорю", "говоришь", "говорит", "говорят"], answers: ["говорю"], explanation: "я → говорю." },
      { type: "mc", prompt: "Они ___ газету. (читать)", options: ["читают", "читает", "читаем", "читаю"], answers: ["читают"], explanation: "они → читают." },
      { type: "mc", prompt: "Ты ___ здесь? (работать)", options: ["работаешь", "работаю", "работает", "работают"], answers: ["работаешь"], explanation: "ты → -ешь." },
      { type: "mc", prompt: "Мы ___ музыку. (любить)", options: ["любим", "любят", "любишь", "люблю"], answers: ["любим"], explanation: "мы (2.ª) → любим." },
    ],
  },
  {
    id: "ru:g:past",
    language: "ru",
    title: "Pasado: concuerda en género, no en persona",
    cefr: "A2",
    errorCategory: "ru:past-tense",
    summary: "El pasado se forma quitando -ть y añadiendo -л (m), -ла (f), -ло (n) o -ли (plural). Concuerda con el género del sujeto, no con la persona.",
    whenToUse: ["Cualquier acción pasada."],
    formation: ["читать → читал / читала / читало / читали.", "Una mujer dice «я читала»; un hombre, «я читал».", "быть → был, была, было, были."],
    commonMistakes: [
      { wrong: "Она читал.", right: "Она читала.", why: "Sujeto femenino → -ла." },
      { wrong: "Мы был дома.", right: "Мы были дома.", why: "Plural → -ли." },
    ],
    examples: [
      { text: "Вчера я был в кино.", reading: "Vchera ya byl v kino.", translation: es("Ayer estuve en el cine (hablante hombre).") },
      { text: "Она жила в Москве.", reading: "Ona zhila v Moskve.", translation: es("Ella vivía en Moscú.") },
    ],
    contrasts: [{ a: "я читал (hombre)", b: "я читала (mujer)", explanation: "La misma persona, distinta terminación según el género." }],
    exercises: [
      { type: "mc", prompt: "Вчера Анна ___ дома. (быть)", options: ["была", "был", "было", "были"], answers: ["была"], explanation: "Анна (f) → была." },
      { type: "mc", prompt: "Мы ___ фильм. (смотреть)", options: ["смотрели", "смотрел", "смотрела", "смотрело"], answers: ["смотрели"], explanation: "Plural → -ли." },
      { type: "mc", prompt: "Иван ___ письмо. (писать)", options: ["писал", "писала", "писали", "писало"], answers: ["писал"], explanation: "Masculino → -л." },
      { type: "mc", prompt: "Окно ___ открыто. (быть)", options: ["было", "был", "была", "были"], answers: ["было"], explanation: "окно (n) → было." },
    ],
  },
  {
    id: "ru:g:accusative-prepositional",
    language: "ru",
    title: "Casos acusativo (objeto) y preposicional (lugar)",
    cefr: "A2",
    errorCategory: "ru:cases",
    summary: "El ruso marca la función de las palabras con terminaciones (casos). El acusativo marca el objeto directo; el preposicional, el lugar con в/на y el tema con о.",
    whenToUse: ["Acusativo: Я читаю книгу. También destino: Я иду в школу.", "Preposicional: Я живу в Москве. Мы говорим о фильме."],
    formation: [
      "Acusativo femenino: -а → -у, -я → -ю (книга → книгу). Masculino inanimado y neutro: sin cambio.",
      "Preposicional: casi siempre -е (Москва → в Москве, стол → на столе); -ия → -ии (Россия → в России).",
    ],
    commonMistakes: [
      { wrong: "Я читаю книга.", right: "Я читаю книгу.", why: "Objeto directo femenino: -у." },
      { wrong: "Я живу в Москва.", right: "Я живу в Москве.", why: "Lugar con в → preposicional." },
    ],
    examples: [
      { text: "Я люблю музыку.", reading: "Ya lyublyu muzyku.", translation: es("Me encanta la música.") },
      { text: "Книга лежит на столе.", reading: "Kniga lezhit na stole.", translation: es("El libro está sobre la mesa.") },
    ],
    contrasts: [{ a: "Я иду в школу. (acusativo: a dónde)", b: "Я в школе. (preposicional: dónde)", explanation: "Dirección frente a ubicación." }],
    exercises: [
      { type: "mc", prompt: "Я пью ___. (вода)", options: ["воду", "вода", "воде", "воды"], answers: ["воду"], explanation: "Objeto directo femenino → воду." },
      { type: "mc", prompt: "Мы живём в ___. (Россия)", options: ["России", "Россию", "Россия", "Россие"], answers: ["России"], explanation: "-ия → -ии en preposicional." },
      { type: "mc", prompt: "Телефон на ___. (стол)", options: ["столе", "стол", "стола", "столу"], answers: ["столе"], explanation: "Ubicación con на → -е." },
      { type: "mc", prompt: "Я иду в ___. (школа — destino)", options: ["школу", "школе", "школа", "школы"], answers: ["школу"], explanation: "Destino → acusativo." },
    ],
  },
  {
    id: "ru:g:genitive",
    language: "ru",
    title: "Genitivo: posesión, «no hay» y cantidades",
    cefr: "B1",
    errorCategory: "ru:genitive",
    summary: "El genitivo expresa «de» (posesión), la ausencia con нет y las cantidades: después de 5 y de много/мало va genitivo plural.",
    whenToUse: ["Posesión: машина брата.", "Ausencia: У меня нет времени.", "Números: 2–4 → genitivo singular (два стола); 5+ → genitivo plural (пять столов)."],
    formation: ["Singular: -а/-я (m, n): брата; -ы/-и (f): мамы, недели.", "Plural: -ов (столов), -ей (дней), sin terminación (книг, недель)."],
    commonMistakes: [
      { wrong: "У меня нет время.", right: "У меня нет времени.", why: "нет + genitivo." },
      { wrong: "пять книги", right: "пять книг", why: "Desde 5 → genitivo plural." },
    ],
    examples: [
      { text: "У меня нет машины.", reading: "U menya net mashiny.", translation: es("No tengo coche.") },
      { text: "Это дом моего брата.", reading: "Eto dom moyego brata.", translation: es("Esta es la casa de mi hermano.") },
    ],
    contrasts: [{ a: "два стола (2–4: gen. singular)", b: "пять столов (5+: gen. plural)", explanation: "El número decide la forma." }],
    exercises: [
      { type: "mc", prompt: "У меня нет ___. (сестра)", options: ["сестры", "сестра", "сестру", "сестре"], answers: ["сестры"], explanation: "нет + genitivo: сестры." },
      { type: "mc", prompt: "Пять ___. (стол)", options: ["столов", "стола", "столы", "стол"], answers: ["столов"], explanation: "5+ → genitivo plural." },
      { type: "mc", prompt: "Два ___. (брат)", options: ["брата", "братов", "братья", "брат"], answers: ["брата"], explanation: "2–4 → genitivo singular." },
      { type: "mc", prompt: "Машина ___. (папа)", options: ["папы", "папа", "папу", "папе"], answers: ["папы"], explanation: "Posesión → genitivo." },
    ],
  },
  {
    id: "ru:g:aspect",
    language: "ru",
    title: "Aspecto: imperfectivo y perfectivo",
    cefr: "B1",
    errorCategory: "ru:aspect",
    summary: "Casi todos los verbos vienen en pareja. El imperfectivo habla del proceso o de la repetición (como el imperfecto español); el perfectivo, del resultado completo de una sola vez.",
    whenToUse: ["Imperfectivo: hábitos, procesos, «estaba haciendo». Я читал книгу весь вечер.", "Perfectivo: resultado, una vez, «terminó». Я прочитал книгу."],
    formation: ["Pares frecuentes: читать/прочитать, делать/сделать, писать/написать, покупать/купить, говорить/сказать.", "El perfectivo no tiene presente: su «presente» es futuro (прочитаю = leeré)."],
    commonMistakes: [
      { wrong: "Каждый день я прочитал газету.", right: "Каждый день я читал газету.", why: "Repetición → imperfectivo." },
      { wrong: "Я сейчас сделаю домашнее задание. (= lo estoy haciendo)", right: "Я сейчас делаю домашнее задание.", why: "Acción en curso → imperfectivo." },
    ],
    examples: [
      { text: "Я долго писал письмо и наконец написал его.", reading: "Ya dolgo pisal pis'mo i nakonets napisal yego.", translation: es("Estuve mucho tiempo escribiendo la carta y por fin la terminé.") },
      { text: "Завтра я куплю хлеб.", reading: "Zavtra ya kuplyu khleb.", translation: es("Mañana compraré pan.") },
    ],
    contrasts: [{ a: "Я читал книгу. (leía / estuve leyendo)", b: "Я прочитал книгу. (leí el libro entero)", explanation: "Proceso frente a resultado." }],
    exercises: [
      { type: "mc", prompt: "Каждое утро я ___ кофе. (tomaba)", options: ["пил", "выпил", "выпью", "попил"], answers: ["пил"], explanation: "Hábito → imperfectivo." },
      { type: "mc", prompt: "Я уже ___ это письмо. (lo terminé)", options: ["написал", "писал", "пишу", "писать"], answers: ["написал"], explanation: "Resultado → perfectivo." },
      { type: "mc", prompt: "Завтра я ___ тебе. (llamaré — una vez)", options: ["позвоню", "звоню", "звонил", "позвонил"], answers: ["позвоню"], explanation: "Futuro de una acción puntual → perfectivo." },
      { type: "mc", prompt: "Что ты ___ вчера вечером? (hacías)", options: ["делал", "сделал", "сделаешь", "сделать"], answers: ["делал"], explanation: "Pregunta por la actividad → imperfectivo." },
    ],
  },
  {
    id: "ru:g:motion",
    language: "ru",
    title: "Verbos de movimiento: идти / ходить, ехать / ездить",
    cefr: "B2",
    errorCategory: "ru:motion-verbs",
    summary: "El ruso distingue ir a pie (идти/ходить) de ir en vehículo (ехать/ездить), y un solo trayecto en una dirección (идти, ехать) de movimientos repetidos o de ida y vuelta (ходить, ездить).",
    whenToUse: ["Unidireccional, ahora: Я иду в магазин.", "Multidireccional, habitual o ida y vuelta: Я часто хожу в спортзал. Вчера я ходил в кино."],
    formation: ["идти: иду, идёшь… · ходить: хожу, ходишь…", "ехать: еду, едешь… · ездить: езжу, ездишь…", "Pasado de «fui y volví»: ходил / ездил."],
    commonMistakes: [
      { wrong: "Я иду в Москву на поезде.", right: "Я еду в Москву на поезде.", why: "En vehículo → ехать." },
      { wrong: "Я каждый день иду на работу.", right: "Я каждый день хожу на работу.", why: "Habitual → ходить." },
    ],
    examples: [
      { text: "Сейчас я еду домой.", reading: "Seychas ya yedu domoy.", translation: es("Ahora voy (en transporte) a casa.") },
      { text: "Летом мы ездили на море.", reading: "Letom my yezdili na more.", translation: es("En verano fuimos (y volvimos) al mar.") },
    ],
    contrasts: [{ a: "Я иду в парк. (voy ahora, a pie)", b: "Я хожу в парк. (suelo ir)", explanation: "Una dirección concreta frente a hábito." }],
    exercises: [
      { type: "mc", prompt: "Смотри, мама ___ к нам! (a pie, ahora)", options: ["идёт", "ходит", "едет", "ездит"], answers: ["идёт"], explanation: "A pie, ahora, una dirección → идти." },
      { type: "mc", prompt: "Каждое лето мы ___ в Испанию.", options: ["ездим", "едем", "ходим", "идём"], answers: ["ездим"], explanation: "Habitual y en vehículo → ездить." },
      { type: "mc", prompt: "Вчера я ___ к врачу. (fui y volví, a pie)", options: ["ходил", "шёл", "ехал", "ездил"], answers: ["ходил"], explanation: "Ida y vuelta a pie → ходил." },
      { type: "mc", prompt: "Я сейчас ___ на работу на метро.", options: ["еду", "иду", "езжу", "хожу"], answers: ["еду"], explanation: "En transporte, ahora → ехать." },
    ],
  },
  {
    id: "ru:g:participles",
    language: "ru",
    title: "Gerundios (деепричастия) y participios",
    cefr: "C1",
    errorCategory: "ru:participles",
    summary: "En registro culto, el ruso condensa oraciones con gerundios (-я, -в: читая, прочитав) y participios que funcionan como adjetivos (читающий = que lee).",
    whenToUse: ["Gerundio imperfectivo (-я/-а): acción simultánea. Gerundio perfectivo (-в): acción previa.", "Participios: sustituyen a «который»: студент, читающий книгу = студент, который читает книгу."],
    formation: ["Imperfectivo: раíz del presente + я: читать → читая, говорить → говоря.", "Perfectivo: raíz del pasado + в: прочитать → прочитав, сделать → сделав.", "Participio activo presente: -ущий/-ющий, -ащий/-ящий."],
    commonMistakes: [
      { wrong: "Прочитая книгу, я пошёл спать.", right: "Прочитав книгу, я пошёл спать.", why: "Acción previa terminada → gerundio perfectivo -в." },
      { wrong: "Читав газету, он пил кофе.", right: "Читая газету, он пил кофе.", why: "Simultaneidad → gerundio imperfectivo -я." },
    ],
    examples: [
      { text: "Слушая музыку, она готовила ужин.", reading: "Slushaya muzyku, ona gotovila uzhin.", translation: es("Escuchando música, preparaba la cena.") },
      { text: "Сделав домашнее задание, дети пошли гулять.", reading: "Sdelav domashneye zadaniye, deti poshli gulyat'.", translation: es("Después de hacer la tarea, los niños salieron a pasear.") },
    ],
    contrasts: [{ a: "читая (mientras leía)", b: "прочитав (después de leer)", explanation: "Simultaneidad frente a anterioridad." }],
    exercises: [
      { type: "mc", prompt: "___ домой, он позвонил маме. (después de llegar)", options: ["Придя", "Приходя", "Пришёл", "Приходить"], answers: ["Придя"], explanation: "Acción previa → perfectivo (прийти → придя)." },
      { type: "mc", prompt: "___ по улице, я встретил друга. (mientras caminaba)", options: ["Идя", "Пройдя", "Шёл", "Идти"], answers: ["Идя"], explanation: "Simultaneidad → imperfectivo." },
      { type: "mc", prompt: "Человек, ___ в углу, — мой брат. (que está sentado)", options: ["сидящий", "сидя", "сидел", "посидев"], answers: ["сидящий"], explanation: "Participio activo presente = «que está sentado»." },
      { type: "mc", prompt: "___ письмо, она заплакала. (tras leer)", options: ["Прочитав", "Читая", "Читала", "Прочитая"], answers: ["Прочитав"], explanation: "Acción previa → прочитав." },
    ],
  },
];
