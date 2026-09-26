/**
 * Piezas puras de la integración con Gemini (sin red ni "server-only", para
 * poder probarlas): qué modelos probar, cuánto «piensa» cada uno, el cuerpo de
 * la petición y cómo leer la respuesta.
 */

export type Tier = "fast" | "smart";

/**
 * Modelos a probar, en orden. El primero es el configurado (AI_MODEL_FAST /
 * AI_MODEL_SMART) o el recomendado; si Google lo retira o la clave no tiene
 * acceso (404), se pasa a los alias «-latest», que Google mantiene siempre
 * apuntando a un modelo vigente, y por último a 2.5, que es estable.
 */
export function geminiModelChain(tier: Tier, configured?: string): string[] {
  const chain =
    tier === "fast"
      ? [configured, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-2.5-flash-lite", "gemini-flash-latest"]
      : [configured, "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash"];
  return [...new Set(chain.filter((m): m is string => Boolean(m)))];
}

/**
 * «Pensar» consume tokens de salida y tiempo. El tutor y el feedback no lo
 * necesitan: con respuestas cortas, un modelo que piensa puede gastar todo el
 * presupuesto pensando y devolver una respuesta vacía. Gemini 2.x se controla
 * con thinkingBudget (0 = sin pensar); 3.x con thinkingLevel. Devuelve las
 * configuraciones a probar en orden (si la API rechaza una, se prueba la
 * siguiente; `undefined` = la del modelo por defecto).
 */
export function thinkingOptionsFor(model: string, tier: Tier): (Record<string, unknown> | undefined)[] {
  const level = { thinkingLevel: tier === "fast" ? "minimal" : "low" };
  const budget = { thinkingBudget: /pro/.test(model) ? 128 : 0 };
  if (/gemini-2\.[05]/.test(model)) return [budget, undefined];
  if (/gemini-[3-9]/.test(model)) return [level, { thinkingLevel: "low" }, undefined];
  // Alias «-latest» (puede ser 2.5 o 3.x) u otro nombre: primero 3.x, luego 2.x.
  return [level, budget, undefined];
}

export interface GeminiRequest {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  json?: boolean;
  maxTokens: number;
  temperature: number;
  thinking?: Record<string, unknown>;
}

export function geminiBody(r: GeminiRequest): Record<string, unknown> {
  return {
    systemInstruction: { parts: [{ text: r.system }] },
    contents: r.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: {
      temperature: r.temperature,
      maxOutputTokens: r.maxTokens,
      ...(r.json ? { responseMimeType: "application/json" } : {}),
      ...(r.thinking ? { thinkingConfig: r.thinking } : {}),
    },
  };
}

export interface GeminiResult {
  text: string;
  finishReason?: string;
  blocked?: string;
  tokens?: number;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { totalTokenCount?: number };
}

/** Texto de la respuesta (sin las partes de «pensamiento») y por qué terminó. */
export function readGemini(data: unknown): GeminiResult {
  const d = (data ?? {}) as GeminiResponse;
  const c = d.candidates?.[0];
  const text = (c?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
  return { text, finishReason: c?.finishReason, blocked: d.promptFeedback?.blockReason, tokens: d.usageMetadata?.totalTokenCount };
}

/** ¿El error dice que el modelo no existe o no está disponible para esta clave? (pasar al siguiente) */
export function isModelMissing(status: number, body: string): boolean {
  return status === 404 || (status === 400 && /not (found|supported)|unknown model|is not available/i.test(body));
}

/** ¿El error es por la configuración de «pensar»? (repetir sin ella) */
export function isThinkingRejected(status: number, body: string): boolean {
  return status === 400 && /thinking/i.test(body);
}
