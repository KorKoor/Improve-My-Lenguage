import type { CefrLevel, GrammarConcept, PartOfSpeech, VocabItem } from "../types";

type Ex = [text: string, es: string];

function v(
  slug: string,
  lemma: string,
  pos: PartOfSpeech,
  cefr: CefrLevel,
  frequencyBand: VocabItem["frequencyBand"],
  ipa: string,
  es: string[],
  examples: Ex[],
  topics: string[],
  usageNote?: string,
): VocabItem {
  return {
    id: `fr:w:${slug}`,
    language: "fr",
    lemma,
    pos,
    cefr,
    frequencyBand,
    ipa,
    translations: { es },
    examples: examples.map(([text, t]) => ({ text, translation: { es: t } })),
    topics,
    register: "neutral",
    usageNote,
  };
}

export const FR_VOCAB: VocabItem[] = [
  v("bonjour", "bonjour", "interjection", "A1", 1, "/bɔ̃.ʒuʁ/", ["hola", "buenos días"], [["Bonjour, comment allez-vous ?", "Hola, ¿cómo está usted?"]], ["everyday"]),
  v("merci", "merci", "interjection", "A1", 1, "/mɛʁ.si/", ["gracias"], [["Merci pour ton aide.", "Gracias por tu ayuda."]], ["everyday"]),
  v("maison", "maison", "noun", "A1", 1, "/mɛ.zɔ̃/", ["casa"], [["J'habite dans une petite maison.", "Vivo en una casa pequeña."]], ["everyday"], "Femenino: la maison, une maison."),
  v("eau", "eau", "noun", "A1", 1, "/o/", ["agua"], [["Je voudrais un verre d'eau, s'il vous plaît.", "Quisiera un vaso de agua, por favor."]], ["everyday", "food"], "Femenino: l'eau (la eau → l'eau por elisión)."),
  v("ami", "ami", "noun", "A1", 1, "/a.mi/", ["amigo"], [["Mon ami habite à Lyon.", "Mi amigo vive en Lyon."]], ["everyday"], "Femenino: amie (se pronuncia igual)."),
  v("travailler", "travailler", "verb", "A1", 1, "/tʁa.va.je/", ["trabajar"], [["Je vais travailler demain.", "Voy a trabajar mañana."]], ["work"]),
  v("manger", "manger", "verb", "A1", 1, "/mɑ̃.ʒe/", ["comer"], [["Nous allons manger au restaurant.", "Vamos a comer en el restaurante."]], ["food"]),
  v("heureux", "heureux", "adjective", "A1", 2, "/œ.ʁø/", ["feliz"], [["Il est très heureux aujourd'hui.", "Hoy está muy feliz."]], ["feelings"], "Femenino: heureuse."),
  v("fatigue", "fatigué", "adjective", "A1", 2, "/fa.ti.ɡe/", ["cansado"], [["Je suis fatigué ce soir.", "Estoy cansado esta noche."]], ["feelings"]),
  v("matin", "matin", "noun", "A1", 1, "/ma.tɛ̃/", ["mañana (parte del día)"], [["Je bois du café le matin.", "Tomo café por la mañana."]], ["everyday"], "'demain' = mañana (el día siguiente)."),
  v("acheter", "acheter", "verb", "A1", 1, "/aʃ.te/", ["comprar"], [["Je dois acheter du pain.", "Tengo que comprar pan."]], ["everyday"]),
  v("toujours", "toujours", "adverb", "A1", 1, "/tu.ʒuʁ/", ["siempre", "todavía"], [["Elle arrive toujours à l'heure.", "Ella siempre llega a tiempo."]], ["everyday"]),
  v("parce-que", "parce que", "conjunction", "A1", 1, "/paʁs kə/", ["porque"], [["Je suis content parce que tu es là.", "Estoy contento porque estás aquí."]], ["connectors"], "Ante vocal se elide: parce qu'il…"),
  v("cher", "cher", "adjective", "A1", 2, "/ʃɛʁ/", ["caro", "querido"], [["Ce téléphone est trop cher.", "Este teléfono es demasiado caro."]], ["everyday"]),
  v("petit-dejeuner", "petit déjeuner", "noun", "A1", 2, "/pə.ti de.ʒœ.ne/", ["desayuno"], [["Le petit déjeuner est prêt.", "El desayuno está listo."]], ["food"]),
  v("beaucoup", "beaucoup", "adverb", "A1", 1, "/bo.ku/", ["mucho"], [["Merci beaucoup !", "¡Muchas gracias!"]], ["everyday"]),
  v("aussi", "aussi", "adverb", "A1", 1, "/o.si/", ["también"], [["Moi aussi, j'aime le cinéma.", "A mí también me gusta el cine."]], ["everyday"]),
  v("bibliotheque", "bibliothèque", "noun", "A2", 2, "/bi.bli.jɔ.tɛk/", ["biblioteca"], [["J'étudie à la bibliothèque.", "Estudio en la biblioteca."]], ["false-friends"], "Falso amigo: 'librairie' es librería (tienda de libros)."),
  v("oublier", "oublier", "verb", "A2", 1, "/u.bli.je/", ["olvidar"], [["Il ne faut pas oublier les clés.", "No hay que olvidar las llaves."]], ["everyday"]),
  v("temps", "temps", "noun", "A2", 1, "/tɑ̃/", ["tiempo", "clima"], [["Je n'ai pas le temps.", "No tengo tiempo."], ["Quel temps fait-il aujourd'hui ?", "¿Qué tiempo hace hoy?"]], ["everyday"]),
  v("voyage", "voyage", "noun", "A2", 2, "/vwa.jaʒ/", ["viaje"], [["Le voyage a duré six heures.", "El viaje duró seis horas."]], ["travel"]),
  v("reunion", "réunion", "noun", "A2", 2, "/ʁe.y.njɔ̃/", ["reunión", "junta"], [["La réunion commence à dix heures.", "La reunión empieza a las diez."]], ["work"]),
  v("attendre", "attendre", "verb", "A2", 1, "/a.tɑ̃dʁ/", ["esperar"], [["Je vais attendre le bus.", "Voy a esperar el autobús."]], ["false-friends", "everyday"], "Falso amigo: significa 'esperar', no 'atender'."),
  v("comprendre", "comprendre", "verb", "A2", 1, "/kɔ̃.pʁɑ̃dʁ/", ["entender", "comprender"], [["C'est difficile à comprendre.", "Es difícil de entender."]], ["everyday"]),
  v("ordinateur", "ordinateur", "noun", "A2", 2, "/ɔʁ.di.na.tœʁ/", ["computadora", "ordenador"], [["Mon ordinateur est très lent.", "Mi computadora es muy lenta."]], ["tech"]),
  v("jeu-video", "jeu vidéo", "noun", "A2", 3, "/ʒø vi.de.o/", ["videojuego"], [["Ce jeu vidéo est incroyable.", "Este videojuego es increíble."]], ["gaming"], "Plural: jeux vidéo."),
  v("rendez-vous", "rendez-vous", "noun", "A2", 2, "/ʁɑ̃.de.vu/", ["cita"], [["J'ai un rendez-vous chez le médecin.", "Tengo una cita con el médico."]], ["everyday"]),
  v("ameliorer", "améliorer", "verb", "B1", 2, "/a.me.ljɔ.ʁe/", ["mejorar"], [["Je veux améliorer mon français.", "Quiero mejorar mi francés."]], ["everyday"]),
  v("cependant", "cependant", "adverb", "B1", 2, "/sə.pɑ̃.dɑ̃/", ["sin embargo"], [["C'est une bonne idée. Cependant, c'est cher.", "Es una buena idea. Sin embargo, es cara."]], ["connectors"]),
  v("actuellement", "actuellement", "adverb", "B1", 2, "/ak.tɥɛl.mɑ̃/", ["actualmente"], [["Actuellement, je travaille à Paris.", "Actualmente trabajo en París."]], ["false-friends"], "Aquí sí significa 'actualmente' (a diferencia del inglés 'actually')."),
  v("logiciel", "logiciel", "noun", "B1", 3, "/lɔ.ʒi.sjɛl/", ["software", "programa"], [["Il faut mettre à jour ce logiciel.", "Hay que actualizar este programa."]], ["tech"]),
  v("bien-que", "bien que", "conjunction", "B1", 2, "/bjɛ̃ kə/", ["aunque"], [["Bien que ce soit difficile, je continue.", "Aunque sea difícil, sigo adelante."]], ["connectors"], "Va seguido de subjuntivo: bien que ce soit…"),
];

