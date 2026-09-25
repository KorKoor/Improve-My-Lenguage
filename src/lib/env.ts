import "server-only";
import { isAdminConfigured } from "./firebase/admin";
import { isFirebaseWebConfigured } from "./firebase/config";

/**
 * Variables de entorno del servidor. Nunca importar desde componentes cliente
 * (el import de "server-only" rompe el build si ocurre).
 * Documentación: .env.example y docs/DEPLOYMENT.md.
 */
function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export const env = {
  siteUrl: read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  aiProvider: (read("AI_PROVIDER") ?? "gemini") as "gemini" | "openai-compatible" | "none",
  geminiApiKey: read("GEMINI_API_KEY"),
  openaiCompatBaseUrl: read("OPENAI_COMPAT_BASE_URL"),
  openaiCompatApiKey: read("OPENAI_COMPAT_API_KEY"),
  aiModelFast: read("AI_MODEL_FAST"),
  aiModelSmart: read("AI_MODEL_SMART"),
  aiDailyLimitPerUser: Number(read("AI_DAILY_LIMIT_PER_USER") ?? "60"),
} as const;

/**
 * ¿Puede funcionar el área privada? Hace falta la config web de Firebase (login
 * en el navegador) y las credenciales de Admin (sesión + Firestore).
 */
export function isBackendConfigured(): boolean {
  return isFirebaseWebConfigured() && isAdminConfigured();
}
