import "server-only";
import { env } from "../env";
import { geminiBody, geminiModelChain, isModelMissing, isThinkingRejected, readGemini, thinkingOptionsFor } from "./gemini";

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

const OPENAI_DEFAULTS = { fast: "llama-3.1-8b-instant", smart: "llama-3.3-70b-versatile" } as const;

export function aiAvailable(): boolean {
  if (env.aiProvider === "none") return false;
  if (env.aiProvider === "gemini") return Boolean(env.geminiApiKey);
  return Boolean(env.openaiCompatBaseUrl && env.openaiCompatApiKey);
}

function configuredModel(tier: ModelTier): string | undefined {
  return tier === "fast" ? env.aiModelFast : env.aiModelSmart;
}

const TIMEOUT_MS = 25_000;

// Modelo y ajuste de «pensar» que ya funcionaron (por nivel): la búsqueda se hace una vez por instancia.
const resolved: Partial<Record<ModelTier, { model: string; thinking?: Record<string, unknown> }>> = {};

/** Qué modelo de Gemini se está usando (para el panel de administración). */
export function activeGeminiModels(): Partial<Record<ModelTier, string>> {
  return { fast: resolved.fast?.model, smart: resolved.smart?.model };
}

async function postGemini(model: string, body: unknown): Promise<Response> {
  return fetch(`${env.geminiBaseUrl.replace(/\/$/, "")}/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": env.geminiApiKey! },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

/**
 * Gemini con red de seguridad: si el modelo no existe para esta clave se pasa
 * al siguiente de la cadena; si la API rechaza el ajuste de «pensar», se
 * prueba el siguiente ajuste; si la respuesta se queda sin tokens antes de
 * escribir nada, se repite una vez con más margen. Lo que funciona se recuerda.
 */
async function callGemini(o: GenerateOptions): Promise<string> {
  const chain = geminiModelChain(o.tier, configuredModel(o.tier));
  const known = resolved[o.tier];
  const models = known ? [known.model, ...chain.filter((m) => m !== known.model)] : chain;
  let lastError: unknown = new Error("Gemini: ningún modelo disponible");
  for (const m of models) {
    let missing = false;
    const options = known?.model === m ? [known.thinking, ...thinkingOptionsFor(m, o.tier)] : thinkingOptionsFor(m, o.tier);
    for (const thinking of [...new Map(options.map((t) => [JSON.stringify(t ?? null), t])).values()]) {
      let maxTokens = o.maxTokens ?? 800;
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await postGemini(m, geminiBody({ system: o.system, messages: o.messages, json: o.json, temperature: o.temperature ?? 0.7, maxTokens, thinking }));
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          if (res.status === 401 || res.status === 403) throw new AiUnavailableError("La clave de Gemini no es válida o no tiene permiso para esta API.");
          lastError = new Error(`Gemini ${res.status} (${m}): ${body.slice(0, 300)}`);
          if (isThinkingRejected(res.status, body)) break; // siguiente ajuste de «pensar»
          if (isModelMissing(res.status, body)) {
            missing = true; // siguiente modelo
            break;
          }
          throw lastError; // 429/5xx: generate() decide si reintentar
        }
        const r = readGemini(await res.json());
        if (r.blocked || r.finishReason === "SAFETY" || r.finishReason === "PROHIBITED_CONTENT") {
          throw new AiUnavailableError("No puedo responder a eso. Prueba a decirlo de otra forma.");
        }
        if (!r.text && r.finishReason === "MAX_TOKENS" && attempt === 0) {
          maxTokens += 1024; // pensó demasiado: una vez más, con margen
          continue;
        }
        if (!r.text) throw new Error(`Gemini devolvió una respuesta vacía (${m}, ${r.finishReason ?? "sin motivo"})`);
        resolved[o.tier] = { model: m, thinking };
        return r.text;
      }
      if (missing) break;
    }
  }
  throw lastError;
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
      model: configuredModel(o.tier) ?? OPENAI_DEFAULTS[o.tier],
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
