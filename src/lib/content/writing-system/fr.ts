// Revisión nativa: pendiente
import { latinTyping, N, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const FR_WRITING: WritingSystem = {
  alphabetNote: "26 letras, las mismas que en español pero sin ñ. Las letras con acento no cuentan como letras aparte.",
  spelling: true,
  alphabet: [
    N("A a", "a"), N("B b", "bé"), N("C c", "cé"), N("D d", "dé"), N("E e", "e (como «eu»)"), N("F f", "effe"), N("G g", "gé (yé)"),
    N("H h", "ache"), N("I i", "i"), N("J j", "ji (yi)"), N("K k", "ka"), N("L l", "elle"), N("M m", "emme"), N("N n", "enne"),
    N("O o", "o"), N("P p", "pé"), N("Q q", "qu (ku, con u francesa)"), N("R r", "erre"), N("S s", "esse"), N("T t", "té"),
    N("U u", "u (ü)"), N("V v", "vé"), N("W w", "double vé"), N("X x", "ixe"), N("Y y", "i grec"), N("Z z", "zède"),
  ],
  signs: [
    SG("é", "acento agudo", "Sólo sobre la e: una e cerrada.", "été", "verano"),
    SG("è à ù", "acento grave", "Sobre la e (e abierta) o para distinguir palabras: à (a), où (dónde).", "très", "muy"),
    SG("â ê î ô û", "circunflejo", "Suele marcar una s que se perdió: forêt (floresta), hôpital.", "fenêtre", "ventana"),
    SG("ë ï ü", "diéresis (tréma)", "La vocal se pronuncia aparte: Noël = no-el.", "Noël", "Navidad"),
    SG("ç", "cedilla", "La c suena s delante de a, o, u.", "garçon", "chico"),
    SG("œ", "o y e unidas", "Se escribe unida en palabras como sœur y cœur.", "sœur", "hermana"),
    SG("« »", "comillas", "Comillas angulares, con un espacio por dentro: « Bonjour ».", "« Salut »", "«Hola»"),
  ],
  typing: latinTyping("francés", "é è ê ë"),
  units: [
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "Acentos que cambian el significado",
      rules: [
        R("a-a", "a / à y ou / où", "El acento grave distingue palabras que suenan igual: a (tiene) y à (a, en); ou (o) y où (dónde).", [["Il a un chat.", undefined, "Tiene un gato."], ["Je vais à Paris.", undefined, "Voy a París."], ["Où es-tu ?", undefined, "¿Dónde estás?"]], { q: "¿Cuál completa «Je vais ___ l'école» (voy a la escuela)?", options: ["à", "a"], answer: "à", lang: "target", why: "à es la preposición «a»; a sin acento es «tiene»." }),
        R("e-accents", "é, è, ê: tres e distintas", "é es una e cerrada (café). è y ê son abiertas (mère, fête). La e sin acento al final no suena.", [["café", "kafé", "café"], ["mère", "mèr", "madre"], ["fête", "fèt", "fiesta"]], { q: "¿Cómo se escribe «verano»?", options: ["été", "ete", "èté"], answer: "été", lang: "target", why: "Dos e cerradas: é y é." }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Puntuación a la francesa",
      rules: [
        R("space-before", "Espacio antes de ? ! : ;", "En francés se deja un espacio antes de los signos dobles (? ! : ;) y dentro de las comillas « ». No hay ¿ ni ¡ al principio.", [["Tu viens ?", undefined, "¿Vienes?"], ["Super !", undefined, "¡Genial!"]], { q: "¿Cuál está bien escrita en francés?", options: ["Tu viens ?", "¿Tu viens?", "Tu viens?"], answer: "Tu viens ?", lang: "target", why: "Sin ¿ y con espacio antes de ?." }),
        R("days-lower", "Días y meses en minúscula", "Los días, los meses y los idiomas van en minúscula: lundi, janvier, le français. Las nacionalidades como persona sí llevan mayúscula: un Français.", [["lundi 3 mars", undefined, "lunes 3 de marzo"], ["Je parle français.", undefined, "Hablo francés."]], { q: "¿Cómo se escribe «enero» en una fecha?", options: ["janvier", "Janvier"], answer: "janvier", lang: "target" }),
      ],
    },
    {
      id: "numbers",
      level: "A1",
      kind: "capitals",
      title: "Números, fechas y horas",
      rules: [
        R("decimal", "Coma decimal y espacio para los miles", "Igual que en muchos países hispanos: 3,5 (tres coma cinco) y 1 000 (mil, con espacio). La hora se escribe 14 h 30.", [["3,5 kg", undefined, "3,5 kilos"], ["14 h 30", undefined, "las 14:30"]], { q: "¿Cómo se escribe «dos euros y medio» en francés?", options: ["2,50 €", "2.50 €"], answer: "2,50 €", lang: "target" }),
        R("dates", "Fechas: día, mes, año", "Primero el día: le 14 juillet 2026. El primer día del mes es «le 1er» (premier).", [["le 1er mai", undefined, "el 1 de mayo"], ["le 14 juillet", undefined, "el 14 de julio"]], { q: "¿Cómo se escribe «el 1 de mayo»?", options: ["le 1er mai", "le 1 mai", "le mai 1"], answer: "le 1er mai", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Palabras que suenan igual",
      rules: [
        R("et-est", "et / est", "Suenan igual (é). et es «y»; est es «es» (del verbo être). Truco: si puedes cambiarlo por «était», es est.", [["Paul et Marie", undefined, "Paul y Marie"], ["Il est content.", undefined, "Está contento."]], { q: "Completa: «Elle ___ française» (es francesa).", options: ["est", "et"], answer: "est", lang: "target" }),
        R("elision", "Elisión: l', j', c', qu'", "Ante vocal o h muda, le/la, je, ce, que, de, ne pierden la vocal y llevan apóstrofo.", [["l'eau", undefined, "el agua"], ["j'habite", undefined, "vivo"], ["qu'il", undefined, "que él"]], { q: "¿Cómo se escribe «je» + «aime»?", options: ["j'aime", "je aime", "jaime"], answer: "j'aime", lang: "target" }),
      ],
    },
  ],
};
