import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { breadcrumbLd, graph } from "@/lib/seo";
import { JsonLd } from "./json-ld";

/** Migas de pan visibles + su BreadcrumbList. El último elemento es la página actual. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Migas de pan" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} aria-hidden />}
              {i < items.length - 1 ? <Link href={it.path} className="hover:text-text">{it.name}</Link> : <span aria-current="page" className="text-text">{it.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={graph(breadcrumbLd(items))} />
    </>
  );
}
