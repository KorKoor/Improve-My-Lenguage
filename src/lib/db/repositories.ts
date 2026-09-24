import "server-only";
import type { CefrLevel, Skill } from "../content/types";
import type { SkillEstimate } from "../engine/levels";
import { db } from "./client";
import type {
  ActivityRow,
  GoalRow,
  KnowledgeDbRow,
  ProfileRow,
  SessionRow,
  SkillEstimateRow,
  UserLanguageRow,
} from "./types";

/**
 * Repositorios: única capa que escribe SQL. Toda función recibe el userId (o
 * un userLanguageId ya verificado como propiedad del usuario) y filtra por él:
 * la autorización se aplica aquí, no sólo en la UI.
 */

// ── Perfil ────────────────────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const rows = await db()<ProfileRow[]>`select * from profiles where id = ${userId}`;
  return rows[0] ?? null;
}

export async function ensureProfile(userId: string, displayName: string | null): Promise<ProfileRow> {
  const rows = await db()<ProfileRow[]>`
    insert into profiles (id, display_name) values (${userId}, ${displayName})
    on conflict (id) do update set id = excluded.id
    returning *`;
  return rows[0]!;
}

export type ProfileUpdate = Partial<
  Pick<
    ProfileRow,
    | "displayName"
    | "nativeLanguage"
    | "activeLanguage"
    | "timezone"
    | "theme"
    | "dailyMinutes"
    | "explanationDepth"
    | "preferredDifficulty"
    | "competitive"
    | "motivation"
    | "interests"
    | "interactionPrefs"
    | "onboardedAt"
    | "consentAt"
    | "aiConsent"
  >
>;

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<void> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;
  const data = Object.fromEntries(entries);
  const sql = db();
  await sql`update profiles set ${sql(data)}, updated_at = now() where id = ${userId}`;
}

// ── Idiomas del usuario ───────────────────────────────────────────────────
export async function listUserLanguages(userId: string): Promise<UserLanguageRow[]> {
  return db()<UserLanguageRow[]>`
    select * from user_languages where user_id = ${userId} order by created_at`;
}

export async function getUserLanguage(userId: string, code: string): Promise<UserLanguageRow | null> {
  const rows = await db()<UserLanguageRow[]>`
    select * from user_languages where user_id = ${userId} and language_code = ${code}`;
  return rows[0] ?? null;
}

export async function upsertUserLanguage(
  userId: string,
  code: string,
  selfReportedLevel: CefrLevel | null,
): Promise<UserLanguageRow> {
  const rows = await db()<UserLanguageRow[]>`
    insert into user_languages (user_id, language_code, self_reported_level)
    values (${userId}, ${code}, ${selfReportedLevel})
    on conflict (user_id, language_code)
      do update set self_reported_level = coalesce(excluded.self_reported_level, user_languages.self_reported_level)
    returning *`;
  return rows[0]!;
}

export async function markAssessed(userLanguageId: string): Promise<void> {
  await db()`update user_languages set assessed_at = now() where id = ${userLanguageId}`;
}

// ── Vector de habilidades ─────────────────────────────────────────────────
export async function getSkillEstimates(userLanguageId: string): Promise<SkillEstimate[]> {
  const rows = await db()<SkillEstimateRow[]>`
    select skill, theta, se, evidence from skill_estimates where user_language_id = ${userLanguageId}`;
  return rows.map((r) => ({ skill: r.skill, theta: r.theta, se: r.se, evidence: r.evidence }));
}

export async function upsertSkillEstimates(userLanguageId: string, estimates: SkillEstimate[]): Promise<void> {
  if (estimates.length === 0) return;
  const sql = db();
  const rows = estimates.map((e) => ({
    userLanguageId,
    skill: e.skill,
    theta: e.theta,
    se: e.se,
    evidence: e.evidence,
  }));
  await sql`
    insert into skill_estimates ${sql(rows, "userLanguageId", "skill", "theta", "se", "evidence")}
    on conflict (user_language_id, skill) do update
      set theta = excluded.theta, se = excluded.se, evidence = excluded.evidence, updated_at = now()`;
}

