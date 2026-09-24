import "server-only";
import { env } from "../env";

/**
 * Capa de IA agnóstica al proveedor.
 *
 * - "fast": tareas simples y baratas (clasificar errores, generar un prompt).
 * - "smart": tutoría conversacional y feedback de escritura.
 *
 * Proveedores soportados sin coste inicial:
 *   • Gemini API (capa gratuita de Google AI Studio).
 *   • Cualquier API compatible con OpenAI (Groq, OpenRouter con modelos :free,
 *     Ollama local…) vía OPENAI_COMPAT_BASE_URL.
 * Si no hay clave, `aiAvailable()` es false y la app sigue funcionando sin IA.
 */
export type ModelTier = "fast" | "smart";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  system: string;
  messages: ChatMessage[];
  tier: ModelTier;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export class AiUnavailableError extends Error {
  constructor(msg = "La IA no está disponible en este momento.") {
    super(msg);
  }
}

const DEFAULT_MODELS = {
  gemini: { fast: "gemini-3.5-flash-lite", smart: "gemini-3.5-flash" },
  "openai-compatible": { fast: "llama-3.1-8b-instant", smart: "llama-3.3-70b-versatile" },
} as const;

export function aiAvailable(): boolean {
  if (env.aiProvider === "none") return false;
  if (env.aiProvider === "gemini") return Boolean(env.geminiApiKey);
  return Boolean(env.openaiCompatBaseUrl && env.openaiCompatApiKey);
}

function model(tier: ModelTier): string {
  if (tier === "fast" && env.aiModelFast) return env.aiModelFast;
  if (tier === "smart" && env.aiModelSmart) return env.aiModelSmart;
  const p = env.aiProvider === "openai-compatible" ? "openai-compatible" : "gemini";
  return DEFAULT_MODELS[p][tier];
}

const TIMEOUT_MS = 25_000;

async function callGemini(o: GenerateOptions): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model(o.tier))}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": env.geminiApiKey! },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: o.system }] },
      contents: o.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: o.temperature ?? 0.7,
        maxOutputTokens: o.maxTokens ?? 800,
        ...(o.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text) throw new Error("Gemini devolvió una respuesta vacía");
  return text;
}

async function callOpenAiCompatible(o: GenerateOptions): Promise<string> {
  const base = env.openaiCompatBaseUrl!.replace(/\/$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.openaiCompatApiKey}`,
    },
    body: JSON.stringify({
      model: model(o.tier),
      messages: [{ role: "system", content: o.system }, ...o.messages],
      temperature: o.temperature ?? 0.7,
      max_tokens: o.maxTokens ?? 800,
      ...(o.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LLM ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("El proveedor devolvió una respuesta vacía");
  return text;
}

/** Genera texto. Reintenta una vez ante errores transitorios (429/5xx/timeout). */
export async function generate(o: GenerateOptions): Promise<string> {
  if (!aiAvailable()) throw new AiUnavailableError();
  const call = env.aiProvider === "openai-compatible" ? callOpenAiCompatible : callGemini;
  try {
    return await call(o);
  } catch (err) {
    const msg = String(err);
    const transient = /429|500|502|503|504|timeout|aborted/i.test(msg);
    if (!transient) throw err;
    await new Promise((r) => setTimeout(r, 1200));
    return call(o);
  }
}

/** Extrae y parsea JSON de la respuesta (tolera ```json ... ```). */
export function parseJson<T>(text: string): T | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}
