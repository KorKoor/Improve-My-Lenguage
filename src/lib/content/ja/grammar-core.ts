import type { GrammarConcept } from "../types";

/** Japonés: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const JA_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "ja:g:aru-iru",
    language: "ja",
    title: "Hay / estar: あります y います",
    cefr: "A1",
    errorCategory: "ja:aru-iru",
    summary:
      "Para decir que algo hay o está en un lugar, あります se usa con cosas y plantas, y います con personas y animales. El lugar va con に: 公園に犬がいます (en el parque hay un perro).",
    whenToUse: ["Existencia: 近くに駅がありますか。", "Ubicación: 母は台所にいます。", "Posesión: 時間がありません (no tengo tiempo)."],
    formation: ["Lugar に + cosa が あります。", "Lugar に + persona/animal が います。", "Negativa: ありません / いません."],
    commonMistakes: [
      { wrong: "猫があります。", right: "猫がいます。", why: "Los animales van con います." },
      { wrong: "駅でコンビニがあります。", right: "駅にコンビニがあります。", why: "El lugar de existencia lleva に, no で." },
    ],
    examples: [
      { text: "部屋にテレビがあります。", reading: "へやにテレビがあります。", translation: es("En la habitación hay una televisión.") },
      { text: "田中さんは今オフィスにいません。", reading: "たなかさんはいまオフィスにいません。", translation: es("El señor Tanaka no está ahora en la oficina.") },
    ],
    contrasts: [{ a: "本があります。", b: "子どもがいます。", explanation: "Cosa → あります; ser vivo que se mueve → います." }],
    exercises: [
      { type: "mc", prompt: "庭に鳥が＿＿。", options: ["います", "あります", "です", "します"], answers: ["います"], explanation: "Los pájaros son seres vivos → います." },
      { type: "mc", prompt: "机の上にかぎが＿＿。", options: ["あります", "います", "いります", "なります"], answers: ["あります"], explanation: "Una llave es una cosa → あります." },
      { type: "fill", prompt: "銀行はどこ＿＿ありますか。", answers: ["に"], explanation: "Lugar de existencia → に." },
      { type: "correct", prompt: "犬があります。", answers: ["犬がいます。"], explanation: "Animal → います." },
    ],
  },
  {
    id: "ja:g:counters",
    language: "ja",
    title: "Contadores: ～つ, ～人, ～本, ～枚",
    cefr: "A2",
    errorCategory: "ja:counters",
    summary:
      "Como el chino, el japonés cuenta con un contador según la forma o el tipo de cosa. El genérico ～つ sirve para cosas hasta diez (ひとつ, ふたつ…). Personas: ひとり, ふたり, さんにん. Objetos largos ～本 (ほん/ぼん/ぽん), planos ～枚 (まい).",
    whenToUse: ["Pedir cantidades: りんごを三つください。", "Personas: 二人です (somos dos)."],
    formation: ["Cantidad + contador + (を) + verbo: 水を二本買いました。", "1 y 2 personas son irregulares: ひとり, ふたり.", "本: いっぽん, にほん, さんぼん."],
    commonMistakes: [
      { wrong: "二人の紙をください。", right: "紙を二枚ください。", why: "El papel se cuenta con 枚; 人 es para personas." },
      { wrong: "いちにん", right: "ひとり", why: "Una persona = ひとり." },
    ],
    examples: [
      { text: "コーヒーを二つお願いします。", reading: "コーヒーをふたつおねがいします。", translation: es("Dos cafés, por favor.") },
      { text: "家族は四人です。", reading: "かぞくはよにんです。", translation: es("Somos cuatro en mi familia.") },
    ],
    contrasts: [{ a: "えんぴつを三本", b: "切手を三枚", explanation: "Lápices (largos) → 本; sellos (planos) → 枚." }],
    exercises: [
      { type: "mc", prompt: "ビールを＿＿ください。(dos botellas)", options: ["二本", "二枚", "二人", "二つ目"], answers: ["二本"], explanation: "Botellas (largas) → 本." },
      { type: "mc", prompt: "子どもが＿＿います。(dos)", options: ["ふたり", "ににん", "ふたつ", "にまい"], answers: ["ふたり"], explanation: "Dos personas → ふたり." },
      { type: "fill", prompt: "シャツを三＿＿買いました。(contador de planos)", answers: ["枚"], explanation: "Camisas se cuentan con 枚." },
      { type: "correct", prompt: "いちにんで行きます。", answers: ["ひとりで行きます。", "一人で行きます。"], explanation: "Solo = ひとりで." },
    ],
  },
  {
    id: "ja:g:comparison",
    language: "ja",
    title: "Comparar: より, のほうが, いちばん",
    cefr: "A2",
    errorCategory: "ja:comparison",
    summary:
      "El adjetivo no cambia: se marca con partículas. A は B より adjetivo (A es más … que B). Para preguntar: A と B とどちらが…? Respuesta: A のほうが… Superlativo: いちばん + adjetivo.",
    whenToUse: ["Comparar dos cosas: 電車はバスより速いです。", "Elegir: どちらが好きですか。"],
    formation: ["A は B より + adjetivo.", "A のほうが (B より) + adjetivo.", "Grupo の中で X が いちばん + adjetivo."],
    commonMistakes: [
      { wrong: "東京は大阪よりもっと大きいです。 (con もっと obligatorio)", right: "東京は大阪より大きいです。", why: "No hace falta «más»: より ya compara (もっと sólo añade énfasis)." },
      { wrong: "犬より猫が好きのほうです。", right: "犬より猫のほうが好きです。", why: "のほうが va pegado a lo preferido." },
    ],
    examples: [
      { text: "夏と冬とどちらが好きですか。", reading: "なつとふゆとどちらがすきですか。", translation: es("¿Qué te gusta más, el verano o el invierno?") },
      { text: "日本で富士山がいちばん高いです。", reading: "にほんでふじさんがいちばんたかいです。", translation: es("El monte Fuji es el más alto de Japón.") },
    ],
    contrasts: [{ a: "AはBより高い", b: "AのほうがBより高い", explanation: "Misma idea; のほうが pone el foco en A." }],
    exercises: [
      { type: "mc", prompt: "新幹線はバス＿＿速いです。", options: ["より", "ほう", "いちばん", "まで"], answers: ["より"], explanation: "Que … → より." },
      { type: "mc", prompt: "コーヒーと紅茶、どちらが好きですか。— コーヒーの＿＿が好きです。", options: ["ほう", "より", "が", "を"], answers: ["ほう"], explanation: "Preferencia → のほうが." },
      { type: "fill", prompt: "クラスで田中さんが＿＿背が高いです。(el más)", answers: ["いちばん", "一番"], explanation: "Superlativo → いちばん." },
      { type: "correct", prompt: "私は兄よりの背が高いです。", answers: ["私は兄より背が高いです。"], explanation: "より no lleva の." },
    ],
  },
  {
    id: "ja:g:potential",
    language: "ja",
    title: "Forma potencial: 話せる, 食べられる",
    cefr: "B1",
    errorCategory: "ja:potential",
    summary:
      "Para «poder/saber hacer» hay una forma del verbo: godan cambia u → eru (話す → 話せる), ichidan añade られる (食べる → 食べられる). Irregulares: する → できる, 来る → 来られる. El objeto suele marcarse con が.",
    whenToUse: ["Habilidades: 日本語が話せます。", "Posibilidad: ここで写真が撮れますか。"],
    formation: ["Godan: 書く → 書ける, 読む → 読める, 泳ぐ → 泳げる.", "Ichidan: 見る → 見られる.", "する → できる · 来る → 来られる."],
    commonMistakes: [
      { wrong: "日本語を話すができます。", right: "日本語が話せます。/ 日本語を話すことができます。", why: "O forma potencial, o ～ことができる." },
      { wrong: "泳ぎれる", right: "泳げる", why: "Godan: ぐ → げる." },
    ],
    examples: [
      { text: "漢字が少し読めます。", reading: "かんじがすこしよめます。", translation: es("Puedo leer un poco de kanji.") },
      { text: "明日は来られますか。", reading: "あしたはこられますか。", translation: es("¿Puedes venir mañana?") },
    ],
    contrasts: [{ a: "泳げる (sé nadar)", b: "泳ぐことができる", explanation: "Forma potencial frente a construcción más formal: mismo sentido." }],
    exercises: [
      { type: "mc", prompt: "ピアノが＿＿か。(poder tocar: 弾く)", options: ["弾けます", "弾きれます", "弾かれます", "弾くます"], answers: ["弾けます"], explanation: "く → ける." },
      { type: "mc", prompt: "辛い物が＿＿。(poder comer: 食べる)", options: ["食べられます", "食べさせます", "食べます", "食べけます"], answers: ["食べられます"], explanation: "Ichidan → られる." },
      { type: "fill", prompt: "運転が＿＿ます。(する, potencial)", answers: ["でき"], explanation: "する → できる → できます." },
      { type: "correct", prompt: "私は英語を話すができます。", answers: ["私は英語が話せます。", "私は英語を話すことができます。"], explanation: "Falta こと o usar la forma potencial." },
    ],
  },
  {
    id: "ja:g:giving",
    language: "ja",
    title: "Dar y recibir: あげる, くれる, もらう",
    cefr: "B1",
    errorCategory: "ja:giving",
    summary:
      "Hay tres verbos según la dirección: あげる (yo/mi grupo da a otros), くれる (otros me dan a mí o a los míos) y もらう (recibir; quien da va con に/から). Con la forma て expresan favores: 手伝ってくれた (me ayudó).",
    whenToUse: ["Regalos: 友だちに本をあげました。", "Favores: 先生が説明してくれました。"],
    formation: ["A は B に X を あげる (A da a B).", "B が 私に X を くれる (B me da).", "私は B に/から X を もらう (recibo de B)."],
    commonMistakes: [
      { wrong: "友だちが私に本をあげました。", right: "友だちが私に本をくれました。", why: "Hacia mí → くれる." },
      { wrong: "私は母がプレゼントをもらいました。", right: "私は母にプレゼントをもらいました。", why: "Quien da, con に o から." },
    ],
    examples: [
      { text: "誕生日に姉が時計をくれました。", reading: "たんじょうびにあねがとけいをくれました。", translation: es("Mi hermana me regaló un reloj por mi cumpleaños.") },
      { text: "道を教えてもらいました。", reading: "みちをおしえてもらいました。", translation: es("Me indicaron el camino.") },
    ],
    contrasts: [{ a: "妹にあげた", b: "妹がくれた", explanation: "Se lo di a mi hermana / mi hermana me lo dio." }],
    exercises: [
      { type: "mc", prompt: "先生が私に辞書を＿＿。", options: ["くれました", "あげました", "もらいました", "やりました"], answers: ["くれました"], explanation: "Hacia mí → くれる." },
      { type: "mc", prompt: "私は友だちに花を＿＿。", options: ["あげました", "くれました", "もらいました", "いただきました"], answers: ["あげました"], explanation: "Yo doy → あげる." },
      { type: "fill", prompt: "田中さん＿＿お土産をもらいました。", answers: ["に", "から"], explanation: "Quien da → に/から." },
      { type: "correct", prompt: "兄が私にお金をあげました。", answers: ["兄が私にお金をくれました。"], explanation: "Hacia mí → くれました." },
    ],
  },
  {
    id: "ja:g:evidentials",
    language: "ja",
    title: "Parece que…: そうだ, らしい, みたい, ようだ",
    cefr: "B2",
    errorCategory: "ja:evidentials",
    summary:
      "El japonés marca de dónde viene la información. Raíz + そう: por lo que se ve (おいしそう, parece rico). Forma llana + そうだ: lo he oído (雨が降るそうだ). らしい: según dicen / típico de. ようだ (みたい, coloquial): deducción por indicios.",
    whenToUse: ["Aspecto: 雨が降りそうです (parece que va a llover).", "Rumor: 来月値上げするそうです.", "Deducción: 誰もいないようです."],
    formation: [
      "Aspecto: raíz verbal / adjetivo sin い + そう (いい → よさそう).",
      "Oído decir: forma llana + そうだ.",
      "Deducción: forma llana + ようだ / みたいだ (な-adj + な/みたい).",
    ],
    commonMistakes: [
      { wrong: "このケーキはおいしいそうです。 (queriendo decir «parece rica»)", right: "このケーキはおいしそうです。", why: "Por el aspecto: おいし + そう (sin い)." },
      { wrong: "いいそう", right: "よさそう", why: "いい es irregular: よさそう." },
    ],
    examples: [
      { text: "今にも雨が降りそうだ。", reading: "いまにもあめがふりそうだ。", translation: es("Parece que va a llover en cualquier momento.") },
      { text: "山田さんは会社を辞めたらしい。", reading: "やまださんはかいしゃをやめたらしい。", translation: es("Al parecer Yamada dejó la empresa.") },
    ],
    contrasts: [{ a: "おいしそう (se ve rico)", b: "おいしいそう (dicen que es rico)", explanation: "Aspecto frente a información oída." }],
    exercises: [
      { type: "mc", prompt: "このカレーは辛＿＿ですね。(se ve picante)", options: ["そう", "いそう", "らしい", "よう"], answers: ["そう"], explanation: "Aspecto: 辛 + そう." },
      { type: "mc", prompt: "ニュースによると、明日は台風が来る＿＿です。", options: ["そう", "よう", "らしさ", "みたい"], answers: ["そう"], explanation: "Según la noticia (oído) → forma llana + そうです." },
      { type: "fill", prompt: "この服、よ＿＿ですね。(parece buena, いい)", answers: ["さそう"], explanation: "いい → よさそう." },
      { type: "correct", prompt: "このパンはおいしいそうに見えます。", answers: ["このパンはおいしそうに見えます。"], explanation: "Aspecto → おいしそう." },
    ],
  },
  {
    id: "ja:g:hazu-wake",
    language: "ja",
    title: "Expectativas y conclusiones: はず, わけ",
    cefr: "C1",
    errorCategory: "ja:hazu-wake",
    summary:
      "はず expresa lo que debería ser según lo que sabemos (彼はもう着いたはずだ: ya debería haber llegado). わけ presenta una conclusión o explicación lógica (だから安いわけだ: por eso es barato); わけではない matiza «no es que…».",
    whenToUse: ["Expectativa razonada: 会議は三時からのはずです。", "Conclusión: 道理で寒いわけだ。", "Matiz: 嫌いなわけではない (no es que no me guste)."],
    formation: ["Forma llana (な-adj + な, nombre + の) + はず.", "Forma llana + わけだ / わけではない / わけがない."],
    commonMistakes: [
      { wrong: "彼は来るべきです (para «debería venir, según el horario»)", right: "彼は来るはずです。", why: "Expectativa lógica → はず; べき es obligación moral." },
      { wrong: "肉が嫌いわけではない。", right: "肉が嫌いなわけではない。", why: "な-adjetivo + な + わけ." },
    ],
    examples: [
      { text: "鍵はかばんの中にあるはずだ。", reading: "かぎはかばんのなかにあるはずだ。", translation: es("La llave debería estar en el bolso.") },
      { text: "毎日練習しているから、上手なわけだ。", reading: "まいにちれんしゅうしているから、じょうずなわけだ。", translation: es("Practica todos los días; con razón es tan bueno.") },
    ],
    contrasts: [{ a: "来るはずだ (debería venir)", b: "来るべきだ (tendría que venir, es lo correcto)", explanation: "Expectativa frente a obligación." }],
    exercises: [
      { type: "mc", prompt: "電車は十時に着く＿＿です。", options: ["はず", "わけ", "べき", "ため"], answers: ["はず"], explanation: "Expectativa según el horario → はず." },
      { type: "mc", prompt: "エアコンが壊れている。暑い＿＿だ。", options: ["わけ", "はず", "そう", "べき"], answers: ["わけ"], explanation: "Conclusión lógica → わけだ." },
      { type: "fill", prompt: "料理が嫌いな＿＿ではないが、時間がない。", answers: ["わけ"], explanation: "わけではない = no es que…" },
      { type: "correct", prompt: "彼は日本人だから、日本語が話せるわけがある。", answers: ["彼は日本人だから、日本語が話せるはずだ。", "彼は日本人だから、日本語が話せるはずです。"], explanation: "Expectativa → はず (わけがある no expresa eso)." },
    ],
  },
];
