"use client";
import { ClipboardPaste, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { readOwnTextAction } from "@/app/app/skills-actions";
import { Button } from "@/components/ui/button";
import type { ReaderData } from "@/lib/services/reading";
import { Reader } from "./reader";

/** Pega cualquier texto (una noticia, una canción, un correo) y léelo con ayuda. No se guarda. */
export function OwnTextReader({ languageName }: { languageName: string }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReaderData | null>(null);
  if (data) return <Reader data={data} />;
  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <Link href="/app/read" className="text-sm font-semibold text-muted hover:text-text">← Lecturas</Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold">Lee tu propio texto</h1>
      <p className="mt-2 text-muted">
        Pega un texto en {languageName.toLowerCase()} (una noticia, la letra de una canción, un correo del trabajo…). Te diremos su nivel y podrás tocar cada palabra para entenderla. El texto no se guarda.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const res = await readOwnTextAction(text);
          setBusy(false);
          if (res.ok) setData(res.data);
          else setError(res.error);
        }}
      >
        <label className="block">
          <span className="sr-only">Texto</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            maxLength={8000}
            required
            placeholder="Pega aquí tu texto…"
            className="w-full rounded-2xl border border-border bg-surface p-4 text-lg leading-relaxed outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
          />
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" disabled={busy || text.trim().length < 20}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : <ClipboardPaste size={18} />} Analizar y leer
          </Button>
          <span className="text-sm text-muted">{text.length.toLocaleString("es")} / 8 000</span>
        </div>
        {error ? <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-ink">{error}</p> : null}
      </form>
    </div>
  );
}
