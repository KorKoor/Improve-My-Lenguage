/**
 * Alfabetos de los idiomas que no usan letras latinas (ruso, árabe, coreano,
 * japonés y chino): lo primero que necesita quien empieza de cero para poder
 * leer algo. Cada letra trae su sonido explicado para hispanohablantes, qué
 * decirle a la voz del navegador y una palabra de ejemplo.
 *
 * También da el teclado en pantalla de cada escritura (el teclado del móvil o
 * del ordenador no los tiene) y el desglose letra a letra de una palabra.
 * Contenido escrito y revisado a mano.
 */
import { romanizeSyllable } from "../hangul";
import type { LanguageCode } from "./types";

export interface Letter {
  /** La letra tal como se escribe (en minúscula si la escritura las tiene). */
  g: string;
  /** Mayúscula, sólo en escrituras que la tienen (cirílico). */
  upper?: string;
  /** Transcripción latina corta; es la respuesta en los ejercicios. */
  r: string;
  /** Cómo suena, explicado para hispanohablantes. */
  hint?: string;
  /** Qué leer en voz alta (si no, se lee `g`). */
  say?: string;
  /** Etiqueta corta para las fichas letra a letra (si `r` es largo). */
  t?: string;
  ex?: { w: string; r: string; es: string };
}

export interface LetterGroup {
  id: string;
  title: string;
  intro: string;
  /** Subconjunto de la escritura (hiragana/katakana): las opciones del ejercicio no se mezclan. */
  set?: string;
  letters: Letter[];
}

export interface Alphabet {
  lang: LanguageCode;
  name: string;
  intro: string;
  groups: LetterGroup[];
  tips: string[];
}

export interface KeyboardLayout {
  label: string;
  rows: string[][];
}

const L = (g: string, r: string, hint?: string, ex?: [string, string, string], extra?: Partial<Letter>): Letter => ({
  g,
  r,
  ...(hint ? { hint } : {}),
  ...(ex ? { ex: { w: ex[0], r: ex[1], es: ex[2] } } : {}),
  ...extra,
});
const RU = (upper: string, lower: string, r: string, hint: string, ex: [string, string, string]) => L(lower, r, hint, ex, { upper });

