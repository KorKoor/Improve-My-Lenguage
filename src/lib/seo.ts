import { siteUrl } from "./site-url";

/** Identidad de marca: una sola fuente para títulos, metadatos y datos estructurados (docs/BRAND.md). */
export const BRAND = {
  name: "Improve My Languages",
  tagline: "Learn smarter. Become better.",
  philosophy: "El usuario no se adapta al curso. El curso se adapta a ti.",
  mascot: "Afi",
  mascotLine: "Afi es la mascota y compañera de aprendizaje de Improve My Languages.",
  description:
    "Plataforma de aprendizaje adaptativo de idiomas: mide tu nivel por habilidad (MCER), programa los repasos con repetición espaciada FSRS, detecta tus errores recurrentes y construye cada sesión según esos datos.",
} as const;

export const abs = (path: string) => `${siteUrl}${path === "/" ? "" : path}`;

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": `${abs("/")}#organization`,
    name: BRAND.name,
    url: abs("/"),
    logo: abs("/icons/icon-512.png"),
    slogan: BRAND.tagline,
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": `${abs("/")}#website`,
    name: BRAND.name,
    url: abs("/"),
    inLanguage: "es",
    publisher: { "@id": `${abs("/")}#organization` },
  };
}

/** La aplicación tal como es hoy (sólo funciones disponibles). */
export function webAppLd(languages: string[]) {
  return {
    "@type": "WebApplication",
    "@id": `${abs("/")}#app`,
    name: BRAND.name,
    url: abs("/"),
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "es",
    description: `${BRAND.description} ${BRAND.mascotLine}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Diagnóstico adaptativo de nivel por habilidad (MCER)",
      "Repetición espaciada FSRS",
      "Clasificación de errores recurrentes",
      "Sesiones personalizadas según tu tiempo y tus debilidades",
      "Lecturas reales a tu nivel",
      "Escucha y dictado",
      "Práctica de pronunciación",
      "Corrección de escritura",
      "Tutor de conversación con IA (opcional)",
    ],
    about: languages.map((name) => ({ "@type": "Language", name })),
    publisher: { "@id": `${abs("/")}#organization` },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
