// Revisión nativa: pendiente
import { S } from "./letter";
import type { PhaseZeroContent } from "./types";

export const DE: PhaseZeroContent = {
  letters: [
    {
      id: "de-umlaut",
      title: "Letras con puntitos y la ß",
      intro: "Los dos puntitos (Umlaut) cambian la vocal. La ß es una s doble.",
      letters: [
        S("ä", "e abierta", "como una e con la boca abierta", ["Mädchen", "médjen", "chica"]),
        S("ö", "ö", "una e con los labios redondos, como para decir o", ["schön", "shön", "bonito"]),
        S("ü", "ü", "una i con los labios en forma de u", ["über", "über", "sobre"]),
        S("ß", "ss", "una s fuerte (doble)", ["Straße", "shtrase", "calle"]),
      ],
    },
    {
      id: "de-groups",
      title: "Grupos de letras",
      intro: "Varias letras juntas que suenan como un solo sonido.",
      letters: [
        S("sch", "sh", "sh, como al pedir silencio", ["Schule", "shule", "escuela"]),
        S("ch", "j suave", "tras e, i: un siseo suave (ij); tras a, o, u: como nuestra j (Buch)", ["ich", "ij", "yo"]),
        S("ei", "ai", "«ai» de «aire»", ["drei", "drai", "tres"]),
        S("ie", "i larga", "una i larga", ["Liebe", "liibe", "amor"]),
        S("eu", "oi", "«oi» de «hoy»; «äu» suena igual", ["neu", "noi", "nuevo"]),
      ],
    },
    {
      id: "de-cons",
      title: "Consonantes que engañan",
      intro: "Se escriben como en español pero suenan distinto.",
      letters: [
        S("z", "ts", "t y s juntas", ["Zeit", "tsait", "tiempo"]),
        S("w", "v", "una v de dientes y labio", ["Wasser", "vaser", "agua"]),
        S("v", "f", "casi siempre suena f", ["Vater", "fater", "padre"]),
        S("j", "y", "y de «yo»", ["ja", "ya", "sí"]),
        S("s", "z sonora", "antes de vocal, una s con zumbido", ["Sonne", "zone", "sol"]),
        S("h", "h aspirada", "al principio, aire suave (como en inglés); tras vocal no suena y la alarga", ["Hand", "hand", "mano"]),
      ],
    },
  ],
  rules: [
    {
      id: "noun-caps",
      title: "Todos los sustantivos van con mayúscula",
      explain: "En alemán, cualquier nombre de cosa, persona o idea empieza con mayúscula, esté donde esté en la frase.",
      examples: [
        { w: "der Hund", r: "der hunt", es: "el perro" },
        { w: "das Haus", r: "das haus", es: "la casa" },
        { w: "die Katze", r: "di katse", es: "el gato" },
      ],
      check: { q: "¿Cuál está bien escrita?", options: ["Ich habe einen Hund.", "Ich habe einen hund.", "ich Habe einen Hund."], answer: "Ich habe einen Hund.", lang: "target", why: "Hund es un sustantivo: mayúscula. Los verbos, no." },
    },
    {
      id: "vowel-length",
      title: "Vocal larga o corta",
      explain: "Vocal seguida de una sola consonante suele ser larga (Tag); de dos consonantes, corta (Bett). Una h o una vocal doble detrás la alargan (Sohn, Meer).",
      examples: [
        { w: "Tag", r: "taak", es: "día" },
        { w: "Bett", r: "bet", es: "cama" },
        { w: "Meer", r: "meer", es: "mar" },
      ],
      check: { q: "¿Qué palabra tiene la vocal corta?", options: ["Bett", "Tag", "Sohn"], answer: "Bett", lang: "target", why: "Dos consonantes detrás (tt): vocal corta." },
    },
    {
      id: "final-devoicing",
      title: "b, d, g al final suenan p, t, k",
      explain: "Al final de palabra (o de sílaba) las consonantes se «apagan»: Hund suena «hunt».",
      examples: [
        { w: "Hund", r: "hunt", es: "perro" },
        { w: "Tag", r: "taak", es: "día" },
        { w: "halb", r: "halp", es: "medio" },
      ],
      check: { q: "¿Cómo suena «Hund» (perro)?", show: "Hund", options: ["hunt", "hund", "jund"], answer: "hunt", lang: "es", why: "La d final suena t." },
    },
    {
      id: "sp-st",
      title: "sp y st al principio suenan «shp» y «sht»",
      explain: "Al comienzo de palabra (o de una parte de palabra), sp y st se dicen con sh.",
      examples: [
        { w: "Sport", r: "shport", es: "deporte" },
        { w: "Straße", r: "shtrase", es: "calle" },
        { w: "sprechen", r: "shpréjen", es: "hablar" },
      ],
      check: { q: "¿Cómo suena «Stein» (piedra)?", show: "Stein", options: ["shtain", "stein", "stain"], answer: "shtain", lang: "es", why: "st al principio suena sht, y ei suena ai." },
    },
    {
      id: "first-stress",
      title: "La fuerza suele ir en la primera sílaba",
      explain: "En las palabras alemanas de toda la vida, la sílaba fuerte es casi siempre la primera. Las palabras extranjeras (Hotel, Musik) pueden ser distintas.",
      examples: [
        { w: "Wasser", r: "VA-ser", es: "agua" },
        { w: "Mutter", r: "MU-ter", es: "madre" },
        { w: "Kinder", r: "KIN-der", es: "niños" },
      ],
      check: { q: "¿Dónde va la fuerza en «Wasser» (agua)?", show: "Wasser", options: ["VA-ser", "va-SER"], answer: "VA-ser", lang: "es", why: "En la primera sílaba." },
    },
  ],
};
