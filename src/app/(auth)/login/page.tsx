import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isBackendConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

function safeNext(next: string | undefined): string {
  // Evita open redirects: sólo rutas internas.
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string; error?: string }> }) {
  await connection();
  if (!isBackendConfigured()) redirect("/setup");
  const sp = await searchParams;
  return <LoginForm next={safeNext(sp.next)} initialMode={sp.mode === "signup" ? "signup" : "login"} error={sp.error} />;
}
