import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** Una grabación humana de Wikimedia Commons / Lingua Libre (scripts/audio/commons_audio.py). */
export interface HumanRecording {
  text: string;
  url: string;
  file: string;
  author: string;
  license: string;
}

/** Grabaciones humanas de un idioma, con autor y licencia de cada archivo. */
export function humanRecordings(lang: string): HumanRecording[] {
  if (!/^[a-z]{2}$/.test(lang)) return [];
  const file = path.join(process.cwd(), "data/audio", `human-${lang}.json`);
  if (!existsSync(file)) return [];
  const data = JSON.parse(readFileSync(file, "utf-8")) as Record<string, Omit<HumanRecording, "text">>;
  return Object.entries(data).map(([text, r]) => ({ text, ...r }));
}

/** Agrupadas por autor (y licencia), de quien más grabó a quien menos. */
export function recordingsByAuthor(lang: string): { author: string; license: string; items: HumanRecording[] }[] {
  const groups = new Map<string, { author: string; license: string; items: HumanRecording[] }>();
  for (const r of humanRecordings(lang)) {
    const k = `${r.author}|${r.license}`;
    let g = groups.get(k);
    if (!g) groups.set(k, (g = { author: r.author, license: r.license, items: [] }));
    g.items.push(r);
  }
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length || a.author.localeCompare(b.author));
}
