# IA: uso, costos y control de calidad

## Dónde se usa (y dónde no)

| Tarea | Motor | Por qué |
|---|---|---|
| Decidir qué estudiar, planificar sesiones, programar repasos | Determinista (`engine/`) | Gratis, instantáneo, testeable, explicable |
| Evaluar respuestas de ejercicios | Determinista (`evaluate.ts`) | Las respuestas correctas salen del catálogo revisado |
| Definiciones, IPA, conjugaciones, reglas | Catálogo curado | **La IA no inventa contenido lingüístico** |
| Conversación con el tutor | IA, modelo *smart* | Requiere lenguaje natural |
| Feedback de la conversación | IA, modelo *smart*, JSON | Clasificación en taxonomía cerrada y validada |

## Proveedores (`src/lib/ai/provider.ts`)

- `AI_PROVIDER=gemini` (por defecto): API REST de Gemini, sin SDK. Clave en `GEMINI_API_KEY` (también `gemini_api_key`, `GOOGLE_API_KEY` o `GOOGLE_GENERATIVE_AI_API_KEY`). Modelos por defecto: `gemini-3.5-flash-lite` (fast) y `gemini-3.5-flash` (smart); se pueden cambiar con `AI_MODEL_FAST` y `AI_MODEL_SMART`.
  - **Cadena de respaldo** (`src/lib/ai/gemini.ts`): si el modelo no existe para la clave (404), se prueba el alias `gemini-flash(-lite)-latest` y luego `gemini-2.5-flash(-lite)`. El que responde se recuerda en la instancia, así que la búsqueda sólo cuesta la primera vez.
  - **Sin «pensar» de más:** el tutor y el feedback no necesitan razonamiento largo; se pide `thinkingBudget: 0` (2.x) o `thinkingLevel` bajo (3.x). Si la API rechaza el ajuste, se prueba el siguiente; si el modelo agota los tokens pensando sin escribir nada, se repite una vez con más margen. Las partes de «pensamiento» nunca se muestran.
  - **Errores claros:** clave inválida (401/403) y contenido bloqueado se traducen a mensajes para el usuario.
  - **Comprobarlo:** `/api/health` → `"ai": true`; en `/app/admin`, **Probar la IA** (modelo, latencia y respuesta).
- `AI_PROVIDER=openai-compatible`: cualquier `/chat/completions` (Groq, OpenRouter, Ollama local…).
- `AI_PROVIDER=none` o sin clave: el tutor se desactiva y todo lo demás sigue funcionando.

Hay timeout de 25 s y un reintento ante 429/5xx/timeout. Los errores se traducen a mensajes útiles; nunca se muestra un 500 crudo.

## Control de costos

- Límite por usuario: 10 llamadas/min y `AI_DAILY_LIMIT_PER_USER` al día (rate limit en Firestore).
- Al tutor sólo se envían los **últimos 12 turnos**, con respuestas de ≤ 220 tokens.
- El contexto del alumno es un bloque compacto (nivel, debilidades, 6 errores recientes, 25 palabras).
- Hay una caché genérica (`ai_cache`, `cacheGet`/`cacheSet`) disponible para tareas repetibles (p. ej. analizar un artículo en la fase 3).

## Prompts estructurados (`src/lib/ai/prompts.ts`)

El tutor recibe un bloque `USER PROFILE` (idioma, nivel CEFR, habilidades, áreas débiles, errores recientes, intereses, objetivo, profundidad de explicación) y reglas de comportamiento:
- respuestas cortas que terminan en una pregunta
- adaptación léxica según el nivel
- **no corregir constantemente** (sólo reformular si el error impide entender)
- llevar la conversación hacia las debilidades del alumno

## Evitar alucinaciones en el feedback

`sanitizeFeedback` valida la salida del modelo:
1. Se exige JSON con un esquema fijo, y se tolera que venga envuelto en bloques de código.
2. Cada categoría debe pertenecer a la **taxonomía cerrada** del idioma; si no, pasa a `vocabulary`.
3. El fragmento "erróneo" **debe aparecer literalmente** en lo que escribió el alumno; si no, se descarta.
4. Se limitan las longitudes y el número de errores (≤ 6).

Sólo los errores validados pasan a la tabla `mistakes` y alimentan el motor.

## Privacidad

El tutor está **desactivado hasta que el usuario da su consentimiento** (onboarding o Configuración). Nunca se envía el correo ni identificadores. Las capas gratuitas de algunos proveedores pueden usar los datos para mejorar sus modelos; el aviso de privacidad lo explica.
