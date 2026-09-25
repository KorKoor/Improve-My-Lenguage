import { wordsFor } from "../pack";
import type { GrammarConcept, VocabItem } from "../types";

/**
 * Portugués (variante de Brasil; IPA de São Paulo/Río aproximada).
 * Paquete inicial en beta: revisión humana recomendada antes de ampliar.
 */
const v = wordsFor("pt");

export const PT_VOCAB: VocabItem[] = [
  v("ola", "olá", "interjection", "A1", 1, "/oˈla/", ["hola"], [["Olá, tudo bem?", "Hola, ¿todo bien?"]], ["everyday"]),
  v("obrigado", "obrigado", "interjection", "A1", 1, "/obɾiˈɡadu/", ["gracias"], [["Muito obrigado pela ajuda!", "¡Muchas gracias por la ayuda!"]], ["everyday"], "Concuerda con quien habla: un hombre dice «obrigado», una mujer «obrigada».", ["obrigada"]),
  v("casa", "casa", "noun", "A1", 1, "/ˈkazɐ/", ["casa"], [["Eu moro numa casa pequena.", "Vivo en una casa pequeña."]], ["everyday"]),
  v("agua", "água", "noun", "A1", 1, "/ˈaɡwɐ/", ["agua"], [["Um copo de água, por favor.", "Un vaso de agua, por favor."]], ["everyday", "food"], "Femenino: a água (no «o água» como en español «el agua»)."),
  v("amigo", "amigo", "noun", "A1", 1, "/ɐˈmiɡu/", ["amigo"], [["O meu amigo mora em Lisboa.", "Mi amigo vive en Lisboa."]], ["everyday"], "Femenino: amiga."),
  v("trabalhar", "trabalhar", "verb", "A1", 1, "/tɾabaˈʎaʁ/", ["trabajar"], [["Eu vou trabalhar amanhã.", "Voy a trabajar mañana."]], ["work"]),
  v("comer", "comer", "verb", "A1", 1, "/koˈmeʁ/", ["comer"], [["Vamos comer no restaurante?", "¿Vamos a comer al restaurante?"]], ["food"]),
  v("feliz", "feliz", "adjective", "A1", 2, "/feˈlis/", ["feliz"], [["Ela está muito feliz hoje.", "Ella está muy feliz hoy."]], ["feelings"]),
  v("cansado", "cansado", "adjective", "A1", 2, "/kɐ̃ˈsadu/", ["cansado"], [["Estou cansado depois do trabalho.", "Estoy cansado después del trabajo."]], ["feelings"]),
  v("manha", "manhã", "noun", "A1", 1, "/mɐˈɲɐ̃/", ["mañana (parte del día)"], [["Eu tomo café de manhã.", "Tomo café por la mañana."]], ["everyday"], "«amanhã» = mañana (el día siguiente)."),
  v("comprar", "comprar", "verb", "A1", 1, "/kõˈpɾaʁ/", ["comprar"], [["Preciso comprar pão.", "Necesito comprar pan."]], ["everyday"]),
  v("sempre", "sempre", "adverb", "A1", 1, "/ˈsẽpɾi/", ["siempre"], [["Ele sempre chega na hora.", "Él siempre llega a tiempo."]], ["everyday"]),
  v("porque", "porque", "conjunction", "A1", 1, "/poʁˈke/", ["porque"], [["Estou feliz porque você está aqui.", "Estoy feliz porque estás aquí."]], ["connectors"], "En preguntas se escribe separado: «Por que você saiu?»"),
  v("caro", "caro", "adjective", "A1", 2, "/ˈkaɾu/", ["caro"], [["Esse celular é muito caro.", "Ese celular es muy caro."]], ["everyday"]),
  v("cafe-da-manha", "café da manhã", "noun", "A1", 2, "/kaˈfɛ da mɐˈɲɐ̃/", ["desayuno"], [["O café da manhã está pronto.", "El desayuno está listo."]], ["food"], "En Portugal se dice «pequeno-almoço»."),
  v("muito", "muito", "adverb", "A1", 1, "/ˈmũjtu/", ["mucho", "muy"], [["Muito obrigado!", "¡Muchas gracias!"]], ["everyday"], "Sirve para «muy» y «mucho»: muito bom, muito tempo."),
  v("tambem", "também", "adverb", "A1", 1, "/tɐ̃ˈbẽj/", ["también"], [["Eu também gosto de música.", "A mí también me gusta la música."]], ["everyday"]),
  v("ajudar", "ajudar", "verb", "A1", 1, "/aʒuˈdaʁ/", ["ayudar"], [["Você pode me ajudar?", "¿Me puedes ayudar?"]], ["everyday"]),
  v("esquisito", "esquisito", "adjective", "A2", 3, "/eskiˈzitu/", ["raro", "extraño"], [["Que cheiro esquisito!", "¡Qué olor tan raro!"]], ["false-friends"], "Falso amigo: significa «raro». «Exquisito» se dice «gostoso» o «delicioso»."),
  v("escritorio", "escritório", "noun", "A2", 2, "/eskɾiˈtɔɾju/", ["oficina"], [["Ela trabalha num escritório no centro.", "Ella trabaja en una oficina del centro."]], ["false-friends", "work"], "Falso amigo: el mueble «escritorio» se dice «mesa» o «escrivaninha»."),
  v("esquecer", "esquecer", "verb", "A2", 1, "/eskeˈseʁ/", ["olvidar"], [["Não esqueça as chaves.", "No olvides las llaves."]], ["everyday"]),
  v("tempo", "tempo", "noun", "A2", 1, "/ˈtẽpu/", ["tiempo", "clima"], [["Não tenho tempo agora.", "No tengo tiempo ahora."], ["Como está o tempo hoje?", "¿Qué tiempo hace hoy?"]], ["everyday"]),
  v("viagem", "viagem", "noun", "A2", 2, "/viˈaʒẽj/", ["viaje"], [["A viagem durou seis horas.", "El viaje duró seis horas."]], ["travel"], "Femenino: a viagem (en español «el viaje»)."),
  v("reuniao", "reunião", "noun", "A2", 2, "/ʁewniˈɐ̃w̃/", ["reunión", "junta"], [["A reunião começa às dez.", "La reunión empieza a las diez."]], ["work"]),
  v("esperar", "esperar", "verb", "A2", 1, "/espeˈɾaʁ/", ["esperar"], [["Vou esperar o ônibus.", "Voy a esperar el autobús."]], ["everyday"]),
  v("entender", "entender", "verb", "A2", 1, "/ẽtẽˈdeʁ/", ["entender"], [["Não entendi a pergunta.", "No entendí la pregunta."]], ["everyday"]),
  v("computador", "computador", "noun", "A2", 2, "/kõputaˈdoʁ/", ["computadora"], [["O meu computador está lento.", "Mi computadora está lenta."]], ["tech"]),
  v("jogo", "jogo", "noun", "A2", 2, "/ˈʒoɡu/", ["juego", "partido"], [["Esse jogo é incrível.", "Este juego es increíble."]], ["gaming"], "También «partido»: o jogo de futebol."),
  v("polvo", "polvo", "noun", "A2", 4, "/ˈpowvu/", ["pulpo"], [["Comemos polvo no jantar.", "Comimos pulpo en la cena."]], ["false-friends", "food"], "Falso amigo: «polvo» es pulpo. El polvo (suciedad) es «poeira»."),
  v("onibus", "ônibus", "noun", "A2", 2, "/ˈonibus/", ["autobús", "camión"], [["O ônibus está atrasado.", "El autobús viene retrasado."]], ["travel"]),
  v("pegar", "pegar", "verb", "A2", 1, "/peˈɡaʁ/", ["agarrar", "tomar"], [["Vou pegar um táxi.", "Voy a tomar un taxi."]], ["false-friends", "everyday"], "Falso amigo: no significa «golpear» sino agarrar/tomar."),
  v("melhorar", "melhorar", "verb", "B1", 2, "/meʎoˈɾaʁ/", ["mejorar"], [["Quero melhorar o meu português.", "Quiero mejorar mi portugués."]], ["everyday"]),
  v("no-entanto", "no entanto", "adverb", "B1", 2, "/nu ẽˈtɐ̃tu/", ["sin embargo"], [["É uma boa ideia. No entanto, é cara.", "Es una buena idea. Sin embargo, es cara."]], ["connectors"]),
  v("aplicativo", "aplicativo", "noun", "B1", 3, "/aplikaˈtʃivu/", ["aplicación", "app"], [["Baixei um aplicativo novo.", "Descargué una aplicación nueva."]], ["tech"], "En Portugal: «aplicação»."),
  v("embora", "embora", "conjunction", "B1", 2, "/ẽˈbɔɾɐ/", ["aunque"], [["Embora seja difícil, eu continuo.", "Aunque sea difícil, sigo adelante."]], ["connectors"], "Va con subjuntivo: embora seja…"),
  v("saudade", "saudade", "noun", "B1", 2, "/sawˈdadʒi/", ["nostalgia", "echar de menos"], [["Tenho saudade da minha família.", "Extraño a mi familia."]], ["feelings"], "Palabra muy portuguesa: la nostalgia de algo o alguien querido."),
];

