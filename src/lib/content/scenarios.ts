import type { CefrLevel } from "./types";

/**
 * Escenarios de práctica oral (role-play con el tutor). Cada uno tiene un
 * papel para el tutor, una situación y 3 objetivos comunicativos concretos
 * que el alumno debe lograr: así la conversación tiene propósito y final.
 * Textos para el alumno en español; instrucciones para la IA en inglés.
 */
export interface Scenario {
  id: string;
  level: CefrLevel;
  icon: string;
  title: string;
  /** Situación, para el alumno. */
  situation: string;
  /** Objetivos comunicativos (para el alumno). */
  goals: [string, string, string];
  /** Papel del tutor y contexto (para la IA). */
  role: string;
  /** Objetivos en inglés, en el mismo orden (para la IA). */
  goalsEn: [string, string, string];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "cafe",
    level: "A1",
    icon: "☕",
    title: "En la cafetería",
    situation: "Entras en una cafetería. Pide algo de beber y de comer y paga.",
    goals: ["Saluda y pide una bebida", "Pregunta cuánto cuesta", "Despídete dando las gracias"],
    role: "a friendly barista in a small café. Offer 2–3 options when asked, state prices in the local currency.",
    goalsEn: ["greet and order a drink", "ask how much it costs", "say goodbye and thank you"],
  },
  {
    id: "introduce",
    level: "A1",
    icon: "👋",
    title: "Conocer a alguien",
    situation: "Estás en una fiesta y conoces a una persona nueva.",
    goals: ["Di cómo te llamas y de dónde eres", "Pregunta a qué se dedica", "Cuenta una cosa que te gusta hacer"],
    role: "a friendly guest at a party who has just met the learner. Be curious and ask simple personal questions.",
    goalsEn: ["say their name and where they are from", "ask what the other person does for a living", "share something they like doing"],
  },
  {
    id: "directions",
    level: "A2",
    icon: "🗺️",
    title: "Pedir direcciones",
    situation: "Estás perdido en una ciudad y necesitas llegar a la estación de tren.",
    goals: ["Pregunta cómo llegar a la estación", "Pregunta si está lejos o cuánto se tarda", "Confirma el camino repitiendo las indicaciones"],
    role: "a local passer-by. Give clear directions with left/right/straight and a landmark.",
    goalsEn: ["ask how to get to the train station", "ask whether it is far or how long it takes", "confirm by repeating the directions"],
  },
  {
    id: "restaurant",
    level: "A2",
    icon: "🍽️",
    title: "En el restaurante",
    situation: "Cenas en un restaurante. Tienes una alergia a los frutos secos.",
    goals: ["Pide una mesa y la carta", "Explica tu alergia y pide una recomendación", "Pide la cuenta"],
    role: "a waiter in a mid-range restaurant. Recommend dishes and react to allergies realistically.",
    goalsEn: ["ask for a table and the menu", "explain a nut allergy and ask for a recommendation", "ask for the bill"],
  },
  {
    id: "shopping",
    level: "A2",
    icon: "🛍️",
    title: "Comprar ropa",
    situation: "Quieres comprar una chaqueta, pero la talla no te queda bien.",
    goals: ["Pide una chaqueta de tu talla y color", "Di que no te queda bien y pide otra talla", "Pregunta si puedes devolverla"],
    role: "a shop assistant in a clothes store. Offer sizes and colours, explain the return policy.",
    goalsEn: ["ask for a jacket in their size and colour", "say it doesn't fit and ask for another size", "ask about returning it"],
  },
  {
    id: "doctor",
    level: "B1",
    icon: "🩺",
    title: "En el médico",
    situation: "Llevas tres días con dolor de garganta y fiebre.",
    goals: ["Describe tus síntomas y desde cuándo los tienes", "Responde a las preguntas del médico", "Pregunta cómo tomar el medicamento"],
    role: "a calm general practitioner. Ask about symptoms, duration and allergies; prescribe something simple. Never give real medical advice beyond the role-play.",
    goalsEn: ["describe symptoms and since when", "answer the doctor's questions", "ask how to take the medicine"],
  },
  {
    id: "hotel",
    level: "B1",
    icon: "🏨",
    title: "Problema en el hotel",
    situation: "Llegas al hotel y tu habitación no es la que reservaste.",
    goals: ["Explica el problema con tu reserva", "Pide una solución concreta", "Acepta o negocia la propuesta"],
    role: "a hotel receptionist dealing with an overbooking. Be polite and offer alternatives.",
    goalsEn: ["explain the problem with the booking", "request a specific solution", "accept or negotiate the offer"],
  },
  {
    id: "flat",
    level: "B1",
    icon: "🏠",
    title: "Alquilar un piso",
    situation: "Llamas para preguntar por un piso en alquiler que viste en internet.",
    goals: ["Pregunta por el precio y qué incluye", "Pregunta por el barrio y el transporte", "Pide una cita para verlo"],
    role: "a landlord renting out a one-bedroom flat. Answer questions and propose viewing times.",
    goalsEn: ["ask about the price and what it includes", "ask about the neighbourhood and transport", "arrange a viewing"],
  },
  {
    id: "interview",
    level: "B2",
    icon: "💼",
    title: "Entrevista de trabajo",
    situation: "Tienes una entrevista para un puesto que te interesa mucho.",
    goals: ["Preséntate y resume tu experiencia", "Explica un reto que superaste", "Haz una pregunta sobre el puesto"],
    role: "a professional but friendly interviewer for a job related to the learner's interests. Ask follow-up questions.",
    goalsEn: ["introduce themselves and summarise their experience", "explain a challenge they overcame", "ask a question about the position"],
  },
  {
    id: "complaint",
    level: "B2",
    icon: "📞",
    title: "Reclamación por teléfono",
    situation: "Tu internet lleva una semana sin funcionar y te han cobrado igual.",
    goals: ["Explica el problema con detalle", "Pide un reembolso o compensación", "Consigue un compromiso con fecha"],
    role: "a customer-service agent for an internet provider. Follow a script at first, then compromise if the learner argues well.",
    goalsEn: ["explain the problem in detail", "request a refund or compensation", "get a commitment with a date"],
  },
  {
    id: "debate",
    level: "C1",
    icon: "⚖️",
    title: "Debate de opinión",
    situation: "Debates si las ciudades deberían prohibir los coches en el centro.",
    goals: ["Defiende tu postura con dos argumentos", "Rebate un argumento contrario", "Llega a una conclusión matizada"],
    role: "a sharp debate partner who takes the opposite side of the learner. Push back with counterarguments.",
    goalsEn: ["defend their position with two arguments", "rebut an opposing argument", "reach a nuanced conclusion"],
  },
  {
    id: "negotiation",
    level: "C1",
    icon: "🤝",
    title: "Negociar un aumento",
    situation: "Pides a tu jefa un aumento de sueldo después de un gran año.",
    goals: ["Justifica tu petición con logros", "Responde a las objeciones", "Cierra un acuerdo concreto"],
    role: "the learner's manager: appreciative but with a tight budget. Raise realistic objections.",
    goalsEn: ["justify the request with achievements", "respond to objections", "close a concrete agreement"],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export const SCENARIO_PREFIX = "scenario:";

/** El tema de una conversación de escenario se guarda como «scenario:<id>». */
export function scenarioFromTopic(topic: string | null): Scenario | undefined {
  return topic?.startsWith(SCENARIO_PREFIX) ? getScenario(topic.slice(SCENARIO_PREFIX.length)) : undefined;
}
