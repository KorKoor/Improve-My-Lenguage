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
];
