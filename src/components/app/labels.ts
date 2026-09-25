import { BookOpen, Ear, Headphones, Layers, Mic, Newspaper, PenLine, Repeat, MessageCircle, Sparkles, type LucideIcon } from "lucide-react";
import type { Skill } from "@/lib/content/types";
import type { BlockKind } from "@/lib/engine/planner";

export const SKILL_META: Record<Skill, { label: string; color: string; icon: LucideIcon }> = {
  vocabulary: { label: "Vocabulario", color: "var(--skill-vocabulary)", icon: BookOpen },
  grammar: { label: "Gramática", color: "var(--skill-grammar)", icon: Layers },
  listening: { label: "Listening", color: "var(--skill-listening)", icon: Headphones },
  reading: { label: "Reading", color: "var(--skill-reading)", icon: Newspaper },
  speaking: { label: "Speaking", color: "var(--skill-speaking)", icon: Mic },
  writing: { label: "Writing", color: "var(--skill-writing)", icon: PenLine },
  pronunciation: { label: "Pronunciación", color: "var(--skill-pronunciation)", icon: Ear },
};

export const BLOCK_META: Record<BlockKind, { label: string; color: string; icon: LucideIcon }> = {
  review: { label: "Repaso", color: "var(--skill-reading)", icon: Repeat },
  new_words: { label: "Vocabulario nuevo", color: "var(--skill-vocabulary)", icon: Sparkles },
  grammar: { label: "Gramática", color: "var(--skill-grammar)", icon: Layers },
  listening: { label: "Listening", color: "var(--skill-listening)", icon: Headphones },
  tutor: { label: "Conversación", color: "var(--skill-speaking)", icon: MessageCircle },
};

export function greeting(timezone: string): string {
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: timezone }).format(new Date()));
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Categoría gramatical en español. */
export const POS_ES: Record<string, string> = {
  noun: "sustantivo", verb: "verbo", adjective: "adjetivo", adverb: "adverbio", pronoun: "pronombre",
  preposition: "preposición", conjunction: "conjunción", determiner: "determinante", interjection: "interjección",
  phrase: "expresión", particle: "partícula", numeral: "numeral",
};
