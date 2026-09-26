import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import { comfortScript } from "@/components/comfort";
import { themeScript } from "@/components/theme";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["700", "800"], variable: "--font-nunito", display: "swap" });


const DESCRIPTION =
  "Improve My Languages es una plataforma de aprendizaje adaptativo de idiomas: mide tu nivel por habilidad (MCER), programa tus repasos con repetición espaciada FSRS, detecta tus errores recurrentes y construye cada sesión para ti. Te acompaña Afi.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Improve My Languages — Aprendizaje adaptativo de idiomas",
    template: "%s · Improve My Languages",
  },
  description: DESCRIPTION,
  applicationName: "Improve My Languages",
  openGraph: {
    type: "website",
    siteName: "Improve My Languages",
    locale: "es_MX",
    url: siteUrl,
    title: "Improve My Languages — El curso se adapta a ti",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "Improve My Languages — El curso se adapta a ti", description: DESCRIPTION },
  robots: { index: true, follow: true },
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Improve", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // El diseño es claro por defecto; el modo oscuro sólo se activa si el usuario lo elige.
  themeColor: "#fbf8f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${nunito.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + comfortScript }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
