// Revisión nativa: pendiente
import type { PhaseZeroContent } from "./types";

/** Chino: reglas de lectura del pinyin y los tonos (tonos y caracteres base en ../alphabets.ts). */
export const ZH: PhaseZeroContent = {
  rules: [
    {
      id: "third-tone",
      title: "Dos terceros tonos seguidos: el primero sube",
      explain: "Cuando van dos sílabas de 3.er tono seguidas, la primera se dice en 2.º tono (subiendo). Se sigue escribiendo igual.",
      examples: [
        { w: "你好", r: "nǐ hǎo → ní hǎo", es: "hola" },
        { w: "很好", r: "hěn hǎo → hén hǎo", es: "muy bien" },
        { w: "水果", r: "shuǐguǒ → shuíguǒ", es: "fruta" },
      ],
      check: { q: "¿Cómo suena de verdad «你好» (nǐ hǎo)?", show: "你好", options: ["ní hǎo", "nǐ hǎo", "nì hǎo"], answer: "ní hǎo", lang: "es", why: "Dos 3.er tono seguidos: el primero sube (2.º tono)." },
    },
    {
      id: "bu",
      title: "不 (bù) cambia antes de 4.º tono",
      explain: "不 (no) es 4.º tono, pero antes de otra sílaba de 4.º tono pasa a 2.º: bú.",
      examples: [
        { w: "不是", r: "bú shì", es: "no es" },
        { w: "不要", r: "bú yào", es: "no quiero" },
        { w: "不好", r: "bù hǎo", es: "no está bien (sin cambio)" },
      ],
      check: { q: "¿Cómo se dice «不是» (no es)?", show: "不是", options: ["bú shì", "bù shì", "bǔ shì"], answer: "bú shì", lang: "es", why: "是 es 4.º tono, así que 不 pasa a bú." },
    },
    {
      id: "yi",
      title: "一 (yī) cambia de tono",
      explain: "Sola o al contar, 一 es yī. Antes de 4.º tono pasa a yí; antes de los demás tonos, a yì.",
      examples: [
        { w: "一", r: "yī", es: "uno" },
        { w: "一个", r: "yí ge", es: "uno, una" },
        { w: "一起", r: "yìqǐ", es: "juntos" },
      ],
      check: { q: "¿Cómo suena «一个» (uno, con 个 = gè)?", show: "一个", options: ["yí ge", "yī ge", "yì ge"], answer: "yí ge", lang: "es", why: "个 es 4.º tono: 一 pasa a yí." },
    },
    {
      id: "neutral",
      title: "El tono neutro: corto y sin fuerza",
      explain: "Algunas sílabas no llevan marca: se dicen cortas y suaves, sin tono propio. Pasa mucho en palabras repetidas y partículas.",
      examples: [
        { w: "妈妈", r: "māma", es: "mamá" },
        { w: "爸爸", r: "bàba", es: "papá" },
        { w: "谢谢", r: "xièxie", es: "gracias" },
      ],
      check: { q: "En «妈妈» (māma), ¿cómo es la segunda «ma»?", show: "妈妈", options: ["corta y suave", "igual de fuerte", "subiendo"], answer: "corta y suave", lang: "es", why: "Sin marca de tono: tono neutro, corto y suave." },
    },
    {
      id: "u-umlaut",
      title: "Tras j, q, x, y la u es una ü",
      explain: "Después de j, q, x o y, la «u» del pinyin se pronuncia ü (una i con los labios de u), aunque no lleve los puntos. Tras n o l sí se escriben: nǚ.",
      examples: [
        { w: "去", r: "qù", es: "ir" },
        { w: "鱼", r: "yú", es: "pez" },
        { w: "女", r: "nǚ", es: "mujer" },
      ],
      check: { q: "¿Qué vocal suena en «去» (qù)?", show: "去", options: ["ü (i con labios de u)", "u de uva", "i"], answer: "ü (i con labios de u)", lang: "es", why: "Tras q, la u se pronuncia ü." },
    },
  ],
};
