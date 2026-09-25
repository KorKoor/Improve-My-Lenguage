// Desarrollo 100 % local: emuladores de Firebase Auth + Firestore y `next dev`
// apuntando a ellos. No necesita service account ni toca el proyecto real
// (usa el proyecto ficticio "demo-iml"). Requiere Java 11+.
//   npm run dev:emulated
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

const shell = process.platform === "win32";
const port = process.env.PORT ?? "3000";
const cmd = `firebase emulators:exec --only auth,firestore --project ${PROJECT} "npx next dev --port ${port}"`;
const child = spawn(cmd, { env, stdio: "inherit", shell: shell ? true : "/bin/sh" });
child.on("exit", (code) => process.exit(code ?? 0));
