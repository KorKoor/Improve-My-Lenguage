// Revisión nativa: pendiente
import { N, scriptTyping, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

const GOJUON: [string, string][] = [
  ["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"], ["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"],
  ["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"], ["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"],
  ["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"], ["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"],
  ["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"], ["や", "ya"], ["ゆ", "yu"], ["よ", "yo"],
  ["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"], ["わ", "wa"], ["を", "wo (o)"], ["ん", "n"],
];

export const JA_WRITING: WritingSystem = {
  alphabetNote: "No hay abecedario: el orden de los diccionarios es el gojūon, la tabla de 5 vocales × consonantes (あいうえお, かきくけこ…). No se deletrea letra a letra: se dice cada sílaba.",
  spelling: false,
  alphabet: GOJUON.map(([k, r]) => N(k, r, k)),
  signs: [
    SG("゛", "dakuten (dos rayitas)", "Hace sonora la consonante: か→が, さ→ざ, た→だ, は→ば.", "がっこう", "escuela"),
    SG("゜", "handakuten (circulito)", "Convierte la h en p: は→ぱ.", "ぱん", "pan"),
    SG("ー", "raya de alargar", "En katakana alarga la vocal anterior.", "コーヒー", "café"),
    SG("っ ゃ ゅ ょ", "kana pequeños", "っ: pausa; ゃゅょ: se unen a la sílaba anterior (きょ = kyo).", "きょう", "hoy"),
    SG("。、「」", "puntuación japonesa", "Punto 。, coma 、 y comillas 「」. No hay espacios entre palabras ni signo de interrogación obligatorio (か lo marca).", "「はい。」", "«Sí.»"),
  ],
  typing: scriptTyping("japonés", "Con el teclado japonés escribes en romaji (ka) y sale か; con la barra espaciadora conviertes a kanji."),
  units: [
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Sin espacios, con 。 y 「」",
      rules: [
        R("no-spaces", "No hay espacios entre palabras", "El japonés se escribe todo seguido; el cambio entre kanji y kana ayuda a ver dónde empieza cada palabra. En libros para niños sí hay espacios.", [["わたしはがくせいです。", "watashi wa gakusei desu.", "Soy estudiante."]], { q: "¿Cómo se escribe normalmente «Soy estudiante»?", options: ["わたしはがくせいです。", "わたし は がくせい です 。"], answer: "わたしはがくせいです。", lang: "target" }),
        R("ka-question", "La pregunta la marca か", "Una pregunta acaba en か y un punto 。; el signo ? es opcional en textos informales.", [["げんきですか。", "genki desu ka.", "¿Estás bien?"]], { q: "¿Qué marca que una frase es una pregunta?", options: ["か al final", "¿ al principio"], answer: "か al final", lang: "es" }),
      ],
    },
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "゛ ゜ y kana pequeños",
      rules: [
        R("dakuten", "Dos rayitas: sonido sonoro", "゛ cambia k→g, s→z, t→d, h→b; ゜ cambia h→p. Sin ellas es otra palabra: かき (caqui) / かぎ (llave).", [["かき", "kaki", "caqui"], ["かぎ", "kagi", "llave"]], { q: "¿Cómo se escribe «llave»?", options: ["かぎ", "かき"], answer: "かぎ", lang: "target" }),
        R("small-tsu-writing", "っ pequeña, no つ grande", "Una つ grande es la sílaba tsu; una っ pequeña es una pausa. きって (sello) ≠ きつて.", [["きって", "kitte", "sello"]], { q: "¿Cómo se escribe «kitte» (sello)?", options: ["きって", "きつて"], answer: "きって", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Vocales largas y partículas",
      rules: [
        R("ou-long", "La o larga se escribe おう", "En hiragana la o larga casi siempre se escribe おう (がっこう, ありがとう), y la e larga, えい (せんせい). En katakana, con ー.", [["がっこう", "gakkō", "escuela"], ["せんせい", "sensē", "profesor"]], { q: "¿Cómo se escribe «sensē» (profesor)?", options: ["せんせい", "せんせー", "せんせ"], answer: "せんせい", lang: "target" }),
        R("particle-wo", "を sólo como partícula", "El sonido «o» de la partícula de objeto se escribe を; en cualquier otra palabra, お.", [["パンをたべる", "pan o taberu", "comer pan"], ["おちゃ", "ocha", "té"]], { q: "Completa: «みず___のむ» (beber agua).", options: ["を", "お"], answer: "を", lang: "target" }),
      ],
    },
  ],
};
