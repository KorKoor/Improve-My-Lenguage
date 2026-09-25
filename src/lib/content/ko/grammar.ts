import type { GrammarConcept } from "../types";

/**
 * Coreano: programa gramatical A1 → C1 (registro cortés 해요체 salvo indicación).
 * Revisión humana recomendada antes de ampliar (ver docs/CONTENT_PIPELINE.md).
 */
const es = (t: string) => ({ es: t });

export const KO_GRAMMAR: GrammarConcept[] = [
  {
    id: "ko:g:topic-subject",
    language: "ko",
    title: "Partículas de tema y sujeto: 은/는 y 이/가",
    cefr: "A1",
    errorCategory: "ko:particles",
    summary:
      "El coreano marca la función de cada palabra con una partícula pegada detrás. 은/는 presenta el tema («en cuanto a…») y 이/가 señala el sujeto, sobre todo cuando es información nueva. El verbo siempre va al final.",
    whenToUse: [
      "은/는: el tema del que hablas o un contraste. 저는 학생이에요. (Yo soy estudiante.)",
      "이/가: sujeto nuevo o que se destaca; con 있다/없다 y en preguntas con 누가/뭐가.",
    ],
    formation: [
      "Tras consonante: 은 / 이 — 선생님은, 책이.",
      "Tras vocal: 는 / 가 — 저는, 친구가.",
      "Orden: sujeto – objeto – verbo. 저는 커피를 마셔요.",
    ],
    commonMistakes: [
      { wrong: "저가 학생이에요.", right: "저는 학생이에요.", why: "Al presentarte usas el tema 는; además 저 + 가 se contrae en 제가." },
      { wrong: "책는 있어요.", right: "책이 있어요.", why: "책 termina en consonante: 이 (no 는); y con 있다 se usa el sujeto." },
    ],
    examples: [
      { text: "저는 한국어를 공부해요.", reading: "jeoneun hangugeoreul gongbuhaeyo.", translation: es("Yo estudio coreano.") },
      { text: "누가 왔어요? — 친구가 왔어요.", reading: "nuga wasseoyo? — chinguga wasseoyo.", translation: es("¿Quién vino? — Vino un amigo.") },
    ],
    contrasts: [{ a: "커피는 좋아해요. (el café, sí me gusta)", b: "커피가 좋아요. (me gusta el café)", explanation: "은/는 añade contraste o tema; 이/가 destaca el sujeto." }],
    exercises: [
      { type: "mc", prompt: "저___ 학생이에요.", options: ["는", "은", "가", "를"], answers: ["는"], explanation: "저 termina en vocal y es el tema → 는." },
      { type: "mc", prompt: "책___ 있어요.", options: ["이", "가", "는", "을"], answers: ["이"], explanation: "책 termina en consonante y es el sujeto de 있다 → 이." },
      { type: "mc", prompt: "누___ 왔어요?", options: ["가", "는", "를", "이"], answers: ["가"], explanation: "Con 누구 (quién) como sujeto: 누가." },
      { type: "mc", prompt: "선생님___ 한국 사람이에요.", options: ["은", "는", "가", "을"], answers: ["은"], explanation: "선생님 termina en consonante; tema → 은." },
    ],
  },
  {
    id: "ko:g:polite-present",
    language: "ko",
    title: "Presente cortés: -아요 / -어요 / 해요",
    cefr: "A1",
    errorCategory: "ko:verb-endings",
    summary:
      "La terminación 해요체 (-아요/-어요) es la forma educada y cotidiana: sirve con desconocidos, en tiendas y en el trabajo. Se elige según la última vocal de la raíz.",
    whenToUse: ["Presente y futuro próximo en conversación cortés.", "Con entonación sirve también para preguntar y para pedir."],
    formation: [
      "Quita -다 del infinitivo: 가다 → 가-.",
      "Vocal ㅏ u ㅗ → -아요: 가다 → 가요, 보다 → 봐요.",
      "Otras vocales → -어요: 먹다 → 먹어요, 마시다 → 마셔요.",
      "하다 → 해요: 공부하다 → 공부해요.",
    ],
    commonMistakes: [
      { wrong: "먹아요", right: "먹어요", why: "La vocal de 먹 es ㅓ: lleva -어요." },
      { wrong: "공부하어요", right: "공부해요", why: "Todos los verbos en 하다 hacen 해요." },
    ],
    examples: [
      { text: "매일 커피를 마셔요.", reading: "maeil keopireul masyeoyo.", translation: es("Tomo café todos los días.") },
      { text: "주말에 영화를 봐요.", reading: "jumare yeonghwareul bwayo.", translation: es("El fin de semana veo películas.") },
    ],
    contrasts: [{ a: "가요 (voy / ¿vas? / vamos)", b: "갑니다 (voy — muy formal)", explanation: "해요체 es cortés y cercano; 합니다체 es formal (noticias, discursos)." }],
    exercises: [
      { type: "mc", prompt: "저는 밥을 ___. (먹다)", options: ["먹어요", "먹아요", "먹해요", "먹요"], answers: ["먹어요"], explanation: "먹 lleva vocal ㅓ → 먹어요." },
      { type: "mc", prompt: "학교에 ___. (가다)", options: ["가요", "가어요", "갔어요", "가해요"], answers: ["가요"], explanation: "가 + 아요 se contrae en 가요." },
      { type: "mc", prompt: "한국어를 ___. (공부하다)", options: ["공부해요", "공부하아요", "공부하어요", "공부요"], answers: ["공부해요"], explanation: "하다 → 해요." },
      { type: "mc", prompt: "텔레비전을 ___. (보다)", options: ["봐요", "보어요", "봐어요", "보해요"], answers: ["봐요"], explanation: "보 + 아요 → 봐요." },
    ],
  },
  {
    id: "ko:g:past",
    language: "ko",
    title: "Pasado: -았어요 / -었어요 / 했어요",
    cefr: "A2",
    errorCategory: "ko:past-tense",
    summary: "El pasado se forma con la misma regla de vocales que el presente, añadiendo -았-/-었- antes de la terminación cortés -어요.",
    whenToUse: ["Acciones terminadas: 어제 친구를 만났어요 (Ayer vi a un amigo)."],
    formation: [
      "ㅏ/ㅗ → -았어요: 가다 → 갔어요, 오다 → 왔어요.",
      "Otras vocales → -었어요: 먹다 → 먹었어요, 마시다 → 마셨어요.",
      "하다 → 했어요: 일하다 → 일했어요.",
    ],
    commonMistakes: [
      { wrong: "어제 영화를 봐요.", right: "어제 영화를 봤어요.", why: "어제 (ayer) exige pasado." },
      { wrong: "먹았어요", right: "먹었어요", why: "먹 (ㅓ) → -었어요." },
    ],
    examples: [
      { text: "어제 친구를 만났어요.", reading: "eoje chingureul mannasseoyo.", translation: es("Ayer vi a un amigo.") },
      { text: "아침에 빵을 먹었어요.", reading: "achime ppangeul meogeosseoyo.", translation: es("Por la mañana comí pan.") },
    ],
    contrasts: [{ a: "가요 (voy)", b: "갔어요 (fui)", explanation: "El pasado se marca dentro del verbo, no con palabras aparte." }],
    exercises: [
      { type: "mc", prompt: "어제 학교에 ___. (가다)", options: ["갔어요", "가요", "가었어요", "갈 거예요"], answers: ["갔어요"], explanation: "가 + 았어요 → 갔어요." },
      { type: "mc", prompt: "점심을 ___. (먹다)", options: ["먹었어요", "먹았어요", "먹어요", "먹했어요"], answers: ["먹었어요"], explanation: "먹 → 먹었어요." },
      { type: "mc", prompt: "주말에 ___. (일하다)", options: ["일했어요", "일하았어요", "일해요", "일하었어요"], answers: ["일했어요"], explanation: "하다 → 했어요." },
      { type: "mc", prompt: "친구가 집에 ___. (오다)", options: ["왔어요", "오었어요", "와요", "왔요"], answers: ["왔어요"], explanation: "오 + 았어요 → 왔어요." },
    ],
  },
  {
    id: "ko:g:negation",
    language: "ko",
    title: "Negación: 안 + verbo y -지 않다",
    cefr: "A2",
    errorCategory: "ko:negation",
    summary: "Hay dos formas equivalentes de negar: 안 delante del verbo (más coloquial) o -지 않아요 detrás de la raíz (algo más formal). Para «no poder» se usa 못.",
    whenToUse: ["안 / -지 않다: no hacer algo (decisión o hecho).", "못 / -지 못하다: no poder hacerlo."],
    formation: [
      "안 + verbo: 안 가요, 안 먹어요.",
      "Raíz + 지 않아요: 가지 않아요, 먹지 않아요.",
      "Con 하다 compuesto: 공부 안 해요 (no «안 공부해요»).",
    ],
    commonMistakes: [
      { wrong: "안 공부해요.", right: "공부 안 해요.", why: "En verbos sustantivo + 하다, 안 va justo antes de 하다." },
      { wrong: "고기를 먹지 안아요.", right: "고기를 먹지 않아요.", why: "Se escribe 않아요 (de 않다)." },
    ],
    examples: [
      { text: "저는 고기를 안 먹어요.", reading: "jeoneun gogireul an meogeoyo.", translation: es("No como carne.") },
      { text: "오늘은 학교에 가지 않아요.", reading: "oneureun hakgyoe gaji anayo.", translation: es("Hoy no voy a la escuela.") },
    ],
    contrasts: [{ a: "수영 안 해요. (no nado — no quiero)", b: "수영 못 해요. (no sé / no puedo nadar)", explanation: "안 niega; 못 expresa imposibilidad." }],
    exercises: [
      { type: "mc", prompt: "저는 커피를 ___ 마셔요.", options: ["안", "못", "않", "지"], answers: ["안"], explanation: "Negación simple: 안 + verbo." },
      { type: "mc", prompt: "오늘은 ___. (가다, negativo)", options: ["가지 않아요", "가지 안아요", "안가지요", "가안요"], answers: ["가지 않아요"], explanation: "Raíz + 지 않아요." },
      { type: "mc", prompt: "주말에는 공부 ___ 해요.", options: ["안", "않", "지", "못하"], answers: ["안"], explanation: "공부 안 해요: 안 va antes de 하다." },
      { type: "mc", prompt: "다리가 아파서 걸을 수 없어요 = ___ 걸어요.", options: ["못", "안", "않", "지"], answers: ["못"], explanation: "Imposibilidad → 못." },
    ],
  },
  {
    id: "ko:g:want-can",
    language: "ko",
    title: "Querer y poder: -고 싶다 y -(으)ㄹ 수 있다",
    cefr: "B1",
    errorCategory: "ko:modal",
    summary: "-고 싶어요 expresa lo que quieres hacer; -(으)ㄹ 수 있어요 / 없어요, lo que puedes o no puedes hacer.",
    whenToUse: ["Deseos: 한국에 가고 싶어요.", "Capacidad o posibilidad: 한국어를 읽을 수 있어요."],
    formation: [
      "Raíz + 고 싶어요: 먹고 싶어요, 자고 싶어요.",
      "Raíz terminada en vocal + ㄹ 수 있어요: 갈 수 있어요.",
      "Raíz terminada en consonante + 을 수 있어요: 먹을 수 있어요.",
    ],
    commonMistakes: [
      { wrong: "먹을 싶어요.", right: "먹고 싶어요.", why: "Querer = -고 싶다." },
      { wrong: "가을 수 있어요.", right: "갈 수 있어요.", why: "Tras vocal: -ㄹ 수 있다." },
    ],
    examples: [
      { text: "한국에 가고 싶어요.", reading: "hanguge gago sipeoyo.", translation: es("Quiero ir a Corea.") },
      { text: "매운 음식을 먹을 수 있어요?", reading: "maeun eumsigeul meogeul su isseoyo?", translation: es("¿Puedes comer comida picante?") },
    ],
    contrasts: [{ a: "가고 싶어요 (quiero ir)", b: "갈 수 있어요 (puedo ir)", explanation: "Deseo frente a capacidad." }],
    exercises: [
      { type: "mc", prompt: "피자를 ___ 싶어요.", options: ["먹고", "먹을", "먹어", "먹지"], answers: ["먹고"], explanation: "Querer: raíz + 고 싶다." },
      { type: "mc", prompt: "내일 ___ 수 있어요. (오다)", options: ["올", "오을", "오고", "와"], answers: ["올"], explanation: "오 termina en vocal → 올 수 있어요." },
      { type: "mc", prompt: "한글을 ___ 수 있어요. (읽다)", options: ["읽을", "읽", "읽고", "일을"], answers: ["읽을"], explanation: "Consonante final → 을 수 있다." },
      { type: "mc", prompt: "너무 피곤해서 ___ 싶어요. (자다)", options: ["자고", "잘", "자지", "잤고"], answers: ["자고"], explanation: "Deseo → 자고 싶어요." },
    ],
  },
  {
    id: "ko:g:because",
    language: "ko",
    title: "Porque: -아서/-어서 y -(으)니까",
    cefr: "B1",
    errorCategory: "ko:connectors",
    summary: "Ambas conectan una causa con su consecuencia. -아서/-어서 es neutro y no admite pasado ni órdenes después; -(으)니까 subraya la razón y sí permite «hagamos / haz».",
    whenToUse: ["Causa neutra: 비가 와서 집에 있었어요.", "Razón + propuesta u orden: 추우니까 코트를 입으세요."],
    formation: [
      "-아서/-어서 sigue la regla de vocales: 가다 → 가서, 먹다 → 먹어서, 하다 → 해서.",
      "Nunca -았어서: la causa no lleva pasado.",
      "Vocal + 니까 / consonante + 으니까: 바쁘니까, 많으니까.",
    ],
    commonMistakes: [
      { wrong: "늦었어서 미안해요.", right: "늦어서 미안해요.", why: "-아서/-어서 no lleva marca de pasado." },
      { wrong: "추워서 코트를 입으세요.", right: "추우니까 코트를 입으세요.", why: "Con una orden después se usa -(으)니까." },
    ],
    examples: [
      { text: "비가 와서 집에 있었어요.", reading: "biga waseo jibe isseosseoyo.", translation: es("Como llovía, me quedé en casa.") },
      { text: "시간이 없으니까 빨리 가요.", reading: "sigani eopseunikka ppalli gayo.", translation: es("Como no hay tiempo, vámonos rápido.") },
    ],
    contrasts: [{ a: "배가 고파서 먹었어요. (hecho)", b: "배가 고프니까 먹자. (propuesta)", explanation: "Propuestas y órdenes van con -(으)니까." }],
    exercises: [
      { type: "mc", prompt: "늦___ 미안해요. (늦다)", options: ["어서", "었어서", "으니까", "고"], answers: ["어서"], explanation: "Disculpa por una causa: 늦어서 (sin pasado)." },
      { type: "mc", prompt: "추우___ 창문을 닫으세요.", options: ["니까", "어서", "고", "지만"], answers: ["니까"], explanation: "Orden después → -(으)니까." },
      { type: "mc", prompt: "바빠___ 못 갔어요.", options: ["서", "니까요", "고", "면"], answers: ["서"], explanation: "Causa neutra → 바빠서." },
      { type: "mc", prompt: "피곤하___ 일찍 잤어요.", options: ["해서", "했어서", "하니", "하고"], answers: ["해서"], explanation: "하다 → 해서 (피곤해서)." },
    ],
  },
  {
    id: "ko:g:honorific",
    language: "ko",
    title: "Honoríficos: -(으)시- y verbos especiales",
    cefr: "B2",
    errorCategory: "ko:honorifics",
    summary: "Cuando el sujeto es alguien a quien respetas (mayores, clientes, profesores), el verbo lleva -(으)시-. Algunos verbos tienen una forma honorífica propia.",
    whenToUse: ["Hablar de padres, abuelos, jefes o clientes: 할머니께서 주무세요."],
    formation: [
      "Raíz + (으)세요 en presente: 가세요, 읽으세요.",
      "Pasado: -(으)셨어요: 가셨어요.",
      "Especiales: 먹다 → 드시다, 자다 → 주무시다, 있다 → 계시다, 말하다 → 말씀하시다.",
      "Partícula de sujeto honorífica: 께서.",
    ],
    commonMistakes: [
      { wrong: "할머니가 자요.", right: "할머니께서 주무세요.", why: "Con la abuela como sujeto: 주무시다 (y 께서)." },
      { wrong: "저는 가세요.", right: "저는 가요.", why: "Nunca se usa honorífico para uno mismo." },
    ],
    examples: [
      { text: "선생님께서 말씀하셨어요.", reading: "seonsaengnimkkeseo malsseumhasyeosseoyo.", translation: es("El profesor habló.") },
      { text: "아버지는 지금 집에 계세요.", reading: "abeojineun jigeum jibe gyeseyo.", translation: es("Mi padre está ahora en casa.") },
    ],
    contrasts: [{ a: "친구가 밥을 먹어요.", b: "할아버지께서 진지를 드세요.", explanation: "Mismo significado; el honorífico muestra respeto al sujeto." }],
    exercises: [
      { type: "mc", prompt: "할머니께서 방에서 ___.", options: ["주무세요", "자요", "자세요", "잤어요"], answers: ["주무세요"], explanation: "자다 → 주무시다 con sujetos respetados." },
      { type: "mc", prompt: "사장님은 사무실에 ___.", options: ["계세요", "있어요", "있으세요", "계셔"], answers: ["계세요"], explanation: "있다 (estar) → 계시다." },
      { type: "mc", prompt: "어머니가 책을 ___. (읽다)", options: ["읽으세요", "읽세요", "읽어요시", "읽으시어요"], answers: ["읽으세요"], explanation: "Consonante final + 으세요." },
      { type: "mc", prompt: "아버지께서 저녁을 ___. (comer, honorífico)", options: ["드세요", "먹으세요", "먹어요", "드어요"], answers: ["드세요"], explanation: "먹다 → 드시다." },
    ],
  },
  {
    id: "ko:g:reported",
    language: "ko",
    title: "Estilo indirecto: -다고 하다",
    cefr: "C1",
    errorCategory: "ko:reported-speech",
    summary: "Para contar lo que otra persona dijo se usa la forma llana del verbo + 고 하다. Es muy frecuente y su forma abreviada (-대요) domina en la conversación.",
    whenToUse: ["Transmitir afirmaciones, preguntas, órdenes y propuestas de otros."],
    formation: [
      "Verbo de acción: -ㄴ다고/-는다고 해요: 간다고 해요, 먹는다고 해요.",
      "Adjetivo: -다고 해요: 바쁘다고 해요.",
      "Pregunta: -냐고 해요 · Orden: -(으)라고 해요 · Propuesta: -자고 해요.",
      "Coloquial: 간대요, 바쁘대요, 가래요.",
    ],
    commonMistakes: [
      { wrong: "친구가 바쁜다고 했어요.", right: "친구가 바쁘다고 했어요.", why: "Con adjetivos va -다고 (sin -ㄴ-)." },
      { wrong: "엄마가 일찍 자다고 했어요.", right: "엄마가 일찍 자라고 했어요.", why: "Una orden se transmite con -(으)라고." },
    ],
    examples: [
      { text: "친구가 내일 온다고 했어요.", reading: "chinguga naeil ondago haesseoyo.", translation: es("Mi amigo dijo que viene mañana.") },
      { text: "선생님이 숙제를 하라고 하셨어요.", reading: "seonsaengnimi sukjereul harago hasyeosseoyo.", translation: es("El profesor dijo que hiciéramos la tarea.") },
    ],
    contrasts: [{ a: "간다고 했어요 (dijo que va)", b: "가라고 했어요 (dijo que fuera)", explanation: "Afirmación frente a orden." }],
    exercises: [
      { type: "mc", prompt: "민수가 오늘 ___ 했어요. (바쁘다)", options: ["바쁘다고", "바쁜다고", "바쁘라고", "바쁘자고"], answers: ["바쁘다고"], explanation: "Adjetivo → -다고." },
      { type: "mc", prompt: "지나가 영화를 ___ 했어요. (보자 — propuesta)", options: ["보자고", "본다고", "보라고", "보냐고"], answers: ["보자고"], explanation: "Propuesta → -자고." },
      { type: "mc", prompt: "의사가 약을 ___ 했어요. (먹어라 — orden)", options: ["먹으라고", "먹는다고", "먹자고", "먹냐고"], answers: ["먹으라고"], explanation: "Orden → -(으)라고." },
      { type: "mc", prompt: "친구가 서울에 ___ 했어요. (산다 — afirmación)", options: ["산다고", "살다고", "살라고", "사냐고"], answers: ["산다고"], explanation: "Verbo de acción → -ㄴ다고: 산다고." },
    ],
  },
];
