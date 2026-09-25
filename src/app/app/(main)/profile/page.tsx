import { Lock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CountUp } from "@/components/celebrate";
import { LanguageMark } from "@/components/language-mark";
import { Avatar, IdentityEditor } from "@/components/profile/identity-editor";
import { PersonalityCard } from "@/components/profile/personality-card";
import { buttonClass } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ARCHETYPES } from "@/lib/engine/personality";
import { AVATARS, profileOverview } from "@/lib/services/profile";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const learner = await requireLearner();
  const p = await profileOverview(learner);
  const personality = learner.profile.personality;
  const arch = personality ? ARCHETYPES[personality.archetype] : null;
  const since = new Date(p.memberSince).toLocaleDateString("es", { month: "long", year: "numeric" });
  const unlocked = p.achievements.filter((a) => a.unlockedAt).length;

  const stats: [string, number, string][] = [
    ["Racha actual", p.stats.streak, "🔥"],
    ["Mejor racha", p.stats.bestStreak, "🏆"],
    ["Días activos", p.stats.activeDays, "📅"],
    ["Minutos", p.stats.minutes, "⏱️"],
    ["Ejercicios", p.stats.exercises, "✍️"],
    ["Lecturas", p.stats.readings, "📖"],
    ["Escuchas", p.stats.listening, "🎧"],
    ["Redacciones", p.stats.writings, "🖋️"],
  ];

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden p-6 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary-soft opacity-70 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar avatar={p.avatar} name={p.displayName} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-extrabold">{p.displayName ?? "Tu perfil"}</h1>
            <p className="text-sm text-muted">Aprendiendo desde {since}{p.email ? ` · ${p.email}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {arch && <Chip>{arch.icon} {arch.name}</Chip>}
              <Chip tone="muted">{unlocked} de {p.achievements.length} logros</Chip>
              <Chip tone="muted">{p.languages.length} {p.languages.length === 1 ? "idioma" : "idiomas"}</Chip>
            </div>
          </div>
          <IdentityEditor avatar={p.avatar} name={p.displayName} avatars={AVATARS} />
        </div>
      </section>

      <section aria-label="Estadísticas" className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, value, icon]) => (
          <div key={label} className="card lift p-4">
            <p className="text-sm text-muted">{icon} {label}</p>
            <p className="font-display text-2xl font-extrabold"><CountUp value={value} /></p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Tus idiomas</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {p.languages.map((l) => (
            <li key={l.code} className="card flex items-center gap-3 p-4">
              <LanguageMark code={l.code} size={40} />
              <div className="flex-1">
                <p className="font-semibold">{l.name} {l.active && <span className="text-xs font-normal text-primary">· activo</span>}</p>
                <p className="text-sm text-muted">{l.level ? `Nivel estimado ${l.level}` : l.assessed ? "Midiendo tu nivel…" : "Sin diagnóstico aún"}</p>
              </div>
              {l.level && <Chip>{l.level}</Chip>}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Cómo aprendes mejor</h2>
          {personality && <Link href="/app/profile/test" className="text-sm font-semibold text-primary">Repetir el test</Link>}
        </div>
        {personality && arch ? (
          <>
            <div className="card flex items-center gap-4 p-5">
              <span className="animate-float text-5xl" aria-hidden>{arch.icon}</span>
              <div>
                <p className="font-display text-lg font-bold">{arch.name}</p>
                <p className="text-sm text-muted">{arch.tagline}</p>
              </div>
            </div>
            <PersonalityCard result={personality} />
          </>
        ) : (
          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <span className="text-5xl" aria-hidden>🪞</span>
            <div className="flex-1">
              <p className="font-display text-lg font-bold">Descubre tu forma de aprender</p>
              <p className="text-sm text-muted">15 preguntas, 2 minutos. Ajustamos el ritmo, el reto, las explicaciones y el plan diario a tu manera de ser.</p>
            </div>
            <Link href="/app/profile/test" className={buttonClass("primary")}>
              <Sparkles size={16} /> Hacer el test
            </Link>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Logros</h2>
        <ul className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {p.achievements.map((a) => (
            <li key={a.id} className={`card flex flex-col items-center gap-1 p-4 text-center ${a.unlockedAt ? "lift" : "opacity-55"}`}>
              <span className={`text-3xl ${a.unlockedAt ? "" : "grayscale"}`} aria-hidden>{a.unlockedAt ? a.icon : <Lock className="size-7 text-muted" />}</span>
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-muted">{a.description}</p>
              {a.unlockedAt && <p className="text-[11px] text-primary">{new Date(a.unlockedAt).toLocaleDateString("es")}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
