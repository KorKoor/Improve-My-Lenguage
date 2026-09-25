/**
 * Lectura para el diagnóstico: textos breves escritos a mano, de A1 a C1, con
 * una pregunta de comprensión en español. Complementan los ítems generados
 * (vocabulario, gramática, escucha) en los idiomas sin banco curado completo.
 */
import type { AssessmentItem, LanguageCode } from "./types";

type R = { level: number; passage: string; prompt: string; options: string[]; answer: string };

const make = (lang: LanguageCode, rs: R[]): AssessmentItem[] =>
  rs.map((r, i) => ({ id: `${lang}:a:r:${i}`, language: lang, skill: "reading", difficulty: r.level, passage: r.passage, prompt: r.prompt, options: r.options, answer: r.answer }));

export const READING_BANK: Partial<Record<LanguageCode, AssessmentItem[]>> = {
  fr: make("fr", [
    { level: -2.6, passage: "Je m'appelle Paul. J'ai un chat noir. Il s'appelle Minou.", prompt: "¿De qué color es el gato?", options: ["Negro", "Blanco", "Gris", "Marrón"], answer: "Negro" },
    { level: -1.6, passage: "Samedi, nous sommes allés au marché avec ma sœur. Nous avons acheté des pommes et du fromage, mais il n'y avait plus de pain.", prompt: "¿Qué NO pudieron comprar?", options: ["Pan", "Manzanas", "Queso", "Pescado"], answer: "Pan" },
    { level: -0.6, passage: "Depuis qu'elle travaille à domicile, Claire gagne une heure par jour. Elle en profite pour faire du sport le matin, ce qu'elle n'avait jamais le temps de faire avant.", prompt: "¿Qué hace Claire con el tiempo que gana?", options: ["Hace deporte por la mañana", "Trabaja más horas", "Duerme más", "Va a la oficina"], answer: "Hace deporte por la mañana" },
    { level: 0.5, passage: "Bien que la mairie ait promis de nouvelles pistes cyclables, les habitants restent sceptiques : les travaux annoncés il y a deux ans n'ont toujours pas commencé.", prompt: "¿Por qué desconfían los vecinos?", options: ["Porque las obras prometidas aún no empiezan", "Porque ya hay demasiados carriles bici", "Porque la alcaldía no ha prometido nada", "Porque las obras acabaron mal"], answer: "Porque las obras prometidas aún no empiezan" },
    { level: 1.5, passage: "Loin de résoudre la crise, la mesure n'a fait que déplacer le problème : les loyers ont certes baissé en centre-ville, mais la pression s'est reportée sur les communes voisines.", prompt: "Según el texto, la medida…", options: ["trasladó el problema a los municipios vecinos", "resolvió la crisis de la vivienda", "subió los alquileres del centro", "no tuvo ningún efecto"], answer: "trasladó el problema a los municipios vecinos" },
  ]),
  it: make("it", [
    { level: -2.6, passage: "Ciao, sono Marta. Ho venti anni e abito a Roma con mia madre.", prompt: "¿Con quién vive Marta?", options: ["Con su madre", "Sola", "Con su padre", "Con una amiga"], answer: "Con su madre" },
    { level: -1.6, passage: "Ieri sera siamo andati al ristorante. Io ho mangiato la pizza, mentre Luca ha preso il pesce perché non gli piace il formaggio.", prompt: "¿Por qué Luca no pidió pizza?", options: ["Porque no le gusta el queso", "Porque no tenía hambre", "Porque no había pizza", "Porque es muy cara"], answer: "Porque no le gusta el queso" },
    { level: -0.6, passage: "Da quando ha cambiato lavoro, Giorgio prende il treno invece della macchina. Dice che così riesce a leggere e arriva meno stanco.", prompt: "¿Qué ventaja tiene para Giorgio ir en tren?", options: ["Puede leer y llega menos cansado", "Es más barato", "Llega antes", "Puede dormir en casa"], answer: "Puede leer y llega menos cansado" },
    { level: 0.5, passage: "Nonostante le previsioni ottimistiche, le vendite natalizie sono calate del cinque per cento: molti consumatori hanno preferito risparmiare in vista dell'aumento delle bollette.", prompt: "¿Por qué bajaron las ventas?", options: ["La gente prefirió ahorrar por la subida de las facturas", "Hubo menos productos", "Las previsiones eran pesimistas", "Las tiendas cerraron en Navidad"], answer: "La gente prefirió ahorrar por la subida de las facturas" },
    { level: 1.5, passage: "Più che una svolta, la riforma rappresenta un compromesso al ribasso: accontenta i partiti della maggioranza senza affrontare i nodi strutturali denunciati da anni dagli esperti.", prompt: "El autor considera que la reforma…", options: ["es un compromiso que evita los problemas de fondo", "es un cambio radical y necesario", "fue propuesta por los expertos", "perjudica a la mayoría"], answer: "es un compromiso que evita los problemas de fondo" },
  ]),
  pt: make("pt", [
    { level: -2.6, passage: "Olá! Eu sou o Pedro. Eu gosto de futebol e de música.", prompt: "¿Qué le gusta a Pedro?", options: ["El fútbol y la música", "Leer y cocinar", "El cine", "Viajar"], answer: "El fútbol y la música" },
    { level: -1.6, passage: "No domingo choveu muito, então ficamos em casa. Vimos um filme e depois fizemos um bolo de chocolate.", prompt: "¿Por qué se quedaron en casa?", options: ["Porque llovió mucho", "Porque estaban enfermos", "Porque era lunes", "Porque querían cocinar"], answer: "Porque llovió mucho" },
    { level: -0.6, passage: "Desde que se mudou para o interior, Ana passou a cultivar os próprios legumes. Diz que come melhor e gasta menos no supermercado.", prompt: "¿Qué cambió en la vida de Ana?", options: ["Cultiva sus propias verduras", "Trabaja en un supermercado", "Vive en la capital", "Come menos"], answer: "Cultiva sus propias verduras" },
    { level: 0.5, passage: "Embora o governo tenha anunciado mais investimento na saúde, os hospitais continuam lotados, e os profissionais queixam-se da falta de recursos básicos.", prompt: "¿Qué dicen los profesionales?", options: ["Que faltan recursos básicos", "Que los hospitales están vacíos", "Que el gobierno no anunció nada", "Que sobra personal"], answer: "Que faltan recursos básicos" },
    { level: 1.5, passage: "A medida, longe de ser consensual, expôs as fissuras dentro da coligação: enquanto uns a defendem como inevitável, outros acusam o executivo de ceder a pressões externas.", prompt: "Según el texto, la medida…", options: ["reveló divisiones dentro de la coalición", "fue aprobada por unanimidad", "no provocó ninguna reacción", "fue retirada por el gobierno"], answer: "reveló divisiones dentro de la coalición" },
  ]),
  de: make("de", [
    { level: -2.6, passage: "Ich heiße Lena. Ich komme aus Berlin und trinke gern Tee.", prompt: "¿Qué le gusta beber a Lena?", options: ["Té", "Café", "Agua", "Leche"], answer: "Té" },
    { level: -1.6, passage: "Am Wochenende war ich mit meinem Bruder im Park. Wir wollten Fußball spielen, aber es hat plötzlich angefangen zu regnen.", prompt: "¿Por qué no jugaron al fútbol?", options: ["Empezó a llover de repente", "No tenían balón", "El parque estaba cerrado", "El hermano estaba cansado"], answer: "Empezó a llover de repente" },
    { level: -0.6, passage: "Seit Jonas mit dem Fahrrad zur Arbeit fährt, spart er nicht nur Geld für Benzin, sondern fühlt sich auch fitter als früher.", prompt: "¿Qué dos ventajas tiene ir en bicicleta para Jonas?", options: ["Ahorra dinero y está más en forma", "Llega antes y duerme más", "Conoce gente y ahorra tiempo", "Trabaja menos y gana más"], answer: "Ahorra dinero y está más en forma" },
    { level: 0.5, passage: "Obwohl die Stadt neue Radwege versprochen hatte, sind viele Bürger enttäuscht: Die Bauarbeiten, die vor zwei Jahren angekündigt wurden, haben noch immer nicht begonnen.", prompt: "¿Por qué están decepcionados los ciudadanos?", options: ["Las obras anunciadas no han empezado", "Hay demasiados carriles bici", "La ciudad no prometió nada", "Las obras fueron muy caras"], answer: "Las obras anunciadas no han empezado" },
    { level: 1.5, passage: "Statt die Krise zu lösen, hat die Maßnahme das Problem lediglich verlagert: Zwar sind die Mieten in der Innenstadt gesunken, doch der Druck auf die Umlandgemeinden ist gestiegen.", prompt: "Según el texto, la medida…", options: ["solo trasladó el problema a los municipios de alrededor", "resolvió la crisis", "subió los alquileres del centro", "bajó la presión en las afueras"], answer: "solo trasladó el problema a los municipios de alrededor" },
  ]),
};
