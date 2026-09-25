# Contenido: cómo se añade y se revisa

## Fase actual: contenido curado en el repositorio

```
src/lib/content/
  languages.ts          registro de idiomas (código, escritura, RTL, locale de voz, estado)
  topics.ts             temas de interés
  error-categories.ts   taxonomía de errores ↔ conceptos de gramática
  en/ vocab.ts grammar.ts assessment.ts
  fr/ index.ts          (beta)
  ja/ index.ts          (beta, con lecturas kana/romaji)
  index.ts              catálogo: único punto de acceso
```

### Añadir vocabulario

Cada palabra necesita un ID estable (`<lang>:w:<slug>`; **no lo cambies nunca**, porque la memoria del usuario lo referencia), una traducción, **al menos un ejemplo con traducción**, CEFR, banda de frecuencia y temas. Opcionalmente: IPA, lectura, `acceptedForms` (p. ej. kana/romaji), `usageNote` (falsos amigos, calcos del español) y sinónimos o antónimos.

Si el lema aparece literal en un ejemplo, se generan automáticamente ejercicios de completar, dictado y ordenar palabras.

### Añadir gramática

Un `GrammarConcept` incluye: resumen, cuándo usarlo, formación, errores comunes (✗/✓/por qué), ejemplos, contrastes y ejercicios (`mc`, `fill`, `correct`). Enlaza su `errorCategory` en `error-categories.ts`.

### Añadir un idioma

1. Añade la entrada en `languages.ts` (con `spaceSeparated: false` para ja/zh y `rtl: true` para ar/he).
2. Crea `content/<code>/` con su vocabulario y gramática, y regístralo en `content/index.ts`.
3. Sin banco de diagnóstico curado, se genera uno automáticamente a partir del vocabulario y los ejercicios de opción múltiple de gramática.
4. Cambia `status` a `beta` o `available`.

### Control de calidad

`npm test` valida todo el catálogo:
- IDs únicos
- ejemplos presentes
- respuesta incluida entre las opciones
- ningún ejercicio "corregir la frase" acepta la frase errónea
- todos los ejercicios son resolubles
- los bancos de diagnóstico son válidos

**Revisión humana recomendada** para IPA y traducciones antes de publicar un idioma.

## Vocabulario desde datos públicos (A1 → C1)

`scripts/content/build_packs.py` genera `data/packs/<código>.json.gz` para 12 idiomas (≈ 5 500–9 700 palabras cada uno, con tablas de conjugación en FR, DE, IT, PT, NL, RU y AR):

1. **Frecuencia (wordfreq, CC BY-SA)** → orden de aprendizaje. El rango se cuenta entre lemas (no formas flexionadas) y define el nivel: θ = −2,5 + 1,27·ln(rango/300); A1 ≤ 445, A2 ≤ 978, B1 ≤ 2 150, B2 ≤ 4 730, C1 ≤ 10 400 palabras.
2. **Lemas y formas (Wiktionary en inglés, CC BY-SA)** → «geht» → «gehen»; lecturas (kana, pinyin, transliteración), IPA, género y audio grabado (Wikimedia Commons).
3. **Traducción al español por votación** de tres fuentes: Wiktionary en español (directa), tablas de traducción de palabras españolas (inversa, acepción principal) y triangulación por acepción en las tablas del Wiktionary inglés. Gana lo que coincide en varias.
4. **Ejemplos reales (Tatoeba, CC BY 2.0 FR)** con traducción humana, elegidos por longitud y porque el resto de palabras de la frase sean más fáciles que la palabra nueva.
5. **Correcciones revisadas** en `scripts/content/overrides/<código>.json` para las palabras más frecuentes (partículas, pronombres, polisemia); `null` descarta ruido del corpus y nombres propios; `{"t": […], "p": "noun"}` fija traducción y categoría (y crea el lema aunque Wiktionary no lo tenga); `"_forms": {"est": "être"}` fuerza forma → lema en homógrafos.
6. Si una palabra no tiene traducción fiable, **no entra**. Sin ejemplo sí entra (en coreano o árabe Tatoeba es pequeño y descartarlas vaciaba los niveles altos); la ficha lo indica.
7. **Conjugación**: de las tablas etiquetadas de Wiktionary (persona, número, tiempo, modo) se extrae una tabla compacta por verbo hasta B2 (`cj`), limpiando marcas de pronunciación (acento tónico ruso, tildes italianas no ortográficas).
8. **Limpieza de traducciones**: anotaciones de Wiktionary como «pertenecer [with a]», «[el] ala» o «mermar[se]» se convierten en texto natural.
9. **Resolución de lemas por idioma**: árabe (prefijos و ف ب ل ال, sufijos pronominales, enlaces vocalizados normalizados), coreano (partículas, terminaciones y raíces sueltas de wordfreq → verbo en -다), alemán (mayúsculas por uso real), chino (tradicional → simplificado).

Depuración: `DEBUG_WORDS=الذي,있 python scripts/content/build_packs.py --lang ar ko` muestra cómo se resuelve cada palabra. Pruebas: `npm run test:content`.

```bash
pip install -r scripts/content/requirements.txt
python scripts/content/build_packs.py --all          # ≈ 1 GB de descargas la primera vez (caché en .cache/)
python scripts/content/build_packs.py --lang de fr   # idiomas concretos
```

La app carga cada paquete bajo demanda en el servidor (`src/lib/content/packs.ts`) y lo fusiona con el contenido curado (que tiene prioridad). Créditos y licencias: página `/creditos`.

## Añadir un idioma nuevo

1. Crea `src/lib/content/<código>/index.ts` usando `wordsFor("<código>")` de `src/lib/content/pack.ts`: cada palabra con IPA, traducción, al menos un ejemplo traducido y, si aplica, una nota (género, falsos amigos para hispanohablantes).
2. Añade al menos 2 conceptos de gramática con errores comunes, contrastes y ejercicios, y sus categorías en `error-categories.ts`.
3. Regístralo en `content/index.ts` y cambia su `status` a `"available"` en `languages.ts`.
4. `npm test` valida automáticamente cada idioma disponible: IDs, ejemplos, ≥ 30 palabras, ≥ 2 conceptos, banco de diagnóstico ≥ 12 ítems, temas válidos y que cada ejercicio sea resoluble.

Estado actual: 12 idiomas disponibles con vocabulario hasta C1 desde datos públicos, gramática A1–C1 (8–13 lecciones por idioma) y tablas de conjugación en los idiomas flexivos. Se recomienda revisión humana continua de las traducciones más frecuentes.

## Fase 3: contenido real de internet (diseño)

1. **Fuentes con licencia compatible:** RSS de medios que lo permitan, Wikipedia (CC BY-SA), Tatoeba (CC BY), documentación técnica y APIs públicas de diccionarios.
2. **Ingesta:** guardar **sólo** URL, título, autor, fecha, `retrievedAt` y fragmentos permitidos. Nunca artículos completos con copyright.
3. **Análisis determinista:** tokenización, cobertura de vocabulario conocido (con `user_knowledge`), longitud de frase y densidad léxica.
4. **Content Suitability Score:** `≈ w1·(cobertura conocida ∈ [90 %, 98 %]) + w2·relevancia del tema + w3·ajuste de dificultad − w4·longitud excesiva`. Es interno; no se muestra al usuario.
5. **IA (modelo fast, con caché por URL):** preguntas de comprensión, resumen y consigna de escritura.
6. **UI:** lector con traducción bajo demanda y enlace a la fuente original.
