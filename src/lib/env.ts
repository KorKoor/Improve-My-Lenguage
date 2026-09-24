import "server-only";

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
  supabaseUrl: read("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  databaseUrl: read("DATABASE_URL"),
  /** Opcional. Sólo servidor. Permite borrar la identidad en Supabase Auth al eliminar la cuenta. */
  supabaseServiceRoleKey: read("SUPABASE_SERVICE_ROLE_KEY"),

  firebaseApiKey: read("NEXT_PUBLIC_FIREBASE_API_KEY") ?? "AIzaSyDWE1yLqVd6vTfX3tmYgYWLqNnr614i2xQ",
  firebaseAuthDomain: read("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") ?? "improve-my-lenguages.firebaseapp.com",
  firebaseProjectId: read("NEXT_PUBLIC_FIREBASE_PROJECT_ID") ?? "improve-my-lenguages",
  firebaseStorageBucket: read("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ?? "improve-my-lenguages.firebasestorage.app",
  firebaseMessagingSenderId: read("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ?? "1034238311541",
  firebaseAppId: read("NEXT_PUBLIC_FIREBASE_APP_ID") ?? "1:1034238311541:web:f41dce05973c99461e0c3c",
  firebaseMeasurementId: read("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID") ?? "G-KQT1PB2ERD",
  firebaseVapidKey: read("NEXT_PUBLIC_FIREBASE_VAPID_KEY") ?? "BI46w9PaVwPOuvWV4de6ke2QAGfjegR2Pn7XGw2mefT4YjFxdi2MotBr-PAnRhkqeAzTWU0pLMPXuQ8c8G9-Z98",

  aiProvider: (read("AI_PROVIDER") ?? "gemini") as "gemini" | "openai-compatible" | "none",
  geminiApiKey: read("GEMINI_API_KEY"),
  openaiCompatBaseUrl: read("OPENAI_COMPAT_BASE_URL"),
  openaiCompatApiKey: read("OPENAI_COMPAT_API_KEY"),
  aiModelFast: read("AI_MODEL_FAST"),
  aiModelSmart: read("AI_MODEL_SMART"),
  aiDailyLimitPerUser: Number(read("AI_DAILY_LIMIT_PER_USER") ?? "60"),
} as const;

export function isAuthConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey && env.databaseUrl);
}
