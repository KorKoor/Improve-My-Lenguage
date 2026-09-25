# Adaptive Learning Engine

Todo lo descrito aquí vive en `src/lib/engine/` y está cubierto por `tests/`.

## 1. Escala de habilidad (θ) y CEFR — `levels.ts`

Cada habilidad (`vocabulary`, `grammar`, `reading`, `listening`, `writing`, `speaking`, `pronunciation`) se representa con **θ** en escala logit (modelo de Rasch), acompañada de su **error estándar** y la **evidencia** (número de observaciones).

| CEFR | θ |
|---|---|
| A1 | < −2 |
| A2 | −2 … −1 |
| B1 | −1 … 0 |
| B2 | 0 … 1 |
| C1 | 1 … 2 |
| C2 | ≥ 2 |

- **Nivel global** = media de θ ponderada por el peso de cada habilidad × su precisión (1/SE²). Las habilidades sin evidencia no cuentan.
- **Actualización continua** (`updateSkillOnline`): tipo Elo/Rasch, con `θ += K·(resultado − P(acierto))`. K decrece con la evidencia (0.5/√(1+n/4), mínimo 0.04): al principio el sistema aprende rápido y con meses de datos se estabiliza.
- **Dificultad del ítem:** centro CEFR del ítem más un desplazamiento por tipo de ejercicio (reconocer es más fácil que recordar, y el dictado es lo más difícil).

## 2. Diagnóstico adaptativo (CAT) — `assessment.ts`

- **Prior:** si el usuario indica su nivel, N(θ_CEFR, 1.2); si no, N(−1, 1.6).
- **Estimación:** EAP sobre una rejilla de −4 a 4. Es robusta cuando todas las respuestas son correctas o incorrectas.
- **Selección:** se elige la habilidad menos evaluada y, dentro de ella, el ítem de máxima información (en Rasch, |θ − b| mínimo).
- **Parada:** entre 8 y 18 ítems, o antes si SE ≤ 0.45.
- **Por habilidad:** EAP con prior centrado en el θ global. Con pocos ítems, la estimación se contrae hacia el nivel general.
- **Siembra:** las habilidades no evaluadas empiezan en el θ global con SE 1.2, y los fallos en ítems de gramática se registran como primeros errores.
- **Validación:** en una simulación con 30 alumnos virtuales por nivel, el error medio absoluto es < 0.75 logits (test `CAT recupera el nivel real`).

**Calibrar el banco:** cuando haya datos, reestima la `difficulty` de cada ítem como la θ media de quienes lo aciertan y lo fallan (Rasch conjunto). Los valores iniciales salen del nivel CEFR objetivo del ítem.

## 3. Repetición espaciada (FSRS-5) — `fsrs.ts`

Implementación propia del algoritmo público FSRS-5 (19 pesos por defecto, retención objetivo del 90 %).

- R(t, S) = (1 + 19/81 · t/S)^−0.5 → S es el número de días hasta que la probabilidad de recordar baja al 90 %.
- Se aplican fórmulas separadas para el primer repaso, los repasos del mismo día (corto plazo), los aciertos (aumento de estabilidad) y los olvidos (lapsos).
- **Señales propias** (`ratingFromOutcome`):
  - fallo → *Again*
  - acierto con más de un intento, con errata o con baja confianza → *Hard*
  - acierto con tiempo > 2× el esperado → *Hard*
  - acierto rápido (< 0.5× el esperado) → *Easy*
  - resto → *Good*
- Un fallo reprograma el ítem a 10 minutos, y en la sesión el ejercicio fallado vuelve a aparecer al final una vez más.

## 4. Debilidades — `weakness.ts`

`score = Σ 0.5^(edad_días/7) · (1 + tasa_de_error)` por categoría en las últimas 4 semanas. Una categoría es **recurrente** si acumula ≥ 3 errores y aparece en ≥ 2 sesiones distintas. La taxonomía está en `content/error-categories.ts` y cada categoría enlaza con su concepto gramatical.

