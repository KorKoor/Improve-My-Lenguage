import type { CefrLevel, GrammarConcept, PartOfSpeech, VocabItem } from "../types";

type Ex = [text: string, reading: string, es: string];

function v(
  slug: string,
  lemma: string,
  kana: string,
  romaji: string,
  pos: PartOfSpeech,
  cefr: CefrLevel,
  es: string[],
  examples: Ex[],
  topics: string[],
  usageNote?: string,
): VocabItem {
  return {
    id: `ja:w:${slug}`,
    language: "ja",
    lemma,
    reading: kana === lemma ? romaji : `${kana} · ${romaji}`,
    acceptedForms: [kana, romaji].filter((f) => f !== lemma),
    pos,
    cefr,
    frequencyBand: 1,
    translations: { es },
    examples: examples.map(([text, reading, t]) => ({ text, reading, translation: { es: t } })),
    topics,
    register: "neutral",
    usageNote,
  };
}

export const JA_VOCAB: VocabItem[] = [
  v("mizu", "水", "みず", "mizu", "noun", "A1", ["agua"], [["水をください。", "mizu o kudasai.", "Agua, por favor."]], ["everyday", "food"]),
  v("neko", "猫", "ねこ", "neko", "noun", "A1", ["gato"], [["猫が好きです。", "neko ga suki desu.", "Me gustan los gatos."]], ["everyday"]),
  v("inu", "犬", "いぬ", "inu", "noun", "A1", ["perro"], [["犬と散歩します。", "inu to sanpo shimasu.", "Salgo a pasear con el perro."]], ["everyday"]),
  v("tomodachi", "友達", "ともだち", "tomodachi", "noun", "A1", ["amigo"], [["友達と映画を見ます。", "tomodachi to eiga o mimasu.", "Veo una película con un amigo."]], ["everyday"]),
  v("taberu", "食べる", "たべる", "taberu", "verb", "A1", ["comer"], [["毎朝パンを食べる。", "maiasa pan o taberu.", "Todas las mañanas como pan."]], ["food"], "Forma cortés: 食べます (tabemasu)."),
  v("nomu", "飲む", "のむ", "nomu", "verb", "A1", ["beber", "tomar"], [["毎日コーヒーを飲む。", "mainichi kōhī o nomu.", "Tomo café todos los días."]], ["food"], "Forma cortés: 飲みます (nomimasu)."),
  v("iku", "行く", "いく", "iku", "verb", "A1", ["ir"], [["明日、学校に行く。", "ashita, gakkō ni iku.", "Mañana voy a la escuela."]], ["everyday"], "El destino se marca con に o へ."),
  v("hon", "本", "ほん", "hon", "noun", "A1", ["libro"], [["毎晩本を読みます。", "maiban hon o yomimasu.", "Leo un libro todas las noches."]], ["everyday"]),
  v("gakkou", "学校", "がっこう", "gakkou", "noun", "A1", ["escuela"], [["学校は八時に始まります。", "gakkō wa hachi-ji ni hajimarimasu.", "La escuela empieza a las ocho."]], ["everyday"]),
  v("sensei", "先生", "せんせい", "sensei", "noun", "A1", ["profesor", "maestro"], [["先生はとても優しいです。", "sensei wa totemo yasashii desu.", "El profesor es muy amable."]], ["everyday"], "No se usa para uno mismo: es un título de respeto."),
  v("kyou", "今日", "きょう", "kyou", "noun", "A1", ["hoy"], [["今日は暑いです。", "kyō wa atsui desu.", "Hoy hace calor."]], ["everyday"]),
  v("ashita", "明日", "あした", "ashita", "noun", "A1", ["mañana (el día siguiente)"], [["明日、東京に行きます。", "ashita, Tōkyō ni ikimasu.", "Mañana voy a Tokio."]], ["everyday"]),
  v("takai", "高い", "たかい", "takai", "adjective", "A1", ["caro", "alto"], [["このカメラは高いです。", "kono kamera wa takai desu.", "Esta cámara es cara."]], ["everyday"]),
  v("yasui", "安い", "やすい", "yasui", "adjective", "A1", ["barato"], [["この店は安いです。", "kono mise wa yasui desu.", "Esta tienda es barata."]], ["everyday"]),
  v("suki", "好き", "すき", "suki", "adjective", "A1", ["gustar", "que gusta"], [["音楽が好きです。", "ongaku ga suki desu.", "Me gusta la música."]], ["feelings", "music"], "El objeto que gusta se marca con が, no con を."),
  v("geemu", "ゲーム", "ゲーム", "geemu", "noun", "A1", ["videojuego", "juego"], [["週末はゲームをします。", "shūmatsu wa gēmu o shimasu.", "Los fines de semana juego videojuegos."]], ["gaming"]),
  v("shigoto", "仕事", "しごと", "shigoto", "noun", "A1", ["trabajo"], [["仕事は九時からです。", "shigoto wa ku-ji kara desu.", "El trabajo es a partir de las nueve."]], ["work"]),
  v("densha", "電車", "でんしゃ", "densha", "noun", "A1", ["tren"], [["電車で会社に行きます。", "densha de kaisha ni ikimasu.", "Voy a la empresa en tren."]], ["travel"], "El medio de transporte se marca con で."),
  v("arigatou", "ありがとう", "ありがとう", "arigatou", "interjection", "A1", ["gracias"], [["手伝ってくれて、ありがとう。", "tetsudatte kurete, arigatō.", "Gracias por ayudarme."]], ["everyday"], "Más cortés: ありがとうございます."),
  v("sumimasen", "すみません", "すみません", "sumimasen", "interjection", "A1", ["disculpe", "perdón"], [["すみません、駅はどこですか。", "sumimasen, eki wa doko desu ka.", "Disculpe, ¿dónde está la estación?"]], ["everyday", "travel"]),
  v("ohayou", "おはよう", "おはよう", "ohayou", "interjection", "A1", ["buenos días"], [["おはようございます、先生。", "ohayō gozaimasu, sensei.", "Buenos días, profesor."]], ["everyday"], "Cortés: おはようございます."),
  v("konnichiwa", "こんにちは", "こんにちは", "konnichiwa", "interjection", "A1", ["hola", "buenas tardes"], [["こんにちは、元気ですか。", "konnichiwa, genki desu ka.", "Hola, ¿cómo estás?"]], ["everyday"], "Se escribe は pero se pronuncia «wa»."),
  v("ie", "家", "いえ", "ie", "noun", "A1", ["casa"], [["家に帰ります。", "ie ni kaerimasu.", "Vuelvo a casa."]], ["everyday"]),
  v("asa", "朝", "あさ", "asa", "noun", "A1", ["mañana (parte del día)"], [["朝ご飯を食べました。", "asagohan o tabemashita.", "Desayuné."]], ["everyday"], "朝ご飯 (asagohan) = desayuno."),
  v("kau", "買う", "かう", "kau", "verb", "A1", ["comprar"], [["パンを買います。", "pan o kaimasu.", "Compro pan."]], ["everyday"], "Forma cortés: 買います (kaimasu)."),
  v("miru", "見る", "みる", "miru", "verb", "A1", ["ver", "mirar"], [["テレビを見ます。", "terebi o mimasu.", "Veo la televisión."]], ["everyday"], "Forma cortés: 見ます (mimasu)."),
  v("wakaru", "分かる", "わかる", "wakaru", "verb", "A1", ["entender"], [["日本語が少し分かります。", "nihongo ga sukoshi wakarimasu.", "Entiendo un poco de japonés."]], ["everyday"], "Lo que se entiende se marca con が."),
  v("hanasu", "話す", "はなす", "hanasu", "verb", "A1", ["hablar"], [["母と電話で話します。", "haha to denwa de hanashimasu.", "Hablo por teléfono con mi mamá."]], ["everyday"], "Forma cortés: 話します (hanashimasu)."),
  v("tetsudau", "手伝う", "てつだう", "tetsudau", "verb", "A2", ["ayudar"], [["母を手伝います。", "haha o tetsudaimasu.", "Ayudo a mi mamá."]], ["everyday"]),
  v("oishii", "おいしい", "おいしい", "oishii", "adjective", "A1", ["rico", "delicioso"], [["このラーメンはおいしいです。", "kono rāmen wa oishii desu.", "Este ramen está delicioso."]], ["food"]),
  v("tsukareta", "疲れた", "つかれた", "tsukareta", "adjective", "A2", ["cansado"], [["今日はとても疲れました。", "kyō wa totemo tsukaremashita.", "Hoy estoy muy cansado."]], ["feelings"], "Literalmente «me cansé»: 疲れる en pasado."),
  v("pasokon", "パソコン", "パソコン", "pasokon", "noun", "A2", ["computadora"], [["新しいパソコンを買いました。", "atarashii pasokon o kaimashita.", "Compré una computadora nueva."]], ["tech"], "Abreviatura de «personal computer»."),
];

