"use client";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowser } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "reset";

const ERRORS: Record<string, string> = {
  "Invalid login credentials": "Correo o contraseña incorrectos.",
  "Email not confirmed": "Confirma tu correo antes de entrar (revisa tu bandeja de entrada).",
  "User already registered": "Ya existe una cuenta con ese correo. Inicia sesión.",
};

export function LoginForm({ next, initialMode, error }: { next: string; initialMode: "login" | "signup"; error?: string }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(
    error ? { tone: "error", text: "No pudimos completar el inicio de sesión. Inténtalo de nuevo." } : null,
  );

  const callback = (path: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(path)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createSupabaseBrowser();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign(next);
        return;
      }
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: callback("/app/onboarding") } });
        if (error) throw error;
        if (data.session) {
          window.location.assign("/app/onboarding");
          return;
        }
        setMessage({ tone: "ok", text: "Te enviamos un correo para confirmar tu cuenta. Ábrelo desde este dispositivo." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback("/reset-password") });
        if (error) throw error;
        setMessage({ tone: "ok", text: "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña." });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setMessage({ tone: "error", text: ERRORS[msg] ?? "Algo salió mal. Revisa los datos e inténtalo de nuevo." });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback(next) } });
    if (error) {
      setBusy(false);
      setMessage({ tone: "error", text: "No se pudo iniciar sesión con Google." });
    }
  }

  const titles: Record<Mode, [string, string]> = {
    login: ["Bienvenido de nuevo", "Tu sesión de hoy te está esperando."],
    signup: ["Crea tu cuenta", "Gratis. En 5 minutos tendrás tu diagnóstico."],
    reset: ["Recupera tu contraseña", "Te enviaremos un enlace por correo."],
  };

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-extrabold">{titles[mode][0]}</h1>
      <p className="mt-2 text-muted">{titles[mode][1]}</p>

      {mode !== "reset" && (
        <>
          <Button type="button" variant="secondary" size="lg" className="mt-8 w-full text-text" onClick={google} disabled={busy}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
            Continuar con Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted" aria-hidden>
            <span className="h-px flex-1 bg-border" /> o con tu correo <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={mode === "reset" ? "mt-8 space-y-4" : "space-y-4"} noValidate={false}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Correo electrónico</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-surface px-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-soft" />
        </label>
        {mode !== "reset" && (
          <label className="block">
            <span className="mb-1.5 flex items-center text-sm font-medium">
              Contraseña
              {mode === "login" && (
                <button type="button" onClick={() => setMode("reset")} className="ml-auto text-xs font-semibold text-primary hover:underline">¿La olvidaste?</button>
              )}
            </span>
            <input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-surface px-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-soft" />
            {mode === "signup" && <span className="mt-1 block text-xs text-muted">Mínimo 8 caracteres.</span>}
          </label>
        )}
        {message && (
          <p role={message.tone === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${message.tone === "error" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"}`}>
            {message.text}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={18} aria-hidden /> : mode === "reset" ? <Mail size={18} aria-hidden /> : null}
          {mode === "login" ? "Entrar" : mode === "signup" ? "Crear cuenta" : "Enviar enlace"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>¿No tienes cuenta? <button className="font-semibold text-primary hover:underline" onClick={() => setMode("signup")}>Regístrate gratis</button></>
        ) : (
          <>¿Ya tienes cuenta? <button className="font-semibold text-primary hover:underline" onClick={() => setMode("login")}>Inicia sesión</button></>
        )}
      </p>
      {mode === "signup" && (
        <p className="mt-4 text-center text-xs text-muted">Al crear tu cuenta aceptas el <a href="/privacy" className="underline">aviso de privacidad</a>.</p>
      )}
    </div>
  );
}
