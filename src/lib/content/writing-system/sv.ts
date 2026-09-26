// Revisión nativa: pendiente
import { latinTyping, N, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const SV_WRITING: WritingSystem = {
  alphabetNote: "29 letras: las 26 de siempre más å, ä y ö, que van al final del abecedario (en ese orden).",
  spelling: true,
  alphabet: [
    N("A a", "a"), N("B b", "be"), N("C c", "se"), N("D d", "de"), N("E e", "e"), N("F f", "ef"), N("G g", "gue"),
    N("H h", "ho"), N("I i", "i"), N("J j", "yi"), N("K k", "ko"), N("L l", "el"), N("M m", "em"), N("N n", "en"),
    N("O o", "u (o sueca)"), N("P p", "pe"), N("Q q", "kü"), N("R r", "er"), N("S s", "es"), N("T t", "te"), N("U u", "u sueca"),
    N("V v", "ve"), N("W w", "dubbel-ve"), N("X x", "eks"), N("Y y", "ü"), N("Z z", "seta"),
    N("Å å", "o", "Å"), N("Ä ä", "e abierta", "Ä"), N("Ö ö", "ö", "Ö"),
  ],
  signs: [
    SG("å", "a con círculo", "Una letra propia que suena o: två, år.", "år", "año"),
    SG("ä", "a con diéresis", "Letra propia: e abierta. Cambia la palabra: har (tiene) / här (aquí).", "där", "allí"),
    SG("ö", "o con diéresis", "Letra propia: ö. öl (cerveza) no es ol.", "öl", "cerveza"),
  ],
  typing: latinTyping("sueco", "å ä ö"),
  units: [
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "å, ä, ö: letras propias",
      rules: [
        R("own-letters", "No son adornos: son letras", "å, ä y ö son letras distintas, con su sitio al final del abecedario. Cambian la palabra: har (tiene) / här (aquí).", [["har", "har", "tiene"], ["här", "hèr", "aquí"]], { q: "¿Cómo se escribe «aquí»?", options: ["här", "har", "hår"], answer: "här", lang: "target", why: "hår es «pelo»; har es «tiene»." }),
        R("order", "Van al final del diccionario", "En el diccionario, å, ä y ö van después de la z. Por eso «öl» aparece al final.", [["… x, y, z, å, ä, ö", undefined, "el final del abecedario sueco"]], { q: "¿Qué palabra va antes en el diccionario sueco?", options: ["zebra", "äpple"], answer: "zebra", lang: "target" }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Mayúsculas y números",
      rules: [
        R("lower", "Días, meses, idiomas y nacionalidades en minúscula", "måndag, januari, svenska, spansk: todo en minúscula.", [["Jag talar svenska.", undefined, "Hablo sueco."], ["på måndag", undefined, "el lunes"]], { q: "¿Cuál está bien escrita?", options: ["Jag talar spanska.", "Jag talar Spanska."], answer: "Jag talar spanska.", lang: "target" }),
        R("numbers", "Coma decimal y espacio de miles", "2,5 y 1 000. Las preguntas sólo con ? al final: Hur mår du?", [["2,5 kilo", undefined, "2,5 kilos"], ["Hur mår du?", undefined, "¿Cómo estás?"]], { q: "¿Cómo se escribe «dos coma cinco»?", options: ["2,5", "2.5"], answer: "2,5", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Consonante doble = vocal corta",
      rules: [
        R("double", "Vocal corta: dobla la consonante", "Si la vocal es corta, la consonante se dobla: tack, glass, komma. Si es larga, no: tak, glas.", [["glas / glass", undefined, "vaso / helado"], ["tak / tack", undefined, "techo / gracias"]], { q: "¿Cómo se escribe «gracias»?", options: ["tack", "tak"], answer: "tack", lang: "target" }),
        R("sj-spelling", "Muchas formas de escribir «sj»", "El mismo sonido se escribe sj, sk (ante e, i, y, ä, ö), stj o skj: sju, sked, stjärna, skjorta. Aprende cada palabra con su forma.", [["sju", "shü", "siete"], ["stjärna", "shèrna", "estrella"]], { q: "¿Cómo se escribe «siete»?", options: ["sju", "skju", "shju"], answer: "sju", lang: "target" }),
      ],
    },
  ],
};
