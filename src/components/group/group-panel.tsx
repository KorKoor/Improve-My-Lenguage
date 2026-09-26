"use client";

import { Check, Copy, Flame, LogOut, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cheerAction, createGroupAction, joinGroupAction, leaveGroupAction } from "@/app/app/profile-actions";
import { LanguageMark } from "@/components/language-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { GroupView } from "@/lib/services/group";

const CHEERS = ["👏", "💪", "🔥", "❤️", "🎉", "⭐"];

export function GroupPanel({ group }: { group: GroupView | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Mi familia");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState<Record<string, string>>({});

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) return setError(r.error ?? "Algo salió mal.");
      router.refresh();
    });

  if (!group) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card space-y-3 p-6">
          <h2 className="font-display text-xl font-extrabold">Crea tu grupo</h2>
          <p className="text-sm text-muted">Tendrás un código de 6 letras para compartir con tu familia o amigos (hasta 8 personas).</p>
          <label className="block text-sm font-semibold">
            Nombre del grupo
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className="mt-1 block h-11 w-full rounded-xl border border-border bg-surface px-3 font-normal" />
          </label>
          <Button onClick={() => act(() => createGroupAction(name))} disabled={pending}>
            <Users size={16} aria-hidden /> Crear grupo
          </Button>
        </section>
        <section className="card space-y-3 p-6">
          <h2 className="font-display text-xl font-extrabold">Únete con un código</h2>
          <p className="text-sm text-muted">¿Alguien te pasó su código? Escríbelo aquí.</p>
          <label className="block text-sm font-semibold">
            Código
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              inputMode="text"
              autoCapitalize="characters"
              placeholder="ABC234"
              className="mt-1 block h-14 w-full rounded-xl border border-border bg-surface px-3 text-center font-display text-2xl font-extrabold tracking-[0.3em]"
            />
          </label>
          <Button variant="secondary" onClick={() => act(() => joinGroupAction(code))} disabled={pending || code.length !== 6}>
            Unirme
          </Button>
        </section>
        {error && <p className="text-sm text-danger-ink md:col-span-2" role="alert">{error}</p>}
        <p className="text-xs text-muted md:col-span-2">
          En el grupo se comparte sólo tu nombre, avatar, idioma y nivel, racha y minutos de esta semana. Nunca tus errores, textos ni tu correo. Puedes salir cuando quieras.
        </p>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(group.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="space-y-5">
      <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h2 className="font-display text-2xl font-extrabold">{group.name}</h2>
          <p className="text-sm text-muted">{group.members.length} de {group.max} personas · comparte el código para invitar</p>
        </div>
        <button type="button" onClick={copy} className="lift inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-primary-soft px-4 py-2" aria-label={`Copiar código ${group.code}`}>
          <span className="font-display text-2xl font-extrabold tracking-[0.25em] text-primary">{group.code}</span>
          {copied ? <Check size={18} className="text-success-ink" aria-hidden /> : <Copy size={18} className="text-primary" aria-hidden />}
        </button>
      </section>

      <ul className="stagger grid gap-3 sm:grid-cols-2">
        {group.members.map((m) => (
          <li key={m.id} className={cn("card flex items-center gap-3 p-4", m.isMe && "border-primary/40")}>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-xl font-extrabold text-primary" aria-hidden>
              {m.avatar ?? m.name[0]?.toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {m.name} {m.isMe && <span className="text-xs font-normal text-muted">(tú)</span>} {m.isOwner && <span className="text-xs font-normal text-muted">· creador</span>}
              </p>
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
                {m.language && (
                  <span className="inline-flex items-center gap-1">
                    <LanguageMark code={m.language.code} size={16} /> {m.language.name}{m.language.level ? ` ${m.language.level}` : ""}
                  </span>
                )}
                <span className="inline-flex items-center gap-0.5"><Flame size={13} className={m.streak ? "text-warning-ink" : ""} aria-hidden /> {m.streak} d</span>
                <span>{m.weekMinutes} min/sem</span>
              </p>
              {m.studiedToday ? <p className="text-xs font-semibold text-success-ink">✓ Ya estudió hoy</p> : <p className="text-xs text-muted">Aún no estudia hoy</p>}
            </div>
            {!m.isMe && (
              <div className="flex shrink-0 flex-col items-end gap-1">
                {sent[m.id] ? (
                  <span className="animate-pop-in text-2xl" role="img" aria-label="Ánimo enviado">{sent[m.id]}</span>
                ) : (
                  <div className="flex gap-0.5" role="group" aria-label={`Mandar ánimo a ${m.name}`}>
                    {CHEERS.slice(0, 3).map((c) => (
                      <button
                        key={c}
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            setError(null);
                            const r = await cheerAction(m.id, c);
                            if (!r.ok) setError(r.error);
                            else setSent((s) => ({ ...s, [m.id]: c }));
                          })
                        }
                        className="grid size-9 place-items-center rounded-full text-lg transition hover:scale-110 hover:bg-surface-muted"
                        aria-label={`Mandar ${c}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="text-sm text-danger-ink" role="alert">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">Se comparte: nombre, avatar, idioma y nivel, racha y minutos de la semana. Nada más.</p>
        <Button variant="ghost" size="sm" onClick={() => { if (confirm("¿Seguro que quieres salir del grupo?")) act(() => leaveGroupAction()); }} disabled={pending}>
          <LogOut size={14} aria-hidden /> Salir del grupo
        </Button>
      </div>
    </div>
  );
}
