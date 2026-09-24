"use client";
import { useTransition } from "react";
import { updateSettingsAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";

export function EnableAi() {
  const [pending, start] = useTransition();
  return (
    <Button disabled={pending} onClick={() => start(async () => { await updateSettingsAction({ aiConsent: true }); })}>
      Activar tutor
    </Button>
  );
}
