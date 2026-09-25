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

## Añadir un idioma nuevo

1. Crea `src/lib/content/<código>/index.ts` usando `wordsFor("<código>")` de `src/lib/content/pack.ts`: cada palabra con IPA, traducción, al menos un ejemplo traducido y, si aplica, una nota (género, falsos amigos para hispanohablantes).
2. Añade al menos 2 conceptos de gramática con errores comunes, contrastes y ejercicios, y sus categorías en `error-categories.ts`.
3. Regístralo en `content/index.ts` y cambia su `status` a `"beta"` en `languages.ts`.
4. `npm test` valida automáticamente cada idioma disponible: IDs, ejemplos, ≥ 30 palabras, ≥ 2 conceptos, banco de diagnóstico ≥ 12 ítems, temas válidos y que cada ejercicio sea resoluble.

Estado actual: inglés (completo); francés, japonés, portugués, italiano y alemán (beta, revisión humana recomendada).

## Fase 3: contenido real de internet (diseño)

1. **Fuentes con licencia compatible:** RSS de medios que lo permitan, Wikipedia (CC BY-SA), Tatoeba (CC BY), documentación técnica y APIs públicas de diccionarios.
2. **Ingesta:** guardar **sólo** URL, título, autor, fecha, `retrievedAt` y fragmentos permitidos. Nunca artículos completos con copyright.
3. **Análisis determinista:** tokenización, cobertura de vocabulario conocido (con `user_knowledge`), longitud de frase y densidad léxica.
4. **Content Suitability Score:** `≈ w1·(cobertura conocida ∈ [90 %, 98 %]) + w2·relevancia del tema + w3·ajuste de dificultad − w4·longitud excesiva`. Es interno; no se muestra al usuario.
5. **IA (modelo fast, con caché por URL):** preguntas de comprensión, resumen y consigna de escritura.
6. **UI:** lector con traducción bajo demanda y enlace a la fuente original.