// ── Ruso: cirílico ─────────────────────────────────────────────────────────
const RUSSIAN: Alphabet = {
  lang: "ru",
  name: "El alfabeto cirílico",
  intro: "El ruso tiene 33 letras. Buena noticia: unas cuantas son iguales que las nuestras y casi todas suenan siempre igual. Empieza por las fáciles y ve subiendo.",
  groups: [
    {
      id: "ru-same",
      title: "Iguales que en español",
      intro: "Se escriben y suenan casi como en español. Ya puedes leer «мама» y «кот».",
      letters: [
        RU("А", "а", "a", "a de «casa»", ["мама", "mama", "mamá"]),
        RU("К", "к", "k", "k de «kilo»", ["кот", "kot", "gato"]),
        RU("М", "м", "m", "m de «mesa»", ["мир", "mir", "mundo, paz"]),
        RU("О", "о", "o", "o; sin acento suena casi como «a»", ["окно", "okno", "ventana"]),
        RU("Т", "т", "t", "t de «taza»", ["там", "tam", "allí"]),
      ],
    },
    {
      id: "ru-false",
      title: "Parecen conocidas… pero engañan",
      intro: "Las trampas del cirílico: se parecen a letras nuestras pero suenan distinto. Apréndelas bien.",
      letters: [
        RU("В", "в", "v", "parece B, pero es una v de dientes y labio (como en inglés «very»)", ["вода", "vodá", "agua"]),
        RU("Е", "е", "ye", "parece E, pero suena «ye» como en «yeso»", ["еда", "yedá", "comida"]),
        RU("Н", "н", "n", "parece H, pero es una n", ["нос", "nos", "nariz"]),
        RU("Р", "р", "r", "parece P, pero es una r vibrante", ["рыба", "ryba", "pez"]),
        RU("С", "с", "s", "parece C, pero siempre suena s", ["сок", "sok", "zumo"]),
        RU("У", "у", "u", "parece Y, pero es una u", ["утро", "utro", "mañana"]),
        RU("Х", "х", "j", "parece X, pero suena como la j de «jamón»", ["хлеб", "jleb", "pan"]),
      ],
    },
    {
      id: "ru-new",
      title: "Nuevas, con sonidos conocidos",
      intro: "Formas nuevas, pero sonidos que ya tienes en español.",
      letters: [
        RU("Б", "б", "b", "b de «barco»", ["банк", "bank", "banco"]),
        RU("Г", "г", "g", "g de «gato» (siempre suave, nunca como «gente»)", ["город", "górod", "ciudad"]),
        RU("Д", "д", "d", "d de «dedo»", ["дом", "dom", "casa"]),
        RU("З", "з", "z", "s sonora, como un zumbido de abeja", ["зима", "zimá", "invierno"]),
        RU("И", "и", "i", "i de «isla»", ["игра", "igrá", "juego"]),
        RU("Л", "л", "l", "l, un poco más grave que la nuestra", ["луна", "luná", "luna"]),
        RU("П", "п", "p", "p de «pan»", ["папа", "papa", "papá"]),
        RU("Ф", "ф", "f", "f de «foca»", ["фото", "foto", "foto"]),
        RU("Э", "э", "e", "e de «eco»", ["это", "eto", "esto"]),
        { ...RU("Й", "й", "i breve", "i muy corta, como la y de «hoy»", ["мой", "moy", "mío"]), t: "y" },
      ],
    },
    {
      id: "ru-sounds",
      title: "Sonidos nuevos",
      intro: "Estos sonidos no existen igual en español. Escúchalos varias veces e imítalos.",
      letters: [
        RU("Ж", "ж", "zh", "como la ll/y argentina de «yo» o la j francesa", ["журнал", "zhurnál", "revista"]),
        RU("Ц", "ц", "ts", "t y s juntas, como en «tsunami»", ["цирк", "tsirk", "circo"]),
        RU("Ч", "ч", "ch", "ch de «chico»", ["чай", "chay", "té"]),
        RU("Ш", "ш", "sh", "sh, como cuando pides silencio: «shhh»", ["школа", "shkóla", "escuela"]),
        RU("Щ", "щ", "shch", "una sh larga y suave", ["борщ", "borshch", "borsch (sopa)"]),
        RU("Ы", "ы", "y", "una i dicha con la lengua hacia atrás (entre i y u)", ["ты", "ty", "tú"]),
      ],
    },
    {
      id: "ru-y",
      title: "Vocales con «y»",
      intro: "Tres vocales que llevan una y delante. Con la Е que ya viste, completan la serie ya-ye-yo-yu.",
      letters: [
        RU("Ё", "ё", "yo", "«yo»; siempre lleva el acento de la palabra", ["ёж", "yozh", "erizo"]),
        RU("Ю", "ю", "yu", "«yu» de «yugo»", ["юг", "yug", "sur"]),
        RU("Я", "я", "ya", "«ya» de «yate». Sola significa «yo»", ["я", "ya", "yo"]),
      ],
    },
    {
      id: "ru-signs",
      title: "Los dos signos mudos",
      intro: "No suenan solos: cambian cómo se pronuncia la letra de al lado.",
      letters: [
        { ...RU("Ъ", "ъ", "signo duro", "no suena: separa la consonante de la vocal que sigue", ["объект", "obyekt", "objeto"]), t: "—" },
        { ...RU("Ь", "ь", "signo blando", "no suena: ablanda la consonante anterior (como una i muy leve)", ["день", "den'", "día"]), t: "ʼ" },
      ],
    },
  ],
  tips: [
    "Casi todo se lee como se escribe: cuando conozcas las 33 letras podrás leer cualquier palabra en voz alta.",
    "La «о» sin acento suena casi como «a»: молоко se dice «malakó».",
    "Para escribir en la app usa el teclado cirílico que aparece debajo de las respuestas.",
  ],
};

// ── Árabe ──────────────────────────────────────────────────────────────────
const A = (g: string, r: string, name: string, hint: string, ex: [string, string, string]) => L(g, r, hint, ex, { say: name });

