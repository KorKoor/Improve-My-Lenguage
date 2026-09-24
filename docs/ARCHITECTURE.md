# Arquitectura

## Principios

1. **El motor es puro.** Todo lo que decide qué, cuándo y cuánto se enseña vive en `src/lib/engine/` como funciones deterministas, sin I/O y con tests. Es barato (no llama a la IA), reproducible (usa semillas) y explicable.
2. **La IA va sólo donde aporta** (conversación y análisis de texto libre), siempre con salidas acotadas y validadas. La app funciona completa sin ella.
3. **El contenido es código.** Vocabulario, gramática y bancos de diagnóstico están en `src/lib/content/` como datos tipados y versionados en git, y se referencian por ID estable (`en:w:although`, `en:g:articles`). La base de datos guarda **sólo el estado del usuario**.
4. **La autorización se aplica en el servidor.** Server Actions y repositorios filtran siempre por el `userId` validado contra Supabase. RLS bloquea la API pública.
5. **Portabilidad.** Usamos SQL estándar con `postgres.js` en lugar de un SDK propietario. Cambiar Supabase por Neon, RDS o un Postgres propio es cambiar `DATABASE_URL` (y el proveedor de auth, que está aislado en `lib/supabase/`).

## Capas

```
UI (Server Components + Client Components)
  │  lee con services/*, escribe SOLO vía app/app/actions.ts (Server Actions)
  ▼
services/        orquestación: auth → carga estado → motor → persiste
  ├─ viewer.ts        usuario y alumno actual (requireLearner)
  ├─ learning.ts      sesiones, evaluación de respuestas y actualización del modelo
  ├─ assessment.ts    diagnóstico adaptativo
  ├─ insights.ts      dashboard y progreso
  ├─ tutor.ts         conversación y feedback con IA
  └─ account.ts       exportación y borrado
  ▼
engine/ (puro)   fsrs · assessment (IRT) · levels · planner · session-builder ·
                 exercises · evaluate · weakness · recommender · progress · achievements
content/ (datos) languages · topics · error-categories · en/ fr/ ja/
db/              client (postgres.js) · repositories (todo el SQL) · limits (rate limit + caché IA)
ai/              provider (Gemini / OpenAI-compatible) · prompts (perfil estructurado + validación)
```

## Flujo de una respuesta

1. El cliente envía `{ key, response, timeMs }`. La `key` identifica el ejercicio de forma determinista (`cloze|en:w:although|0`).
2. `submitAnswer` **resuelve la key en el servidor contra el catálogo** y obtiene las respuestas aceptadas. El cliente nunca las recibe antes de responder y nunca decide si acertó.
3. `evaluate` normaliza la respuesta (mayúsculas, puntuación, contracciones) y tolera erratas y acentos (que cuentan como *casi*). En gramática no se toleran erratas.
4. `ratingFromOutcome` convierte acierto, velocidad, intentos y errata en una calificación FSRS de 1 a 4.
5. Se actualizan: la memoria FSRS de cada ítem, el θ de la habilidad, el intento, el error clasificado (si lo hubo), los contadores de la sesión y la actividad diaria.

## Rutas

| Ruta | Tipo | Notas |
|---|---|---|
| `/`, `/features`, `/languages[/code]`, `/about`, `/privacy` | Públicas y estáticas | SEO, sitemap, Open Graph |
| `/login`, `/reset-password`, `/auth/callback`, `/auth/signout` | Auth | PKCE; protección contra open redirect |
| `/app/onboarding` | Privada | 7 pasos (4 al añadir un idioma) |
| `/app` y resto de `(main)` | Privadas con shell | Sidebar en escritorio, barra inferior en móvil |
| `/app/session`, `/app/review`, `/app/assessment` | Privadas en modo enfoque | Sin navegación |
| `/api/export`, `/api/health` | API | Exportación JSON y health check |

`src/proxy.ts` (antes "middleware" en Next < 16) refresca la sesión y redirige `/app/*` a `/login` si no hay usuario. La segunda barrera es `requireViewer()`/`requireLearner()` en el servidor.

## Decisiones y alternativas descartadas

- **Sin ORM:** Drizzle/Prisma obligarían a mantener dos fuentes de verdad (esquema TS y migraciones). El SQL de `repositories.ts` está validado contra Postgres (cada consulta se prepara con `PREPARE`).
- **Contenido en el repo y no en la BD:** el plan Free de Supabase tiene 500 MB. Además, el contenido versionado se revisa en PRs, se cachea en el bundle y no cuesta consultas. La migración a BD/CMS sólo cambia `content/index.ts`.
- **Sin Redis:** el rate limiting y la caché de IA usan tablas de Postgres. Es suficiente para esta escala y cuesta $0.
- **Voz en el navegador:** la síntesis y el reconocimiento son gratis y no envían audio a servidores propios. Donde no están disponibles, los dictados se saltan sin penalización.
