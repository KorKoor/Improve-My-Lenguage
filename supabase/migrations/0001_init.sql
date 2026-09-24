-- ════════════════════════════════════════════════════════════════════════
-- Improve My Languages — esquema inicial (PostgreSQL 15+, compatible Supabase)
--
-- Principios:
--  • Sólo estado del usuario. El contenido (vocabulario, gramática, bancos)
--    vive en el repositorio y se referencia por ID de texto estable.
--  • Todo cuelga de auth.users → ON DELETE CASCADE: borrar la cuenta borra
--    todos los datos (derecho de cancelación).
--  • RLS activado SIN políticas en todas las tablas: la API REST pública de
--    Supabase (anon/authenticated) no puede leer ni escribir nada. Sólo el
--    servidor, con la conexión directa (rol postgres), accede a los datos.
--
-- Si no usas Supabase, crea antes un esquema "auth" con una tabla
-- auth.users(id uuid primary key) o sustituye las FK por tu tabla de usuarios.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Perfil y preferencias ────────────────────────────────────────────────
create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  display_name          text check (char_length(display_name) <= 60),
  native_language       text not null default 'es' check (char_length(native_language) between 2 and 8),
  active_language       text check (char_length(active_language) between 2 and 8),
  timezone              text not null default 'America/Mexico_City',
  theme                 text not null default 'system' check (theme in ('light', 'dark', 'system')),
  daily_minutes         smallint not null default 15 check (daily_minutes between 5 and 180),
  explanation_depth     text not null default 'balanced' check (explanation_depth in ('brief', 'balanced', 'detailed')),
  preferred_difficulty  text not null default 'balanced' check (preferred_difficulty in ('easy', 'balanced', 'challenging')),
  competitive           boolean not null default false,
  motivation            text check (char_length(motivation) <= 200),
  interests             text[] not null default '{}',
  interaction_prefs     text[] not null default '{}', -- preferencias de interacción, NO "estilos de aprendizaje"
  onboarded_at          timestamptz,
  consent_at            timestamptz,             -- aceptación de la política de privacidad
  ai_consent            boolean not null default false, -- envío de texto a proveedores de IA
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── Idiomas que estudia el usuario ───────────────────────────────────────
create table public.user_languages (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  language_code         text not null check (char_length(language_code) between 2 and 8),
  self_reported_level   text check (self_reported_level in ('A1','A2','B1','B2','C1','C2')),
  assessed_at           timestamptz,
  created_at            timestamptz not null default now(),
  unique (user_id, language_code)
);
create index user_languages_user_idx on public.user_languages (user_id);

-- Vector de habilidades: θ (escala logit) + error estándar + evidencia.
create table public.skill_estimates (
  user_language_id      uuid not null references public.user_languages (id) on delete cascade,
  skill                 text not null check (skill in ('vocabulary','grammar','reading','listening','writing','speaking','pronunciation')),
  theta                 real not null,
  se                    real not null check (se > 0),
  evidence              integer not null default 0 check (evidence >= 0),
  updated_at            timestamptz not null default now(),
  primary key (user_language_id, skill)
);

create table public.learning_goals (
  id                    uuid primary key default gen_random_uuid(),
  user_language_id      uuid not null references public.user_languages (id) on delete cascade,
  target_level          text not null check (target_level in ('A1','A2','B1','B2','C1','C2')),
  deadline              date,
  minutes_per_day       smallint not null check (minutes_per_day between 5 and 180),
  reason                text check (char_length(reason) <= 200),
  created_at            timestamptz not null default now(),
  achieved_at           timestamptz
);
create unique index learning_goals_one_active on public.learning_goals (user_language_id) where achieved_at is null;

-- ── Diagnóstico adaptativo ───────────────────────────────────────────────
create table public.assessments (
  id                    uuid primary key default gen_random_uuid(),
  user_language_id      uuid not null references public.user_languages (id) on delete cascade,
  status                text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  state                 jsonb not null,           -- AssessmentState del motor
  current_item_id       text,
  current_item_sent_at  timestamptz,
  result                jsonb,
  started_at            timestamptz not null default now(),
  finished_at           timestamptz
);
create index assessments_ul_idx on public.assessments (user_language_id, started_at desc);

-- ── Sesiones de estudio ──────────────────────────────────────────────────
create table public.learning_sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_language_id      uuid not null references public.user_languages (id) on delete cascade,
  kind                  text not null default 'daily' check (kind in ('daily','review','focus','surprise')),
  planned_minutes       smallint not null,
  plan                  jsonb not null,
  started_at            timestamptz not null default now(),
  completed_at          timestamptz,
  duration_seconds      integer not null default 0,
  exercises_count       integer not null default 0,
  correct_count         integer not null default 0
);
create index learning_sessions_ul_idx on public.learning_sessions (user_language_id, started_at desc);

-- ── Modelo de conocimiento (memoria FSRS por ítem) ───────────────────────
create table public.user_knowledge (
  user_language_id      uuid not null references public.user_languages (id) on delete cascade,
  item_id               text not null,            -- "en:w:although", "en:g:articles"
  item_type             text not null check (item_type in ('vocab','grammar')),
  status                text not null default 'learning' check (status in ('learning','known','difficult','saved')),
  stability             real not null default 0,
  difficulty            real not null default 0,
  reps                  integer not null default 0,
  lapses                integer not null default 0,
  state                 text not null default 'new' check (state in ('new','learning','review','relearning')),
  due_at                timestamptz not null default now(),
  last_review_at        timestamptz,
  exposure_count        integer not null default 0,
  correct_count         integer not null default 0,
  incorrect_count       integer not null default 0,
  avg_response_ms       integer,
  created_at            timestamptz not null default now(),
  primary key (user_language_id, item_id)
);
create index user_knowledge_due_idx on public.user_knowledge (user_language_id, due_at) where reps > 0;

