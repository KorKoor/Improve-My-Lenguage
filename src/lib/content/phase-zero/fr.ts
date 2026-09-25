// Revisión nativa: pendiente
import { S } from "./letter";
import type { PhaseZeroContent } from "./types";

export const FR: PhaseZeroContent = {
  letters: [
    {
      id: "fr-vowels",
      title: "Vocales que se escriben con dos letras",
      intro: "En francés, muchas vocales se escriben con dos letras pero suenan como una sola. Escúchalas en una palabra.",
      letters: [
        S("ou", "u", "u de «uva»", ["vous", "vu", "usted, vosotros"]),
        S("u", "ü", "una i dicha con los labios en forma de u", ["tu", "tü", "tú"]),
        S("eu", "ö", "una e con los labios redondos, como para decir o", ["deux", "dö", "dos"]),
        S("oi", "ua", "«ua» de «guapo»", ["moi", "muá", "yo"]),
        S("au", "o", "o cerrada; «eau» suena igual", ["beau", "bo", "bonito"]),
      ],
    },
    {
      id: "fr-accents",
      title: "Acentos y letras especiales",
      intro: "Los acentos del francés no marcan la sílaba fuerte: cambian cómo suena la e.",
      letters: [
        S("é", "e cerrada", "e con la boca casi cerrada, sonriendo", ["été", "eté", "verano"]),
        S("è", "e abierta", "e con la boca más abierta; ê, ai y ei suenan igual", ["mère", "mèr", "madre"]),
        S("ç", "s", "c con colita: siempre suena s", ["français", "fransè", "francés"]),
        S("e", "casi muda", "al final de palabra no suena; en medio, muy suave", ["petite", "petít", "pequeña"]),
        S("h", "no suena", "la h nunca se pronuncia", ["homme", "om", "hombre"]),
      ],
    },
    {
      id: "fr-nasal",
      title: "Vocales nasales",
      intro: "Vocal + n o m al final de sílaba: el aire sale también por la nariz y la n casi no se oye.",
      letters: [
        S("an", "an nasal", "«an» por la nariz; «en» suena igual", ["enfant", "anfán", "niño"]),
        S("on", "on nasal", "«on» por la nariz, con los labios redondos", ["bon", "bon", "bueno"]),
        S("in", "en nasal", "una «e» abierta por la nariz; «ain» y «un» suenan parecido", ["vin", "ven", "vino"]),
      ],
    },
    {
      id: "fr-cons",
      title: "Consonantes con sonido propio",
      intro: "Estas consonantes suenan distinto que en español.",
      letters: [
        S("ch", "sh", "sh, como al pedir silencio", ["chat", "sha", "gato"]),
        S("j", "zh", "como la «y» argentina de «yo»; también la g antes de e, i", ["je", "zhö", "yo"]),
        S("gn", "ñ", "como nuestra ñ", ["montagne", "montáñ", "montaña"]),
        S("r", "r de garganta", "una r suave en el fondo de la boca, casi como una j suave", ["rouge", "rush", "rojo"]),
        S("qu", "k", "siempre k: la u no suena", ["qui", "ki", "quién"]),
      ],
    },
  ],
  rules: [
    {
      id: "silent-finals",
      title: "Las consonantes finales casi nunca suenan",
      explain: "La s, t, d, x o z del final no se pronuncian. Suelen sonar las c, r, f y l finales (piensa en «careful»).",
      examples: [
        { w: "petit", r: "petí", es: "pequeño" },
        { w: "grand", r: "grán", es: "grande" },
        { w: "vous", r: "vu", es: "usted, vosotros" },
      ],
      check: { q: "¿Cómo suena «petit» (pequeño)?", show: "petit", options: ["petí", "petít", "petite"], answer: "petí", lang: "es", why: "La t final no suena." },
    },
    {
      id: "e-muet",
      title: "La e final no suena… pero hace sonar la consonante",
      explain: "La e del final no se pronuncia. Pero gracias a ella se oye la consonante de antes: petit (petí) / petite (petít).",
      examples: [
        { w: "table", r: "tabl", es: "mesa" },
        { w: "porte", r: "port", es: "puerta" },
        { w: "petite", r: "petít", es: "pequeña" },
      ],
      check: { q: "¿Cómo suena «petite» (pequeña)?", show: "petite", options: ["petít", "petí", "petíte"], answer: "petít", lang: "es", why: "La e no suena, pero ahora sí se oye la t." },
    },
    {
      id: "liaison",
      title: "Liaison: la consonante final se une a la vocal siguiente",
      explain: "Si la palabra siguiente empieza por vocal, la consonante final muda «despierta» y se une a ella. La s suena z.",
      examples: [
        { w: "les amis", r: "lezamí", es: "los amigos" },
        { w: "vous avez", r: "vuzavé", es: "ustedes tienen" },
        { w: "petit ami", r: "petitamí", es: "novio" },
      ],
      check: { q: "¿Cómo se dice «les amis» (los amigos)?", show: "les amis", options: ["lezamí", "le amí", "les amís"], answer: "lezamí", lang: "es", why: "La s de «les» se une a «amis» y suena z." },
    },
    {
      id: "elision",
      title: "Elisión: le, la, je, de pierden la vocal",
      explain: "Ante una palabra que empieza por vocal (o h), le, la, je, de, que, ne pierden su vocal y se escribe un apóstrofo.",
      examples: [
        { w: "l'ami", r: "lamí", es: "el amigo" },
        { w: "j'aime", r: "zhèm", es: "me gusta, amo" },
        { w: "c'est", r: "sè", es: "es" },
      ],
      check: { q: "¿Cómo se escribe «le» + «ami»?", options: ["l'ami", "le ami", "la ami"], answer: "l'ami", lang: "target", why: "Ante vocal, le pierde la e: l'ami." },
    },
    {
      id: "final-stress",
      title: "La fuerza va siempre al final",
      explain: "En francés la última sílaba que suena es la fuerte. Los acentos escritos no marcan la fuerza, sólo el sonido de la e.",
      examples: [
        { w: "café", r: "kafé", es: "café" },
        { w: "chocolat", r: "shokolá", es: "chocolate" },
        { w: "Paris", r: "parí", es: "París" },
      ],
      check: { q: "¿Dónde va la fuerza en «chocolat»?", show: "chocolat", options: ["al final: sho-ko-LÁ", "al principio: SHO-ko-la"], answer: "al final: sho-ko-LÁ", lang: "es", why: "Siempre en la última sílaba que suena." },
    },
  ],
};
