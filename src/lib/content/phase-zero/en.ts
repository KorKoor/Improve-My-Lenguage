// Revisión nativa: pendiente
import { S } from "./letter";
import type { PhaseZeroContent } from "./types";

export const EN: PhaseZeroContent = {
  letters: [
    {
      id: "en-cons",
      title: "Consonantes nuevas",
      intro: "Sonidos que no tenemos en español, o que se escriben distinto.",
      letters: [
        S("th", "z de España", "la lengua entre los dientes: sin voz, como la z de «zapato» en España (think); en the, this, that suena con voz, como la d de «nada»", ["think", "zink", "pensar"]),
        S("sh", "sh", "sh, como al pedir silencio", ["she", "shi", "ella"]),
        S("w", "u rápida", "una u muy rápida, como en «huevo»", ["water", "uóter", "agua"]),
        S("h", "h aspirada", "aire suave, como una j muy débil", ["hello", "helóu", "hola"]),
        S("j", "dy", "como «dy» (la y fuerte de «yo»)", ["job", "dyob", "trabajo"]),
        S("v", "v de labio", "los dientes tocan el labio de abajo", ["very", "véri", "muy"]),
      ],
    },
    {
      id: "en-vowels",
      title: "Vocales que engañan",
      intro: "En inglés una misma vocal puede sonar de varias formas. Estas son las más útiles.",
      letters: [
        S("ee", "i larga", "una i larga; «ea» suele sonar igual", ["see", "sii", "ver"]),
        S("oo", "u larga", "una u larga", ["food", "fuud", "comida"]),
        S("i", "ai", "en palabras como time, fine, like", ["time", "taim", "tiempo"]),
        S("a", "a abierta", "entre a y e, con la boca muy abierta (cat, hat)", ["cat", "kæt", "gato"]),
        S("r", "r suave", "la lengua no toca el paladar", ["red", "red", "rojo"]),
      ],
    },
  ],
  rules: [
    {
      id: "magic-e",
      title: "La e final muda cambia la vocal",
      explain: "Una e al final no suena, pero hace que la vocal de antes diga su nombre en inglés: a → «ei», i → «ai», o → «ou».",
      examples: [
        { w: "hat / hate", r: "hat / heit", es: "sombrero / odiar" },
        { w: "bit / bite", r: "bit / bait", es: "trocito / morder" },
        { w: "not / note", r: "not / nout", es: "no / nota" },
      ],
      check: { q: "Si «kit» se dice «kit», ¿cómo se dice «kite» (cometa)?", show: "kite", options: ["kait", "kite", "kit"], answer: "kait", lang: "es", why: "La e final hace que la i suene «ai»." },
    },
    {
      id: "tion",
      title: "-tion suena «shon»",
      explain: "El final -tion (muy frecuente) se pronuncia «shon», con la fuerza en la sílaba de antes.",
      examples: [
        { w: "nation", r: "néishon", es: "nación" },
        { w: "station", r: "stéishon", es: "estación" },
        { w: "action", r: "ákshon", es: "acción" },
      ],
      check: { q: "¿Cómo suena «action»?", show: "action", options: ["ákshon", "áktion", "áksion"], answer: "ákshon", lang: "es", why: "-tion suena «shon»." },
    },
    {
      id: "ough",
      title: "ough: el grupo más caprichoso",
      explain: "No hay una regla fija: though (dóu), through (zru), tough (taf), thought (zot). Apréndelo con cada palabra y con su audio.",
      examples: [
        { w: "though", r: "dóu", es: "aunque" },
        { w: "through", r: "zru", es: "a través de" },
        { w: "tough", r: "taf", es: "duro" },
      ],
      check: { q: "¿Qué te dice «ough» sobre cómo suena una palabra?", options: ["Nada fijo: hay que oír cada palabra", "Siempre suena «ou»", "Siempre suena «af»"], answer: "Nada fijo: hay que oír cada palabra", lang: "es" },
    },
    {
      id: "silent-letters",
      title: "Letras que no suenan",
      explain: "Muchas palabras tienen letras mudas: la k de kn-, la w de wr-, la t de -sten, la b de -mb.",
      examples: [
        { w: "know", r: "nóu", es: "saber" },
        { w: "write", r: "ráit", es: "escribir" },
        { w: "listen", r: "lísen", es: "escuchar" },
      ],
      check: { q: "¿Qué letra no suena en «know» (saber)?", show: "know", options: ["k", "n", "w"], answer: "k", lang: "es", why: "kn- al principio: la k es muda." },
    },
    {
      id: "stress",
      title: "La sílaba fuerte no se marca",
      explain: "El inglés no usa tildes. La sílaba fuerte puede ser cualquiera, y las vocales débiles se relajan en un sonido neutro (como una «e» apagada). Fíjate en el audio de cada palabra nueva.",
      examples: [
        { w: "banana", r: "be-NA-ne", es: "plátano" },
        { w: "photo", r: "FOU-tou", es: "foto" },
        { w: "hotel", r: "hou-TEL", es: "hotel" },
      ],
      check: { q: "¿Dónde va la fuerza en «banana»?", show: "banana", options: ["be-NA-ne", "BA-na-na", "ba-na-NA"], answer: "be-NA-ne", lang: "es", why: "En la sílaba del medio; las otras dos se relajan." },
    },
  ],
};
