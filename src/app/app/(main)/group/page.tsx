import type { Metadata } from "next";
import { GroupPanel } from "@/components/group/group-panel";
import { groupOverview } from "@/lib/services/group";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Familia y amigos" };

export default async function GroupPage() {
  const learner = await requireLearner();
  const group = await groupOverview(learner);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Familia y amigos</h1>
        <p className="mt-1 text-muted">Aprender acompañado motiva el doble: mirad quién ya estudió hoy y mandaos ánimos. Cada uno puede estudiar un idioma distinto.</p>
      </header>
      <GroupPanel group={group} />
    </div>
  );
}
