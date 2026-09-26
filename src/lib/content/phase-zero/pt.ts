// Revisión nativa: pendiente
import { S } from "./letter";
import type { PhaseZeroContent } from "./types";

/** Portugués de Brasil (la voz de la app es pt-BR). */
export const PT: PhaseZeroContent = {
  letters: [
    {
      id: "pt-nasal",
      title: "Vocales nasales",
      intro: "La tilde ~ y la m o n al final de sílaba hacen que el aire salga también por la nariz.",
      letters: [
        S("ã", "an nasal", "una a por la nariz", ["mãe", "mãi", "madre"]),
        S("ão", "aun nasal", "«aun» por la nariz, muy frecuente", ["pão", "pãu", "pan"]),
        S("õe", "oin nasal", "«oin» por la nariz", ["põe", "põi", "pone"]),
        S("om", "on nasal", "vocal + m al final: nasal, la m casi no suena", ["bom", "bõ", "bueno"]),
      ],
    },
    {
      id: "pt-cons",
      title: "Consonantes con sonido propio",
      intro: "Grupos y letras que suenan distinto que en español.",
      letters: [
        S("ç", "s", "c con colita: siempre s", ["coração", "corasãu", "corazón"]),
        S("lh", "lli", "una l mojada, como «lli» muy unida", ["filho", "fíllu", "hijo"]),
        S("nh", "ñ", "como nuestra ñ", ["vinho", "víñu", "vino"]),
        S("rr", "j suave", "la r inicial y la rr suenan como una j suave", ["carro", "kaju", "coche"]),
        S("j", "zh", "como la «y» argentina de «yo»; también g ante e, i", ["já", "zha", "ya"]),
        S("x", "sh", "casi siempre sh", ["xícara", "shíkara", "taza"]),
      ],
    },
  ],
  rules: [
    {
      id: "final-o-e",
      title: "o y e finales suenan u e i",
      explain: "En Brasil, la o del final sin fuerza suena u, y la e final suena i.",
      examples: [
        { w: "livro", r: "lívru", es: "libro" },
        { w: "leite", r: "léichi", es: "leche" },
        { w: "nome", r: "nómi", es: "nombre" },
      ],
      check: { q: "¿Cómo suena «gato» en Brasil?", show: "gato", options: ["gátu", "gáto", "gáta"], answer: "gátu", lang: "es", why: "La o final sin fuerza suena u." },
    },
    {
      id: "t-d-i",
      title: "t y d ante i suenan ch y dy",
      explain: "En Brasil, t y d ante una i (o una e final que suena i) se dicen ch y dy.",
      examples: [
        { w: "tia", r: "chía", es: "tía" },
        { w: "dia", r: "dyía", es: "día" },
        { w: "noite", r: "nóichi", es: "noche" },
      ],
      check: { q: "¿Cómo suena «tio» (tío)?", show: "tio", options: ["chíu", "tío", "tíu"], answer: "chíu", lang: "es", why: "t ante i suena ch, y la o final suena u." },
    },
    {
      id: "nasal-tilde",
      title: "La ~ marca una vocal nasal",
      explain: "La tilde de onda (til) no marca la fuerza: dice que la vocal suena por la nariz.",
      examples: [
        { w: "mãe", r: "mãi", es: "madre" },
        { w: "pão", r: "pãu", es: "pan" },
        { w: "irmã", r: "irmã", es: "hermana" },
      ],
      check: { q: "¿Qué signo marca la vocal nasal en «pão»?", show: "pão", options: ["~ (til)", "´ (acento agudo)", "^ (circunflejo)"], answer: "~ (til)", lang: "es" },
    },
    {
      id: "r",
      title: "r inicial y rr suenan como j suave",
      explain: "Al principio de palabra y cuando es doble, la r suena como una j suave. Entre vocales, una sola r es suave como en «cara».",
      examples: [
        { w: "Rio", r: "jíu", es: "río, Río" },
        { w: "carro", r: "káju", es: "coche" },
        { w: "caro", r: "káru", es: "caro" },
      ],
      check: { q: "¿Cómo suena «rua» (calle)?", show: "rua", options: ["júa", "rúa con r fuerte", "lúa"], answer: "júa", lang: "es", why: "r inicial: j suave." },
    },
    {
      id: "s-z",
      title: "s entre vocales suena z",
      explain: "Una s sola entre dos vocales se dice con zumbido, como una z (la z inglesa).",
      examples: [
        { w: "casa", r: "káza", es: "casa" },
        { w: "mesa", r: "méza", es: "mesa" },
        { w: "coisa", r: "kóiza", es: "cosa" },
      ],
      check: { q: "¿Cómo suena la s de «mesa»?", show: "mesa", options: ["z (con zumbido)", "s", "sh"], answer: "z (con zumbido)", lang: "es" },
    },
  ],
};
