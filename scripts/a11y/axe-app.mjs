/**
 * Accesibilidad de las pantallas con sesión (la app), con la cuenta demo de
 * `npm run dev:emulated`. Igual que axe-public: WCAG 2.1 AA, claro y oscuro,
 * ancho de móvil, y sin desbordes horizontales. Opcionalmente guarda capturas.
 *
 *   BASE_URL=http://localhost:3000 [SHOTS=dir] node scripts/a11y/axe-app.mjs [rutas…]
 */
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SHOTS;
const THEMES = (process.env.THEMES ?? "light,dark").split(",");
const WIDTH = Number(process.env.WIDTH ?? 390);
const DEFAULT = [
  "/app", "/app/path", "/app/course", "/app/study", "/app/review", "/app/session", "/app/vocabulary", "/app/grammar", "/app/verbs",
  "/app/read", "/app/listen", "/app/speak", "/app/write", "/app/stories", "/app/tutor", "/app/progress", "/app/profile", "/app/settings",
  "/app/more", "/app/explore", "/app/languages", "/app/first-steps", "/app/alphabet", "/app/writing-system", "/app/group", "/app/novedades",
  "/app/start", "/app/assessment",
];
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failures = 0;
for (const theme of THEMES) {
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, colorScheme: theme, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', process.env.DEMO_EMAIL ?? "demo@improve.local");
  await page.fill('input[type="password"]', process.env.DEMO_PASSWORD ?? "demo-password");
  await Promise.all([page.waitForURL(/\/app/, { timeout: 120_000 }), page.locator('form button[type="submit"]').first().click()]);
  for (const path of PAGES) {
    errors.length = 0;
    const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 180_000 });
    if (theme === "dark") await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForTimeout(500);
    await page.addScriptTag({ content: axe });
    const { violations } = await page.evaluate(() =>
      window.axe.run(document, { resultTypes: ["violations"], runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }),
    );
    const scroll = await page.evaluate(() => {
      if (document.documentElement.scrollWidth <= window.innerWidth) return null;
      const el = [...document.querySelectorAll("body *")].reverse().find((e) => e.getBoundingClientRect().right > window.innerWidth + 1);
      return el ? `${el.tagName.toLowerCase()}.${el.className?.toString().slice(0, 60)} «${(el.textContent ?? "").trim().slice(0, 40)}»` : "?";
    });
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${theme}-${WIDTH}${path.replaceAll("/", "_")}.png`, fullPage: true });
    const bad = violations.length || scroll || errors.length || (res && res.status() >= 400);
    if (bad) failures++;
    console.log(`${bad ? "✗" : "✓"} [${theme}] ${path} → ${page.url().replace(BASE, "")} (${res?.status()})${scroll ? ` · desborda: ${scroll}` : ""}`);
    for (const v of violations) console.log(`    [${v.impact}] ${v.id}: ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
    for (const e of [...new Set(errors)].slice(0, 4)) console.log(`    [consola] ${e.slice(0, 200)}`);
  }
  await ctx.close();
}
await browser.close();
if (failures) {
  console.error(`\n${failures} pantallas con problemas.`);
  process.exit(1);
}
console.log("\nSin incidencias.");
