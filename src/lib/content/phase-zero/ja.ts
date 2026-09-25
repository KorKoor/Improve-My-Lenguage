// Revisión nativa: pendiente
import type { PhaseZeroContent } from "./types";

/** Japonés: reglas de lectura (el hiragana y el katakana están en ../alphabets.ts). */
export const JA: PhaseZeroContent = {
  rules: [
    {
      id: "particles",
      title: "は, へ y を como partículas",
      explain: "Tres signos se leen distinto cuando son partículas (palabritas que van detrás de otra): は se lee «wa», へ se lee «e» y を se lee «o».",
      examples: [
        { w: "わたしは", r: "watashi wa", es: "yo (tema)" },
        { w: "がっこうへ", r: "gakkō e", es: "hacia la escuela" },
        { w: "みずを", r: "mizu o", es: "agua (objeto)" },
      ],
      check: { q: "En «これは ほんです» (esto es un libro), ¿cómo se lee は?", show: "これは", options: ["wa", "ha", "ba"], answer: "wa", lang: "es", why: "Como partícula, は se lee «wa»." },
    },
    {
      id: "long-vowels",
      title: "Vocales largas: duran el doble",
      explain: "Dos vocales iguales seguidas se alargan. En hiragana おう y えい suelen sonar «ō» y «ē». En katakana se usa la raya ー. Alargar cambia la palabra.",
      examples: [
        { w: "おばさん", r: "obasan", es: "tía" },
        { w: "おばあさん", r: "obāsan", es: "abuela" },
        { w: "コーヒー", r: "kōhī", es: "café" },
      ],
      check: { q: "«おばさん» es tía. ¿Qué es «おばあさん», con la a larga?", show: "おばあさん", options: ["abuela", "tía", "hermana"], answer: "abuela", lang: "es", why: "La vocal larga cambia la palabra: obasan ≠ obāsan." },
    },
    {
      id: "small-tsu",
      title: "っ pequeña: una pausa corta",
      explain: "Una っ pequeña no suena: hace una pausa breve y dobla la consonante que sigue.",
      examples: [
        { w: "きって", r: "kitte", es: "sello" },
        { w: "がっこう", r: "gakkō", es: "escuela" },
        { w: "ちょっと", r: "chotto", es: "un poco" },
      ],
      check: { q: "¿Cómo se lee «きって» (sello)?", show: "きって", options: ["kitte", "kitsute", "kite"], answer: "kitte", lang: "es", why: "La っ pequeña dobla la t: kit-te." },
    },
    {
      id: "small-ya",
      title: "ゃ ゅ ょ pequeñas se unen a la sílaba de antes",
      explain: "Pequeñas, ゃ ゅ ょ no forman sílaba propia: se juntan con la anterior. き + ょ = きょ (kyo).",
      examples: [
        { w: "きょう", r: "kyō", es: "hoy" },
        { w: "しゃしん", r: "shashin", es: "foto" },
        { w: "おちゃ", r: "ocha", es: "té" },
      ],
      check: { q: "¿Cómo se lee «きょう» (hoy)?", show: "きょう", options: ["kyō", "kiyō", "kiyou"], answer: "kyō", lang: "es", why: "La ょ pequeña se une a き: kyo, y la う la alarga." },
    },
    {
      id: "katakana-use",
      title: "¿Cuándo se usa el katakana?",
      explain: "El katakana se usa para palabras que vienen de otros idiomas, nombres de otros países y para destacar algo. Las palabras japonesas van en hiragana o kanji.",
      examples: [
        { w: "テレビ", r: "terebi", es: "televisión" },
        { w: "パン", r: "pan", es: "pan" },
        { w: "メキシコ", r: "mekishiko", es: "México" },
      ],
      check: { q: "¿En qué escritura esperas ver «televisión»?", options: ["katakana", "hiragana", "kanji"], answer: "katakana", lang: "es", why: "Es una palabra extranjera: va en katakana (テレビ)." },
    },
  ],
};
