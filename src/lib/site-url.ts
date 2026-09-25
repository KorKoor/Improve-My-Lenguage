/**
 * URL pública del sitio, tolerante a configuraciones incompletas: nunca debe
 * romper el build. Orden: NEXT_PUBLIC_SITE_URL → dominio de producción de
 * Vercel → URL del despliegue de Vercel → localhost. Acepta valores sin
 * protocolo ("korwork.org") y quita la barra final.
 */
export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const candidates = [env.NEXT_PUBLIC_SITE_URL, env.VERCEL_PROJECT_PRODUCTION_URL, env.VERCEL_URL];
  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const url = new URL(withProtocol);
      return url.origin;
    } catch {
      /* valor inválido: probar el siguiente */
    }
  }
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
