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
    const title = body.title ?? "Prueba desde Vercel";
    const message = body.body ?? "Este es un push de prueba.";

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          error: "Falta el token del navegador. Pásalo en body.token",
          example: {
            token: "<FCM_TOKEN>",
            title: "Prueba desde Vercel",
            body: "Este es un push de prueba.",
          },
        },
        { status: 400 },
      );
    }

    const messageId = await firebaseAdminApp.messaging().send({
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

    return NextResponse.json({ ok: true, messageId });
  } catch (error) {
    console.error("Error en test push:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el push de prueba.", details: String(error) },
      { status: 500 },
    );
  }
}