const ARABIC: Alphabet = {
  lang: "ar",
  name: "El alfabeto árabe",
  intro: "El árabe se escribe de derecha a izquierda y tiene 28 letras, casi todas consonantes. Las letras se unen entre sí y cambian un poco de forma según vayan al principio, en medio o al final de la palabra. Muchas comparten forma y sólo cambian los puntos: fíjate en ellos.",
  groups: [
    {
      id: "ar-long",
      title: "Las tres vocales largas",
      intro: "Alif, waw y ya: hacen de vocales largas (ā, ū, ī) y a veces de consonantes (w, y).",
      letters: [
        A("ا", "ā", "ألف", "alif: a larga; también sirve de soporte para otras vocales", ["ماء", "māʼ", "agua"]),
        A("و", "w/ū", "واو", "waw: w de «huevo» o u larga", ["ولد", "walad", "niño"]),
        A("ي", "y/ī", "ياء", "ya: y de «yo» o i larga", ["يد", "yad", "mano"]),
      ],
    },
    {
      id: "ar-boat",
      title: "La familia de la barca",
      intro: "La misma forma de barquita; sólo cambian los puntos. Uno abajo = b, dos arriba = t, tres arriba = th, uno arriba = n.",
      letters: [
        A("ب", "b", "باء", "b de «barco»; un punto abajo", ["باب", "bāb", "puerta"]),
        A("ت", "t", "تاء", "t de «taza»; dos puntos arriba", ["تمر", "tamr", "dátiles"]),
        A("ث", "th", "ثاء", "como la z de España en «zapato»; tres puntos arriba", ["ثلاثة", "thalātha", "tres"]),
        A("ن", "n", "نون", "n de «nube»; un punto arriba", ["نار", "nār", "fuego"]),
      ],
    },
    {
      id: "ar-hook",
      title: "La familia del gancho",
      intro: "Tres letras con forma de gancho: punto dentro = j, sin punto = ḥ, punto encima = kh.",
      letters: [
        A("ج", "j", "جيم", "como «dy» o la j inglesa de «jeans»; punto dentro", ["جمل", "jamal", "camello"]),
        A("ح", "ḥ", "حاء", "una h fuerte que sale de la garganta, como al echar vaho a un cristal; sin punto", ["حب", "ḥubb", "amor"]),
        A("خ", "kh", "خاء", "j de «jamón», bien raspada; punto encima", ["خبز", "khubz", "pan"]),
      ],
    },
    {
      id: "ar-alone",
      title: "Las que no se unen por la izquierda",
      intro: "Estas letras (y también alif y waw) nunca se unen a la letra que va después: dejan un pequeño hueco en la palabra.",
      letters: [
        A("د", "d", "دال", "d de «dedo»", ["دار", "dār", "casa"]),
        A("ذ", "dh", "ذال", "la d suave de «nada»; con un punto", ["ذهب", "dhahab", "oro"]),
        A("ر", "r", "راء", "r vibrante, como en «pero»", ["رجل", "rajul", "hombre"]),
        A("ز", "z", "زاي", "s sonora, como un zumbido; con un punto", ["زيت", "zayt", "aceite"]),
      ],
    },
    {
      id: "ar-teeth",
      title: "Las letras con dientes",
      intro: "Sīn y shīn tienen «dientecitos»; ṣād y ḍād, un lazo. Las dos últimas son enfáticas: se dicen con la lengua más atrás y suenan más graves.",
      letters: [
        A("س", "s", "سين", "s de «sol»", ["سمك", "samak", "pescado"]),
        A("ش", "sh", "شين", "sh de «shhh»; tres puntos", ["شمس", "shams", "sol"]),
        A("ص", "ṣ", "صاد", "una s enfática, más grave", ["صديق", "ṣadīq", "amigo"]),
        A("ض", "ḍ", "ضاد", "una d enfática; con un punto", ["ضوء", "ḍawʼ", "luz"]),
      ],
    },
    {
      id: "ar-emph",
      title: "Enfáticas altas",
      intro: "Con palo vertical. Se pronuncian con la boca «hueca», como si la voz sonara desde el fondo.",
      letters: [
        A("ط", "ṭ", "طاء", "una t enfática", ["طعام", "ṭaʻām", "comida"]),
        A("ظ", "ẓ", "ظاء", "una dh enfática; con un punto", ["ظل", "ẓill", "sombra"]),
      ],
    },
    {
      id: "ar-throat",
      title: "Sonidos de garganta",
      intro: "Los dos sonidos más nuevos para un hispanohablante. Escúchalos muchas veces.",
      letters: [
        A("ع", "ʻ", "عين", "ʻayn: se aprieta la garganta, como al hacer fuerza; no existe en español", ["عين", "ʻayn", "ojo"]),
        A("غ", "gh", "غين", "como la r francesa o una g que gargariza; con un punto", ["غرفة", "ghurfa", "habitación"]),
      ],
    },
    {
      id: "ar-rest",
      title: "Las demás",
      intro: "Sonidos casi todos conocidos. Ojo con qāf: es una k dicha muy atrás.",
      letters: [
        A("ف", "f", "فاء", "f de «foca»; un punto", ["فيل", "fīl", "elefante"]),
        A("ق", "q", "قاف", "una k muy atrás en la garganta; dos puntos", ["قلم", "qalam", "lápiz"]),
        A("ك", "k", "كاف", "k de «kilo»", ["كتاب", "kitāb", "libro"]),
        A("ل", "l", "لام", "l de «luna»", ["ليل", "layl", "noche"]),
        A("م", "m", "ميم", "m de «mesa»", ["مدرسة", "madrasa", "escuela"]),
        A("ه", "h", "هاء", "h aspirada suave, como en inglés «hello»", ["هنا", "hunā", "aquí"]),
      ],
    },
    {
      id: "ar-short",
      title: "Vocales cortas",
      intro: "Las vocales cortas son rayitas y bucles encima o debajo de la consonante. En los textos normales casi nunca se escriben: se adivinan. Aquí las ves sobre la letra ب.",
      letters: [
        L("بَ", "ba", "fatḥa: rayita encima = a", undefined, { say: "بَ" }),
        L("بِ", "bi", "kasra: rayita debajo = i", undefined, { say: "بِ" }),
        L("بُ", "bu", "ḍamma: bucle encima = u", undefined, { say: "بُ" }),
        L("بْ", "b (sin vocal)", "sukūn: circulito = sin vocal", undefined, { say: "أَبْ" }),
      ],
    },
  ],
  tips: [
    "Se lee de derecha a izquierda. Los números, en cambio, van de izquierda a derecha.",
    "Casi todas las letras cambian de forma al unirse: toca una letra para ver sus formas al principio, en medio y al final.",
    "Las vocales cortas no suelen escribirse; por eso la app te muestra siempre la transcripción debajo.",
    "Para escribir en la app usa el teclado árabe que aparece debajo de las respuestas, o escribe la transcripción latina.",
  ],
};

