// Revisión nativa: pendiente
import { S } from "./letter";
import type { PhaseZeroContent } from "./types";

export const IT: PhaseZeroContent = {
  letters: [
    {
      id: "it-groups",
      title: "Grupos de letras",
      intro: "El italiano se lee casi como el español, salvo estos grupos.",
      letters: [
        S("ci", "ch", "c ante e, i suena ch", ["ciao", "chao", "hola"]),
        S("gi", "dy", "g ante e, i suena «dy», como la y fuerte de «yo»", ["giorno", "dyórno", "día"]),
        S("chi", "k", "ch ante e, i suena k", ["chiesa", "kiésa", "iglesia"]),
        S("ghi", "gui", "gh ante e, i suena como nuestra «gui»", ["funghi", "fúngui", "setas"]),
        S("gli", "lli", "una l mojada, como «lli» muy unida", ["figlio", "fíllo", "hijo"]),
        S("gn", "ñ", "como nuestra ñ", ["bagno", "baño", "baño"]),
        S("sci", "sh", "sc ante e, i suena sh", ["sciarpa", "shárpa", "bufanda"]),
      ],
    },
    {
      id: "it-cons",
      title: "Consonantes con sorpresa",
      intro: "Pocas, pero importantes.",
      letters: [
        S("z", "ts", "ts o ds, nunca como la z de España", ["pizza", "pítsa", "pizza"]),
        S("tt", "consonante larga", "las dobles se sostienen un instante", ["notte", "nót-te", "noche"]),
        S("h", "no suena", "sólo sirve para cambiar c y g (chi, ghi) o en ho, hai, ha", ["ho", "o", "tengo"]),
      ],
    },
  ],
  rules: [
    {
      id: "doubles",
      title: "Las consonantes dobles se alargan",
      explain: "Una consonante doble se sostiene un instante más, y cambia el significado: nono (noveno) no es nonno (abuelo).",
      examples: [
        { w: "nonno", r: "nón-no", es: "abuelo" },
        { w: "anno", r: "án-no", es: "año" },
        { w: "carro", r: "kár-ro", es: "carro, carreta" },
      ],
      check: { q: "¿Cuál significa «abuelo»?", options: ["nonno", "nono"], answer: "nonno", lang: "target", why: "nono = noveno; nonno = abuelo." },
    },
    {
      id: "c-g",
      title: "c y g cambian ante e, i",
      explain: "Ante a, o, u suenan como en «casa» y «gato». Ante e, i: c suena ch y g suena dy.",
      examples: [
        { w: "casa", r: "kása", es: "casa" },
        { w: "cena", r: "chéna", es: "cena" },
        { w: "gelato", r: "dyeláto", es: "helado" },
      ],
      check: { q: "¿Cómo suena «cinema» (cine)?", show: "cinema", options: ["chínema", "sínema", "kínema"], answer: "chínema", lang: "es", why: "c ante i suena ch." },
    },
    {
      id: "h-hard",
      title: "La h endurece: chi, che, ghi, ghe",
      explain: "Para decir «ki, ke, gui, gue» el italiano pone una h: chi, che, ghi, ghe.",
      examples: [
        { w: "chi", r: "ki", es: "quién" },
        { w: "anche", r: "ánke", es: "también" },
        { w: "funghi", r: "fúngui", es: "setas" },
      ],
      check: { q: "¿Cómo suena «chiave» (llave)?", show: "chiave", options: ["kiáve", "chiáve", "shiáve"], answer: "kiáve", lang: "es", why: "ch ante i suena k." },
    },
    {
      id: "accent",
      title: "La tilde sólo aparece al final",
      explain: "Casi todas las palabras llevan la fuerza en la penúltima sílaba y no se marca. Si la fuerza va en la última, se escribe tilde: città, perché.",
      examples: [
        { w: "città", r: "chit-TÀ", es: "ciudad" },
        { w: "perché", r: "per-KÉ", es: "por qué, porque" },
        { w: "caffè", r: "kaf-FÈ", es: "café" },
      ],
      check: { q: "¿Dónde va la fuerza en «città»?", show: "città", options: ["al final: chit-TÀ", "al principio: CHIT-ta"], answer: "al final: chit-TÀ", lang: "es", why: "La tilde marca la fuerza en la última sílaba." },
    },
    {
      id: "z",
      title: "La z suena ts o ds",
      explain: "Nunca como la z de España: suena «ts» (pizza) o «ds» (zero). Entre vocales la s suele sonar suave, casi z.",
      examples: [
        { w: "pizza", r: "pítsa", es: "pizza" },
        { w: "zucchero", r: "tsúkero", es: "azúcar" },
        { w: "zero", r: "dséro", es: "cero" },
      ],
      check: { q: "¿Cómo suena la z de «pizza»?", show: "pizza", options: ["ts", "s", "z de España"], answer: "ts", lang: "es" },
    },
  ],
};
