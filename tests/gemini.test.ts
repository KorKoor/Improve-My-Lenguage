import assert from "node:assert/strict";
import { test } from "node:test";
import { geminiBody, geminiModelChain, isModelMissing, isThinkingRejected, readGemini, thinkingOptionsFor } from "../src/lib/ai/gemini";

test("cadena de modelos: primero el configurado, luego los recomendados y alias vigentes, sin repetir", () => {
  const fast = geminiModelChain("fast");
  assert.equal(fast[0], "gemini-3.5-flash-lite");
  assert.ok(fast.includes("gemini-flash-lite-latest") && fast.includes("gemini-2.5-flash-lite"));
  const smart = geminiModelChain("smart", "gemini-flash-latest");
  assert.equal(smart[0], "gemini-flash-latest");
  assert.equal(new Set(smart).size, smart.length);
});

test("sin «pensar» de más: 2.x por presupuesto, 3.x por nivel, alias prueba ambos", () => {
  assert.deepEqual(thinkingOptionsFor("gemini-2.5-flash", "smart")[0], { thinkingBudget: 0 });
  assert.deepEqual(thinkingOptionsFor("gemini-3.5-flash", "fast")[0], { thinkingLevel: "minimal" });
  const alias = thinkingOptionsFor("gemini-flash-latest", "smart");
  assert.deepEqual(alias, [{ thinkingLevel: "low" }, { thinkingBudget: 0 }, undefined]);
  assert.equal(thinkingOptionsFor("gemini-2.5-flash", "fast").at(-1), undefined);
});

test("cuerpo de la petición: roles, JSON y ajuste de pensar", () => {
  const b = geminiBody({ system: "S", messages: [{ role: "user", content: "a" }, { role: "assistant", content: "b" }], json: true, maxTokens: 200, temperature: 0.3, thinking: { thinkingBudget: 0 } }) as {
    contents: { role: string }[];
    generationConfig: Record<string, unknown>;
    systemInstruction: { parts: { text: string }[] };
  };
  assert.deepEqual(b.contents.map((c) => c.role), ["user", "model"]);
  assert.equal(b.systemInstruction.parts[0]!.text, "S");
  assert.equal(b.generationConfig.responseMimeType, "application/json");
  assert.deepEqual(b.generationConfig.thinkingConfig, { thinkingBudget: 0 });
  const plain = geminiBody({ system: "S", messages: [], maxTokens: 10, temperature: 0 }) as { generationConfig: Record<string, unknown> };
  assert.ok(!("thinkingConfig" in plain.generationConfig) && !("responseMimeType" in plain.generationConfig));
});

test("lectura de la respuesta: sin las partes de pensamiento, con motivo y bloqueo", () => {
  const r = readGemini({ candidates: [{ content: { parts: [{ text: "hmm", thought: true }, { text: " Hola " }] }, finishReason: "STOP" }], usageMetadata: { totalTokenCount: 42 } });
  assert.deepEqual(r, { text: "Hola", finishReason: "STOP", blocked: undefined, tokens: 42 });
  assert.equal(readGemini({ promptFeedback: { blockReason: "SAFETY" } }).blocked, "SAFETY");
  assert.equal(readGemini(null).text, "");
  assert.equal(readGemini({ candidates: [{ finishReason: "MAX_TOKENS" }] }).finishReason, "MAX_TOKENS");
});

test("errores: modelo inexistente vs. ajuste de pensar rechazado", () => {
  assert.ok(isModelMissing(404, ""));
  assert.ok(isModelMissing(400, "models/x is not found for API version v1beta"));
  assert.ok(!isModelMissing(429, "quota"));
  assert.ok(isThinkingRejected(400, "Thinking level is not supported"));
  assert.ok(!isThinkingRejected(500, "thinking"));
});
