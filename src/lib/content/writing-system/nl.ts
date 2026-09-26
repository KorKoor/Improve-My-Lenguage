// Revisión nativa: pendiente
import { latinTyping, N, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const NL_WRITING: WritingSystem = {
  alphabetNote: "26 letras. La ij se trata casi como una letra: al principio de frase se escriben las dos en mayúscula (IJsland).",
  spelling: true,
  alphabet: [
    N("A a", "a"), N("B b", "bee"), N("C c", "see"), N("D d", "dee"), N("E e", "ee"), N("F f", "ef"), N("G g", "jee (j raspada)"),
    N("H h", "haa"), N("I i", "ii"), N("J j", "yee"), N("K k", "kaa"), N("L l", "el"), N("M m", "em"), N("N n", "en"),
    N("O o", "oo"), N("P p", "pee"), N("Q q", "kü"), N("R r", "er"), N("S s", "es"), N("T t", "tee"), N("U u", "ü"),
    N("V v", "vee"), N("W w", "wee"), N("X x", "iks"), N("Y y", "ei (griekse ij)"), N("Z z", "zet"),
  ],
  signs: [
    SG("ë ï", "trema", "La vocal empieza sílaba nueva: België (Bél-gui-e), ruïne.", "België", "Bélgica"),
    SG("é", "acento para enfatizar", "Marca énfasis: één (uno, número) frente a een (un).", "één", "uno (número)"),
    SG("IJ", "ij mayúscula", "Al empezar con mayúscula, las dos letras: IJsland, IJssel.", "IJsland", "Islandia"),
    SG("'", "apóstrofo", "Plurales de palabras en vocal: auto's, foto's.", "foto's", "fotos"),
  ],
  typing: latinTyping("neerlandés", "ë é"),
  units: [
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "Trema, acentos y apóstrofo",
      rules: [
        R("een-een", "een / één", "een (sin acento) es el artículo «un/una»; één con acentos es el número 1.", [["een huis", undefined, "una casa"], ["één huis", undefined, "una sola casa (una, no dos)"]], { q: "¿Cómo se escribe «una sola manzana»?", options: ["één appel", "een appel"], answer: "één appel", lang: "target" }),
        R("plural-apostrophe", "Plurales con apóstrofo: auto's", "Las palabras que acaban en a, i, o, u, y hacen el plural con 's para no cambiar el sonido: auto's, foto's, baby's.", [["twee foto's", undefined, "dos fotos"]], { q: "¿Cuál es el plural de «auto»?", options: ["auto's", "autos", "autoos"], answer: "auto's", lang: "target" }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Mayúsculas y números",
      rules: [
        R("lower-days", "Días y meses en minúscula", "maandag, januari. Los idiomas y nacionalidades sí con mayúscula: Nederlands, Spaans.", [["op maandag", undefined, "el lunes"], ["Ik spreek Spaans.", undefined, "Hablo español."]], { q: "¿Cuál está bien escrita?", options: ["Ik leer Nederlands op maandag.", "Ik leer nederlands op Maandag."], answer: "Ik leer Nederlands op maandag.", lang: "target" }),
        R("decimal", "Coma decimal y sin ¿ ¡", "2,5 (twee komma vijf); 1.000 (mil). Las preguntas sólo llevan ? al final.", [["€ 2,50", undefined, "2,50 euros"], ["Hoe gaat het?", undefined, "¿Qué tal?"]], { q: "¿Cómo se escribe «dos euros y medio»?", options: ["€ 2,50", "€ 2.50"], answer: "€ 2,50", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Vocal larga, vocal corta",
      rules: [
        R("open-syllable", "Una vocal si la sílaba acaba en vocal", "La vocal larga se escribe doble en sílaba cerrada (maan) y simple en sílaba abierta (ma-nen). Por eso: maan → manen.", [["maan / manen", undefined, "luna / lunas"], ["boom / bomen", undefined, "árbol / árboles"]], { q: "¿Cuál es el plural de «boom» (árbol)?", options: ["bomen", "boomen", "bommen"], answer: "bomen", lang: "target" }),
        R("d-t", "d o t al final: mira el plural", "Suenan igual (t). El plural lo dice: hond → honden (d); kat → katten (t).", [["hond / honden", undefined, "perro / perros"], ["kat / katten", undefined, "gato / gatos"]], { q: "El plural es «handen» (manos). ¿Cómo se escribe «mano»?", options: ["hand", "hant"], answer: "hand", lang: "target" }),
      ],
    },
  ],
};
