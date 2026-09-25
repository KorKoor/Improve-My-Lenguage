import { scenarioFromTopic, type Scenario } from "../content/scenarios";
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
  /** Preferencias del cuestionario de perfil (si lo hizo). */
  learningStyle?: { correction: "gentle" | "thorough"; challenge: boolean; favors: string } | null;
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
    c.learningStyle
      ? `Learning preferences: wants ${c.learningStyle.correction === "thorough" ? "thorough corrections" : "gentle corrections, only what matters"}; ${c.learningStyle.challenge ? "enjoys being challenged slightly above level" : "prefers a comfortable pace"}; ${c.learningStyle.favors}`
      : null,
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
  const sc = scenarioFromTopic(topic);
  if (sc) return scenarioSystemPrompt(c, sc);
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
  const sc = scenarioFromTopic(topic);
  if (sc) return `Start the role-play in character with one short line that sets the scene and invites the learner to act. End with the goals marker.`;
  return topic
    ? `Start the conversation about: ${topic}. Greet ${c.displayName ?? "the learner"} briefly and ask an opening question.`
    : `Greet ${c.displayName ?? "the learner"} briefly and propose a topic from their interests with an opening question.`;
}

// ── Corrección de escritura ─────────────────────────────────────────────────
export interface WritingMistake {
  original: string;
  correction: string;
  category: string;
  explanation: string;
}

export interface WritingFeedback {
  corrected: string;
  mistakes: WritingMistake[];
  strengths: string[];
  suggestions: string[];
  level: CefrLevel | null;
}

export function writingSystemPrompt(c: LearnerContext, task: string, allowedCategories: { id: string; label: string }[]): string {
  return [
    `You are a warm, precise ${c.languageEnglishName} writing teacher for a ${c.nativeLanguageName}-speaking learner.`,
    learnerProfileBlock(c),
    `TASK THE LEARNER WAS GIVEN: ${task}`,
    "Correct the learner's text. Rules:",
    "- Only report real mistakes that appear VERBATIM in the text (copy the exact wrong fragment into \"original\").",
    "- Prioritise meaning, grammar and naturalness over style; at most 8 mistakes, most important first.",
    `- "category" must be one of: ${allowedCategories.map((x) => x.id).join(", ")}.`,
    `- "explanation": short, in Spanish, adapted to level ${c.level}${c.explanationDepth === "detailed" ? ", with an example" : ""}.`,
    '- "corrected": the full text rewritten correctly and naturally, keeping the learner\'s meaning and level.',
    '- "strengths": 1–3 concrete things they did well (Spanish). "suggestions": 1–3 ideas to sound more natural or advanced (Spanish).',
    '- "level": CEFR level shown by this text (A1–C2).',
    'Reply ONLY with JSON: {"corrected": string, "mistakes": [{"original": string, "correction": string, "category": string, "explanation": string}], "strengths": string[], "suggestions": string[], "level": string}',
  ].join("\n");
}

/** Valida la respuesta de la IA: categorías cerradas y errores que existen de verdad en el texto. */
export function sanitizeWritingFeedback(raw: unknown, allowed: Set<string>, text: string): WritingFeedback | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const list = (v: unknown, max: number) => (Array.isArray(v) ? v.map((x) => str(x, 300)).filter(Boolean).slice(0, max) : []);
  const lower = text.toLowerCase();
  const mistakes: WritingMistake[] = (Array.isArray(r.mistakes) ? r.mistakes : [])
    .map((m) => m as Record<string, unknown>)
    .map((m) => ({ original: str(m.original, 200), correction: str(m.correction, 200), category: str(m.category, 60), explanation: str(m.explanation, 400) }))
    .filter((m) => m.original && m.correction && m.original !== m.correction && lower.includes(m.original.toLowerCase()))
    .map((m) => ({ ...m, category: allowed.has(m.category) ? m.category : "vocabulary" }))
    .slice(0, 8);
  const level = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(str(r.level, 3)) ? (str(r.level, 3) as CefrLevel) : null;
  const corrected = str(r.corrected, 6000);
  if (!corrected && mistakes.length === 0) return null;
  return { corrected: corrected || text, mistakes, strengths: list(r.strengths, 3), suggestions: list(r.suggestions, 3), level };
}

// ── Role-play con objetivos ─────────────────────────────────────────────────
export const GOALS_MARKER = /\[\[goals:([0-9,\s]*)\]\]\s*$/i;

export function scenarioSystemPrompt(c: LearnerContext, sc: Scenario): string {
  return [
    `You are role-playing in ${c.languageEnglishName} with a language learner. You play ${sc.role}`,
    learnerProfileBlock(c),
    "",
    "ROLE-PLAY RULES",
    `- Stay in character. Reply ONLY in ${c.languageEnglishName}, 1–3 short sentences, adapted to level: ${LEVEL_GUIDE[c.level] ?? LEVEL_GUIDE.desconocido}`,
    "- The learner must accomplish these goals by themselves (do not accomplish them for the learner, but create natural openings):",
    ...sc.goalsEn.map((g, i) => `  ${i + 1}. ${g}`),
    "- If the learner is stuck, give a tiny hint in character (e.g. ask a question that invites the goal).",
    "- Do not correct mistakes explicitly; recast naturally if meaning is unclear.",
    "- At the VERY END of every reply, on its own line, write the goals the learner has accomplished so far in the whole conversation, e.g. [[goals:1,3]] or [[goals:]] if none. Only count a goal when the learner clearly did it in the target language.",
    "- When all goals are accomplished, wrap up the scene warmly in character.",
  ].join("\n");
}

/** Separa la respuesta visible del marcador de objetivos (validado: sólo 1..3). */
export function splitGoals(reply: string): { text: string; goals: number[] } {
  const m = reply.match(GOALS_MARKER);
  if (!m) return { text: reply.trim(), goals: [] };
  const goals = [...new Set(m[1]!.split(",").map((x) => Number(x.trim())).filter((n) => Number.isInteger(n) && n >= 1 && n <= 3))].sort();
  return { text: reply.slice(0, m.index).trim(), goals };
}
