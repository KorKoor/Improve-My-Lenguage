import type { GrammarConcept } from "../types";

/** Ruso: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const RU_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "ru:g:dative",
    language: "ru",
    title: "Dativo: мне нравится, мне холодно",
    cefr: "A2",
    errorCategory: "ru:dative",
    summary:
      "El dativo marca a quién se da o dirige algo, y a la persona que siente algo: Мне нравится музыка (me gusta la música), Ему 20 лет (tiene 20 años), Мне холодно (tengo frío). Pronombres: мне, тебе, ему, ей, нам, вам, им.",
    whenToUse: ["Gustos: Тебе нравится Москва?", "Edad y sensaciones: Мне 30 лет. Нам скучно.", "Dar/decir a alguien: Я позвонил маме."],
    formation: ["Masculino/neutro: -у/-ю (брату, другу).", "Femenino: -е (маме, сестре).", "Plural: -ам/-ям (друзьям)."],
    commonMistakes: [
      { wrong: "Я нравится кофе.", right: "Мне нравится кофе.", why: "Quien siente el gusto va en dativo: мне." },
      { wrong: "Я 25 лет.", right: "Мне 25 лет.", why: "La edad se expresa con dativo." },
    ],
    examples: [
      { text: "Мне очень нравится этот город.", translation: es("Me gusta mucho esta ciudad.") },
      { text: "Позвони, пожалуйста, бабушке.", translation: es("Llama a la abuela, por favor.") },
    ],
    contrasts: [{ a: "Я люблю кофе.", b: "Мне нравится кофе.", explanation: "Amar/gustar mucho (nominativo) frente a «me gusta» (dativo)." }],
    exercises: [
      { type: "mc", prompt: "___ нравится этот фильм?", options: ["Тебе", "Ты", "Тебя", "Твой"], answers: ["Тебе"], explanation: "Dativo de ты → тебе." },
      { type: "mc", prompt: "Сколько лет ___? (a tu hermano)", options: ["твоему брату", "твой брат", "твоего брата", "твоим братом"], answers: ["твоему брату"], explanation: "Edad → dativo." },
      { type: "fill", prompt: "___ холодно. (a nosotros)", answers: ["Нам"], explanation: "Мы → нам." },
      { type: "correct", prompt: "Я нравится эта песня.", answers: ["Мне нравится эта песня."], explanation: "Quien siente → мне." },
    ],
  },
  {
    id: "ru:g:numbers-case",
    language: "ru",
    title: "Números y caso: 1 год, 2 года, 5 лет",
    cefr: "A2",
    errorCategory: "ru:numbers",
    summary:
      "Tras los números el sustantivo cambia: con 1 (y 21, 31…) va en nominativo singular; con 2, 3, 4 (22, 23, 24…) en genitivo singular; con 5-20 (y 25-30…) en genitivo plural. Por eso: 1 рубль, 2 рубля, 5 рублей.",
    whenToUse: ["Precios, edad, horas y cantidades."],
    formation: ["1 → год, книга, рубль.", "2-4 → года, книги, рубля.", "5-20 → лет, книг, рублей. Manda la última cifra: 21 год, 22 года, 25 лет."],
    commonMistakes: [
      { wrong: "Мне 22 лет.", right: "Мне 22 года.", why: "Termina en 2 → года." },
      { wrong: "Это стоит пять рубля.", right: "Это стоит пять рублей.", why: "5 → genitivo plural." },
    ],
    examples: [
      { text: "Билет стоит сто рублей.", translation: es("El billete cuesta cien rublos.") },
      { text: "Я живу здесь три года.", translation: es("Vivo aquí desde hace tres años.") },
    ],
    contrasts: [{ a: "два часа", b: "пять часов", explanation: "Dos horas (gen. sg.) / cinco horas (gen. pl.)." }],
    exercises: [
      { type: "mc", prompt: "Моему сыну 4 ___.", options: ["года", "лет", "год", "годы"], answers: ["года"], explanation: "4 → года." },
      { type: "mc", prompt: "У меня 10 ___.", options: ["минут", "минуты", "минута", "минутой"], answers: ["минут"], explanation: "10 → genitivo plural." },
      { type: "fill", prompt: "Мне 21 ___.", answers: ["год"], explanation: "Termina en 1 → год." },
      { type: "correct", prompt: "Мне 23 лет.", answers: ["Мне 23 года."], explanation: "Termina en 3 → года." },
    ],
  },
  {
    id: "ru:g:imperative",
    language: "ru",
    title: "Imperativo: читай / читайте",
    cefr: "A2",
    errorCategory: "ru:imperative",
    summary:
      "Se forma a partir de la raíz del presente: si acaba en vocal se añade -й (читают → читай), si acaba en consonante, -и (пишут → пиши). Con вы o por cortesía se añade -те: читайте, пишите. Para pedir algo una vez se prefiere el perfectivo (скажите); para invitar, el imperfectivo (садитесь).",
    whenToUse: ["Pedir: Скажите, пожалуйста…", "Invitar: Заходите!", "Prohibir con imperfectivo: Не опаздывайте."],
    formation: ["Raíz en vocal → -й(те).", "Raíz en consonante → -и(те).", "Reflexivos: -ся/-сь: садись, садитесь."],
    commonMistakes: [
      { wrong: "Говоришь медленнее!", right: "Говорите медленнее, пожалуйста!", why: "Imperativo, no presente; con usted → -те." },
      { wrong: "Не скажите ему.", right: "Не говорите ему.", why: "Prohibición → imperfectivo." },
    ],
    examples: [
      { text: "Подождите минуточку.", translation: es("Espere un momentito.") },
      { text: "Не волнуйся, всё будет хорошо.", translation: es("No te preocupes, todo irá bien.") },
    ],
    contrasts: [{ a: "Садитесь!", b: "Сядьте!", explanation: "Invitación amable / orden más seca." }],
    exercises: [
      { type: "mc", prompt: "___, пожалуйста, где метро? (usted)", options: ["Скажите", "Скажи", "Скажете", "Сказать"], answers: ["Скажите"], explanation: "Cortesía → -те." },
      { type: "mc", prompt: "Не ___ дверь! (tú, cerrar, prohibición)", options: ["закрывай", "закрой", "закрываешь", "закрыть"], answers: ["закрывай"], explanation: "Prohibición → imperfectivo." },
      { type: "fill", prompt: "Пиш___ чаще! (vosotros)", answers: ["ите"], explanation: "Пишите." },
      { type: "correct", prompt: "Не скажи маме!", answers: ["Не говори маме!"], explanation: "Prohibición → imperfectivo говорить." },
    ],
  },
  {
    id: "ru:g:instrumental",
    language: "ru",
    title: "Instrumental: с кем, чем, кем работаешь",
    cefr: "B1",
    errorCategory: "ru:instrumental",
    summary:
      "El instrumental indica compañía (с другом), medio (пишу ручкой), profesión con работать/быть/стать (работаю врачом) y va tras над, под, перед, за, между.",
    whenToUse: ["Compañía: Я иду в кино с сестрой.", "Profesión: Он хочет стать инженером.", "Intereses: Я занимаюсь спортом."],
    formation: ["Masc./neutro: -ом/-ем (другом, морем).", "Fem.: -ой/-ей (мамой, землёй).", "Plural: -ами/-ями (друзьями)."],
    commonMistakes: [
      { wrong: "Я работаю врач.", right: "Я работаю врачом.", why: "Работать + instrumental." },
      { wrong: "Кофе с молоко.", right: "Кофе с молоком.", why: "С (con) + instrumental." },
    ],
    examples: [
      { text: "Мы гуляли с собакой.", translation: es("Paseamos con el perro.") },
      { text: "Чем ты занимаешься?", translation: es("¿A qué te dedicas?") },
    ],
    contrasts: [{ a: "Он врач.", b: "Он работает врачом.", explanation: "Es médico (nominativo) / trabaja de médico (instrumental)." }],
    exercises: [
      { type: "mc", prompt: "Я пью чай с ___.", options: ["лимоном", "лимон", "лимона", "лимону"], answers: ["лимоном"], explanation: "С + instrumental." },
      { type: "mc", prompt: "Она работает ___.", options: ["учительницей", "учительница", "учительницу", "учительнице"], answers: ["учительницей"], explanation: "Работать + instrumental." },
      { type: "fill", prompt: "Я занимаюсь спорт___.", answers: ["ом"], explanation: "Заниматься + instrumental: спортом." },
      { type: "correct", prompt: "Я хочу стать пилот.", answers: ["Я хочу стать пилотом."], explanation: "Стать + instrumental." },
    ],
  },
  {
    id: "ru:g:reflexive",
    language: "ru",
    title: "Verbos en -ся: учиться, нравиться, заниматься",
    cefr: "B1",
    errorCategory: "ru:reflexive",
    summary:
      "El sufijo -ся (-сь tras vocal) marca verbos reflexivos, recíprocos o simplemente de forma reflexiva sin equivalente español: учиться (estudiar), бояться (tener miedo), смеяться (reír). Nunca llevan complemento directo en acusativo.",
    whenToUse: ["Estudios: Я учусь в университете.", "Emociones: Не бойся!", "Recíprocos: Мы часто видимся."],
    formation: ["Tras consonante -ся: учится, учатся.", "Tras vocal -сь: учусь, училась, учились (y -ся tras consonante: учишься, учится).", "El complemento va en otros casos: бояться + genitivo, заниматься + instrumental."],
    commonMistakes: [
      { wrong: "Я учу в школе (queriendo decir «estudio»).", right: "Я учусь в школе.", why: "Estudiar (ser alumno) → учиться; учить = enseñar/aprenderse algo." },
      { wrong: "Я боюсь собаку.", right: "Я боюсь собак.", why: "Бояться + genitivo." },
    ],
    examples: [
      { text: "Где ты учишься?", translation: es("¿Dónde estudias?") },
      { text: "Фильм начинается в семь.", translation: es("La película empieza a las siete.") },
    ],
    contrasts: [{ a: "Я учу слова.", b: "Я учусь в Москве.", explanation: "Aprenderse algo / estudiar (ser estudiante)." }],
    exercises: [
      { type: "mc", prompt: "Урок ___ в девять.", options: ["начинается", "начинает", "начинаться", "начинают"], answers: ["начинается"], explanation: "Empezar (sin objeto) → начинается." },
      { type: "mc", prompt: "Мой брат ___ в университете.", options: ["учится", "учит", "учиться", "учат"], answers: ["учится"], explanation: "Ser estudiante → учиться." },
      { type: "fill", prompt: "Не бой___! (tú)", answers: ["ся"], explanation: "Бойся." },
      { type: "correct", prompt: "Я учу в университете.", answers: ["Я учусь в университете."], explanation: "Estudiar → учиться." },
    ],
  },
  {
    id: "ru:g:conditional",
    language: "ru",
    title: "Condicional: бы + pasado",
    cefr: "B2",
    errorCategory: "ru:conditional",
    summary:
      "El ruso forma el condicional y las hipótesis con бы + verbo en pasado, en ambas partes de la frase: Если бы у меня было время, я бы поехал (si tuviera tiempo, iría). Sirve para presente, pasado y futuro según el contexto. También para pedir con cortesía: Я бы хотел…",
    whenToUse: ["Hipótesis: Если бы я знал…", "Cortesía: Я бы хотела кофе.", "Deseos: Хорошо бы отдохнуть."],
    formation: ["Если бы + pasado, (то) + pasado + бы.", "El pasado concuerda en género: я бы пошёл / пошла."],
    commonMistakes: [
      { wrong: "Если бы я знаю, я бы сказал.", right: "Если бы я знал, я бы сказал.", why: "Con бы, siempre pasado." },
      { wrong: "Я хочу бы чай.", right: "Я бы хотел чаю. / Я бы хотела чаю.", why: "Бы + pasado (хотел/хотела)." },
    ],
    examples: [
      { text: "Если бы не дождь, мы бы пошли гулять.", translation: es("Si no fuera por la lluvia, habríamos ido a pasear.") },
      { text: "Я бы с удовольствием помог.", translation: es("Ayudaría con mucho gusto.") },
    ],
    contrasts: [{ a: "Если будет время, поеду.", b: "Если бы было время, поехал бы.", explanation: "Condición real (futuro) / hipotética (бы)." }],
    exercises: [
      { type: "mc", prompt: "Если бы я ___ богатым, я бы путешествовал.", options: ["был", "буду", "есть", "быть"], answers: ["был"], explanation: "Бы + pasado." },
      { type: "mc", prompt: "Я ___ хотела заказать столик.", options: ["бы", "будет", "было", "если"], answers: ["бы"], explanation: "Cortesía: я бы хотела." },
      { type: "fill", prompt: "Если бы ты позвонил, я ___ пришла.", answers: ["бы"], explanation: "Бы en ambas partes." },
      { type: "correct", prompt: "Если бы я знаю ответ, я бы сказал.", answers: ["Если бы я знал ответ, я бы сказал."], explanation: "Pasado tras если бы." },
    ],
  },
  {
    id: "ru:g:kotoryi",
    language: "ru",
    title: "Relativo который",
    cefr: "B2",
    errorCategory: "ru:relative",
    summary:
      "Который equivale a «que / el cual». Toma el género y número de la palabra a la que se refiere y el caso de su función en la oración relativa: Девушка, которую я видел… (acusativo), Дом, в котором я живу… (preposicional).",
    whenToUse: ["Precisar: Книга, которую ты мне дал, интересная.", "Con preposición: Друг, с которым я работаю…"],
    formation: ["Nominativo: который, которая, которое, которые.", "Acusativo fem.: которую · Preposicional: (в) котором/которой · Instrumental: (с) которым/которой."],
    commonMistakes: [
      { wrong: "Фильм, который я говорил…", right: "Фильм, о котором я говорил…", why: "Говорить о + preposicional → о котором." },
      { wrong: "Женщина, который звонила…", right: "Женщина, которая звонила…", why: "Concuerda en género: которая." },
    ],
    examples: [
      { text: "Это город, в котором я родился.", translation: es("Esta es la ciudad en la que nací.") },
      { text: "Человек, которому я помог, был очень благодарен.", translation: es("La persona a la que ayudé estaba muy agradecida.") },
    ],
    contrasts: [{ a: "девушка, которая меня знает", b: "девушка, которую я знаю", explanation: "Ella es sujeto (nominativo) / objeto (acusativo)." }],
    exercises: [
      { type: "mc", prompt: "Книга, ___ я читаю, очень длинная.", options: ["которую", "которая", "который", "которой"], answers: ["которую"], explanation: "Objeto femenino → которую." },
      { type: "mc", prompt: "Дом, в ___ мы живём, старый.", options: ["котором", "который", "которого", "которым"], answers: ["котором"], explanation: "В + preposicional → котором." },
      { type: "fill", prompt: "Друг, с котор___ я работаю, из Киева.", answers: ["ым"], explanation: "С + instrumental → которым." },
      { type: "correct", prompt: "Девушка, который пришла, — моя сестра.", answers: ["Девушка, которая пришла, — моя сестра."], explanation: "Femenino → которая." },
    ],
  },
];
