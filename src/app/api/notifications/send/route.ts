import { NextResponse } from "next/server";
import { firebaseAdminApp } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      title?: string;
      body?: string;
    };

    const token = body.token;
    const title = body.title ?? "Improve My Languages";
    const message = body.body ?? "Tienes una nueva notificación.";

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Falta el token del dispositivo." }, { status: 400 });
    }

    const response = await firebaseAdminApp.messaging().send({
      token,
      notification: {
        title,
        body: message,
      },
      webpush: {
        headers: {
          urgency: "high",
        },
        notification: {
          icon: "/icon.png",
          badge: "/icon.png",
        },
      },
    });

    return NextResponse.json({ ok: true, messageId: response });
  } catch (error) {
    console.error("Error enviando notificación FCM:", error);
    return NextResponse.json({ error: "No se pudo enviar la notificación." }, { status: 500 });
  }
}