/** Letras árabes que no se unen a la siguiente. */
const AR_NON_JOINING = new Set([..."اأإآدذرزوؤة"]);

/** Formas de una letra árabe: [sola, inicial, media, final]. */
export function arabicForms(g: string): [string, string, string, string] {
  const T = "ـ";
  return AR_NON_JOINING.has(g) ? [g, g, T + g, T + g] : [g, g + T, T + g + T, T + g];
}

// ── Coreano: hangul ────────────────────────────────────────────────────────
const K = (g: string, r: string, say: string, hint: string, ex: [string, string, string]) => L(g, r, hint, ex, { say });

const KOREAN: Alphabet = {
  lang: "ko",
  name: "El alfabeto coreano (hangul)",
  intro: "El hangul se inventó para ser fácil: 14 consonantes y 10 vocales básicas que se juntan en bloques, uno por sílaba. Por ejemplo, 한 = ㅎ (h) + ㅏ (a) + ㄴ (n). En una tarde puedes leerlo.",
  groups: [
    {
      id: "ko-cons",
      title: "Consonantes básicas",
      intro: "Las formas imitan la boca: ㄱ es la lengua tocando el paladar, ㅁ es la boca cerrada… ㅇ al principio de sílaba no suena; al final suena «ng».",
      letters: [
        K("ㄱ", "g/k", "가", "g de «gato» (al final, k)", ["가방", "gabang", "bolso"]),
        K("ㄴ", "n", "나", "n de «nube»", ["나무", "namu", "árbol"]),
        K("ㄷ", "d/t", "다", "d de «dedo» (al final, t)", ["다리", "dari", "pierna, puente"]),
        K("ㄹ", "r/l", "라", "entre r suave y l (r de «cara»; al final, l)", ["라면", "ramyeon", "ramen"]),
        K("ㅁ", "m", "마", "m de «mesa»", ["물", "mul", "agua"]),
        K("ㅂ", "b/p", "바", "b de «barco» (al final, p)", ["바다", "bada", "mar"]),
        K("ㅅ", "s", "사", "s de «sol»", ["사람", "saram", "persona"]),
        K("ㅇ", "ng", "아", "muda al principio de sílaba; «ng» al final", ["아이", "ai", "niño"]),
        K("ㅈ", "j", "자", "entre «ch» y «y»: como «dch» suave", ["자동차", "jadongcha", "coche"]),
        K("ㅊ", "ch", "차", "ch con un soplo de aire", ["차", "cha", "té, coche"]),
        K("ㅋ", "k", "카", "k con un soplo de aire", ["커피", "keopi", "café"]),
        K("ㅌ", "t", "타", "t con un soplo de aire", ["토마토", "tomato", "tomate"]),
        K("ㅍ", "p", "파", "p con un soplo de aire", ["피자", "pija", "pizza"]),
        K("ㅎ", "h", "하", "h aspirada suave, como en inglés «hello»", ["하나", "hana", "uno"]),
      ],
    },
    {
      id: "ko-vow",
      title: "Vocales básicas",
      intro: "Un palo largo con rayitas. Una rayita = vocal simple; dos rayitas = la misma vocal con «y» delante. En las sílabas sin consonante se escriben tras ㅇ: 아, 오…",
      letters: [
        K("ㅏ", "a", "아", "a de «casa»", ["아빠", "appa", "papá"]),
        K("ㅑ", "ya", "야", "«ya»", ["야구", "yagu", "béisbol"]),
        K("ㅓ", "eo", "어", "una o muy abierta, casi a", ["어머니", "eomeoni", "madre"]),
        K("ㅕ", "yeo", "여", "«yo» con la o muy abierta", ["여자", "yeoja", "mujer"]),
        K("ㅗ", "o", "오", "o cerrada, con los labios redondos", ["오이", "oi", "pepino"]),
        K("ㅛ", "yo", "요", "«yo» cerrada", ["요리", "yori", "cocina"]),
        K("ㅜ", "u", "우", "u de «uva»", ["우유", "uyu", "leche"]),
        K("ㅠ", "yu", "유", "«yu»", ["유리", "yuri", "cristal"]),
        K("ㅡ", "eu", "으", "una u sin redondear los labios (sonriendo)", ["크다", "keuda", "ser grande"]),
        K("ㅣ", "i", "이", "i de «isla»", ["이름", "ireum", "nombre"]),
      ],
    },
    {
      id: "ko-double",
      title: "Consonantes dobles",
      intro: "Consonante repetida = sonido tenso, sin aire, como apretando la garganta.",
      letters: [
        K("ㄲ", "kk", "까", "k tensa, sin soplo", ["꽃", "kkot", "flor"]),
        K("ㄸ", "tt", "따", "t tensa, sin soplo", ["딸", "ttal", "hija"]),
        K("ㅃ", "pp", "빠", "p tensa, sin soplo", ["빵", "ppang", "pan"]),
        K("ㅆ", "ss", "싸", "s fuerte y tensa", ["쌀", "ssal", "arroz"]),
        K("ㅉ", "jj", "짜", "«ch» tensa, sin soplo", ["짜다", "jjada", "ser salado"]),
      ],
    },
    {
      id: "ko-mix",
      title: "Vocales compuestas",
      intro: "Dos vocales juntas forman una nueva: ㅗ + ㅏ = ㅘ (wa). Hoy ㅐ y ㅔ suenan casi igual: e.",
      letters: [
        K("ㅐ", "ae", "애", "e abierta", ["개", "gae", "perro"]),
        K("ㅔ", "e", "에", "e de «mesa»", ["게", "ge", "cangrejo"]),
        K("ㅒ", "yae", "얘", "«ye»", ["얘기", "yaegi", "charla"]),
        K("ㅖ", "ye", "예", "«ye»", ["예", "ye", "sí"]),
        K("ㅘ", "wa", "와", "«wa» de «guapo»", ["과일", "gwail", "fruta"]),
        K("ㅙ", "wae", "왜", "«we»", ["왜", "wae", "¿por qué?"]),
        K("ㅚ", "oe", "외", "«we»", ["회사", "hoesa", "empresa"]),
        K("ㅝ", "wo", "워", "«wo» de «guau»", ["원", "won", "won (moneda)"]),
        K("ㅞ", "we", "웨", "«we» de «huevo»", ["웨이터", "weiteo", "camarero"]),
        K("ㅟ", "wi", "위", "«wi» de «Luis»", ["귀", "gwi", "oreja"]),
        K("ㅢ", "ui", "의", "ㅡ + ㅣ dichas muy rápido", ["의사", "uisa", "médico"]),
      ],
    },
  ],
  tips: [
    "Cada bloque es una sílaba: consonante + vocal (+ consonante final). 한국 = han + guk.",
    "Con las 14 consonantes y 10 vocales básicas ya puedes leer la mayoría de las palabras.",
    "En el teclado de la app, toca las letras en orden (ㅎ, ㅏ, ㄴ) y se juntan solas en 한.",
  ],
};