export const FR_GRAMMAR: GrammarConcept[] = [
  {
    id: "fr:g:gender-articles",
    language: "fr",
    title: "Género y artículos: le, la, l', les / un, une, des",
    cefr: "A1",
    errorCategory: "fr:articles-gender",
    summary:
      "Todo sustantivo francés es masculino o femenino, y el artículo lo marca. Muchos géneros coinciden con el español, pero no todos (le lait = la leche).",
    whenToUse: [
      "Definido: le (masc.), la (fem.), l' (ante vocal o h muda), les (plural).",
      "Indefinido: un (masc.), une (fem.), des (plural).",
      "El francés usa artículo casi siempre: J'aime le chocolat.",
    ],
    formation: ["le/la → l' ante vocal: l'ami, l'eau.", "de + le = du; de + les = des; à + le = au; à + les = aux."],
    commonMistakes: [
      { wrong: "la lait", right: "le lait", why: "'lait' es masculino (en español 'la leche' es femenino)." },
      { wrong: "le eau", right: "l'eau", why: "Elisión obligatoria ante vocal." },
      { wrong: "Je vais à le cinéma.", right: "Je vais au cinéma.", why: "à + le se contrae en au." },
    ],
    examples: [
      { text: "J'aime le café et la musique.", translation: { es: "Me gusta el café y la música." } },
      { text: "Je vais au marché avec des amis.", translation: { es: "Voy al mercado con unos amigos." } },
    ],
    contrasts: [
      { a: "le livre (el libro)", b: "la livre (la libra)", explanation: "A veces el género cambia el significado." },
    ],
    exercises: [
      { type: "mc", prompt: "___ eau est froide.", options: ["Le", "La", "L'", "Les"], answers: ["L'"], explanation: "Elisión ante vocal: l'eau." },
      { type: "mc", prompt: "Je vais ___ cinéma ce soir.", options: ["à le", "au", "à la", "aux"], answers: ["au"], explanation: "à + le = au." },
      { type: "mc", prompt: "Il boit ___ lait.", options: ["de la", "du", "de le", "des"], answers: ["du"], explanation: "lait es masculino: de + le = du." },
      { type: "fill", prompt: "J'ai ___ (una) voiture rouge.", answers: ["une"], explanation: "voiture es femenino → une." },
      { type: "mc", prompt: "___ enfants jouent dans le parc.", options: ["Le", "La", "Les", "L'"], answers: ["Les"], explanation: "Plural → les." },
    ],
  },
  {
    id: "fr:g:passe-compose",
    language: "fr",
    title: "Passé composé: avoir o être",
    cefr: "A2",
    errorCategory: "fr:past-tense",
    summary:
      "El passé composé es el pasado más usado en francés hablado. Se forma con avoir o être + participio. La mayoría de verbos usan avoir; los de movimiento/cambio de estado y los pronominales usan être.",
    whenToUse: ["Acciones terminadas en el pasado: Hier, j'ai mangé une pizza."],
    formation: [
      "avoir (presente) + participio: j'ai parlé, tu as fini, il a pris.",
      "être + participio (concuerda con el sujeto): elle est allée, ils sont partis.",
      "Verbos con être: aller, venir, arriver, partir, entrer, sortir, naître, mourir, rester, tomber… y todos los pronominales (se lever → je me suis levé).",
    ],
    commonMistakes: [
      { wrong: "J'ai allé au cinéma.", right: "Je suis allé au cinéma.", why: "aller va con être." },
      { wrong: "Elle est allé à Paris.", right: "Elle est allée à Paris.", why: "Con être, el participio concuerda: allée." },
    ],
    examples: [
      { text: "Nous avons visité le musée.", translation: { es: "Visitamos el museo." } },
      { text: "Elle est arrivée en retard.", translation: { es: "Ella llegó tarde." } },
    ],
    contrasts: [
      { a: "J'ai mangé. (avoir)", b: "Je suis parti. (être)", explanation: "Movimiento o cambio de estado → être." },
    ],
    exercises: [
      { type: "mc", prompt: "Hier, je ___ allé à la plage.", options: ["ai", "suis", "as", "est"], answers: ["suis"], explanation: "aller → être: je suis allé." },
      { type: "mc", prompt: "Nous ___ fini nos devoirs.", options: ["sommes", "avons", "êtes", "ont"], answers: ["avons"], explanation: "finir → avoir: nous avons fini." },
      { type: "mc", prompt: "Elle est ___ à huit heures.", options: ["arrivé", "arrivée", "arrivés", "arriver"], answers: ["arrivée"], explanation: "Con être el participio concuerda: arrivée (fem.)." },
      { type: "correct", prompt: "J'ai venu avec mon frère.", answers: ["Je suis venu avec mon frère.", "Je suis venue avec mon frère."], explanation: "venir → être." },
    ],
  },
];
