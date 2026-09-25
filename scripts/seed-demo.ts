/**
 * Datos de demostración: crea el usuario "Carlos" con ~20 semanas de historial
 * realista (repasos FSRS simulados, intentos, errores clasificados, sesiones,
 * actividad diaria, objetivo y logros) para ver la app "viva".
 *
 * SÓLO contra los emuladores (se niega a correr sin FIRESTORE_EMULATOR_HOST).
 * Lo ejecuta `npm run dev:emulated`; a mano:
 *   npx tsx --conditions=react-server scripts/seed-demo.ts
 *
 * Credenciales del usuario demo: demo@improve.local / demo-password
 */
import { Timestamp, type WriteBatch } from "firebase-admin/firestore";
import { vocabFor } from "../src/lib/content";
import type { Skill } from "../src/lib/content/types";
import * as repo from "../src/lib/db/repositories";
import { Fsrs, newCard, type CardMemory, type Rating } from "../src/lib/engine/fsrs";
import { adminAuth, firestore } from "../src/lib/firebase/admin";

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error("seed-demo: sólo se ejecuta contra los emuladores de Firebase (npm run dev:emulated).");
  process.exit(1);
}

const EMAIL = "demo@improve.local";
const PASSWORD = "demo-password";
const LANG = "en";
const DAY = 86_400_000;
const now = new Date();

// PRNG determinista: el mismo historial en cada arranque.
let seed = 42;
const rand = () => ((seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31) / 2 ** 31);
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]!;
const dayStr = (d: Date) => d.toISOString().slice(0, 10);