// ── Japonés: hiragana y katakana ───────────────────────────────────────────
const KANA_ROMAN = "a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n".split(" ");
const HIRA = [..."あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん"];
const KATA = [..."アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"];
const DAKU_ROMAN = "ga gi gu ge go za ji zu ze zo da de do ba bi bu be bo pa pi pu pe po".split(" ");
const HIRA_DAKU = [..."がぎぐげござじずぜぞだでどばびぶべぼぱぴぷぺぽ"];
const KATA_DAKU = [..."ガギグゲゴザジズゼゾダデドバビブベボパピプペポ"];

const KANA_HINTS: Record<string, string> = {
  a: "a de «casa»",
  i: "i de «isla»",
  u: "u muy relajada, casi sin redondear los labios",
  e: "e de «mesa»",
  o: "o de «oso»",
  shi: "«shi»: como «si» pero con sh",
  chi: "«chi» de «chico»",
  tsu: "«tsu»: t y s juntas",
  fu: "entre «fu» y «ju»: soplando suave, sin morder el labio",
  ha: "«ja» suave, como una h inglesa. Como partícula (は) se lee «wa»",
  ra: "r suave de «cara», nunca fuerte",
  ri: "r suave de «cara»",
  ru: "r suave de «cara»",
  re: "r suave de «cara»",
  ro: "r suave de «cara»",
  ya: "«ya»",
  yu: "«yu»",
  yo: "«yo»",
  wo: "se lee «o»; sólo se usa como partícula de objeto",
  n: "la única consonante que va sola: n (o m antes de b/p)",
  ji: "«yi» con fuerza, como la j inglesa de «jeans»",
  zu: "«dsu»",
  ga: "g de «gato»",
  gi: "«gui» de «guitarra»",
  ge: "«gue»",
};

