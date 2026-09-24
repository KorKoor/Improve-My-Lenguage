"use client";

import { getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useState } from "react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDWE1yLqVd6vTfX3tmYgYWLqNnr614i2xQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "improve-my-lenguages.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "improve-my-lenguages",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "improve-my-lenguages.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1034238311541",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:1034238311541:web:f41dce05973c99461e0c3c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-KQT1PB2ERD",
};

const vapidKey =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ??
  "BI46w9PaVwPOuvWV4de6ke2QAGfjegR2Pn7XGw2mefT4YjFxdi2MotBr-PAnRhkqeAzTWU0pLMPXuQ8c8G9-Z98";

export default function FirebasePush() {
  const [status, setStatus] = useState<"idle" | "requesting" | "enabled" | "denied" | "unsupported">("idle");
  const [error, setError] = useState<string | null>(null);

  async function enableNotifications() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    try {
      setError(null);
      setStatus("requesting");

      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        setStatus("unsupported");
        setError("No se pudo obtener el token del navegador.");
        return;
      }

      await fetch("/api/notifications/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? "Improve My Languages";
        const body = payload.notification?.body ?? "Tienes una nueva notificación.";

        if (Notification.permission === "granted") {
          new Notification(title, { body, icon: "/icon.png" });
        }
      });

      setStatus("enabled");
    } catch (err) {
      console.error("Firebase Push init failed:", err);
      setStatus("unsupported");
      setError("No se pudo activar Firebase Push en este navegador.");
    }
  }

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
      <button
        type="button"
        onClick={enableNotifications}
        disabled={status === "requesting" || status === "enabled"}
        style={{
          border: "none",
          borderRadius: 999,
          background: status === "enabled" ? "#16a34a" : "#111827",
          color: "white",
          padding: "0.8rem 1.2rem",
          cursor: status === "requesting" || status === "enabled" ? "default" : "pointer",
          fontWeight: 700,
          boxShadow: "0 10px 24px rgba(17, 24, 39, 0.2)",
        }}
      >
        {status === "requesting" ? "Activando..." : status === "enabled" ? "Notificaciones activadas" : "Activar notificaciones"}
      </button>

      {status === "denied" && <span style={{ fontSize: 12, color: "#374151" }}>Has bloqueado las notificaciones.</span>}
      {status === "unsupported" && <span style={{ fontSize: 12, color: "#374151" }}>{error ?? "Tu navegador no soporta notificaciones web."}</span>}
    </div>
  );
}
