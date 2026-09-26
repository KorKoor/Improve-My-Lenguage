import { LANGUAGES } from "@/lib/content";
import { GUIDES } from "@/lib/content/guides";
import { BRAND } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/**
 * /llms.txt: resumen en texto plano para asistentes y buscadores con IA
 * (propuesta llmstxt.org). Mismos datos que las páginas públicas.
 */
export function GET() {
  const langs = LANGUAGES.filter((l) => l.status !== "planned").map((l) => l.name).join(", ");
  const body = `# ${BRAND.name}

> ${BRAND.description}

- Filosofía: ${BRAND.philosophy}
- Lema: ${BRAND.tagline}
- Mascota: ${BRAND.mascotLine} Afi no es una sigla.
- Idiomas disponibles (interfaz en español): ${langs}.
- Precio: gratis.
- IA: sólo en el tutor de conversación y en la corrección de escritura; opcional.

## Páginas principales

- [Cómo funciona](${siteUrl}/features): diagnóstico adaptativo, perfil por habilidad, FSRS, errores clasificados, sesiones automáticas.
- [Acerca de](${siteUrl}/about): qué es, qué problema resuelve, tecnología y datos abiertos.
- [Afi](${siteUrl}/afi): la compañera de aprendizaje.
- [Idiomas](${siteUrl}/languages)
- [Créditos y licencias](${siteUrl}/creditos)

## Guías

${GUIDES.map((g) => `- [${g.h1}](${siteUrl}/guias/${g.slug}): ${g.answer}`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
