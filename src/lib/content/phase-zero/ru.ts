// Revisión nativa: pendiente
import type { PhaseZeroContent } from "./types";

/** Ruso: reglas de lectura (las letras están en ../alphabets.ts). */
export const RU: PhaseZeroContent = {
  rules: [
    {
      id: "stress",
      title: "Cada palabra tiene una sílaba fuerte",
      explain: "En ruso una sílaba de cada palabra suena más fuerte y más larga. En los textos normales no se marca: en la app verás esa vocal subrayada y la oirás. Aprende cada palabra con su sílaba fuerte.",
      examples: [
        { w: "вода́", r: "vadá", es: "agua" },
        { w: "ма́ма", r: "máma", es: "mamá" },
        { w: "молоко́", r: "malakó", es: "leche" },
      ],
      check: { q: "¿Qué parte de «вода» suena fuerte?", show: "вода́", options: ["да", "во"], answer: "да", lang: "target", why: "Se dice «vadá»: la fuerza va al final." },
    },
    {
      id: "o-reduction",
      title: "La о sin fuerza suena «a»",
      explain: "Cuando la о no está en la sílaba fuerte, se dice como una «a» suave. Por eso молоко se escribe con tres o y se dice «malakó».",
      examples: [
        { w: "молоко́", r: "malakó", es: "leche" },
        { w: "хорошо́", r: "jarashó", es: "bien" },
        { w: "окно́", r: "aknó", es: "ventana" },
      ],
      check: { q: "¿Cómo se dice «окно» (la fuerza va al final)?", show: "окно́", options: ["aknó", "oknó", "uknó"], answer: "aknó", lang: "es", why: "La primera о no tiene la fuerza: suena «a»." },
    },
    {
      id: "e-reduction",
      title: "La е y la я sin fuerza suenan casi «i»",
      explain: "Fuera de la sílaba fuerte, la е y la я se relajan y suenan casi como una «i».",
      examples: [
        { w: "сестра́", r: "sistrá", es: "hermana" },
        { w: "язы́к", r: "yizýk", es: "idioma, lengua" },
        { w: "тепе́рь", r: "tipiér'", es: "ahora" },
      ],
      check: { q: "¿Cómo se dice «сестра» (la fuerza va al final)?", show: "сестра́", options: ["sistrá", "sastrá", "sóstra"], answer: "sistrá", why: "La е no tiene la fuerza: suena casi «i».", lang: "es" },
    },
    {
      id: "soft-sign",
      title: "El signo blando ь ablanda la letra de antes",
      explain: "La ь no suena sola: hace que la consonante de antes suene más suave, como con una «i» muy leve. Cambia el significado: мат (jaque mate) no es мать (madre). La ъ (signo duro) es muy rara: separa la consonante de la vocal que sigue.",
      examples: [
        { w: "мать", r: "mat'", es: "madre" },
        { w: "день", r: "dien'", es: "día" },
        { w: "соль", r: "sol'", es: "sal" },
      ],
      check: { q: "¿Qué palabra termina con una t suave?", options: ["мать", "мат"], answer: "мать", lang: "target", why: "La ь al final ablanda la т." },
    },
    {
      id: "final-devoicing",
      title: "Al final de palabra, b→p, d→t, g→k",
      explain: "Las consonantes «sonoras» se apagan al final: б suena p, д suena t, г suena k, в suena f y з suena s.",
      examples: [
        { w: "хлеб", r: "jlep", es: "pan" },
        { w: "год", r: "got", es: "año" },
        { w: "друг", r: "druk", es: "amigo" },
      ],
      check: { q: "¿Cómo suena «год» (año)?", show: "год", options: ["got", "god", "gad"], answer: "got", lang: "es", why: "La д final suena «t»." },
    },
  ],
};
