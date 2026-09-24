/**
 * Prompts estructurados. Nunca "Teach me English": siempre el perfil del
 * alumno como contexto explícito y salidas acotadas (JSON con categorías
 * cerradas) para evitar alucinaciones y poder validarlas.
 * Módulo puro (sin dependencias de servidor) para poder testearlo.
 */
import type { CefrLevel } from "../content/types";

export interface LearnerContext {
  languageName: string; // "inglés"
  languageEnglishName: string; // "English"
  nativeLanguageName: string; // "español"
  level: CefrLevel | "desconocido";
  skills: { skill: string; level: string }[];
  weakAreas: string[];
  recentMistakes: { wrong: string; right: string | null }[];
  interests: string[];
  goal: string | null;
  knownWords: string[];
  explanationDepth: "brief" | "balanced" | "detailed";
  displayName: string | null;
}

export function learnerProfileBlock(c: LearnerContext): string {
  const lines = [
    "USER PROFILE",
    `Name: ${c.displayName ?? "(unknown)"}`,
    `Target language: ${c.languageEnglishName}`,
    `Native language: ${c.nativeLanguageName}`,
    `Estimated level (CEFR): ${c.level}`,
    c.skills.length ? `Skills: ${c.skills.map((s) => `${s.skill} ${s.level}`).join(", ")}` : null,
    c.weakAreas.length ? `Weak areas: ${c.weakAreas.join(", ")}` : null,
    c.recentMistakes.length
      ? `Recent mistakes:\n${c.recentMistakes
          .slice(0, 6)
          .map((m) => `- "${m.wrong}"${m.right ? ` → "${m.right}"` : ""}`)
          .join("\n")}`
      : null,
    c.interests.length ? `Interests: ${c.interests.join(", ")}` : null,
    c.goal ? `Goal: ${c.goal}` : null,
    c.knownWords.length ? `Some words they are learning: ${c.knownWords.slice(0, 25).join(", ")}` : null,
    `Preferred explanation depth: ${c.explanationDepth}`,
  ];
  return lines.filter(Boolean).join("\n");
}

const LEVEL_GUIDE: Record<string, string> = {
  A1: "Use very short sentences, present tense, the 500 most common words. One question at a time.",
  A2: "Use short, simple sentences and common past/future forms. Avoid idioms.",
  B1: "Use everyday language with some connectors (although, however). Occasional idioms, explained if needed.",
  B2: "Speak naturally at moderate speed, with varied structures and some idioms.",
  C1: "Speak naturally, including idioms, nuance and complex structures.",
  C2: "Speak as with an educated native speaker.",
  desconocido: "Start simple (A2) and adapt to the learner's replies.",
};

export function tutorSystemPrompt(c: LearnerContext, topic: string | null): string {
  return [
    `You are the personal ${c.languageEnglishName} tutor of this specific learner, not a generic chatbot.`,
    learnerProfileBlock(c),
    "",
    "HOW TO BEHAVE",
    `- Reply ONLY in ${c.languageEnglishName}, except for a brief clarification in ${c.nativeLanguageName} if the learner is clearly stuck.`,
    `- Level adaptation: ${LEVEL_GUIDE[c.level] ?? LEVEL_GUIDE.desconocido}`,
    "- Keep replies short (1–3 sentences) and end with ONE natural question so the learner speaks more than you.",
    "- Do NOT interrupt the conversation to correct every mistake. At most, if a mistake blocks understanding, recast it naturally (repeat their idea correctly) without lecturing.",
    "- Steer the conversation towards the learner's interests and weak areas when natural (e.g. elicit past tense if that is a weak area).",
    "- Never invent facts about the learner. Never claim to be human.",
    topic ? `- Conversation topic chosen by the learner: ${topic}` : "- Start by proposing a topic related to their interests.",
  ].join("\n");
}

export interface FeedbackItem {
  category: string;
  userText: string;
  correction: string;
  explanation: string;
}

export interface ConversationFeedback {
  summary: string;
  strengths: string[];
  mistakes: FeedbackItem[];
  suggestedFocus: string | null;
}

export function feedbackSystemPrompt(c: LearnerContext, allowedCategories: { id: string; label: string }[]): string {
  return [
    `You are an expert ${c.languageEnglishName} teacher reviewing a learner's messages from a conversation.`,
    learnerProfileBlock(c),
    "",
    "TASK",
    "Analyse ONLY the learner's messages. Find real, objective errors (grammar, vocabulary, word order, literal translation from the native language). Ignore style preferences and informal punctuation.",
    `Write "summary", "strengths" and "explanation" in ${c.nativeLanguageName}, concise and encouraging but honest.`,
    "Classify every mistake into EXACTLY one of these category ids (use \"literal-translation\" for calques from the native language):",
    allowedCategories.map((a) => `- ${a.id}: ${a.label}`).join("\n"),
    "Return at most 6 mistakes, most important first. If there are no mistakes, return an empty array.",
    "",
    "Respond with JSON only, matching exactly:",
    '{"summary": string, "strengths": string[], "mistakes": [{"category": string, "userText": string, "correction": string, "explanation": string}], "suggestedFocus": string | null}',
  ].join("\n");
}

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

/** Valida y sanea la salida del modelo: categorías cerradas y longitudes acotadas. */
export function sanitizeFeedback(raw: unknown, allowed: Set<string>, learnerTexts: string[]): ConversationFeedback | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const corpus = learnerTexts.join("\n").toLowerCase();
  const mistakes: FeedbackItem[] = Array.isArray(r.mistakes)
    ? (r.mistakes as unknown[])
        .map((m) => (m && typeof m === "object" ? (m as Record<string, unknown>) : {}))
        .map((m) => ({
          category: allowed.has(String(m.category)) ? String(m.category) : "vocabulary",
          userText: clip(m.userText, 300),
          correction: clip(m.correction, 300),
          explanation: clip(m.explanation, 400),
        }))
        // Anti-alucinación: el fragmento "erróneo" debe existir en lo que escribió el alumno.
        .filter((m) => m.userText && m.correction && corpus.includes(m.userText.toLowerCase().slice(0, 40)))
        .slice(0, 6)
    : [];
  return {
    summary: clip(r.summary, 600) || "Conversación completada.",
    strengths: Array.isArray(r.strengths) ? (r.strengths as unknown[]).map((s) => clip(s, 200)).filter(Boolean).slice(0, 4) : [],
    mistakes,
    suggestedFocus: clip(r.suggestedFocus, 200) || null,
  };
}

export function openingPrompt(c: LearnerContext, topic: string | null): string {
  return topic
    ? `Start the conversation about: ${topic}. Greet ${c.displayName ?? "the learner"} briefly and ask an opening question.`
    : `Greet ${c.displayName ?? "the learner"} briefly and propose a topic from their interests with an opening question.`;
}
