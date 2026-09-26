// Revisión nativa: pendiente
import { S } from "./letter";
import type { PhaseZeroContent } from "./types";

export const NL: PhaseZeroContent = {
  letters: [
    {
      id: "nl-vowels",
      title: "Vocales dobles y combinadas",
      intro: "En neerlandés la vocal doble es larga, y hay combinaciones con sonido propio.",
      letters: [
        S("ij", "ei", "entre «ei» y «ai»; «ei» suena igual", ["wijn", "wéin", "vino"]),
        S("ui", "öi", "una ö seguida de i, con los labios redondos", ["huis", "höis", "casa"]),
        S("oe", "u", "u de «uva»", ["boek", "buk", "libro"]),
        S("eu", "ö", "una e con los labios redondos", ["neus", "nös", "nariz"]),
        S("uu", "ü", "una i con los labios en forma de u", ["muur", "müür", "pared"]),
        S("aa", "a larga", "vocal doble = vocal larga (aa, ee, oo)", ["maan", "maan", "luna"]),
      ],
    },
    {
      id: "nl-cons",
      title: "Consonantes con sonido propio",
      intro: "La g neerlandesa es la estrella: raspada, como nuestra j.",
      letters: [
        S("g", "j raspada", "como la j de «jamón», raspando; ch suena igual", ["goed", "jut", "bien"]),
        S("sch", "s + j", "una s seguida de la j raspada", ["school", "sjool", "escuela"]),
        S("w", "v suave", "entre v y w, con los dientes rozando el labio", ["water", "váter", "agua"]),
        S("v", "f suave", "casi una f", ["vader", "fáder", "padre"]),
        S("j", "y", "y de «yo»", ["ja", "ya", "sí"]),
      ],
    },
  ],
  rules: [
    {
      id: "g",
      title: "g y ch: la j raspada",
      explain: "La g y la ch se dicen igual: como la j española de «jamón», raspando la garganta.",
      examples: [
        { w: "goed", r: "jut", es: "bien" },
        { w: "acht", r: "ajt", es: "ocho" },
        { w: "morgen", r: "mórjen", es: "mañana" },
      ],
      check: { q: "¿Cómo suena la g de «goed» (bien)?", show: "goed", options: ["j raspada (jut)", "g de gato (gut)", "y (yut)"], answer: "j raspada (jut)", lang: "es" },
    },
    {
      id: "vowel-length",
      title: "Vocal doble = vocal larga",
      explain: "aa, ee, oo, uu son largas. Con una sola vocal: si la sílaba termina en consonante, es corta (man); si termina en vocal, larga (ma-nen).",
      examples: [
        { w: "maan", r: "maan", es: "luna" },
        { w: "man", r: "man", es: "hombre" },
        { w: "manen", r: "máanen", es: "lunas" },
      ],
      check: { q: "¿Qué palabra tiene la vocal larga?", options: ["maan", "man"], answer: "maan", lang: "target", why: "La vocal doble es larga." },
    },
    {
      id: "final-devoicing",
      title: "b y d al final suenan p y t",
      explain: "Al final de palabra las consonantes se apagan: hond suena «hont».",
      examples: [
        { w: "hond", r: "hont", es: "perro" },
        { w: "goed", r: "jut", es: "bien" },
        { w: "web", r: "wep", es: "red, web" },
      ],
      check: { q: "¿Cómo suena «hond» (perro)?", show: "hond", options: ["hont", "hond", "jond"], answer: "hont", lang: "es", why: "La d final suena t." },
    },
    {
      id: "ij-ei",
      title: "ij y ei suenan igual",
      explain: "Son dos formas de escribir el mismo sonido, entre «ei» y «ai». Hay que aprender cuál lleva cada palabra.",
      examples: [
        { w: "tijd", r: "teit", es: "tiempo" },
        { w: "klein", r: "klein", es: "pequeño" },
        { w: "wijn", r: "wein", es: "vino" },
      ],
      check: { q: "¿Cómo suena «tijd» (tiempo)?", show: "tijd", options: ["teit", "tiyd", "tid"], answer: "teit", lang: "es", why: "ij suena «ei» y la d final, t." },
    },
    {
      id: "sch",
      title: "sch = s + j raspada (y -isch = is)",
      explain: "Al principio, sch es una s seguida de la j raspada. En el final -isch, en cambio, sólo suena «is».",
      examples: [
        { w: "schip", r: "sjip", es: "barco" },
        { w: "school", r: "sjool", es: "escuela" },
        { w: "praktisch", r: "práktis", es: "práctico" },
      ],
      check: { q: "¿Cómo suena «schip» (barco)?", show: "schip", options: ["sjip", "ship", "skip"], answer: "sjip", lang: "es" },
    },
  ],
};
