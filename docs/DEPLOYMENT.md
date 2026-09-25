# Despliegue

GitHub → Vercel → dominio propio. Firebase (Auth + Firestore + Cloud Messaging) cubre identidad, datos y notificaciones; para uso personal cabe en el plan gratuito Spark.

## 1. Firebase

Proyecto: `improve-my-lenguages` (ya creado, con la app web registrada y Firestore en modo nativo).

1. **Authentication → Método de acceso:** activa **Correo electrónico/contraseña** y **Google**.
2. **Authentication → Configuración → Dominios autorizados:** añade `localhost`, tu dominio (`tu-dominio.com`) y, si usas previews, el dominio `*.vercel.app` concreto del proyecto.
3. **Reglas e índices de Firestore** (desde la raíz del repo, con Firebase CLI):
   ```bash
   firebase deploy --only firestore --project improve-my-lenguages
   ```
   Despliega `firestore.rules` (deniega todo acceso de clientes) y los índices compuestos. Los índices tardan unos minutos en construirse.
4. **Cuenta de servicio (sólo servidor):** *Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada*. Guarda el archivo **fuera del repositorio**, conviértelo a una sola línea y ponlo en `FIREBASE_SERVICE_ACCOUNT`. Da acceso total al proyecto: nunca lo subas al repo ni lo pongas en una variable `NEXT_PUBLIC_*`.
   ```bash
   node -e "process.stdout.write(JSON.stringify(require(process.argv[1])))" ./ruta/fuera-del-repo/clave.json
   ```
   En local también puedes usar `GOOGLE_APPLICATION_CREDENTIALS=<ruta al JSON>` en `.env.local`.
5. **Notificaciones (opcional):** *Cloud Messaging → Configuración web → Certificados push web* → copia la clave pública a `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
6. **Plantillas de correo (opcional):** *Authentication → Plantillas* para personalizar los correos de verificación y de restablecimiento de contraseña.

## 2. Vercel

1. Importa el repositorio de GitHub (framework: Next.js; sin cambios en build/output).
2. En **Settings → Environment Variables**, crea estas variables en **Production** y **Preview**. Usa exactamente estos nombres:

   ```env
   NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
   NEXT_PUBLIC_FIREBASE_API_KEY=valor-de-firebase-console
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=improve-my-lenguages.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=improve-my-lenguages
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=improve-my-lenguages.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=valor-de-firebase-console
   NEXT_PUBLIC_FIREBASE_APP_ID=valor-de-firebase-console
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=valor-de-firebase-console
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"improve-my-lenguages","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxxxx@improve-my-lenguages.iam.gserviceaccount.com"}
   CRON_SECRET=secreto-largo-generado-por-ti
   AI_PROVIDER=gemini
   GEMINI_API_KEY=tu-clave-de-google-ai-studio
   AI_DAILY_LIMIT_PER_USER=60
   ```

   `FIREBASE_SERVICE_ACCOUNT`, `CRON_SECRET` y `GEMINI_API_KEY` son secretos: activa la opción **Sensitive** cuando Vercel la muestre y nunca los prefijes con `NEXT_PUBLIC_`. El JSON de `FIREBASE_SERVICE_ACCOUNT` debe ser el archivo completo de la cuenta de servicio, convertido a una sola línea; el ejemplo anterior sólo muestra el formato.

   Los valores `NEXT_PUBLIC_FIREBASE_*` salen de **Firebase Console → Configuración del proyecto → General → Tus apps → app web → Configuración del SDK**. La `NEXT_PUBLIC_FIREBASE_VAPID_KEY` sale de **Cloud Messaging → Configuración web → Certificados push web**. Genera `CRON_SECRET` con un valor aleatorio largo.

   Variables opcionales para proveedores compatibles con OpenAI:

   ```env
   OPENAI_COMPAT_BASE_URL=https://api.openai.com/v1
   OPENAI_COMPAT_API_KEY=tu-clave
   AI_MODEL_FAST=
   AI_MODEL_SMART=
   ```

3. Guarda las variables, activa **Redeploy** con **Use existing Build Cache** desactivado y despliega. `vercel.json` programa dos crons diarios (permitidos en Hobby): `/api/health` y `/api/cron/reminders` (01:00 UTC ≈ 19:00 en Ciudad de México).

## 3. Dominio propio

1. Vercel → *Settings → Domains* → añade `tu-dominio.com` y sigue las instrucciones DNS (registro A o CNAME).
2. Añade el dominio a los **dominios autorizados** de Firebase Auth.
3. Actualiza `NEXT_PUBLIC_SITE_URL` y vuelve a desplegar.

## Comprobaciones tras el despliegue

- `GET /api/health` → `{"status":"ok","database":"ok"}`.
- Registro con correo → onboarding → diagnóstico → sesión.
- *Configuración → Descargar mis datos* devuelve JSON.

## Problemas comunes

| Síntoma | Causa |
|---|---|
| `/app` redirige a `/setup` | Faltan `NEXT_PUBLIC_FIREBASE_*` o `FIREBASE_SERVICE_ACCOUNT` (o el JSON no es válido: revisa los logs de Vercel) |
| "Este dominio no está autorizado en Firebase Auth" | Añade el dominio en *Authentication → Configuración → Dominios autorizados* |
| "Este método de inicio de sesión no está activado" | Activa el proveedor en *Authentication → Método de acceso* |
| Error `FAILED_PRECONDITION … requires an index` en los logs | No se desplegaron los índices: `firebase deploy --only firestore` |
| Las notificaciones no llegan | Falta `NEXT_PUBLIC_FIREBASE_VAPID_KEY` o `CRON_SECRET`, o el navegador bloqueó el permiso |
