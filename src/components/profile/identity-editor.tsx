"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateIdentityAction } from "@/app/app/profile-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function Avatar({ avatar, name, size = 88 }: { avatar: string | null; name: string | null; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-soft to-surface-muted font-display font-extrabold text-primary ring-4 ring-surface shadow-md"
      style={{ width: size, height: size, fontSize: avatar ? size * 0.5 : size * 0.4 }}
      aria-hidden
    >
      {avatar ?? (name?.[0]?.toUpperCase() || "🙂")}
    </span>
  );
}

export function IdentityEditor({ avatar, name, avatars }: { avatar: string | null; name: string | null; avatars: readonly string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState(name ?? "");
  const [draftAvatar, setDraftAvatar] = useState<string | null>(avatar);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setError(null);
    start(async () => {
      const r = await updateIdentityAction({ avatar: draftAvatar, displayName: draftName });
      if (!r.ok) return setError(r.error);
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Pencil size={14} /> Editar perfil
      </Button>
    );
  }
  return (
    <div className="card animate-sheet w-full space-y-4 p-5">
      <label className="block text-sm font-semibold">
        Tu nombre
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          maxLength={40}
          className="mt-1 block h-11 w-full rounded-xl border border-border bg-surface px-3 font-normal"
        />
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">Elige tu avatar</legend>
        <div className="mt-2 grid grid-cols-8 gap-2 sm:grid-cols-10">
          <button
            type="button"
            onClick={() => setDraftAvatar(null)}
            className={cn("grid aspect-square place-items-center rounded-xl border text-sm font-bold", draftAvatar === null ? "border-primary bg-primary-soft" : "border-border")}
            aria-pressed={draftAvatar === null}
            aria-label="Inicial de tu nombre"
          >
            {draftName[0]?.toUpperCase() || "A"}
          </button>
          {avatars.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setDraftAvatar(a)}
              className={cn("grid aspect-square place-items-center rounded-xl border text-2xl transition-transform hover:scale-110", draftAvatar === a ? "border-primary bg-primary-soft" : "border-border")}
              aria-pressed={draftAvatar === a}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </div>
  );
}
