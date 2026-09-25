import { wordsFor } from "../pack";
import type { GrammarConcept, VocabItem } from "../types";

/**
 * Italiano estándar. Paquete inicial en beta: revisión humana recomendada
 * antes de ampliar (ver docs/CONTENT_PIPELINE.md).
 */
const v = wordsFor("it");

export const IT_VOCAB: VocabItem[] = [
  v("ciao", "ciao", "interjection", "A1", 1, "/ˈtʃa.o/", ["hola", "adiós"], [["Ciao, come stai?", "Hola, ¿cómo estás?"]], ["everyday"], "Informal. Con desconocidos: «buongiorno»."),
  v("grazie", "grazie", "interjection", "A1", 1, "/ˈɡrat.tsje/", ["gracias"], [["Grazie mille per l'aiuto!", "¡Muchas gracias por la ayuda!"]], ["everyday"]),
  v("casa", "casa", "noun", "A1", 1, "/ˈka.sa/", ["casa"], [["Abito in una casa piccola.", "Vivo en una casa pequeña."]], ["everyday"]),
  v("acqua", "acqua", "noun", "A1", 1, "/ˈak.kwa/", ["agua"], [["Un bicchiere d'acqua, per favore.", "Un vaso de agua, por favor."]], ["everyday", "food"], "Femenino: l'acqua."),
  v("amico", "amico", "noun", "A1", 1, "/aˈmi.ko/", ["amigo"], [["Il mio amico abita a Roma.", "Mi amigo vive en Roma."]], ["everyday"], "Plural: amici. Femenino: amica, amiche."),
  v("lavorare", "lavorare", "verb", "A1", 1, "/la.voˈra.re/", ["trabajar"], [["Domani devo lavorare.", "Mañana tengo que trabajar."]], ["work"]),
  v("mangiare", "mangiare", "verb", "A1", 1, "/manˈdʒa.re/", ["comer"], [["Andiamo a mangiare una pizza?", "¿Vamos a comer una pizza?"]], ["food"]),
  v("felice", "felice", "adjective", "A1", 2, "/feˈli.tʃe/", ["feliz"], [["Oggi sono molto felice.", "Hoy estoy muy feliz."]], ["feelings"]),
  v("stanco", "stanco", "adjective", "A1", 2, "/ˈstaŋ.ko/", ["cansado"], [["Stasera sono stanco.", "Esta noche estoy cansado."]], ["feelings"]),
  v("mattina", "mattina", "noun", "A1", 1, "/matˈti.na/", ["mañana (parte del día)"], [["La mattina bevo un caffè.", "Por la mañana tomo un café."]], ["everyday"], "«domani» = mañana (el día siguiente)."),
  v("comprare", "comprare", "verb", "A1", 1, "/komˈpra.re/", ["comprar"], [["Devo comprare il pane.", "Tengo que comprar pan."]], ["everyday"]),
  v("sempre", "sempre", "adverb", "A1", 1, "/ˈsɛm.pre/", ["siempre"], [["Lei arriva sempre in orario.", "Ella siempre llega a tiempo."]], ["everyday"]),
  v("perche", "perché", "conjunction", "A1", 1, "/perˈke/", ["porque", "por qué"], [["Sono contento perché sei qui.", "Estoy contento porque estás aquí."]], ["connectors"], "Sirve para preguntar y para responder: Perché? — Perché sì."),
  v("caro", "caro", "adjective", "A1", 2, "/ˈka.ro/", ["caro", "querido"], [["Questo telefono è troppo caro.", "Este teléfono es demasiado caro."]], ["everyday"]),
  v("colazione", "colazione", "noun", "A1", 2, "/ko.latˈtsjo.ne/", ["desayuno"], [["La colazione è pronta.", "El desayuno está listo."]], ["food"]),
  v("molto", "molto", "adverb", "A1", 1, "/ˈmol.to/", ["mucho", "muy"], [["È molto bello!", "¡Es muy bonito!"]], ["everyday"]),
  v("anche", "anche", "adverb", "A1", 1, "/ˈaŋ.ke/", ["también"], [["Anch'io amo la musica.", "A mí también me encanta la música."]], ["everyday"]),
  v("aiutare", "aiutare", "verb", "A1", 1, "/a.juˈta.re/", ["ayudar"], [["Mi puoi aiutare?", "¿Me puedes ayudar?"]], ["everyday"]),
  v("burro", "burro", "noun", "A2", 3, "/ˈbur.ro/", ["mantequilla"], [["Pane, burro e marmellata.", "Pan, mantequilla y mermelada."]], ["false-friends", "food"], "Falso amigo: «burro» es mantequilla. El animal es «asino»."),
  v("guardare", "guardare", "verb", "A2", 1, "/ɡwarˈda.re/", ["mirar", "ver"], [["Stasera guardiamo un film.", "Esta noche vemos una película."]], ["false-friends"], "Falso amigo: significa mirar. «Guardar» se dice «conservare» o «mettere via»."),
  v("dimenticare", "dimenticare", "verb", "A2", 1, "/di.men.tiˈka.re/", ["olvidar"], [["Non dimenticare le chiavi.", "No olvides las llaves."]], ["everyday"]),
  v("tempo", "tempo", "noun", "A2", 1, "/ˈtɛm.po/", ["tiempo", "clima"], [["Non ho tempo adesso.", "No tengo tiempo ahora."], ["Che tempo fa oggi?", "¿Qué tiempo hace hoy?"]], ["everyday"]),
  v("viaggio", "viaggio", "noun", "A2", 2, "/ˈvjad.dʒo/", ["viaje"], [["Il viaggio è durato sei ore.", "El viaje duró seis horas."]], ["travel"]),
  v("riunione", "riunione", "noun", "A2", 2, "/rju.ˈnjo.ne/", ["reunión", "junta"], [["La riunione comincia alle dieci.", "La reunión empieza a las diez."]], ["work"]),
  v("aspettare", "aspettare", "verb", "A2", 1, "/as.petˈta.re/", ["esperar"], [["Aspetto l'autobus.", "Espero el autobús."]], ["everyday"]),
  v("capire", "capire", "verb", "A2", 1, "/kaˈpi.re/", ["entender"], [["Non ho capito la domanda.", "No entendí la pregunta."]], ["everyday"]),
  v("computer", "computer", "noun", "A2", 2, "/komˈpju.ter/", ["computadora"], [["Il mio computer è lentissimo.", "Mi computadora está lentísima."]], ["tech"], "Masculino e invariable: il computer, i computer."),
  v("gioco", "gioco", "noun", "A2", 2, "/ˈdʒɔ.ko/", ["juego"], [["Questo videogioco è fantastico.", "Este videojuego es fantástico."]], ["gaming"], "Videojuego: videogioco."),
  v("salire", "salire", "verb", "A2", 1, "/saˈli.re/", ["subir"], [["Saliamo sull'autobus.", "Subimos al autobús."]], ["false-friends", "travel"], "Falso amigo: significa subir. «Salir» se dice «uscire»."),
  v("camera", "camera", "noun", "A2", 2, "/ˈka.me.ra/", ["habitación"], [["La mia camera è al primo piano.", "Mi habitación está en el primer piso."]], ["false-friends", "travel"], "Falso amigo: la cámara de fotos es «macchina fotografica»."),
  v("treno", "treno", "noun", "A2", 2, "/ˈtrɛ.no/", ["tren"], [["Il treno parte alle otto.", "El tren sale a las ocho."]], ["travel"]),
  v("migliorare", "migliorare", "verb", "B1", 2, "/miʎ.ʎoˈra.re/", ["mejorar"], [["Voglio migliorare il mio italiano.", "Quiero mejorar mi italiano."]], ["everyday"]),
  v("tuttavia", "tuttavia", "adverb", "B1", 2, "/tut.taˈvi.a/", ["sin embargo"], [["È una buona idea. Tuttavia, è cara.", "Es una buena idea. Sin embargo, es cara."]], ["connectors"]),
  v("attualmente", "attualmente", "adverb", "B1", 2, "/at.tu.alˈmen.te/", ["actualmente"], [["Attualmente lavoro a Milano.", "Actualmente trabajo en Milán."]], ["work"]),
  v("sebbene", "sebbene", "conjunction", "B1", 2, "/sebˈbɛ.ne/", ["aunque"], [["Sebbene sia difficile, continuo.", "Aunque sea difícil, sigo adelante."]], ["connectors"], "Va con subjuntivo (congiuntivo): sebbene sia…"),
  v("scaricare", "scaricare", "verb", "B1", 3, "/ska.riˈka.re/", ["descargar"], [["Ho scaricato una nuova app.", "Descargué una nueva app."]], ["tech"]),
];

