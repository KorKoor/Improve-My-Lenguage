import type { GrammarConcept } from "../types";

/** Inglés B2–C1: continúa el programa de en/grammar.ts. */
const es = (t: string) => ({ es: t });

export const EN_GRAMMAR_ADVANCED: GrammarConcept[] = [
  {
    id: "en:g:passive",
    language: "en",
    title: "Voz pasiva: be + participio",
    cefr: "B2",
    errorCategory: "passive",
    summary:
      "La pasiva pone el foco en lo que recibe la acción. Se forma con el verbo be en el tiempo necesario + participio. En inglés se usa mucho más que en español, sobre todo en textos formales y noticias.",
    whenToUse: ["Cuando no se sabe, no importa o es obvio quién hace la acción: My bike was stolen.", "Textos formales, procesos e instrucciones."],
    formation: [
      "Presente: is/are + participio: English is spoken here.",
      "Pasado: was/were + participio: The bridge was built in 1900.",
      "Perfecto: has/have been + participio · Futuro: will be + participio.",
      "Agente con by: The book was written by Orwell.",
    ],
    commonMistakes: [
      { wrong: "The house was build in 1990.", right: "The house was built in 1990.", why: "Se necesita el participio: built." },
      { wrong: "It was stolen my wallet.", right: "My wallet was stolen.", why: "El sujeto de la pasiva es lo robado (no hay «se» impersonal)." },
    ],
    examples: [
      { text: "The results will be published next week.", translation: es("Los resultados se publicarán la próxima semana.") },
      { text: "My phone has been repaired.", translation: es("Ya me repararon el teléfono.") },
    ],
    contrasts: [{ a: "Someone cleans the office every day.", b: "The office is cleaned every day.", explanation: "Activa frente a pasiva: el foco pasa a la oficina." }],
    exercises: [
      { type: "mc", prompt: "This song ___ by millions of people.", options: ["is loved", "loves", "is love", "loved"], answers: ["is loved"], explanation: "Pasiva presente: is + participio." },
      { type: "mc", prompt: "The Eiffel Tower ___ in 1889.", options: ["was completed", "completed", "is completed", "has completed"], answers: ["was completed"], explanation: "Pasado pasivo: was + participio." },
      { type: "fill", prompt: "The package has ___ delivered.", answers: ["been"], explanation: "Perfecto pasivo: has been + participio." },
      { type: "correct", prompt: "The windows was cleaned yesterday.", answers: ["The windows were cleaned yesterday."], explanation: "Plural → were." },
    ],
  },
  {
    id: "en:g:reported-speech",
    language: "en",
    title: "Estilo indirecto (reported speech)",
    cefr: "B2",
    errorCategory: "reported-speech",
    summary:
      "Para contar lo que alguien dijo, normalmente se «retrocede» un tiempo verbal (backshift) y se ajustan pronombres y expresiones de tiempo. say no lleva persona detrás; tell sí.",
    whenToUse: ["Contar conversaciones: She said (that) she was tired.", "Preguntas indirectas: He asked where I lived (orden de afirmación)."],
    formation: [
      "Presente → pasado: «I am tired» → She said she was tired.",
      "Pasado / perfecto → past perfect: «I saw it» → He said he had seen it.",
      "will → would · can → could · today → that day · tomorrow → the next day.",
      "say something / tell someone something.",
    ],
    commonMistakes: [
      { wrong: "She said me that she was busy.", right: "She told me that she was busy.", why: "Con persona se usa tell." },
      { wrong: "He asked me where did I live.", right: "He asked me where I lived.", why: "En pregunta indirecta no hay inversión ni do." },
    ],
    examples: [
      { text: "She said she would call me later.", translation: es("Dijo que me llamaría más tarde.") },
      { text: "They asked if we had finished.", translation: es("Preguntaron si habíamos terminado.") },
    ],
    contrasts: [{ a: "«I'm leaving» → He said he was leaving.", b: "«I'll leave» → He said he would leave.", explanation: "Cada tiempo retrocede un paso." }],
    exercises: [
      { type: "mc", prompt: "«I'm hungry.» → She said she ___ hungry.", options: ["was", "is", "has been", "will be"], answers: ["was"], explanation: "Presente → pasado." },
      { type: "mc", prompt: "He ___ me that the meeting was cancelled.", options: ["told", "said", "spoke", "asked"], answers: ["told"], explanation: "tell + persona." },
      { type: "mc", prompt: "«Where do you work?» → She asked me where I ___.", options: ["worked", "did work", "do work", "work did"], answers: ["worked"], explanation: "Orden de afirmación y backshift." },
      { type: "correct", prompt: "He said me he was sorry.", answers: ["He told me he was sorry.", "He said he was sorry."], explanation: "say no lleva persona; con persona, tell." },
    ],
  },
  {
    id: "en:g:relative-clauses",
    language: "en",
    title: "Oraciones de relativo: who, which, that, whose",
    cefr: "B2",
    errorCategory: "relative-clauses",
    summary:
      "Las relativas especificativas (sin comas) identifican de quién hablas; las explicativas (con comas) añaden información extra y no admiten that. El pronombre objeto se puede omitir en las especificativas.",
    whenToUse: ["who (personas), which (cosas), that (ambas, sólo especificativas), whose (posesión), where (lugar)."],
    formation: [
      "Especificativa: The man who lives next door is a doctor.",
      "Explicativa: My brother, who lives in Madrid, is a doctor.",
      "Omisión del objeto: The film (that) we saw was great.",
    ],
    commonMistakes: [
      { wrong: "My car, that is red, is new.", right: "My car, which is red, is new.", why: "Con comas no se usa that." },
      { wrong: "The woman which called you…", right: "The woman who called you…", why: "Personas → who." },
    ],
    examples: [
      { text: "The app that I use every day is free.", translation: es("La app que uso todos los días es gratis.") },
      { text: "She's the teacher whose class I took.", translation: es("Es la profesora cuya clase tomé.") },
    ],
    contrasts: [{ a: "My sister who lives in Paris… (tengo varias)", b: "My sister, who lives in Paris, … (sólo una)", explanation: "Las comas cambian el significado." }],
    exercises: [
      { type: "mc", prompt: "That's the man ___ car was stolen.", options: ["whose", "who", "which", "that's"], answers: ["whose"], explanation: "Posesión → whose." },
      { type: "mc", prompt: "Lima, ___ is the capital of Peru, is huge.", options: ["which", "that", "who", "where"], answers: ["which"], explanation: "Explicativa de cosa → which (no that)." },
      { type: "mc", prompt: "This is the café ___ we first met.", options: ["where", "which", "who", "whose"], answers: ["where"], explanation: "Lugar → where." },
      { type: "mc", prompt: "The people ___ work here are friendly.", options: ["who", "which", "whose", "where"], answers: ["who"], explanation: "Personas → who." },
    ],
  },
  {
    id: "en:g:mixed-conditionals",
    language: "en",
    title: "Condicionales mixtas y wish / if only",
    cefr: "C1",
    errorCategory: "conditionals",
    summary:
      "Las condicionales mixtas cruzan tiempos: una condición pasada con un resultado presente, o al revés. wish / if only expresan arrepentimiento o deseos irreales con un tiempo «hacia atrás».",
    whenToUse: [
      "Pasado → presente: If I had studied medicine, I would be a doctor now.",
      "Presente → pasado: If I were braver, I would have said something.",
      "wish + pasado (presente irreal) · wish + past perfect (pasado irreal) · wish + would (queja).",
    ],
    formation: [
      "If + past perfect, would + infinitivo.",
      "If + past simple, would have + participio.",
      "I wish I knew · I wish I had known · I wish you would stop.",
    ],
    commonMistakes: [
      { wrong: "I wish I would have more time.", right: "I wish I had more time.", why: "Deseo sobre el presente: wish + pasado." },
      { wrong: "If I would have known, I would have come.", right: "If I had known, I would have come.", why: "En la condición no se usa would." },
    ],
    examples: [
      { text: "If I had saved more, I wouldn't be so worried now.", translation: es("Si hubiera ahorrado más, ahora no estaría tan preocupado.") },
      { text: "I wish I had listened to you.", translation: es("Ojalá te hubiera hecho caso.") },
    ],
    contrasts: [{ a: "I wish I spoke Japanese. (ahora)", b: "I wish I had learned Japanese. (antes)", explanation: "El tiempo retrocede un paso según a qué se refiere el deseo." }],
    exercises: [
      { type: "mc", prompt: "If she had taken the job, she ___ in London now.", options: ["would live", "would have lived", "will live", "lived"], answers: ["would live"], explanation: "Condición pasada, resultado presente." },
      { type: "mc", prompt: "I wish I ___ taller.", options: ["were", "am", "would be", "had been being"], answers: ["were"], explanation: "Deseo presente: wish + pasado (were)." },
      { type: "mc", prompt: "If only I ___ that message!", options: ["hadn't sent", "didn't send", "wouldn't send", "haven't sent"], answers: ["hadn't sent"], explanation: "Arrepentimiento pasado: past perfect." },
      { type: "correct", prompt: "If I would have known, I would have helped.", answers: ["If I had known, I would have helped."], explanation: "Condición: past perfect, sin would." },
    ],
  },
  {
    id: "en:g:modal-perfects",
    language: "en",
    title: "Modales en pasado: should have, might have, must have",
    cefr: "C1",
    errorCategory: "modals",
    summary:
      "modal + have + participio habla del pasado: críticas o arrepentimientos (should have), deducciones (must have / can't have) y posibilidades (might / could have).",
    whenToUse: [
      "should(n't) have: lo correcto que no se hizo.",
      "must have / can't have: deducción casi segura.",
      "might / may / could have: posibilidad.",
    ],
    formation: ["modal + have + participio: You should have told me.", "Negativa: shouldn't have, can't have, might not have."],
    commonMistakes: [
      { wrong: "You should told me.", right: "You should have told me.", why: "Pasado: modal + have + participio." },
      { wrong: "She mustn't have seen it. (deducción)", right: "She can't have seen it.", why: "Deducción negativa → can't have." },
    ],
    examples: [
      { text: "You must have been exhausted after the trip.", translation: es("Debiste de acabar agotado después del viaje.") },
      { text: "I shouldn't have eaten so much.", translation: es("No debí comer tanto.") },
    ],
    contrasts: [{ a: "He might have missed the bus. (quizá)", b: "He must have missed the bus. (seguro)", explanation: "Grado de certeza de la deducción." }],
    exercises: [
      { type: "mc", prompt: "The streets are wet. It ___ rained last night.", options: ["must have", "should have", "can't have", "needn't have"], answers: ["must have"], explanation: "Deducción segura → must have." },
      { type: "mc", prompt: "You ___ told me earlier! Now it's too late.", options: ["should have", "must have", "might have", "can't have"], answers: ["should have"], explanation: "Reproche → should have." },
      { type: "mc", prompt: "She ___ seen me; she was looking the other way.", options: ["can't have", "must have", "should have", "would have"], answers: ["can't have"], explanation: "Deducción negativa → can't have." },
      { type: "fill", prompt: "I'm not sure where he is. He might ___ gone home.", answers: ["have"], explanation: "might have + participio." },
    ],
  },
];