export const PT_GRAMMAR: GrammarConcept[] = [
  {
    id: "pt:g:contractions",
    language: "pt",
    title: "Contracciones: no, na, do, da, ao…",
    cefr: "A1",
    errorCategory: "pt:contractions",
    summary:
      "En portugués las preposiciones em, de, a y por se unen casi siempre con el artículo. Es obligatorio: «em o Brasil» no existe, se dice «no Brasil».",
    whenToUse: ["Siempre que una de estas preposiciones va seguida de o, a, os, as (y también de um, uma con em y de)."],
    formation: [
      "em + o/a/os/as = no, na, nos, nas.",
      "de + o/a/os/as = do, da, dos, das.",
      "a + o/a = ao, à · por + o/a = pelo, pela.",
      "em + um/uma = num, numa.",
    ],
    commonMistakes: [
      { wrong: "Eu moro em o Brasil.", right: "Eu moro no Brasil.", why: "em + o se contrae en no." },
      { wrong: "O livro de a Maria.", right: "O livro da Maria.", why: "de + a = da." },
    ],
    examples: [
      { text: "Estou na praia com os amigos do trabalho.", translation: { es: "Estoy en la playa con los amigos del trabajo." } },
      { text: "Vamos ao cinema pela manhã.", translation: { es: "Vamos al cine por la mañana." } },
    ],
    contrasts: [{ a: "no Brasil (em + o)", b: "em Portugal (sin artículo)", explanation: "Algunos países no llevan artículo: em Portugal, em Angola." }],
    exercises: [
      { type: "mc", prompt: "Eu moro ___ Brasil.", options: ["em o", "no", "na", "do"], answers: ["no"], explanation: "em + o = no." },
      { type: "mc", prompt: "Esta é a casa ___ Ana.", options: ["de a", "da", "do", "na"], answers: ["da"], explanation: "de + a = da." },
      { type: "mc", prompt: "Vamos ___ cinema hoje?", options: ["ao", "à", "no", "o"], answers: ["ao"], explanation: "a + o = ao." },
      { type: "fill", prompt: "Ela está ___ (en la) cozinha.", answers: ["na"], explanation: "em + a = na." },
      { type: "correct", prompt: "O carro de o meu pai é azul.", answers: ["O carro do meu pai é azul."], explanation: "de + o = do." },
    ],
  },
  {
    id: "pt:g:preterito-perfeito",
    language: "pt",
    title: "Pretérito perfeito: falei, comi, abri",
    cefr: "A2",
    errorCategory: "pt:past-tense",
    summary:
      "Es el pasado de acciones terminadas, como «hablé» o «comí» en español. En portugués casi no se usa el pretérito compuesto: «ya comí» es «já comi».",
    whenToUse: ["Acciones terminadas en el pasado: Ontem eu falei com ela.", "Donde en español dirías «he comido», en portugués normalmente dices «comi»."],
    formation: [
      "-ar: falei, falou, falamos, falaram.",
      "-er: comi, comeu, comemos, comeram.",
      "-ir: abri, abriu, abrimos, abriram.",
      "Irregulares frecuentes: fui (ir/ser), fiz (fazer), tive (ter), estive (estar).",
    ],
    commonMistakes: [
      { wrong: "Eu tenho comido agora.", right: "Eu comi agora.", why: "«tenho comido» indica algo repetido hasta hoy, no una acción terminada." },
      { wrong: "Ontem ele falei comigo.", right: "Ontem ele falou comigo.", why: "Tercera persona: falou." },
    ],
    examples: [
      { text: "Ontem nós comemos pizza.", translation: { es: "Ayer comimos pizza." } },
      { text: "Você já fez a tarefa?", translation: { es: "¿Ya hiciste la tarea?" } },
    ],
    contrasts: [{ a: "Comi. (acción terminada)", b: "Tenho comido pouco. (hábito hasta ahora)", explanation: "El compuesto portugués indica repetición reciente, no una acción puntual." }],
    exercises: [
      { type: "mc", prompt: "Ontem eu ___ com a minha mãe.", options: ["falo", "falei", "falou", "falar"], answers: ["falei"], explanation: "eu + -ar → falei." },
      { type: "mc", prompt: "Eles ___ muito no jantar.", options: ["comeu", "comemos", "comeram", "come"], answers: ["comeram"], explanation: "eles + -er → comeram." },
      { type: "mc", prompt: "Eu ___ ao Rio no ano passado.", options: ["fui", "foi", "vou", "ia"], answers: ["fui"], explanation: "ir en pretérito: eu fui." },
      { type: "fill", prompt: "Você já ___ (hacer) o jantar?", answers: ["fez"], explanation: "fazer → você fez." },
    ],
  },
];