function kanaGroups(set: "hiragana" | "katakana"): LetterGroup[] {
  const base = set === "hiragana" ? HIRA : KATA;
  const daku = set === "hiragana" ? HIRA_DAKU : KATA_DAKU;
  const pick = (from: number, to: number) => base.slice(from, to).map((g, i) => L(g, KANA_ROMAN[from + i]!, KANA_HINTS[KANA_ROMAN[from + i]!]));
  const name = set === "hiragana" ? "Hiragana" : "Katakana";
  const p = set === "hiragana" ? "ja-h" : "ja-k";
  return [
    { id: `${p}-1`, set, title: `${name}: las vocales`, intro: set === "hiragana" ? "El hiragana es la primera escritura que aprende un niño japonés. Cada signo es una sílaba. Empieza por las cinco vocales: suenan como en español." : "El katakana tiene los mismos sonidos que el hiragana, con trazos más rectos. Se usa para palabras extranjeras: コーヒー (kōhī) = café.", letters: pick(0, 5) },
    { id: `${p}-2`, set, title: `${name}: filas K y S`, intro: "Consonante + vocal. Ojo: «si» se dice «shi».", letters: pick(5, 15) },
    { id: `${p}-3`, set, title: `${name}: filas T y N`, intro: "Ojo con «chi» y «tsu»: no hay «ti» ni «tu».", letters: pick(15, 25) },
    { id: `${p}-4`, set, title: `${name}: filas H y M`, intro: "«hu» se dice «fu», soplando suave.", letters: pick(25, 35) },
    { id: `${p}-5`, set, title: `${name}: Y, R, W y N`, intro: "La r japonesa siempre es suave, como en «cara». La n es la única consonante que va sola.", letters: pick(35, 46) },
    {
      id: `${p}-6`,
      set,
      title: `${name}: con comillas ゛ y círculo ゜`,
      intro: "Dos rayitas (゛) ensucian el sonido: k→g, s→z, t→d, h→b. El circulito (゜) convierte la h en p.",
      letters: daku.map((g, i) => L(g, DAKU_ROMAN[i]!, KANA_HINTS[DAKU_ROMAN[i]!])),
    },
  ];
}

const JAPANESE: Alphabet = {
  lang: "ja",
  name: "Hiragana y katakana",
  intro: "El japonés mezcla tres escrituras: hiragana (sílabas para las palabras japonesas), katakana (las mismas sílabas, para palabras extranjeras) y kanji (caracteres chinos con significado). Empieza por el hiragana: con él puedes escribir cualquier palabra. Los kanji llegan poco a poco y la app siempre te dice cómo se leen.",
  groups: [...kanaGroups("hiragana"), ...kanaGroups("katakana")],
  tips: [
    "Aprende primero todo el hiragana; el katakana se aprende después mucho más rápido porque los sonidos son los mismos.",
    "Una ゃ, ゅ, ょ pequeña se une a la sílaba anterior: き + ゃ = きゃ (kya).",
    "Una っ pequeña es una pausa breve: きって (kitte) = sello.",
    "La raya ー en katakana alarga la vocal: コーヒー (kōhī).",
    "Para escribir en la app usa el teclado de kana que aparece debajo de las respuestas, o escribe en romaji.",
  ],
};

// ── Chino: pinyin, tonos y primeros caracteres ─────────────────────────────
const Z = (g: string, r: string, hint: string) => L(g, r, hint);

