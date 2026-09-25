import type { GrammarConcept } from "../types";

/** Italiano A2–C1: continúa el programa de it/index.ts. Revisión humana recomendada. */
const es = (t: string) => ({ es: t });

export const IT_GRAMMAR_ADVANCED: GrammarConcept[] = [
  {
    id: "it:g:preposizioni-articolate",
    language: "it",
    title: "Preposiciones articuladas: del, nel, sul, al…",
    cefr: "A2",
    errorCategory: "it:prepositions",
    summary: "Las preposiciones di, a, da, in, su se funden con el artículo definido: di + il = del, in + la = nella, su + gli = sugli. Es obligatorio.",
    whenToUse: ["Siempre que la preposición va seguida de artículo definido: Vado al cinema. Il libro è sul tavolo."],
    formation: ["a + il = al, a + la = alla, a + lo = allo, a + i = ai…", "in + il = nel, in + la = nella · di + il = del · su + il = sul · da + il = dal.", "con y per normalmente no se funden."],
    commonMistakes: [
      { wrong: "Vado a il mare.", right: "Vado al mare.", why: "a + il = al." },
      { wrong: "Il libro è su il tavolo.", right: "Il libro è sul tavolo.", why: "su + il = sul." },
    ],
    examples: [
      { text: "Le chiavi sono nella borsa.", translation: es("Las llaves están en el bolso.") },
      { text: "Torno dal lavoro alle sei.", translation: es("Vuelvo del trabajo a las seis.") },
    ],
    contrasts: [{ a: "in Italia (sin artículo)", b: "negli Stati Uniti (con artículo)", explanation: "Algunos lugares llevan artículo y otros no." }],
    exercises: [
      { type: "mc", prompt: "Il gatto dorme ___ divano.", options: ["sul", "su il", "nel", "al"], answers: ["sul"], explanation: "su + il = sul." },
      { type: "mc", prompt: "Andiamo ___ stazione.", options: ["alla", "a la", "nella", "della"], answers: ["alla"], explanation: "a + la = alla." },
      { type: "mc", prompt: "Il libro ___ professore è nuovo.", options: ["del", "di il", "dal", "al"], answers: ["del"], explanation: "di + il = del." },
      { type: "mc", prompt: "Metti il latte ___ frigo.", options: ["nel", "in il", "sul", "al"], answers: ["nel"], explanation: "in + il = nel." },
    ],
  },
  {
    id: "it:g:imperfetto",
    language: "it",
    title: "Imperfetto frente a passato prossimo",
    cefr: "B1",
    errorCategory: "it:imperfect",
    summary: "Igual que en español: el imperfetto describe, habla de hábitos y de acciones en curso; el passato prossimo, de hechos puntuales terminados.",
    whenToUse: ["Imperfetto: Da bambino giocavo a calcio. Mentre leggevo…", "Passato prossimo: …è suonato il telefono."],
    formation: ["-are → -avo, -avi, -ava, -avamo, -avate, -avano (parlavo).", "-ere → -evo (leggevo) · -ire → -ivo (dormivo).", "essere: ero, eri, era, eravamo, eravate, erano."],
    commonMistakes: [
      { wrong: "Quando sono stato piccolo, ho abitato a Roma.", right: "Quando ero piccolo, abitavo a Roma.", why: "Descripción y hábito pasados → imperfetto." },
      { wrong: "Mentre dormivo, suonava il telefono. (una vez)", right: "Mentre dormivo, è suonato il telefono.", why: "La acción puntual que interrumpe → passato prossimo." },
    ],
    examples: [
      { text: "Faceva freddo, così siamo rimasti a casa.", translation: es("Hacía frío, así que nos quedamos en casa.") },
      { text: "Ogni estate andavamo al mare.", translation: es("Cada verano íbamos al mar.") },
    ],
    contrasts: [{ a: "Leggevo. (leía)", b: "Ho letto. (leí)", explanation: "El mismo contraste que imperfecto / indefinido." }],
    exercises: [
      { type: "mc", prompt: "Da piccola ___ molto timida.", options: ["ero", "sono stata", "sarò", "sono"], answers: ["ero"], explanation: "Descripción pasada → imperfetto." },
      { type: "mc", prompt: "Mentre cucinavo, ___ Marco.", options: ["è arrivato", "arrivava", "arriva", "arriverà"], answers: ["è arrivato"], explanation: "Acción puntual → passato prossimo." },
      { type: "mc", prompt: "Ogni domenica ___ dai nonni.", options: ["andavamo", "siamo andati", "andremo", "andiamo stati"], answers: ["andavamo"], explanation: "Hábito → imperfetto." },
      { type: "mc", prompt: "Ieri ___ un bel film.", options: ["ho visto", "vedevo", "vedo", "vedrò"], answers: ["ho visto"], explanation: "Hecho puntual → passato prossimo." },
    ],
  },
  {
    id: "it:g:pronomi",
    language: "it",
    title: "Pronombres de objeto y ne",
    cefr: "B1",
    errorCategory: "it:pronouns",
    summary: "lo, la, li, le (directos) y gli, le (indirectos) van delante del verbo conjugado; con infinitivo se pegan detrás (vederlo). ne sustituye a cantidades o a «di + algo».",
    whenToUse: ["Lo conosco. Le telefono domani. Quante mele vuoi? Ne voglio tre."],
    formation: ["Directos: mi, ti, lo, la, ci, vi, li, le.", "Indirectos: mi, ti, gli (a él), le (a ella / usted), ci, vi, gli (a ellos).", "En tiempos compuestos el participio concuerda con lo/la/li/le: L'ho vista."],
    commonMistakes: [
      { wrong: "Gli ho visto Maria.", right: "L'ho vista.", why: "vedere es directo; y el participio concuerda: vista." },
      { wrong: "Voglio tre.", right: "Ne voglio tre.", why: "Cantidad sin sustantivo → ne." },
    ],
    examples: [
      { text: "Hai visto le chiavi? — Sì, le ho messe sul tavolo.", translation: es("¿Viste las llaves? — Sí, las puse en la mesa.") },
      { text: "Quanti anni hai? — Ne ho trenta.", translation: es("¿Cuántos años tienes? — Tengo treinta.") },
    ],
    contrasts: [{ a: "La chiamo. (a ella — directo)", b: "Le telefono. (le llamo — indirecto)", explanation: "telefonare a → indirecto." }],
    exercises: [
      { type: "mc", prompt: "Conosci Paolo? — Sì, ___ conosco.", options: ["lo", "gli", "la", "ne"], answers: ["lo"], explanation: "Directo masculino → lo." },
      { type: "mc", prompt: "Scrivi a tua madre? — Sì, ___ scrivo ogni giorno.", options: ["le", "la", "gli", "lo"], answers: ["le"], explanation: "scrivere a lei → le." },
      { type: "mc", prompt: "Quanti caffè bevi? — ___ bevo due.", options: ["Ne", "Li", "Lo", "Ci"], answers: ["Ne"], explanation: "Cantidad → ne." },
      { type: "mc", prompt: "Hai comprato la pizza? — Sì, l'ho ___.", options: ["comprata", "comprato", "comprati", "comprate"], answers: ["comprata"], explanation: "Concordancia con la (femenino)." },
    ],
  },
  {
    id: "it:g:futuro",
    language: "it",
    title: "Futuro simple",
    cefr: "B1",
    errorCategory: "it:future",
    summary: "El futuro italiano se usa para planes y también para suposiciones sobre el presente («saranno le otto» = serán las ocho). Muchos verbos acortan la raíz.",
    whenToUse: ["Planes y predicciones: Domani partirò.", "Suposición: Dove sarà Luca? Sarà al lavoro."],
    formation: ["-are/-ere → -erò, -erai, -erà, -eremo, -erete, -eranno: parlerò, leggerò.", "-ire → -irò: dormirò.", "Irregulares: essere → sarò, avere → avrò, andare → andrò, fare → farò, venire → verrò, volere → vorrò."],
    commonMistakes: [
      { wrong: "Io parlarò.", right: "Io parlerò.", why: "-are cambia la a por e en el futuro." },
      { wrong: "Io anderò.", right: "Io andrò.", why: "andare tiene raíz corta: andr-." },
    ],
    examples: [
      { text: "L'anno prossimo studierò in Italia.", translation: es("El año que viene estudiaré en Italia.") },
      { text: "Non risponde: sarà occupato.", translation: es("No contesta: estará ocupado.") },
    ],
    contrasts: [{ a: "Domani vado a Roma. (plan cercano, presente)", b: "Un giorno andrò in Giappone. (futuro)", explanation: "Como en español, el presente sirve para planes cercanos." }],
    exercises: [
      { type: "mc", prompt: "Domani ___ tardi. (lavorare)", options: ["lavorerò", "lavorarò", "lavoro stato", "lavorai"], answers: ["lavorerò"], explanation: "-are → -erò." },
      { type: "mc", prompt: "Quando ___ in Italia? (venire, tu)", options: ["verrai", "venirai", "vieni stai", "verrò"], answers: ["verrai"], explanation: "venire → verr-." },
      { type: "mc", prompt: "Che ore sono? — ___ le dieci. (suposición)", options: ["Saranno", "Sono state", "Erano", "Siano"], answers: ["Saranno"], explanation: "Futuro de suposición." },
      { type: "mc", prompt: "Il prossimo anno ___ una macchina. (avere, noi)", options: ["avremo", "averemo", "abbiamo avuto", "avevamo"], answers: ["avremo"], explanation: "avere → avr-." },
    ],
  },
  {
    id: "it:g:congiuntivo",
    language: "it",
    title: "Congiuntivo presente",
    cefr: "B2",
    errorCategory: "it:subjunctive",
    summary: "Se usa tras verbos de opinión, deseo, duda o emoción (penso che, voglio che, credo che) y tras conjunciones como benché, affinché, prima che. A diferencia del español, pensare/credere che llevan congiuntivo incluso en afirmativo.",
    whenToUse: ["Penso che sia vero. Voglio che tu venga. Benché piova, esco."],
    formation: ["-are → -i: che io parli. -ere/-ire → -a: che io legga, che io dorma.", "Irregulares: essere (sia), avere (abbia), andare (vada), fare (faccia), venire (venga), potere (possa).", "Las tres personas del singular coinciden: che io/tu/lui parli."],
    commonMistakes: [
      { wrong: "Penso che è vero.", right: "Penso che sia vero.", why: "pensare che → congiuntivo (en español, indicativo)." },
      { wrong: "Voglio che tu vieni.", right: "Voglio che tu venga.", why: "Deseo → congiuntivo." },
    ],
    examples: [
      { text: "Credo che Marco abbia ragione.", translation: es("Creo que Marco tiene razón.") },
      { text: "È importante che tu dorma bene.", translation: es("Es importante que duermas bien.") },
    ],
    contrasts: [{ a: "So che è vero. (certeza → indicativo)", b: "Penso che sia vero. (opinión → congiuntivo)", explanation: "Certeza frente a opinión." }],
    exercises: [
      { type: "mc", prompt: "Penso che Giulia ___ stanca.", options: ["sia", "è", "sarà", "era"], answers: ["sia"], explanation: "Opinión → congiuntivo." },
      { type: "mc", prompt: "Voglio che tu ___ con noi.", options: ["venga", "vieni", "verrai", "venissi"], answers: ["venga"], explanation: "Deseo → congiuntivo." },
      { type: "mc", prompt: "Benché ___, usciamo.", options: ["piova", "piove", "pioverà", "pioveva"], answers: ["piova"], explanation: "benché → congiuntivo." },
      { type: "mc", prompt: "So che Luca ___ a Milano.", options: ["abita", "abiti", "abitasse", "abitare"], answers: ["abita"], explanation: "Certeza (sapere) → indicativo." },
    ],
  },
  {
    id: "it:g:condizionale",
    language: "it",
    title: "Condicional y periodo hipotético",
    cefr: "C1",
    errorCategory: "it:conditional",
    summary: "El condicional expresa cortesía y consecuencias hipotéticas. En el periodo hipotético irreal: se + congiuntivo imperfetto → condizionale; se + congiuntivo trapassato → condizionale passato.",
    whenToUse: ["Cortesía: Vorrei un caffè.", "Irreal presente: Se avessi tempo, viaggerei.", "Irreal pasado: Se l'avessi saputo, sarei venuto."],
    formation: ["Condizionale: raíz del futuro + -ei, -esti, -ebbe, -emmo, -este, -ebbero: parlerei, sarei, avrei.", "Congiuntivo imperfetto: parlassi, leggessi, fossi, avessi.", "Condizionale passato: avrei/sarei + participio."],
    commonMistakes: [
      { wrong: "Se avrei tempo, viaggerei.", right: "Se avessi tempo, viaggerei.", why: "Tras se → congiuntivo imperfetto, nunca condicional." },
      { wrong: "Se l'avessi saputo, venivo.", right: "Se l'avessi saputo, sarei venuto.", why: "En registro cuidado: condizionale passato." },
    ],
    examples: [
      { text: "Se fossi in te, accetterei l'offerta.", translation: es("Yo que tú, aceptaría la oferta.") },
      { text: "Potresti aiutarmi, per favore?", translation: es("¿Podrías ayudarme, por favor?") },
    ],
    contrasts: [{ a: "Se piove, resto a casa. (real)", b: "Se piovesse, resterei a casa. (hipotético)", explanation: "Indicativo frente a congiuntivo + condicional." }],
    exercises: [
      { type: "mc", prompt: "Se ___ ricco, comprerei una barca.", options: ["fossi", "sarei", "ero", "sia"], answers: ["fossi"], explanation: "se + congiuntivo imperfetto." },
      { type: "mc", prompt: "Se avessi tempo, ___ di più.", options: ["leggerei", "leggo", "leggessi", "leggerò"], answers: ["leggerei"], explanation: "Consecuencia → condizionale." },
      { type: "mc", prompt: "Se l'avessi saputo, ti ___.", options: ["avrei chiamato", "chiamerei", "avessi chiamato", "ho chiamato"], answers: ["avrei chiamato"], explanation: "Irreal pasado → condizionale passato." },
      { type: "mc", prompt: "___ un bicchiere d'acqua, per favore. (cortesía)", options: ["Vorrei", "Voglio", "Volevo stato", "Vorrò"], answers: ["Vorrei"], explanation: "Cortesía → condizionale." },
    ],
  },
];
