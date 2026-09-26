# Marca: Improve My Languages y Afi

## Arquitectura de marca

| | |
|---|---|
| **Producto (marca principal)** | Improve My Languages — siempre así, con esas mayúsculas. Nunca «Improve Languages», «Improve My Language», «ImproveMyLanguages» (salvo en identificadores técnicos) ni «Afi Languages». |
| **Mascota** | Afi — mascota y compañera de aprendizaje de Improve My Languages. No es una sigla: no se le inventa un significado. |
| **Concepto** | Aprendizaje adaptativo de idiomas (*adaptive language learning*). |
| **Filosofía** | El usuario no se adapta al curso. El curso se adapta a ti. |
| **Lema** | Learn smarter. Become better. |

Afi refuerza la marca; no la sustituye. En títulos, metadatos y datos estructurados el nombre del producto va primero; Afi aparece como «Afi, tu compañera de aprendizaje». Frase canónica (páginas públicas y datos estructurados): *Afi es la mascota y compañera de aprendizaje de Improve My Languages.*

Se escribe **Afi** en el texto (como en la hoja de personaje oficial). En contextos en mayúsculas puede aparecer «AFI»; nunca se expande.

## Voz y copy

Claro, corto, humano, tranquilo. Frases que describen un dato y proponen un paso.

| Sí | No |
|---|---|
| «Descubre qué necesitas practicar.» | «¡CONVIÉRTETE EN POLÍGLOTA YA!» |
| «Bien hecho. Este tipo de error ya aparece menos.» | «¡Yujuuu! ¡Eres el mejor del universo!» |
| «Hoy costó un poco, y eso también sirve.» | «Fallaste 6 de 10.» |

No se inventan estadísticas, usuarios, premios ni resultados. Lo planificado se dice «en camino», nunca como disponible.

## Sistema visual (cozy)

Tokens en `src/app/globals.css` (los mismos nombres que en Figma).

- **Claro:** crema `--bg #fbf8f4`, superficie blanca, lavanda `--primary-soft #eeeefd`, primario índigo suave `#5b5fd6`, acentos dorados (la estrella de Afi) y colores por habilidad en pastel (mint, peach, cielo…).
- **Oscuro (noche):** azul noche profundo en vez de negro (`--bg #121630`, superficies `#1a1f3d`/`#222849`), lavanda y mint para acentos, la estrella dorada intacta. No se invierten colores: Afi es el mismo de día y de noche; sólo su sombra se adapta (`--afi-shadow`).
- **Formas:** bordes muy redondeados (tarjetas 22–26 px), sombras apenas visibles (`--shadow`), mucho aire. Nada de degradados fuertes ni *glassmorphism*.
- **Iconos:** Lucide (trazo redondeado, pocos detalles) dentro de `IconBox` con fondo pastel. No se mezclan con 3D ni con emojis en el mismo bloque.
- **Tipografía:** Nunito (títulos, 700–800) + Inter (texto).
- **Texto de color** sobre fondos suaves: tokens `--*-ink` (contraste AA).

## Afi: sistema de diseño

Fuente única: `src/components/afi/afi.tsx` (SVG en línea, sin imágenes externas, ~2,5 KB). Los archivos de `public/afi/` y los iconos se **generan** desde ese componente con `npx tsx scripts/brand/export-afi.tsx`: nunca se dibujan aparte.

### Anatomía (no cambia nunca)

- **Silueta:** nube redondeada con tres bultos arriba, base ancha y dos patitas.
- **Colores:** cuerpo `#fdfcff` con borde `#e7e3fa` y sombreado lavanda `#ebe7fc`; audífonos `#a9abee` (diadema) y `#8f92e6` (auriculares); **una estrella dorada `#f7cb4d` en cada auricular** (seña de identidad); ojos `#2f2b4a`; mejillas `#f8bccd`.
- **Proporciones:** caja 160 × 150; la cara ocupa el tercio central; los auriculares a media altura; la estrella siempre arriba del auricular.
- **Luz y sombra:** un brillo blanco arriba a la izquierda, sombreado lavanda abajo, sombra elíptica suave en el suelo. Sin contorno oscuro.
- **Tamaño mínimo:** 24 px (se reconoce por audífonos + estrellas).

### Personalidad (quién es)

Afi no es una mascota genérica: tiene historia y manías propias, y todo lo que cuenta de los idiomas es verdad.

- **Una nube que escucha.** Flota por encima de todos los idiomas y cada uno le llueve un poco en los audífonos; por eso nunca se los quita.
- **Estrellas que se encienden.** Las estrellas doradas brillan un poco más cuando aprendes algo (en `proud`, `celebrating` y `excited` resplandecen).
- **Manías:** colecciona palabras que suenan bonito («mariposa», «Schmetterling», 雲 *kumo*), tiene cosquillas en los audífonos, se duerme si nadie le hace caso y se despierta sobresaltada («Estaba soñando con verbos irregulares»).
- **Voz al tocarla:** `afiPoke` en `lib/engine/afi-voice.ts` (1 toque: una frase suya; 3 seguidos: cosquillas; 6: se marea y propone practicar). Saluda distinto por la mañana y de noche.