const CHINESE: Alphabet = {
  lang: "zh",
  name: "Pinyin, tonos y primeros caracteres",
  intro: "El chino no tiene alfabeto: cada carácter es una sílaba con significado, y hay miles. Para leerlos se usa el pinyin, la escritura con letras latinas que ves debajo de cada palabra. Lo más importante al empezar: los cuatro tonos, porque cambian el significado.",
  groups: [
    {
      id: "zh-tones",
      title: "Los cuatro tonos",
      intro: "La misma sílaba «ma» con distinto tono son palabras distintas. La rayita sobre la vocal te dice el tono.",
      letters: [
        Z("妈", "mā", "1.º tono (ā): alto y plano, como cantando una nota larga. = madre"),
        Z("麻", "má", "2.º tono (á): sube, como al preguntar «¿eh?». = cáñamo"),
        Z("马", "mǎ", "3.º tono (ǎ): baja y vuelve a subir, como diciendo «¿síii?» con duda. = caballo"),
        Z("骂", "mà", "4.º tono (à): cae de golpe, como una orden «¡ya!». = regañar"),
        Z("吗", "ma", "tono neutro (sin marca): corto y suave. = ¿…? (partícula de pregunta)"),
      ],
    },
    {
      id: "zh-sounds",
      title: "Letras del pinyin que engañan",
      intro: "El pinyin usa letras latinas, pero algunas no suenan como en español. Estas son las que más confunden.",
      letters: [
        Z("好", "hǎo", "h: como la j de «jamón», suave. = bien"),
        Z("家", "jiā", "j: como una «ch» suave y sin aire. = casa, familia"),
        Z("七", "qī", "q: como una «ch» con soplo de aire. = siete"),
        Z("小", "xiǎo", "x: entre s y sh, sonriendo. = pequeño"),
        Z("中", "zhōng", "zh: «ch» con la punta de la lengua hacia atrás. = medio"),
        Z("吃", "chī", "ch: como zh pero con soplo de aire. = comer"),
        Z("是", "shì", "sh: «sh» con la lengua hacia atrás. = ser"),
        Z("人", "rén", "r: entre la r inglesa y la «ll» argentina. = persona"),
        Z("在", "zài", "z: como «ds». = estar en"),
        Z("菜", "cài", "c: como «ts» con soplo de aire. = plato, verdura"),
        Z("女", "nǚ", "ü: di «i» con los labios en forma de «u». = mujer"),
        Z("饿", "è", "e: una e muy atrás, casi como la «eu» del coreano. = tener hambre"),
        Z("四", "sì", "i tras z/c/s/zh/ch/sh/r: no es una i, es un zumbido de la consonante. = cuatro"),
        Z("爸", "bà", "b: una p sin aire (suena casi como nuestra b). = papá"),
      ],
    },
    {
      id: "zh-first",
      title: "Tus primeros caracteres",
      intro: "Muchos caracteres básicos son dibujos: 人 es una persona caminando, 山 una montaña, 口 una boca. Tócalos, escúchalos y fíjate en la forma.",
      letters: [
        Z("一", "yī", "uno: una raya"),
        Z("二", "èr", "dos: dos rayas"),
        Z("三", "sān", "tres: tres rayas"),
        Z("大", "dà", "grande: una persona con los brazos abiertos"),
        Z("口", "kǒu", "boca: una boca abierta"),
        Z("日", "rì", "sol, día: el sol"),
        Z("月", "yuè", "luna, mes: la luna"),
        Z("水", "shuǐ", "agua: un río con salpicaduras"),
        Z("火", "huǒ", "fuego: una hoguera"),
        Z("山", "shān", "montaña: tres picos"),
        Z("木", "mù", "árbol: tronco, ramas y raíces"),
        Z("我", "wǒ", "yo"),
        Z("你", "nǐ", "tú"),
        Z("不", "bù", "no"),
      ],
    },
  ],
  tips: [
    "No intentes memorizar miles de caracteres de golpe: la app te enseña cada palabra con su pinyin y su audio.",
    "Pronuncia siempre con tono: sin tono, «ma» puede ser madre o caballo.",
    "Para escribir en la app, escribe en pinyin (con o sin tildes): lo aceptamos como respuesta.",
  ],
};

const ALPHABETS: Record<string, Alphabet> = { ru: RUSSIAN, ar: ARABIC, ko: KOREAN, ja: JAPANESE, zh: CHINESE };

export function alphabetFor(lang: LanguageCode): Alphabet | null {
  return ALPHABETS[lang] ?? null;
}

export function hasAlphabet(lang: LanguageCode): boolean {
  return lang in ALPHABETS;
}

export function alphabetGroup(lang: LanguageCode, groupId: string): LetterGroup | null {
  return alphabetFor(lang)?.groups.find((g) => g.id === groupId) ?? null;
}

// ── Teclados en pantalla ───────────────────────────────────────────────────
const rows = (...rs: string[]) => rs.map((r) => [...r]);
/** Kana en orden del silabario, de 10 en 10 (dos filas de consonante por línea) para que quepa en un móvil. */
const chunk = (xs: string[], n = 10) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));
const kanaRows = (base: string[], daku: string[], small: string) => [...chunk(base), ...chunk(daku), [...small]];

const KEYBOARDS: Record<string, KeyboardLayout[]> = {
  ru: [{ label: "Кириллица", rows: rows("йцукенгшщзхъ", "фывапролджэ", "ячсмитьбюё") }],
  ar: [{ label: "عربي", rows: rows("ضصثقفغعهخحجد", "شسيبلاتنمكط", "ئءؤرىةوزظذ", "أإآ") }],
  ko: [{ label: "한글", rows: rows("ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ", "ㅁㄴㅇㄹㅎㅗㅓㅏㅣ", "ㅋㅌㅊㅍㅠㅜㅡ", "ㅃㅉㄸㄲㅆㅒㅖ") }],
  ja: [
    { label: "ひらがな", rows: kanaRows(HIRA, HIRA_DAKU, "ゃゅょっーぁぃぅぇぉ") },
    { label: "カタカナ", rows: kanaRows(KATA, KATA_DAKU, "ャュョッーァィゥェォ") },
  ],
};

