import { Compass, Newspaper, Podcast, Video } from "lucide-react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { IconBox } from "@/components/ui/icon-box";

export const metadata: Metadata = { title: "Explorar" };

export default function Explore() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2"><h1 className="font-display text-3xl font-extrabold">Explorar</h1><Chip tone="muted">Fase 3</Chip></div>
        <p className="mt-1 max-w-2xl text-muted">Contenido real de internet (artículos, vídeos, podcasts) analizado y convertido en ejercicios a tu nivel. Guardaremos sólo metadatos, fragmentos permitidos y el análisis, y te enviaremos a la fuente original.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [Newspaper, "Artículos", "Lectura adaptada con vocabulario y preguntas."],
          [Video, "Vídeos", "Listening con transcripción y dictado."],
          [Podcast, "Podcasts", "Episodios cortos con palabras clave."],
        ].map(([Icon, t, d]) => (
          <Card key={t as string}>
            <IconBox icon={Icon as typeof Compass} color="var(--skill-reading)" size={44} />
            <h2 className="mt-3 font-display text-lg font-extrabold">{t as string}</h2>
            <p className="mt-1 text-sm text-muted">{d as string}</p>
          </Card>
        ))}
      </div>
      <Card className="bg-primary-soft">
        <p className="font-semibold">Mientras tanto</p>
        <p className="mt-1 text-sm text-muted">Tu tutor puede conversar sobre cualquier tema que te interese, y el vocabulario de tus temas favoritos ya se prioriza en tus sesiones.</p>
      </Card>
    </div>
  );
}
