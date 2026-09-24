"use client";
import { CheckCircle2, Loader2, Mic, MicOff, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { endConversationAction, sendTutorMessageAction, startConversationAction } from "@/app/app/actions";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import type { ConversationFeedback } from "@/lib/ai/prompts";

interface Msg { role: "user" | "assistant"; content: string }
interface Past { id: string; topic: string | null; createdAt: string; feedback: ConversationFeedback | null }

// Tipos mínimos del reconocimiento de voz del navegador (no estándar en TS).
type SpeechRec = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null };

export function TutorChat({ language, languageName, locale, suggestions, past }: { language: string; languageName: string; locale: string; suggestions: string[]; past: Past[] }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    setMicSupported(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition));
  }, []);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages, busy]);

  async function start(topic: string | null) {
    setBusy(true);
    setError(null);
    setFeedback(null);
    const res = await startConversationAction(topic);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setConversationId(res.data.conversationId);
    setMessages([{ role: "assistant", content: res.data.message }]);
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const t = text.trim();
    if (!t || !conversationId || busy) return;
    setText("");
    setMessages((m) => [...m, { role: "user", content: t }]);
    setBusy(true);
    setError(null);
    const res = await sendTutorMessageAction(conversationId, t);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setMessages((m) => [...m, { role: "assistant", content: res.data.message }]);
  }

  async function end() {
    if (!conversationId) return;
    setBusy(true);
    const res = await endConversationAction(conversationId);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setFeedback(res.data);
    setConversationId(null);
  }

  function toggleMic() {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) { recRef.current?.stop(); return; }
    const rec = new Ctor();
    rec.lang = locale;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const said = Array.from(e.results).map((r) => r[0]?.transcript ?? "").join(" ");
      setText((t) => (t ? `${t} ${said}` : said));
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  if (!conversationId && !feedback) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <h2 className="font-display text-xl font-extrabold">¿De qué quieres hablar?</h2>
          <p className="mt-1 text-sm text-muted">Elige un tema o deja que el tutor proponga uno según tus intereses.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" disabled={busy} onClick={() => void start(s)} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-primary">{s}</button>
            ))}
          </div>
          <Button className="mt-5" disabled={busy} onClick={() => void start(null)}>
            {busy ? <Loader2 className="animate-spin" size={16} aria-hidden /> : <Sparkles size={16} aria-hidden />} Sorpréndeme
          </Button>
          {error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>}
        </Card>
        <Card>
          <h2 className="font-display text-lg font-extrabold">Conversaciones anteriores</h2>
          {past.length === 0 ? <p className="mt-2 text-sm text-muted">Aún no has conversado con tu tutor.</p> : (
            <ul className="mt-3 space-y-3 text-sm">
              {past.map((p) => (
                <li key={p.id} className="rounded-xl bg-surface-muted p-3">
                  <p className="font-semibold">{p.topic ?? "Tema libre"}</p>
                  <p className="text-xs text-muted">{new Date(p.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}{p.feedback ? ` · ${p.feedback.mistakes.length} correcciones` : ""}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    );
  }

  if (feedback) {
    return (
      <Card className="animate-rise">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold"><CheckCircle2 className="text-success" aria-hidden /> Tu feedback</h2>
        <p className="mt-3">{feedback.summary}</p>
        {feedback.strengths.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold">Lo que hiciste bien</p>
            <ul className="mt-2 flex flex-wrap gap-2">{feedback.strengths.map((s) => <li key={s}><Chip tone="success">{s}</Chip></li>)}</ul>
          </div>
        )}
        <div className="mt-6">
          <p className="text-sm font-semibold">Correcciones</p>
          {feedback.mistakes.length === 0 ? <p className="mt-2 text-sm text-muted">No detectamos errores importantes. ¡Muy bien!</p> : (
            <ul className="mt-3 space-y-3">
              {feedback.mistakes.map((m, i) => (
                <li key={i} className="rounded-2xl bg-surface-muted p-4 text-sm">
                  <p lang={language}><span className="font-bold text-danger">✗ </span>{m.userText}</p>
                  <p className="mt-1" lang={language}><span className="font-bold text-success">✓ </span>{m.correction}</p>
                  <p className="mt-2 text-muted">{m.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {feedback.suggestedFocus && <p className="mt-5 rounded-xl bg-primary-soft px-4 py-3 text-sm"><strong>Para la próxima:</strong> {feedback.suggestedFocus}</p>}
        <p className="mt-4 text-xs text-muted">Estas correcciones ya se añadieron a tu perfil de errores.</p>
        <Button className="mt-5" onClick={() => setFeedback(null)}>Nueva conversación</Button>
      </Card>
    );
  }

  return (
    <Card className="flex h-[min(70dvh,720px)] flex-col p-0">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <p className="flex-1 text-sm font-semibold">Conversación en {languageName.toLowerCase()}</p>
        <Button size="sm" variant="secondary" disabled={busy || messages.filter((m) => m.role === "user").length === 0} onClick={() => void end()}>Terminar y ver feedback</Button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex items-end gap-2", m.role === "user" && "justify-end")}>
            <p lang={language} className={cn("max-w-[80%] rounded-2xl px-4 py-2.5", m.role === "user" ? "rounded-br-md bg-primary text-on-primary" : "rounded-bl-md bg-surface-muted")}>{m.content}</p>
            {m.role === "assistant" && <SpeakButton text={m.content} locale={locale} size={30} label="Escuchar respuesta" />}
          </div>
        ))}
        {busy && <p className="flex items-center gap-2 text-sm text-muted"><Loader2 className="animate-spin" size={14} aria-hidden /> Escribiendo…</p>}
        <div ref={endRef} />
      </div>
      {error && <p role="alert" className="mx-5 mb-2 rounded-xl bg-danger-soft px-4 py-2 text-sm text-danger">{error}</p>}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
        {micSupported && (
          <button type="button" onClick={toggleMic} aria-pressed={listening} aria-label={listening ? "Detener dictado" : "Dictar por voz"} className={cn("grid size-11 shrink-0 place-items-center rounded-full", listening ? "bg-danger text-white" : "bg-surface-muted text-muted")}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
        <label className="sr-only" htmlFor="msg">Tu mensaje</label>
        <input id="msg" value={text} onChange={(e) => setText(e.target.value)} lang={language} maxLength={1000} autoComplete="off" placeholder={`Escribe en ${languageName.toLowerCase()}…`} className="h-11 flex-1 rounded-full border border-border bg-surface px-4 outline-none focus:border-primary" />
        <button type="submit" disabled={!text.trim() || busy} aria-label="Enviar" className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary disabled:opacity-50"><Send size={18} /></button>
      </form>
    </Card>
  );
}