/** Teclado en pantalla para escribir en la escritura del idioma (null si usa letras latinas o el chino, que se escribe en pinyin). */
export function keyboardFor(lang: LanguageCode): KeyboardLayout[] | null {
  return KEYBOARDS[lang] ?? null;
}

// ── Desglose de una palabra, letra a letra ─────────────────────────────────
export interface CharPiece {
  ch: string;
  /** Cómo suena (null: kanji/hanzi u otro signo sin transcripción directa). */
  r: string | null;
  /** Qué leer en voz alta al tocarlo. */
  say: string;
}

const SMALL_Y: Record<string, string> = { ゃ: "ya", ゅ: "yu", ょ: "yo", ャ: "ya", ュ: "yu", ョ: "yo" };
const SMALL_V: Record<string, string> = { ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o", ァ: "a", ィ: "i", ゥ: "u", ェ: "e", ォ: "o" };
const AR_EXTRA: Record<string, [string, string]> = { أ: ["ʼa", "ألف"], إ: ["ʼi", "ألف"], آ: ["ʼā", "ألف"], ء: ["ʼ", "همزة"], ؤ: ["ʼ", "واو"], ئ: ["ʼ", "ياء"], ى: ["ā", "ألف"], ة: ["a", "تاء"] };

let letterIndex: Map<string, Map<string, Letter>> | null = null;
function lettersOf(lang: LanguageCode): Map<string, Letter> {
  letterIndex ??= new Map(
    Object.entries(ALPHABETS).map(([code, a]) => [code, new Map(a.groups.flatMap((g) => g.letters).map((l) => [l.g, l]))]),
  );
  return letterIndex.get(lang) ?? new Map();
}

/**
 * Parte una palabra en sus letras (o sílabas, en coreano y japonés) con su
 * sonido, para aprender a leer dentro de las palabras. [] si el idioma usa
 * letras latinas o si la palabra no tiene nada que desglosar.
 */
export function charBreakdown(lang: LanguageCode, text: string): CharPiece[] {
  if (!hasAlphabet(lang) || lang === "zh") return [];
  const chars = [...text.normalize("NFC").replace(/[ً-ْٰ]/g, "")].filter((c) => /\p{L}|ー/u.test(c));
  const letters = lettersOf(lang);
  const out: CharPiece[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    if (lang === "ko") {
      const r = romanizeSyllable(c);
      out.push({ ch: c, r, say: c });
      continue;
    }
    if (lang === "ja") {
      const next = chars[i + 1];
      const base = letters.get(c)?.r ?? (c === "っ" || c === "ッ" ? "(pausa)" : c === "ー" ? "(larga)" : SMALL_V[c] ?? null);
      if (base && next && SMALL_Y[next]) {
        // き + ゃ = kya; し + ゃ = sha (sin la y).
        const stem = base.slice(0, -1);
        const y = SMALL_Y[next]!;
        out.push({ ch: c + next, r: /^(sh|ch|j)$/.test(stem) ? stem + y.slice(1) : stem + y, say: c + next });
        i++;
        continue;
      }
      out.push({ ch: c, r: base, say: c });
      continue;
    }
    if (lang === "ru") {
      const l = letters.get(c.toLowerCase());
      out.push({ ch: c, r: l ? l.t ?? l.r : null, say: c.toLowerCase() });
      continue;
    }
    // Árabe
    const l = letters.get(c);
    const extra = AR_EXTRA[c];
    out.push({ ch: c, r: l ? l.r : extra ? extra[0] : null, say: l?.say ?? extra?.[1] ?? c });
  }
  return out.some((p) => p.r) ? out : [];
}

// ── Respuestas escritas en transcripción latina ────────────────────────────
/**
 * Formas latinas aceptables de una lectura del diccionario
 * («فِي · fī» → ["fi"], «shì (shi⁴)» → ["shi"], «ni hao» → ["nihao"]).
 * Sin tildes, tonos, espacios ni apóstrofos, para comparar con lo escrito.
 */
export function romanForms(reading: string | undefined): string[] {
  if (!reading) return [];
  const last = reading.split("·").pop()!;
  const out = new Set<string>();
  // «с (s)»: si fuera del paréntesis no hay letras latinas, vale lo de dentro.
  const outside = last.replace(/\([^)]*\)/g, "");
  const text = /[a-z]/i.test(outside.normalize("NFD")) ? outside : [...last.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]).join(",");
  for (const part of text.split(/[,/;]/)) {
    const k = romanKey(part);
    if (k && /^[a-z]+$/.test(k)) out.add(k);
  }
  return [...out];
}

/** Normaliza una transcripción para comparar: minúsculas, sin diacríticos, tonos, espacios ni signos. */
export function romanKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[ʼʻʿʾʕʔʹʺ'’`\-\s.·⁰¹²³⁴⁵\d]/g, "")
    .replace(/ŋ/g, "ng")
    .replace(/ɛ/g, "e");
}
