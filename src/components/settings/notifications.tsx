"use client";
import { Bell, BellOff, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { firebaseVapidKey, isPushWebConfigured } from "@/lib/firebase/config";

type Status = "checking" | "off" | "on" | "busy" | "denied" | "unsupported";

const TOKEN_KEY = "iml:push-token";

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* almacenamiento no disponible: sólo se pierde el recordatorio local */
  }
}

async function messagingToken(): Promise<string | null> {
  const [{ getMessaging, getToken, isSupported }, { firebaseApp }] = await Promise.all([
    import("firebase/messaging"),
    import("@/lib/firebase/client"),
  ]);
  if (!(await isSupported())) return null;
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  return getToken(getMessaging(firebaseApp()), { vapidKey: firebaseVapidKey, serviceWorkerRegistration: registration });
}

/**
 * Recordatorios por push (por dispositivo). Ejemplos: "Tienes 12 palabras
 * listas para repasar", "Tu sesión diaria está esperando".
 */
export function NotificationSettings({ serverReady }: { serverReady: boolean }) {
  const [status, setStatus] = useState<Status>("checking");
  const [note, setNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!serverReady || !isPushWebConfigured() || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") setStatus("denied");
    else setStatus(Notification.permission === "granted" && readStoredToken() ? "on" : "off");
  }, [serverReady]);

  async function enable() {
    setStatus("busy");
    setNote(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const token = await messagingToken();
      if (!token) {
        setStatus("unsupported");
        return;
      }
      const res = await fetch("/api/notifications/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error(String(res.status));
      storeToken(token);
      setStatus("on");
      setNote({ tone: "ok", text: "Listo. Te avisaremos cuando tengas repasos pendientes o tu sesión diaria esté esperando." });
    } catch {
      setStatus("off");
      setNote({ tone: "error", text: "No se pudieron activar las notificaciones en este navegador. Inténtalo de nuevo." });
    }
  }

  async function disable() {
    setStatus("busy");
    setNote(null);
    const token = readStoredToken();
    try {
      if (token) {
        await fetch("/api/notifications/register", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }
      const { getMessaging, deleteToken } = await import("firebase/messaging");
      const { firebaseApp } = await import("@/lib/firebase/client");
      await deleteToken(getMessaging(firebaseApp())).catch(() => undefined);
    } finally {
      storeToken(null);
      setStatus("off");
    }
  }

  async function test() {
    setNote(null);
    const res = await fetch("/api/notifications/test", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setNote(res.ok ? { tone: "ok", text: "Notificación de prueba enviada." } : { tone: "error", text: body.error ?? "No se pudo enviar la prueba." });
  }

  if (status === "unsupported") {
    return <p className="text-sm text-muted">Las notificaciones no están disponibles en este navegador o no están configuradas en el servidor.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Un recordatorio al día, sólo si aún no has estudiado: repasos pendientes, tu racha o tu sesión diaria. Se activa por dispositivo.
      </p>
      {status === "denied" ? (
        <p role="status" className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
          Bloqueaste las notificaciones para este sitio. Puedes permitirlas desde la configuración del navegador.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {status === "on" ? (
            <>
              <Button variant="secondary" onClick={disable}><BellOff size={18} aria-hidden /> Desactivar en este dispositivo</Button>
              <Button variant="ghost" onClick={test}><Send size={16} aria-hidden /> Enviar prueba</Button>
            </>
          ) : (
            <Button onClick={enable} disabled={status === "busy" || status === "checking"}>
              {status === "busy" ? <Loader2 className="animate-spin" size={18} aria-hidden /> : <Bell size={18} aria-hidden />}
              Activar recordatorios
            </Button>
          )}
        </div>
      )}
      {note && (
        <p role={note.tone === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm ${note.tone === "error" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"}`}>
          {note.text}
        </p>
      )}
    </div>
  );
}
