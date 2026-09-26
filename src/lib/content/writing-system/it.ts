// Revisión nativa: pendiente
import { latinTyping, N, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const IT_WRITING: WritingSystem = {
  alphabetNote: "21 letras propias; j, k, w, x, y sólo aparecen en palabras extranjeras.",
  spelling: true,
  alphabet: [
    N("A a", "a"), N("B b", "bi"), N("C c", "chi"), N("D d", "di"), N("E e", "e"), N("F f", "effe"), N("G g", "yi (dyi)"),
    N("H h", "acca"), N("I i", "i"), N("L l", "elle"), N("M m", "emme"), N("N n", "enne"), N("O o", "o"), N("P p", "pi"),
    N("Q q", "cu"), N("R r", "erre"), N("S s", "esse"), N("T t", "ti"), N("U u", "u"), N("V v", "vu"), N("Z z", "dseta"),
    N("J j", "i lunga (extranjera)", "J"), N("K k", "cappa (extranjera)", "K"), N("W w", "doppia vu (extranjera)", "W"), N("X x", "ics (extranjera)", "X"), N("Y y", "ipsilon (extranjera)", "Y"),
  ],
  signs: [
    SG("à è ì ò ù", "acento grave", "Marca la fuerza en la última sílaba: città, caffè, però.", "città", "ciudad"),
    SG("é", "acento agudo", "Una e cerrada al final: perché, poiché.", "perché", "por qué / porque"),
    SG("'", "apóstrofo", "Une palabras cuando se pierde una vocal: l'amico, un'amica.", "l'acqua", "el agua"),
  ],
  typing: latinTyping("italiano", "à è é ò"),
  units: [
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "Acentos y apóstrofo",
      rules: [
        R("e-e", "e / è", "e sin acento es «y»; è con acento es «es / está».", [["pane e burro", undefined, "pan y mantequilla"], ["Marco è italiano.", undefined, "Marco es italiano."]], { q: "Completa: «Lei ___ stanca» (está cansada).", options: ["è", "e"], answer: "è", lang: "target" }),
        R("apostrophe", "l', un' ante vocal", "Lo, la y una pierden la vocal ante otra vocal: l'amico, l'acqua, un'amica. Un (masculino) nunca lleva apóstrofo: un amico.", [["l'amico", undefined, "el amigo"], ["un'amica", undefined, "una amiga"], ["un amico", undefined, "un amigo"]], { q: "¿Cómo se escribe «una amiga»?", options: ["un'amica", "una amica", "un amica"], answer: "un'amica", lang: "target" }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Puntuación, mayúsculas y números",
      rules: [
        R("no-inverted", "Sin ¿ ni ¡", "Como en inglés, las preguntas sólo llevan ? al final: Come stai?", [["Come stai?", undefined, "¿Cómo estás?"]], { q: "¿Cuál está bien escrita?", options: ["Dove sei?", "¿Dove sei?"], answer: "Dove sei?", lang: "target" }),
        R("lower-days", "Días y meses en minúscula", "Como en español: lunedì, gennaio, l'italiano. La coma es decimal: 2,5.", [["lunedì 5 maggio", undefined, "lunes 5 de mayo"]], { q: "¿Cómo se escribe «enero»?", options: ["gennaio", "Gennaio"], answer: "gennaio", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Dobles y grupos difíciles",
      rules: [
        R("doubles", "Las dobles se escriben y se oyen", "Si oyes la consonante larga, escríbela doble: notte, anno, mamma. Cambia el significado: caro (querido) / carro (carro).", [["notte", "nót-te", "noche"], ["caro / carro", undefined, "querido / carro"]], { q: "¿Cómo se escribe «año»?", options: ["anno", "ano"], answer: "anno", lang: "target", why: "ano es otra palabra: escribe siempre la doble." }),
        R("qu-cu", "qu o cu", "Casi siempre qu: quando, questo. Excepciones frecuentes con cu: cuore, cuoco, scuola.", [["quando", undefined, "cuando"], ["scuola", undefined, "escuela"]], { q: "¿Cómo se escribe «escuela»?", options: ["scuola", "squola"], answer: "scuola", lang: "target" }),
      ],
    },
  ],
};
