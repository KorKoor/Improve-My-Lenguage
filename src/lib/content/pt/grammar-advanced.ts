import type { GrammarConcept } from "../types";

/** Portugués (Brasil) A1–C1: continúa el programa de pt/index.ts. Revisión humana recomendada. */
const es = (t: string) => ({ es: t });

export const PT_GRAMMAR_ADVANCED: GrammarConcept[] = [
  {
    id: "pt:g:ser-estar-ficar",
    language: "pt",
    title: "Ser, estar y ficar",
    cefr: "A1",
    errorCategory: "pt:ser-estar",
    summary: "Ser y estar funcionan casi como en español. La gran diferencia es ficar, muy frecuente: «quedar(se)», «ponerse» y también «estar situado» (Onde fica o banco?).",
    whenToUse: ["ser: identidad, origen, características. estar: estados temporales.", "ficar: ubicación fija (fica no centro), cambios (fiquei feliz) y permanecer (fico em casa)."],
    formation: ["ser: sou, é, somos, são · estar: estou, está, estamos, estão.", "ficar: fico, fica, ficamos, ficam · pretérito: fiquei, ficou."],
    commonMistakes: [
      { wrong: "Onde está o museu? (ubicación fija)", right: "Onde fica o museu?", why: "Para la ubicación de edificios y lugares se prefiere ficar." },
      { wrong: "Estou brasileiro.", right: "Sou brasileiro.", why: "Nacionalidad → ser." },
    ],
    examples: [
      { text: "A farmácia fica perto daqui.", translation: es("La farmacia está cerca de aquí.") },
      { text: "Ele ficou muito nervoso.", translation: es("Se puso muy nervioso.") },
    ],
    contrasts: [{ a: "Estou em casa. (ahora)", b: "Fico em casa hoje. (me quedo)", explanation: "estar describe; ficar indica permanecer o cambiar." }],
    exercises: [
      { type: "mc", prompt: "Onde ___ a estação de trem?", options: ["fica", "é", "está sendo", "ficou"], answers: ["fica"], explanation: "Ubicación fija → fica." },
      { type: "mc", prompt: "Eu ___ mexicano.", options: ["sou", "estou", "fico", "está"], answers: ["sou"], explanation: "Nacionalidad → ser." },
      { type: "mc", prompt: "Hoje eu ___ cansado.", options: ["estou", "sou", "fico sendo", "é"], answers: ["estou"], explanation: "Estado temporal → estar." },
      { type: "mc", prompt: "Ela ___ feliz com a notícia. (se puso)", options: ["ficou", "foi", "estava sendo", "é"], answers: ["ficou"], explanation: "Cambio de estado → ficar." },
    ],
  },
  {
    id: "pt:g:imperfeito",
    language: "pt",
    title: "Pretérito imperfeito",
    cefr: "A2",
    errorCategory: "pt:imperfect",
    summary: "Equivale al imperfecto español: descripciones, hábitos y acciones en curso en el pasado. Se combina con el pretérito perfeito como en español.",
    whenToUse: ["Quando eu era criança, morava em Recife.", "Eu estava dormindo quando você ligou."],
    formation: ["-ar → -ava: falava, falávamos, falavam.", "-er/-ir → -ia: comia, abria.", "Irregulares: ser (era), ter (tinha), vir (vinha), pôr (punha)."],
    commonMistakes: [
      { wrong: "Quando eu fui criança, brinquei na rua.", right: "Quando eu era criança, brincava na rua.", why: "Descripción y hábito → imperfeito." },
      { wrong: "Eu tive fome enquanto trabalhava. (estado continuo)", right: "Eu tinha fome enquanto trabalhava.", why: "Estado de fondo → imperfeito." },
    ],
    examples: [
      { text: "Antigamente as pessoas escreviam cartas.", translation: es("Antiguamente la gente escribía cartas.") },
      { text: "Estava chovendo quando cheguei.", translation: es("Estaba lloviendo cuando llegué.") },
    ],
    contrasts: [{ a: "Eu lia. (leía)", b: "Eu li. (leí)", explanation: "Mismo contraste que en español." }],
    exercises: [
      { type: "mc", prompt: "Quando eu ___ pequeno, gostava de desenhar.", options: ["era", "fui", "sou", "serei"], answers: ["era"], explanation: "Descripción pasada → era." },
      { type: "mc", prompt: "Nós ___ na praia todo verão.", options: ["íamos", "fomos", "vamos", "iremos"], answers: ["íamos"], explanation: "Hábito → imperfeito." },
      { type: "mc", prompt: "Ela ___ um carro vermelho. (tenía)", options: ["tinha", "teve", "tem", "terá"], answers: ["tinha"], explanation: "ter → tinha." },
      { type: "mc", prompt: "Eu estava jantando quando o telefone ___.", options: ["tocou", "tocava", "toca", "tocará"], answers: ["tocou"], explanation: "Acción que interrumpe → perfeito." },
    ],
  },
  {
    id: "pt:g:pronomes-br",
    language: "pt",
    title: "Pronombres en Brasil: você, a gente y la colocación",
    cefr: "B1",
    errorCategory: "pt:pronouns",
    summary: "En Brasil «você» (tú/usted) se conjuga en 3.ª persona y «a gente» (nosotros coloquial) también. En el habla, los pronombres átonos suelen ir antes del verbo (Me passa o sal?) y como objeto de 3.ª persona se usa mucho «ele/ela».",
    whenToUse: ["Registro cotidiano brasileño: Você quer café? A gente vai sair.", "En textos formales: nós vamos, e pronombres como «o/a»: Eu o vi."],
    formation: ["você + 3.ª persona: você fala, você tem.", "a gente + 3.ª persona singular: a gente fala.", "Coloquial: Me liga amanhã (formal: Ligue-me amanhã)."],
    commonMistakes: [
      { wrong: "A gente vamos ao cinema.", right: "A gente vai ao cinema.", why: "a gente se conjuga en singular." },
      { wrong: "Você falas português?", right: "Você fala português?", why: "você → 3.ª persona." },
    ],
    examples: [
      { text: "A gente se vê amanhã!", translation: es("¡Nos vemos mañana!") },
      { text: "Você me empresta o carregador?", translation: es("¿Me prestas el cargador?") },
    ],
    contrasts: [{ a: "Nós vamos. (formal)", b: "A gente vai. (coloquial)", explanation: "Mismo significado, distinto registro." }],
    exercises: [
      { type: "mc", prompt: "A gente ___ muito ontem.", options: ["riu", "rimos", "riram", "rio"], answers: ["riu"], explanation: "a gente → 3.ª persona singular." },
      { type: "mc", prompt: "Você ___ onde fica o hotel?", options: ["sabe", "sabes", "sabem", "sei"], answers: ["sabe"], explanation: "você → 3.ª persona." },
      { type: "mc", prompt: "(coloquial) ___ liga mais tarde?", options: ["Me", "Mim", "Eu", "Comigo"], answers: ["Me"], explanation: "Coloquial BR: pronombre antes del verbo." },
      { type: "mc", prompt: "Nós ___ ao Rio no verão. (formal)", options: ["vamos", "vai", "vão", "vou"], answers: ["vamos"], explanation: "nós → 1.ª persona plural." },
    ],
  },
  {
    id: "pt:g:futuro-subjuntivo",
    language: "pt",
    title: "Futuro do subjuntivo: quando eu puder, se você quiser",
    cefr: "B1",
    errorCategory: "pt:future-subjunctive",
    summary: "El portugués conserva un tiempo que el español ya casi no usa: el futuro de subjuntivo, obligatorio tras quando, se, assim que, enquanto… referidos al futuro. Donde en español dices «cuando pueda», en portugués: «quando eu puder».",
    whenToUse: ["Condiciones y tiempos futuros: Se você quiser, a gente vai. Quando eu chegar, te ligo."],
    formation: ["Se forma desde la 3.ª persona plural del pretérito perfeito sin -ram: fizeram → fizer, puderam → puder, foram → for, tiveram → tiver.", "Terminaciones: -r, -res, -r, -rmos, -rdes, -rem: quando nós chegarmos."],
    commonMistakes: [
      { wrong: "Quando eu posso, eu te ligo.", right: "Quando eu puder, eu te ligo.", why: "Futuro tras quando → futuro do subjuntivo." },
      { wrong: "Se você quer, a gente sai.", right: "Se você quiser, a gente sai.", why: "Condición futura → quiser." },
    ],
    examples: [
      { text: "Se fizer sol amanhã, vamos à praia.", translation: es("Si hace sol mañana, vamos a la playa.") },
      { text: "Me avisa assim que você chegar.", translation: es("Avísame en cuanto llegues.") },
    ],
    contrasts: [{ a: "Se ele vem hoje… (hecho presente)", b: "Se ele vier amanhã… (futuro)", explanation: "Condiciones sobre el futuro → futuro do subjuntivo." }],
    exercises: [
      { type: "mc", prompt: "Quando eu ___ tempo, vou te visitar.", options: ["tiver", "tenho", "tenha", "tivesse"], answers: ["tiver"], explanation: "ter → tiver." },
      { type: "mc", prompt: "Se você ___, pode ficar aqui.", options: ["quiser", "quer", "queira", "quisesse"], answers: ["quiser"], explanation: "querer → quiser." },
      { type: "mc", prompt: "Assim que eles ___, a gente começa.", options: ["chegarem", "chegam", "cheguem", "chegassem"], answers: ["chegarem"], explanation: "Plural: chegarem." },
      { type: "mc", prompt: "Se ___ frio, leve um casaco. (fazer)", options: ["fizer", "faz", "faça", "fizesse"], answers: ["fizer"], explanation: "fazer → fizer." },
    ],
  },
  {
    id: "pt:g:infinitivo-pessoal",
    language: "pt",
    title: "Infinitivo personal",
    cefr: "B2",
    errorCategory: "pt:personal-infinitive",
    summary: "Único entre las lenguas romances: el infinitivo puede llevar persona. Se usa tras preposiciones y expresiones impersonales cuando el sujeto es distinto o conviene aclararlo: É importante vocês estudarem.",
    whenToUse: ["Tras para, sem, antes de, depois de, até, ao…: Trouxe um livro para vocês lerem.", "Tras expresiones impersonales: É melhor nós sairmos cedo."],
    formation: ["Infinitivo + -es (tu), -mos (nós), -des (vós), -em (eles/vocês): falarmos, falarem.", "eu / você / ele: sin terminación (falar)."],
    commonMistakes: [
      { wrong: "É importante vocês estudar.", right: "É importante vocês estudarem.", why: "Con sujeto plural explícito → estudarem." },
      { wrong: "Antes de nós sair, …", right: "Antes de sairmos, …", why: "Infinitivo personal con nós: sairmos." },
    ],
    examples: [
      { text: "Liguei para vocês virem jantar.", translation: es("Los llamé para que vinieran a cenar.") },
      { text: "Depois de terminarmos, fomos ao bar.", translation: es("Después de terminar, fuimos al bar.") },
    ],
    contrasts: [{ a: "Para eu entender (para que yo entienda)", b: "Para eles entenderem (para que ellos entiendan)", explanation: "Donde el español usa «para que + subjuntivo», el portugués usa el infinitivo personal." }],
    exercises: [
      { type: "mc", prompt: "É melhor nós ___ agora.", options: ["sairmos", "sair", "saímos", "sairem"], answers: ["sairmos"], explanation: "nós → sairmos." },
      { type: "mc", prompt: "Trouxe comida para vocês ___.", options: ["comerem", "comer", "comem", "comam"], answers: ["comerem"], explanation: "vocês → comerem." },
      { type: "mc", prompt: "Antes de ___, eles tomaram café.", options: ["saírem", "sair", "saem", "saíram"], answers: ["saírem"], explanation: "eles → saírem." },
      { type: "mc", prompt: "Explicou tudo para eu ___.", options: ["entender", "entendermos", "entenderem", "entendesse"], answers: ["entender"], explanation: "eu → sin terminación." },
    ],
  },
  {
    id: "pt:g:subjuntivo-presente",
    language: "pt",
    title: "Presente do subjuntivo",
    cefr: "C1",
    errorCategory: "pt:subjunctive",
    summary: "Funciona casi igual que el presente de subjuntivo español: deseo, duda, emoción, finalidad (para que) y concesión (embora). Ojo: tras quando/se con valor futuro se usa el futuro do subjuntivo, no este.",
    whenToUse: ["Espero que você goste. Talvez ele venha. Embora seja caro, vale a pena."],
    formation: ["Desde la 1.ª persona del presente sin -o: falo → fale, faço → faça, tenho → tenha.", "-ar → -e · -er/-ir → -a.", "Irregulares: ser (seja), estar (esteja), ir (vá), saber (saiba), querer (queira), dar (dê)."],
    commonMistakes: [
      { wrong: "Espero que você gosta.", right: "Espero que você goste.", why: "Deseo → subjuntivo." },
      { wrong: "Talvez ele vem hoje.", right: "Talvez ele venha hoje.", why: "talvez antes del verbo → subjuntivo." },
    ],
    examples: [
      { text: "Tomara que não chova amanhã.", translation: es("Ojalá no llueva mañana.") },
      { text: "Fale devagar para que todos entendam.", translation: es("Habla despacio para que todos entiendan.") },
    ],
    contrasts: [{ a: "Espero que você venha. (presente de subjuntivo)", b: "Se você vier, … (futuro do subjuntivo)", explanation: "Deseo frente a condición futura." }],
    exercises: [
      { type: "mc", prompt: "Espero que vocês ___ a viagem.", options: ["aproveitem", "aproveitam", "aproveitarem", "aproveitassem"], answers: ["aproveitem"], explanation: "Deseo → subjuntivo presente." },
      { type: "mc", prompt: "Talvez ela ___ razão.", options: ["tenha", "tem", "tiver", "teria"], answers: ["tenha"], explanation: "talvez → subjuntivo." },
      { type: "mc", prompt: "Embora ___ tarde, vamos continuar.", options: ["seja", "é", "for", "fosse ser"], answers: ["seja"], explanation: "embora → subjuntivo." },
      { type: "mc", prompt: "Quero que você ___ comigo.", options: ["vá", "vai", "for", "ir"], answers: ["vá"], explanation: "ir → vá." },
    ],
  },
];
