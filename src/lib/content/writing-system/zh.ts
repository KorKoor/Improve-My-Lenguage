// Revisión nativa: pendiente
import { N, scriptTyping, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

/** Iniciales del pinyin en el orden tradicional (bō pō mō fō…), con la sílaba con que se enseñan. */
export const ZH_WRITING: WritingSystem = {
  alphabetNote: "El chino no tiene abecedario. Para aprender el pinyin se recitan las iniciales en este orden: bō pō mō fō, dē tē nē lē… Los diccionarios se ordenan por pinyin o por radicales.",
  spelling: false,
  alphabet: [
    N("b", "bō", "波"), N("p", "pō", "坡"), N("m", "mō", "摸"), N("f", "fó", "佛"), N("d", "dé", "得"), N("t", "tè", "特"), N("n", "nè", "讷"),
    N("l", "lè", "勒"), N("g", "gē", "哥"), N("k", "kē", "科"), N("h", "hē", "喝"), N("j", "jī", "基"), N("q", "qī", "欺"), N("x", "xī", "希"),
    N("zh", "zhī", "知"), N("ch", "chī", "吃"), N("sh", "shī", "诗"), N("r", "rì", "日"), N("z", "zī", "资"), N("c", "cì", "次"), N("s", "sī", "思"),
    N("y", "yī", "衣"), N("w", "wū", "乌"),
  ],
  signs: [
    SG("ā á ǎ à", "tonos", "La marca va sobre la vocal principal: a, o, e antes que i, u (hǎo, duō). En iu y ui va en la segunda (liù, guì).", "nǐ hǎo", "hola"),
    SG("ü", "u con diéresis", "Sólo se escribe con puntos tras n y l (nǚ, lǜ); tras j, q, x, y se escribe u.", "nǚ", "mujer"),
    SG("。，、", "puntuación china", "Punto 。 (un circulito), coma ，y coma de enumeración 、 (entre elementos de una lista). Todo ocupa un ancho completo.", "我、你、他", "yo, tú, él"),
    SG("「」《》", "comillas y títulos", "「」 o “” para citas; 《》 para títulos de libros y películas.", "《红楼梦》", "Sueño en el pabellón rojo"),
  ],
  typing: scriptTyping("chino (pinyin)", "Escribes el pinyin sin tonos (nihao) y eliges los caracteres 你好 en la lista."),
  units: [
    {
      id: "tone-marks",
      level: "A1",
      kind: "signs",
      title: "Dónde va la marca del tono",
      rules: [
        R("tone-position", "a, o, e primero", "Si la sílaba tiene a, o, e, la marca va ahí: hǎo, zhōu, xiè. Si sólo hay i y u juntas, va en la segunda: liù, duì.", [["hǎo", undefined, "bien"], ["liù", undefined, "seis"], ["duì", undefined, "correcto"]], { q: "¿Dónde va la marca en «hao» (3.er tono)?", options: ["hǎo", "hào", "haǒ"], answer: "hǎo", lang: "es", why: "Sobre la a, y el 3.er tono es ˇ." }),
        R("numbers-tones", "Tonos con números", "Sin teclado de tildes se escriben con números: ni3 hao3 = nǐ hǎo. El 5 (o nada) es el tono neutro.", [["ma1 ma2 ma3 ma4", undefined, "mā má mǎ mà"]], { q: "¿Qué es «xie4xie5»?", options: ["xièxie", "xiēxié", "xiěxie"], answer: "xièxie", lang: "es" }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Puntuación china",
      rules: [
        R("period", "El punto es un circulito 。", "Las frases acaban en 。 y la coma es ，. Todos los signos ocupan el ancho de un carácter.", [["我是学生。", "wǒ shì xuésheng.", "Soy estudiante."]], { q: "¿Cuál es el punto chino?", options: ["。", ".", "·"], answer: "。", lang: "target" }),
        R("dun-hao", "La coma de lista 、", "Para enumerar se usa 、 en vez de coma: 苹果、香蕉和橙子.", [["苹果、香蕉和橙子", "píngguǒ, xiāngjiāo hé chéngzi", "manzanas, plátanos y naranjas"]], { q: "¿Qué signo separa elementos de una lista?", options: ["、", "，", "。"], answer: "、", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Caracteres que se parecen",
      rules: [
        R("similar", "Fíjate en un solo trazo", "人 (persona) / 入 (entrar); 大 (grande) / 太 (demasiado) / 犬 (perro): un trazo cambia la palabra.", [["人", "rén", "persona"], ["入", "rù", "entrar"], ["太", "tài", "demasiado"]], { q: "¿Cuál significa «demasiado»?", options: ["太", "大", "犬"], answer: "太", lang: "target" }),
        R("de-de-de", "的, 地, 得: tres «de»", "Suenan igual (de). 的 va antes de un sustantivo (我的书); 地 antes de un verbo (慢慢地走); 得 después de un verbo (说得好).", [["我的书", "wǒ de shū", "mi libro"], ["说得很好", "shuō de hěn hǎo", "lo dice muy bien"]], { q: "Completa: «我___朋友» (mi amigo).", options: ["的", "地", "得"], answer: "的", lang: "target" }),
      ],
    },
  ],
};
