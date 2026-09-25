# Seguridad y privacidad

## Autenticación y autorización

- **Firebase Auth** (correo/contraseña y Google). Las contraseñas nunca pasan por nuestro servidor ni nuestra base de datos.
- **Sesión en cookie httpOnly:** el navegador inicia sesión con el SDK de Firebase (persistencia *en memoria*: nada en `localStorage`), obtiene un ID token y lo canjea en `POST /api/auth/session` por una *session cookie* de Firebase (`__session`, `httpOnly`, `secure`, `SameSite=Lax`, 14 días). El servidor exige que el ID token sea de un inicio de sesión de hace menos de 5 minutos.
- **Doble barrera:**
  1. `src/proxy.ts` bloquea `/app/*` si no hay cookie (barato, sin red).
  2. Cada Server Component, Server Action y Route Handler valida la cookie con `verifySessionCookie(…, checkRevoked = true)` mediante `requireViewer()` / `requireLearner()` / `getViewer()`.
- **Cerrar sesión** revoca los refresh tokens del usuario (cierra la sesión en todos los dispositivos) y borra la cookie.
- **Autorización estructural:** los datos viven bajo `users/{uid}` y el `uid` sale siempre de la cookie verificada; los IDs del cliente se buscan dentro de ese árbol.
- **Anti open-redirect:** `next` sólo acepta rutas internas (`/…`, nunca `//…`).
- **CSRF:** las Server Actions comprueban el origen (Next.js); los Route Handlers que mutan (`/api/auth/session`, `/api/notifications/*`, `/auth/signout`) exigen `Origin` del propio sitio (`src/lib/http.ts`). La cookie es `SameSite=Lax`.

## Validación de entradas

- Las Server Actions (`src/app/app/actions.ts`) sanean cada campo: longitudes máximas, enteros acotados, enumeraciones cerradas, zona horaria válida y temas de una lista blanca.
- **La evaluación ocurre en el servidor:** el cliente envía la `key` del ejercicio y el servidor obtiene la respuesta correcta del catálogo. Un cliente manipulado no puede marcar una respuesta como correcta ni tocar ítems de otro idioma.
- El diagnóstico sólo acepta respuesta al ítem que el servidor entregó.
- React escapa todo el texto; no se usa `dangerouslySetInnerHTML` salvo en el script estático del tema.

## Rate limiting (Firestore, sin servicios externos)

| Clave | Límite |
|---|---|
| `answer:<user>` | 90 / min |
| `ai-min:<user>` | 10 / min |
| `ai-day:<user>` | `AI_DAILY_LIMIT_PER_USER` / día |
| `export:<user>` | 5 / hora |
| `login:<user>` | 30 / hora |
| `push-register:<user>` · `push-test:<user>` | 20 / hora · 5 / hora |

Firebase Auth aplica además su propia protección contra fuerza bruta (`auth/too-many-requests`).

## Notificaciones push

- Los tokens de dispositivo sólo se registran con sesión válida y se guardan asociados al usuario.
- No existe ningún endpoint que envíe a un token arbitrario: la prueba sólo envía a los dispositivos del propio usuario y los recordatorios (`/api/cron/reminders`) exigen `Authorization: Bearer $CRON_SECRET`.
- Los tokens caducados se eliminan automáticamente tras cada envío.

## Secretos

- Públicas por diseño: `NEXT_PUBLIC_FIREBASE_*` (identifican el proyecto; la seguridad la dan las reglas de Firestore y el servidor) y `NEXT_PUBLIC_SITE_URL`.
- `FIREBASE_SERVICE_ACCOUNT`, `CRON_SECRET` y las claves de IA sólo existen en el servidor. `src/lib/env.ts` y `src/lib/firebase/admin.ts` importan `server-only`, así que el build falla si un componente cliente intenta usarlos.
- `.env*` y los JSON de cuentas de servicio están en `.gitignore`; `.env.example` documenta cada variable.

### Rotar la clave de la cuenta de servicio (hazlo si alguna vez se ha compartido)

La clave privada del JSON da acceso total a Firestore y Auth. Si se pegó en un chat, un correo o un issue, **rótala**:

1. Google Cloud Console → proyecto `improve-my-lenguages` → *IAM y administración → Cuentas de servicio* → `firebase-adminsdk-…`.
2. Pestaña *Claves* → *Agregar clave → Crear clave nueva → JSON*. Se descarga el archivo nuevo.
3. Vercel → *Settings → Environment Variables* → edita `FIREBASE_SERVICE_ACCOUNT` (Production y Preview) y pega el JSON **en una sola línea**:
   `node -e "process.stdout.write(JSON.stringify(require('./ruta/al/nuevo.json')))"`
4. *Deployments → Redeploy* del último despliegue y comprueba `https://<tu-dominio>/api/health` → `"database":"ok"`.
5. En local, sustituye el JSON antiguo por el nuevo (sigue ignorado por git) y actualiza `.env.local` si lo usa.
6. **Sólo entonces** vuelve a *Claves* y **elimina la clave antigua** (su ID es el `private_key_id` del JSON viejo). Desde ese momento deja de funcionar.
7. Revisa *Registros → Explorador de registros* (filtro `protoPayload.authenticationInfo.principalEmail="firebase-adminsdk-…"`) por si hubo accesos que no reconoces.

Comprobado: el historial de git **nunca** contuvo la clave (sólo `.env.example` con valores de ejemplo).

## Base de datos

`firestore.rules` deniega cualquier lectura/escritura desde clientes. Sólo el servidor accede (Admin SDK). Ver DATABASE.md.

`npm run smoke` lo verifica contra el emulador con la API REST: leer o escribir el propio perfil (con y sin token), otra colección o crear documentos debe dar **403**; como control, el token de administrador del emulador sí puede leer (si no, la prueba no sería fiable).

## Cabeceras HTTP (`next.config.ts`)

`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (micrófono sólo en el propio sitio) y HSTS. Además, `poweredByHeader: false`.

## Logging y monitorización

`src/lib/log.ts` (`logError(ámbito, error)`) escribe una línea JSON en los logs de Vercel y cuenta los errores por día y ámbito en `ops/errors-AAAA-MM-DD`. Antes de registrar se eliminan correos y tokens largos y se recorta el mensaje (`log-scrub.ts`); nunca se guarda la entrada del usuario. El usuario ve mensajes útiles ("Algo salió mal… tu progreso está a salvo"), nunca trazas.

`/api/health` es público (estado de Firestore y del contenido; 503 si algo falla, apto para un monitor de disponibilidad externo). Con `Authorization: Bearer <CRON_SECRET>` añade versión desplegada, tiempo de la comprobación y errores de hoy/ayer por ámbito.

## Privacidad (México / RGPD)

- Consentimiento explícito del aviso de privacidad (`consentAt`) y consentimiento **separado** para la IA (`aiConsent`).
- Minimización de datos: ver DATABASE.md → "Datos que NO guardamos".
- **Acceso y portabilidad:** `/api/export` devuelve todos los datos en JSON.
- **Cancelación:** en *Configuración → Eliminar cuenta* se borran todos los datos (`recursiveDelete`) y la identidad en Firebase Auth.
- El aviso de privacidad (`/privacy`) es un **borrador** que debe revisar una persona profesional del derecho. Este proyecto no afirma cumplimiento legal automático.

## Pendiente antes de abrir al público

- Firebase App Check (reCAPTCHA Enterprise) para frenar bots en el registro.
- Una Content-Security-Policy estricta con nonces.
- Revisión jurídica del aviso de privacidad.
