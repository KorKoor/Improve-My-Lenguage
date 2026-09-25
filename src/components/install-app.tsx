"use client";

import { Download, Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/**
 * «Instalar la app»: en Android/Chrome/Edge usa el aviso nativo del navegador;
 * en iPhone/iPad (que no lo tiene) explica los dos toques para añadirla.
 * No se muestra si ya está instalada.
 */
export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    try {
      setHidden(localStorage.getItem("iml:install-hidden") === "1");
    } catch {}
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!prompt && !ios) || (compact && hidden)) return null;

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem("iml:install-hidden", "1");
    } catch {}
  };

  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary" aria-hidden>
        <Download size={20} />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">Instala la app en tu teléfono</p>
        <p className="text-muted">Un icono en tu pantalla de inicio: se abre al instante, a pantalla completa.</p>
        {showIos && (
          <ol className="mt-2 space-y-1 text-muted">
            <li className="flex items-center gap-1.5">1. Toca <Share size={15} className="text-primary" aria-label="Compartir" /> «Compartir» abajo en Safari.</li>
            <li className="flex items-center gap-1.5">2. Elige <SquarePlus size={15} className="text-primary" aria-hidden /> «Añadir a pantalla de inicio».</li>
          </ol>
        )}
      </div>
      <div className="flex items-center gap-2">
        {prompt ? (
          <Button
            size="sm"
            onClick={async () => {
              await prompt.prompt();
              const choice = await prompt.userChoice;
              if (choice.outcome === "accepted") setInstalled(true);
              setPrompt(null);
            }}
          >
            Instalar
          </Button>
        ) : (
          !showIos && <Button size="sm" onClick={() => setShowIos(true)}>Cómo instalarla</Button>
        )}
        {compact && (
          <button type="button" onClick={hide} className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-muted" aria-label="No mostrar más">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
