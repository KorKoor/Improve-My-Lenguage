import { wordsFor } from "../pack";
import type { GrammarConcept, VocabItem } from "../types";

/**
 * Alemán estándar. Los sustantivos se enseñan con su artículo (der/die/das)
 * en la nota y en los ejemplos: el género no se deduce, se memoriza.
 * Paquete inicial en beta: revisión humana recomendada antes de ampliar.
 */
const v = wordsFor("de");

export const DE_VOCAB: VocabItem[] = [
  v("hallo", "hallo", "interjection", "A1", 1, "/haˈloː/", ["hola"], [["Hallo, wie geht's?", "Hola, ¿qué tal?"]], ["everyday"]),
  v("danke", "danke", "interjection", "A1", 1, "/ˈdaŋkə/", ["gracias"], [["Danke für deine Hilfe!", "¡Gracias por tu ayuda!"]], ["everyday"]),
  v("bitte", "bitte", "interjection", "A1", 1, "/ˈbɪtə/", ["por favor", "de nada"], [["Ein Wasser, bitte.", "Un agua, por favor."]], ["everyday"], "También responde a «danke»: Bitte! = ¡De nada!"),
  v("haus", "Haus", "noun", "A1", 1, "/haʊ̯s/", ["casa"], [["Das Haus ist sehr alt.", "La casa es muy vieja."]], ["everyday"], "Neutro: das Haus, plural die Häuser."),
  v("wasser", "Wasser", "noun", "A1", 1, "/ˈvasɐ/", ["agua"], [["Ich trinke viel Wasser.", "Bebo mucha agua."]], ["everyday", "food"], "Neutro: das Wasser."),
  v("freund", "Freund", "noun", "A1", 1, "/fʁɔʏ̯nt/", ["amigo", "novio"], [["Mein Freund wohnt in Berlin.", "Mi amigo vive en Berlín."]], ["everyday"], "Masculino: der Freund. Femenino: die Freundin. «mein Freund» puede significar «mi novio»."),
  v("arbeiten", "arbeiten", "verb", "A1", 1, "/ˈaʁbaɪ̯tn̩/", ["trabajar"], [["Ich arbeite von zu Hause.", "Trabajo desde casa."]], ["work"]),
  v("essen", "essen", "verb", "A1", 1, "/ˈɛsn̩/", ["comer"], [["Wir essen heute im Restaurant.", "Hoy comemos en el restaurante."]], ["food"], "Irregular: du isst, er isst."),
  v("sprechen", "sprechen", "verb", "A1", 1, "/ˈʃpʁɛçn̩/", ["hablar"], [["Sprichst du Deutsch?", "¿Hablas alemán?"]], ["everyday"], "Irregular: du sprichst, er spricht."),
  v("gluecklich", "glücklich", "adjective", "A1", 2, "/ˈɡlʏklɪç/", ["feliz"], [["Sie ist heute sehr glücklich.", "Ella está muy feliz hoy."]], ["feelings"], undefined, ["gluecklich"]),
  v("muede", "müde", "adjective", "A1", 2, "/ˈmyːdə/", ["cansado"], [["Ich bin heute Abend müde.", "Esta noche estoy cansado."]], ["feelings"], undefined, ["muede"]),
  v("morgen-noun", "Morgen", "noun", "A1", 1, "/ˈmɔʁɡn̩/", ["mañana (parte del día)"], [["Am Morgen trinke ich Kaffee.", "Por la mañana tomo café."]], ["everyday"], "der Morgen = la mañana. «morgen» (minúscula) = mañana, el día siguiente."),
  v("kaufen", "kaufen", "verb", "A1", 1, "/ˈkaʊ̯fn̩/", ["comprar"], [["Ich muss Brot kaufen.", "Tengo que comprar pan."]], ["everyday"]),
  v("immer", "immer", "adverb", "A1", 1, "/ˈɪmɐ/", ["siempre"], [["Er kommt immer pünktlich.", "Él siempre llega puntual."]], ["everyday"]),
  v("weil", "weil", "conjunction", "A1", 1, "/vaɪ̯l/", ["porque"], [["Ich bin froh, weil du hier bist.", "Estoy contento porque estás aquí."]], ["connectors"], "¡El verbo va al final! …weil du hier bist."),
  v("teuer", "teuer", "adjective", "A1", 2, "/ˈtɔʏ̯ɐ/", ["caro"], [["Das Handy ist zu teuer.", "El celular es demasiado caro."]], ["everyday"]),
  v("fruehstueck", "Frühstück", "noun", "A1", 2, "/ˈfʁyːʃtʏk/", ["desayuno"], [["Das Frühstück ist fertig.", "El desayuno está listo."]], ["food"], "Neutro: das Frühstück.", ["Fruehstueck"]),
  v("viel", "viel", "adverb", "A1", 1, "/fiːl/", ["mucho"], [["Vielen Dank!", "¡Muchas gracias!"]], ["everyday"]),
  v("auch", "auch", "adverb", "A1", 1, "/aʊ̯x/", ["también"], [["Ich mag auch Musik.", "A mí también me gusta la música."]], ["everyday"]),
  v("helfen", "helfen", "verb", "A1", 1, "/ˈhɛlfn̩/", ["ayudar"], [["Kannst du mir helfen?", "¿Me puedes ayudar?"]], ["everyday"], "Va con dativo: mir, dir, ihm."),
  v("vergessen", "vergessen", "verb", "A2", 1, "/fɛɐ̯ˈɡɛsn̩/", ["olvidar"], [["Vergiss die Schlüssel nicht!", "¡No olvides las llaves!"]], ["everyday"]),
  v("zeit", "Zeit", "noun", "A2", 1, "/t͡saɪ̯t/", ["tiempo"], [["Ich habe jetzt keine Zeit.", "Ahora no tengo tiempo."]], ["everyday"], "Femenino: die Zeit. El clima es «das Wetter»."),
  v("reise", "Reise", "noun", "A2", 2, "/ˈʁaɪ̯zə/", ["viaje"], [["Die Reise hat sechs Stunden gedauert.", "El viaje duró seis horas."]], ["travel"], "Femenino: die Reise."),
  v("besprechung", "Besprechung", "noun", "A2", 2, "/bəˈʃpʁɛçʊŋ/", ["reunión", "junta"], [["Die Besprechung beginnt um zehn.", "La reunión empieza a las diez."]], ["work"], "Femenino: die Besprechung. Las palabras en -ung son femeninas."),
  v("warten", "warten", "verb", "A2", 1, "/ˈvaʁtn̩/", ["esperar"], [["Ich warte auf den Bus.", "Espero el autobús."]], ["everyday"], "Se construye con «auf»: warten auf + acusativo."),
  v("verstehen", "verstehen", "verb", "A2", 1, "/fɛɐ̯ˈʃteːən/", ["entender"], [["Ich habe die Frage nicht verstanden.", "No entendí la pregunta."]], ["everyday"]),
  v("computer", "Computer", "noun", "A2", 2, "/kɔmˈpjuːtɐ/", ["computadora"], [["Mein Computer ist sehr langsam.", "Mi computadora es muy lenta."]], ["tech"], "Masculino: der Computer."),
  v("spiel", "Spiel", "noun", "A2", 2, "/ʃpiːl/", ["juego", "partido"], [["Das Spiel ist super.", "El juego es genial."]], ["gaming"], "Neutro: das Spiel. Videojuego: das Videospiel."),
  v("handy", "Handy", "noun", "A2", 2, "/ˈhɛndi/", ["celular", "móvil"], [["Mein Handy ist kaputt.", "Mi celular está roto."]], ["tech"], "Neutro: das Handy. Parece inglés, pero en inglés no se usa así."),
  v("zug", "Zug", "noun", "A2", 2, "/t͡suːk/", ["tren"], [["Der Zug fährt um acht Uhr ab.", "El tren sale a las ocho."]], ["travel"], "Masculino: der Zug."),
  v("bus", "Bus", "noun", "A2", 2, "/bʊs/", ["autobús"], [["Wir nehmen den Bus.", "Tomamos el autobús."]], ["travel"], "Masculino: der Bus (acusativo: den Bus)."),
  v("verbessern", "verbessern", "verb", "B1", 2, "/fɛɐ̯ˈbɛsɐn/", ["mejorar"], [["Ich möchte mein Deutsch verbessern.", "Quiero mejorar mi alemán."]], ["everyday"]),
  v("trotzdem", "trotzdem", "adverb", "B1", 2, "/ˈtʁɔt͡sdeːm/", ["aun así", "sin embargo"], [["Es regnet. Trotzdem gehen wir spazieren.", "Llueve. Aun así salimos a pasear."]], ["connectors"], "Después de «trotzdem» va el verbo: Trotzdem gehen wir…"),
  v("obwohl", "obwohl", "conjunction", "B1", 2, "/ɔpˈvoːl/", ["aunque"], [["Obwohl es schwer ist, mache ich weiter.", "Aunque es difícil, sigo adelante."]], ["connectors"], "Como «weil», manda el verbo al final."),
  v("eventuell", "eventuell", "adverb", "B1", 3, "/evɛnˈtu̯ɛl/", ["quizás", "posiblemente"], [["Ich komme eventuell später.", "Quizás llegue más tarde."]], ["false-friends"], "Falso amigo: no es «eventualmente/finalmente» sino «posiblemente»."),
  v("herunterladen", "herunterladen", "verb", "B1", 3, "/hɛˈʁʊntɐˌlaːdn̩/", ["descargar"], [["Ich lade die App herunter.", "Descargo la app."]], ["tech"], "Verbo separable: ich lade … herunter."),
];

