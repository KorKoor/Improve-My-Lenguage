import type { GrammarConcept } from "../types";

/** Chino mandarín: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const ZH_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "zh:g:questions",
    language: "zh",
    title: "Preguntas: 吗, 呢 y la forma A-no-A",
    cefr: "A1",
    errorCategory: "zh:questions",
    summary:
      "En chino el orden de la frase no cambia al preguntar. Para sí/no se añade 吗 al final (你是学生吗？) o se usa verbo + 不 + verbo (你是不是学生？). 呢 devuelve la pregunta (我很好，你呢？). Con interrogativos (什么, 哪儿, 谁) no se usa 吗.",
    whenToUse: ["Sí/no: 你忙吗？", "¿Y tú?: 我是墨西哥人，你呢？", "Información: 你叫什么名字？"],
    formation: ["Frase + 吗？", "Verbo/adjetivo + 不 + verbo/adjetivo: 好不好？ 去不去？", "Interrogativo en el lugar de la respuesta: 你去哪儿？"],
    commonMistakes: [
      { wrong: "你叫什么名字吗？", right: "你叫什么名字？", why: "Con 什么 no se añade 吗." },
      { wrong: "是你学生吗？", right: "你是学生吗？", why: "El orden no se invierte." },
    ],
    examples: [
      { text: "你喜欢喝茶吗？", reading: "Nǐ xǐhuan hē chá ma?", translation: es("¿Te gusta el té?") },
      { text: "明天你去不去？", reading: "Míngtiān nǐ qù bu qù?", translation: es("¿Vas mañana o no?") },
    ],
    contrasts: [{ a: "你好吗？", b: "你呢？", explanation: "¿Cómo estás? / ¿Y tú?" }],
    exercises: [
      { type: "mc", prompt: "你是中国人＿？", options: ["吗", "呢", "什么", "不"], answers: ["吗"], explanation: "Pregunta de sí/no → 吗." },
      { type: "mc", prompt: "我喝咖啡，你＿？", options: ["呢", "吗", "哪儿", "谁"], answers: ["呢"], explanation: "Devolver la pregunta → 呢." },
      { type: "fill", prompt: "你忙不＿？", answers: ["忙"], explanation: "Forma A-no-A: 忙不忙." },
      { type: "correct", prompt: "你去哪儿吗？", answers: ["你去哪儿？"], explanation: "Con 哪儿 sin 吗." },
    ],
  },
  {
    id: "zh:g:zai-you",
    language: "zh",
    title: "在 (estar en) y 有 (tener / haber)",
    cefr: "A1",
    errorCategory: "zh:zai-you",
    summary:
      "在 + lugar indica dónde está algo o alguien (我在家). 有 significa «tener» y también «hay» (桌子上有一本书). Su negación es siempre 没有, nunca 不有.",
    whenToUse: ["Ubicación: 银行在哪儿？", "Existencia: 这儿有超市吗？", "Posesión: 我有两个孩子。"],
    formation: ["Persona/cosa + 在 + lugar.", "Lugar + 有 + cosa/persona.", "Negación: 不在 · 没有."],
    commonMistakes: [
      { wrong: "我不有时间。", right: "我没有时间。", why: "有 se niega con 没." },
      { wrong: "我是在家。", right: "我在家。", why: "Con 在 no hace falta 是." },
    ],
    examples: [
      { text: "我的手机在桌子上。", reading: "Wǒ de shǒujī zài zhuōzi shang.", translation: es("Mi móvil está en la mesa.") },
      { text: "附近有地铁站吗？", reading: "Fùjìn yǒu dìtiě zhàn ma?", translation: es("¿Hay una estación de metro cerca?") },
    ],
    contrasts: [{ a: "书在桌子上。", b: "桌子上有书。", explanation: "El libro está en la mesa / en la mesa hay un libro." }],
    exercises: [
      { type: "mc", prompt: "老师＿教室里。", options: ["在", "有", "是", "去"], answers: ["在"], explanation: "Dónde está alguien → 在." },
      { type: "mc", prompt: "我＿有钱。", options: ["没", "不", "别", "无"], answers: ["没"], explanation: "Negación de 有 → 没有." },
      { type: "fill", prompt: "冰箱里＿牛奶。(hay)", answers: ["有"], explanation: "Existencia → 有." },
      { type: "correct", prompt: "我不有哥哥。", answers: ["我没有哥哥。"], explanation: "没有." },
    ],
  },
  {
    id: "zh:g:word-order-time",
    language: "zh",
    title: "Orden: sujeto + tiempo + lugar + acción",
    cefr: "A2",
    errorCategory: "zh:word-order",
    summary:
      "El chino coloca el cuándo y el dónde ANTES del verbo: 我明天在家工作 (yo mañana en casa trabajo). El tiempo puede ir también al principio de la frase, pero nunca al final como en español.",
    whenToUse: ["Contar planes y rutinas: 我每天早上七点起床。"],
    formation: ["Sujeto + tiempo + lugar (在…) + verbo + objeto.", "O bien: tiempo + sujeto + lugar + verbo."],
    commonMistakes: [
      { wrong: "我工作在北京。", right: "我在北京工作。", why: "El lugar con 在 va antes del verbo." },
      { wrong: "我去超市明天。", right: "我明天去超市。", why: "El tiempo va antes del verbo." },
    ],
    examples: [
      { text: "我们晚上在饭店吃饭。", reading: "Wǒmen wǎnshang zài fàndiàn chīfàn.", translation: es("Por la noche comemos en un restaurante.") },
      { text: "上个月我在上海学习中文。", reading: "Shàng ge yuè wǒ zài Shànghǎi xuéxí Zhōngwén.", translation: es("El mes pasado estudié chino en Shanghái.") },
    ],
    contrasts: [{ a: "明天我去。", b: "我明天去。", explanation: "Ambos correctos: el tiempo va al inicio o tras el sujeto." }],
    exercises: [
      { type: "mc", prompt: "Elige el orden correcto:", options: ["我下午在图书馆看书。", "我看书在图书馆下午。", "我在图书馆看书下午。", "下午看书我在图书馆。"], answers: ["我下午在图书馆看书。"], explanation: "Sujeto + tiempo + lugar + acción." },
      { type: "mc", prompt: "他＿工作。(en un banco)", options: ["在银行", "银行在", "是银行", "去银行在"], answers: ["在银行"], explanation: "在 + lugar antes del verbo." },
      { type: "fill", prompt: "我们周末＿公园跑步。", answers: ["在"], explanation: "Lugar → 在." },
      { type: "correct", prompt: "我学习中文在学校。", answers: ["我在学校学习中文。"], explanation: "Lugar antes del verbo." },
    ],
  },
  {
    id: "zh:g:bi",
    language: "zh",
    title: "Comparar con 比 y 没有",
    cefr: "A2",
    errorCategory: "zh:comparison",
    summary:
      "A 比 B + adjetivo: 他比我高 (él es más alto que yo). ¡No se usa 很 con 比! Para decir cuánto más: 他比我高一点儿 / 高得多. Negación: A 没有 B (那么) + adjetivo.",
    whenToUse: ["Comparar: 今天比昨天冷。", "Negar la comparación: 我没有他那么忙。"],
    formation: ["A 比 B + adj (+ 一点儿 / 得多 / cantidad).", "A 没有 B + (那么/这么) + adj.", "Igualdad: A 跟 B 一样 + adj."],
    commonMistakes: [
      { wrong: "他比我很高。", right: "他比我高。/ 他比我高得多。", why: "Con 比 no se usa 很." },
      { wrong: "我不比他高。 (para «no soy tan alto»)", right: "我没有他高。", why: "La negación natural es 没有." },
    ],
    examples: [
      { text: "坐地铁比坐出租车快。", reading: "Zuò dìtiě bǐ zuò chūzūchē kuài.", translation: es("Ir en metro es más rápido que en taxi.") },
      { text: "我的中文没有你的好。", reading: "Wǒ de Zhōngwén méiyǒu nǐ de hǎo.", translation: es("Mi chino no es tan bueno como el tuyo.") },
    ],
    contrasts: [{ a: "他比我大两岁。", b: "他跟我一样大。", explanation: "Dos años mayor / igual de mayor." }],
    exercises: [
      { type: "mc", prompt: "北京＿上海冷。", options: ["比", "很", "跟", "没"], answers: ["比"], explanation: "A 比 B + adjetivo." },
      { type: "mc", prompt: "这件衣服＿那件贵。(no es tan cara)", options: ["没有", "不比", "比", "很"], answers: ["没有"], explanation: "Negación → 没有." },
      { type: "fill", prompt: "他比我高＿多。", answers: ["得"], explanation: "高得多 = mucho más alto." },
      { type: "correct", prompt: "今天比昨天很热。", answers: ["今天比昨天热。", "今天比昨天热得多。"], explanation: "Sin 很." },
    ],
  },
  {
    id: "zh:g:hui-neng-keyi",
    language: "zh",
    title: "Poder: 会, 能, 可以",
    cefr: "A2",
    errorCategory: "zh:modals",
    summary:
      "会: habilidad aprendida (我会说中文) y también «es probable que» (明天会下雨). 能: capacidad física o circunstancial (我今天不能来). 可以: permiso (这儿可以拍照吗？).",
    whenToUse: ["Saber hacer: 你会游泳吗？", "Poder por circunstancias: 我太忙，不能去。", "Permiso: 我可以进来吗？"],
    formation: ["Modal + verbo: 会开车, 能来, 可以坐.", "Negación: 不会, 不能, 不可以 (prohibido)."],
    commonMistakes: [
      { wrong: "我能说英语 (para «sé inglés»).", right: "我会说英语。", why: "Habilidad aprendida → 会." },
      { wrong: "我会进来吗？", right: "我可以进来吗？", why: "Pedir permiso → 可以." },
    ],
    examples: [
      { text: "你会做饭吗？", reading: "Nǐ huì zuòfàn ma?", translation: es("¿Sabes cocinar?") },
      { text: "这里不可以抽烟。", reading: "Zhèlǐ bù kěyǐ chōuyān.", translation: es("Aquí no se puede fumar.") },
    ],
    contrasts: [{ a: "我会游泳。", b: "我今天不能游泳。", explanation: "Sé nadar / hoy no puedo nadar (circunstancia)." }],
    exercises: [
      { type: "mc", prompt: "我＿弹钢琴。(sé tocar)", options: ["会", "可以", "能", "要"], answers: ["会"], explanation: "Habilidad → 会." },
      { type: "mc", prompt: "请问，这儿＿停车吗？", options: ["可以", "会", "要", "得"], answers: ["可以"], explanation: "Permiso → 可以." },
      { type: "fill", prompt: "我生病了，明天不＿上班。", answers: ["能"], explanation: "Circunstancia → 不能." },
      { type: "correct", prompt: "我会借你的笔吗？", answers: ["我可以借你的笔吗？", "我能借你的笔吗？"], explanation: "Pedir permiso → 可以/能." },
    ],
  },
  {
    id: "zh:g:result-complement",
    language: "zh",
    title: "Complementos de resultado: 完, 到, 懂, 好",
    cefr: "B1",
    errorCategory: "zh:result",
    summary:
      "Detrás del verbo se añade el resultado de la acción: 看完 (terminar de ver), 找到 (encontrar, lit. buscar-llegar), 听懂 (entender lo oído). La negación usa 没: 我没听懂 (no entendí).",
    whenToUse: ["Resultado conseguido: 我找到钥匙了。", "No conseguido: 我没看懂这个字。"],
    formation: ["Verbo + resultado (+ 了): 做完了, 买到了.", "Negación: 没 + verbo + resultado.", "Potencial: 看得懂 / 看不懂."],
    commonMistakes: [
      { wrong: "我不听懂。", right: "我没听懂。/ 我听不懂。", why: "Resultado negado → 没 o forma potencial 不." },
      { wrong: "我找了钥匙 (queriendo decir «la encontré»).", right: "我找到钥匙了。", why: "找 es sólo buscar; el éxito es 找到." },
    ],
    examples: [
      { text: "作业写完了吗？", reading: "Zuòyè xiěwán le ma?", translation: es("¿Terminaste los deberes?") },
      { text: "对不起，我没听清楚。", reading: "Duìbuqǐ, wǒ méi tīng qīngchu.", translation: es("Perdona, no lo oí bien.") },
    ],
    contrasts: [{ a: "我看了。", b: "我看完了。", explanation: "Lo miré (algo) / lo terminé de ver." }],
    exercises: [
      { type: "mc", prompt: "我吃＿了，我们走吧。", options: ["完", "到", "懂", "见"], answers: ["完"], explanation: "Terminar de comer → 吃完." },
      { type: "mc", prompt: "你买＿票了吗？", options: ["到", "完", "懂", "好了"], answers: ["到"], explanation: "Conseguir comprar → 买到." },
      { type: "fill", prompt: "老师说得太快，我没听＿。", answers: ["懂"], explanation: "Entender lo oído → 听懂." },
      { type: "correct", prompt: "我不看懂这本书。", answers: ["我看不懂这本书。", "我没看懂这本书。"], explanation: "Potencial negativo 看不懂 o 没看懂." },
    ],
  },
  {
    id: "zh:g:direction-complement",
    language: "zh",
    title: "Complementos direccionales: 进来, 出去, 上来…",
    cefr: "B2",
    errorCategory: "zh:direction",
    summary:
      "La dirección del movimiento se expresa tras el verbo: 来 hacia quien habla, 去 alejándose. Compuestos: 走进来 (entrar caminando hacia aquí), 跑出去 (salir corriendo). Si hay un lugar, va entre el verbo y 来/去: 进教室来.",
    whenToUse: ["Movimiento: 请进来！", "Sentido figurado: 想起来 (recordar), 看起来 (parecer)."],
    formation: ["Verbo + 来/去: 回来, 上去.", "Verbo + 上/下/进/出/回/过/起 + 来/去.", "Lugar antes de 来/去: 回家去, 走进房间来."],
    commonMistakes: [
      { wrong: "他进来教室。", right: "他进教室来。", why: "El lugar va antes de 来." },
      { wrong: "我想来起他的名字了。", right: "我想起他的名字来了。/ 我想起来他的名字了。", why: "Orden de 想起来." },
    ],
    examples: [
      { text: "外面冷，快进来吧！", reading: "Wàimiàn lěng, kuài jìnlái ba!", translation: es("Fuera hace frío, ¡entra rápido!") },
      { text: "这个菜看起来很好吃。", reading: "Zhège cài kàn qǐlái hěn hǎochī.", translation: es("Este plato parece muy rico.") },
    ],
    contrasts: [{ a: "上来 (subir hacia aquí)", b: "上去 (subir alejándose)", explanation: "来 hacia el hablante, 去 lejos de él." }],
    exercises: [
      { type: "mc", prompt: "我在楼上，你上＿吧！", options: ["来", "去", "到", "完"], answers: ["来"], explanation: "Hacia quien habla (arriba) → 上来." },
      { type: "mc", prompt: "他跑＿了。(salió corriendo)", options: ["出去", "进来", "上来", "回来"], answers: ["出去"], explanation: "Salir alejándose → 出去." },
      { type: "fill", prompt: "这件衣服看＿来很贵。", answers: ["起"], explanation: "看起来 = parecer." },
      { type: "correct", prompt: "妈妈回来家了。", answers: ["妈妈回家来了。", "妈妈回家了。"], explanation: "Lugar antes de 来." },
    ],
  },
  {
    id: "zh:g:lian-yuelaiyue",
    language: "zh",
    title: "Énfasis y progresión: 连…都/也, 越来越",
    cefr: "C1",
    errorCategory: "zh:emphasis",
    summary:
      "连 X 都/也… enfatiza un extremo («incluso X»): 他连饭都没吃 (ni siquiera comió). 越来越 + adjetivo expresa un cambio progresivo (越来越冷, cada vez más frío); 越 A 越 B, «cuanto más A, más B».",
    whenToUse: ["Énfasis: 这个字连老师也不认识。", "Progresión: 你的中文越来越好了！", "Correlación: 越学越有意思。"],
    formation: ["连 + elemento enfatizado + 都/也 + verbo.", "越来越 + adjetivo/verbo psicológico.", "越 + verbo/adj + 越 + adj."],
    commonMistakes: [
      { wrong: "越来越很冷。", right: "越来越冷。", why: "Con 越来越 no se usa 很." },
      { wrong: "他连一句话不说。", right: "他连一句话都不说。", why: "连 necesita 都/也." },
    ],
    examples: [
      { text: "他忙得连周末都要工作。", reading: "Tā máng de lián zhōumò dōu yào gōngzuò.", translation: es("Está tan ocupado que trabaja incluso los fines de semana.") },
      { text: "天气越来越暖和了。", reading: "Tiānqì yuèláiyuè nuǎnhuo le.", translation: es("El tiempo es cada vez más cálido.") },
    ],
    contrasts: [{ a: "越来越好", b: "越学越好", explanation: "Cada vez mejor / cuanto más estudias, mejor." }],
    exercises: [
      { type: "mc", prompt: "我饿死了，连早饭＿没吃。", options: ["都", "很", "越", "比"], answers: ["都"], explanation: "连…都." },
      { type: "mc", prompt: "他的汉语＿好了。", options: ["越来越", "越", "连", "比较很"], answers: ["越来越"], explanation: "Progresión → 越来越." },
      { type: "fill", prompt: "这本书越看＿有意思。", answers: ["越"], explanation: "越…越…" },
      { type: "correct", prompt: "北京越来越很热。", answers: ["北京越来越热。", "北京越来越热了。"], explanation: "Sin 很." },
    ],
  },
];
