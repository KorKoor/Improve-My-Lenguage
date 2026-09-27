import { BookOpen, Headphones, Mic, Layers, MessageCircle, Newspaper, PenLine, Play, Repeat, Type, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ARCHETYPES } from "@/lib/engine/personality";
import { SKILL_META } from "@/components/app/labels";
import { IconBox } from "@/components/ui/icon-box";
import { getSkills } from "@/lib/services/learning";
import { thetaToCefr } from "@/lib/engine/levels";
import { requireLearner } from "@/lib/services/viewer";
import type { Skill } from "@/lib/content/types";

export const metadata: Metadata = { title: "Practicar" };

interface Activity {
  href: string;
  title: string;
  text: string;
  icon: LucideIcon;
  color: string;
  skill?: Skill;
}

const ACTIVITIES: Activity[] = [
  { href: "/app/session", title: "Sesión de hoy", text: "La mezcla que más te conviene ahora mismo.", icon: Play, color: "var(--primary)" },
  { href: "/app/review", title: "Repaso", text: "Las palabras que estás a punto de olvidar.", icon: Repeat, color: "var(--skill-reading)", skill: "vocabulary" },
  { href: "/app/read", title: "Lecturas", text: "Artículos reales a tu nivel. Toca una palabra y la entiendes.", icon: Newspaper, color: "var(--skill-reading)", skill: "reading" },
  { href: "/app/listen", title: "Escucha", text: "Frases reales a la velocidad que elijas, con dictado.", icon: Headphones, color: "var(--skill-listening)", skill: "listening" },
  { href: "/app/speak", title: "Pronunciación", text: "Lee en voz alta y mira qué palabras se entienden.", icon: Mic, color: "var(--skill-pronunciation)", skill: "pronunciation" },
  { href: "/app/write", title: "Escritura", text: "Escribe y recibe correcciones y consejos.", icon: PenLine, color: "var(--skill-writing)", skill: "writing" },
  { href: "/app/tutor", title: "Conversación", text: "Habla con tu tutor sobre lo que te interesa.", icon: MessageCircle, color: "var(--skill-speaking)", skill: "speaking" },
  { href: "/app/verbs", title: "Verbos", text: "Conjuga los verbos más usados en los tiempos de tu nivel.", icon: Type, color: "var(--skill-grammar)", skill: "grammar" },
  { href: "/app/grammar", title: "Gramática", text: "Lecciones claras de A1 a C1 con ejercicios.", icon: Layers, color: "var(--skill-grammar)", skill: "grammar" },
  { href: "/app/vocabulary", title: "Vocabulario", text: "Miles de palabras ordenadas por lo útiles que son.", icon: BookOpen, color: "var(--skill-vocabulary)", skill: "vocabulary" },
];

export default async function PracticeHub() {
  const learner = await requireLearner();
  const skills = await getSkills(learner.ul.id);
  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Practicar</h1>
        <p className="mt-1 max-w-2xl text-muted">Elige cómo quieres practicar {learner.language.name.toLowerCase()} hoy. Todo lo que hagas actualiza tu nivel y tu plan.</p>
      </header>
      <Link href="/app/world" className="card lift group flex items-center gap-4 overflow-hidden bg-gradient-to-r from-warning-soft to-surface p-5 hover:border-primary">
        <span className="text-4xl transition-transform group-hover:rotate-12 group-hover:scale-110" aria-hidden>🌎</span>
        <span className="flex-1">
          <span className="flex items-center gap-2 font-display text-lg font-extrabold">✨ Aprende con el mundo <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning-ink">Nuevo</span></span>
          <span className="block text-sm text-muted">Trae un videojuego, una canción, una noticia o un tema: Afi lo convierte en tu lección.</span>
        </span>
      </Link>
      <Link href="/app/games" className="card lift group flex items-center gap-4 overflow-hidden bg-gradient-to-r from-primary-soft to-surface p-5 hover:border-primary">
        <span className="text-4xl transition-transform group-hover:-rotate-12 group-hover:scale-110" aria-hidden>🎮</span>
        <span className="flex-1">
          <span className="flex items-center gap-2 font-display text-lg font-extrabold">Minijuegos <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning-ink">Nuevo</span></span>
          <span className="block text-sm text-muted">Lluvia de palabras, Memorama, Oído rápido y Ordena la frase. De 1 a 3 minutos.</span>
        </span>
      </Link>
      <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ACTIVITIES.map((a) => {
          const est = a.skill ? skills.get(a.skill) : undefined;
          return (
            <li key={a.href}>
              <Link href={a.href} className="card lift flex h-full flex-col gap-3 p-5 hover:border-primary">
                <div className="flex items-center gap-3">
                  <IconBox icon={a.icon} color={a.color} size={46} />
                  {est && est.evidence > 0 ? (
                    <span className="ml-auto rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-muted">
                      {SKILL_META[a.skill!].label} {thetaToCefr(est.theta)}
                    </span>
                  ) : null}
                </div>
                <h2 className="font-display text-lg font-extrabold">{a.title}</h2>
                <p className="text-sm text-muted">{a.text}</p>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href={learner.profile.personality ? "/app/profile" : "/app/profile/test"} className="card lift flex items-center gap-4 p-5">
        <span className="text-4xl" aria-hidden>{learner.profile.personality ? ARCHETYPES[learner.profile.personality.archetype].icon : "🪞"}</span>
        <span className="flex-1">
          <span className="block font-display text-lg font-extrabold">
            {learner.profile.personality ? `Tu perfil: ${ARCHETYPES[learner.profile.personality.archetype].name}` : "¿Cómo aprendes mejor?"}
          </span>
          <span className="block text-sm text-muted">
            {learner.profile.personality
              ? "Tus ejercicios se ajustan a tu forma de aprender. Míralo o repite el test cuando quieras."
              : "Test de 2 minutos: ajustamos el ritmo, el reto y las explicaciones a tu manera de ser."}
          </span>
        </span>
      </Link>
    </div>
  );
}
