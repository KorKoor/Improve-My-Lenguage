import Link from "next/link";
import { SidebarNav, TabBar } from "@/components/app/nav";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ComfortSync } from "@/components/comfort";
import { Logo } from "@/components/logo";
import { LanguageMark } from "@/components/language-mark";
import { getLanguage } from "@/lib/content";
import { overallTheta, thetaToCefr } from "@/lib/engine/levels";
import { countDue, getSkillEstimates, listUserLanguages } from "@/lib/db/repositories";
import { requireLearner } from "@/lib/services/viewer";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const learner = await requireLearner();
  const [langs, due] = await Promise.all([listUserLanguages(learner.userId), countDue(learner.ul.id, new Date())]);
  const options = await Promise.all(
    langs.map(async (ul) => {
      const l = getLanguage(ul.languageCode);
      const skills = await getSkillEstimates(ul.id);
      const t = overallTheta(skills.filter((s) => s.evidence > 0));
      return { code: ul.languageCode, name: l?.name ?? ul.languageCode, level: t === null ? null : thetaToCefr(t) };
    }),
  );
  const initial = (learner.profile.displayName ?? learner.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-dvh">
      <ComfortSync textSize={learner.profile.textSize} slowAudio={learner.profile.slowAudio} />
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface/60 px-4 py-6 lg:flex">
        <div className="px-1"><Logo href="/app" /></div>
        <SidebarNav due={due} simple={learner.profile.simpleMode} />
        <div className="mt-auto space-y-3">
          <LanguageSwitcher options={options} active={learner.language.code} />
          <form action="/auth/signout" method="post">
            <button className="w-full rounded-xl px-3.5 py-2 text-left text-sm text-muted hover:bg-surface-muted hover:text-text">Cerrar sesión</button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-bg/85 px-4 py-3 backdrop-blur lg:hidden">
          <Logo href="/app" compact />
          <span className="flex items-center gap-2 font-display font-extrabold"><LanguageMark code={learner.language.code} size={24} /> {learner.language.name}</span>
          <Link href="/app/profile" aria-label="Mi perfil" className={`ml-auto grid size-9 place-items-center rounded-full font-bold ${learner.profile.avatar ? "bg-primary-soft text-xl" : "bg-primary text-sm text-on-primary"}`}>{learner.profile.avatar ?? initial}</Link>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-9 lg:pb-12 lg:pt-8">{children}</main>
      </div>
      <TabBar due={due} simple={learner.profile.simpleMode} />
    </div>
  );
}
