"use client";

import { useTransition } from "react";
import { resolveReportsAction } from "@/app/app/report-actions";
import { Button } from "@/components/ui/button";

export function ReportActions({ itemId }: { itemId: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex shrink-0 gap-2">
      <Button size="sm" variant="success" disabled={pending} onClick={() => start(async () => { await resolveReportsAction(itemId, "fixed"); })}>Corregido</Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { await resolveReportsAction(itemId, "dismissed"); })}>Descartar</Button>
    </div>
  );
}
