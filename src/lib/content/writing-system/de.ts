// Revisión nativa: pendiente
import { latinTyping, N, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const DE_WRITING: WritingSystem = {
  alphabetNote: "26 letras más ä, ö, ü y ß. En el diccionario, ä va junto a a, ö junto a o y ü junto a u.",
  spelling: true,
  alphabet: [
    N("A a", "a"), N("B b", "be"), N("C c", "tse"), N("D d", "de"), N("E e", "e"), N("F f", "ef"), N("G g", "gue"),
    N("H h", "ha"), N("I i", "i"), N("J j", "yot"), N("K k", "ka"), N("L l", "el"), N("M m", "em"), N("N n", "en"),
    N("O o", "o"), N("P p", "pe"), N("Q q", "ku"), N("R r", "er"), N("S s", "es"), N("T t", "te"), N("U u", "u"),
    N("V v", "fau"), N("W w", "ve"), N("X x", "iks"), N("Y y", "üpsilon"), N("Z z", "tset"),
    N("Ä ä", "a con diéresis (e abierta)", "Ä"), N("Ö ö", "o con diéresis (ö)", "Ö"), N("Ü ü", "u con diéresis (ü)", "Ü"), N("ß", "eszett (ese fuerte)", "Eszett"),
  ],
  signs: [
    SG("ä ö ü", "Umlaut (diéresis)", "Cambia la vocal: a → ä (e abierta), o → ö, u → ü. Si no puedes escribirla: ae, oe, ue.", "schön", "bonito"),
    SG("ß", "eszett", "Una s fuerte tras vocal larga o diptongo (Straße). En Suiza se escribe ss. Tras vocal corta, ss (Kuss).", "Straße", "calle"),
    SG("„ “", "comillas alemanas", "Abajo al abrir y arriba al cerrar: „Hallo“.", "„Danke“", "«Gracias»"),
  ],
  typing: latinTyping("alemán", "ä ö ü ß"),
  units: [
    {
      id: "capitals",
      level: "A1",
      kind: "capitals",
      title: "Mayúsculas: los sustantivos",
      rules: [
        R("nouns", "Todo sustantivo con mayúscula", "En alemán cualquier sustantivo empieza con mayúscula, esté donde esté: der Hund, die Liebe, das Essen.", [["Ich habe einen Hund.", undefined, "Tengo un perro."], ["Die Liebe ist schön.", undefined, "El amor es bonito."]], { q: "¿Cuál está bien escrita?", options: ["Wir trinken Wasser.", "Wir trinken wasser.", "Wir Trinken Wasser."], answer: "Wir trinken Wasser.", lang: "target", why: "Wasser es sustantivo (mayúscula); trinken es verbo (minúscula)." }),
        R("sie-Sie", "sie / Sie", "Sie con mayúscula es «usted» (y «ustedes»). sie en minúscula es «ella» o «ellos».", [["Wie heißen Sie?", undefined, "¿Cómo se llama usted?"], ["Sie heißt Anna.", undefined, "Ella se llama Anna (al principio va con mayúscula)."]], { q: "¿Cómo se escribe «usted» en mitad de la frase?", options: ["Sie", "sie"], answer: "Sie", lang: "target" }),
      ],
    },
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "Umlaut y ß",
      rules: [
        R("umlaut-meaning", "La diéresis cambia la palabra", "Sin los puntitos es otra palabra: schon (ya) / schön (bonito); Bruder (hermano) / Brüder (hermanos).", [["schon", "shon", "ya"], ["schön", "shön", "bonito"]], { q: "¿Cómo se escribe «bonito»?", options: ["schön", "schon", "shön"], answer: "schön", lang: "target" }),
        R("ss-eszett", "ß o ss", "Tras vocal larga o diptongo, ß (Straße, heißen). Tras vocal corta, ss (Kuss, dass, Wasser).", [["Straße", "shtráse", "calle"], ["Wasser", "váser", "agua"]], { q: "¿Cómo se escribe «llamarse» (ei es diptongo)?", options: ["heißen", "heissen", "heisen"], answer: "heißen", lang: "target", why: "Tras el diptongo ei se escribe ß (en Suiza, ss)." }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Puntuación y números",
      rules: [
        R("comma-dass", "Coma antes de dass, weil, wenn", "Toda oración subordinada va separada por coma: Ich glaube, dass… Sin ¿ ni ¡ al principio.", [["Ich komme nicht, weil ich krank bin.", undefined, "No voy porque estoy enfermo."]], { q: "¿Cuál está bien puntuada?", options: ["Ich weiß, dass du kommst.", "Ich weiß dass du kommst.", "¿Ich weiß, dass du kommst?"], answer: "Ich weiß, dass du kommst.", lang: "target" }),
        R("numbers", "Coma decimal y fecha con puntos", "3,5 (drei Komma fünf); 1.000 (mil, con punto). Fechas: 14.07.2026. Los ordinales llevan punto: der 3. Mai.", [["3,5 Kilo", undefined, "3,5 kilos"], ["am 3. Mai", undefined, "el 3 de mayo"]], { q: "¿Cómo se escribe «el 3 de mayo»?", options: ["am 3. Mai", "am 3 Mai", "am Mai 3"], answer: "am 3. Mai", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Consonantes dobles y vocal larga",
      rules: [
        R("double", "Doble consonante = vocal corta", "Si la vocal es corta, la consonante se dobla: kommen, Mutter, Bett. Si es larga, no: Name, Tag.", [["kommen", "kómen", "venir"], ["Name", "náame", "nombre"]], { q: "¿Cómo se escribe «cama» (la e es corta)?", options: ["Bett", "Bet", "Beet"], answer: "Bett", lang: "target" }),
        R("ie", "ie = i larga", "La i larga casi siempre se escribe ie: Liebe, viel, spielen.", [["viel", "fiil", "mucho"], ["spielen", "shpílen", "jugar"]], { q: "¿Cómo se escribe «mucho»?", options: ["viel", "vil", "fiel"], answer: "viel", lang: "target" }),
      ],
    },
  ],
};