export const DE_GRAMMAR: GrammarConcept[] = [
  {
    id: "de:g:articles-cases",
    language: "de",
    title: "der, die, das — y el acusativo (den)",
    cefr: "A1",
    errorCategory: "de:articles-cases",
    summary:
      "Cada sustantivo alemán tiene género: masculino (der), femenino (die) o neutro (das). Además, el artículo cambia según la función: el objeto directo masculino pasa de «der» a «den».",
    whenToUse: ["Nominativo (sujeto): der Mann, die Frau, das Kind.", "Acusativo (objeto directo): sólo cambia el masculino: den Mann, einen Mann."],
    formation: [
      "Nominativo: der · die · das · plural die.",
      "Acusativo: den · die · das · plural die.",
      "Indefinido: ein · eine · ein → acusativo: einen · eine · ein.",
      "Pistas de género: -ung, -heit, -keit → die; -chen → das.",
    ],
    commonMistakes: [
      { wrong: "Ich sehe der Mann.", right: "Ich sehe den Mann.", why: "Objeto directo masculino → den." },
      { wrong: "Ich habe ein Hund.", right: "Ich habe einen Hund.", why: "Hund es masculino; en acusativo: einen." },
    ],
    examples: [
      { text: "Der Kaffee ist heiß.", translation: { es: "El café está caliente." } },
      { text: "Ich trinke den Kaffee.", translation: { es: "Me tomo el café." } },
    ],
    contrasts: [{ a: "Der Hund schläft. (sujeto)", b: "Ich sehe den Hund. (objeto)", explanation: "Sólo el masculino cambia en acusativo." }],
    exercises: [
      { type: "mc", prompt: "___ Zeitung liegt auf dem Tisch.", options: ["Der", "Die", "Das", "Den"], answers: ["Die"], explanation: "Zeitung (-ung) es femenino: die." },
      { type: "mc", prompt: "Ich kaufe ___ Computer.", options: ["der", "den", "das", "dem"], answers: ["den"], explanation: "der Computer → acusativo: den Computer." },
      { type: "mc", prompt: "Hast du ___ Bruder?", options: ["ein", "eine", "einen", "einem"], answers: ["einen"], explanation: "Bruder es masculino; en acusativo: einen." },
      { type: "fill", prompt: "___ Mädchen spielt im Park.", answers: ["Das"], explanation: "-chen → neutro: das Mädchen." },
      { type: "correct", prompt: "Ich sehe der Bus.", answers: ["Ich sehe den Bus."], explanation: "der Bus → acusativo: den Bus." },
    ],
  },
  {
    id: "de:g:word-order",
    language: "de",
    title: "Orden de palabras: el verbo en 2.ª posición (y al final con «weil»)",
    cefr: "A2",
    errorCategory: "de:word-order",
    summary:
      "En la oración principal alemana el verbo conjugado va siempre en segunda posición, aunque la frase empiece por otra cosa. En subordinadas con weil, dass, obwohl… el verbo se va al final.",
    whenToUse: ["Oración principal: Heute gehe ich ins Kino (no «Heute ich gehe»).", "Subordinada: …, weil ich müde bin."],
    formation: [
      "Posición 1: sujeto, tiempo o lugar · Posición 2: verbo conjugado · luego el resto.",
      "Con dos verbos, el segundo va al final: Ich möchte heute Pizza essen.",
      "weil / dass / obwohl / wenn → verbo conjugado al final.",
    ],
    commonMistakes: [
      { wrong: "Heute ich gehe ins Kino.", right: "Heute gehe ich ins Kino.", why: "El verbo debe ir en 2.ª posición." },
      { wrong: "…, weil ich bin müde.", right: "…, weil ich müde bin.", why: "Con weil el verbo va al final." },
    ],
    examples: [
      { text: "Morgen fahre ich nach München.", translation: { es: "Mañana viajo a Múnich." } },
      { text: "Ich bleibe zu Hause, weil ich krank bin.", translation: { es: "Me quedo en casa porque estoy enfermo." } },
    ],
    contrasts: [{ a: "Ich bin müde. (principal)", b: "…, weil ich müde bin. (subordinada)", explanation: "Mismo contenido, distinta posición del verbo." }],
    exercises: [
      { type: "mc", prompt: "Heute ___ ich Pizza.", options: ["esse", "essen", "isst", "gegessen"], answers: ["esse"], explanation: "Verbo conjugado en 2.ª posición: Heute esse ich…" },
      { type: "mc", prompt: "Ich lerne Deutsch, weil ich in Berlin ___.", options: ["arbeite", "arbeiten", "arbeitet", "arbeite ich"], answers: ["arbeite"], explanation: "Con weil el verbo va al final: …weil ich in Berlin arbeite." },
      { type: "correct", prompt: "Morgen ich fahre nach Wien.", answers: ["Morgen fahre ich nach Wien."], explanation: "Verbo en 2.ª posición." },
      { type: "correct", prompt: "Ich bleibe hier, weil ich bin müde.", answers: ["Ich bleibe hier, weil ich müde bin."], explanation: "Subordinada con weil: verbo al final." },
    ],
  },
];
