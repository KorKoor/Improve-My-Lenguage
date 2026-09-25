import type { GrammarConcept } from "../types";

/** Japonés A2–C1: continúa el programa de ja/index.ts. Revisión humana recomendada. */
const es = (t: string) => ({ es: t });

export const JA_GRAMMAR_ADVANCED: GrammarConcept[] = [
  {
    id: "ja:g:adjectives",
    language: "ja",
    title: "Adjetivos い y adjetivos な",
    cefr: "A2",
    errorCategory: "ja:adjectives",
    summary: "Hay dos tipos de adjetivos. Los い (高い, 寒い) se conjugan solos como verbos; los な (静か, 元気) necesitan な delante de un sustantivo y です/だ al final.",
    whenToUse: ["Describir: この部屋は静かです。 高い山。"],
    formation: [
      "い: 高い → negativo 高くない · pasado 高かった.",
      "な: 静かな町 · 静かです · negativo 静かじゃない · pasado 静かでした.",
      "Excepción: いい → よくない, よかった.",
    ],
    commonMistakes: [
      { wrong: "高いじゃないです。", right: "高くないです。", why: "Los adjetivos い niegan con -くない." },
      { wrong: "静か町", right: "静かな町", why: "Adjetivo な + sustantivo necesita な." },
    ],
    examples: [
      { text: "昨日はとても寒かったです。", reading: "kinō wa totemo samukatta desu.", translation: es("Ayer hizo mucho frío.") },
      { text: "ここは静かな公園ですね。", reading: "koko wa shizuka na kōen desu ne.", translation: es("Este es un parque tranquilo, ¿verdad?") },
    ],
    contrasts: [{ a: "寒くない (no hace frío — い)", b: "元気じゃない (no está bien — な)", explanation: "Cada tipo tiene su negación." }],
    exercises: [
      { type: "mc", prompt: "このカレーは＿。(no es picante: 辛い)", options: ["辛くないです", "辛いじゃないです", "辛かないです", "辛くです"], answers: ["辛くないです"], explanation: "い → くない." },
      { type: "mc", prompt: "＿人ですね。(amable: 親切)", options: ["親切な", "親切", "親切い", "親切の"], answers: ["親切な"], explanation: "Adjetivo な + sustantivo." },
      { type: "mc", prompt: "旅行は＿。(fue divertido: 楽しい)", options: ["楽しかったです", "楽しいでした", "楽しくでした", "楽しだった"], answers: ["楽しかったです"], explanation: "Pasado い: -かった." },
      { type: "mc", prompt: "天気が＿。(no es bueno: いい)", options: ["よくない", "いくない", "いいじゃない", "よいない"], answers: ["よくない"], explanation: "いい → よくない." },
    ],
  },
  {
    id: "ja:g:te-form",
    language: "ja",
    title: "La forma て: pedir, enlazar y ～ている",
    cefr: "A2",
    errorCategory: "ja:te-form",
    summary: "La forma て es la navaja suiza del japonés: une acciones («y luego»), pide cosas (～てください) y forma el progresivo o estado (～ている).",
    whenToUse: ["Petición: 見てください。", "Secuencia: 起きて、顔を洗って、出かけます。", "Progresivo/estado: 今、食べています。結婚しています。"],
    formation: [
      "Grupo 2 (-る): 食べる → 食べて.",
      "Grupo 1: う/つ/る → って (買って); む/ぶ/ぬ → んで (読んで); く → いて (書いて); ぐ → いで; す → して.",
      "Irregulares: する → して, 来る → 来て, 行く → 行って.",
    ],
    commonMistakes: [
      { wrong: "行いて", right: "行って", why: "行く es la excepción: 行って." },
      { wrong: "読みてください", right: "読んでください", why: "む → んで." },
    ],
    examples: [
      { text: "ちょっと待ってください。", reading: "chotto matte kudasai.", translation: es("Espere un momento, por favor.") },
      { text: "姉は東京に住んでいます。", reading: "ane wa Tōkyō ni sunde imasu.", translation: es("Mi hermana vive en Tokio.") },
    ],
    contrasts: [{ a: "食べます (como / comeré)", b: "食べています (estoy comiendo)", explanation: "～ている = acción en curso o estado resultante." }],
    exercises: [
      { type: "mc", prompt: "ここに名前を＿ください。(escribir: 書く)", options: ["書いて", "書きて", "書って", "書んで"], answers: ["書いて"], explanation: "く → いて." },
      { type: "mc", prompt: "今、本を＿います。(leer: 読む)", options: ["読んで", "読みて", "読って", "読いて"], answers: ["読んで"], explanation: "む → んで." },
      { type: "mc", prompt: "明日、京都に＿、友達に会います。(ir: 行く)", options: ["行って", "行いて", "行きて", "行んで"], answers: ["行って"], explanation: "Excepción: 行って." },
      { type: "mc", prompt: "少し＿ください。(esperar: 待つ)", options: ["待って", "待ちて", "待んで", "待いて"], answers: ["待って"], explanation: "つ → って." },
    ],
  },
  {
    id: "ja:g:plain-form",
    language: "ja",
    title: "Forma llana y ～と思う / ～たい",
    cefr: "B1",
    errorCategory: "ja:plain-form",
    summary: "La forma llana (diccionario, ～ない, ～た) se usa entre amigos y dentro de frases complejas. Es necesaria para decir «creo que…» (～と思う) y para expresar deseos con ～たい.",
    whenToUse: ["Opinión: 明日は雨が降ると思います。", "Deseo: 日本に行きたいです。"],
    formation: ["Presente: 行く · negativo: 行かない · pasado: 行った · pasado negativo: 行かなかった.", "Opinión: forma llana + と思います.", "Deseo: raíz de ます + たい: 食べます → 食べたい."],
    commonMistakes: [
      { wrong: "雨が降りますと思います。", right: "雨が降ると思います。", why: "Delante de と思う va la forma llana." },
      { wrong: "日本へ行くたいです。", right: "日本へ行きたいです。", why: "たい se une a la raíz de ます (行き)." },
    ],
    examples: [
      { text: "この映画は面白いと思います。", reading: "kono eiga wa omoshiroi to omoimasu.", translation: es("Creo que esta película es interesante.") },
      { text: "新しいパソコンが買いたいです。", reading: "atarashii pasokon ga kaitai desu.", translation: es("Quiero comprar una computadora nueva.") },
    ],
    contrasts: [{ a: "行きます (cortés)", b: "行く (llana, entre amigos)", explanation: "Mismo significado, distinto registro." }],
    exercises: [
      { type: "mc", prompt: "彼はもう＿と思います。(ya se fue: 帰る)", options: ["帰った", "帰りました", "帰るた", "帰って"], answers: ["帰った"], explanation: "Forma llana pasada + と思う." },
      { type: "mc", prompt: "すしが＿です。(quiero comer)", options: ["食べたい", "食べるたい", "食べてたい", "食べました"], answers: ["食べたい"], explanation: "Raíz + たい." },
      { type: "mc", prompt: "明日は＿と思います。(no lloverá: 雨が降らない)", options: ["雨が降らない", "雨が降りません", "雨が降らないです", "雨が降って"], answers: ["雨が降らない"], explanation: "Forma llana negativa." },
      { type: "mc", prompt: "(entre amigos) 昨日何＿？(hiciste)", options: ["した", "しました", "する", "して"], answers: ["した"], explanation: "Pasado llano: した." },
    ],
  },
  {
    id: "ja:g:conditionals",
    language: "ja",
    title: "Condicionales: ～たら, ～ば, ～と, ～なら",
    cefr: "B2",
    errorCategory: "ja:conditionals",
    summary: "El japonés tiene cuatro condicionales con matices distintos. ～たら es el más versátil (si / cuando); ～と, para consecuencias automáticas; ～ば, condición hipotética; ～なら, «en ese caso» a partir de lo que dice otro.",
    whenToUse: ["たら: 雨が降ったら、行きません。", "と: このボタンを押すと、ドアが開きます。", "ば: 安ければ買います。", "なら: 京都に行くなら、金閣寺がおすすめです。"],
    formation: ["たら: pasado llano + ら: 行ったら, 安かったら.", "ば: 行く → 行けば; 安い → 安ければ.", "と: forma de diccionario + と.", "なら: forma llana / sustantivo + なら."],
    commonMistakes: [
      { wrong: "日本に着くと、電話してください。", right: "日本に着いたら、電話してください。", why: "～と no admite peticiones después; ～たら sí." },
      { wrong: "安いば買います。", right: "安ければ買います。", why: "い adjetivo: -ければ." },
    ],
    examples: [
      { text: "時間があったら、手伝ってくれませんか。", reading: "jikan ga attara, tetsudatte kuremasen ka.", translation: es("Si tienes tiempo, ¿me ayudas?") },
      { text: "春になると、桜が咲きます。", reading: "haru ni naru to, sakura ga sakimasu.", translation: es("Cuando llega la primavera, florecen los cerezos.") },
    ],
    contrasts: [{ a: "ボタンを押すと開く (siempre ocurre)", b: "駅に着いたら電話して (cuando llegues, llama)", explanation: "～と = consecuencia natural; ～たら = condición + acción." }],
    exercises: [
      { type: "mc", prompt: "家に＿、連絡してください。(llegar: 着く)", options: ["着いたら", "着くと", "着けば", "着いて"], answers: ["着いたら"], explanation: "Petición después → ～たら." },
      { type: "mc", prompt: "右に曲がる＿、駅があります。", options: ["と", "たら", "なら", "ば"], answers: ["と"], explanation: "Consecuencia natural/indicación → ～と." },
      { type: "mc", prompt: "もっと＿、買います。(barato: 安い)", options: ["安ければ", "安いば", "安くば", "安かれば"], answers: ["安ければ"], explanation: "い → ければ." },
      { type: "mc", prompt: "北海道に行く＿、冬がいいですよ。", options: ["なら", "と", "ば", "たら"], answers: ["なら"], explanation: "Consejo sobre lo que dice el otro → なら." },
    ],
  },
  {
    id: "ja:g:passive-causative",
    language: "ja",
    title: "Pasiva y causativa: ～られる, ～させる",
    cefr: "B2",
    errorCategory: "ja:passive-causative",
    summary: "La pasiva (～られる) se usa mucho para hechos que afectan a alguien, a menudo negativamente (「雨に降られた」). La causativa (～させる) significa «hacer/dejar que alguien haga algo».",
    whenToUse: ["Pasiva: 先生に褒められました。財布を盗まれました。", "Causativa: 子どもに野菜を食べさせます。"],
    formation: [
      "Grupo 1: ない-raíz + れる / せる: 書く → 書かれる / 書かせる.",
      "Grupo 2: raíz + られる / させる: 食べる → 食べられる / 食べさせる.",
      "する → される / させる · 来る → 来られる / 来させる.",
    ],
    commonMistakes: [
      { wrong: "私は財布を盗みました。(me robaron)", right: "私は財布を盗まれました。", why: "Sufrir la acción → pasiva." },
      { wrong: "子どもを本を読ませます。", right: "子どもに本を読ませます。", why: "Con objeto directo, la persona que hace la acción lleva に." },
    ],
    examples: [
      { text: "電車で足を踏まれました。", reading: "densha de ashi o fumaremashita.", translation: es("En el tren me pisaron el pie.") },
      { text: "少し考えさせてください。", reading: "sukoshi kangaesasete kudasai.", translation: es("Déjeme pensarlo un poco.") },
    ],
    contrasts: [{ a: "読まれる (ser leído)", b: "読ませる (hacer leer)", explanation: "れる = pasiva; せる = causativa." }],
    exercises: [
      { type: "mc", prompt: "母に＿。(me regañó: 叱る)", options: ["叱られました", "叱らせました", "叱りました", "叱れました"], answers: ["叱られました"], explanation: "Pasiva: 叱られる." },
      { type: "mc", prompt: "先生は学生に作文を＿。(hacer escribir: 書く)", options: ["書かせました", "書かれました", "書きました", "書けました"], answers: ["書かせました"], explanation: "Causativa: 書かせる." },
      { type: "mc", prompt: "この本は多くの人に＿います。(es leído: 読む)", options: ["読まれて", "読ませて", "読んで", "読めて"], answers: ["読まれて"], explanation: "Pasiva + ている." },
      { type: "mc", prompt: "ちょっと＿ください。(déjeme descansar: 休む)", options: ["休ませて", "休まれて", "休んで", "休めて"], answers: ["休ませて"], explanation: "Causativa + てください = «déjeme…»." },
    ],
  },
  {
    id: "ja:g:keigo",
    language: "ja",
    title: "Keigo: lenguaje honorífico y humilde",
    cefr: "C1",
    errorCategory: "ja:keigo",
    summary: "En el trabajo y con clientes se usa 尊敬語 (elevar a la otra persona) y 謙譲語 (rebajarse uno mismo). Muchos verbos básicos tienen formas especiales.",
    whenToUse: ["尊敬語 para acciones del cliente/jefe: 社長がいらっしゃいます。", "謙譲語 para tus propias acciones: 私が参ります。"],
    formation: [
      "Especiales: 行く/来る/いる → いらっしゃる (尊敬) · 参る (謙譲).",
      "言う → おっしゃる · 申す · 食べる → 召し上がる · いただく · 見る → ご覧になる · 拝見する.",
      "General: お + raíz + になる (尊敬): お待ちになる · お + raíz + する (謙譲): お持ちします.",
    ],
    commonMistakes: [
      { wrong: "私がいらっしゃいます。", right: "私が参ります。", why: "Para uno mismo nunca 尊敬語." },
      { wrong: "お客様が申しました。", right: "お客様がおっしゃいました。", why: "申す es humilde (para uno mismo)." },
    ],
    examples: [
      { text: "何を召し上がりますか。", reading: "nani o meshiagarimasu ka.", translation: es("¿Qué desea tomar?") },
      { text: "資料を拝見しました。", reading: "shiryō o haiken shimashita.", translation: es("He revisado los documentos.") },
    ],
    contrasts: [{ a: "先生がおっしゃいました。(el profesor dijo)", b: "私が申しました。(yo dije)", explanation: "Elevar al otro frente a rebajarse uno mismo." }],
    exercises: [
      { type: "mc", prompt: "社長は今会議室に＿。(está — 尊敬)", options: ["いらっしゃいます", "おります", "参ります", "います"], answers: ["いらっしゃいます"], explanation: "いる → いらっしゃる." },
      { type: "mc", prompt: "明日、私がそちらに＿。(iré — 謙譲)", options: ["参ります", "いらっしゃいます", "行かれます", "おいでになります"], answers: ["参ります"], explanation: "Propia acción → 参る." },
      { type: "mc", prompt: "お客様、どうぞ＿ください。(coma)", options: ["召し上がって", "いただいて", "食べて", "申し上げて"], answers: ["召し上がって"], explanation: "Comer (尊敬) → 召し上がる." },
      { type: "mc", prompt: "荷物を＿します。(le llevo — 謙譲)", options: ["お持ち", "持ち", "お持ちに", "持たれ"], answers: ["お持ち"], explanation: "お + raíz + する." },
    ],
  },
];
