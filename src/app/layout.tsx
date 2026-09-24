import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import FirebasePush from "@/components/firebase-push";
import { themeScript } from "@/components/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["700", "800"], variable: "--font-nunito", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Improve My Languages — Aprende idiomas con un sistema que se adapta a ti",
    template: "%s · Improve My Languages",
  },
  description:
    "Plataforma adaptativa para aprender idiomas de forma autodidacta: diagnóstico real de nivel, repetición espaciada (FSRS), análisis de errores y un tutor personal. El curso se adapta a ti.",
  applicationName: "Improve My Languages",
  keywords: ["aprender inglés", "aprender idiomas", "repetición espaciada", "FSRS", "CEFR", "tutor de idiomas", "autodidacta"],
  openGraph: {
    type: "website",
    siteName: "Improve My Languages",
    locale: "es_MX",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#14121c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${nunito.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
          Saltar al contenido
        </a>
        <FirebasePush />
        {children}
      </body>
    </html>
  );
}