// ── Objetivos ─────────────────────────────────────────────────────────────
export async function getActiveGoal(userLanguageId: string): Promise<GoalRow | null> {
  const rows = await db()<GoalRow[]>`
    select id, user_language_id, target_level, deadline::text as deadline, minutes_per_day, reason, created_at
    from learning_goals where user_language_id = ${userLanguageId} and achieved_at is null`;
  return rows[0] ?? null;
}

export async function setGoal(
  userLanguageId: string,
  goal: { targetLevel: CefrLevel; deadline: string | null; minutesPerDay: number; reason: string | null },
): Promise<void> {
  const sql = db();
  await sql.begin(async (tx) => {
    await tx`delete from learning_goals where user_language_id = ${userLanguageId} and achieved_at is null`;
    await tx`
      insert into learning_goals (user_language_id, target_level, deadline, minutes_per_day, reason)
      values (${userLanguageId}, ${goal.targetLevel}, ${goal.deadline}, ${goal.minutesPerDay}, ${goal.reason})`;
  });
}

// ── Conocimiento (FSRS) ───────────────────────────────────────────────────
export async function getKnowledge(userLanguageId: string, itemIds: string[]): Promise<KnowledgeDbRow[]> {
  if (itemIds.length === 0) return [];
  return db()<KnowledgeDbRow[]>`
    select * from user_knowledge where user_language_id = ${userLanguageId} and item_id = any(${itemIds}::text[])`;
}

export async function getAllKnowledge(userLanguageId: string): Promise<KnowledgeDbRow[]> {
  return db()<KnowledgeDbRow[]>`select * from user_knowledge where user_language_id = ${userLanguageId}`;
}

export async function getDueKnowledge(userLanguageId: string, now: Date, limit: number): Promise<KnowledgeDbRow[]> {
  return db()<KnowledgeDbRow[]>`
    select * from user_knowledge
    where user_language_id = ${userLanguageId} and reps > 0 and due_at <= ${now} and status <> 'known'
    order by due_at asc
    limit ${limit}`;
}

export async function countDue(userLanguageId: string, now: Date): Promise<number> {
  const rows = await db()<{ n: number }[]>`
    select count(*)::int as n from user_knowledge
    where user_language_id = ${userLanguageId} and reps > 0 and due_at <= ${now} and status <> 'known'`;
  return rows[0]?.n ?? 0;
}

export async function saveKnowledge(row: KnowledgeDbRow): Promise<void> {
  const sql = db();
  await sql`
    insert into user_knowledge ${sql(
      row,
      "userLanguageId",
      "itemId",
      "itemType",
      "status",
      "stability",
      "difficulty",
      "reps",
      "lapses",
      "state",
      "dueAt",
      "lastReviewAt",
      "exposureCount",
      "correctCount",
      "incorrectCount",
      "avgResponseMs",
    )}
    on conflict (user_language_id, item_id) do update set
      status = excluded.status,
      stability = excluded.stability,
      difficulty = excluded.difficulty,
      reps = excluded.reps,
      lapses = excluded.lapses,
      state = excluded.state,
      due_at = excluded.due_at,
      last_review_at = excluded.last_review_at,
      exposure_count = excluded.exposure_count,
      correct_count = excluded.correct_count,
      incorrect_count = excluded.incorrect_count,
      avg_response_ms = excluded.avg_response_ms`;
}

export async function setKnowledgeStatus(
  userLanguageId: string,
  itemId: string,
  itemType: "vocab" | "grammar",
  status: KnowledgeDbRow["status"],
): Promise<void> {
  await db()`
    insert into user_knowledge (user_language_id, item_id, item_type, status)
    values (${userLanguageId}, ${itemId}, ${itemType}, ${status})
    on conflict (user_language_id, item_id) do update set status = excluded.status`;
}

