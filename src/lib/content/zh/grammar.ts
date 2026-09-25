import type { GrammarConcept } from "../types";

/**
 * Chino mandarín (caracteres simplificados + pinyin): programa A1 → C1.
 * Revisión humana recomendada antes de ampliar.
 */
const es = (t: string) => ({ es: t });

export const ZH_GRAMMAR: GrammarConcept[] = [
  {
    id: "zh:g:shi-de",
    language: "zh",
    title: "是 (ser) y 的 (posesión y descripción)",
    cefr: "A1",
    errorCategory: "zh:shi-de",
    summary:
      "El chino no conjuga: 是 une dos sustantivos («A es B») y no se usa con adjetivos. 的 marca posesión o descripción, como el «de» español pero al revés: 我的书 = mi libro.",
    whenToUse: ["是: identidad o clasificación. 我是学生。", "Con adjetivos, en su lugar se usa 很: 她很高 (ella es alta)."],
    formation: ["A + 是 + B: 他是老师。", "Poseedor + 的 + cosa: 我的朋友, 老师的书.", "Con familia cercana se omite 的: 我妈妈."],
    commonMistakes: [
      { wrong: "我是很累。", right: "我很累。", why: "Con adjetivos no se usa 是; se usa 很." },
      { wrong: "书的我", right: "我的书", why: "El poseedor va primero." },
    ],
    examples: [
      { text: "我是墨西哥人。", reading: "Wǒ shì Mòxīgē rén.", translation: es("Soy mexicano.") },
      { text: "这是我朋友的手机。", reading: "Zhè shì wǒ péngyou de shǒujī.", translation: es("Este es el celular de mi amigo.") },
    ],
    contrasts: [{ a: "她是医生。(es médica)", b: "她很忙。(está ocupada)", explanation: "是 con sustantivos; 很 + adjetivo." }],
    exercises: [
      { type: "mc", prompt: "我___学生。", options: ["是", "很", "的", "了"], answers: ["是"], explanation: "Identidad: 是." },
      { type: "mc", prompt: "今天我___累。", options: ["很", "是", "的", "在"], answers: ["很"], explanation: "Adjetivo → 很, no 是." },
      { type: "mc", prompt: "这是老师___书。", options: ["的", "是", "很", "了"], answers: ["的"], explanation: "Posesión → 的." },
      { type: "mc", prompt: "«mi libro» = ___", options: ["我的书", "书的我", "我是书", "我书的"], answers: ["我的书"], explanation: "Poseedor + 的 + cosa." },
    ],
  },
  {
    id: "zh:g:measure-words",
    language: "zh",
    title: "Clasificadores: 个, 本, 杯, 张…",
    cefr: "A1",
    errorCategory: "zh:measure-words",
    summary: "Entre un número (o 这/那) y un sustantivo siempre va un clasificador. 个 es el comodín, pero muchos objetos tienen el suyo.",
    whenToUse: ["Número/demostrativo + clasificador + sustantivo: 三本书, 这个人."],
    formation: ["个 gè: personas y muchas cosas.", "本 běn: libros · 杯 bēi: vasos, tazas · 张 zhāng: objetos planos (papel, mesas, boletos) · 只 zhī: muchos animales.", "«Dos» delante de un clasificador es 两, no 二: 两个人."],
    commonMistakes: [
      { wrong: "三书", right: "三本书", why: "Falta el clasificador." },
      { wrong: "二个人", right: "两个人", why: "Con clasificador se usa 两." },
    ],
    examples: [
      { text: "我要一杯咖啡。", reading: "Wǒ yào yì bēi kāfēi.", translation: es("Quiero un café.") },
      { text: "我有两本中文书。", reading: "Wǒ yǒu liǎng běn Zhōngwén shū.", translation: es("Tengo dos libros en chino.") },
    ],
    contrasts: [{ a: "一个人 (una persona)", b: "一本书 (un libro)", explanation: "Cada tipo de objeto tiene su clasificador." }],
    exercises: [
      { type: "mc", prompt: "我买了三___书。", options: ["本", "个", "杯", "张"], answers: ["本"], explanation: "Libros → 本." },
      { type: "mc", prompt: "请给我一___茶。", options: ["杯", "本", "只", "张"], answers: ["杯"], explanation: "Bebidas en vaso → 杯." },
      { type: "mc", prompt: "我有___个孩子。(2)", options: ["两", "二", "双", "俩个"], answers: ["两"], explanation: "Con clasificador: 两." },
      { type: "mc", prompt: "这___人是我的老师。", options: ["个", "本", "杯", "张"], answers: ["个"], explanation: "Personas → 个." },
    ],
  },
  {
    id: "zh:g:le",
    language: "zh",
    title: "了: acción completada y cambio de situación",
    cefr: "A2",
    errorCategory: "zh:le",
    summary: "El chino no tiene tiempos verbales: 了 tras el verbo indica que la acción se completó; 了 al final de la frase indica un cambio («ya»).",
    whenToUse: ["Acción terminada: 我吃了饭。", "Cambio de estado: 下雨了 (ya está lloviendo / empezó a llover)."],
    formation: ["Verbo + 了 + objeto (a menudo cuantificado): 我买了两本书。", "Frase + 了: 我饿了 (ya tengo hambre).", "En negativo NO se usa 了: 我没吃饭 (no comí)."],
    commonMistakes: [
      { wrong: "我没吃了饭。", right: "我没吃饭。", why: "没 ya indica que no ocurrió: sin 了." },
      { wrong: "昨天我是去北京。", right: "昨天我去了北京。", why: "Para acciones pasadas completadas: verbo + 了." },
    ],
    examples: [
      { text: "我昨天买了一件衣服。", reading: "Wǒ zuótiān mǎi le yí jiàn yīfu.", translation: es("Ayer compré una prenda de ropa.") },
      { text: "天黑了，我们回家吧。", reading: "Tiān hēi le, wǒmen huí jiā ba.", translation: es("Ya oscureció, volvamos a casa.") },
    ],
    contrasts: [{ a: "我吃了。(ya comí)", b: "我没吃。(no comí)", explanation: "La negación del pasado usa 没 y elimina 了." }],
    exercises: [
      { type: "mc", prompt: "我昨天看___一个电影。", options: ["了", "的", "过", "在"], answers: ["了"], explanation: "Acción completada → 了." },
      { type: "mc", prompt: "我没吃___。", options: ["饭", "了饭", "饭了", "过了饭"], answers: ["饭"], explanation: "Con 没 no se usa 了." },
      { type: "mc", prompt: "下雨___！(ya empezó a llover)", options: ["了", "的", "吗", "呢"], answers: ["了"], explanation: "Cambio de situación: 了 final." },
      { type: "mc", prompt: "«Ayer fui a Pekín» = 昨天我___北京。", options: ["去了", "是去", "去的了", "没去了"], answers: ["去了"], explanation: "Verbo + 了." },
    ],
  },
  {
    id: "zh:g:bu-mei",
    language: "zh",
    title: "Negación: 不 y 没",
    cefr: "A2",
    errorCategory: "zh:negation",
    summary: "不 niega el presente, el futuro, hábitos y adjetivos; 没 (o 没有) niega el pasado y el verbo 有 (tener/haber).",
    whenToUse: ["不: 我不喝咖啡 (no tomo café), 明天我不去 (mañana no voy).", "没: 我没去 (no fui), 我没有钱 (no tengo dinero)."],
    formation: ["不 + verbo/adjetivo: 不忙, 不喜欢.", "没 + verbo (pasado): 没看.", "有 siempre se niega con 没: 没有."],
    commonMistakes: [
      { wrong: "我不有时间。", right: "我没有时间。", why: "有 se niega siempre con 没." },
      { wrong: "昨天我不去。", right: "昨天我没去。", why: "Pasado → 没." },
    ],
    examples: [
      { text: "我不喜欢下雨。", reading: "Wǒ bù xǐhuan xià yǔ.", translation: es("No me gusta la lluvia.") },
      { text: "他昨天没来上班。", reading: "Tā zuótiān méi lái shàngbān.", translation: es("Ayer no vino a trabajar.") },
    ],
    contrasts: [{ a: "我不去。(no voy / no iré)", b: "我没去。(no fui)", explanation: "Presente/futuro frente a pasado." }],
    exercises: [
      { type: "mc", prompt: "我___有钱。", options: ["没", "不", "别", "无"], answers: ["没"], explanation: "有 → 没有." },
      { type: "mc", prompt: "我___喝酒。(nunca bebo)", options: ["不", "没", "了", "过"], answers: ["不"], explanation: "Hábito → 不." },
      { type: "mc", prompt: "昨天他___来。", options: ["没", "不", "别", "了"], answers: ["没"], explanation: "Pasado → 没." },
      { type: "mc", prompt: "今天我___忙。", options: ["不", "没", "没有", "别"], answers: ["不"], explanation: "Adjetivo → 不." },
    ],
  },
  {
    id: "zh:g:guo-zai",
    language: "zh",
    title: "Experiencia 过 y progresivo 在",
    cefr: "B1",
    errorCategory: "zh:aspect",
    summary: "过 tras el verbo indica que alguna vez has vivido esa experiencia; 在 delante del verbo indica que la acción está en curso.",
    whenToUse: ["过: 我去过中国 (he estado en China).", "在: 我在做饭 (estoy cocinando)."],
    formation: ["Verbo + 过: 吃过, 看过. Negación: 没 + verbo + 过.", "在 + verbo (+ 呢): 他在睡觉呢."],
    commonMistakes: [
      { wrong: "我去了过中国。", right: "我去过中国。", why: "No se combinan 了 y 过 así." },
      { wrong: "我没去中国过。", right: "我没去过中国。", why: "过 va pegado al verbo." },
    ],
    examples: [
      { text: "你吃过北京烤鸭吗？", reading: "Nǐ chī guo Běijīng kǎoyā ma?", translation: es("¿Alguna vez has comido pato laqueado?") },
      { text: "妈妈在打电话。", reading: "Māma zài dǎ diànhuà.", translation: es("Mamá está hablando por teléfono.") },
    ],
    contrasts: [{ a: "我去了北京。(fui a Pekín — un viaje concreto)", b: "我去过北京。(he estado en Pekín — experiencia)", explanation: "了 = acción completada; 过 = experiencia vivida." }],
    exercises: [
      { type: "mc", prompt: "我没去___日本。", options: ["过", "了", "在", "的"], answers: ["过"], explanation: "Experiencia negada: 没 + verbo + 过." },
      { type: "mc", prompt: "别说话，孩子___睡觉。", options: ["在", "过", "了", "的"], answers: ["在"], explanation: "Acción en curso → 在." },
      { type: "mc", prompt: "你看___这个电影吗？", options: ["过", "在", "的", "得"], answers: ["过"], explanation: "Pregunta por experiencia → 过." },
      { type: "mc", prompt: "我___学习，一会儿给你打电话。", options: ["在", "过", "了", "得"], answers: ["在"], explanation: "Estoy estudiando → 在." },
    ],
  },
  {
    id: "zh:g:de-complement",
    language: "zh",
    title: "Complemento de grado con 得",
    cefr: "B1",
    errorCategory: "zh:complements",
    summary: "Para describir cómo se hace algo (bien, rápido, tarde…) se pone 得 después del verbo y luego la descripción.",
    whenToUse: ["Valorar una acción: 她说得很好 (lo dice muy bien)."],
    formation: ["Verbo + 得 + (很) + adjetivo: 跑得很快.", "Con objeto se repite el verbo: 他说中文说得很流利 (o: 他中文说得很流利)."],
    commonMistakes: [
      { wrong: "他说中文很好。", right: "他中文说得很好。", why: "Para valorar la acción se necesita 得." },
      { wrong: "她跑的很快。", right: "她跑得很快。", why: "Tras el verbo va 得, no 的." },
    ],
    examples: [
      { text: "你汉字写得真漂亮！", reading: "Nǐ Hànzì xiě de zhēn piàoliang!", translation: es("¡Escribes los caracteres preciosos!") },
      { text: "我今天起得很早。", reading: "Wǒ jīntiān qǐ de hěn zǎo.", translation: es("Hoy me levanté muy temprano.") },
    ],
    contrasts: [{ a: "的 (tras sustantivo/descripción)", b: "得 (tras verbo, valorar)", explanation: "Se pronuncian igual (de) pero tienen funciones distintas." }],
    exercises: [
      { type: "mc", prompt: "她唱___很好。", options: ["得", "的", "地", "了"], answers: ["得"], explanation: "Valoración de la acción → 得." },
      { type: "mc", prompt: "我昨天睡___很晚。", options: ["得", "的", "了", "过"], answers: ["得"], explanation: "睡得很晚." },
      { type: "mc", prompt: "他开车开___太快了。", options: ["得", "的", "地", "着"], answers: ["得"], explanation: "Verbo repetido + 得." },
      { type: "mc", prompt: "«Hablas chino muy bien» = 你中文说___很好。", options: ["得", "的", "了", "在"], answers: ["得"], explanation: "说得很好." },
    ],
  },
  {
    id: "zh:g:ba",
    language: "zh",
    title: "La construcción 把",
    cefr: "B2",
    errorCategory: "zh:ba",
    summary: "把 adelanta el objeto para expresar qué le pasa: «tomar X y hacerle algo». El verbo nunca va solo: lleva un resultado, una dirección o 了.",
    whenToUse: ["Cuando se manipula o cambia un objeto concreto: 请把门关上 (cierra la puerta, por favor)."],
    formation: ["Sujeto + 把 + objeto + verbo + resultado/otros: 我把作业写完了.", "El objeto es concreto y conocido.", "Negación antes de 把: 我没把钱带来."],
    commonMistakes: [
      { wrong: "我把书看。", right: "我把书看完了。", why: "El verbo necesita un complemento (完, 了…)." },
      { wrong: "我把钱没带来。", right: "我没把钱带来。", why: "La negación va antes de 把." },
    ],
    examples: [
      { text: "请把窗户打开。", reading: "Qǐng bǎ chuānghu dǎkāi.", translation: es("Abre la ventana, por favor.") },
      { text: "我把手机忘在家里了。", reading: "Wǒ bǎ shǒujī wàng zài jiā li le.", translation: es("Me dejé el celular en casa.") },
    ],
    contrasts: [{ a: "我吃了蛋糕。(comí pastel)", b: "我把蛋糕吃了。(me comí el pastel — ese pastel)", explanation: "把 pone el foco en lo que le pasa al objeto." }],
    exercises: [
      { type: "mc", prompt: "请___门关上。", options: ["把", "被", "给", "让"], answers: ["把"], explanation: "Manipular un objeto → 把." },
      { type: "mc", prompt: "我把作业写___了。", options: ["完", "过", "在", "着"], answers: ["完"], explanation: "Resultado: 写完." },
      { type: "mc", prompt: "他___把钥匙带来。", options: ["没", "不是", "别了", "被"], answers: ["没"], explanation: "Negación antes de 把." },
      { type: "mc", prompt: "«Pon el libro en la mesa» = 把书放___桌子上。", options: ["在", "到了过", "得", "着过"], answers: ["在"], explanation: "Dirección/lugar: 放在." },
    ],
  },
  {
    id: "zh:g:bei",
    language: "zh",
    title: "Pasiva con 被",
    cefr: "C1",
    errorCategory: "zh:bei",
    summary: "被 marca la voz pasiva, sobre todo para sucesos desfavorables o inesperados: «me robaron la cartera». Como con 把, el verbo lleva complemento.",
    whenToUse: ["Destacar a quien sufre la acción, a menudo con matiz negativo: 我的自行车被偷了。"],
    formation: ["Receptor + 被 + (agente) + verbo + complemento: 蛋糕被弟弟吃了.", "El agente puede omitirse: 他被批评了.", "Negación antes de 被: 他没被发现."],
    commonMistakes: [
      { wrong: "我的钱包被偷。", right: "我的钱包被偷了。", why: "El verbo necesita complemento (了, 走…)." },
      { wrong: "这本书被很多人喜欢。", right: "这本书很受欢迎。", why: "被 suele reservarse para hechos concretos, a menudo negativos; para gustos se usa 受欢迎." },
    ],
    examples: [
      { text: "我的钱包被偷了。", reading: "Wǒ de qiánbāo bèi tōu le.", translation: es("Me robaron la cartera.") },
      { text: "他被老板批评了一顿。", reading: "Tā bèi lǎobǎn pīpíng le yí dùn.", translation: es("El jefe le echó una bronca.") },
    ],
    contrasts: [{ a: "弟弟把蛋糕吃了。", b: "蛋糕被弟弟吃了。", explanation: "Mismo hecho: 把 centra al agente; 被, a quien sufre la acción." }],
    exercises: [
      { type: "mc", prompt: "我的自行车___偷了。", options: ["被", "把", "给了", "让了"], answers: ["被"], explanation: "Pasiva → 被." },
      { type: "mc", prompt: "他没___老师发现。", options: ["被", "把", "在", "得"], answers: ["被"], explanation: "Negación + 被." },
      { type: "mc", prompt: "蛋糕被弟弟吃___。", options: ["了", "的", "在", "得"], answers: ["了"], explanation: "El verbo lleva complemento: 吃了." },
      { type: "mc", prompt: "«Lo despidieron» = 他___开除了。", options: ["被", "把", "让", "给"], answers: ["被"], explanation: "Pasiva desfavorable → 被." },
    ],
  },
];
