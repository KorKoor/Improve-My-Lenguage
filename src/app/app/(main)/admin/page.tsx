import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiCheck } from "@/components/admin/ai-check";
import { ReportActions } from "@/components/admin/report-actions";
import { aiAvailable } from "@/lib/ai/provider";
import { getVocab } from "@/lib/content";
import { listReports } from "@/lib/db/repositories";
import { phraseById } from "@/lib/engine/exercises";
import { isAdminEmail } from "@/lib/env";
import { requireViewer } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Revisión de contenido", robots: { index: false } };

const KIND_ES = { translation: "traducción", audio: "audio", example: "ejemplo", other: "otro" } as const;

/**
 * Reportes de los alumnos agrupados por palabra. La corrección se hace en
 * scripts/content/overrides/<idioma>.json (se muestra el fragmento a pegar)
 * y se reconstruye el paquete; aquí se marca como corregido o descartado.
 */
export default async function AdminPage() {
  const viewer = await requireViewer();
  if (!isAdminEmail(viewer.email)) notFound();
  const open = await listReports("open");
  const groups = new Map<string, typeof open>();
  for (const r of open) groups.set(r.itemId, [...(groups.get(r.itemId) ?? []), r]);
  const rows = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Revisión de contenido</h1>
        <p className="mt-1 text-muted">{open.length} reportes abiertos en {rows.length} palabras o frases. Corrige en <code>scripts/content/overrides/&lt;idioma&gt;.json</code>, reconstruye el paquete y márcalo como corregido.</p>
      </header>
      <AiCheck configured={aiAvailable()} />
      {rows.length === 0 && <p className="card p-6 text-muted">No hay reportes pendientes. 🎉</p>}
      <ul className="space-y-3">
        {rows.map(([itemId, rs]) => {
          const v = getVocab(itemId);
          const ph = v ? null : phraseById(itemId);
          const lemma = v?.lemma ?? ph?.text ?? itemId;
          const snippet = v ? `"${v.lemma}": ${JSON.stringify(v.translations.es ?? [])},` : null;
          return (
            <li key={itemId} className="card p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-extrabold" lang={rs[0]!.language}>{lemma} <span className="text-sm font-semibold text-muted">· {rs[0]!.language} · {rs.length} {rs.length === 1 ? "reporte" : "reportes"}</span></p>
                  <p className="text-sm text-muted">Ahora: {v ? `${v.pos} = ${(v.translations.es ?? []).join(" / ")}` : ph ? `${ph.text} = ${ph.es} (Primeros pasos: src/lib/content/first-steps.ts)` : "(no encontrado)"}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {rs.slice(0, 5).map((r) => (
                      <li key={r.id}>🚩 {KIND_ES[r.kind]}{r.note ? <> — «{r.note}»</> : null} <span className="text-xs text-muted">{r.createdAt.toISOString().slice(0, 10)}</span></li>
                    ))}
                  </ul>
                  {snippet && <pre className="mt-2 overflow-x-auto rounded-xl bg-surface-muted p-2 text-xs">{snippet}</pre>}
                </div>
                <ReportActions itemId={itemId} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
