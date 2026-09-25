import type { CefrLevel } from "./types";

/**
 * Consignas de escritura (en español; se escribe en el idioma que se aprende).
 * Progresión CEFR: de describirse a uno mismo a argumentar y resumir.
 */
export interface WritingPrompt {
  id: string;
  level: CefrLevel;
  title: string;
  task: string;
  /** Palabras orientativas. */
  words: number;
  tips: string[];
  topic?: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  { id: "a1-me", level: "A1", title: "Preséntate", task: "Escribe quién eres: tu nombre, de dónde eres, dónde vives y qué te gusta hacer.", words: 30, tips: ["Usa frases cortas.", "Empieza con «Me llamo…» en el idioma que aprendes."] },
  { id: "a1-family", level: "A1", title: "Mi familia", task: "Describe a tu familia: cuántas personas son, cómo se llaman y qué hacen.", words: 35, tips: ["Usa «tengo» + número.", "Un adjetivo por persona."] },
  { id: "a1-day", level: "A1", title: "Un día normal", task: "¿Qué haces un día normal? Escribe desde la mañana hasta la noche.", words: 40, tips: ["Usa el presente.", "Palabras de tiempo: por la mañana, después, por la noche."] },
  { id: "a2-weekend", level: "A2", title: "Mi fin de semana", task: "Cuenta qué hiciste el fin de semana pasado y con quién.", words: 60, tips: ["Usa el pasado.", "Conecta con «primero», «luego», «al final»."] },
  { id: "a2-home", level: "A2", title: "Mi casa ideal", task: "Describe tu casa ideal: dónde está, cómo es y qué tiene.", words: 60, tips: ["Usa hay / tiene.", "Adjetivos de tamaño y color."] },
  { id: "a2-message", level: "A2", title: "Un mensaje a un amigo", task: "Escribe un mensaje para invitar a un amigo a comer este sábado: di dónde, a qué hora y por qué.", words: 50, tips: ["Saluda y despídete.", "Haz al menos una pregunta."] },
  { id: "b1-trip", level: "B1", title: "Un viaje inolvidable", task: "Cuenta un viaje que te marcó: adónde fuiste, qué pasó y qué aprendiste.", words: 110, tips: ["Combina pasados (acción y descripción).", "Termina con una reflexión."] },
  { id: "b1-email", level: "B1", title: "Correo de queja", task: "Compraste algo por internet y llegó roto. Escribe un correo a la tienda explicando el problema y qué solución pides.", words: 110, tips: ["Registro formal.", "Estructura: problema → detalles → petición."] },
  { id: "b1-advice", level: "B1", title: "Consejos", task: "Un amigo quiere aprender tu idioma nativo. Dale cinco consejos y explica por qué funcionan.", words: 100, tips: ["Usa «deberías», «es mejor…».", "Da un ejemplo por consejo."] },
  { id: "b2-opinion", level: "B2", title: "Trabajar desde casa", task: "¿Es mejor trabajar desde casa o en la oficina? Da tu opinión con argumentos a favor y en contra.", words: 160, tips: ["Conectores: sin embargo, además, por lo tanto.", "Concluye con tu postura."] },
  { id: "b2-tech", level: "B2", title: "La tecnología y nosotros", task: "¿La tecnología nos acerca o nos aleja de las personas? Argumenta con ejemplos reales.", words: 160, tips: ["Un argumento por párrafo.", "Incluye un contraargumento."], topic: "tech" },
  { id: "b2-review", level: "B2", title: "Reseña", task: "Escribe la reseña de una película, serie, libro o videojuego que te haya gustado: trama, puntos fuertes y a quién se lo recomiendas.", words: 150, tips: ["Evita contar el final.", "Usa adjetivos precisos."], topic: "gaming" },
  { id: "c1-essay", level: "C1", title: "Ensayo breve", task: "¿Debería ser obligatorio aprender un segundo idioma en la escuela? Escribe un ensayo equilibrado con introducción, desarrollo y conclusión.", words: 220, tips: ["Matiza tus afirmaciones.", "Varía la estructura de las frases."] },
  { id: "c1-summary", level: "C1", title: "Resumen crítico", task: "Resume un artículo o noticia que hayas leído esta semana (puedes usar Lecturas) y da tu valoración crítica.", words: 200, tips: ["Separa resumen y opinión.", "Parafrasea: no copies frases."] },
  { id: "c1-formal", level: "C1", title: "Carta de motivación", task: "Escribe una carta de motivación para un trabajo o una beca en un país donde se habla el idioma.", words: 220, tips: ["Registro formal y preciso.", "Conecta tu experiencia con el puesto."], topic: "work" },
];

const ORDER: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Consignas de tu nivel (y una del siguiente como reto); primero las de tus intereses. */
export function promptsFor(level: CefrLevel, interests: string[]): WritingPrompt[] {
  const i = ORDER.indexOf(level);
  const levels = new Set([ORDER[Math.max(0, i - 1)], level, ORDER[Math.min(ORDER.length - 2, i + 1)]]);
  const list = WRITING_PROMPTS.filter((p) => levels.has(p.level));
  return list.sort((a, b) => {
    const ia = a.topic && interests.includes(a.topic) ? 0 : 1;
    const ib = b.topic && interests.includes(b.topic) ? 0 : 1;
    return ia - ib || Math.abs(ORDER.indexOf(a.level) - i) - Math.abs(ORDER.indexOf(b.level) - i);
  });
}

export function getPrompt(id: string): WritingPrompt | undefined {
  return WRITING_PROMPTS.find((p) => p.id === id);
}