async function main() {
  const auth = adminAuth();
  const existing = await auth.getUserByEmail(EMAIL).catch(() => null);
  if (existing) {
    console.log(`seed-demo: ${EMAIL} ya existe (uid ${existing.uid}); nada que hacer.`);
    return;
  }
  const user = await auth.createUser({ email: EMAIL, password: PASSWORD, displayName: "Carlos Demo", emailVerified: true });
  const uid = user.uid;
  const db = firestore();

  await repo.ensureProfile(uid, "Carlos");
  await repo.updateProfile(uid, {
    nativeLanguage: "es",
    activeLanguage: LANG,
    dailyMinutes: 20,
    interests: ["tech", "gaming", "work"],
    interactionPrefs: ["examples", "challenges"],
    motivation: "work",
    onboardedAt: new Date(now.getTime() - 140 * DAY),
    consentAt: new Date(now.getTime() - 140 * DAY),
    aiConsent: true,
    theme: "light",
  });
  const ul = await repo.upsertUserLanguage(uid, LANG, "B1");
  const ulId = ul.id;
  await repo.markAssessed(ulId);
  await repo.setGoal(ulId, { targetLevel: "B2", deadline: dayStr(new Date(now.getTime() + 120 * DAY)), minutesPerDay: 20, reason: "work" });
  await repo.upsertSkillEstimates(ulId, [
    // Perfil del Figma: vocabulario y lectura en B2, gramática y listening en B1, speaking en A2.
    { skill: "vocabulary", theta: 0.25, se: 0.3, evidence: 240 },
    { skill: "grammar", theta: -0.45, se: 0.32, evidence: 130 },
    { skill: "reading", theta: 0.4, se: 0.35, evidence: 60 },
    { skill: "listening", theta: -0.9, se: 0.4, evidence: 45 },
    { skill: "writing", theta: -0.6, se: 0.5, evidence: 12 },
    { skill: "speaking", theta: -1.3, se: 0.6, evidence: 6 },
  ]);

  // ── Historial: 20 semanas, más constante al final (racha actual de 12 días).
  const fsrs = new Fsrs();
  const vocab = vocabFor(LANG).filter((v) => ["A1", "A2", "B1", "B2"].includes(v.cefr));
  const cards = new Map<string, CardMemory>();
  const stats = new Map<string, { exposure: number; ok: number; bad: number }>();
  const langRef = db.collection("users").doc(uid).collection("languages").doc(LANG);
  const weakCats = ["past-tense", "past-tense", "past-tense", "articles", "articles", "prepositions", "listening", "question-formation"];
  const skills: Skill[] = ["vocabulary", "vocabulary", "vocabulary", "grammar", "grammar", "listening", "reading"];
  let introduced = 0;
  let writes = db.batch();
  let pending = 0;
  const flush = async () => {
    if (pending > 0) await writes.commit();
    writes = db.batch();
    pending = 0;
  };
  const queue = async (fn: (b: WriteBatch) => void) => {
    fn(writes);
    if (++pending >= 400) await flush();
  };

  for (let back = 140; back >= 1; back--) {
    const streak = back <= 12;
    if (!streak && rand() < (back > 70 ? 0.55 : 0.35)) continue; // días sin estudio
    const day = new Date(now.getTime() - back * DAY);
    day.setUTCHours(1 + Math.floor(rand() * 4), Math.floor(rand() * 60)); // tarde en México
    const exercises = 8 + Math.floor(rand() * 14);
    const sessionRef = langRef.collection("sessions").doc();
    let correct = 0;
    let wordsReviewed = 0;

    for (let i = 0; i < exercises; i++) {
      const at = new Date(day.getTime() + i * 45_000);
      const skill = pick(skills);
      // Vocabulario: repasa vencidas o introduce nuevas.
      let itemId: string | null = null;
      if (skill === "vocabulary") {
        const due = [...cards.entries()].filter(([, c]) => c.due <= at);
        if (due.length && rand() < 0.7) itemId = pick(due)[0];
        else if (introduced < vocab.length) itemId = vocab[introduced++]!.id;
      }
      const successP = back > 70 ? 0.62 : 0.78; // mejora con el tiempo
      const ok = rand() < successP;
      if (ok) correct++;
      const category = skill === "vocabulary" ? "vocabulary" : pick(weakCats);
      if (itemId) {
        wordsReviewed++;
        const rating: Rating = ok ? (rand() < 0.2 ? 4 : 3) : 1;
        cards.set(itemId, fsrs.review(cards.get(itemId) ?? newCard(at), rating, at));
        const s = stats.get(itemId) ?? { exposure: 0, ok: 0, bad: 0 };
        s.exposure++;
        if (ok) s.ok++;
        else s.bad++;
        stats.set(itemId, s);
      }
      const attemptRef = langRef.collection("attempts").doc();
      await queue((b) =>
        b.set(attemptRef, {
          sessionId: sessionRef.id,
          exerciseKey: itemId ? `choice|${itemId}|0` : `grammar|${category}|0`,
          exerciseType: itemId ? "choice" : "cloze",
          skill,
          errorCategory: itemId ? "vocabulary" : category,
          correct: ok,
          nearMiss: false,
          response: ok ? "ok" : "demo",
          timeMs: 3000 + Math.floor(rand() * 9000),
          attempts: 1,
          confidence: null,
          difficulty: 0.5,
          createdAt: Timestamp.fromDate(at),
        }),
      );
      if (!ok && !itemId && back <= 28) {
        await queue((b) =>
          b.set(langRef.collection("mistakes").doc(), {
            sessionId: sessionRef.id,
            attemptId: attemptRef.id,
            source: "exercise",
            category,
            subcategory: "cloze",
            userText: category === "past-tense" ? "She go to school yesterday." : null,
            correctedText: category === "past-tense" ? "She went to school yesterday." : null,
            explanation: null,
            createdAt: Timestamp.fromDate(at),
          }),
        );
      }
    }

    const seconds = exercises * 50;
    await queue((b) =>
      b.set(sessionRef, {
        kind: "daily", plannedMinutes: 20, planJson: null, startedAt: Timestamp.fromDate(day),
        completedAt: Timestamp.fromDate(new Date(day.getTime() + seconds * 1000)), completed: true,
        durationSeconds: seconds, exercisesCount: exercises, correctCount: correct, active: true,
      }),
    );
    await queue((b) =>
      b.set(db.collection("users").doc(uid).collection("activity").doc(`${dayStr(day)}__${LANG}`), {
        day: dayStr(day), languageCode: LANG, seconds, exercises, correct, wordsReviewed, sessions: 1,
      }),
    );
  }
  await flush();

  for (const [itemId, c] of cards) {
    const s = stats.get(itemId)!;
    await repo.saveKnowledge({
      userLanguageId: ulId,
      itemId,
      itemType: "vocab",
      status: s.bad > s.ok ? "difficult" : "learning",
      stability: c.stability,
      difficulty: c.difficulty,
      reps: c.reps,
      lapses: c.lapses,
      state: c.state,
      dueAt: c.due,
      lastReviewAt: c.lastReview,
      exposureCount: s.exposure,
      correctCount: s.ok,
      incorrectCount: s.bad,
      avgResponseMs: 5200,
    });
  }

  // Diagnóstico completado (para el logro y el historial).
  await langRef.collection("assessments").add({
    status: "completed", stateJson: null, currentItemId: null, currentItemSentAt: null,
    resultJson: JSON.stringify({ overall: "B1" }), startedAt: Timestamp.fromDate(new Date(now.getTime() - 140 * DAY)),
    finishedAt: Timestamp.fromDate(new Date(now.getTime() - 140 * DAY + 6 * 60_000)),
  });
  await repo.unlockAchievements(uid, ["first-assessment", "first-session", "streak-7", "words-100", "exercises-100"]);

  console.log(`seed-demo: listo → ${EMAIL} / ${PASSWORD} (${cards.size} palabras con historial)`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("seed-demo: falló", err);
    process.exit(1);
  },
);
