import "server-only";
import { isAdminConfigured } from "./firebase/admin";
import { isFirebaseWebConfigured } from "./firebase/config";
import { resolveSiteUrl } from "./site-url";

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
  siteUrl: resolveSiteUrl(),
  aiProvider: (read("AI_PROVIDER")?.toLowerCase() ?? "gemini") as "gemini" | "openai-compatible" | "none",
  // Nombre oficial GEMINI_API_KEY; también se aceptan los habituales de Google y el nombre en minúsculas
  // (las variables distinguen mayúsculas: «gemini_api_key» en Vercel no llegaría como GEMINI_API_KEY).
  geminiApiKey: read("GEMINI_API_KEY") ?? read("gemini_api_key") ?? read("GOOGLE_API_KEY") ?? read("GOOGLE_GENERATIVE_AI_API_KEY"),
  /** Sólo para pruebas o un proxy: por defecto la API pública de Google. */
  geminiBaseUrl: read("GEMINI_BASE_URL") ?? "https://generativelanguage.googleapis.com/v1beta",
  openaiCompatBaseUrl: read("OPENAI_COMPAT_BASE_URL"),
  openaiCompatApiKey: read("OPENAI_COMPAT_API_KEY"),
  aiModelFast: read("AI_MODEL_FAST"),
  aiModelSmart: read("AI_MODEL_SMART"),
  aiDailyLimitPerUser: Number(read("AI_DAILY_LIMIT_PER_USER") ?? "60"),
  /** Correos (separados por comas) que pueden revisar los reportes de contenido. */
  adminEmails: (read("ADMIN_EMAILS") ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
} as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && env.adminEmails.includes(email!.toLowerCase());
}

/**
 * ¿Puede funcionar el área privada? Hace falta la config web de Firebase (login
 * en el navegador) y las credenciales de Admin (sesión + Firestore).
 */
export function isBackendConfigured(): boolean {
  return isFirebaseWebConfigured() && isAdminConfigured();
}
