import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Falta el token de FCM." }, { status: 400 });
    }

    console.log("FCM token registrado:", token.slice(0, 20));

    return NextResponse.json({ ok: true, message: "Token registrado correctamente." });
  } catch (error) {
    console.error("Error registrando token FCM:", error);
    return NextResponse.json({ error: "No se pudo registrar el token." }, { status: 500 });
  }
}