## 5. Planificador de sesiones — `planner.ts`

Entrada: minutos, repasos vencidos, debilidades, vector de habilidades, disponibilidad de IA y audio, y preferencias.

1. **Repaso** primero: 0.3 min por ítem, con un tope del 45 % de la sesión.
2. El resto se reparte por pesos:
   - gramática: 3 si hay debilidad recurrente, 1.5 si no
   - vocabulario nuevo: 2.5
   - listening: 1.5
   - tutor: 1.5, sólo con IA y ≥ 15 min
3. La **habilidad más débil** (con evidencia) recibe ×1.6.
4. Los bloques de menos de 2 min se eliminan y se redistribuyen. El redondeo usa el método del mayor resto, así que **el total es exacto**.
5. **Forma de aprender** (si hizo el cuestionario): multiplicadores 0.5–1.8 por bloque (`styleWeights`), p. ej. listening × (1 + 0.6·oído). Nunca eliminan un bloque ni tocan los repasos; si el multiplicador es ≥ 1.2, el motivo lo dice.
6. "Sorpréndeme" perturba los pesos con una semilla, lo que lo hace reproducible.
7. Cada bloque lleva su **motivo** legible (explicabilidad).

`session-builder.ts` convierte el plan en pasos:
- tarjeta de presentación de cada palabra nueva, luego reconocimiento y después emparejar
- consejo de gramática y luego sus ejercicios
- dictados con palabras ya vistas
- el tipo de ejercicio de repaso sube de dificultad según las repeticiones (reconocer → recordar → completar en contexto → dictado)

**Selección de vocabulario nuevo:** i+1 (objetivo θ_vocab + 0.4). Se prioriza el tema de interés (−0.9), las palabras guardadas (−1.5) y las más frecuentes, y se penaliza lo demasiado difícil (+2).

## 6. Recomendador — `recommender.ts`

Prioridad determinista:
1. sin diagnóstico → diagnóstico
2. ≥ 15 repasos → repasar
3. debilidad recurrente → su gramática
4. brecha ≥ 0.8 logits entre la habilidad más fuerte y la más débil (con ≥ 5 observaciones) → reforzar la débil
5. repasos pendientes → repasar
6. no ha estudiado hoy → sesión
7. vocabulario de su interés

Siempre devuelve el *porqué*.

**Prácticas sugeridas** (`practicePicks`): ordena Leer / Escuchar / Hablar / Escribir / Tutor con puntuación = 1 + 1·(habilidad ≥ 0.4 logits por debajo de la media) + 0.6·(nunca practicada) + 0.8·(favorita según el cuestionario). Cada tarjeta explica por qué aparece.

## 6b. Cuestionario «¿Cómo aprendes mejor?» — `personality.ts`

15 ítems Likert (1–5), 8 dimensiones en [-1, 1]: ritmo, reto, organización, profundidad, corrección, motivación, canal (oído/lectura) y objetivo (conversar/vocabulario). Ítems invertidos para reducir el sesgo de aquiescencia. Se presenta como **preferencias**, no como «estilos de aprendizaje» (no hay evidencia de que enseñar según estilos mejore el aprendizaje); por eso sólo ajusta la experiencia (dificultad, profundidad, tono del tutor, pesos del plan) y nunca oculta contenido.

Arquetipo = máximo de combinaciones lineales de dimensiones (Explorador, Estratega, Retador, Constante, Buen oído, Conversador, Coleccionista de palabras, Analítico), con «Constante» por defecto si ninguna afinidad supera 0.15.

## 6c. «Lo que dicen tus datos» — `insights.ts`

