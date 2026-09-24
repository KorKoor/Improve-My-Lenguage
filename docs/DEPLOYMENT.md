# Despliegue: GitHub → Vercel → dominio propio (costo $0)

Tiempo estimado: unos 30 minutos la primera vez.

## 1. Base de datos y autenticación (Supabase Free)

1. Crea un proyecto en [supabase.com](https://supabase.com). Elige la región más cercana a tus usuarios y guarda la contraseña de la base de datos.
2. **SQL Editor → New query:** pega el contenido de `supabase/migrations/0001_init.sql` y ejecútalo.
3. **Project Settings → API:** copia `Project URL` y la clave `anon` / `publishable`.
4. **Connect → Connection string → Transaction pooler** (puerto **6543**): cópiala y sustituye `[YOUR-PASSWORD]`. Esa será `DATABASE_URL`.
5. **Authentication → URL Configuration:**
   - *Site URL:* `https://tu-dominio.com`
   - *Redirect URLs:* `https://tu-dominio.com/auth/callback`, `http://localhost:3000/auth/callback` y `https://*.vercel.app/auth/callback` (para las previews)
6. **Login con Google (opcional, gratis):**
   1. En [Google Cloud Console](https://console.cloud.google.com), ve a *APIs & Services → Credentials → Create OAuth client ID (Web)*.
   2. Añade como *Authorized redirect URI* `https://<tu-proyecto>.supabase.co/auth/v1/callback`.
   3. En Supabase, ve a *Authentication → Providers → Google* y pega el Client ID y el Secret.
7. **Correo:** el SMTP integrado de Supabase tiene un límite bajo de envíos por hora. Para uso personal es suficiente. Si abres el registro al público, configura un SMTP propio (hay proveedores con capa gratuita) en *Authentication → Emails → SMTP*.

> **Pausa por inactividad:** Supabase Free pausa el proyecto tras 7 días sin actividad. `vercel.json` incluye un *cron* diario (permitido en Vercel Hobby) que llama a `/api/health` y ejecuta un `select 1`, lo que la mantiene activa.

## 2. IA gratuita (opcional)

- **Gemini:** en [Google AI Studio](https://aistudio.google.com), crea una clave con *Get API key* y guárdala en `GEMINI_API_KEY`. Consulta las cuotas vigentes en AI Studio: la capa gratuita cambia con el tiempo, y Google puede usar los datos de esa capa para mejorar sus productos (por eso la app pide consentimiento).
- **Alternativa:** usa `AI_PROVIDER=openai-compatible` con `OPENAI_COMPAT_BASE_URL` y `OPENAI_COMPAT_API_KEY` (por ejemplo, Groq u OpenRouter con modelos gratuitos).
- Ajusta los modelos con `AI_MODEL_FAST` y `AI_MODEL_SMART` si los que vienen por defecto dejan de estar disponibles.
- `AI_DAILY_LIMIT_PER_USER` (por defecto 60) protege tu cuota.

## 3. Código en GitHub

```bash
git init && git add . && git commit -m "Improve My Languages — MVP"
git branch -M main
git remote add origin https://github.com/<usuario>/improve-my-languages.git
git push -u origin main
```

`.env.local` está en `.gitignore`: **nunca** subas secretos.

## 4. Vercel (plan Hobby)

1. En [vercel.com](https://vercel.com), ve a *Add New → Project* e importa el repositorio. El framework se detecta solo (Next.js).
2. **Environment Variables:** añade todas las de `.env.example` que uses (Production y Preview). Recuerda:
   - `NEXT_PUBLIC_SITE_URL=https://tu-dominio.com`
   - `DATABASE_URL`, `GEMINI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` son **sólo servidor**: no les pongas el prefijo `NEXT_PUBLIC_`.
3. Pulsa *Deploy*.

> El plan Hobby es gratuito para **uso personal y no comercial**. Si en el futuro cobras por el servicio, tendrás que pasar a Pro.

## 5. Dominio personalizado

1. En Vercel, ve a *Project → Settings → Domains → Add* y escribe tu dominio.
2. En tu registrador, crea los registros DNS que Vercel te indique (normalmente un `A` para el dominio raíz y un `CNAME` para `www`). El certificado HTTPS se emite solo.
3. Actualiza `NEXT_PUBLIC_SITE_URL` y la *Site URL* y *Redirect URLs* de Supabase con el dominio definitivo, y vuelve a desplegar.

## 6. Verificación

- `https://tu-dominio.com/api/health` debe responder `{"status":"ok","database":"ok",...}`.
- Crea una cuenta, completa el onboarding y el diagnóstico, y haz una sesión.
- En *Configuración*, prueba **Descargar mis datos**.

## Solución de problemas

| Síntoma | Causa probable |
|---|---|
| `/app` redirige a `/setup` | Faltan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `DATABASE_URL` |
| Error "prepared statement … does not exist" | Estás usando el puerto 5432 del pooler en modo sesión: usa el **6543** (el código ya desactiva `prepare`) |
| Google vuelve a `/login?error=callback` | La URL de callback no está en *Redirect URLs* de Supabase |
| El tutor dice "no está configurado" | Falta `GEMINI_API_KEY` o el `AI_PROVIDER` no es correcto |
| Primera carga lenta tras días sin uso | El proyecto de Supabase estaba pausado: reactívalo en el panel |
