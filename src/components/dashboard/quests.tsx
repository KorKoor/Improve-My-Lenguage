"use client";

import { Check, Gift, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { claimQuestAction } from "@/app/app/quest-actions";
import { Confetti } from "@/components/celebrate";
import { cn } from "@/lib/cn";
import type { QuestView, XpView } from "@/lib/services/quests";

/** Anillo de nivel: progreso dentro del nivel actual. */
export function LevelRing({ xp, size = 56 }: { xp: XpView; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} title={`${xp.into} / ${xp.span} XP para el nivel ${xp.level + 1}`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-muted)" strokeWidth={5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - xp.progress)}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.2,0.8,0.2,1)" }}
        />
      </svg>
      <span className="absolute font-display text-lg font-extrabold">{xp.level}</span>
    </span>
  );
}

export function QuestBoard({ quests: initial, xp: initialXp }: { quests: QuestView[]; xp: XpView }) {
  const [quests, setQuests] = useState(initial);
  const [xp, setXp] = useState(initialXp);
  const [gain, setGain] = useState<{ id: string; xp: number } | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [party, setParty] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const done = quests.filter((q) => q.claimed).length;

  function claim(id: string) {
    setError(null);
    setPendingId(id);
    start(async () => {
      const r = await claimQuestAction(id);
      setPendingId(null);
      if (!r.ok) return setError(r.error);
      setQuests((qs) => qs.map((q) => (q.id === id ? { ...q, claimed: true } : q)));
      setXp(r.data.xp);
      setGain({ id, xp: r.data.xpGained });
      setLevelUp(r.data.leveledUp);
      if (r.data.leveledUp || r.data.allDone) setParty((p) => p + 1);
      setTimeout(() => setGain(null), 1600);
    });
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="quests-title">
      {party > 0 && <Confetti key={party} />}
      <div className="flex items-center gap-4">
        <LevelRing xp={xp} />
        <div className="min-w-0 flex-1">
          <h2 id="quests-title" className="font-display text-lg font-extrabold">Misiones de hoy</h2>
          <p className="text-sm text-muted">
            Nivel {xp.level} · {xp.title} · <span className="tabular-nums">{xp.total.toLocaleString("es")}</span> XP
          </p>
        </div>
        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold tabular-nums text-muted">{done}/{quests.length}</span>
      </div>
      {levelUp && (
        <p className="mt-3 rounded-xl bg-primary-soft px-3 py-2 text-center text-sm font-bold text-primary animate-pop-in" role="status">
          🎉 ¡Subiste al nivel {xp.level}! Ahora eres «{xp.title}».
        </p>
      )}
      <ul className="mt-4 space-y-2.5">
        {quests.map((q) => {
          const pct = Math.round((q.value / q.target) * 100);
          return (
            <li key={q.id} className={cn("relative flex items-center gap-3 rounded-2xl border p-3 transition-colors", q.claimed ? "border-success/40 bg-success-soft/60" : q.done ? "border-primary/50 bg-primary-soft/40" : "border-border")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-xl", q.claimed ? "bg-success text-white" : "bg-surface-muted")} aria-hidden>
                {q.claimed ? <Check size={20} strokeWidth={3} /> : q.icon}
              </span>
              <div className="min-w-0 flex-1">
                {q.done ? (
                  <p className={cn("text-sm font-semibold", q.claimed && "text-muted line-through decoration-1")}>{q.title}</p>
                ) : (
                  <Link href={q.href} className="text-sm font-semibold hover:text-primary">{q.title}</Link>
                )}
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <span className={cn("block h-full rounded-full transition-[width] duration-700", q.done ? "bg-success" : "bg-primary")} style={{ width: `${pct}%` }} />
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-muted">{q.value}/{q.target}</span>
                </div>
              </div>
              {q.done && !q.claimed ? (
                <button
                  type="button"
                  onClick={() => claim(q.id)}
                  disabled={pendingId !== null}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary shadow-md animate-pop-in hover:bg-primary-hover"
                >
                  {pendingId === q.id ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Gift size={14} aria-hidden />} +{q.xp} XP
                </button>
              ) : (
                <span className={cn("shrink-0 text-xs font-bold tabular-nums", q.claimed ? "text-success" : "text-muted")}>+{q.xp} XP</span>
              )}
              {gain?.id === q.id && gain.xp > 0 && (
                <span className="pointer-events-none absolute right-4 -top-2 font-display text-lg font-extrabold text-primary animate-xp-float" aria-hidden>
                  +{gain.xp} XP
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-2 text-sm text-danger" role="alert">{error}</p>}
      {done === quests.length && <p className="mt-3 text-center text-sm font-semibold text-success">¡Todas las misiones cumplidas! Vuelve mañana por más.</p>}
    </section>
  );
}
