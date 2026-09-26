import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Clásicos de dominio público importados de Wikisource y revisados a mano
 * (scripts/content/build_classics.py). El nivel no se guarda: se calcula
 * para cada alumno con su vocabulario.
 */
export interface Classic {
  id: string;
  title: string;
  author: string;
  work: string;
  url: string;
  license: string;
  /** Recortado: es el comienzo de un texto más largo. */
  excerpt: boolean;
  paragraphs: string[];
}

const cache = new Map<string, Classic[]>();

export function classicsFor(lang: string): Classic[] {
  if (!cache.has(lang)) {
    const file = path.join(process.cwd(), "data/readings", `${lang}.json`);
    cache.set(lang, /^[a-z]{2}$/.test(lang) && existsSync(file) ? (JSON.parse(readFileSync(file, "utf-8")) as Classic[]) : []);
  }
  return cache.get(lang)!;
}

export function classicByTitle(lang: string, title: string): Classic | null {
  return classicsFor(lang).find((c) => c.title === title) ?? null;
}
