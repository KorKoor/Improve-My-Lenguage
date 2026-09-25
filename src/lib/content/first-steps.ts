/**
 * «Primeros pasos»: frases de supervivencia para quien empieza de cero.
 *
 * Diez unidades cortas (saludos, presentarse, cuando no entiendes, números,
 * cafetería, orientarse, familia, compras, días y horas, emergencias). Cada frase trae su traducción en los 12
 * idiomas y, en los de otra escritura, una transcripción latina para poder
 * leerla desde el primer día. Contenido escrito y revisado a mano.
 */
import type { LanguageCode } from "./types";

type Tr = Record<"en" | "fr" | "de" | "it" | "pt" | "nl" | "sv" | "ru" | "ja" | "ko" | "zh" | "ar", string>;
type Rom = Partial<Record<"ru" | "ja" | "ko" | "zh" | "ar", string>>;

export interface FirstPhrase {
  es: string;
  t: Tr;
  /** Transcripción latina para escrituras no latinas. */
  r?: Rom;
}

export interface FirstUnit {
  id: string;
  emoji: string;
  title: string;
  goal: string;
  phrases: FirstPhrase[];
}

const p = (es: string, t: Tr, r?: Rom): FirstPhrase => ({ es, t, r });

export const FIRST_STEPS: FirstUnit[] = [
  {
    id: "greetings",
    emoji: "👋",
    title: "Saludar",
    goal: "Saludar, despedirte y dar las gracias.",
    phrases: [
      p("Hola", { en: "Hello", fr: "Salut", de: "Hallo", it: "Ciao", pt: "Olá", nl: "Hallo", sv: "Hej", ru: "Привет", ja: "こんにちは", ko: "안녕하세요", zh: "你好", ar: "مرحبا" }, { ru: "privét", ja: "konnichiwa", ko: "annyeonghaseyo", zh: "nǐ hǎo", ar: "marḥaban" }),
      p("Buenos días", { en: "Good morning", fr: "Bonjour", de: "Guten Morgen", it: "Buongiorno", pt: "Bom dia", nl: "Goedemorgen", sv: "God morgon", ru: "Доброе утро", ja: "おはようございます", ko: "좋은 아침입니다", zh: "早上好", ar: "صباح الخير" }, { ru: "dóbroye útro", ja: "ohayō gozaimasu", ko: "joeun achimimnida", zh: "zǎoshang hǎo", ar: "ṣabāḥ al-khayr" }),
      p("Buenas noches", { en: "Good night", fr: "Bonne nuit", de: "Gute Nacht", it: "Buonanotte", pt: "Boa noite", nl: "Goedenacht", sv: "God natt", ru: "Спокойной ночи", ja: "おやすみなさい", ko: "안녕히 주무세요", zh: "晚安", ar: "تصبح على خير" }, { ru: "spokóynoy nóchi", ja: "oyasuminasai", ko: "annyeonghi jumuseyo", zh: "wǎn'ān", ar: "tuṣbiḥ ʿalā khayr" }),
      p("Adiós", { en: "Goodbye", fr: "Au revoir", de: "Auf Wiedersehen", it: "Arrivederci", pt: "Adeus", nl: "Tot ziens", sv: "Hej då", ru: "До свидания", ja: "さようなら", ko: "안녕히 가세요", zh: "再见", ar: "مع السلامة" }, { ru: "do svidániya", ja: "sayōnara", ko: "annyeonghi gaseyo", zh: "zàijiàn", ar: "maʿa as-salāma" }),
      p("Hasta luego", { en: "See you later", fr: "À plus tard", de: "Bis später", it: "A dopo", pt: "Até logo", nl: "Tot straks", sv: "Vi ses", ru: "Пока", ja: "またね", ko: "또 봐요", zh: "回头见", ar: "أراك لاحقا" }, { ru: "poká", ja: "mata ne", ko: "tto bwayo", zh: "huítóu jiàn", ar: "arāka lāḥiqan" }),
      p("Por favor", { en: "Please", fr: "S'il vous plaît", de: "Bitte", it: "Per favore", pt: "Por favor", nl: "Alstublieft", sv: "Snälla", ru: "Пожалуйста", ja: "お願いします", ko: "부탁합니다", zh: "请", ar: "من فضلك" }, { ru: "pozhálusta", ja: "onegai shimasu", ko: "butakamnida", zh: "qǐng", ar: "min faḍlak" }),
      p("Gracias", { en: "Thank you", fr: "Merci", de: "Danke", it: "Grazie", pt: "Obrigado", nl: "Dank je", sv: "Tack", ru: "Спасибо", ja: "ありがとう", ko: "감사합니다", zh: "谢谢", ar: "شكرا" }, { ru: "spasíbo", ja: "arigatō", ko: "gamsahamnida", zh: "xièxie", ar: "shukran" }),
      p("De nada", { en: "You're welcome", fr: "De rien", de: "Gern geschehen", it: "Prego", pt: "De nada", nl: "Graag gedaan", sv: "Varsågod", ru: "Не за что", ja: "どういたしまして", ko: "천만에요", zh: "不客气", ar: "عفوا" }, { ru: "ne za chto", ja: "dō itashimashite", ko: "cheonmaneyo", zh: "bú kèqi", ar: "ʿafwan" }),
    ],
  },
  {
    id: "introduce",
    emoji: "🙂",
    title: "Presentarte",
    goal: "Decir tu nombre y de dónde eres, y preguntarlo.",
    phrases: [
      p("Me llamo Ana", { en: "My name is Ana", fr: "Je m'appelle Ana", de: "Ich heiße Ana", it: "Mi chiamo Ana", pt: "Meu nome é Ana", nl: "Ik heet Ana", sv: "Jag heter Ana", ru: "Меня зовут Ана", ja: "私はアナです", ko: "제 이름은 아나예요", zh: "我叫安娜", ar: "اسمي آنا" }, { ru: "menyá zovút Ana", ja: "watashi wa Ana desu", ko: "je ireumeun Ana-yeyo", zh: "wǒ jiào Ānnà", ar: "ismī Ānā" }),
      p("¿Cómo te llamas?", { en: "What's your name?", fr: "Comment tu t'appelles ?", de: "Wie heißt du?", it: "Come ti chiami?", pt: "Como você se chama?", nl: "Hoe heet je?", sv: "Vad heter du?", ru: "Как тебя зовут?", ja: "お名前は何ですか？", ko: "이름이 뭐예요?", zh: "你叫什么名字？", ar: "ما اسمك؟" }, { ru: "kak tebyá zovút?", ja: "onamae wa nan desu ka?", ko: "ireumi mwoyeyo?", zh: "nǐ jiào shénme míngzi?", ar: "mā ismuk?" }),
      p("Encantado de conocerte", { en: "Nice to meet you", fr: "Enchanté", de: "Freut mich", it: "Piacere", pt: "Prazer em conhecê-lo", nl: "Aangenaam", sv: "Trevligt att träffas", ru: "Очень приятно", ja: "はじめまして", ko: "만나서 반가워요", zh: "很高兴认识你", ar: "تشرفنا" }, { ru: "óchen' priyátno", ja: "hajimemashite", ko: "mannaseo bangawoyo", zh: "hěn gāoxìng rènshi nǐ", ar: "tasharrafnā" }),
      p("Soy de México", { en: "I'm from Mexico", fr: "Je viens du Mexique", de: "Ich komme aus Mexiko", it: "Vengo dal Messico", pt: "Sou do México", nl: "Ik kom uit Mexico", sv: "Jag kommer från Mexiko", ru: "Я из Мексики", ja: "メキシコから来ました", ko: "저는 멕시코에서 왔어요", zh: "我来自墨西哥", ar: "أنا من المكسيك" }, { ru: "ya iz Méksiki", ja: "Mekishiko kara kimashita", ko: "jeoneun Meksikoeseo wasseoyo", zh: "wǒ láizì Mòxīgē", ar: "anā min al-Maksīk" }),
      p("¿De dónde eres?", { en: "Where are you from?", fr: "Tu viens d'où ?", de: "Woher kommst du?", it: "Di dove sei?", pt: "De onde você é?", nl: "Waar kom je vandaan?", sv: "Var kommer du ifrån?", ru: "Откуда ты?", ja: "どこから来ましたか？", ko: "어디에서 왔어요?", zh: "你是哪里人？", ar: "من أين أنت؟" }, { ru: "otkúda ty?", ja: "doko kara kimashita ka?", ko: "eodieseo wasseoyo?", zh: "nǐ shì nǎlǐ rén?", ar: "min ayna anta?" }),
      p("¿Cómo estás?", { en: "How are you?", fr: "Comment ça va ?", de: "Wie geht's?", it: "Come stai?", pt: "Como vai?", nl: "Hoe gaat het?", sv: "Hur mår du?", ru: "Как дела?", ja: "お元気ですか？", ko: "잘 지내요?", zh: "你好吗？", ar: "كيف حالك؟" }, { ru: "kak delá?", ja: "ogenki desu ka?", ko: "jal jinaeyo?", zh: "nǐ hǎo ma?", ar: "kayfa ḥāluk?" }),
      p("Muy bien, gracias", { en: "Very well, thanks", fr: "Très bien, merci", de: "Sehr gut, danke", it: "Molto bene, grazie", pt: "Muito bem, obrigado", nl: "Heel goed, dank je", sv: "Mycket bra, tack", ru: "Очень хорошо, спасибо", ja: "元気です、ありがとう", ko: "아주 잘 지내요, 고마워요", zh: "很好，谢谢", ar: "بخير، شكرا" }, { ru: "óchen' khoroshó, spasíbo", ja: "genki desu, arigatō", ko: "aju jal jinaeyo, gomawoyo", zh: "hěn hǎo, xièxie", ar: "bikhayr, shukran" }),
      p("Hablo un poco", { en: "I speak a little", fr: "Je parle un peu", de: "Ich spreche ein bisschen", it: "Parlo un po'", pt: "Falo um pouco", nl: "Ik spreek een beetje", sv: "Jag pratar lite", ru: "Я немного говорю", ja: "少し話せます", ko: "조금 말할 수 있어요", zh: "我会说一点", ar: "أتكلم قليلا" }, { ru: "ya nemnógo govoryú", ja: "sukoshi hanasemasu", ko: "jogeum malhal su isseoyo", zh: "wǒ huì shuō yìdiǎn", ar: "atakallam qalīlan" }),
    ],
  },
  {
    id: "survive",
    emoji: "🛟",
    title: "Cuando no entiendes",
    goal: "Pedir que te repitan, que hablen despacio o cómo se dice algo.",
    phrases: [
      p("No entiendo", { en: "I don't understand", fr: "Je ne comprends pas", de: "Ich verstehe nicht", it: "Non capisco", pt: "Não entendo", nl: "Ik begrijp het niet", sv: "Jag förstår inte", ru: "Я не понимаю", ja: "わかりません", ko: "이해가 안 돼요", zh: "我不明白", ar: "لا أفهم" }, { ru: "ya ne ponimáyu", ja: "wakarimasen", ko: "ihaega an dwaeyo", zh: "wǒ bù míngbai", ar: "lā afham" }),
      p("¿Puede repetir, por favor?", { en: "Can you repeat, please?", fr: "Vous pouvez répéter, s'il vous plaît ?", de: "Können Sie das bitte wiederholen?", it: "Può ripetere, per favore?", pt: "Pode repetir, por favor?", nl: "Kunt u dat herhalen, alstublieft?", sv: "Kan du upprepa, tack?", ru: "Повторите, пожалуйста", ja: "もう一度お願いします", ko: "다시 말해 주세요", zh: "请再说一遍", ar: "هل يمكنك أن تكرر من فضلك؟" }, { ru: "povtoríte, pozhálusta", ja: "mō ichido onegai shimasu", ko: "dasi malhae juseyo", zh: "qǐng zài shuō yí biàn", ar: "hal yumkinuka an tukarrir min faḍlak?" }),
      p("Más despacio, por favor", { en: "Slower, please", fr: "Plus lentement, s'il vous plaît", de: "Langsamer, bitte", it: "Più piano, per favore", pt: "Mais devagar, por favor", nl: "Langzamer, alstublieft", sv: "Långsammare, tack", ru: "Помедленнее, пожалуйста", ja: "ゆっくりお願いします", ko: "천천히 말해 주세요", zh: "请说慢一点", ar: "ببطء من فضلك" }, { ru: "pomédlenneye, pozhálusta", ja: "yukkuri onegai shimasu", ko: "cheoncheonhi malhae juseyo", zh: "qǐng shuō màn yìdiǎn", ar: "bibuṭʾ min faḍlak" }),
      p("¿Habla español?", { en: "Do you speak Spanish?", fr: "Vous parlez espagnol ?", de: "Sprechen Sie Spanisch?", it: "Parla spagnolo?", pt: "Você fala espanhol?", nl: "Spreekt u Spaans?", sv: "Pratar du spanska?", ru: "Вы говорите по-испански?", ja: "スペイン語を話せますか？", ko: "스페인어 할 줄 아세요?", zh: "你会说西班牙语吗？", ar: "هل تتكلم الإسبانية؟" }, { ru: "vy govoríte po-ispánski?", ja: "supeingo o hanasemasu ka?", ko: "seupeineo hal jul aseyo?", zh: "nǐ huì shuō Xībānyáyǔ ma?", ar: "hal tatakallam al-isbāniyya?" }),
      p("Sí", { en: "Yes", fr: "Oui", de: "Ja", it: "Sì", pt: "Sim", nl: "Ja", sv: "Ja", ru: "Да", ja: "はい", ko: "네", zh: "是", ar: "نعم" }, { ru: "da", ja: "hai", ko: "ne", zh: "shì", ar: "naʿam" }),
      p("No", { en: "No", fr: "Non", de: "Nein", it: "No", pt: "Não", nl: "Nee", sv: "Nej", ru: "Нет", ja: "いいえ", ko: "아니요", zh: "不", ar: "لا" }, { ru: "net", ja: "iie", ko: "aniyo", zh: "bù", ar: "lā" }),
      p("Perdón", { en: "Sorry", fr: "Pardon", de: "Entschuldigung", it: "Scusi", pt: "Desculpe", nl: "Sorry", sv: "Förlåt", ru: "Извините", ja: "すみません", ko: "죄송합니다", zh: "对不起", ar: "آسف" }, { ru: "izviníte", ja: "sumimasen", ko: "joesonghamnida", zh: "duìbuqǐ", ar: "āsif" }),
      p("No sé", { en: "I don't know", fr: "Je ne sais pas", de: "Ich weiß nicht", it: "Non lo so", pt: "Não sei", nl: "Ik weet het niet", sv: "Jag vet inte", ru: "Я не знаю", ja: "知りません", ko: "몰라요", zh: "我不知道", ar: "لا أعرف" }, { ru: "ya ne znáyu", ja: "shirimasen", ko: "mollayo", zh: "wǒ bù zhīdào", ar: "lā aʿrif" }),
    ],
  },
  {
    id: "numbers",
    emoji: "🔢",
    title: "Números del 1 al 10",
    goal: "Contar, entender precios y horas sencillas.",
    phrases: [
      p("uno", { en: "one", fr: "un", de: "eins", it: "uno", pt: "um", nl: "een", sv: "ett", ru: "один", ja: "一", ko: "하나", zh: "一", ar: "واحد" }, { ru: "odín", ja: "ichi", ko: "hana", zh: "yī", ar: "wāḥid" }),
      p("dos", { en: "two", fr: "deux", de: "zwei", it: "due", pt: "dois", nl: "twee", sv: "två", ru: "два", ja: "二", ko: "둘", zh: "二", ar: "اثنان" }, { ru: "dva", ja: "ni", ko: "dul", zh: "èr", ar: "ithnān" }),
      p("tres", { en: "three", fr: "trois", de: "drei", it: "tre", pt: "três", nl: "drie", sv: "tre", ru: "три", ja: "三", ko: "셋", zh: "三", ar: "ثلاثة" }, { ru: "tri", ja: "san", ko: "set", zh: "sān", ar: "thalātha" }),
      p("cuatro", { en: "four", fr: "quatre", de: "vier", it: "quattro", pt: "quatro", nl: "vier", sv: "fyra", ru: "четыре", ja: "四", ko: "넷", zh: "四", ar: "أربعة" }, { ru: "chetýre", ja: "yon", ko: "net", zh: "sì", ar: "arbaʿa" }),
      p("cinco", { en: "five", fr: "cinq", de: "fünf", it: "cinque", pt: "cinco", nl: "vijf", sv: "fem", ru: "пять", ja: "五", ko: "다섯", zh: "五", ar: "خمسة" }, { ru: "pyat'", ja: "go", ko: "daseot", zh: "wǔ", ar: "khamsa" }),
      p("seis", { en: "six", fr: "six", de: "sechs", it: "sei", pt: "seis", nl: "zes", sv: "sex", ru: "шесть", ja: "六", ko: "여섯", zh: "六", ar: "ستة" }, { ru: "shest'", ja: "roku", ko: "yeoseot", zh: "liù", ar: "sitta" }),
      p("siete", { en: "seven", fr: "sept", de: "sieben", it: "sette", pt: "sete", nl: "zeven", sv: "sju", ru: "семь", ja: "七", ko: "일곱", zh: "七", ar: "سبعة" }, { ru: "sem'", ja: "nana", ko: "ilgop", zh: "qī", ar: "sabʿa" }),
      p("diez", { en: "ten", fr: "dix", de: "zehn", it: "dieci", pt: "dez", nl: "tien", sv: "tio", ru: "десять", ja: "十", ko: "열", zh: "十", ar: "عشرة" }, { ru: "désyat'", ja: "jū", ko: "yeol", zh: "shí", ar: "ʿashara" }),
    ],
  },
  {
    id: "cafe",
    emoji: "☕",
    title: "En la cafetería",
    goal: "Pedir algo, preguntar el precio y pagar.",
    phrases: [
      p("Un café, por favor", { en: "A coffee, please", fr: "Un café, s'il vous plaît", de: "Einen Kaffee, bitte", it: "Un caffè, per favore", pt: "Um café, por favor", nl: "Een koffie, alstublieft", sv: "En kaffe, tack", ru: "Кофе, пожалуйста", ja: "コーヒーをお願いします", ko: "커피 한 잔 주세요", zh: "请给我一杯咖啡", ar: "قهوة من فضلك" }, { ru: "kófe, pozhálusta", ja: "kōhī o onegai shimasu", ko: "keopi han jan juseyo", zh: "qǐng gěi wǒ yì bēi kāfēi", ar: "qahwa min faḍlak" }),
      p("Agua, por favor", { en: "Water, please", fr: "De l'eau, s'il vous plaît", de: "Wasser, bitte", it: "Acqua, per favore", pt: "Água, por favor", nl: "Water, alstublieft", sv: "Vatten, tack", ru: "Воду, пожалуйста", ja: "水をお願いします", ko: "물 주세요", zh: "请给我水", ar: "ماء من فضلك" }, { ru: "vódu, pozhálusta", ja: "mizu o onegai shimasu", ko: "mul juseyo", zh: "qǐng gěi wǒ shuǐ", ar: "māʾ min faḍlak" }),
      p("¿Cuánto cuesta?", { en: "How much is it?", fr: "Combien ça coûte ?", de: "Wie viel kostet das?", it: "Quanto costa?", pt: "Quanto custa?", nl: "Hoeveel kost het?", sv: "Hur mycket kostar det?", ru: "Сколько это стоит?", ja: "いくらですか？", ko: "얼마예요?", zh: "多少钱？", ar: "بكم هذا؟" }, { ru: "skól'ko éto stóit?", ja: "ikura desu ka?", ko: "eolmayeyo?", zh: "duōshao qián?", ar: "bikam hādhā?" }),
      p("La cuenta, por favor", { en: "The bill, please", fr: "L'addition, s'il vous plaît", de: "Die Rechnung, bitte", it: "Il conto, per favore", pt: "A conta, por favor", nl: "De rekening, alstublieft", sv: "Notan, tack", ru: "Счёт, пожалуйста", ja: "お会計をお願いします", ko: "계산서 주세요", zh: "请结账", ar: "الحساب من فضلك" }, { ru: "schyot, pozhálusta", ja: "okaikei o onegai shimasu", ko: "gyesanseo juseyo", zh: "qǐng jiézhàng", ar: "al-ḥisāb min faḍlak" }),
      p("Una mesa para dos", { en: "A table for two", fr: "Une table pour deux", de: "Einen Tisch für zwei", it: "Un tavolo per due", pt: "Uma mesa para dois", nl: "Een tafel voor twee", sv: "Ett bord för två", ru: "Столик на двоих", ja: "二人です", ko: "두 명이에요", zh: "两位", ar: "طاولة لشخصين" }, { ru: "stólik na dvoíkh", ja: "futari desu", ko: "du myeongieyo", zh: "liǎng wèi", ar: "ṭāwila li-shakhṣayn" }),
      p("Sin azúcar", { en: "Without sugar", fr: "Sans sucre", de: "Ohne Zucker", it: "Senza zucchero", pt: "Sem açúcar", nl: "Zonder suiker", sv: "Utan socker", ru: "Без сахара", ja: "砂糖なしで", ko: "설탕 없이요", zh: "不加糖", ar: "بدون سكر" }, { ru: "bez sákhara", ja: "satō nashi de", ko: "seoltang eopsiyo", zh: "bù jiā táng", ar: "bidūn sukkar" }),
      p("Está muy bueno", { en: "It's very good", fr: "C'est très bon", de: "Das ist sehr gut", it: "È molto buono", pt: "Está muito bom", nl: "Het is heel lekker", sv: "Det är mycket gott", ru: "Очень вкусно", ja: "とてもおいしいです", ko: "아주 맛있어요", zh: "很好吃", ar: "لذيذ جدا" }, { ru: "óchen' vkúsno", ja: "totemo oishii desu", ko: "aju masisseoyo", zh: "hěn hǎochī", ar: "ladhīdh jiddan" }),
      p("Con tarjeta", { en: "By card", fr: "Par carte", de: "Mit Karte", it: "Con la carta", pt: "Com cartão", nl: "Met de kaart", sv: "Med kort", ru: "Картой", ja: "カードで", ko: "카드로요", zh: "刷卡", ar: "بالبطاقة" }, { ru: "kártoy", ja: "kādo de", ko: "kadeuroyo", zh: "shuā kǎ", ar: "bil-biṭāqa" }),
    ],
  },
  {
    id: "directions",
    emoji: "🧭",
    title: "Orientarte",
    goal: "Preguntar dónde está algo y entender la respuesta.",
    phrases: [
      p("¿Dónde está el baño?", { en: "Where is the bathroom?", fr: "Où sont les toilettes ?", de: "Wo ist die Toilette?", it: "Dov'è il bagno?", pt: "Onde fica o banheiro?", nl: "Waar is het toilet?", sv: "Var är toaletten?", ru: "Где туалет?", ja: "トイレはどこですか？", ko: "화장실이 어디예요?", zh: "洗手间在哪里？", ar: "أين الحمام؟" }, { ru: "gde tualét?", ja: "toire wa doko desu ka?", ko: "hwajangsiri eodiyeyo?", zh: "xǐshǒujiān zài nǎlǐ?", ar: "ayna al-ḥammām?" }),
      p("¿Dónde está la estación?", { en: "Where is the station?", fr: "Où est la gare ?", de: "Wo ist der Bahnhof?", it: "Dov'è la stazione?", pt: "Onde fica a estação?", nl: "Waar is het station?", sv: "Var är stationen?", ru: "Где вокзал?", ja: "駅はどこですか？", ko: "역이 어디예요?", zh: "车站在哪里？", ar: "أين المحطة؟" }, { ru: "gde vokzál?", ja: "eki wa doko desu ka?", ko: "yeogi eodiyeyo?", zh: "chēzhàn zài nǎlǐ?", ar: "ayna al-maḥaṭṭa?" }),
      p("A la derecha", { en: "On the right", fr: "À droite", de: "Rechts", it: "A destra", pt: "À direita", nl: "Rechts", sv: "Till höger", ru: "Направо", ja: "右に", ko: "오른쪽이에요", zh: "在右边", ar: "على اليمين" }, { ru: "naprávo", ja: "migi ni", ko: "oreunjjogieyo", zh: "zài yòubian", ar: "ʿalā al-yamīn" }),
      p("A la izquierda", { en: "On the left", fr: "À gauche", de: "Links", it: "A sinistra", pt: "À esquerda", nl: "Links", sv: "Till vänster", ru: "Налево", ja: "左に", ko: "왼쪽이에요", zh: "在左边", ar: "على اليسار" }, { ru: "nalévo", ja: "hidari ni", ko: "oenjjogieyo", zh: "zài zuǒbian", ar: "ʿalā al-yasār" }),
      p("Todo recto", { en: "Straight ahead", fr: "Tout droit", de: "Geradeaus", it: "Sempre dritto", pt: "Em frente", nl: "Rechtdoor", sv: "Rakt fram", ru: "Прямо", ja: "まっすぐ", ko: "똑바로 가세요", zh: "一直走", ar: "على طول" }, { ru: "pryámo", ja: "massugu", ko: "ttokbaro gaseyo", zh: "yìzhí zǒu", ar: "ʿalā ṭūl" }),
      p("Está cerca", { en: "It's close", fr: "C'est près", de: "Es ist nah", it: "È vicino", pt: "É perto", nl: "Het is dichtbij", sv: "Det är nära", ru: "Это близко", ja: "近いです", ko: "가까워요", zh: "很近", ar: "إنه قريب" }, { ru: "éto blízko", ja: "chikai desu", ko: "gakkawoyo", zh: "hěn jìn", ar: "innahu qarīb" }),
      p("Está lejos", { en: "It's far", fr: "C'est loin", de: "Es ist weit", it: "È lontano", pt: "É longe", nl: "Het is ver", sv: "Det är långt", ru: "Это далеко", ja: "遠いです", ko: "멀어요", zh: "很远", ar: "إنه بعيد" }, { ru: "éto dalekó", ja: "tōi desu", ko: "meoreoyo", zh: "hěn yuǎn", ar: "innahu baʿīd" }),
      p("Aquí", { en: "Here", fr: "Ici", de: "Hier", it: "Qui", pt: "Aqui", nl: "Hier", sv: "Här", ru: "Здесь", ja: "ここ", ko: "여기", zh: "这里", ar: "هنا" }, { ru: "zdes'", ja: "koko", ko: "yeogi", zh: "zhèlǐ", ar: "hunā" }),
    ],
  },
  {
    id: "family",
    emoji: "👨‍👩‍👧",
    title: "La familia",
    goal: "Hablar de tu familia y de las personas cercanas.",
    phrases: [
      p("mi madre", { en: "my mother", fr: "ma mère", de: "meine Mutter", it: "mia madre", pt: "minha mãe", nl: "mijn moeder", sv: "min mamma", ru: "моя мама", ja: "私の母", ko: "우리 엄마", zh: "我妈妈", ar: "أمي" }, { ru: "moyá máma", ja: "watashi no haha", ko: "uri eomma", zh: "wǒ māma", ar: "ummī" }),
      p("mi padre", { en: "my father", fr: "mon père", de: "mein Vater", it: "mio padre", pt: "meu pai", nl: "mijn vader", sv: "min pappa", ru: "мой папа", ja: "私の父", ko: "우리 아빠", zh: "我爸爸", ar: "أبي" }, { ru: "moy pápa", ja: "watashi no chichi", ko: "uri appa", zh: "wǒ bàba", ar: "abī" }),
      p("Tengo un hermano", { en: "I have a brother", fr: "J'ai un frère", de: "Ich habe einen Bruder", it: "Ho un fratello", pt: "Tenho um irmão", nl: "Ik heb een broer", sv: "Jag har en bror", ru: "У меня есть брат", ja: "兄弟が一人います", ko: "형제가 한 명 있어요", zh: "我有一个哥哥", ar: "عندي أخ" }, { ru: "u menyá yest' brat", ja: "kyōdai ga hitori imasu", ko: "hyeongjega han myeong isseoyo", zh: "wǒ yǒu yí ge gēge", ar: "ʿindī akh" }),
      p("Tengo una hermana", { en: "I have a sister", fr: "J'ai une sœur", de: "Ich habe eine Schwester", it: "Ho una sorella", pt: "Tenho uma irmã", nl: "Ik heb een zus", sv: "Jag har en syster", ru: "У меня есть сестра", ja: "姉妹が一人います", ko: "자매가 한 명 있어요", zh: "我有一个姐姐", ar: "عندي أخت" }, { ru: "u menyá yest' sestrá", ja: "shimai ga hitori imasu", ko: "jamaega han myeong isseoyo", zh: "wǒ yǒu yí ge jiějie", ar: "ʿindī ukht" }),
      p("Estoy casado", { en: "I'm married", fr: "Je suis marié", de: "Ich bin verheiratet", it: "Sono sposato", pt: "Sou casado", nl: "Ik ben getrouwd", sv: "Jag är gift", ru: "Я женат", ja: "結婚しています", ko: "결혼했어요", zh: "我结婚了", ar: "أنا متزوج" }, { ru: "ya zhenát", ja: "kekkon shite imasu", ko: "gyeolhonhaesseoyo", zh: "wǒ jiéhūn le", ar: "anā mutazawwij" }),
      p("Tengo dos hijos", { en: "I have two children", fr: "J'ai deux enfants", de: "Ich habe zwei Kinder", it: "Ho due figli", pt: "Tenho dois filhos", nl: "Ik heb twee kinderen", sv: "Jag har två barn", ru: "У меня двое детей", ja: "子どもが二人います", ko: "아이가 두 명 있어요", zh: "我有两个孩子", ar: "عندي طفلان" }, { ru: "u menyá dvóye detéy", ja: "kodomo ga futari imasu", ko: "aiga du myeong isseoyo", zh: "wǒ yǒu liǎng ge háizi", ar: "ʿindī ṭiflān" }),
      p("Este es mi amigo", { en: "This is my friend", fr: "C'est mon ami", de: "Das ist mein Freund", it: "Questo è il mio amico", pt: "Este é o meu amigo", nl: "Dit is mijn vriend", sv: "Det här är min vän", ru: "Это мой друг", ja: "こちらは私の友だちです", ko: "이쪽은 제 친구예요", zh: "这是我的朋友", ar: "هذا صديقي" }, { ru: "éto moy drug", ja: "kochira wa watashi no tomodachi desu", ko: "ijjogeun je chinguyeyo", zh: "zhè shì wǒ de péngyou", ar: "hādhā ṣadīqī" }),
      p("Vivo con mi familia", { en: "I live with my family", fr: "J'habite avec ma famille", de: "Ich wohne mit meiner Familie", it: "Vivo con la mia famiglia", pt: "Moro com a minha família", nl: "Ik woon bij mijn familie", sv: "Jag bor med min familj", ru: "Я живу с семьёй", ja: "家族と住んでいます", ko: "가족과 같이 살아요", zh: "我和家人一起住", ar: "أعيش مع عائلتي" }, { ru: "ya zhivú s sem'yój", ja: "kazoku to sunde imasu", ko: "gajokgwa gachi sarayo", zh: "wǒ hé jiārén yìqǐ zhù", ar: "aʿīsh maʿa ʿāʾilatī" }),
    ],
  },
  {
    id: "shopping",
    emoji: "🛒",
    title: "Comida y compras",
    goal: "Comprar en una tienda o un mercado.",
    phrases: [
      p("Quiero esto", { en: "I want this", fr: "Je voudrais ça", de: "Ich möchte das", it: "Vorrei questo", pt: "Quero isto", nl: "Ik wil dit graag", sv: "Jag vill ha den här", ru: "Я хочу это", ja: "これをください", ko: "이거 주세요", zh: "我要这个", ar: "أريد هذا" }, { ru: "ya khochú éto", ja: "kore o kudasai", ko: "igeo juseyo", zh: "wǒ yào zhège", ar: "urīd hādhā" }),
      p("¿Tiene pan?", { en: "Do you have bread?", fr: "Vous avez du pain ?", de: "Haben Sie Brot?", it: "Avete del pane?", pt: "Tem pão?", nl: "Heeft u brood?", sv: "Har ni bröd?", ru: "У вас есть хлеб?", ja: "パンはありますか？", ko: "빵 있어요?", zh: "有面包吗？", ar: "هل عندكم خبز؟" }, { ru: "u vas yest' khleb?", ja: "pan wa arimasu ka?", ko: "ppang isseoyo?", zh: "yǒu miànbāo ma?", ar: "hal ʿindakum khubz?" }),
      p("Es muy caro", { en: "It's very expensive", fr: "C'est très cher", de: "Das ist sehr teuer", it: "È molto caro", pt: "É muito caro", nl: "Het is erg duur", sv: "Det är väldigt dyrt", ru: "Это очень дорого", ja: "とても高いです", ko: "너무 비싸요", zh: "太贵了", ar: "هذا غالٍ جدا" }, { ru: "éto óchen' dórogo", ja: "totemo takai desu", ko: "neomu bissayo", zh: "tài guì le", ar: "hādhā ghālin jiddan" }),
      p("Un kilo de manzanas", { en: "A kilo of apples", fr: "Un kilo de pommes", de: "Ein Kilo Äpfel", it: "Un chilo di mele", pt: "Um quilo de maçãs", nl: "Een kilo appels", sv: "Ett kilo äpplen", ru: "Килограмм яблок", ja: "りんごを一キロ", ko: "사과 일 킬로", zh: "一公斤苹果", ar: "كيلو تفاح" }, { ru: "kilográmm yáblok", ja: "ringo o ichi kiro", ko: "sagwa il killo", zh: "yì gōngjīn píngguǒ", ar: "kīlū tuffāḥ" }),
      p("Tengo hambre", { en: "I'm hungry", fr: "J'ai faim", de: "Ich habe Hunger", it: "Ho fame", pt: "Estou com fome", nl: "Ik heb honger", sv: "Jag är hungrig", ru: "Я голоден", ja: "お腹がすきました", ko: "배고파요", zh: "我饿了", ar: "أنا جائع" }, { ru: "ya góloden", ja: "onaka ga sukimashita", ko: "baegopayo", zh: "wǒ è le", ar: "anā jāʾiʿ" }),
      p("Tengo sed", { en: "I'm thirsty", fr: "J'ai soif", de: "Ich habe Durst", it: "Ho sete", pt: "Estou com sede", nl: "Ik heb dorst", sv: "Jag är törstig", ru: "Я хочу пить", ja: "喉が渇きました", ko: "목말라요", zh: "我渴了", ar: "أنا عطشان" }, { ru: "ya khochú pit'", ja: "nodo ga kawakimashita", ko: "mongmallayo", zh: "wǒ kě le", ar: "anā ʿaṭshān" }),
      p("Una bolsa, por favor", { en: "A bag, please", fr: "Un sac, s'il vous plaît", de: "Eine Tüte, bitte", it: "Una busta, per favore", pt: "Um saco, por favor", nl: "Een tas, alstublieft", sv: "En påse, tack", ru: "Пакет, пожалуйста", ja: "袋をお願いします", ko: "봉투 주세요", zh: "请给我一个袋子", ar: "كيس من فضلك" }, { ru: "pakét, pozhálusta", ja: "fukuro o onegai shimasu", ko: "bongtu juseyo", zh: "qǐng gěi wǒ yí ge dàizi", ar: "kīs min faḍlak" }),
      p("¿Aceptan tarjeta?", { en: "Do you take cards?", fr: "Vous acceptez la carte ?", de: "Kann ich mit Karte zahlen?", it: "Accettate la carta?", pt: "Aceitam cartão?", nl: "Kan ik pinnen?", sv: "Tar ni kort?", ru: "Можно картой?", ja: "カードは使えますか？", ko: "카드 되나요?", zh: "可以刷卡吗？", ar: "هل تقبلون البطاقة؟" }, { ru: "mózhno kártoy?", ja: "kādo wa tsukaemasu ka?", ko: "kadeu doenayo?", zh: "kěyǐ shuā kǎ ma?", ar: "hal taqbalūn al-biṭāqa?" }),
    ],
  },
  {
    id: "time",
    emoji: "📅",
    title: "Días y horas",
    goal: "Hablar de hoy, mañana y a qué hora.",
    phrases: [
      p("hoy", { en: "today", fr: "aujourd'hui", de: "heute", it: "oggi", pt: "hoje", nl: "vandaag", sv: "idag", ru: "сегодня", ja: "今日", ko: "오늘", zh: "今天", ar: "اليوم" }, { ru: "sevódnya", ja: "kyō", ko: "oneul", zh: "jīntiān", ar: "al-yawm" }),
      p("mañana", { en: "tomorrow", fr: "demain", de: "morgen", it: "domani", pt: "amanhã", nl: "morgen", sv: "imorgon", ru: "завтра", ja: "明日", ko: "내일", zh: "明天", ar: "غدا" }, { ru: "závtra", ja: "ashita", ko: "naeil", zh: "míngtiān", ar: "ghadan" }),
      p("ayer", { en: "yesterday", fr: "hier", de: "gestern", it: "ieri", pt: "ontem", nl: "gisteren", sv: "igår", ru: "вчера", ja: "昨日", ko: "어제", zh: "昨天", ar: "أمس" }, { ru: "vcherá", ja: "kinō", ko: "eoje", zh: "zuótiān", ar: "ams" }),
      p("¿Qué hora es?", { en: "What time is it?", fr: "Quelle heure est-il ?", de: "Wie spät ist es?", it: "Che ore sono?", pt: "Que horas são?", nl: "Hoe laat is het?", sv: "Vad är klockan?", ru: "Который час?", ja: "今何時ですか？", ko: "지금 몇 시예요?", zh: "现在几点？", ar: "كم الساعة؟" }, { ru: "kotóryy chas?", ja: "ima nanji desu ka?", ko: "jigeum myeot siyeyo?", zh: "xiànzài jǐ diǎn?", ar: "kam as-sāʿa?" }),
      p("Son las tres", { en: "It's three o'clock", fr: "Il est trois heures", de: "Es ist drei Uhr", it: "Sono le tre", pt: "São três horas", nl: "Het is drie uur", sv: "Klockan är tre", ru: "Три часа", ja: "三時です", ko: "세 시예요", zh: "三点了", ar: "الساعة الثالثة" }, { ru: "tri chasá", ja: "sanji desu", ko: "se siyeyo", zh: "sān diǎn le", ar: "as-sāʿa ath-thālitha" }),
      p("el lunes", { en: "on Monday", fr: "lundi", de: "am Montag", it: "lunedì", pt: "na segunda-feira", nl: "op maandag", sv: "på måndag", ru: "в понедельник", ja: "月曜日に", ko: "월요일에", zh: "星期一", ar: "يوم الاثنين" }, { ru: "v ponedél'nik", ja: "getsuyōbi ni", ko: "woryoire", zh: "xīngqīyī", ar: "yawm al-ithnayn" }),
      p("el fin de semana", { en: "the weekend", fr: "le week-end", de: "das Wochenende", it: "il fine settimana", pt: "o fim de semana", nl: "het weekend", sv: "helgen", ru: "выходные", ja: "週末", ko: "주말", zh: "周末", ar: "عطلة نهاية الأسبوع" }, { ru: "vykhodnýye", ja: "shūmatsu", ko: "jumal", zh: "zhōumò", ar: "ʿuṭlat nihāyat al-usbūʿ" }),
      p("Hasta mañana", { en: "See you tomorrow", fr: "À demain", de: "Bis morgen", it: "A domani", pt: "Até amanhã", nl: "Tot morgen", sv: "Vi ses imorgon", ru: "До завтра", ja: "また明日", ko: "내일 봐요", zh: "明天见", ar: "إلى الغد" }, { ru: "do závtra", ja: "mata ashita", ko: "naeil bwayo", zh: "míngtiān jiàn", ar: "ilā al-ghad" }),
    ],
  },
  {
    id: "emergency",
    emoji: "🚑",
    title: "Emergencias",
    goal: "Pedir ayuda si algo va mal.",
    phrases: [
      p("¡Ayuda!", { en: "Help!", fr: "Au secours !", de: "Hilfe!", it: "Aiuto!", pt: "Socorro!", nl: "Help!", sv: "Hjälp!", ru: "Помогите!", ja: "助けて！", ko: "도와주세요!", zh: "救命！", ar: "النجدة!" }, { ru: "pomogíte!", ja: "tasukete!", ko: "dowajuseyo!", zh: "jiùmìng!", ar: "an-najda!" }),
      p("Necesito un médico", { en: "I need a doctor", fr: "J'ai besoin d'un médecin", de: "Ich brauche einen Arzt", it: "Ho bisogno di un medico", pt: "Preciso de um médico", nl: "Ik heb een dokter nodig", sv: "Jag behöver en läkare", ru: "Мне нужен врач", ja: "医者が必要です", ko: "의사가 필요해요", zh: "我需要医生", ar: "أحتاج إلى طبيب" }, { ru: "mne núzhen vrach", ja: "isha ga hitsuyō desu", ko: "uisaga piryohaeyo", zh: "wǒ xūyào yīshēng", ar: "aḥtāj ilā ṭabīb" }),
      p("Llame a la policía", { en: "Call the police", fr: "Appelez la police", de: "Rufen Sie die Polizei", it: "Chiami la polizia", pt: "Chame a polícia", nl: "Bel de politie", sv: "Ring polisen", ru: "Вызовите полицию", ja: "警察を呼んでください", ko: "경찰을 불러 주세요", zh: "请叫警察", ar: "اتصل بالشرطة" }, { ru: "vyzovite polítsiyu", ja: "keisatsu o yonde kudasai", ko: "gyeongchareul bulleo juseyo", zh: "qǐng jiào jǐngchá", ar: "ittaṣil bi-sh-shurṭa" }),
      p("Me duele aquí", { en: "It hurts here", fr: "J'ai mal ici", de: "Es tut hier weh", it: "Mi fa male qui", pt: "Dói aqui", nl: "Het doet hier pijn", sv: "Det gör ont här", ru: "У меня болит здесь", ja: "ここが痛いです", ko: "여기가 아파요", zh: "这里疼", ar: "يؤلمني هنا" }, { ru: "u menyá bolít zdes'", ja: "koko ga itai desu", ko: "yeogiga apayo", zh: "zhèlǐ téng", ar: "yuʾlimunī hunā" }),
      p("Estoy perdido", { en: "I'm lost", fr: "Je suis perdu", de: "Ich habe mich verlaufen", it: "Mi sono perso", pt: "Estou perdido", nl: "Ik ben verdwaald", sv: "Jag har gått vilse", ru: "Я заблудился", ja: "道に迷いました", ko: "길을 잃었어요", zh: "我迷路了", ar: "أنا تائه" }, { ru: "ya zabludílsya", ja: "michi ni mayoimashita", ko: "gireul ireosseoyo", zh: "wǒ mílù le", ar: "anā tāʾih" }),
      p("¿Dónde está el hospital?", { en: "Where is the hospital?", fr: "Où est l'hôpital ?", de: "Wo ist das Krankenhaus?", it: "Dov'è l'ospedale?", pt: "Onde fica o hospital?", nl: "Waar is het ziekenhuis?", sv: "Var är sjukhuset?", ru: "Где больница?", ja: "病院はどこですか？", ko: "병원이 어디예요?", zh: "医院在哪里？", ar: "أين المستشفى؟" }, { ru: "gde bol'nítsa?", ja: "byōin wa doko desu ka?", ko: "byeongwoni eodiyeyo?", zh: "yīyuàn zài nǎlǐ?", ar: "ayna al-mustashfā?" }),
      p("Perdí mi pasaporte", { en: "I lost my passport", fr: "J'ai perdu mon passeport", de: "Ich habe meinen Pass verloren", it: "Ho perso il passaporto", pt: "Perdi o meu passaporte", nl: "Ik ben mijn paspoort kwijt", sv: "Jag har tappat mitt pass", ru: "Я потерял паспорт", ja: "パスポートをなくしました", ko: "여권을 잃어버렸어요", zh: "我的护照丢了", ar: "فقدت جواز سفري" }, { ru: "ya poteryál pásport", ja: "pasupōto o nakushimashita", ko: "yeogwoneul ireobeoryeosseoyo", zh: "wǒ de hùzhào diū le", ar: "faqadtu jawāz safarī" }),
      p("Es urgente", { en: "It's urgent", fr: "C'est urgent", de: "Es ist dringend", it: "È urgente", pt: "É urgente", nl: "Het is dringend", sv: "Det är bråttom", ru: "Это срочно", ja: "緊急です", ko: "급해요", zh: "很紧急", ar: "إنه أمر عاجل" }, { ru: "éto sróchno", ja: "kinkyū desu", ko: "geuphaeyo", zh: "hěn jǐnjí", ar: "innahu amr ʿājil" }),
    ],
  },
];

/** Frases de una unidad en el idioma objetivo (vacío si el idioma no está cubierto). */
export function unitPhrases(unit: FirstUnit, lang: LanguageCode): { es: string; text: string; roman?: string }[] {
  return unit.phrases
    .map((ph) => ({ es: ph.es, text: ph.t[lang as keyof Tr], roman: ph.r?.[lang as keyof Rom] }))
    .filter((x) => Boolean(x.text));
}

export function hasFirstSteps(lang: LanguageCode): boolean {
  return FIRST_STEPS.every((u) => unitPhrases(u, lang).length === u.phrases.length);
}
