"use client";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createWorldLessonAction } from "@/app/app/world-actions";
import { Afi } from "@/components/afi/afi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { WORLD_KINDS, type WorldKind } from "@/lib/engine/world";

export const RECENT_KEY = "iml-world-recent";
export interface RecentLesson { id: string; title: string; kind: WorldKind; at: number }

const IDEAS: { kind: WorldKind; text: string }[] = [
  { kind: "game", text: "Minecraft" },
  { kind: "topic", text: "el sistema solar" },
  { kind: "song", text: "«Imagine» de John Lennon" },
  { kind: "wikipedia", text: "Torre Eiffel" },
  { kind: "topic", text: "cocina japonesa" },
  { kind: "game", text: "Pokémon" },
];

/** «Learn from the world»: eliges de dónde aprender y Afi prepara la lección. */
export function WorldStart({ languageName, ready, reason }: { languageName: string; ready: boolean; reason?: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<WorldKind>("topic");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentLesson[]>([]);
  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      /* sin historial */
    }
  }, []);
  const meta = WORLD_KINDS.find((k) => k.id === kind)!;

  const submit = async (k = kind, text = input) => {
    if (busy || !text.trim()) return;
    setBusy(true);
    setError(null);
    const res = await createWorldLessonAction(k, text);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    router.push(`/app/world/${res.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex items-center gap-4 animate-rise">
        <div className="flex-1">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-bold text-warning-ink"><Sparkles size={14} aria-hidden /> Learn from the world</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Aprende con lo que te gusta</h1>
          <p className="mt-2 text-muted">Trae un videojuego, una canción, una noticia, un tema o una página, y Afi lo convierte en una lección de {languageName.toLowerCase()} a tu nivel: vocabulario, lectura, preguntas, escucha, conversación y escritura.</p>
        </div>
        <Afi size={96} mood={busy ? "thinking" : "curious"} motion={busy ? "breathe" : "float"} className="hidden sm:block" />
      </header>

      {!ready ? (
        <div className="card flex flex-col items-start gap-3 p-5">
          <p className="text-muted">{reason}</p>
          <Link href="/app/settings" className="font-semibold text-primary underline underline-offset-4">Ir a Configuración</Link>
        </div>
      ) : (
        <form
          className="card space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <fieldset>
            <legend className="text-sm font-semibold">¿De dónde quieres aprender?</legend>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de fuente">
              {WORLD_KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  role="radio"
                  aria-checked={kind === k.id}
                  onClick={() => {
                    setKind(k.id);
                    setError(null);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                    kind === k.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface hover:border-primary",
                  )}
                >
                  <span aria-hidden>{k.emoji}</span> {k.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-sm font-semibold">{meta.input === "url" ? "Dirección de la página" : meta.input === "long" ? "Tu texto" : "Escribe el nombre o el tema"}</span>
            {meta.input === "long" ? (
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={7} maxLength={8000} placeholder={meta.placeholder} className="mt-1.5 w-full rounded-xl border border-border bg-surface p-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft" />
            ) : (
              <input value={input} onChange={(e) => setInput(e.target.value)} type={meta.input === "url" ? "url" : "text"} maxLength={500} placeholder={meta.placeholder} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft" />
            )}
          </label>
          {kind === "song" && <p className="text-xs text-muted">Afi no copia la letra: prepara la lección sobre el tema y la historia de la canción.</p>}
          {error && <p className="text-sm font-semibold text-danger-ink" role="alert">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy || !input.trim()}>
            {busy ? <><Loader2 className="animate-spin" size={18} aria-hidden /> Afi está preparando tu lección…</> : <><Sparkles size={18} aria-hidden /> Crear mi lección</>}
          </Button>
          <p aria-live="polite" className="sr-only">{busy ? "Preparando la lección; tarda unos segundos." : ""}</p>
        </form>
      )}

      {ready && (
        <section aria-labelledby="ideas">
          <h2 id="ideas" className="text-xs font-bold uppercase tracking-wider text-muted">Ideas</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {IDEAS.map((i) => (
              <li key={i.text}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setKind(i.kind);
                    setInput(i.text);
                    void submit(i.kind, i.text);
                  }}
                  className="rounded-full bg-surface-muted px-3.5 py-2 text-sm font-medium hover:bg-primary-soft hover:text-primary disabled:opacity-50"
                >
                  {WORLD_KINDS.find((k) => k.id === i.kind)!.emoji} {i.text}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section aria-labelledby="recent">
          <h2 id="recent" className="text-xs font-bold uppercase tracking-wider text-muted">Tus lecciones</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={`/app/world/${r.id}`} className="card lift flex items-center gap-3 p-3 hover:border-primary">
                  <span className="text-xl" aria-hidden>{WORLD_KINDS.find((k) => k.id === r.kind)?.emoji ?? "✨"}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
