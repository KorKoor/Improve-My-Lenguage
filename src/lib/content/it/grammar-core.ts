import type { GrammarConcept } from "../types";

/** Italiano: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const IT_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "it:g:ce-ci-sono",
    language: "it",
    title: "C'è / ci sono (hay)",
    cefr: "A1",
    errorCategory: "it:ce",
    summary: "«Hay» se dice c'è con singular y ci sono con plural. No existe una forma invariable como el «hay» español.",
    whenToUse: ["Describir lugares: C'è un bar qui vicino?", "Cantidades: Ci sono tre camere."],
    formation: ["c'è + singular · ci sono + plural.", "Negativa: non c'è / non ci sono.", "Pasado: c'era / c'erano · c'è stato/a."],
    commonMistakes: [
      { wrong: "C'è molti turisti.", right: "Ci sono molti turisti.", why: "Plural → ci sono." },
      { wrong: "Ha un problema qui.", right: "C'è un problema qui.", why: "«Hay» no se traduce con avere." },
    ],
    examples: [
      { text: "C'è una farmacia aperta?", translation: es("¿Hay una farmacia abierta?") },
      { text: "Non ci sono più biglietti.", translation: es("Ya no hay entradas.") },
    ],
    contrasts: [{ a: "C'è Marco?", b: "Marco è a casa.", explanation: "C'è pregunta si alguien está/hay; è + lugar dice dónde está." }],
    exercises: [
      { type: "mc", prompt: "___ un supermercato qui vicino?", options: ["C'è", "Ci sono", "Ha", "È"], answers: ["C'è"], explanation: "Singular → c'è." },
      { type: "mc", prompt: "Nel frigo ___ due bottiglie.", options: ["ci sono", "c'è", "hanno", "sono"], answers: ["ci sono"], explanation: "Plural → ci sono." },
      { type: "fill", prompt: "Ieri ___ tanta gente alla festa. (c'era/c'erano)", answers: ["c'era"], explanation: "Gente es singular en italiano → c'era." },
      { type: "correct", prompt: "C'è tre persone in fila.", answers: ["Ci sono tre persone in fila."], explanation: "Plural → ci sono." },
    ],
  },
  {
    id: "it:g:possessivi",
    language: "it",
    title: "Posesivos con artículo: il mio, la mia… (y mia madre)",
    cefr: "A1",
    errorCategory: "it:possessives",
    summary:
      "En italiano el posesivo va con artículo: la mia casa, il tuo libro. Excepción: con familiares en singular y sin adjetivo no se pone artículo (mia madre, tuo fratello), salvo con loro (la loro madre).",
    whenToUse: ["Objetos: il mio telefono.", "Familia: mio padre, i miei genitori."],
    formation: [
      "il mio / la mia / i miei / le mie · il tuo … · il suo … · il nostro … · il vostro … · il loro …",
      "Familiar singular: mia sorella (sin artículo); plural o con adjetivo: le mie sorelle, la mia sorellina.",
    ],
    commonMistakes: [
      { wrong: "Mia casa è grande.", right: "La mia casa è grande.", why: "Con objetos, artículo + posesivo." },
      { wrong: "La mia madre è medico.", right: "Mia madre è medico.", why: "Familiar en singular: sin artículo." },
    ],
    examples: [
      { text: "I miei amici arrivano domani.", translation: es("Mis amigos llegan mañana.") },
      { text: "Suo fratello vive a Roma.", translation: es("Su hermano vive en Roma.") },
    ],
    contrasts: [{ a: "mio fratello", b: "i miei fratelli", explanation: "Singular sin artículo / plural con artículo." }],
    exercises: [
      { type: "mc", prompt: "Dov'è ___ borsa?", options: ["la mia", "mia", "il mio", "mio"], answers: ["la mia"], explanation: "Borsa (fem.) → la mia." },
      { type: "mc", prompt: "___ padre lavora in banca.", options: ["Mio", "Il mio", "La mia", "Miei"], answers: ["Mio"], explanation: "Familiar singular → sin artículo." },
      { type: "fill", prompt: "___ loro figlia studia a Milano. (artículo)", answers: ["La"], explanation: "Con loro siempre artículo." },
      { type: "correct", prompt: "Mia macchina è rossa.", answers: ["La mia macchina è rossa."], explanation: "Objeto → la mia." },
    ],
  },
  {
    id: "it:g:riflessivi",
    language: "it",
    title: "Verbos reflexivos: mi alzo, ti chiami…",
    cefr: "A2",
    errorCategory: "it:reflexive",
    summary:
      "Como en español: mi, ti, si, ci, vi, si. En el passato prossimo usan siempre essere y el participio concuerda: mi sono alzata (yo, mujer).",
    whenToUse: ["Rutinas: svegliarsi, alzarsi, lavarsi, vestirsi.", "Emociones: annoiarsi, divertirsi."],
    formation: ["Presente: mi lavo, ti lavi, si lava, ci laviamo, vi lavate, si lavano.", "Passato: essere + participio concordado: ci siamo divertiti."],
    commonMistakes: [
      { wrong: "Mi ho svegliato alle sette.", right: "Mi sono svegliato alle sette.", why: "Reflexivos → essere." },
      { wrong: "Maria si è alzato tardi.", right: "Maria si è alzata tardi.", why: "Concordancia con Maria." },
    ],
    examples: [
      { text: "Come ti chiami?", translation: es("¿Cómo te llamas?") },
      { text: "Ci siamo divertiti molto alla festa.", translation: es("Nos divertimos mucho en la fiesta.") },
    ],
    contrasts: [{ a: "Lavo la macchina.", b: "Mi lavo.", explanation: "Lavar algo / lavarse uno mismo." }],
    exercises: [
      { type: "mc", prompt: "A che ora ___ la mattina?", options: ["ti svegli", "svegli", "si sveglia te", "sei svegliato"], answers: ["ti svegli"], explanation: "Tú → ti svegli." },
      { type: "mc", prompt: "Ieri Laura ___ presto.", options: ["si è alzata", "si ha alzata", "ha alzato", "si è alzato"], answers: ["si è alzata"], explanation: "Essere + concordancia femenina." },
      { type: "fill", prompt: "Noi ___ vestiamo in fretta.", answers: ["ci"], explanation: "Noi → ci." },
      { type: "correct", prompt: "Mi ho divertito molto.", answers: ["Mi sono divertito molto.", "Mi sono divertita molto."], explanation: "Reflexivo → sono." },
    ],
  },
  {
    id: "it:g:comparativi",
    language: "it",
    title: "Comparativos: più … di / più … che",
    cefr: "A2",
    errorCategory: "it:comparatives",
    summary:
      "Más/menos … que se dice più/meno … di cuando se comparan dos nombres o pronombres (Marco è più alto di Luca) y più … che cuando se comparan dos adjetivos, verbos o cantidades (più bello che utile). Irregulares: migliore, peggiore, meglio, peggio.",
    whenToUse: ["Comparar personas o cosas.", "Superlativo relativo: il più bello di tutti."],
    formation: ["più/meno + adjetivo + di (+ artículo: del, della…).", "più/meno … che entre adjetivos, verbos o con preposición.", "Igualdad: (così) … come / (tanto) … quanto."],
    commonMistakes: [
      { wrong: "Roma è più grande che Firenze.", right: "Roma è più grande di Firenze.", why: "Entre dos nombres → di." },
      { wrong: "Questo vino è più migliore.", right: "Questo vino è migliore.", why: "Migliore ya es comparativo: no lleva più." },
    ],
    examples: [
      { text: "Mio fratello è più giovane di me.", translation: es("Mi hermano es más joven que yo.") },
      { text: "È meglio tardi che mai.", translation: es("Más vale tarde que nunca.") },
    ],
    contrasts: [{ a: "più alto di Luca", b: "più simpatico che bello", explanation: "Dos personas (di) frente a dos adjetivos (che)." }],
    exercises: [
      { type: "mc", prompt: "Il treno è più veloce ___ autobus.", options: ["dell'", "che l'", "di", "come"], answers: ["dell'"], explanation: "Di + l' → dell'." },
      { type: "mc", prompt: "Mi piace più leggere ___ guardare la TV.", options: ["che", "di", "del", "come"], answers: ["che"], explanation: "Entre dos verbos → che." },
      { type: "fill", prompt: "Questa pizza è la ___ della città. (mejor)", answers: ["migliore"], explanation: "Buono → migliore." },
      { type: "correct", prompt: "Anna è più alta che Marta.", answers: ["Anna è più alta di Marta."], explanation: "Entre dos nombres → di." },
    ],
  },
  {
    id: "it:g:stare-gerundio",
    language: "it",
    title: "Stare + gerundio y stare per",
    cefr: "A2",
    errorCategory: "it:stare",
    summary:
      "Stare + gerundio expresa lo que está pasando ahora (sto mangiando). Stare per + infinitivo, algo que está a punto de pasar (sto per uscire). Ojo: «estoy cansado» es sono stanco, no sto stanco.",
    whenToUse: ["Acción en curso: Cosa stai facendo?", "Inminencia: Il film sta per cominciare."],
    formation: ["stare (sto, stai, sta, stiamo, state, stanno) + -ando / -endo.", "stare per + infinitivo."],
    commonMistakes: [
      { wrong: "Sto stanco.", right: "Sono stanco.", why: "Estados → essere." },
      { wrong: "Sto per mangiando.", right: "Sto per mangiare.", why: "Stare per + infinitivo." },
    ],
    examples: [
      { text: "Sto lavorando, ti chiamo dopo.", translation: es("Estoy trabajando, te llamo luego.") },
      { text: "Stavamo per uscire quando è arrivato.", translation: es("Estábamos a punto de salir cuando llegó.") },
    ],
    contrasts: [{ a: "Sto uscendo.", b: "Sto per uscire.", explanation: "Estoy saliendo / estoy a punto de salir." }],
    exercises: [
      { type: "mc", prompt: "Silenzio, il bambino ___ dormendo.", options: ["sta", "è", "ha", "sto"], answers: ["sta"], explanation: "Stare + gerundio." },
      { type: "mc", prompt: "Sbrigati, il treno sta per ___!", options: ["partire", "partendo", "partito", "parte"], answers: ["partire"], explanation: "Stare per + infinitivo." },
      { type: "fill", prompt: "Cosa ___ facendo? (tú)", answers: ["stai"], explanation: "Tú → stai." },
      { type: "correct", prompt: "Oggi sto molto felice.", answers: ["Oggi sono molto felice."], explanation: "Estado → essere." },
    ],
  },
  {
    id: "it:g:trapassato",
    language: "it",
    title: "Trapassato prossimo (había hecho)",
    cefr: "B1",
    errorCategory: "it:trapassato",
    summary: "Imperfetto de avere o essere + participio: una acción anterior a otra pasada, como nuestro pluscuamperfecto.",
    whenToUse: ["Quando sono arrivato, il film era già cominciato.", "Explicar causas pasadas: Non avevo dormito."],
    formation: ["avevo/ero + participio (mismo auxiliar que el passato prossimo).", "Con essere, concordancia: erano partiti."],
    commonMistakes: [
      { wrong: "Quando sono arrivata, lui è già uscito.", right: "Quando sono arrivata, lui era già uscito.", why: "Anterior a otro pasado → trapassato." },
      { wrong: "Avevamo andati al mare.", right: "Eravamo andati al mare.", why: "Andare usa essere." },
    ],
    examples: [
      { text: "Non avevo mai visto Venezia prima.", translation: es("Nunca había visto Venecia antes.") },
      { text: "Erano già usciti quando ho chiamato.", translation: es("Ya habían salido cuando llamé.") },
    ],
    contrasts: [{ a: "Ha finito quando sono arrivato.", b: "Aveva finito quando sono arrivato.", explanation: "Terminó en ese momento / ya había terminado." }],
    exercises: [
      { type: "mc", prompt: "Non sono venuto perché ___ il treno.", options: ["avevo perso", "ho perso", "ero perso", "perdevo"], answers: ["avevo perso"], explanation: "Anterior → avevo perso." },
      { type: "mc", prompt: "Quando siamo arrivati, loro ___ già partiti.", options: ["erano", "avevano", "sono", "hanno"], answers: ["erano"], explanation: "Partire usa essere." },
      { type: "fill", prompt: "Lei ___ già mangiato. (avere, trapassato)", answers: ["aveva"], explanation: "Lei aveva mangiato." },
      { type: "correct", prompt: "Avevano arrivati tardi.", answers: ["Erano arrivati tardi."], explanation: "Arrivare usa essere." },
    ],
  },
  {
    id: "it:g:pronomi-combinati",
    language: "it",
    title: "Pronombres combinados: me lo, glielo, ce ne…",
    cefr: "B2",
    errorCategory: "it:combined-pronouns",
    summary:
      "Cuando se juntan indirecto + directo, mi/ti/ci/vi pasan a me/te/ce/ve (me lo dai?) y gli/le se convierten en glie- unido: glielo, gliela, glieli (a él, a ella o a usted).",
    whenToUse: ["Evitar repetir: Il libro? Te lo presto.", "Con ne: Me ne dai un po'?"],
    formation: ["me lo, te la, ce li, ve le…", "glielo / gliela / glieli / gliele / gliene.", "Con infinitivo o imperativo van unidos al final: dammelo, portarglielo."],
    commonMistakes: [
      { wrong: "Mi lo dai?", right: "Me lo dai?", why: "Mi + lo → me lo." },
      { wrong: "Le lo dico.", right: "Glielo dico.", why: "Le + lo → glielo." },
    ],
    examples: [
      { text: "Le chiavi? Te le porto domani.", translation: es("¿Las llaves? Te las traigo mañana.") },
      { text: "Gliel'ho già detto.", translation: es("Ya se lo he dicho.") },
    ],
    contrasts: [{ a: "Se lo digo (español)", b: "Glielo dico (italiano)", explanation: "El «se» español corresponde a glie-." }],
    exercises: [
      { type: "mc", prompt: "La foto? ___ mando stasera. (a ti)", options: ["Te la", "Ti la", "Te lo", "Gliela"], answers: ["Te la"], explanation: "Ti + la → te la." },
      { type: "mc", prompt: "Il regalo a Marco? ___ do domani.", options: ["Glielo", "Le lo", "Gli lo", "Se lo"], answers: ["Glielo"], explanation: "Gli + lo → glielo." },
      { type: "fill", prompt: "Hai del pane? ___ ne dai un po'? (a mí)", answers: ["Me"], explanation: "Mi + ne → me ne." },
      { type: "correct", prompt: "Mi lo spieghi?", answers: ["Me lo spieghi?"], explanation: "Mi + lo → me lo." },
    ],
  },
  {
    id: "it:g:si-impersonale",
    language: "it",
    title: "Si impersonal y pasivo: si mangia bene, si vendono case",
    cefr: "B2",
    errorCategory: "it:si",
    summary:
      "Como el «se» español: si mangia bene qui (se come bien). Con un sustantivo plural, el verbo concuerda: si vendono case. En tiempos compuestos usa essere: si è parlato di te.",
    whenToUse: ["Normas y generalizaciones: In Italia si cena tardi.", "Carteles: Si affittano appartamenti."],
    formation: ["si + verbo en 3.ª persona.", "Con objeto plural → verbo plural.", "Adjetivos tras si impersonal van en plural: si è contenti."],
    commonMistakes: [
      { wrong: "Si vende biciclette.", right: "Si vendono biciclette.", why: "Plural → vendono." },
      { wrong: "Qui si ha mangiato bene.", right: "Qui si è mangiato bene.", why: "Tiempos compuestos con essere." },
    ],
    examples: [
      { text: "Come si dice «ventana» in italiano?", translation: es("¿Cómo se dice «ventana» en italiano?") },
      { text: "In estate si va al mare.", translation: es("En verano se va a la playa.") },
    ],
    contrasts: [{ a: "Si parla italiano.", b: "Si parlano molte lingue.", explanation: "Singular / plural según el sustantivo." }],
    exercises: [
      { type: "mc", prompt: "In questo ristorante ___ piatti tipici.", options: ["si mangiano", "si mangia", "mangiano si", "si è mangiato"], answers: ["si mangiano"], explanation: "Piatti (plural) → si mangiano." },
      { type: "mc", prompt: "Come ___ questa parola?", options: ["si scrive", "si scrivono", "scrive si", "si ha scritto"], answers: ["si scrive"], explanation: "Parola singular → si scrive." },
      { type: "fill", prompt: "Ieri si ___ parlato molto di politica.", answers: ["è"], explanation: "Compuesto con essere." },
      { type: "correct", prompt: "Si affitta appartamenti.", answers: ["Si affittano appartamenti."], explanation: "Plural → affittano." },
    ],
  },
  {
    id: "it:g:congiuntivo-imperfetto",
    language: "it",
    title: "Congiuntivo imperfetto y concordancia de tiempos",
    cefr: "C1",
    errorCategory: "it:congiuntivo-imperfetto",
    summary:
      "Si el verbo principal está en pasado o condicional, el subjuntivo pasa a imperfetto: Pensavo che fosse vero · Vorrei che tu venissi. Formas clave: fossi, avessi, facessi, dicessi, stessi.",
    whenToUse: ["Tras pensavo/credevo/volevo che…", "Tras vorrei che…", "En hipótesis: se avessi tempo…"],
    formation: ["-are: parlassi · -ere: credessi · -ire: partissi.", "Irregulares: essere → fossi, dare → dessi, stare → stessi, fare → facessi."],
    commonMistakes: [
      { wrong: "Pensavo che era vero.", right: "Pensavo che fosse vero.", why: "Pensare che + congiuntivo; en pasado → imperfetto." },
      { wrong: "Vorrei che tu vieni.", right: "Vorrei che tu venissi.", why: "Vorrei che + congiuntivo imperfetto." },
    ],
    examples: [
      { text: "Se fossi in te, accetterei.", translation: es("Yo que tú aceptaría.") },
      { text: "Volevano che restassimo a cena.", translation: es("Querían que nos quedáramos a cenar.") },
    ],
    contrasts: [{ a: "Penso che sia giusto.", b: "Pensavo che fosse giusto.", explanation: "Presente → congiuntivo presente; pasado → imperfetto." }],
    exercises: [
      { type: "mc", prompt: "Credevo che tu ___ italiano.", options: ["fossi", "sei", "sia", "eri"], answers: ["fossi"], explanation: "Pasado → fossi." },
      { type: "mc", prompt: "Vorrei che voi ___ più attenzione.", options: ["faceste", "fate", "facciate", "facevate"], answers: ["faceste"], explanation: "Vorrei che → imperfetto: faceste." },
      { type: "fill", prompt: "Se ___ più soldi, viaggerei. (avere, io)", answers: ["avessi"], explanation: "Hipótesis → avessi." },
      { type: "correct", prompt: "Speravo che venivi alla festa.", answers: ["Speravo che venissi alla festa."], explanation: "Speravo che + congiuntivo imperfetto." },
    ],
  },
];