// ── Intentos y errores ────────────────────────────────────────────────────
export interface AttemptInsert {
  userLanguageId: string;
  sessionId: string | null;
  exerciseKey: string;
  exerciseType: string;
  skill: Skill;
  errorCategory: string | null;
  correct: boolean;
  nearMiss: boolean;
  response: string;
  timeMs: number;
  attempts: number;
  confidence: number | null;
  difficulty: number;
}

export async function insertAttempt(a: AttemptInsert): Promise<number> {
  const sql = db();
  const rows = await sql<{ id: number }[]>`
    insert into exercise_attempts ${sql(
      a,
      "userLanguageId",
      "sessionId",
      "exerciseKey",
      "exerciseType",
      "skill",
      "errorCategory",
      "correct",
      "nearMiss",
      "response",
      "timeMs",
      "attempts",
      "confidence",
      "difficulty",
    )}
    returning id`;
  return Number(rows[0]!.id);
}

export interface MistakeInsert {
  userLanguageId: string;
  sessionId: string | null;
  attemptId: number | null;
  source: "exercise" | "tutor" | "writing" | "assessment";
  category: string;
  subcategory: string | null;
  userText: string | null;
  correctedText: string | null;
  explanation: string | null;
}

export async function insertMistakes(rows: MistakeInsert[]): Promise<void> {
  if (rows.length === 0) return;
  const sql = db();
  await sql`
    insert into mistakes ${sql(
      rows,
      "userLanguageId",
      "sessionId",
      "attemptId",
      "source",
      "category",
      "subcategory",
      "userText",
      "correctedText",
      "explanation",
    )}`;
}

export async function recentMistakes(userLanguageId: string, since: Date) {
  return db()<{ category: string; createdAt: Date; sessionId: string | null }[]>`
    select category, created_at, session_id from mistakes
    where user_language_id = ${userLanguageId} and created_at >= ${since}
    order by created_at desc limit 500`;
}

export async function recentMistakeExamples(userLanguageId: string, limit: number) {
  return db()<{ category: string; userText: string | null; correctedText: string | null; createdAt: Date }[]>`
    select category, user_text, corrected_text, created_at from mistakes
    where user_language_id = ${userLanguageId}
    order by created_at desc limit ${limit}`;
}

export async function attemptStatsByCategory(userLanguageId: string, since: Date) {
  return db()<{ category: string; total: number; correct: number }[]>`
    select error_category as category, count(*)::int as total, count(*) filter (where correct)::int as correct
    from exercise_attempts
    where user_language_id = ${userLanguageId} and created_at >= ${since} and error_category is not null
    group by error_category`;
}

export async function attemptTotals(userLanguageId: string, since: Date | null) {
  const rows = await db()<{ total: number; correct: number }[]>`
    select count(*)::int as total, count(*) filter (where correct)::int as correct
    from exercise_attempts
    where user_language_id = ${userLanguageId} and (${since}::timestamptz is null or created_at >= ${since})`;
  return rows[0] ?? { total: 0, correct: 0 };
}

export async function weeklyAccuracy(userLanguageId: string, weeks: number) {
  return db()<{ week: string; total: number; correct: number }[]>`
    select to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week,
           count(*)::int as total, count(*) filter (where correct)::int as correct
    from exercise_attempts
    where user_language_id = ${userLanguageId} and created_at >= now() - make_interval(weeks => ${weeks})
    group by 1 order by 1`;
}

export async function skillAccuracy(userLanguageId: string, since: Date) {
  return db()<{ skill: Skill; total: number; correct: number }[]>`
    select skill, count(*)::int as total, count(*) filter (where correct)::int as correct
    from exercise_attempts
    where user_language_id = ${userLanguageId} and created_at >= ${since}
    group by skill`;
}

// ── Sesiones ──────────────────────────────────────────────────────────────
export async function createSession(
  userLanguageId: string,
  kind: SessionRow["kind"],
  plannedMinutes: number,
  plan: unknown,
): Promise<SessionRow> {
  const sql = db();
  const rows = await sql<SessionRow[]>`
    insert into learning_sessions (user_language_id, kind, planned_minutes, plan)
    values (${userLanguageId}, ${kind}, ${plannedMinutes}, ${sql.json(plan as never)})
    returning *`;
  return rows[0]!;
}

