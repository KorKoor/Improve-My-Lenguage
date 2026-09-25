import type { GrammarConcept } from "../types";

/** Neerlandés: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const NL_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "nl:g:niet-geen",
    language: "nl",
    title: "Negación: niet y geen",
    cefr: "A1",
    errorCategory: "nl:negation",
    summary:
      "Geen niega sustantivos sin artículo definido (equivale a «ningún» / «no … un»): Ik heb geen auto. Niet niega todo lo demás: verbos, adjetivos, nombres con de/het o posesivo: Ik werk niet. Dat is niet mijn fiets.",
    whenToUse: ["No tener: Ik heb geen tijd.", "No hacer: Hij komt vandaag niet."],
    formation: ["geen + sustantivo (sin de/het/een).", "niet: al final de la frase simple o delante de lo que niega (adjetivo, preposición)."],
    commonMistakes: [
      { wrong: "Ik heb niet een huis.", right: "Ik heb geen huis.", why: "Niet + een → geen." },
      { wrong: "Ik niet begrijp het.", right: "Ik begrijp het niet.", why: "Niet va tras el verbo y el objeto." },
    ],
    examples: [
      { text: "Er is geen melk meer.", translation: es("Ya no queda leche.") },
      { text: "Het is niet ver van hier.", translation: es("No está lejos de aquí.") },
    ],
    contrasts: [{ a: "Ik drink geen koffie.", b: "Ik drink de koffie niet.", explanation: "No bebo café (en general) / no me bebo el café (ese)." }],
    exercises: [
      { type: "mc", prompt: "Wij hebben ___ kinderen.", options: ["geen", "niet", "nee", "geen de"], answers: ["geen"], explanation: "Sustantivo sin artículo → geen." },
      { type: "mc", prompt: "Het weer is ___ mooi vandaag.", options: ["niet", "geen", "nee", "niets"], answers: ["niet"], explanation: "Adjetivo → niet." },
      { type: "fill", prompt: "Ik spreek ___ Duits. (no hablo alemán)", answers: ["geen"], explanation: "Idiomas sin artículo → geen." },
      { type: "correct", prompt: "Ik heb niet een fiets.", answers: ["Ik heb geen fiets."], explanation: "Niet een → geen." },
    ],
  },
  {
    id: "nl:g:plural-diminutive",
    language: "nl",
    title: "Plural (-en / -s) y diminutivos (-je)",
    cefr: "A1",
    errorCategory: "nl:plural",
    summary:
      "La mayoría de los plurales añade -en (boek → boeken); las palabras que acaban en -el, -er, -en, -je y muchas extranjeras toman -s (tafel → tafels, meisje → meisjes). El diminutivo -je es muy frecuente y siempre es het: het huisje, het biertje.",
    whenToUse: ["Contar: twee boeken, drie tafels.", "Hablar con cariño o pedir algo pequeño: een kopje koffie."],
    formation: ["-en (con cambios de ortografía: huis → huizen, man → mannen).", "-s tras -el, -er, -em, -en, -je: jongens, lepels.", "Diminutivo: -je / -tje / -pje / -etje (bloemetje)."],
    commonMistakes: [
      { wrong: "de meisje", right: "het meisje", why: "Todos los diminutivos son het." },
      { wrong: "twee huisen", right: "twee huizen", why: "s → z entre vocales en el plural." },
    ],
    examples: [
      { text: "Mag ik twee broodjes kaas?", translation: es("¿Me da dos bocadillos de queso?") },
      { text: "De kinderen spelen buiten.", translation: es("Los niños juegan fuera.") },
    ],
    contrasts: [{ a: "de kop (la taza)", b: "het kopje (la tacita)", explanation: "El diminutivo cambia el artículo a het." }],
    exercises: [
      { type: "mc", prompt: "Ik heb drie ___.", options: ["boeken", "boeks", "boekens", "boek"], answers: ["boeken"], explanation: "Plural general → -en." },
      { type: "mc", prompt: "Die twee ___ zijn mijn zussen.", options: ["meisjes", "meisjen", "meisje", "meisjens"], answers: ["meisjes"], explanation: "-je → -jes." },
      { type: "fill", prompt: "___ huisje is klein. (artículo)", answers: ["Het"], explanation: "Diminutivo → het." },
      { type: "correct", prompt: "De twee huisen zijn oud.", answers: ["De twee huizen zijn oud."], explanation: "huis → huizen." },
    ],
  },
  {
    id: "nl:g:imperfectum",
    language: "nl",
    title: "Imperfectum (pasado simple): -te/-de y 't kofschip",
    cefr: "A2",
    errorCategory: "nl:imperfectum",
    summary:
      "Los verbos regulares añaden -te(n) o -de(n) a la raíz. Regla «'t kofschip»: si la raíz acaba en t, k, f, s, ch o p → -te (werkte); si no → -de (woonde). Los irregulares más frecuentes: was, had, ging, kwam, zag, deed.",
    whenToUse: ["Narrar y describir el pasado: Vroeger woonde ik in Madrid.", "Con zijn/hebben casi siempre: Ik was moe."],
    formation: ["Singular: raíz + te/de (ik werkte, zij woonde).", "Plural: + ten/den (wij werkten).", "Irregulares: zijn → was/waren, hebben → had/hadden, gaan → ging/gingen."],
    commonMistakes: [
      { wrong: "Ik werkde gisteren.", right: "Ik werkte gisteren.", why: "Werk acaba en k → -te." },
      { wrong: "Ik woonte in Utrecht.", right: "Ik woonde in Utrecht.", why: "Woon acaba en n → -de." },
    ],
    examples: [
      { text: "Toen ik klein was, speelde ik veel buiten.", translation: es("Cuando era pequeño, jugaba mucho fuera.") },
      { text: "We hadden geen tijd.", translation: es("No teníamos tiempo.") },
    ],
    contrasts: [{ a: "Ik heb gewerkt.", b: "Ik werkte.", explanation: "Perfectum (hecho puntual) / imperfectum (narración, hábito)." }],
    exercises: [
      { type: "mc", prompt: "Gisteren ___ ik de hele dag. (werken)", options: ["werkte", "werkde", "werkten", "gewerkt"], answers: ["werkte"], explanation: "k → -te." },
      { type: "mc", prompt: "Wij ___ vroeger in Gent. (wonen)", options: ["woonden", "woonten", "woonde", "wonen"], answers: ["woonden"], explanation: "Plural, n → -den." },
      { type: "fill", prompt: "Ik ___ moe gisteren. (zijn)", answers: ["was"], explanation: "Zijn → was." },
      { type: "correct", prompt: "Hij maakde een foto.", answers: ["Hij maakte een foto."], explanation: "k → -te." },
    ],
  },
  {
    id: "nl:g:modals",
    language: "nl",
    title: "Verbos modales: kunnen, moeten, willen, mogen",
    cefr: "A2",
    errorCategory: "nl:modals",
    summary:
      "El modal va conjugado en segunda posición y el infinitivo al final: Ik wil morgen komen. Kunnen = poder/saber, moeten = tener que, willen = querer, mogen = tener permiso. «No hace falta» es hoeven + niet … te: Je hoeft niet te komen.",
    whenToUse: ["Capacidad: Kun je zwemmen?", "Obligación: Ik moet werken.", "Permiso: Mag ik binnenkomen?"],
    formation: ["kan/kunt/kunnen · moet/moeten · wil/wilt/willen · mag/mogen.", "Infinitivo sin te al final.", "Negación de moeten: hoeven niet te."],
    commonMistakes: [
      { wrong: "Ik kan te zwemmen.", right: "Ik kan zwemmen.", why: "Tras modal, infinitivo sin te." },
      { wrong: "Je moet niet komen (queriendo decir «no hace falta»).", right: "Je hoeft niet te komen.", why: "No es necesario → hoeven niet te." },
    ],
    examples: [
      { text: "Mag ik hier roken? — Nee, dat mag niet.", translation: es("¿Puedo fumar aquí? — No, no se puede.") },
      { text: "Wil je iets drinken?", translation: es("¿Quieres tomar algo?") },
    ],
    contrasts: [{ a: "Je moet niet roken.", b: "Je hoeft niet te roken.", explanation: "No debes fumar / no hace falta que fumes." }],
    exercises: [
      { type: "mc", prompt: "___ ik het raam openen? (permiso)", options: ["Mag", "Moet", "Kan te", "Wil"], answers: ["Mag"], explanation: "Permiso → mogen." },
      { type: "mc", prompt: "Morgen ___ ik vroeg opstaan.", options: ["moet", "moeten", "moet te", "hoef"], answers: ["moet"], explanation: "Ik moet + infinitivo." },
      { type: "fill", prompt: "Je hoeft niet ___ betalen, het is gratis.", answers: ["te"], explanation: "Hoeven niet te." },
      { type: "correct", prompt: "Ik wil te slapen.", answers: ["Ik wil slapen."], explanation: "Sin te." },
    ],
  },
  {
    id: "nl:g:comparatives",
    language: "nl",
    title: "Comparativo y superlativo: groter dan, het grootst",
    cefr: "A2",
    errorCategory: "nl:comparatives",
    summary:
      "Comparativo con -er + dan (groter dan), incluso en adjetivos largos (interessanter). Si el adjetivo acaba en -r se añade -der (duurder). Superlativo -st (het grootst / de grootste). Irregulares: goed → beter → best, veel → meer → meest, graag → liever → liefst.",
    whenToUse: ["Comparar: Amsterdam is groter dan Utrecht.", "Preferir: Ik drink liever thee."],
    formation: ["-er + dan · -der tras r.", "Superlativo: het + -st / de + -ste (delante de un nombre).", "Igualdad: even … als / net zo … als."],
    commonMistakes: [
      { wrong: "meer groot", right: "groter", why: "Se usa -er, no meer." },
      { wrong: "Hij is ouder als ik.", right: "Hij is ouder dan ik.", why: "Comparativo + dan (als en la igualdad)." },
    ],
    examples: [
      { text: "De trein is sneller dan de bus.", translation: es("El tren es más rápido que el autobús.") },
      { text: "Dit is de beste frietzaak van de stad.", translation: es("Este es el mejor puesto de patatas fritas de la ciudad.") },
    ],
    contrasts: [{ a: "even groot als", b: "groter dan", explanation: "Igual de grande que / más grande que." }],
    exercises: [
      { type: "mc", prompt: "Deze fiets is ___ dan die.", options: ["duurder", "duurer", "meer duur", "duurst"], answers: ["duurder"], explanation: "Acaba en r → -der." },
      { type: "mc", prompt: "Ik vind koffie ___ dan thee.", options: ["lekkerder", "lekkerer", "meer lekker", "lekkerst"], answers: ["lekkerder"], explanation: "Lekker → lekkerder." },
      { type: "fill", prompt: "Anna spreekt ___ Nederlands dan ik. (goed)", answers: ["beter"], explanation: "Goed → beter." },
      { type: "correct", prompt: "Mijn broer is groter als mij.", answers: ["Mijn broer is groter dan ik.", "Mijn broer is groter dan mij."], explanation: "Comparativo + dan." },
    ],
  },
  {
    id: "nl:g:reflexive",
    language: "nl",
    title: "Verbos reflexivos: zich voelen, zich vergissen",
    cefr: "B1",
    errorCategory: "nl:reflexive",
    summary:
      "Pronombres: me, je, zich, ons, je, zich (u: zich/u). Algunos verbos son reflexivos sin serlo en español: zich vergissen (equivocarse), zich herinneren (acordarse), zich voelen (sentirse).",
    whenToUse: ["Sensaciones: Ik voel me niet goed.", "Rutinas: Hij scheert zich elke dag."],
    formation: ["ik … me · jij … je · hij/zij … zich · wij … ons · jullie … je · zij … zich.", "Con verbo separable o modal, el pronombre sigue al verbo conjugado."],
    commonMistakes: [
      { wrong: "Ik voel zich moe.", right: "Ik voel me moe.", why: "Con ik → me." },
      { wrong: "Ik herinner het niet.", right: "Ik herinner me het niet.", why: "Herinneren (acordarse) es reflexivo." },
    ],
    examples: [
      { text: "Sorry, ik heb me vergist.", translation: es("Perdón, me he equivocado.") },
      { text: "Wij verheugen ons op de vakantie.", translation: es("Tenemos muchas ganas de las vacaciones.") },
    ],
    contrasts: [{ a: "Ik was de auto.", b: "Ik was me.", explanation: "Lavo el coche / me lavo." }],
    exercises: [
      { type: "mc", prompt: "Hoe voel je ___ vandaag?", options: ["je", "me", "zich", "ons"], answers: ["je"], explanation: "Jij → je." },
      { type: "mc", prompt: "Wij moeten ___ haasten.", options: ["ons", "zich", "je", "me"], answers: ["ons"], explanation: "Wij → ons." },
      { type: "fill", prompt: "Hij vergist ___ vaak.", answers: ["zich"], explanation: "Hij → zich." },
      { type: "correct", prompt: "Ik voel zich niet goed.", answers: ["Ik voel me niet goed.", "Ik voel mij niet goed."], explanation: "Con ik → me (o mij), nunca zich." },
    ],
  },
  {
    id: "nl:g:relative",
    language: "nl",
    title: "Oraciones de relativo: die, dat y waar-",
    cefr: "B2",
    errorCategory: "nl:relative",
    summary:
      "Die se refiere a palabras de/plural y dat a palabras het en singular; el verbo va al final: de man die daar staat, het huis dat ik koop. Con preposición y cosas se usa waar + preposición: de stad waar ik in woon / waarin ik woon.",
    whenToUse: ["Precisar: Het boek dat je me gaf, is mooi.", "Con preposición: de pen waarmee ik schrijf."],
    formation: ["de-woord / plural → die · het-woord singular → dat.", "Personas con preposición: met wie, voor wie.", "Cosas con preposición: waar + preposición (waarover, waarmee)."],
    commonMistakes: [
      { wrong: "het meisje die ik ken", right: "het meisje dat ik ken", why: "Meisje es het → dat." },
      { wrong: "de film over die ik praatte", right: "de film waarover ik praatte", why: "Cosa + preposición → waar-." },
    ],
    examples: [
      { text: "De collega die naast me zit, komt uit Spanje.", translation: es("El compañero que se sienta a mi lado es de España.") },
      { text: "Dat is het restaurant waar we gegeten hebben.", translation: es("Ese es el restaurante donde comimos.") },
    ],
    contrasts: [{ a: "de fiets die ik heb", b: "het huis dat ik heb", explanation: "De-woord → die; het-woord → dat." }],
    exercises: [
      { type: "mc", prompt: "Het boek ___ ik lees, is spannend.", options: ["dat", "die", "wat", "waar"], answers: ["dat"], explanation: "Het boek → dat." },
      { type: "mc", prompt: "De mensen ___ hier wonen, zijn aardig.", options: ["die", "dat", "wie", "waar"], answers: ["die"], explanation: "Plural → die." },
      { type: "fill", prompt: "Dit is de pen ___mee ik schrijf.", answers: ["waar"], explanation: "Cosa + met → waarmee." },
      { type: "correct", prompt: "Het kind die daar speelt, is mijn zoon.", answers: ["Het kind dat daar speelt, is mijn zoon."], explanation: "Het kind → dat." },
    ],
  },
];