### Vida propia

Sólo con CSS, en cualquier `<Afi>` (salvo `still`, que usan las exportaciones):

- **Parpadea** a su ritmo, a veces dos veces seguidas; cada Afi con su desfase (`afiPhase`), así que dos Afi en la misma pantalla no parpadean a la vez.
- **Respira** muy despacio y **sus estrellas titilan**.
- **Cada estado tiene su gesto:** las «z» suben al dormir, los puntos de `thinking` saltan en orden, la boca se mueve en `speaking`, las notas se mecen en `listening`, el corazón late, el «?» se ladea.

Con `LiveAfi` (`components/afi/live-afi.tsx`, en inicio, bienvenida, login, página de Afi, fin de sesión y 404):

- **Mira hacia el puntero** (ojos y cara con paralaje; `afiGaze` limita el recorrido). En pantallas táctiles mira alrededor de vez en cuando.
- **Reacciona al tocarla** con salto, meneo o mareo, una partícula (💜 ✨ 💫) y un bocadillo que nunca se sale de la pantalla.
- **Se duerme** tras 60 s sin actividad (25 s de noche) y cualquier gesto la despierta.
- Es un botón («Saludar a Afi»): funciona con teclado y lo que dice se anuncia con `aria-live`. Con «reducir movimiento» no se mueve; sólo cambia la cara.

### Evoluciona contigo (sin niveles absurdos)

`lib/engine/afi-bond.ts`. Nada de «Afi nivel 372»: Afi estrena **pequeños accesorios** cuando consigues algo real, y nunca los pierde.

| Accesorio | Cómo se consigue |
|---|---|
| Bufanda rosa | 7 días seguidos (mejor racha) |
| Gafas de lectora | 100 palabras aprendidas |
| Flor en la diadema | 30 días seguidos |
| Tercera estrella | Llegar a B1 |

- **Momentos importantes:** el día que llegas a 3, 7, 14, 30, 50, 100… días seguidos, la frase de Afi en el inicio lo celebra (`streakMoment`). Cuando estrena accesorio, te lo cuenta una vez con confeti (`AfiNewWear`).
- **Se equivoca a veces:** al tocarla puede confundirse… y corregirse («Wolle es lana; nube es Wolke»). Lo que enseña sigue siendo verdad.
- **Te conoce:** en Progreso, «Lo que Afi ha aprendido de ti» resume tus últimas 8 semanas (con al menos 30 respuestas): a qué hora aciertas más, si reconoces mejor de lo que recuerdas, si tus fallos son casi aciertos, si respondes más rápido y qué días estudias. Cada frase sale de tus datos y va con un consejo.

### Estados (`mood`)

Sólo cambian ojos, boca, cejas y, a veces, un objeto pequeño que no tapa la cara:

`happy` · `neutral` · `curious` (?) · `thinking` (…) · `studying` / `reading` (libro) · `writing` (lápiz) · `listening` (nota musical) · `speaking` (ondas) · `celebrating` / `excited` (destellos) · `encouraging` (guiño + corazón) · `proud` (estrella) · `surprised` · `confused` · `error` · `supportive` (triste pero de apoyo, corazón) · `calm` · `sleepy` (z z) · `resting` (taza) · `waving` / `goodbye` (saluda).

### Movimiento (`motion`)

`breathe` (cargando) · `float` (reposo en el inicio) · `hop` (acierto, sesión terminada; la sombra se encoge al saltar) · `sway` (fallo; también al pasar el ratón por `.afi-host`) · `wiggle` (cosquillas). Pequeños y cortos; con `prefers-reduced-motion` no se mueve nada.

### Dónde aparece (y qué hace)

| Momento | Estado | Función |
|---|---|---|
| Inicio | según datos | Frase de `afiDashboardLine`: error recurrente, repasos FSRS pendientes, racha o vuelta tras una pausa. |
| Diagnóstico | `curious` → `proud` | Acompaña y presenta el nivel. |
| Respuesta correcta / incorrecta | `happy`/`proud` / `supportive` | `afiAnswerLine`: nunca castiga («No pasa nada. Este ejercicio nos ayuda a saber qué necesitas practicar.»). |
| Fin de sesión | según precisión | `afiSessionLine`. |
| Cargando | `thinking` + `breathe` | |
| Estados vacíos | variado por pantalla | |
| Errores técnicos | `error` | Mensaje tranquilo + **ID del error** visible. |
| 404 | `confused` | |

### Accesibilidad

Afi es decorativo (`aria-hidden`) salvo que se le pase `label`. Todo lo que dice está también en texto (con «Afi:» sólo para lectores de pantalla). Ninguna información depende de verlo.

### Componentes

- `<Afi mood motion size label />` — el personaje.
- `<AfiMessage mood>` — bocadillo de Afi para mensajes del motor adaptativo.
- `EmptyState mood` — estados vacíos con Afi.
- `lib/engine/afi-voice.ts` — la voz de Afi (funciones puras con pruebas).