export async function getSession(userLanguageId: string, sessionId: string): Promise<SessionRow | null> {
  const rows = await db()<SessionRow[]>`
    select * from learning_sessions where id = ${sessionId} and user_language_id = ${userLanguageId}`;
  return rows[0] ?? null;
}

export async function bumpSession(sessionId: string, correct: boolean): Promise<void> {
  await db()`
    update learning_sessions
    set exercises_count = exercises_count + 1, correct_count = correct_count + ${correct ? 1 : 0}
    where id = ${sessionId}`;
}

export async function completeSession(userLanguageId: string, sessionId: string, durationSeconds: number) {
  const rows = await db()<SessionRow[]>`
    update learning_sessions
    set completed_at = coalesce(completed_at, now()),
        duration_seconds = greatest(duration_seconds, ${durationSeconds})
    where id = ${sessionId} and user_language_id = ${userLanguageId}
    returning *`;
  return rows[0] ?? null;
}

export async function recentSessionIds(userLanguageId: string, n: number): Promise<string[]> {
  const rows = await db()<{ id: string }[]>`
    select id from learning_sessions
    where user_language_id = ${userLanguageId} and exercises_count > 0
    order by started_at desc limit ${n}`;
  return rows.map((r) => r.id);
}

export async function sessionCounts(userId: string) {
  const rows = await db()<{ completed: number; minutes: number }[]>`
    select count(*) filter (where s.completed_at is not null)::int as completed,
           coalesce(sum(s.duration_seconds), 0)::int / 60 as minutes
    from learning_sessions s join user_languages ul on ul.id = s.user_language_id
    where ul.user_id = ${userId}`;
  return rows[0] ?? { completed: 0, minutes: 0 };
}

// ── Diagnóstico ───────────────────────────────────────────────────────────
export interface AssessmentRow {
  id: string;
  userLanguageId: string;
  status: "in_progress" | "completed" | "abandoned";
  state: unknown;
  currentItemId: string | null;
  currentItemSentAt: Date | null;
  result: unknown;
  startedAt: Date;
  finishedAt: Date | null;
}

export async function getOpenAssessment(userLanguageId: string): Promise<AssessmentRow | null> {
  const rows = await db()<AssessmentRow[]>`
    select * from assessments
    where user_language_id = ${userLanguageId} and status = 'in_progress'
      and started_at > now() - interval '1 day'
    order by started_at desc limit 1`;
  return rows[0] ?? null;
}

export async function createAssessmentRow(userLanguageId: string, state: unknown): Promise<AssessmentRow> {
  const sql = db();
  await sql`update assessments set status = 'abandoned'
            where user_language_id = ${userLanguageId} and status = 'in_progress'`;
  const rows = await sql<AssessmentRow[]>`
    insert into assessments (user_language_id, state) values (${userLanguageId}, ${sql.json(state as never)})
    returning *`;
  return rows[0]!;
}

export async function updateAssessmentRow(
  id: string,
  userLanguageId: string,
  patch: { state: unknown; currentItemId: string | null; status?: AssessmentRow["status"]; result?: unknown },
): Promise<void> {
  const sql = db();
  await sql`
    update assessments set
      state = ${sql.json(patch.state as never)},
      current_item_id = ${patch.currentItemId},
      current_item_sent_at = ${patch.currentItemId ? new Date() : null},
      status = ${patch.status ?? "in_progress"},
      result = ${patch.result === undefined ? null : sql.json(patch.result as never)},
      finished_at = ${patch.status === "completed" ? new Date() : null}
    where id = ${id} and user_language_id = ${userLanguageId}`;
}

export async function countCompletedAssessments(userId: string): Promise<number> {
  const rows = await db()<{ n: number }[]>`
    select count(*)::int as n from assessments a join user_languages ul on ul.id = a.user_language_id
    where ul.user_id = ${userId} and a.status = 'completed'`;
  return rows[0]?.n ?? 0;
}

