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

/**
 * Como `read`, pero sin distinguir mayúsculas ni espacios en el nombre: en
 * Vercel es fácil crear «Gemini_API_Key» o «gemini_api_key » y que la app no
 * la vea. Sólo para variables cuyo nombre no es ambiguo (claves de IA).
 */
function readLoose(...names: string[]): string | undefined {
  for (const n of names) {
    const exact = read(n);
    if (exact) return exact;
  }
  const wanted = new Set(names.map((n) => n.toUpperCase()));
  for (const [k, v] of Object.entries(process.env)) {
    if (wanted.has(k.trim().toUpperCase()) && v && v.trim() !== "") return v.trim();
  }
  return undefined;
}

export const env = {
  siteUrl: resolveSiteUrl(),
  aiProvider: (read("AI_PROVIDER")?.toLowerCase() ?? "gemini") as "gemini" | "openai-compatible" | "none",
  // Nombre oficial GEMINI_API_KEY; también los habituales de Google, escritos como sea
  // («Gemini_API_Key», «gemini_api_key»…): las variables distinguen mayúsculas.
  geminiApiKey: readLoose("GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"),
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
