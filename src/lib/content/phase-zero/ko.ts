// Revisión nativa: pendiente
import type { PhaseZeroContent } from "./types";

/** Coreano: reglas de lectura (las letras están en ../alphabets.ts). */
export const KO: PhaseZeroContent = {
  rules: [
    {
      id: "blocks",
      title: "Las letras se juntan en bloques",
      explain: "Cada bloque es una sílaba: consonante + vocal, y a veces otra consonante debajo. Se lee de izquierda a derecha y de arriba abajo.",
      examples: [
        { w: "나", r: "na", es: "yo (informal)" },
        { w: "한", r: "han" },
        { w: "사람", r: "saram", es: "persona" },
      ],
      check: { q: "¿Qué letras forman el bloque «나»?", show: "나", options: ["ㄴ + ㅏ", "ㄱ + ㅏ", "ㄴ + ㅓ"], answer: "ㄴ + ㅏ", lang: "target", why: "ㄴ (n) + ㅏ (a) = 나 (na)." },
    },
    {
      id: "batchim",
      title: "La consonante de abajo suena corta",
      explain: "La consonante final (batchim) se dice sin soltar aire. Al final sólo hay siete sonidos: k, n, t, l, m, p, ng. Por eso ㅅ, ㅈ, ㅊ, ㅌ y ㅎ finales suenan «t».",
      examples: [
        { w: "옷", r: "ot", es: "ropa" },
        { w: "꽃", r: "kkot", es: "flor" },
        { w: "밥", r: "bap", es: "arroz cocido, comida" },
      ],
      check: { q: "¿Cómo suena «옷» (ropa)?", show: "옷", options: ["ot", "os", "osh"], answer: "ot", lang: "es", why: "La ㅅ final suena «t»." },
    },
    {
      id: "linking",
      title: "Si sigue una vocal, la final pasa a la siguiente sílaba",
      explain: "Cuando el bloque siguiente empieza por ㅇ (vocal), la consonante final se «muda» y se pronuncia con esa vocal.",
      examples: [
        { w: "음악", r: "eu-mak", es: "música" },
        { w: "한국어", r: "han-gu-geo", es: "idioma coreano" },
        { w: "옷이", r: "o-si", es: "la ropa (+ partícula)" },
      ],
      check: { q: "¿Cómo se lee «음악» (música)?", show: "음악", options: ["eu-mak", "eum-ak", "eu-nak"], answer: "eu-mak", lang: "es", why: "La ㅁ final se une a la vocal siguiente: eu-mak." },
    },
    {
      id: "weak-h",
      title: "La ㅎ casi desaparece",
      explain: "Entre vocales (o tras n, m, l) la ㅎ casi no se oye. Junto a ㄱ, ㄷ, ㅂ o ㅈ, en cambio, las hace sonar con aire: k, t, p, ch.",
      examples: [
        { w: "좋아요", r: "jo-a-yo", es: "me gusta, está bien" },
        { w: "많이", r: "ma-ni", es: "mucho" },
        { w: "괜찮아요", r: "gwaen-cha-na-yo", es: "está bien, no pasa nada" },
      ],
      check: { q: "¿Cómo suena «좋아요» (me gusta)?", show: "좋아요", options: ["jo-a-yo", "jo-ha-yo", "jot-a-yo"], answer: "jo-a-yo", lang: "es", why: "La ㅎ final entre vocales no se oye." },
    },
    {
      id: "nasal",
      title: "k, t, p ante n o m se vuelven nasales",
      explain: "Una consonante final k, t o p seguida de ㄴ o ㅁ cambia a ng, n o m. Por eso 합니다 suena «ham-ni-da».",
      examples: [
        { w: "합니다", r: "ham-ni-da", es: "hace (formal)" },
        { w: "감사합니다", r: "gam-sa-ham-ni-da", es: "gracias" },
        { w: "작년", r: "jang-nyeon", es: "el año pasado" },
      ],
      check: { q: "¿Cómo se pronuncia «합니다»?", show: "합니다", options: ["ham-ni-da", "hap-ni-da", "hab-ni-da"], answer: "ham-ni-da", lang: "es", why: "La ㅂ final ante ㄴ suena «m»." },
    },
  ],
};
