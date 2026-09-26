import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Micrófono permitido sólo para el propio sitio (práctica oral futura).
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const config: NextConfig = {
  poweredByHeader: false,
  // Los paquetes de vocabulario se leen con fs en el servidor: hay que
  // incluirlos explícitamente en las funciones de Vercel.
  outputFileTracingIncludes: { "/**": ["./data/packs/**", "./data/audio/**", "./data/strokes/**", "./data/readings/**"] },
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
