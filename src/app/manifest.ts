import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Improve My Languages",
    short_name: "Improve",
    description: "Aprendizaje adaptativo de idiomas: el curso se adapta a ti. Con Afi, tu compañera de aprendizaje.",
    start_url: "/app",
    display: "standalone",
    background_color: "#fbf8f4",
    theme_color: "#5b5fd6",
    lang: "es",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Sesión de hoy", url: "/app/session", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Repasar", url: "/app/review", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