// ── Actividad diaria ──────────────────────────────────────────────────────
export async function bumpActivity(
  userId: string,
  languageCode: string,
  day: string,
  delta: { seconds?: number; exercises?: number; correct?: number; wordsReviewed?: number; sessions?: number },
): Promise<void> {
  await db()`
    insert into daily_activity (user_id, language_code, day, seconds, exercises, correct, words_reviewed, sessions)
    values (${userId}, ${languageCode}, ${day}, ${delta.seconds ?? 0}, ${delta.exercises ?? 0},
            ${delta.correct ?? 0}, ${delta.wordsReviewed ?? 0}, ${delta.sessions ?? 0})
    on conflict (user_id, language_code, day) do update set
      seconds = daily_activity.seconds + excluded.seconds,
      exercises = daily_activity.exercises + excluded.exercises,
      correct = daily_activity.correct + excluded.correct,
      words_reviewed = daily_activity.words_reviewed + excluded.words_reviewed,
      sessions = daily_activity.sessions + excluded.sessions`;
}

export async function getActivity(userId: string, sinceDay: string, languageCode?: string): Promise<ActivityRow[]> {
  return db()<ActivityRow[]>`
    select day::text as day, sum(seconds)::int as seconds, sum(exercises)::int as exercises,
           sum(correct)::int as correct, sum(words_reviewed)::int as words_reviewed, sum(sessions)::int as sessions
    from daily_activity
    where user_id = ${userId} and day >= ${sinceDay}
      and (${languageCode ?? null}::text is null or language_code = ${languageCode ?? null})
    group by day order by day`;
}

export async function allActiveDays(userId: string): Promise<string[]> {
  const rows = await db()<{ day: string }[]>`
    select distinct day::text as day from daily_activity where user_id = ${userId} and exercises > 0 order by day`;
  return rows.map((r) => r.day);
}

export async function totalExercises(userId: string): Promise<number> {
  const rows = await db()<{ n: number }[]>`
    select coalesce(sum(exercises), 0)::int as n from daily_activity where user_id = ${userId}`;
  return rows[0]?.n ?? 0;
}

// ── Logros ────────────────────────────────────────────────────────────────
export async function getUnlockedAchievements(userId: string) {
  return db()<{ achievementId: string; unlockedAt: Date }[]>`
    select achievement_id, unlocked_at from user_achievements where user_id = ${userId} order by unlocked_at`;
}

export async function unlockAchievements(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const sql = db();
  const rows = ids.map((achievementId) => ({ userId, achievementId }));
  await sql`insert into user_achievements ${sql(rows, "userId", "achievementId")} on conflict do nothing`;
}

// ── Tutor ─────────────────────────────────────────────────────────────────
export interface ConversationRow {
  id: string;
  userLanguageId: string;
  topic: string | null;
  feedback: unknown;
  createdAt: Date;
  endedAt: Date | null;
}

export async function createConversation(userLanguageId: string, topic: string | null): Promise<ConversationRow> {
  const rows = await db()<ConversationRow[]>`
    insert into conversations (user_language_id, topic) values (${userLanguageId}, ${topic}) returning *`;
  return rows[0]!;
}

export async function getConversation(userLanguageId: string, id: string): Promise<ConversationRow | null> {
  const rows = await db()<ConversationRow[]>`
    select * from conversations where id = ${id} and user_language_id = ${userLanguageId}`;
  return rows[0] ?? null;
}

export async function listConversations(userLanguageId: string, limit = 10): Promise<ConversationRow[]> {
  return db()<ConversationRow[]>`
    select * from conversations where user_language_id = ${userLanguageId}
    order by created_at desc limit ${limit}`;
}

export async function getMessages(conversationId: string) {
  return db()<{ id: number; role: "user" | "assistant"; content: string; createdAt: Date }[]>`
    select id, role, content, created_at from conversation_messages
    where conversation_id = ${conversationId} order by id`;
}

