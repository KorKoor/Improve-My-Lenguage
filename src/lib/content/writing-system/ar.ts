// Revisión nativa: pendiente
import { N, scriptTyping, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const AR_WRITING: WritingSystem = {
  alphabetNote: "28 letras en el orden hiŷāʼī (el de los diccionarios modernos). Se deletrea diciendo el nombre de cada letra.",
  spelling: true,
  alphabet: [
    N("ا", "alif", "ألف"), N("ب", "bāʼ", "باء"), N("ت", "tāʼ", "تاء"), N("ث", "thāʼ", "ثاء"), N("ج", "ŷīm", "جيم"), N("ح", "ḥāʼ", "حاء"),
    N("خ", "jāʼ", "خاء"), N("د", "dāl", "دال"), N("ذ", "dhāl", "ذال"), N("ر", "rāʼ", "راء"), N("ز", "zāy", "زاي"), N("س", "sīn", "سين"),
    N("ش", "shīn", "شين"), N("ص", "ṣād", "صاد"), N("ض", "ḍād", "ضاد"), N("ط", "ṭāʼ", "طاء"), N("ظ", "ẓāʼ", "ظاء"), N("ع", "ʻayn", "عين"),
    N("غ", "gayn", "غين"), N("ف", "fāʼ", "فاء"), N("ق", "qāf", "قاف"), N("ك", "kāf", "كاف"), N("ل", "lām", "لام"), N("م", "mīm", "ميم"),
    N("ن", "nūn", "نون"), N("ه", "hāʼ", "هاء"), N("و", "wāw", "واو"), N("ي", "yāʼ", "ياء"),
  ],
  signs: [
    SG("َ ِ ُ", "vocales cortas (ḥarakāt)", "fatḥa (a), kasra (i), ḍamma (u). Sólo en el Corán, libros infantiles y para aprender.", "كَتَبَ", "escribió"),
    SG("ْ", "sukūn", "Circulito: la consonante no lleva vocal.", "بِنْت", "chica"),
    SG("ّ", "shadda", "La consonante se dobla.", "سُكَّر", "azúcar"),
    SG("ً ٍ ٌ", "tanwīn", "Vocal doble al final: -an, -in, -un (indeterminado). Muy frecuente: شكرًا (shukran).", "شكرًا", "gracias"),
    SG("ء أ إ ؤ ئ آ", "hamza y madda", "Corte de voz; sobre alif, waw o ya según las vocales. آ = ʼā (alif con madda).", "سؤال", "pregunta"),
    SG("، ؛ ؟", "puntuación árabe", "Coma, punto y coma e interrogación van giradas: ¿كيف حالك؟", "كيف حالك؟", "¿Cómo estás?"),
    SG("٠١٢٣٤٥٦٧٨٩", "cifras arábigo-orientales", "En muchos países se usan estas cifras (se leen de izquierda a derecha, como las nuestras).", "٢٠٢٦", "2026"),
  ],
  typing: scriptTyping("árabe", "El texto se escribe de derecha a izquierda; los números, de izquierda a derecha."),
  units: [
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "Signos: vocales cortas, shadda y tanwīn",
      rules: [
        R("tanwin", "El tanwīn: -an, -in, -un", "Dos rayitas encima (ً) = -an. Suele ir sobre una alif al final: شكرًا (shukran), أهلًا (ahlan).", [["شكرًا", "shukran", "gracias"], ["أهلًا", "ahlan", "hola"]], { q: "¿Cómo acaba «شكرًا» al leerlo?", options: ["-an", "-a", "-un"], answer: "-an", lang: "es" }),
        R("harakat-when", "¿Cuándo se escriben las vocales cortas?", "En textos normales, nunca. Aparecen en el Corán, en libros para niños y para aprender. Por eso la app las muestra al principio y luego las retira.", [["كتب", "kataba / kutub", "escribió / libros"], ["كَتَبَ", "kataba", "escribió"]], { q: "En un periódico árabe, ¿se escriben las vocales cortas?", options: ["No, casi nunca", "Sí, siempre"], answer: "No, casi nunca", lang: "es" }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Puntuación y números",
      rules: [
        R("marks", "، y ؟ están giradas", "La coma (،) y la interrogación (؟) se escriben al revés que en español porque el texto va de derecha a izquierda.", [["من أنت؟", "man anta?", "¿Quién eres?"]], { q: "¿Cuál es la interrogación árabe?", options: ["؟", "?", "¿"], answer: "؟", lang: "target" }),
        R("digits", "Dos juegos de cifras", "En el Magreb se usan 0-9; en Oriente Medio, ٠١٢٣٤٥٦٧٨٩. Ambas se escriben de izquierda a derecha dentro del texto.", [["٣", "3", "tres"], ["١٠", "10", "diez"]], { q: "¿Qué número es ٥?", options: ["5", "0", "8"], answer: "5", lang: "es" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Hamza, ta marbuta y alif final",
      rules: [
        R("hamza-seat", "¿Sobre qué letra va la hamza?", "Al principio de palabra, sobre alif: أ (con a, u) o إ (con i). En medio, depende de las vocales: سؤال (sobre waw), بئر (sobre ya).", [["أنا", "anā", "yo"], ["إسبانيا", "isbāniyā", "España"]], { q: "¿Cómo empieza «إسبانيا» (España)?", options: ["إ", "أ", "ا"], answer: "إ", lang: "target", why: "La vocal es i: la hamza va debajo de la alif." }),
        R("ta-marbuta-ha", "ة o ه al final", "ة (con dos puntos) es la ta marbuta: suena «a» y se vuelve «at» al unirse. ه es una h: وجه (cara).", [["مدرسة", "madrasa", "escuela"], ["وجه", "waŷh", "cara"]], { q: "¿Cómo se escribe «escuela»?", options: ["مدرسة", "مدرسه"], answer: "مدرسة", lang: "target" }),
      ],
    },
  ],
};
