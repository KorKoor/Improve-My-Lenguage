import type { GrammarConcept } from "../types";

/** Árabe estándar moderno: temas que completan el programa A1 → C1 para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const AR_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "ar:g:future",
    language: "ar",
    title: "Futuro: سـ y سوف + presente",
    cefr: "A1",
    errorCategory: "ar:future",
    summary:
      "El futuro se forma añadiendo سـ (pegado) o سوف (separado) delante del presente: سأذهب / سوف أذهب (iré). سـ suele indicar un futuro cercano; سوف, algo más lejano o enfático. La negación del futuro es لن + subjuntivo: لن أذهب.",
    whenToUse: ["Planes: سأسافر غداً.", "Promesas: سوف أتصل بك."],
    formation: ["سـ + presente: سنأكل (comeremos).", "سوف + presente: سوف تفهم.", "Negación: لن + presente subjuntivo (لن يذهبَ)."],
    commonMistakes: [
      { wrong: "سذهبت", right: "سأذهب", why: "سـ va con el presente, nunca con el pasado." },
      { wrong: "لا سأذهب", right: "لن أذهب", why: "El futuro se niega con لن." },
    ],
    examples: [
      { text: "سأزور أمي يوم الجمعة.", translation: es("Visitaré a mi madre el viernes.") },
      { text: "لن أنسى هذا اليوم.", translation: es("No olvidaré este día.") },
    ],
    contrasts: [{ a: "أذهب (voy)", b: "سأذهب (iré)", explanation: "Presente frente a futuro con سـ." }],
    exercises: [
      { type: "mc", prompt: "غداً ___ إلى المدرسة. (iré)", options: ["سأذهب", "ذهبت", "أذهبت", "لن ذهب"], answers: ["سأذهب"], explanation: "سـ + presente." },
      { type: "mc", prompt: "___ أشرب القهوة اليوم. (no beberé)", options: ["لن", "لا", "لم", "ليس"], answers: ["لن"], explanation: "Negación del futuro → لن." },
      { type: "fill", prompt: "___ نسافر في الصيف. (partícula de futuro separada)", answers: ["سوف"], explanation: "سوف + presente." },
      { type: "correct", prompt: "لا سأعمل غداً.", answers: ["لن أعمل غداً.", "لن أعمل غدا."], explanation: "Futuro negativo → لن." },
    ],
  },
  {
    id: "ar:g:negation",
    language: "ar",
    title: "Negación: لا, ما, لم, لن, ليس",
    cefr: "A2",
    errorCategory: "ar:negation",
    summary:
      "Cada tiempo tiene su negación: لا + presente (لا أعرف), لم + presente apocopado para el pasado (لم أذهب = no fui), ما + pasado (ما ذهبت, más coloquial), لن + subjuntivo para el futuro, y ليس (que se conjuga: لستُ، ليسَ، ليستْ) para frases nominales.",
    whenToUse: ["No sé: لا أعرف.", "No fui: لم أذهب.", "No soy médico: لستُ طبيباً."],
    formation: ["Presente → لا.", "Pasado → لم + yusivo (formal) o ما + pasado.", "Futuro → لن.", "Frase nominal → ليس (concuerda con el sujeto)."],
    commonMistakes: [
      { wrong: "لا ذهبت أمس.", right: "لم أذهب أمس.", why: "El pasado se niega con لم (+ presente)." },
      { wrong: "أنا لا طالب.", right: "لستُ طالباً.", why: "Frase nominal → ليس conjugado." },
    ],
    examples: [
      { text: "لم أفهم السؤال.", translation: es("No entendí la pregunta.") },
      { text: "الجو ليس بارداً اليوم.", translation: es("Hoy no hace frío.") },
    ],
    contrasts: [{ a: "لا أكتب (no escribo)", b: "لم أكتب (no escribí)", explanation: "Misma forma del verbo; la partícula marca el tiempo." }],
    exercises: [
      { type: "mc", prompt: "أنا ___ أتكلم الصينية.", options: ["لا", "لم", "لن", "ليس"], answers: ["لا"], explanation: "Presente → لا." },
      { type: "mc", prompt: "هو ___ يأتِ أمس.", options: ["لم", "لا", "لن", "ليس"], answers: ["لم"], explanation: "Pasado → لم." },
      { type: "fill", prompt: "هي ___ مريضة. (no está enferma)", answers: ["ليست"], explanation: "Femenino → ليست." },
      { type: "correct", prompt: "أنا لا مدرس.", answers: ["لستُ مدرساً.", "لست مدرسا.", "لست مدرساً."], explanation: "Frase nominal → لستُ." },
    ],
  },
  {
    id: "ar:g:idafa",
    language: "ar",
    title: "La construcción iḍāfa (posesión): باب البيت",
    cefr: "A2",
    errorCategory: "ar:idafa",
    summary:
      "Para decir «la puerta de la casa» se juntan dos nombres: باب البيت. El primero NUNCA lleva ال (ni nunación) y el segundo va en genitivo. Si el primero acaba en ة, esta se pronuncia -t: مدينة → مدينةُ القاهرة (madīnat al-Qāhira).",
    whenToUse: ["Posesión: سيارة أبي (el coche de mi padre).", "Relaciones: جامعة القاهرة."],
    formation: ["Nombre 1 (sin ال) + nombre 2 (con ال o nombre propio / sufijo posesivo).", "Adjetivo del nombre 1 va al final y con ال: باب البيت الكبير."],
    commonMistakes: [
      { wrong: "الباب البيت", right: "باب البيت", why: "El primer término no lleva ال." },
      { wrong: "كتاب الطالب جديد (queriendo decir «el nuevo libro del alumno»)", right: "كتاب الطالب الجديد", why: "El adjetivo va al final, con ال." },
    ],
    examples: [
      { text: "هذا مكتب المدير.", translation: es("Esta es la oficina del director.") },
      { text: "أين محطة القطار؟", translation: es("¿Dónde está la estación de tren?") },
    ],
    contrasts: [{ a: "البيت الكبير (la casa grande)", b: "باب البيت (la puerta de la casa)", explanation: "Nombre + adjetivo (ambos con ال) / iḍāfa (sólo el segundo)." }],
    exercises: [
      { type: "mc", prompt: "هذه ___ المدرسة. (la puerta de)", options: ["باب", "الباب", "بابٌ", "للباب"], answers: ["باب"], explanation: "Primer término sin ال." },
      { type: "mc", prompt: "___ أحمد جديدة. (el coche de)", options: ["سيارة", "السيارة", "سيارةٌ", "بالسيارة"], answers: ["سيارة"], explanation: "Primer término sin ال." },
      { type: "fill", prompt: "جامعة ___ كبيرة. (Damasco: دمشق)", answers: ["دمشق"], explanation: "Nombre propio en segundo término." },
      { type: "correct", prompt: "الكتاب الطالب على الطاولة.", answers: ["كتاب الطالب على الطاولة."], explanation: "Primer término sin ال." },
    ],
  },
  {
    id: "ar:g:comparative",
    language: "ar",
    title: "Comparativo y superlativo: أكبر, الأكبر",
    cefr: "B1",
    errorCategory: "ar:comparative",
    summary:
      "Muchos adjetivos forman el comparativo con el patrón أفعل (كبير → أكبر, جميل → أجمل), invariable, seguido de من: أكبر من (más grande que). El superlativo es الأفعل o أفعل + nombre indefinido: أكبر مدينة (la ciudad más grande).",
    whenToUse: ["Comparar: القطار أسرع من الحافلة.", "Superlativo: هو أطول طالب في الصف."],
    formation: ["أفعل + من.", "Superlativo: أفعل + nombre indefinido, o الأفعل.", "Adjetivos largos: أكثر + sustantivo: أكثر جمالاً."],
    commonMistakes: [
      { wrong: "هي أكبرة من أختها.", right: "هي أكبر من أختها.", why: "أفعل no cambia en femenino al comparar." },
      { wrong: "القاهرة كبيرة من الإسكندرية.", right: "القاهرة أكبر من الإسكندرية.", why: "Se necesita la forma comparativa أكبر." },
    ],
    examples: [
      { text: "الصيف هنا أحرّ من الشتاء بكثير.", translation: es("Aquí el verano es mucho más caluroso que el invierno.") },
      { text: "هذا أجمل يوم في حياتي.", translation: es("Este es el día más bonito de mi vida.") },
    ],
    contrasts: [{ a: "أكبر من (más grande que)", b: "أكبر مدينة (la ciudad más grande)", explanation: "Con من compara; con nombre indefinido es superlativo." }],
    exercises: [
      { type: "mc", prompt: "أخي ___ مني. (mayor)", options: ["أكبر", "كبير", "أكبرة", "الأكبر من"], answers: ["أكبر"], explanation: "Comparativo → أكبر من." },
      { type: "mc", prompt: "هذه ___ غرفة في البيت. (la más pequeña)", options: ["أصغر", "صغيرة", "الأصغرة", "أصغرة"], answers: ["أصغر"], explanation: "أفعل + nombre indefinido = superlativo." },
      { type: "fill", prompt: "الطائرة أسرع ___ السيارة.", answers: ["من"], explanation: "أفعل + من." },
      { type: "correct", prompt: "سارة أطولة من ليلى.", answers: ["سارة أطول من ليلى."], explanation: "أفعل es invariable." },
    ],
  },
  {
    id: "ar:g:relative",
    language: "ar",
    title: "Relativos: الذي, التي, الذين",
    cefr: "B1",
    errorCategory: "ar:relative",
    summary:
      "El relativo concuerda con el antecedente definido: الذي (masc. sg.), التي (fem. sg. y plurales no humanos), الذين (masc. pl. humano), اللواتي/اللاتي (fem. pl.). Si el antecedente es indefinido, NO se usa relativo: رجل يعمل هنا (un hombre que trabaja aquí). A menudo se repite un pronombre de retorno: البيت الذي سكنتُ فيه.",
    whenToUse: ["Precisar: الكتاب الذي قرأته.", "Con indefinidos, sin relativo: عندي صديق يسكن في مدريد."],
    formation: ["Antecedente definido + relativo concordado + oración.", "Pronombre de retorno cuando el relativo es objeto o va con preposición: التي تحدثت عنها."],
    commonMistakes: [
      { wrong: "رأيت رجلاً الذي يعمل هنا.", right: "رأيت رجلاً يعمل هنا.", why: "Antecedente indefinido → sin relativo." },
      { wrong: "المدينة الذي أسكن فيها", right: "المدينة التي أسكن فيها", why: "Femenino → التي." },
    ],
    examples: [
      { text: "الطالبة التي فازت بالجائزة من المغرب.", translation: es("La estudiante que ganó el premio es de Marruecos.") },
      { text: "هؤلاء هم الأصدقاء الذين ساعدوني.", translation: es("Estos son los amigos que me ayudaron.") },
    ],
    contrasts: [{ a: "الرجل الذي يعمل هنا", b: "رجل يعمل هنا", explanation: "El hombre que… (definido) / un hombre que… (sin relativo)." }],
    exercises: [
      { type: "mc", prompt: "هذا هو الفيلم ___ شاهدته أمس.", options: ["الذي", "التي", "الذين", "من"], answers: ["الذي"], explanation: "Masculino singular → الذي." },
      { type: "mc", prompt: "السيارات ___ في الشارع جديدة.", options: ["التي", "الذين", "الذي", "اللواتي"], answers: ["التي"], explanation: "Plural no humano → التي." },
      { type: "fill", prompt: "المعلمون ___ يدرّسون هنا ممتازون.", answers: ["الذين"], explanation: "Plural masculino humano → الذين." },
      { type: "correct", prompt: "قرأت الرسالة الذي كتبتها.", answers: ["قرأت الرسالة التي كتبتها."], explanation: "رسالة es femenino → التي." },
    ],
  },
  {
    id: "ar:g:verb-forms",
    language: "ar",
    title: "Formas verbales derivadas: II, V, VIII y X",
    cefr: "C1",
    errorCategory: "ar:verb-forms",
    summary:
      "A partir de una raíz de tres consonantes se forman verbos con significados relacionados. Forma II (فعّل): intensivo o causativo (درس estudiar → درّس enseñar). Forma V (تفعّل): reflexiva de la II (تعلّم aprender). Forma VIII (افتعل): reflexiva o de acción para uno (اجتمع reunirse). Forma X (استفعل): pedir o considerar (استعمل usar, استقبل recibir).",
    whenToUse: ["Reconocer familias de palabras: علم (saber) → علّم (enseñar) → تعلّم (aprender) → استعلم (informarse).", "Deducir el significado de verbos nuevos en textos."],
    formation: [
      "II: duplicar la segunda consonante: كسر → كسّر.",
      "V: تـ + forma II: تكلّم.",
      "VIII: ا + 1.ª + ت + resto: اشتغل, اجتمع.",
      "X: است + raíz: استخدم, استفهم.",
    ],
    commonMistakes: [
      { wrong: "أنا أعلم العربية (queriendo decir «aprendo árabe»).", right: "أنا أتعلم العربية.", why: "Aprender → forma V تعلّم; علم es saber." },
      { wrong: "المعلم يدرس الطلاب (con sentido de «enseña»).", right: "المعلم يدرّس الطلاب.", why: "Enseñar → forma II درّس (con shadda)." },
    ],
    examples: [
      { text: "تعلّمت العربية في الجامعة.", translation: es("Aprendí árabe en la universidad.") },
      { text: "نستخدم الحاسوب كل يوم.", translation: es("Usamos el ordenador todos los días.") },
    ],
    contrasts: [{ a: "درس (estudió)", b: "درّس (enseñó)", explanation: "Forma I frente a forma II (causativa)." }],
    exercises: [
      { type: "mc", prompt: "«Aprender» (raíz ع ل م) es:", options: ["تعلّم", "علّم", "علم", "استعلم"], answers: ["تعلّم"], explanation: "Forma V: reflexiva de enseñar." },
      { type: "mc", prompt: "«Usar» (raíz خ د م) es:", options: ["استخدم", "خدّم", "تخدّم", "اخدم"], answers: ["استخدم"], explanation: "Forma X: استفعل." },
      { type: "fill", prompt: "المدير ___ الضيوف في المطار. (recibió: استقبل)", answers: ["استقبل"], explanation: "Forma X: استقبل." },
      { type: "correct", prompt: "أنا طالب وأعلم العربية في الجامعة.", answers: ["أنا طالب وأتعلم العربية في الجامعة."], explanation: "Un estudiante aprende → أتعلم." },
    ],
  },
];