export async function addMessage(conversationId: string, role: "user" | "assistant", content: string) {
  await db()`insert into conversation_messages (conversation_id, role, content)
             values (${conversationId}, ${role}, ${content.slice(0, 4000)})`;
}

export async function endConversation(id: string, feedback: unknown): Promise<void> {
  const sql = db();
  await sql`update conversations set ended_at = now(), feedback = ${sql.json(feedback as never)} where id = ${id}`;
}

export async function countConversations(userId: string): Promise<number> {
  const rows = await db()<{ n: number }[]>`
    select count(*)::int as n from conversations c join user_languages ul on ul.id = c.user_language_id
    where ul.user_id = ${userId}`;
  return rows[0]?.n ?? 0;
}

// ── Analítica ─────────────────────────────────────────────────────────────
export async function track(userId: string, name: string, props: Record<string, unknown> = {}): Promise<void> {
  try {
    const sql = db();
    await sql`insert into analytics_events (user_id, name, props) values (${userId}, ${name}, ${sql.json(props as never)})`;
  } catch (err) {
    // La analítica nunca debe romper una acción del usuario.
    console.error("[analytics] fallo al registrar evento", name, err);
  }
}

// ── Cuenta: exportación y borrado ─────────────────────────────────────────
export async function exportUserData(userId: string) {
  const sql = db();
  const [profile] = await sql`select * from profiles where id = ${userId}`;
  const languages = await sql`select * from user_languages where user_id = ${userId}`;
  const ids = languages.map((l) => l.id as string);
  const q = <T>(p: Promise<T>) => p;
  return {
    exportedAt: new Date().toISOString(),
    profile,
    languages,
    skillEstimates: await q(sql`select * from skill_estimates where user_language_id = any(${ids}::uuid[])`),
    goals: await q(sql`select * from learning_goals where user_language_id = any(${ids}::uuid[])`),
    assessments: await q(sql`select id, user_language_id, status, result, started_at, finished_at from assessments where user_language_id = any(${ids}::uuid[])`),
    sessions: await q(sql`select * from learning_sessions where user_language_id = any(${ids}::uuid[])`),
    knowledge: await q(sql`select * from user_knowledge where user_language_id = any(${ids}::uuid[])`),
    attempts: await q(sql`select * from exercise_attempts where user_language_id = any(${ids}::uuid[])`),
    mistakes: await q(sql`select * from mistakes where user_language_id = any(${ids}::uuid[])`),
    conversations: await q(sql`
      select c.*, coalesce(json_agg(m order by m.id) filter (where m.id is not null), '[]') as messages
      from conversations c left join conversation_messages m on m.conversation_id = c.id
      where c.user_language_id = any(${ids}::uuid[]) group by c.id`),
    dailyActivity: await q(sql`select * from daily_activity where user_id = ${userId}`),
    achievements: await q(sql`select * from user_achievements where user_id = ${userId}`),
  };
}

/** Borra TODOS los datos de aplicación del usuario (cascada desde las raíces). */
export async function deleteUserData(userId: string): Promise<void> {
  const sql = db();
  await sql.begin(async (tx) => {
    await tx`delete from user_languages where user_id = ${userId}`;
    await tx`delete from daily_activity where user_id = ${userId}`;
    await tx`delete from user_achievements where user_id = ${userId}`;
    await tx`delete from analytics_events where user_id = ${userId}`;
    await tx`delete from rate_limits where key like ${"%:" + userId}`;
    await tx`delete from profiles where id = ${userId}`;
  });
}

/**
 * Intenta borrar la identidad en auth.users vía SQL (funciona si el rol de la
 * conexión tiene permiso sobre el esquema auth). Si no, el servicio usa la
 * Admin API de Supabase con la service role key.
 */
export async function deleteAuthUserViaSql(userId: string): Promise<boolean> {
  try {
    await db()`delete from auth.users where id = ${userId}`;
    return true;
  } catch (err) {
    console.error("[account] no se pudo borrar auth.users vía SQL", err);
    return false;
  }
}
