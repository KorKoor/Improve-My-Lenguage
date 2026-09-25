import { Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InstallApp } from "@/components/install-app";
import { ARCHETYPES } from "@/lib/engine/personality";
import { ComfortSettings, DangerZone, PreferencesForm, ThemeSetting } from "@/components/settings/forms";
import { Card, CardHeader } from "@/components/ui/card";
import { getLanguage, LANGUAGES, TOPICS } from "@/lib/content";
import { listUserLanguages } from "@/lib/db/repositories";
import { aiAvailable } from "@/lib/ai/provider";
import { requireLearner } from "@/lib/services/viewer";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { NotificationSettings } from "@/components/settings/notifications";
import { isAdminConfigured } from "@/lib/firebase/admin";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const learner = await requireLearner();
  const p = learner.profile;
  const langs = await listUserLanguages(learner.userId);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-extrabold">Configuración</h1>

      <InstallApp />

      <Card>
        <CardHeader title="Comodidad" aside="Letra, modo sencillo y audio" />
        <ComfortSettings initial={{ textSize: p.textSize, simpleMode: p.simpleMode, slowAudio: p.slowAudio }} />
      </Card>

      <Card>
        <CardHeader title="Aprendizaje" aside={<Link href={p.personality ? "/app/profile" : "/app/profile/test"} className="font-semibold text-primary">{p.personality ? `${ARCHETYPES[p.personality.archetype].icon} Tu forma de aprender` : "🪞 Hacer el test de aprendizaje"}</Link>} />
        <PreferencesForm
          topics={TOPICS}
          natives={LANGUAGES.filter((l) => ["es", "en", "fr", "pt", "it", "de"].includes(l.code)).map((l) => ({ code: l.code, name: l.name }))}
          aiAvailable={aiAvailable()}
          initial={{
            displayName: p.displayName ?? "",
            nativeLanguage: p.nativeLanguage,
            dailyMinutes: p.dailyMinutes,
            explanationDepth: p.explanationDepth,
            preferredDifficulty: p.preferredDifficulty,
            interests: p.interests,
            aiConsent: p.aiConsent,
          }}
        />
      </Card>

      <Card>
        <CardHeader title="Idiomas" aside="Cada idioma guarda su progreso por separado" />
        <LanguageSwitcher
          active={learner.language.code}
          options={langs.map((ul) => {
            const l = getLanguage(ul.languageCode);
            return { code: ul.languageCode, name: l?.name ?? ul.languageCode, level: null };
          })}
        />
        <a href="/app/assessment?restart=1" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Repetir el diagnóstico de {learner.language.name.toLowerCase()}</a>
      </Card>

      <Card>
        <CardHeader title="Notificaciones" />
        <NotificationSettings serverReady={isAdminConfigured()} />
      </Card>

      <Card>
        <CardHeader title="Apariencia" />
        <ThemeSetting initial={p.theme} />
      </Card>

      <Card>
        <CardHeader title="Tus datos" />
        <p className="text-sm text-muted">Descarga todo lo que sabemos de ti en formato JSON: perfil, respuestas, errores, conversaciones y actividad.</p>
        <a href="/api/export" className="mt-4 inline-flex h-11 items-center gap-2 rounded-[14px] border border-border bg-surface px-5 text-[15px] font-semibold text-primary hover:bg-surface-muted">
          <Download size={18} aria-hidden /> Descargar mis datos
        </a>
        <form action="/auth/signout" method="post" className="mt-6">
          <button className="text-sm font-semibold text-muted hover:text-text">Cerrar sesión{learner.email ? ` (${learner.email})` : ""}</button>
        </form>
      </Card>

      <DangerZone />
    </div>
  );
}