export const IT_GRAMMAR: GrammarConcept[] = [
  {
    id: "it:g:articles",
    language: "it",
    title: "Artículos: il, lo, la, l', i, gli, le",
    cefr: "A1",
    errorCategory: "it:articles",
    summary:
      "El italiano tiene más artículos que el español porque el masculino cambia según cómo empieza la palabra siguiente. Una vez que ves el patrón, es muy regular.",
    whenToUse: ["Casi siempre que en español usarías «el, la, los, las».", "También con posesivos: il mio libro (mi libro)."],
    formation: [
      "Masculino: il (la mayoría) · lo (ante s+consonante, z, gn, ps, y) · l' (ante vocal).",
      "Plural masculino: i (de il) · gli (de lo y l').",
      "Femenino: la · l' (ante vocal) · plural le.",
      "Indefinidos: un, uno, una, un'.",
    ],
    commonMistakes: [
      { wrong: "il studente", right: "lo studente", why: "Ante s + consonante se usa lo." },
      { wrong: "i amici", right: "gli amici", why: "Ante vocal el plural masculino es gli." },
      { wrong: "la acqua", right: "l'acqua", why: "Elisión ante vocal." },
    ],
    examples: [
      { text: "Lo zaino è sul tavolo.", translation: { es: "La mochila está sobre la mesa." } },
      { text: "Gli amici arrivano stasera.", translation: { es: "Los amigos llegan esta noche." } },
    ],
    contrasts: [{ a: "il libro → i libri", b: "lo zaino → gli zaini", explanation: "El singular decide el plural: il → i, lo/l' → gli." }],
    exercises: [
      { type: "mc", prompt: "___ studente è in classe.", options: ["Il", "Lo", "La", "L'"], answers: ["Lo"], explanation: "s + consonante → lo." },
      { type: "mc", prompt: "___ amici sono simpatici.", options: ["I", "Gli", "Le", "Lo"], answers: ["Gli"], explanation: "Plural masculino ante vocal → gli." },
      { type: "mc", prompt: "Bevo ___ acqua.", options: ["la", "lo", "l'", "il"], answers: ["l'"], explanation: "Elisión ante vocal: l'acqua." },
      { type: "fill", prompt: "___ (los) libri sono sul tavolo.", answers: ["I"], explanation: "il libro → i libri." },
      { type: "correct", prompt: "Il zaino è pesante.", answers: ["Lo zaino è pesante."], explanation: "Ante z se usa lo." },
    ],
  },
  {
    id: "it:g:passato-prossimo",
    language: "it",
    title: "Passato prossimo: avere o essere",
    cefr: "A2",
    errorCategory: "it:past-tense",
    summary:
      "Es el pasado más usado al hablar. Se forma con avere o essere + participio. Con essere, el participio concuerda con el sujeto (como un adjetivo).",
    whenToUse: ["Acciones terminadas: Ieri ho mangiato la pizza.", "Donde en español dirías «comí» o «he comido»."],
    formation: [
      "avere + participio: ho parlato, hai finito, ha preso.",
      "essere + participio (concuerda): sono andato/andata, siamo arrivati.",
      "Con essere: verbos de movimiento y cambio (andare, venire, arrivare, partire, uscire, nascere) y los reflexivos.",
    ],
    commonMistakes: [
      { wrong: "Ho andato al cinema.", right: "Sono andato al cinema.", why: "andare va con essere." },
      { wrong: "Maria è arrivato.", right: "Maria è arrivata.", why: "Con essere el participio concuerda: arrivata." },
    ],
    examples: [
      { text: "Abbiamo visitato il museo.", translation: { es: "Visitamos el museo." } },
      { text: "Lei è partita ieri.", translation: { es: "Ella se fue ayer." } },
    ],
    contrasts: [{ a: "Ho mangiato. (avere)", b: "Sono uscito. (essere)", explanation: "Movimiento o cambio de estado → essere." }],
    exercises: [
      { type: "mc", prompt: "Ieri ___ andato al mare.", options: ["ho", "sono", "hai", "è"], answers: ["sono"], explanation: "andare → essere: sono andato." },
      { type: "mc", prompt: "Noi ___ finito i compiti.", options: ["siamo", "abbiamo", "avete", "sono"], answers: ["abbiamo"], explanation: "finire → avere." },
      { type: "mc", prompt: "Lucia è ___ alle otto.", options: ["arrivato", "arrivata", "arrivati", "arrivare"], answers: ["arrivata"], explanation: "Con essere concuerda: arrivata (fem.)." },
      { type: "correct", prompt: "Ho venuto con mio fratello.", answers: ["Sono venuto con mio fratello.", "Sono venuta con mio fratello."], explanation: "venire → essere." },
    ],
  },
];
