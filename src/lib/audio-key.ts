/**
 * Audio pregenerado (scripts/audio): clave de búsqueda de un texto en el
 * manifiesto de su idioma y texto que se manda a la voz. Lo usan el generador
 * y el reproductor, así que debe ser idéntico en ambos lados.
 */

/** Quita las marcas de acento del ruso (вода́) y normaliza espacios. */
export function speechText(text: string): string {
  return text.normalize("NFC").replace(/́/g, "").replace(/\s+/g, " ").trim();
}

/** Clave del manifiesto: el texto hablado, en minúsculas. */
export function audioKey(text: string): string {
  return speechText(text).toLowerCase();
}

/** Idiomas con voz libre (uso comercial permitido) para pregenerar audio. */
export const PREGEN_VOICES: Record<string, { voice: string; license: string; source: string }> = {
  en: { voice: "en_US-ljspeech-medium", license: "Dominio público (LJ Speech)", source: "https://keithito.com/LJ-Speech-Dataset/" },
  fr: { voice: "fr_FR-siwis-medium", license: "CC BY 4.0 (SIWIS)", source: "https://datashare.is.ed.ac.uk/handle/10283/2353" },
  de: { voice: "de_DE-thorsten-medium", license: "CC0 (Thorsten-Voice)", source: "https://github.com/thorstenMueller/Thorsten-Voice" },
  it: { voice: "it_IT-paola-medium", license: "CC0", source: "https://huggingface.co/datasets/paolapersico1/Voice-Dataset-Italian" },
  pt: { voice: "pt_BR-faber-medium", license: "CC0", source: "https://github.com/OHF-Voice/voice-datasets" },
  nl: { voice: "nl_NL-pim-medium", license: "CC0", source: "https://github.com/OHF-Voice/voice-datasets" },
  sv: { voice: "sv_SE-nst-medium", license: "CC0 (NST)", source: "https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-17/" },
  ru: { voice: "ru_RU-denis-medium", license: "CC0", source: "https://github.com/OHF-Voice/voice-datasets" },
  zh: { voice: "zh_CN-chaowen-medium", license: "CC0", source: "https://github.com/OHF-Voice/voice-datasets" },
};

/**
 * Variedades aceptadas en las grabaciones de Lingua Libre (código Wikidata
 * del idioma en el nombre del archivo: «LL-Q9186-…»). Evita, por ejemplo,
 * que una palabra china suene en cantonés en un curso de mandarín.
 */
const LL_ALLOWED: Record<string, string[]> = {
  en: ["Q1860", "Q7979"], // inglés, inglés británico
  fr: ["Q150"],
  de: ["Q188"],
  it: ["Q652"],
  pt: ["Q5146"],
  nl: ["Q7411"],
  sv: ["Q9027"],
  ru: ["Q7737"],
  ar: ["Q13955"],
  ja: ["Q5287"],
  ko: ["Q9176"],
  zh: ["Q9192", "Q727694"], // mandarín (no cantonés Q9186, min Q36759 ni «chino» genérico Q7850)
};

/** ¿La grabación es de la variedad correcta? (sólo se comprueban las de Lingua Libre). */
export function audioMatchesLanguage(url: string, lang: string): boolean {
  const m = decodeURIComponent(url).match(/LL-(Q\d+)/);
  if (!m) return true;
  return (LL_ALLOWED[lang] ?? []).includes(m[1]!);
}