| Insight | Cálculo |
|---|---|
| Cobertura de texto | Σ 1/rango de las palabras aprendidas ÷ H(60 000) (ley de Zipf) |
| Previsión de nivel | (lemas del siguiente nivel − aprendidas) ÷ (palabras vistas por semana desde el primer día activo) |
| Palabras rebeldes | ≥ 3 lapsos, o ≥ 3 fallos y más fallos que aciertos |
| Memoria actual | media de R (FSRS) de las palabras aprendidas |
| Tendencia | precisión de las 2 últimas semanas con ≥ 10 intentos vs. las 2 anteriores (sólo si cambia ≥ 5 puntos) |
| Palabra del día | no vista, con ejemplo, rango entre 0.9× y 1.8× del rango conocido; preferencia por audio grabado; semilla = día + usuario |

## 6d. Varios idiomas — `multilang.ts`

- **Reparto diario**: peso = prioridad (principal 3, en progreso 2, mantener 1) + presión de repasos (mín(2, vencidos/40)) + abandono (+0,8 si ≥ 3 días sin estudiarlo, +0,4 si 2). Si ya cumplió su objetivo de hoy, ×0,35. Un idioma en «mantener» sin repasos y visto hace < 3 días descansa ese día.
- Los minutos se redondean a bloques de 5 (mayor resto) y el principal nunca recibe menos que otro. Modo «repaso» si vaciar los vencidos (≈ 9 s por repaso) ocupa ≥ 70 % del bloque.
- **Interferencia**: pares muy cercanos (es-it, es-pt, it-pt, de-nl…) = 2, misma familia = 1. El orden de bloques evita poner seguidos dos idiomas cercanos y el plan inserta una pausa entre ellos.

## 6e. Temporizador inteligente y descansos — `focus.ts`, `study-plan.ts`

- **Lectura de foco** tras cada respuesta (≥ 6 respuestas): caída de precisión (media suavizada de las 6 últimas frente al inicio), lentitud (mediana reciente ÷ inicial), fallos seguidos y minutos sin pausa frente a tu capacidad de atención. Fatiga = 0,35·caída + 0,2·lentitud + 0,15·fallos + 0,3·tiempo → seguir, micro-pausa (≥ 0,4 o 3 fallos), pausa (≥ 0,6) o terminar (≥ 0,8 y ≥ 20 min).
- **Capacidad de atención**: en cada sesión se detecta el minuto de inicio de la fatiga (la media móvil de 5 cae ≥ 40 puntos desde su mejor valor). Se combina la mediana de las últimas 12 sesiones con la preferencia declarada (peso 3) → entre 6 y 45 min.
- **Mejor hora**: precisión por franja (mañana, tarde, noche, madrugada) con suavizado bayesiano hacia tu media; se muestra sólo con ≥ 40 respuestas y ≥ 2 puntos de diferencia.
- **Modo estudio**: reparte el tiempo, divide los idiomas con ≥ 15 min en núcleo (60 %) + práctica según tus favoritos, e inserta descansos de 1–2 min cuando el siguiente bloque superaría tu capacidad de atención (5 min andando tras 45 min de estudio).

## 6f. Cognados y falsos amigos — `cognates.ts`

Para hispanohablantes en idiomas de escritura latina: se aplican correspondencias ortográficas (-tion→-ción, -zione→-ción, -ção→-ción, -té→-dad, ph→f…) y se compara con las propias traducciones de la palabra por distancia de edición (umbral 0,72–0,8 según longitud; exacto en palabras de ≤ 4 letras). Los falsos amigos salen de una lista curada.

## 7. Métricas de progreso — `progress.ts`

| Métrica | Definición |
|---|---|
| Palabra aprendida | reps ≥ 2, S ≥ 3 días y R actual ≥ 0.8 |
| Palabra dominada | S ≥ 21 días |
| Maestría de un ítem | R_actual × min(1, ln(1+S)/ln(31)) |
| Precisión | aciertos / intentos (una errata leve cuenta como acierto) |
| Racha | días consecutivos con ≥ 1 ejercicio en la zona horaria del usuario; si hoy aún no estudió, cuenta desde ayer |
| Constancia | % de días activos en los últimos 28 |
| Progreso dentro del nivel | posición lineal de θ dentro de su banda de 1 logit |
