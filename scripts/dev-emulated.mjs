// Desarrollo 100 % local: emuladores de Firebase Auth + Firestore y `next dev`
// apuntando a ellos. No necesita service account ni toca el proyecto real
// (usa el proyecto ficticio "demo-iml"). Requiere Java 11+.
// Siembra un usuario demo con historial: demo@improve.local / demo-password
//   npm run dev:emulated
//   npm run dev:emulated -- --mock-ai   (con IA simulada, sin claves)
import { spawn } from "node:child_process";

const PROJECT = "demo-iml";
const env = {
  ...process.env,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: PROJECT,
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${PROJECT}.firebaseapp.com`,
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:000000000000:web:demo",
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  FIREBASE_SERVICE_ACCOUNT: "",
  GOOGLE_APPLICATION_CREDENTIALS: "",
};

// --mock-ai: tutor, escenarios y corrección con IA contra un simulador local.
const mockAi = process.argv.includes("--mock-ai");
if (mockAi) {
  Object.assign(env, {
    AI_PROVIDER: "openai-compatible",
    OPENAI_COMPAT_BASE_URL: "http://127.0.0.1:8787/v1",
    OPENAI_COMPAT_API_KEY: "mock",
  });
  const ai = spawn(process.execPath, ["scripts/mock-ai.mjs"], { stdio: "inherit" });
  process.on("exit", () => ai.kill());
}

const shell = process.platform === "win32";
const port = process.env.PORT ?? "3000";
const inner = `npx tsx --conditions=react-server scripts/seed-demo.ts && npx next dev --port ${port}`;
const cmd = `firebase emulators:exec --only auth,firestore --project ${PROJECT} "${inner}"`;
const child = spawn(cmd, { env, stdio: "inherit", shell: shell ? true : "/bin/sh" });
child.on("exit", (code) => process.exit(code ?? 0));
