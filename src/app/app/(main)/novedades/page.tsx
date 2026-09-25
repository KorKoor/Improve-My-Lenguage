import type { Metadata } from "next";
import Link from "next/link";
import { CHANGELOG } from "@/lib/content/changelog";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Novedades" };

export default async function ChangelogPage() {
  await requireLearner();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Novedades</h1>
        <p className="mt-1 text-muted">Lo último que hemos añadido para que aprendas más, mejor y acompañado.</p>
      </header>
      <ul className="stagger grid gap-3 sm:grid-cols-2">
        {CHANGELOG.map((c) => (
          <li key={c.title}>
            <Link href={c.href} className="card lift flex h-full gap-3 p-5 hover:border-primary">
              <span className="text-3xl" aria-hidden>{c.icon}</span>
              <span>
                <span className="block font-display text-lg font-extrabold">{c.title}</span>
                <span className="mt-1 block text-sm text-muted">{c.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