export const JA_GRAMMAR: GrammarConcept[] = [
  {
    id: "ja:g:particles-wa-ga-o",
    language: "ja",
    title: "Partículas básicas: は, を, に, で",
    cefr: "A1",
    errorCategory: "ja:particles",
    summary:
      "En japonés, pequeñas partículas después de cada palabra indican su función en la frase. El verbo va al final (orden sujeto-objeto-verbo).",
    whenToUse: [
      "は (wa): marca el tema — 'en cuanto a…'. 私は学生です。",
      "を (o): marca el objeto directo. パンを食べる。",
      "に (ni): destino o momento concreto. 学校に行く。八時に起きる。",
      "で (de): lugar donde ocurre una acción o medio. 家で勉強する。電車で行く。",
    ],
    formation: ["Palabra + partícula: 猫 + が, パン + を.", "は se escribe con el kana 'ha' pero se pronuncia 'wa'; を se pronuncia 'o'."],
    commonMistakes: [
      { wrong: "学校で行く。", right: "学校に行く。", why: "Destino → に. で indica dónde se realiza una acción." },
      { wrong: "音楽を好きです。", right: "音楽が好きです。", why: "好き marca lo que gusta con が." },
    ],
    examples: [
      { text: "私は毎日日本語を勉強します。", reading: "watashi wa mainichi nihongo o benkyō shimasu.", translation: { es: "Estudio japonés todos los días." } },
      { text: "図書館で本を読みます。", reading: "toshokan de hon o yomimasu.", translation: { es: "Leo libros en la biblioteca." } },
    ],
    contrasts: [
      { a: "東京に行きます。(voy a Tokio)", b: "東京で働きます。(trabajo en Tokio)", explanation: "に = destino; で = lugar de la acción." },
    ],
    exercises: [
      { type: "mc", prompt: "パン＿食べます。", options: ["を", "に", "で", "は"], answers: ["を"], explanation: "Objeto directo → を." },
      { type: "mc", prompt: "明日、東京＿行きます。", options: ["を", "に", "で", "が"], answers: ["に"], explanation: "Destino → に." },
      { type: "mc", prompt: "家＿勉強します。", options: ["に", "を", "で", "が"], answers: ["で"], explanation: "Lugar donde ocurre la acción → で." },
      { type: "mc", prompt: "私＿学生です。", options: ["は", "を", "で", "に"], answers: ["は"], explanation: "Tema de la frase → は." },
      { type: "mc", prompt: "音楽＿好きです。", options: ["を", "が", "で", "に"], answers: ["が"], explanation: "好き → が." },
    ],
  },
  {
    id: "ja:g:masu-form",
    language: "ja",
    title: "Forma cortés: ～ます, ～ません, ～ました",
    cefr: "A1",
    errorCategory: "ja:polite-form",
    summary:
      "Con personas que no son amigos cercanos se usa la forma cortés. Todos los verbos terminan en ～ます en presente/futuro, ～ません en negativo y ～ました en pasado. Es la forma más útil para empezar.",
    whenToUse: [
      "Con desconocidos, en tiendas, en el trabajo y con profesores.",
      "El japonés no distingue presente y futuro: 行きます = voy / iré.",
    ],
    formation: [
      "Presente/futuro: 食べます (como), 行きます (voy).",
      "Negativo: 食べません (no como), 行きません (no voy).",
      "Pasado: 食べました (comí), 行きました (fui).",
      "Pasado negativo: 食べませんでした (no comí).",
    ],
    commonMistakes: [
      { wrong: "昨日、映画を見ます。", right: "昨日、映画を見ました。", why: "昨日 (ayer) exige pasado: ～ました." },
      { wrong: "肉を食べるません。", right: "肉を食べません。", why: "El negativo se forma sobre la raíz: 食べ + ません." },
    ],
    examples: [
      { text: "毎朝コーヒーを飲みます。", reading: "maiasa kōhī o nomimasu.", translation: { es: "Tomo café todas las mañanas." } },
      { text: "昨日は仕事に行きませんでした。", reading: "kinō wa shigoto ni ikimasen deshita.", translation: { es: "Ayer no fui al trabajo." } },
    ],
    contrasts: [
      { a: "食べる (forma de diccionario, informal)", b: "食べます (forma cortés)", explanation: "Mismo significado; la cortés es la segura con cualquiera." },
    ],
    exercises: [
      { type: "mc", prompt: "昨日、友達に＿。", options: ["会います", "会いました", "会いません", "会う"], answers: ["会いました"], explanation: "昨日 (ayer) → pasado: ～ました." },
      { type: "mc", prompt: "私は肉を＿。(no como carne)", options: ["食べます", "食べません", "食べました", "食べる"], answers: ["食べません"], explanation: "Negativo presente → ～ません." },
      { type: "mc", prompt: "明日、東京に＿。(iré)", options: ["行きました", "行きます", "行きませんでした", "行った"], answers: ["行きます"], explanation: "Futuro = misma forma que el presente: ～ます." },
      { type: "mc", prompt: "毎日日本語を＿。(estudio)", options: ["勉強します", "勉強しました", "勉強しません", "勉強"], answers: ["勉強します"], explanation: "Hábito presente → ～ます." },
    ],
  },
];
