// Revisión nativa: pendiente
import { latinTyping, N, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const PT_WRITING: WritingSystem = {
  alphabetNote: "26 letras, como en español sin ñ (se escribe nh). ç y las vocales con tilde no cuentan como letras aparte.",
  spelling: true,
  alphabet: [
    N("A a", "á"), N("B b", "bê"), N("C c", "cê"), N("D d", "dê"), N("E e", "é"), N("F f", "efe"), N("G g", "gê (yê)"),
    N("H h", "agá"), N("I i", "i"), N("J j", "jota (yota)"), N("K k", "cá"), N("L l", "ele"), N("M m", "eme"), N("N n", "ene"),
    N("O o", "ó"), N("P p", "pê"), N("Q q", "quê"), N("R r", "erre"), N("S s", "esse"), N("T t", "tê"), N("U u", "u"),
    N("V v", "vê"), N("W w", "dáblio"), N("X x", "xis (shis)"), N("Y y", "ípsilon"), N("Z z", "zê"),
  ],
  signs: [
    SG("á é í ó ú", "acento agudo", "Marca la sílaba fuerte y, en e y o, una vocal abierta: café, avó (abuela).", "café", "café"),
    SG("â ê ô", "circunflejo", "Sílaba fuerte con vocal cerrada: você, avô (abuelo).", "você", "tú / usted"),
    SG("ã õ", "til", "Vocal nasal: pão, mãe, lições.", "pão", "pan"),
    SG("ç", "cedilla", "La c suena s ante a, o, u: coração, açúcar.", "coração", "corazón"),
    SG("à", "crase", "a + a unidas: vou à praia (voy a la playa).", "à noite", "por la noche"),
  ],
  typing: latinTyping("portugués", "ã á â à ç"),
  units: [
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "Til, acentos y cedilla",
      rules: [
        R("avo", "avô / avó", "El acento cambia la palabra: avô (abuelo, o cerrada) / avó (abuela, o abierta).", [["avô", "avô", "abuelo"], ["avó", "avó", "abuela"]], { q: "¿Cómo se escribe «abuela»?", options: ["avó", "avô", "avo"], answer: "avó", lang: "target" }),
        R("ao", "-ão en el plural: -ões, -ães, -ãos", "Las palabras en -ão hacen el plural de tres formas; la más común es -ões: lição → lições. También: pão → pães, mão → mãos.", [["lições", undefined, "lecciones"], ["pães", undefined, "panes"], ["mãos", undefined, "manos"]], { q: "¿Cuál es el plural de «lição» (lección)?", options: ["lições", "lição", "liçãos"], answer: "lições", lang: "target" }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Puntuación y números",
      rules: [
        R("no-inverted", "Sin ¿ ni ¡", "Las preguntas llevan ? sólo al final: Tudo bem?", [["Tudo bem?", undefined, "¿Todo bien?"]], { q: "¿Cuál está bien escrita?", options: ["Como você se chama?", "¿Como você se chama?"], answer: "Como você se chama?", lang: "target" }),
        R("lower-days", "Días y meses en minúscula; coma decimal", "segunda-feira, janeiro, o português. Números: 2,5 y R$ 1.000,00.", [["segunda-feira", undefined, "lunes"], ["R$ 10,50", undefined, "10,50 reales"]], { q: "¿Cómo se escribe «enero»?", options: ["janeiro", "Janeiro"], answer: "janeiro", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Contracciones y palabras que engañan",
      rules: [
        R("contractions", "no, na, do, da, num", "Las preposiciones se unen al artículo: em + o = no, de + a = da, em + um = num.", [["no Brasil", undefined, "en Brasil"], ["a casa da Ana", undefined, "la casa de Ana"]], { q: "¿Cómo se dice «de el» (de + o)?", options: ["do", "de o", "del"], answer: "do", lang: "target" }),
        R("por-que", "por que / porque / por quê / porquê", "Pregunta: Por que você veio? Respuesta: Porque sim. Al final de la pregunta: Você veio por quê? Como sustantivo: o porquê.", [["Por que você está triste?", undefined, "¿Por qué estás triste?"], ["Porque estou cansado.", undefined, "Porque estoy cansado."]], { q: "Completa la respuesta: «___ choveu» (porque llovió).", options: ["Porque", "Por que", "Por quê"], answer: "Porque", lang: "target" }),
      ],
    },
  ],
};
