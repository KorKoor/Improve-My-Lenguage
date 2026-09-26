/**
 * Accesibilidad de las páginas públicas con axe-core (WCAG 2.1 AA + buenas
 * prácticas), en modo claro y oscuro y a ancho de móvil. Falla si hay
 * cualquier incidencia. Se usa en CI contra `next start`.
 *
 *   BASE_URL=http://localhost:3000 node scripts/a11y/axe-public.mjs
 *   (CHROMIUM_PATH=… para usar un Chromium ya instalado)
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PAGES = ["/", "/features", "/languages", "/languages/en", "/languages/ja", "/languages/ar", "/guias", "/guias/aprendizaje-adaptativo", "/guias/nivel-mcer", "/afi", "/about", "/privacy", "/creditos", "/creditos/audio/fr", "/no-existe"];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failures = 0;
for (const theme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: theme });
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 120_000 });
    if (theme === "dark") await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.addScriptTag({ content: axe });
    const { violations } = await page.evaluate(() =>
      window.axe.run(document, { resultTypes: ["violations"], runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }),
    );
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (violations.length || scroll) failures++;
    console.log(`${violations.length || scroll ? "✗" : "✓"} [${theme}] ${path}${scroll ? " · desborda en horizontal" : ""}`);
    for (const v of violations) console.log(`    [${v.impact}] ${v.id}: ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  }
  await page.close();
}
await browser.close();
if (failures) {
  console.error(`\n${failures} páginas con problemas de accesibilidad.`);
  process.exit(1);
}
console.log("\nSin incidencias de accesibilidad.");
