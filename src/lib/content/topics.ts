import type { Topic } from "./types";

export const TOPICS: Topic[] = [
  { id: "everyday", label: "Vida diaria", emoji: "☕" },
  { id: "tech", label: "Programación y tecnología", emoji: "💻" },
  { id: "gaming", label: "Videojuegos", emoji: "🎮" },
  { id: "work", label: "Trabajo", emoji: "💼" },
  { id: "business", label: "Negocios", emoji: "📈" },
  { id: "travel", label: "Viajes", emoji: "✈️" },
  { id: "food", label: "Comida", emoji: "🍜" },
  { id: "feelings", label: "Emociones", emoji: "💭" },
  { id: "science", label: "Ciencia", emoji: "🔬" },
  { id: "music", label: "Música", emoji: "🎧" },
  { id: "fitness", label: "Fitness", emoji: "🏋️" },
  { id: "connectors", label: "Conectores y matices", emoji: "🔗" },
  { id: "false-friends", label: "Falsos amigos", emoji: "🎭" },
];

export function topicLabel(id: string): string {
  return TOPICS.find((t) => t.id === id)?.label ?? id;
}
