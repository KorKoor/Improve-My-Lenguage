// Test de humo contra el entorno local emulado (npm run dev:emulated).
// Inicia sesión con el usuario demo en el emulador de Auth, canjea el token por
// la cookie de sesión y recorre las páginas privadas y públicas comprobando que
// responden 200 y no muestran la pantalla de error.
//   npm run smoke            (BASE_URL=http://localhost:3000 por defecto)
// Limitación: detecta fallos de servidor y de renderizado inicial, no errores
// que sólo ocurren tras interactuar en el navegador.
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
const EMAIL = process.env.SMOKE_EMAIL ?? "demo@improve.local";
const PASSWORD = process.env.SMOKE_PASSWORD ?? "demo-password";

const PUBLIC = ["/", "/features", "/languages", "/languages/fr", "/about", "/privacy", "/creditos", "/login"];
const PRIVATE = [
  "/app",
  "/app/explore",
  "/app/session?minutes=5",
  "/app/review",
  "/app/vocabulary",
  "/app/grammar",
  "/app/verbs",
  "/app/read",
  "/app/read/own",
  "/app/listen",
  "/app/speak",
  "/app/write",
  "/app/tutor",
  "/app/progress",
  "/app/path",
  "/app/profile",
  "/app/profile/test",
  "/app/settings",
];
// Textos de las pantallas de error de la app (error.tsx / not-found).
const ERROR_MARKERS = ["Algo salió mal", "Esta página no existe", "Application error"];

async function signIn() {
  const res = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
  });
  if (!res.ok) throw new Error(`Auth emulator ${res.status}: ${await res.text()}`);
  const { idToken } = await res.json();
  const session = await fetch(`${BASE}/api/auth/session`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ idToken }),
  });
  if (!session.ok) throw new Error(`Session ${session.status}: ${await session.text()}`);
  const cookie = session.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("No se recibió la cookie de sesión");
  return cookie;
}

async function check(path, cookie) {
  const started = Date.now();
  const res = await fetch(`${BASE}${path}`, { headers: cookie ? { cookie } : {}, redirect: "manual" });
  const body = res.status === 200 ? await res.text() : "";
  // Sólo el HTML visible: el payload de React (<script>) incluye plantillas de error.
  const visible = body.replace(/<script[\s\S]*?<\/script>/g, "");
  // Errores en streaming: Next los marca con data-dgst (404 controlado o excepción del servidor).
  const dgst = body.match(/data-dgst="([^"]+)"/)?.[1];
  const serverError = dgst && !dgst.startsWith("NEXT_REDIRECT") ? (dgst.includes("404") ? "404 (no encontrado)" : `error del servidor (${dgst})`) : undefined;
  const marker = serverError ?? ERROR_MARKERS.find((m) => visible.includes(m));
  const ok = res.status === 200 && !marker;
  return { path, status: res.status, ms: Date.now() - started, ok, why: marker ?? (res.status !== 200 ? `HTTP ${res.status} ${res.headers.get("location") ?? ""}` : "") };
}

const cookie = await signIn();
const results = [];
for (const p of PUBLIC) results.push(await check(p, null));
for (const p of PRIVATE) results.push(await check(p, cookie));
// Control negativo: una ruta inexistente DEBE detectarse como error.
const negative = await check("/app/vocabulary/no-existe", cookie);
if (negative.ok) {
  console.error("✗ El detector no reconoce la página de error: revisa ERROR_MARKERS");
  process.exit(2);
}
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${String(r.status).padEnd(3)} ${String(r.ms).padStart(5)} ms  ${r.path}${r.ok ? "" : `  ← ${r.why}`}`);
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} páginas OK`);
process.exit(failed.length ? 1 : 0);