-- ── Intentos de ejercicios ───────────────────────────────────────────────
create table public.exercise_attempts (
  id                    bigint generated always as identity primary key,
  user_language_id      uuid not null references public.user_languages (id) on delete cascade,
  session_id            uuid references public.learning_sessions (id) on delete set null,
  exercise_key          text not null check (char_length(exercise_key) <= 400),
  exercise_type         text not null,
  skill                 text not null,
  error_category        text,
  correct               boolean not null,
  near_miss             boolean not null default false,
  response              text check (char_length(response) <= 1000),
  time_ms               integer not null check (time_ms >= 0),
  attempts              smallint not null default 1,
  confidence            real check (confidence between 0 and 1),
  difficulty            real,
  created_at            timestamptz not null default now()
);
create index exercise_attempts_ul_idx on public.exercise_attempts (user_language_id, created_at desc);
create index exercise_attempts_cat_idx on public.exercise_attempts (user_language_id, error_category, created_at desc);

-- ── Error intelligence ───────────────────────────────────────────────────
create table public.mistakes (
  id                    bigint generated always as identity primary key,
  user_language_id      uuid not null references public.user_languages (id) on delete cascade,
  session_id            uuid references public.learning_sessions (id) on delete set null,
  attempt_id            bigint references public.exercise_attempts (id) on delete set null,
  source                text not null check (source in ('exercise','tutor','writing','assessment')),
  category              text not null,
  subcategory           text,
  user_text             text check (char_length(user_text) <= 1000),
  corrected_text        text check (char_length(corrected_text) <= 1000),
  explanation           text check (char_length(explanation) <= 1000),
  created_at            timestamptz not null default now()
);
create index mistakes_ul_cat_idx on public.mistakes (user_language_id, category, created_at desc);
create index mistakes_ul_created_idx on public.mistakes (user_language_id, created_at desc);

-- ── Tutor ────────────────────────────────────────────────────────────────
create table public.conversations (
  id                    uuid primary key default gen_random_uuid(),
  user_language_id      uuid not null references public.user_languages (id) on delete cascade,
  topic                 text check (char_length(topic) <= 200),
  feedback              jsonb,
  created_at            timestamptz not null default now(),
  ended_at              timestamptz
);
create index conversations_ul_idx on public.conversations (user_language_id, created_at desc);

create table public.conversation_messages (
  id                    bigint generated always as identity primary key,
  conversation_id       uuid not null references public.conversations (id) on delete cascade,
  role                  text not null check (role in ('user','assistant')),
  content               text not null check (char_length(content) <= 4000),
  created_at            timestamptz not null default now()
);
create index conversation_messages_conv_idx on public.conversation_messages (conversation_id, id);

-- ── Actividad diaria (heatmap, racha) — agregado mantenido por la app ────
create table public.daily_activity (
  user_id               uuid not null references auth.users (id) on delete cascade,
  language_code         text not null,
  day                   date not null,
  seconds               integer not null default 0,
  exercises             integer not null default 0,
  correct               integer not null default 0,
  words_reviewed        integer not null default 0,
  sessions              integer not null default 0,
  primary key (user_id, language_code, day)
);

-- ── Logros ───────────────────────────────────────────────────────────────
create table public.user_achievements (
  user_id               uuid not null references auth.users (id) on delete cascade,
  achievement_id        text not null,
  unlocked_at           timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ── Eventos educativos (analítica propia, mínima) ────────────────────────
create table public.analytics_events (
  id                    bigint generated always as identity primary key,
  user_id               uuid not null references auth.users (id) on delete cascade,
  name                  text not null check (char_length(name) <= 60),
  props                 jsonb not null default '{}',
  created_at            timestamptz not null default now()
);
create index analytics_events_user_idx on public.analytics_events (user_id, created_at desc);

-- ── Infraestructura: caché de IA, cuotas y rate limiting ─────────────────
create table public.ai_cache (
  key                   text primary key,         -- sha256 del prompt normalizado
  value                 jsonb not null,
  created_at            timestamptz not null default now(),
  expires_at            timestamptz not null
);
create index ai_cache_expires_idx on public.ai_cache (expires_at);

create table public.rate_limits (
  key                   text not null,            -- "ai:<user>", "answer:<user>"
  window_start          timestamptz not null,
  count                 integer not null default 0,
  primary key (key, window_start)
);

-- ── Seguridad: RLS activado, sin políticas ⇒ la API pública no ve nada ───
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_languages','skill_estimates','learning_goals','assessments',
    'learning_sessions','user_knowledge','exercise_attempts','mistakes','conversations',
    'conversation_messages','daily_activity','user_achievements','analytics_events',
    'ai_cache','rate_limits'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on public.%I from anon', t);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on public.%I from authenticated', t);
    end if;
  end loop;
end $$;

-- Mantenimiento: limpiar caché y ventanas de rate limit antiguas.
create or replace function public.prune_ephemeral() returns void
language sql as $$
  delete from public.ai_cache where expires_at < now();
  delete from public.rate_limits where window_start < now() - interval '2 days';
$$;
revoke all on function public.prune_ephemeral() from public;
