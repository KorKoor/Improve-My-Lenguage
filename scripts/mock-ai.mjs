// Servidor de IA simulado (compatible con la API de OpenAI) para desarrollo y
// pruebas locales sin claves ni coste. Respuestas deterministas que respetan
// los contratos de la app: chat del tutor, role-play con marcador de
// objetivos, feedback de conversación y corrección de escritura (JSON).
//   node scripts/mock-ai.mjs            (puerto 8787)
//   npm run dev:emulated -- --mock-ai   (lo arranca junto a la app)
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_AI_PORT ?? 8787);

function words(text) {
  return text.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{M}'’-]/gu, "")).filter(Boolean);
}

function reply(body) {
  const system = body.messages?.find((m) => m.role === "system")?.content ?? "";
  const turns = (body.messages ?? []).filter((m) => m.role !== "system");
  const users = turns.filter((m) => m.role === "user").map((m) => String(m.content));
  const last = users.at(-1) ?? "";

  if (body.response_format?.type === "json_object") {
    // Corrección de escritura: el primer error sale de una palabra real del texto.
    if (/corrected/i.test(system)) {
      const w = words(last).find((x) => x.length > 3) ?? words(last)[0] ?? "text";
      return JSON.stringify({
        corrected: last.replace(w, w.toUpperCase()),
        mistakes: [{ original: w, correction: w.toUpperCase(), category: "spelling", explanation: "Ejemplo del simulador: así se verá una corrección." }],
        strengths: ["Frases claras", "Buen uso de conectores"],
        suggestions: ["Añade un ejemplo concreto"],
        level: "B1",
      });
    }
    // Feedback de conversación (textos del alumno numerados [1] …).
    const first = last.split("\n")[0]?.replace(/^\[\d+\]\s*/, "") ?? "";
    const w = words(first)[0] ?? "";
    return JSON.stringify({
      summary: "Conversación fluida (respuesta simulada).",
      strengths: ["Respondiste a todas las preguntas"],
      mistakes: w ? [{ category: "vocabulary", userText: w, correction: w.toLowerCase() === w ? w.toUpperCase() : w.toLowerCase(), explanation: "Corrección de ejemplo del simulador." }] : [],
      suggestedFocus: "Practica el pasado simple.",
    });
  }

  if (/^EXPLAIN MISTAKE/.test(system)) {
    const correct = /Correct answer: (.*)/.exec(last)?.[1] ?? "";
    return `La forma correcta es «${correct}». (Explicación simulada) Fíjate en la terminación: es la pista más útil para recordarlo.`;
  }

  if (/ROLE-PLAY RULES/.test(system)) {
    // Un objetivo más por cada turno del alumno (tras el saludo inicial).
    const done = Math.min(3, Math.max(0, users.filter((u) => u !== "(conversation start)").length - (users.length && /^Start the role-play/.test(users[0]) ? 1 : 0)));
    const ids = Array.from({ length: done }, (_, i) => i + 1).join(",");
    const line = done === 0 ? "Hello and welcome! What can I do for you today?" : done < 3 ? `Of course. Anything else? (You said: "${last.slice(0, 60)}")` : "Wonderful, that's everything. Have a great day!";
    return `${line}\n[[goals:${ids}]]`;
  }

  if (!last || /^Greet|^Start the conversation/.test(last)) return "Hi! Nice to see you. What did you do today?";
  return `That's interesting! Tell me more about "${last.slice(0, 40)}". Why do you like it?`;
}

createServer((req, res) => {
  if (req.method !== "POST" || !req.url?.endsWith("/chat/completions")) {
    res.writeHead(404).end();
    return;
  }
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    try {
      const body = JSON.parse(raw);
      const content = reply(body);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ choices: [{ message: { role: "assistant", content } }] }));
    } catch (err) {
      res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: String(err) }));
    }
  });
}).listen(PORT, "127.0.0.1", () => console.log(`[mock-ai] escuchando en http://127.0.0.1:${PORT}/v1`));
