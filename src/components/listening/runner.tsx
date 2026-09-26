"use client";
import { ScriptKeyboard } from "@/components/script-keyboard";
import { VoiceWarning } from "@/components/speak-button";
import { pickVoice } from "@/lib/voice";
import { ArrowRight, Headphones, Loader2, RotateCcw, Snail, Trophy, Volume2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { answerListeningAction, finishListeningAction, startListeningAction } from "@/app/app/skills-actions";
import { Confetti } from "@/components/celebrate";
import { speechRate } from "@/components/comfort";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { ListeningFeedback, ListeningItem } from "@/lib/services/listening";

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
const KIND_LABEL = { spot: "¿Qué palabra escuchaste?", meaning: "¿Qué significa la frase?", dictation: "Escribe lo que escuchas" } as const;

export function ListeningRunner({ languageName, beginner = false }: { languageName: string; beginner?: boolean }) {
  const [state, setState] = useState<"intro" | "loading" | "running" | "done" | "empty" | "error">("intro");
  const [items, setItems] = useState<ListeningItem[]>([]);
  const [locale, setLocale] = useState("en-US");
  const [i, setI] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(beginner ? 0.75 : 1);
  const [answer, setAnswer] = useState("");
  const [fb, setFb] = useState<ListeningFeedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [achievements, setAchievements] = useState<{ id: string; title: string; icon: string }[]>([]);
  const started = useRef(Date.now());
  const input = useRef<HTMLInputElement>(null);
  const item = items[i];

  const play = useCallback(
    (rate: number = speed) => {
      if (!item || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(item.text);
      u.lang = locale;
      u.rate = speechRate(rate);
      const voice = pickVoice(synth.getVoices(), locale);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.onstart = () => setPlaying(true);
      u.onend = () => setPlaying(false);
      synth.speak(u);
    },
    [item, locale, speed],
  );

  // Reproduce automáticamente cada frase nueva.
  useEffect(() => {
    if (state !== "running" || !item) return;
    started.current = Date.now();
    const t = setTimeout(() => play(), 350);
    if (item.kind === "dictation") setTimeout(() => input.current?.focus(), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, state]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const start = async () => {
    setState("loading");
    const res = await startListeningAction();
    if (!res.ok) return setState("error");
    if (res.data.items.length === 0) return setState("empty");
    setItems(res.data.items);
    setLocale(res.data.locale);
    setI(0);
    setScore(0);
    setState("running");
  };

  const submit = async (response: string) => {
    if (!item || busy || fb) return;
    setBusy(true);
    const res = await answerListeningAction(item.key, response, Date.now() - started.current);
    setBusy(false);
    if (!res.ok) return;
    setFb(res.data);
    if (res.data.correct) setScore((s) => s + 1);
  };

  const next = async () => {
    setFb(null);
    setAnswer("");
    if (i + 1 < items.length) return setI(i + 1);
    const res = await finishListeningAction(score, items.length);
    if (res.ok) setAchievements(res.data.newAchievements);
    setState("done");
  };

  if (state === "intro" || state === "loading" || state === "empty" || state === "error") {
    return (
      <div className="mx-auto max-w-xl animate-rise py-6 text-center">
        <span className="animate-float mx-auto grid size-24 place-items-center rounded-full bg-[color-mix(in_srgb,var(--skill-listening)_16%,transparent)] text-[var(--skill-listening)]">
          <Headphones size={44} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">Escucha</h1>
        <p className="mt-2 text-muted">10 frases reales en {languageName.toLowerCase()} elegidas para tu nivel. Puedes repetirlas, escucharlas despacio y cambiar la velocidad. Usa audífonos si puedes.</p>
        {state === "empty" && <p className="mt-4 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink">Aún no hay suficientes frases a tu nivel. Practica un poco de vocabulario y vuelve.</p>}
        {state === "error" && <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-ink">No pudimos preparar la sesión. Inténtalo de nuevo.</p>}
        <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={() => void start()} disabled={state === "loading"}>
          {state === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Headphones size={18} />} Empezar a escuchar
        </Button>
      </div>
    );
  }

  if (state === "done") {
    const pct = Math.round((score / Math.max(1, items.length)) * 100);
    return (
      <div className="mx-auto max-w-xl animate-rise py-6 text-center">
        {pct >= 60 ? <Confetti /> : null}
        <Trophy className="mx-auto text-warning-ink" size={48} />
        <h1 className="mt-3 font-display text-3xl font-extrabold">{pct >= 80 ? "¡Tienes buen oído!" : pct >= 50 ? "¡Buen trabajo!" : "Cada escucha entrena tu oído"}</h1>
        <p className="mt-2 text-muted">{score} de {items.length} correctas. Tu nivel de listening se actualizó.</p>
        {achievements.length ? <div className="mt-4 flex flex-wrap justify-center gap-2">{achievements.map((a) => <Chip key={a.id} tone="warning">{a.icon} {a.title}</Chip>)}</div> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => void start()}><RotateCcw size={16} /> Otra ronda</Button>
          <Link href="/app/explore" className="inline-flex h-11 items-center rounded-[14px] border border-border bg-surface px-5 font-semibold text-primary">Practicar otra cosa</Link>
        </div>
      </div>
    );
  }

  if (!item) return null;
  return (
    <div className="mx-auto max-w-xl py-4">
      <div className="flex items-center gap-3">
        <ProgressBar value={(i + (fb ? 1 : 0)) / items.length} label="Progreso" className="flex-1" height={8} />
        <span className="text-xs font-semibold text-muted">{i + 1}/{items.length}</span>
      </div>
      {i === 0 && <VoiceWarning locale={locale} languageName={languageName} />}

      <div key={i} className="mt-8 animate-rise text-center">
        <p className="font-semibold text-muted">{KIND_LABEL[item.kind]}</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" onClick={() => play(0.7)} className="grid size-12 place-items-center rounded-full bg-surface-muted text-muted transition hover:text-text active:scale-95" aria-label="Escuchar despacio"><Snail size={20} /></button>
          <button
            type="button"
            onClick={() => play()}
            className={cn("relative grid size-24 place-items-center rounded-full bg-primary text-on-primary shadow-[0_12px_30px_rgb(91_95_214/0.35)] transition active:scale-95", playing && "animate-pulse")}
            aria-label="Reproducir la frase"
          >
            <Volume2 size={40} />
          </button>
          <button type="button" onClick={() => play()} className="grid size-12 place-items-center rounded-full bg-surface-muted text-muted transition hover:text-text active:scale-95" aria-label="Repetir"><RotateCcw size={20} /></button>
        </div>
        <div className="mt-4 flex justify-center gap-1.5" role="group" aria-label="Velocidad">
          {SPEEDS.map((s) => (
            <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)} className={cn("rounded-full px-3 py-1 text-xs font-semibold", speed === s ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted")}>
              {s.toLocaleString("es")}×
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {item.kind === "dictation" ? (
          <form onSubmit={(e) => { e.preventDefault(); void submit(answer); }} className="space-y-3">
            <input
              ref={input}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!!fb}
              lang={locale}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Escribe la frase…"
              className="h-14 w-full rounded-2xl border border-border bg-surface px-4 text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
            />
            {!fb && <ScriptKeyboard lang={locale.split("-")[0]!} locale={locale} value={answer} onChange={setAnswer} defaultOpen={false} romanOk={false} />}
            {!fb && <Button type="submit" size="lg" className="w-full" disabled={busy || !answer.trim()}>{busy ? <Loader2 className="animate-spin" size={18} /> : null} Comprobar</Button>}
          </form>
        ) : (
          <div className="grid gap-2">
            {item.options!.map((o) => {
              const st = fb ? (o === fb.answer ? "ok" : o === answer ? "bad" : null) : null;
              return (
                <button
                  key={o}
                  type="button"
                  disabled={!!fb || busy}
                  onClick={() => { setAnswer(o); void submit(o); }}
                  lang={item.kind === "spot" ? locale : "es"}
                  className={cn(
                    "rounded-2xl border px-4 py-3.5 text-left text-lg font-medium transition",
                    !fb && "border-border bg-surface hover:border-primary",
                    st === "ok" && "animate-pop border-success bg-success-soft text-success-ink",
                    st === "bad" && "animate-shake border-danger bg-danger-soft text-danger-ink",
                    fb && !st && "border-border opacity-50",
                  )}
                >
                  {o}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {fb && (
        <div role="status" className={cn("mt-6 animate-sheet rounded-3xl p-5", fb.correct ? "bg-success-soft" : "bg-danger-soft")}>
          <p className={cn("font-display text-xl font-extrabold", fb.correct ? "text-success-ink" : "text-danger-ink")}>{fb.correct ? "¡Correcto!" : "Casi, mira la frase:"}</p>
          {fb.diff ? (
            <p className="mt-2 text-lg leading-relaxed" lang={locale}>
              {fb.diff.map((p, k) => (
                <span key={k} className={cn("mr-1.5 rounded px-1", p.kind === "ok" && "text-success-ink", p.kind === "typo" && "bg-warning-soft text-warning-ink", p.kind === "missing" && "bg-danger/15 text-danger-ink underline decoration-dotted", p.kind === "extra" && "text-muted line-through")}>
                  {p.text}
                </span>
              ))}
            </p>
          ) : null}
          <p className="mt-2 text-lg font-semibold" lang={locale}>{fb.transcript}</p>
          <p className="text-muted">{fb.translation}</p>
          {fb.diff ? <p className="mt-2 text-xs text-muted">Verde: bien · amarillo: casi (acento o errata) · rojo: faltó · tachado: sobró</p> : null}
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => play()}><Volume2 size={16} /> Oír otra vez</Button>
            <Button className="flex-1" variant={fb.correct ? "success" : "primary"} onClick={() => void next()} autoFocus>
              {i + 1 < items.length ? "Siguiente" : "Ver resultado"} <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
