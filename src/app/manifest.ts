import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Improve My Languages",
    short_name: "Improve",
    description: "Aprende idiomas con un sistema que se adapta a ti.",
    start_url: "/app",
    display: "standalone",
    background_color: "#fbf8f4",
    theme_color: "#5b5fd6",
    lang: "es",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
