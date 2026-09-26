# Fuentes de contenido, licencias y atribución

Regla: **nada inventado que parezca real**. Todo lo que se importa guarda su fuente, su licencia y su autor. Lo que escribimos nosotros (reglas, explicaciones, ejemplos didácticos) lleva la marca `// Revisión nativa: pendiente` hasta que lo revise un hablante nativo.

La página pública `/creditos` (y `/creditos/audio/<idioma>`) muestra todo esto al usuario.

## Texto

| Fuente | Licencia | Qué usamos | Dónde |
|---|---|---|---|
| Wiktionary (vía kaikki.org / wiktextract) | CC BY-SA 4.0 | Traducciones, IPA, lecturas, género, formas, conjugación | `scripts/content/build_packs.py` → `data/packs/*.json.gz` |
| Tatoeba | CC BY 2.0 FR | Frases de ejemplo con traducción humana | ídem (campo de fuente en cada ejemplo) |
| wordfreq | CC BY-SA 4.0 (datos) | Frecuencia → orden y nivel A1–C1 | ídem |
| Wikisource | Dominio público (autores fallecidos hace más de 70 años) | Fábulas y cuentos originales, revisados a mano | `scripts/content/build_classics.py` → `data/readings/*.json` |
| KanjiVG | CC BY-SA 3.0 | Orden de trazos de kana y kanji | `scripts/content/build_strokes.py` → `data/strokes/ja.json` |
| Make Me a Hanzi (graphics.txt) | Arphic Public License | Orden de trazos de hanzi (líneas medias) | ídem → `data/strokes/zh.json` |
| Contenido propio | del proyecto | Fase 0, reglas de lectura, módulo de escritura y ortografía (`src/lib/content/writing-system/`), historias | revisión nativa pendiente |

Los paquetes derivados de Wiktionary y wordfreq se redistribuyen con la misma licencia CC BY-SA 4.0.

Cada archivo de `data/strokes/` lleva `source`, `author`, `license` y `licenseUrl`; la página de caligrafía los muestra. Regenerar:

```bash
npx tsx --conditions=react-server scripts/content/stroke-chars.ts   # qué caracteres (kana + kanji/hanzi de las palabras básicas)
python3 scripts/content/build_strokes.py
```

### Clásicos de Wikisource

`build_classics.py` descarga cada texto con la API de Wikisource, quita cabeceras, notas y avisos, y guarda `title`, `author`, `work`, `url` y `license`. Cada entrada se revisó a mano: cuántos párrafos iniciales son cabecera de la edición, que el autor sea el correcto (p. ej. León y no Alekséi Tolstói) y que el autor o traductor haya muerto hace más de 70 años (por eso se descartó «Tuppen och räven», traducido por Stina Bergman, †1976). Las correcciones (iniciales ornamentales que faltan en el escaneo, ruido de OCR) están en `FIXES` con el texto exacto. El chino se pasa a simplificado con OpenCC. El nivel **no** se guarda: la app lo calcula para cada alumno con su vocabulario (`analyzeTokens`).

```bash
pip install opencc-python-reimplemented
DEBUG=1 python3 scripts/content/build_classics.py fr   # muestra los párrafos numerados para revisar
```

## Audio

Orden de reproducción en la app (`src/components/speak-button.tsx`):

1. **Grabación humana** (Wikimedia Commons / Lingua Libre), si existe para ese texto.
2. **Audio pregenerado** con una voz libre de Piper (`public/audio/<idioma>/*.mp3`).
3. **Voz del navegador** (la mejor disponible del idioma).

### Voces libres (Piper)

Sólo voces cuya licencia permite uso comercial (lista en `src/lib/audio-key.ts` → `PREGEN_VOICES`, espejo en `scripts/audio/build_audio.py`):

| Idioma | Voz | Licencia del conjunto de datos |
|---|---|---|
| en | en_US-ljspeech-medium | Dominio público (LJ Speech) |
| fr | fr_FR-siwis-medium | CC BY 4.0 (SIWIS) |
| de | de_DE-thorsten-medium | CC0 (Thorsten-Voice) |
| it | it_IT-paola-medium | CC0 |
| pt | pt_BR-faber-medium | CC0 |
| nl | nl_NL-pim-medium | CC0 |
| sv | sv_SE-nst-medium | CC0 (NST) |
| ru | ru_RU-denis-medium | CC0 |
| zh | zh_CN-chaowen-medium | CC0 |

Excluidas: japonés (`hi_fi_captain`, no comercial), coreano (`kss`, no comercial), árabe (`kareem`, licencia sin aclarar). Estos idiomas usan grabaciones humanas y la voz del dispositivo.

### Grabaciones humanas

`data/audio/human-<idioma>.json`: clave del texto → `{url, file, author, license}`, con el autor y la licencia leídos de la API de Commons (`extmetadata`). Las URL apuntan a la versión MP3 que genera Wikimedia, así que el navegador las descarga directamente de Wikimedia.

## Cómo regenerar el audio

```bash
# 1. Textos que deben sonar (letras, reglas, frases, historias, palabras básicas)
npx tsx --conditions=react-server scripts/audio/collect-texts.ts

# 2. Voces libres (local y gratis; ~5 MB por idioma)
python3 -m venv .cache/piper-env && .cache/piper-env/bin/pip install piper-tts imageio-ffmpeg
.cache/piper-env/bin/python scripts/audio/build_audio.py          # o: … build_audio.py fr de

# 3. Grabaciones humanas con autor y licencia (respeta la API: User-Agent, lotes de 50, pausas)
python3 scripts/audio/commons_audio.py                               # o: … commons_audio.py ja ko

# 4. Añadirlas al manifiesto que lee la app
python3 scripts/audio/merge_human.py
```

Los pasos 2 y 3 son idempotentes. `npm test` comprueba que el manifiesto cubre las letras, las reglas y el abecedario de cada idioma con voz libre.

## Añadir una fuente nueva

1. Comprueba que la licencia permite uso comercial y redistribución.
2. Guarda fuente, licencia y autor junto a cada elemento importado (no sólo en este documento).
3. Añádela a esta tabla y a `SOURCES` en `src/app/(marketing)/creditos/page.tsx`.
