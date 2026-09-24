# Seguridad y privacidad

## Autenticación y autorización

- **Supabase Auth** (email/contraseña con confirmación, Google OAuth con PKCE). Las contraseñas nunca pasan por nuestra base de datos.
- **Doble barrera:**
  1. `src/proxy.ts` refresca la sesión y bloquea `/app/*` sin usuario.
  2. Cada Server Component y cada Server Action vuelve a validar el usuario con `supabase.auth.getUser()`, que verifica el JWT contra Supabase, mediante `requireViewer()` y `requireLearner()`.
- **Autorización por fila en la app:** toda consulta filtra por el `userId` o `user_language_id` del usuario autenticado. Los IDs que llegan del cliente (sesión, conversación, diagnóstico) se comprueban contra ese usuario.
- **Anti open-redirect:** `next` sólo acepta rutas internas (`/…`, nunca `//…`).

## Validación de entradas

- Las Server Actions (`src/app/app/actions.ts`) sanean cada campo: longitudes máximas, enteros acotados, enumeraciones cerradas, zona horaria válida y temas de una lista blanca.
- **La evaluación ocurre en el servidor:** el cliente envía la `key` del ejercicio y el servidor obtiene la respuesta correcta del catálogo. Un cliente manipulado no puede marcar una respuesta como correcta ni tocar ítems de otro idioma.
- El diagnóstico sólo acepta respuesta al ítem que el servidor entregó.
- SQL siempre parametrizado (plantillas de `postgres.js`); no hay concatenación.
- React escapa todo el texto; no se usa `dangerouslySetInnerHTML` salvo en el script estático del tema.

## Rate limiting (Postgres, sin servicios externos)

| Clave | Límite |
|---|---|
| `answer:<user>` | 90 / min |
| `ai-min:<user>` | 10 / min |
| `ai-day:<user>` | `AI_DAILY_LIMIT_PER_USER` / día |
| `export:<user>` | 5 / hora |

## Secretos

- Sólo son públicas `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (bloqueada por RLS) y `NEXT_PUBLIC_SITE_URL`.
- `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y las claves de IA sólo existen en el servidor. `src/lib/env.ts` importa `server-only`, así que el build falla si un componente cliente intenta usarlas.
- `.env*` está en `.gitignore` y `.env.example` documenta cada variable.

## Base de datos

RLS activado sin políticas y permisos revocados a `anon` y `authenticated`: la API REST pública de Supabase no expone datos. Hay CHECK constraints en longitudes y enumeraciones.

## Cabeceras HTTP (`next.config.ts`)

`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (micrófono sólo en el propio sitio) y HSTS. Además, `poweredByHeader: false`.

## Logging

Los errores se registran en el servidor con un prefijo (`[action:…]`, `[account]`) sin datos personales ni secretos. El usuario ve mensajes útiles ("Algo salió mal… tu progreso está a salvo"), nunca trazas.

## Privacidad (México / RGPD)

- Consentimiento explícito del aviso de privacidad (`consent_at`) y consentimiento **separado** para la IA (`ai_consent`).
- Minimización de datos: ver DATABASE.md → "Datos que NO guardamos".
- **Acceso y portabilidad:** `/api/export` devuelve todos los datos en JSON.
- **Cancelación:** en *Configuración → Eliminar cuenta* se borran los datos de la app y la identidad (Admin API o SQL).
- El aviso de privacidad (`/privacy`) es un **borrador** que debe revisar una persona profesional del derecho. Este proyecto no afirma cumplimiento legal automático.

## Pendiente antes de abrir al público

- Protección contra bots en el registro (CAPTCHA de Supabase Auth, con Turnstile gratuito).
- SMTP propio para los correos de autenticación.
- Una Content-Security-Policy estricta con nonces.
- Revisión jurídica del aviso de privacidad.
