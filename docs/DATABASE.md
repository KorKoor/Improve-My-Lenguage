# Base de datos

**Cloud Firestore** (modo nativo), accedido **sólo desde el servidor** con Firebase Admin SDK. Todo el acceso a datos está en `src/lib/db/repositories.ts`; la configuración vive en `firestore.rules` y `firestore.indexes.json` (se despliegan con `firebase deploy --only firestore`).

## Principio: sólo estado del usuario

Idiomas, vocabulario, gramática, ejercicios y logros **no se guardan en la base de datos**: forman un catálogo versionado en `src/lib/content/` (ver ARCHITECTURE.md). Los documentos guardan referencias por ID estable (`itemId`, p. ej. `en:w:although`). Así se cubren las entidades `languages`, `vocabulary`, `grammar_concepts`, `exercises`, `knowledge_items` y `achievements` de la especificación sin duplicar contenido ni pagar lecturas.

## Modelo

Todo lo del usuario cuelga de `users/{uid}`. La propiedad está codificada en la ruta: una consulta con el `uid` de la sesión **no puede** alcanzar documentos de otro usuario, y exportar o borrar una cuenta es recorrer un árbol.

```
users/{uid}                                perfil y preferencias (idioma nativo/activo, zona horaria,
│                                          tema, minutos, intereses, consentimientos)
├─ languages/{code}                        un idioma estudiado:
│  │                                       · skills.{skill} = { theta, se, evidence }   (vector de habilidades)
│  │                                       · goal = { targetLevel, deadline, minutesPerDay }  (objetivo activo)
│  │                                       · openAssessmentId (diagnóstico en curso)
│  ├─ knowledge/{itemId}                   memoria FSRS por ítem + estado (guardada, sabida, difícil)
│  ├─ attempts/{auto}                      cada respuesta: tipo, habilidad, categoría, tiempo, dificultad
│  ├─ mistakes/{auto}                      errores clasificados (ejercicio, tutor, diagnóstico)
│  ├─ sessions/{auto}                      plan, duración y contadores de cada sesión
│  ├─ assessments/{auto}                   estado del diagnóstico adaptativo y resultado
│  └─ conversations/{auto}/messages/{auto} tutor
├─ activity/{YYYY-MM-DD}__{code}           agregado diario (heatmap, racha) con incrementos atómicos
├─ achievements/{id}                       logros desbloqueados (create idempotente)
└─ events/{auto}                           eventos educativos mínimos (analítica propia)

pushTokens/{sha256(token)}                 dispositivos para notificaciones (userId, userAgent)
rateLimits/{sha256(clave)}_{ventana}       contadores de rate limit (caducan)
aiCache/{sha256(prompt)}                   caché de respuestas de IA (caduca)
```

Un `userLanguageId` en el código es `${uid}:${code}` y `repositories.ts` lo traduce a `users/{uid}/languages/{code}`.

### Decisiones

- **Embebido vs. subcolección:** el vector de habilidades, el objetivo activo y el diagnóstico abierto se leen juntos en casi cada página, así que van en el documento del idioma (una lectura). Lo que crece sin límite (intentos, errores, memoria, mensajes) va en subcolecciones.
- **Blobs JSON:** el plan de una sesión, el estado del diagnóstico, el feedback del tutor y las props de eventos se guardan como texto JSON (`planJson`, `stateJson`…) porque Firestore no admite arrays anidados y nunca se consultan por dentro.
- **Agregados:** los conteos usan `count()`/`sum()` de Firestore (se cobran como 1 lectura por cada 1 000 documentos). Las estadísticas por ventana (precisión semanal, por habilidad, por categoría) leen sólo los campos necesarios (`select`) de los intentos de las últimas 4-12 semanas.
- **Índices compuestos** (`firestore.indexes.json`): `knowledge(reviewable, dueAt)` para la cola de repaso y `sessions(active, startedAt desc)` para las sesiones recientes. El resto de consultas usa los índices automáticos de un solo campo.
- **Caducidad:** `rateLimits` y `aiCache` llevan `expiresAt`; el cron diario (`/api/cron/reminders`) borra los caducados. El TTL nativo de Firestore exigiría activar la facturación (plan Blaze); si la activas, basta con añadir las políticas TTL en `firestore.indexes.json`.

## Seguridad

- `firestore.rules` **deniega todo** acceso desde clientes. El navegador nunca habla con Firestore: sólo el servidor, con Admin SDK (que no está sujeto a las reglas).
- Los IDs que llegan del cliente (sesión, conversación, diagnóstico) se validan con una expresión regular y se buscan **dentro** del árbol del usuario autenticado.
- Longitudes acotadas al escribir (respuestas ≤ 500, mensajes ≤ 4 000, textos de errores ≤ 1 000/2 000).

## Datos que NO guardamos

Contraseñas (las gestiona Firebase Auth), audio, datos de pago ni la IP. Las claves de rate limit se guardan hasheadas.

## Borrado y exportación

- `deleteUserData` usa `recursiveDelete(users/{uid})` y borra sus `pushTokens`; después se elimina la identidad en Firebase Auth.
- `exportUserData` recorre el árbol completo y devuelve JSON plano (fechas ISO, blobs deserializados).

## Desarrollo local sin tocar producción

`npm run dev:emulated` arranca los emuladores de Auth y Firestore (proyecto ficticio `demo-iml`, requiere Java 11+) y `next dev` conectado a ellos. Las reglas de `firestore.rules` también se aplican en el emulador.

Al arrancar siembra un usuario de demostración con ~20 semanas de historial realista (repasos FSRS simulados, errores clasificados, actividad, objetivo y logros): **demo@improve.local / demo-password**. El script (`scripts/seed-demo.ts`) se niega a correr fuera de los emuladores.
