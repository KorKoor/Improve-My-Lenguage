// Revisión nativa: pendiente
import { N, scriptTyping, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const KO_WRITING: WritingSystem = {
  alphabetNote: "Orden del diccionario: primero las consonantes (ㄱ ㄴ ㄷ…) y dentro de ellas las vocales. Cada consonante tiene nombre: 기역 (giyeok), 니은 (nieun)…",
  spelling: true,
  alphabet: [
    N("ㄱ", "giyeok", "기역"), N("ㄴ", "nieun", "니은"), N("ㄷ", "digeut", "디귿"), N("ㄹ", "rieul", "리을"), N("ㅁ", "mieum", "미음"),
    N("ㅂ", "bieup", "비읍"), N("ㅅ", "siot", "시옷"), N("ㅇ", "ieung", "이응"), N("ㅈ", "jieut", "지읒"), N("ㅊ", "chieut", "치읓"),
    N("ㅋ", "kieuk", "키읔"), N("ㅌ", "tieut", "티읕"), N("ㅍ", "pieup", "피읖"), N("ㅎ", "hieut", "히읗"),
    N("ㅏ", "a", "아"), N("ㅑ", "ya", "야"), N("ㅓ", "eo", "어"), N("ㅕ", "yeo", "여"), N("ㅗ", "o", "오"),
    N("ㅛ", "yo", "요"), N("ㅜ", "u", "우"), N("ㅠ", "yu", "유"), N("ㅡ", "eu", "으"), N("ㅣ", "i", "이"),
  ],
  signs: [
    SG("ㄲ ㄸ ㅃ ㅆ ㅉ", "consonantes dobles", "Sonidos tensos. En el teclado: Mayús + la consonante simple.", "빵", "pan"),
    SG("ㄳ ㄵ ㄶ ㄺ ㄻ ㄼ ㅄ", "finales dobles", "Dos consonantes debajo del bloque; sólo suena una (salvo que siga una vocal).", "없어요", "no hay"),
    SG("띄어쓰기", "espacios entre palabras", "El coreano sí separa las palabras con espacios, pero las partículas van pegadas: 저는 학생이에요.", "저는 학생이에요.", "Soy estudiante."),
  ],
  typing: scriptTyping("coreano", "Usa el teclado 2-beolsik (두벌식): las consonantes a la izquierda y las vocales a la derecha; el bloque se forma solo."),
  units: [
    {
      id: "spacing",
      level: "A1",
      kind: "punctuation",
      title: "Espacios y partículas",
      rules: [
        R("particles-attached", "Las partículas van pegadas", "은/는, 이/가, 을/를 se escriben pegadas a la palabra: 저는, 물을. El espacio va entre palabras.", [["저는 물을 마셔요.", "jeoneun mureul masyeoyo.", "Bebo agua."]], { q: "¿Cuál está bien escrita?", options: ["저는 학생이에요.", "저 는 학생 이에요."], answer: "저는 학생이에요.", lang: "target" }),
        R("punct", "La puntuación es como la nuestra", "Punto, coma y ? como en español, pero sin ¿ ni ¡: 뭐예요?", [["이게 뭐예요?", "ige mwoyeyo?", "¿Qué es esto?"]], { q: "¿Cuál está bien escrita?", options: ["괜찮아요?", "¿괜찮아요?"], answer: "괜찮아요?", lang: "target" }),
      ],
    },
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "Consonantes dobles y finales",
      rules: [
        R("tense", "Una consonante doble cambia la palabra", "달 (luna) / 딸 (hija); 불 (fuego) / 뿔 (cuerno). La doble se dice tensa, sin aire.", [["달", "dal", "luna"], ["딸", "ttal", "hija"]], { q: "¿Cómo se escribe «hija»?", options: ["딸", "달", "탈"], answer: "딸", lang: "target" }),
        R("final-writing", "La final se escribe aunque suene distinta", "옷 (ropa) se dice «ot» pero se escribe con ㅅ, porque al añadir una vocal reaparece: 옷이 (o-si).", [["옷", "ot", "ropa"], ["옷이", "osi", "la ropa (+ partícula)"]], { q: "¿Con qué consonante final se escribe 옷 (ot)?", options: ["ㅅ", "ㄷ", "ㅌ"], answer: "ㅅ", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Palabras que suenan parecido",
      rules: [
        R("ae-e", "ㅐ y ㅔ suenan igual hoy", "개 (perro) y 게 (cangrejo) suenan casi igual: hay que aprender cómo se escribe cada palabra.", [["개", "gae", "perro"], ["게", "ge", "cangrejo"]], { q: "¿Cómo se escribe «perro»?", options: ["개", "게"], answer: "개", lang: "target" }),
        R("dwae-doe", "돼 o 되", "돼 es la forma contraída de 되어: 돼요 (está bien, vale). 되 va delante de otra terminación: 되다, 됩니다.", [["돼요", "dwaeyo", "vale, se puede"], ["됩니다", "doemnida", "se puede (formal)"]], { q: "¿Cómo se escribe «vale» (informal cortés)?", options: ["돼요", "되요"], answer: "돼요", lang: "target" }),
      ],
    },
  ],
};
