import type { GrammarConcept } from "../types";

/** Coreano: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const KO_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "ko:g:object-place",
    language: "ko",
    title: "Objeto y lugar: 을/를, 에 y 에서",
    cefr: "A1",
    errorCategory: "ko:particles-place",
    summary:
      "을 (tras consonante) / 를 (tras vocal) marcan el complemento directo: 커피를 마셔요. 에 indica destino, tiempo o lugar donde algo está (학교에 가요, 집에 있어요); 에서, el lugar donde ocurre una acción (도서관에서 공부해요).",
    whenToUse: ["Objeto: 밥을 먹어요.", "Destino: 서울에 가요.", "Lugar de la acción: 카페에서 친구를 만나요."],
    formation: ["Consonante + 을 · vocal + 를.", "에: a/en (destino, existencia, tiempo).", "에서: en (actividad) y desde."],
    commonMistakes: [
      { wrong: "학교에서 가요.", right: "학교에 가요.", why: "Destino de 가다 → 에." },
      { wrong: "식당에 밥을 먹어요.", right: "식당에서 밥을 먹어요.", why: "Lugar donde se hace algo → 에서." },
      { wrong: "책를 읽어요.", right: "책을 읽어요.", why: "책 acaba en consonante → 을." },
    ],
    examples: [
      { text: "저는 아침에 빵을 먹어요.", translation: es("Por la mañana como pan.") },
      { text: "공원에서 운동해요.", translation: es("Hago ejercicio en el parque.") },
    ],
    contrasts: [{ a: "집에 있어요.", b: "집에서 쉬어요.", explanation: "Estar en casa (에) / descansar en casa (에서, acción)." }],
    exercises: [
      { type: "mc", prompt: "사과＿ 좋아해요.", options: ["를", "을", "에", "에서"], answers: ["를"], explanation: "사과 acaba en vocal → 를." },
      { type: "mc", prompt: "도서관＿ 책을 읽어요.", options: ["에서", "에", "를", "가"], answers: ["에서"], explanation: "Acción en un lugar → 에서." },
      { type: "fill", prompt: "내일 부산＿ 가요.", answers: ["에"], explanation: "Destino → 에." },
      { type: "correct", prompt: "회사에서 가요.", answers: ["회사에 가요."], explanation: "Destino → 에." },
    ],
  },
  {
    id: "ko:g:numbers",
    language: "ko",
    title: "Dos sistemas de números: 하나, 둘… y 일, 이…",
    cefr: "A1",
    errorCategory: "ko:numbers",
    summary:
      "Los números nativos (하나, 둘, 셋, 넷…) cuentan cosas y personas y dicen la hora y la edad; los sino-coreanos (일, 이, 삼, 사…) sirven para minutos, fechas, dinero, teléfonos y pisos. Ante contador, 하나-넷 se acortan: 한 개, 두 명, 세 시, 네 살.",
    whenToUse: ["Horas: 세 시 (nativo) 삼십 분 (sino).", "Precios: 만 원.", "Edad: 스무 살."],
    formation: ["Nativos: 한, 두, 세, 네, 다섯… + 개/명/살/시.", "Sino-coreanos: 일, 이, 삼… + 분/원/월/일/층."],
    commonMistakes: [
      { wrong: "삼 시", right: "세 시", why: "La hora usa números nativos." },
      { wrong: "하나 명", right: "한 명", why: "Ante contador, 하나 → 한." },
    ],
    examples: [
      { text: "지금 두 시 십오 분이에요.", translation: es("Son las dos y quince.") },
      { text: "커피 한 잔 주세요.", translation: es("Un café, por favor.") },
    ],
    contrasts: [{ a: "세 시 (las tres)", b: "삼 분 (tres minutos)", explanation: "Hora con nativos, minutos con sino-coreanos." }],
    exercises: [
      { type: "mc", prompt: "사과 ＿ 개 주세요. (dos)", options: ["두", "둘", "이", "두번"], answers: ["두"], explanation: "Ante contador: 둘 → 두." },
      { type: "mc", prompt: "이 책은 ＿ 원이에요. (10.000)", options: ["만", "열천", "하나만", "십천"], answers: ["만"], explanation: "Dinero con sino-coreano: 만 = 10.000." },
      { type: "fill", prompt: "＿ 시에 만나요. (a las tres)", answers: ["세"], explanation: "Hora → nativo: 세 시." },
      { type: "correct", prompt: "학생이 하나 명 있어요.", answers: ["학생이 한 명 있어요."], explanation: "하나 → 한 ante 명." },
    ],
  },
  {
    id: "ko:g:future",
    language: "ko",
    title: "Futuro: -(으)ㄹ 거예요",
    cefr: "A2",
    errorCategory: "ko:future",
    summary:
      "Para planes y predicciones: raíz + ㄹ 거예요 (tras vocal) o 을 거예요 (tras consonante): 갈 거예요, 먹을 거예요. Con raíz en ㄹ sólo se añade 거예요: 살 거예요.",
    whenToUse: ["Planes: 주말에 뭐 할 거예요?", "Predicción: 내일 비가 올 거예요."],
    formation: ["Vocal → -ㄹ 거예요 (보다 → 볼 거예요).", "Consonante → -을 거예요 (읽다 → 읽을 거예요).", "Negativa: 안 + futuro: 안 갈 거예요."],
    commonMistakes: [
      { wrong: "먹ㄹ 거예요", right: "먹을 거예요", why: "Tras consonante → 을." },
      { wrong: "내일 가요 거예요.", right: "내일 갈 거예요.", why: "Se une a la raíz, no a la forma 가요." },
    ],
    examples: [
      { text: "다음 달에 한국에 갈 거예요.", translation: es("El mes que viene voy a ir a Corea.") },
      { text: "오늘은 집에서 쉴 거예요.", translation: es("Hoy voy a descansar en casa.") },
    ],
    contrasts: [{ a: "가요 (voy / iré, contexto)", b: "갈 거예요 (voy a ir)", explanation: "El presente puede tener valor de futuro; 거예요 lo marca claramente." }],
    exercises: [
      { type: "mc", prompt: "저녁에 영화를 ＿. (보다)", options: ["볼 거예요", "보을 거예요", "봐요 거예요", "보ㄹ 거예요"], answers: ["볼 거예요"], explanation: "Vocal → 볼 거예요." },
      { type: "mc", prompt: "내일 김치를 ＿. (먹다)", options: ["먹을 거예요", "먹ㄹ 거예요", "먹어 거예요", "먹어요"], answers: ["먹을 거예요"], explanation: "Consonante → 먹을." },
      { type: "fill", prompt: "비가 올 ＿. (terminación de futuro)", answers: ["거예요"], explanation: "올 거예요." },
      { type: "correct", prompt: "주말에 책을 읽ㄹ 거예요.", answers: ["주말에 책을 읽을 거예요."], explanation: "Consonante → 읽을." },
    ],
  },
  {
    id: "ko:g:progressive",
    language: "ko",
    title: "Estar haciendo: -고 있다",
    cefr: "A2",
    errorCategory: "ko:progressive",
    summary: "Raíz + 고 있어요 expresa una acción en curso: 지금 공부하고 있어요 (estoy estudiando). En forma honorífica: -고 계세요.",
    whenToUse: ["Ahora mismo: 뭐 하고 있어요?", "Situación temporal: 요즘 한국어를 배우고 있어요."],
    formation: ["Raíz + 고 있어요 / 있었어요 (pasado).", "Honorífico: -고 계세요."],
    commonMistakes: [
      { wrong: "먹어고 있어요", right: "먹고 있어요", why: "Se une a la raíz: 먹 + 고." },
      { wrong: "할머니가 주무시고 있어요.", right: "할머니가 주무시고 계세요.", why: "Con honorífico → 계세요." },
    ],
    examples: [
      { text: "지금 친구를 기다리고 있어요.", translation: es("Ahora estoy esperando a un amigo.") },
      { text: "비가 오고 있어요.", translation: es("Está lloviendo.") },
    ],
    contrasts: [{ a: "공부해요.", b: "공부하고 있어요.", explanation: "Estudio (en general) / estoy estudiando ahora." }],
    exercises: [
      { type: "mc", prompt: "지금 뭐 ＿? (hacer)", options: ["하고 있어요", "해고 있어요", "하는 있어요", "해요 있어요"], answers: ["하고 있어요"], explanation: "하 + 고 있어요." },
      { type: "mc", prompt: "아이가 ＿. (자다, ahora)", options: ["자고 있어요", "자어 있어요", "잤고 있어요", "자요 있어요"], answers: ["자고 있어요"], explanation: "자 + 고 있어요." },
      { type: "fill", prompt: "선생님이 전화하고 ＿. (honorífico)", answers: ["계세요"], explanation: "Honorífico → 계세요." },
      { type: "correct", prompt: "음악을 들어고 있어요.", answers: ["음악을 듣고 있어요."], explanation: "Raíz 듣 + 고." },
    ],
  },
  {
    id: "ko:g:go-jiman",
    language: "ko",
    title: "Unir frases: -고 (y) y -지만 (pero)",
    cefr: "A2",
    errorCategory: "ko:connectors",
    summary: "Raíz + 고 une acciones o cualidades (싸고 맛있어요, barato y rico). Raíz + 지만 contrasta (비싸지만 좋아요, caro pero bueno). El tiempo verbal se marca normalmente sólo al final.",
    whenToUse: ["Enumerar: 밥을 먹고 커피를 마셔요.", "Contrastar: 한국어는 어렵지만 재미있어요."],
    formation: ["Raíz + 고 / 지만.", "Pasado con 지만: 갔지만 (fui, pero…)."],
    commonMistakes: [
      { wrong: "맛있어요고 싸요.", right: "맛있고 싸요.", why: "Se une a la raíz." },
      { wrong: "어려워지만 재미있어요.", right: "어렵지만 재미있어요.", why: "Raíz 어렵 + 지만." },
    ],
    examples: [
      { text: "이 식당은 깨끗하고 친절해요.", translation: es("Este restaurante es limpio y amable.") },
      { text: "피곤하지만 운동하러 가요.", translation: es("Estoy cansado, pero voy a hacer ejercicio.") },
    ],
    contrasts: [{ a: "싸고 좋아요.", b: "싸지만 안 좋아요.", explanation: "Barato y bueno / barato pero no bueno." }],
    exercises: [
      { type: "mc", prompt: "이 옷은 예쁘＿ 비싸요.", options: ["지만", "고요", "어서", "면"], answers: ["지만"], explanation: "Contraste → 지만." },
      { type: "mc", prompt: "샤워하＿ 자요.", options: ["고", "지만", "면서요", "은"], answers: ["고"], explanation: "Secuencia → 고." },
      { type: "fill", prompt: "한국어는 어렵＿ 재미있어요.", answers: ["지만"], explanation: "Pero → 지만." },
      { type: "correct", prompt: "날씨가 좋아요고 따뜻해요.", answers: ["날씨가 좋고 따뜻해요."], explanation: "Raíz 좋 + 고." },
    ],
  },
  {
    id: "ko:g:conditional",
    language: "ko",
    title: "Condicional: -(으)면",
    cefr: "B1",
    errorCategory: "ko:conditional",
    summary: "Raíz + 면 (vocal o ㄹ) / 으면 (consonante) equivale a «si» o «cuando»: 시간이 있으면 갈게요. Para hipótesis poco probables se refuerza con 만약: 만약 복권에 당첨되면…",
    whenToUse: ["Condición: 비가 오면 집에 있을 거예요.", "Consejo: 피곤하면 쉬세요."],
    formation: ["Vocal/ㄹ → 면 (가면, 살면).", "Consonante → 으면 (먹으면, 있으면).", "Irregulares ㅂ/ㄷ: 추우면, 들으면."],
    commonMistakes: [
      { wrong: "시간이 있면", right: "시간이 있으면", why: "Consonante → 으면." },
      { wrong: "추워면", right: "추우면", why: "ㅂ irregular: 춥 → 추우면." },
    ],
    examples: [
      { text: "모르면 물어보세요.", translation: es("Si no lo sabes, pregunta.") },
      { text: "한국에 가면 뭐 하고 싶어요?", translation: es("¿Qué quieres hacer cuando vayas a Corea?") },
    ],
    contrasts: [{ a: "가면 (si voy)", b: "가서 (voy y…)", explanation: "Condición frente a secuencia." }],
    exercises: [
      { type: "mc", prompt: "배가 고프＿ 이거 드세요.", options: ["면", "으면", "고", "지만"], answers: ["면"], explanation: "Vocal → 면." },
      { type: "mc", prompt: "돈이 많＿ 여행하고 싶어요.", options: ["으면", "면", "고", "어서"], answers: ["으면"], explanation: "Consonante → 으면." },
      { type: "fill", prompt: "날씨가 추＿ 집에 있어요. (춥다)", answers: ["우면"], explanation: "ㅂ irregular → 추우면." },
      { type: "correct", prompt: "시간이 있면 전화하세요.", answers: ["시간이 있으면 전화하세요."], explanation: "있 + 으면." },
    ],
  },
  {
    id: "ko:g:modifiers",
    language: "ko",
    title: "Modificar sustantivos: -는, -(으)ㄴ, -(으)ㄹ",
    cefr: "B2",
    errorCategory: "ko:modifiers",
    summary:
      "El coreano no tiene «que» relativo: el verbo se pone delante del nombre con una terminación según el tiempo. Presente -는 (읽는 책, el libro que leo), pasado -(으)ㄴ (읽은 책, que leí), futuro -(으)ㄹ (읽을 책, que leeré). Los adjetivos en presente usan -(으)ㄴ: 예쁜 꽃.",
    whenToUse: ["Describir: 제가 좋아하는 음식.", "Planes: 내일 만날 사람."],
    formation: ["Verbo presente: raíz + 는.", "Verbo pasado / adjetivo presente: raíz + (으)ㄴ.", "Futuro: raíz + (으)ㄹ."],
    commonMistakes: [
      { wrong: "예쁘는 꽃", right: "예쁜 꽃", why: "Adjetivo → -(으)ㄴ." },
      { wrong: "어제 보는 영화", right: "어제 본 영화", why: "Pasado → -(으)ㄴ." },
    ],
    examples: [
      { text: "제가 사는 동네는 조용해요.", translation: es("El barrio donde vivo es tranquilo.") },
      { text: "어제 먹은 비빔밥이 맛있었어요.", translation: es("El bibimbap que comí ayer estaba rico.") },
    ],
    contrasts: [{ a: "읽는 책", b: "읽은 책", explanation: "El libro que leo / que leí." }],
    exercises: [
      { type: "mc", prompt: "지금 ＿ 노래가 뭐예요? (듣다, presente)", options: ["듣는", "들은", "들을", "듣은"], answers: ["듣는"], explanation: "Presente de verbo → 는." },
      { type: "mc", prompt: "작년에 ＿ 곳이 어디예요? (가다, pasado)", options: ["간", "가는", "갈", "가은"], answers: ["간"], explanation: "Pasado → ㄴ." },
      { type: "fill", prompt: "내일 만＿ 친구 (만나다, futuro)", answers: ["날"], explanation: "만나 + ㄹ → 만날." },
      { type: "correct", prompt: "크는 집에서 살아요.", answers: ["큰 집에서 살아요."], explanation: "Adjetivo → 큰." },
    ],
  },
  {
    id: "ko:g:geot-gatda",
    language: "ko",
    title: "Parece que: -는/-(으)ㄴ 것 같다",
    cefr: "C1",
    errorCategory: "ko:seems",
    summary:
      "Modificador + 것 같아요 expresa suposición o suaviza una opinión: 비가 오는 것 같아요 (parece que llueve), 좋은 것 같아요 (me parece bueno). Muy usado para no sonar tajante.",
    whenToUse: ["Suposición: 사람이 많은 것 같아요.", "Opinión cortés: 그게 더 나은 것 같아요."],
    formation: ["Verbo presente: -는 것 같다 · pasado: -(으)ㄴ 것 같다 · futuro: -(으)ㄹ 것 같다.", "Adjetivo: -(으)ㄴ 것 같다."],
    commonMistakes: [
      { wrong: "비가 오요 것 같아요.", right: "비가 오는 것 같아요.", why: "Se usa la forma modificadora -는." },
      { wrong: "맛있는 것 같아요 (de algo que aún no probaste, por su aspecto)", right: "맛있을 것 같아요.", why: "Suposición sobre algo no comprobado → -(으)ㄹ." },
    ],
    examples: [
      { text: "그 사람은 한국 사람인 것 같아요.", translation: es("Parece que esa persona es coreana.") },
      { text: "내일은 더울 것 같아요.", translation: es("Parece que mañana hará calor.") },
    ],
    contrasts: [{ a: "좋아요.", b: "좋은 것 같아요.", explanation: "Directo frente a más suave y cortés." }],
    exercises: [
      { type: "mc", prompt: "밖에 비가 ＿ 것 같아요. (오다, ahora)", options: ["오는", "온", "올", "와요"], answers: ["오는"], explanation: "Presente → 오는." },
      { type: "mc", prompt: "이 영화는 재미있＿ 것 같아요. (antes de verla)", options: ["을", "는", "은", "어"], answers: ["을"], explanation: "Suposición futura → 을." },
      { type: "fill", prompt: "그 사람 벌써 떠난 것 ＿. (parece)", answers: ["같아요"], explanation: "것 같아요." },
      { type: "correct", prompt: "피곤해요 것 같아요.", answers: ["피곤한 것 같아요."], explanation: "Adjetivo → 피곤한." },
    ],
  },
];
