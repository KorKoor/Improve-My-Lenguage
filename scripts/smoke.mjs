// Test de humo contra el entorno local emulado (npm run dev:emulated).
// Inicia sesión con el usuario demo en el emulador de Auth, canjea el token por
// la cookie de sesión y recorre las páginas privadas y públicas comprobando que
// responden 200 y no muestran la pantalla de error.
//   npm run smoke            (BASE_URL=http://localhost:3000 por defecto)
// Limitación: detecta fallos de servidor y de renderizado inicial, no errores
// que sólo ocurren tras interactuar en el navegador.
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const AUTH_EMULATOR = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
const FIRESTORE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-iml";
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
  "/app/group",
  "/app/novedades",
  "/app/languages",
  "/app/study",
  "/app/study/break",
  "/app/first-steps",
  "/app/first-steps/greetings",
  "/app/more",
];
// Textos de las pantallas de error de la app (error.tsx / not-found).
const ERROR_MARKERS = ["Algo salió mal", "Esta página no existe", "Application error"];

let auth = { idToken: "", uid: "" };

async function signIn() {
  const res = await fetch(`http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
  });
  if (!res.ok) throw new Error(`Auth emulator ${res.status}: ${await res.text()}`);
  const { idToken, localId } = await res.json();
  auth = { idToken, uid: localId };
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

/**
 * Reglas de Firestore: el navegador no puede leer ni escribir NADA, ni siquiera
 * sus propios datos (todo pasa por el servidor con el Admin SDK). Se comprueba
 * contra el emulador con la API REST, anónimo y con el token del propio usuario.
 */
async function rulesCheck() {
  const doc = `http://${FIRESTORE_EMULATOR}/v1/projects/${PROJECT}/databases/(default)/documents`;
  const cases = [
    ["leer su propio perfil", "GET", `${doc}/users/${auth.uid}`, auth.idToken],
    ["leer su perfil sin sesión", "GET", `${doc}/users/${auth.uid}`, null],
    ["escribir su propio perfil", "PATCH", `${doc}/users/${auth.uid}?updateMask.fieldPaths=displayName`, auth.idToken],
    ["leer otra colección", "GET", `${doc}/groups/FAM234`, auth.idToken],
    ["crear un documento", "PATCH", `${doc}/rateLimits/x`, auth.idToken],
  ];
  const out = [];
  for (const [name, method, url, token] of cases) {
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: method === "PATCH" ? JSON.stringify({ fields: { displayName: { stringValue: "hack" } } }) : undefined,
    });
    out.push({ path: `reglas: ${name}`, status: res.status, ms: 0, ok: res.status === 403, why: res.status === 403 ? "" : `esperado 403 (denegado), recibido ${res.status}` });
  }
  // Control negativo: el token «owner» del emulador (admin) SÍ debe poder leer.
  const admin = await fetch(`${doc}/users/${auth.uid}`, { headers: { authorization: "Bearer owner" } });
  out.push({ path: "reglas: control (admin puede leer)", status: admin.status, ms: 0, ok: admin.status === 200, why: admin.status === 200 ? "" : "el emulador no responde como se espera: la prueba de reglas no es fiable" });
  return out;
}

const cookie = await signIn();
const results = [];
for (const p of PUBLIC) results.push(await check(p, null));
for (const p of PRIVATE) results.push(await check(p, cookie));
results.push(...(await rulesCheck()));
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
