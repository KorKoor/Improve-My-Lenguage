// Revisión nativa: pendiente
import type { PhaseZeroContent } from "./types";

/** Árabe: reglas de lectura (las letras están en ../alphabets.ts). */
export const AR: PhaseZeroContent = {
  rules: [
    {
      id: "rtl",
      title: "Se lee de derecha a izquierda",
      explain: "La primera letra de la palabra es la de la derecha. Las letras van unidas, como en la letra de mano.",
      examples: [
        { w: "قلم", r: "qalam", es: "lápiz" },
        { w: "كتاب", r: "kitāb", es: "libro" },
        { w: "باب", r: "bāb", es: "puerta" },
      ],
      check: { q: "¿Con qué letra empieza «قلم» (lápiz)?", show: "قلم", options: ["ق", "م", "ل"], answer: "ق", lang: "target", why: "La primera es la de la derecha: ق (q)." },
    },
    {
      id: "no-short-vowels",
      title: "Las vocales cortas casi nunca se escriben",
      explain: "En los textos normales sólo se escriben las consonantes y las vocales largas. Las vocales cortas se aprenden con cada palabra: por eso la app te da siempre la transcripción y el audio.",
      examples: [
        { w: "بنت", r: "bint", es: "chica" },
        { w: "كتب", r: "kataba", es: "escribió" },
        { w: "درس", r: "dars", es: "lección" },
      ],
      check: { q: "«بنت» (chica) tiene tres letras: b, n, t. ¿Cómo se lee?", show: "بنت", options: ["bint", "bnt", "banita"], answer: "bint", lang: "es", why: "La i corta no se escribe, pero se dice." },
    },
    {
      id: "article-sun-moon",
      title: "«El, la» es ال (al-), a veces sin l",
      explain: "El artículo ال va pegado a la palabra. Ante unas letras («lunares») se oye la l: al-qamar. Ante otras («solares»: t, d, r, z, s, sh, n…) la l no suena y la letra siguiente se dobla: ash-shams.",
      examples: [
        { w: "القمر", r: "al-qamar", es: "la luna" },
        { w: "الشمس", r: "ash-shams", es: "el sol" },
        { w: "النور", r: "an-nūr", es: "la luz" },
      ],
      check: { q: "¿Cómo se lee «الشمس» (el sol)?", show: "الشمس", options: ["ash-shams", "al-shams", "as-sams"], answer: "ash-shams", lang: "es", why: "ش es una letra solar: la l no suena y la sh se dobla." },
    },
    {
      id: "ta-marbuta",
      title: "ة al final suena «a»",
      explain: "La ة (tāʼ marbūṭa) sólo va al final y casi siempre marca palabras femeninas. Sola suena «a»; si la palabra va unida a otra, suena «at».",
      examples: [
        { w: "مدرسة", r: "madrasa", es: "escuela" },
        { w: "غرفة", r: "ghurfa", es: "habitación" },
        { w: "سيارة", r: "sayyāra", es: "coche" },
      ],
      check: { q: "¿Cómo se lee «مدرسة» (escuela)?", show: "مدرسة", options: ["madrasa", "madrasat", "madrasah"], answer: "madrasa", lang: "es", why: "Sola, la ة final suena «a»." },
    },
    {
      id: "shadda",
      title: "ّ (shadda): la letra se dice doble",
      explain: "Esa pequeña «w» encima de una letra significa que se pronuncia dos veces, sosteniéndola un instante.",
      examples: [
        { w: "سُكَّر", r: "sukkar", es: "azúcar" },
        { w: "حَمَّام", r: "ḥammām", es: "baño" },
        { w: "مُدَرِّس", r: "mudarris", es: "profesor" },
      ],
      check: { q: "¿Cómo se lee «سُكَّر» (azúcar)?", show: "سُكَّر", options: ["sukkar", "sukar", "sakar"], answer: "sukkar", lang: "es", why: "La shadda sobre ك la dobla: kk." },
    },
    {
      id: "hamza",
      title: "ء (hamza): un pequeño corte de voz",
      explain: "La hamza es un golpe de garganta, como la pausa de «¡oh-oh!». Puede ir sola (ء) o sobre otra letra: أ إ ؤ ئ.",
      examples: [
        { w: "أنا", r: "anā", es: "yo" },
        { w: "سؤال", r: "suʼāl", es: "pregunta" },
        { w: "ماء", r: "māʼ", es: "agua" },
      ],
      check: { q: "¿Qué letra lleva el corte de voz en «سؤال» (pregunta)?", show: "سؤال", options: ["ؤ", "س", "ل"], answer: "ؤ", lang: "target", why: "ؤ es una waw con hamza encima." },
    },
    {
      id: "alif-maqsura",
      title: "ى al final suena «a» larga",
      explain: "ى es una ي sin puntos. Sólo va al final de la palabra y se lee «a» larga.",
      examples: [
        { w: "على", r: "ʕalā", es: "sobre, encima de" },
        { w: "إلى", r: "ilā", es: "hacia" },
        { w: "مستشفى", r: "mustashfā", es: "hospital" },
      ],
      check: { q: "¿Cómo suena la ى final de «إلى» (hacia)?", show: "إلى", options: ["a larga (ā)", "i larga (ī)", "y"], answer: "a larga (ā)", lang: "es", why: "Sin puntos y al final, se lee «ā»." },
    },
  ],
};
