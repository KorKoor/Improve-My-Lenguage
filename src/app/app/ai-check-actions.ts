"use server";

import { activeGeminiModels, aiAvailable, generate } from "@/lib/ai/provider";
import { env, isAdminEmail } from "@/lib/env";
import { requireViewer } from "@/lib/services/viewer";

export type AiCheck =
  | { ok: true; provider: string; model?: string; ms: number; reply: string }
  | { ok: false; provider: string; error: string };

/** Panel de administración: una llamada mínima para comprobar que la IA responde y con qué modelo. */
export async function checkAiAction(): Promise<AiCheck> {
  const viewer = await requireViewer();
  if (!isAdminEmail(viewer.email)) return { ok: false, provider: env.aiProvider, error: "Sólo para administradores." };
  if (!aiAvailable()) return { ok: false, provider: env.aiProvider, error: "No hay clave configurada (GEMINI_API_KEY) o AI_PROVIDER=none. Si acabas de añadirla en Vercel, vuelve a desplegar." };
  const started = Date.now();
  try {
    const reply = await generate({
      tier: "smart",
      system: "Eres Afi, una nube con audífonos que ayuda a aprender idiomas. Responde en español, en una frase corta.",
      messages: [{ role: "user", content: "Saluda y di «hola» en japonés." }],
      maxTokens: 60,
      temperature: 0.4,
    });
    return { ok: true, provider: env.aiProvider, model: activeGeminiModels().smart ?? env.aiModelSmart, ms: Date.now() - started, reply: reply.slice(0, 300) };
  } catch (err) {
    return { ok: false, provider: env.aiProvider, error: (err instanceof Error ? err.message : String(err)).slice(0, 400) };
  }
}
