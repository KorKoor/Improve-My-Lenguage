import { Bot } from "lucide-react";
import type { Metadata } from "next";
import { TutorChat } from "@/components/tutor/chat";
import { EnableAi } from "@/components/tutor/enable-ai";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { topicLabel } from "@/lib/content";
import { aiAvailable } from "@/lib/ai/provider";
import type { ConversationFeedback } from "@/lib/ai/prompts";
import { getSkillEstimates, listConversations } from "@/lib/db/repositories";
import { SCENARIOS } from "@/lib/content/scenarios";
import { overallTheta, thetaToCefr } from "@/lib/engine/levels";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Tutor" };

export default async function TutorPage() {
  const learner = await requireLearner();
  const available = aiAvailable();
  const past = available ? await listConversations(learner.ul.id, 6) : [];
  const skills = (await getSkillEstimates(learner.ul.id)).filter((x) => x.evidence > 0);
  const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const mine = order.indexOf(thetaToCefr(overallTheta(skills) ?? -1.5));
  // Primero los de tu nivel y el siguiente; los demás después.
  const scenarios = [...SCENARIOS]
    .sort((a, b) => Math.abs(order.indexOf(a.level) - mine - 0.4) - Math.abs(order.indexOf(b.level) - mine - 0.4))
    .map(({ id, level, icon, title, situation, goals }) => ({ id, level, icon, title, situation, goals: [...goals] }));
  const suggestions = [
    ...learner.profile.interests.slice(0, 3).map((t) => topicLabel(t)),
    "Mi día de hoy",
    "Planes para el fin de semana",
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Tu tutor</h1>
        <p className="mt-1 text-muted">Conversa en {learner.language.name.toLowerCase()} a tu nivel. No te interrumpe con correcciones: al final recibes un análisis de tus errores, que alimenta tus próximas sesiones.</p>
      </header>
      {!available ? (
        <Card>
          <EmptyState title="El tutor de IA no está configurado" mood="resting">
            Para activarlo, añade una clave gratuita de Gemini (<code>GEMINI_API_KEY</code>) o de un proveedor compatible con OpenAI en las variables de entorno. Todo lo demás funciona sin IA.
          </EmptyState>
        </Card>
      ) : !learner.profile.aiConsent ? (
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Bot size={40} className="text-primary" aria-hidden />
          <div className="flex-1">
            <h2 className="font-display text-lg font-extrabold">Activa el tutor de IA</h2>
            <p className="text-sm text-muted">Tus mensajes y un resumen de tu nivel (nunca tu correo) se enviarán al proveedor de IA para generar respuestas.</p>
          </div>
          <EnableAi />
        </Card>
      ) : (
        <TutorChat
          language={learner.language.code}
          languageName={learner.language.name}
          locale={learner.language.speechLocale}
          suggestions={[...new Set(suggestions)]}
          scenarios={scenarios}
          past={past.map((c) => ({ id: c.id, topic: c.topic, createdAt: c.createdAt.toISOString(), feedback: (c.feedback as ConversationFeedback | null) ?? null }))}
        />
      )}
    </div>
  );
}
