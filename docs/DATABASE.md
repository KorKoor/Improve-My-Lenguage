# Base de datos

PostgreSQL 15+. El esquema está en `supabase/migrations/0001_init.sql` y todo el SQL de la app en `src/lib/db/repositories.ts`. Las consultas están validadas con `PREPARE` contra Postgres 16.

## Principio: sólo estado del usuario

Idiomas, vocabulario, gramática, ejercicios y logros **no son tablas**: forman un catálogo versionado en `src/lib/content/` (ver ARCHITECTURE.md). Las tablas guardan referencias por ID estable (`item_id text`, p. ej. `en:w:although`). Esto cubre las entidades `languages`, `vocabulary`, `grammar_concepts`, `exercises`, `knowledge_items` y `achievements` de la especificación sin duplicar contenido ni gastar almacenamiento.

## Tablas

| Tabla | Propósito | Claves e índices |
|---|---|---|
| `profiles` | Perfil y preferencias globales: idioma nativo, activo, zona horaria, tema, minutos, intereses, consentimientos | PK = `auth.users.id` |
| `user_languages` | Un registro por idioma estudiado | UNIQUE(user_id, language_code) |
| `skill_estimates` | Vector de habilidades: θ, SE y evidencia | PK(user_language_id, skill) |
| `learning_goals` | Objetivo activo (nivel, fecha, min/día) | índice único parcial: 1 activo por idioma |
| `assessments` | Estado del diagnóstico CAT (jsonb) y resultado | (user_language_id, started_at) |
| `learning_sessions` | Plan, duración y contadores de cada sesión | (user_language_id, started_at) |
| `user_knowledge` | Memoria FSRS por ítem + estado (guardada, sabida, difícil) | PK(user_language_id, item_id); índice parcial por `due_at` |
| `exercise_attempts` | Cada respuesta: tipo, habilidad, categoría, tiempo y dificultad | (ul, created_at), (ul, error_category, created_at) |
| `mistakes` | Errores clasificados (ejercicio, tutor, diagnóstico) | (ul, category, created_at) |
| `conversations` / `conversation_messages` | Tutor | (ul, created_at) / (conversation_id, id) |
| `daily_activity` | Agregado diario para el heatmap y la racha | PK(user, language, day) |
| `user_achievements` | Logros desbloqueados | PK(user, achievement_id) |
| `analytics_events` | Eventos educativos mínimos | (user, created_at) |
| `ai_cache`, `rate_limits` | Infraestructura | limpieza con `prune_ephemeral()` |

Todas las tablas cuelgan de `auth.users` con `ON DELETE CASCADE`, así que borrar la cuenta borra todo. Además, el servicio de cuenta borra explícitamente los datos antes de eliminar la identidad.

## Seguridad

- RLS **activado y sin políticas** en todas las tablas; además se revocan los permisos de `anon` y `authenticated`. La API REST pública de Supabase no ve nada.
- La app accede con la conexión directa del servidor y **filtra siempre por el usuario** en cada consulta (los `user_language_id` provienen de `requireLearner()`).
- Hay CHECK constraints en longitudes y enumeraciones para limitar datos basura.

## Datos que NO guardamos

No guardamos contraseñas (las gestiona Supabase Auth), audio, datos de pago ni la IP en las tablas de la app. Las respuestas se limitan a 1 000 caracteres.

## Mantenimiento

Ejecuta `select public.prune_ephemeral();` de vez en cuando (o prográmalo con `pg_cron` en Supabase) para limpiar la caché de IA y las ventanas de rate limit.
