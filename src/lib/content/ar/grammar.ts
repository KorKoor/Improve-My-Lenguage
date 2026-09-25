import type { GrammarConcept } from "../types";

/**
 * Árabe estándar moderno (فصحى): programa A1 → C1.
 * Las transliteraciones son orientativas. Revisión humana recomendada.
 */
const es = (t: string) => ({ es: t });

export const AR_GRAMMAR: GrammarConcept[] = [
  {
    id: "ar:g:article",
    language: "ar",
    title: "El artículo ال y las letras solares",
    cefr: "A1",
    errorCategory: "ar:article",
    summary:
      "El árabe tiene un solo artículo definido, ال (al-), que se escribe pegado a la palabra y sirve para masculino, femenino y plural. No hay artículo indefinido: كتاب = un libro. Ante las «letras solares» la ل no se pronuncia y la consonante se duplica.",
    whenToUse: ["Definido: الكتاب (el libro). Indefinido: كتاب (un libro)."],
    formation: [
      "ال + palabra: بيت → البيت (al-bayt).",
      "Letras lunares (ل se pronuncia): القمر al-qamar, الباب al-bāb.",
      "Letras solares (ل muda): الشمس ash-shams, النور an-nūr, الرجل ar-rajul.",
    ],
    commonMistakes: [
      { wrong: "ال كتاب", right: "الكتاب", why: "El artículo se escribe unido a la palabra." },
      { wrong: "al-shams (pronunciado con l)", right: "ash-shams", why: "ش es solar: la l se asimila." },
    ],
    examples: [
      { text: "الكتاب على الطاولة.", reading: "al-kitābu ʿalā ṭ-ṭāwila.", translation: es("El libro está sobre la mesa.") },
      { text: "هذا بيت كبير.", reading: "hādhā baytun kabīr.", translation: es("Esta es una casa grande.") },
    ],
    contrasts: [{ a: "كتاب (un libro)", b: "الكتاب (el libro)", explanation: "La ausencia de ال ya indica «un»." }],
    exercises: [
      { type: "mc", prompt: "«el libro» = ___", options: ["الكتاب", "كتاب", "ال كتاب", "كتابال"], answers: ["الكتاب"], explanation: "ال unido a la palabra." },
      { type: "mc", prompt: "«una casa» = ___", options: ["بيت", "البيت", "ال بيت", "بيتال"], answers: ["بيت"], explanation: "Sin artículo = indefinido." },
      { type: "mc", prompt: "¿Cómo se pronuncia الشمس?", options: ["ash-shams", "al-shams", "a-shams", "al-ashams"], answers: ["ash-shams"], explanation: "ش es letra solar." },
      { type: "mc", prompt: "¿Cómo se pronuncia القمر?", options: ["al-qamar", "aq-qamar", "a-qamar", "qamar-al"], answers: ["al-qamar"], explanation: "ق es letra lunar: la l se oye." },
    ],
  },
  {
    id: "ar:g:nominal-sentence",
    language: "ar",
    title: "La frase nominal: sin verbo «ser» en presente",
    cefr: "A1",
    errorCategory: "ar:nominal-sentence",
    summary: "En presente, el árabe une sujeto y predicado sin verbo: «أنا طالب» = «(yo) soy estudiante». El sujeto suele ser definido y el predicado indefinido.",
    whenToUse: ["Describir o identificar en presente: البيت كبير (la casa es grande)."],
    formation: ["Sujeto (definido) + predicado (indefinido): الجو جميل.", "Pronombres: أنا (yo), أنتَ (tú, m), أنتِ (tú, f), هو (él), هي (ella), نحن (nosotros)."],
    commonMistakes: [
      { wrong: "البيت الكبير. (= la casa grande)", right: "البيت كبير. (= la casa es grande)", why: "Si el adjetivo lleva ال es un sintagma, no una frase: falta el «es»." },
      { wrong: "أنا يكون طالب.", right: "أنا طالب.", why: "En presente no se usa verbo copulativo." },
    ],
    examples: [
      { text: "أنا من المكسيك.", reading: "anā min al-miksīk.", translation: es("Soy de México.") },
      { text: "الطقس حار اليوم.", reading: "aṭ-ṭaqsu ḥārrun al-yawm.", translation: es("Hoy hace calor.") },
    ],
    contrasts: [{ a: "الولد الطويل (el chico alto)", b: "الولد طويل (el chico es alto)", explanation: "La presencia o ausencia de ال en el adjetivo cambia todo." }],
    exercises: [
      { type: "mc", prompt: "«La casa es grande» = ___", options: ["البيت كبير", "البيت الكبير", "بيت الكبير", "كبير البيت ال"], answers: ["البيت كبير"], explanation: "Sujeto definido + predicado indefinido." },
      { type: "mc", prompt: "«Soy estudiante» = أنا ___", options: ["طالب", "الطالب", "يكون طالب", "كان طالب"], answers: ["طالب"], explanation: "Sin verbo en presente." },
      { type: "mc", prompt: "«ella» = ___", options: ["هي", "هو", "أنتِ", "نحن"], answers: ["هي"], explanation: "هي = ella." },
      { type: "mc", prompt: "«el coche nuevo» (no frase) = ___", options: ["السيارة الجديدة", "السيارة جديدة", "سيارة الجديدة", "جديدة السيارة"], answers: ["السيارة الجديدة"], explanation: "Sustantivo y adjetivo ambos con ال." },
    ],
  },
  {
    id: "ar:g:feminine",
    language: "ar",
    title: "Género: el femenino con ة",
    cefr: "A2",
    errorCategory: "ar:gender",
    summary: "La mayoría de femeninos terminan en ة (tāʾ marbūṭa). Los adjetivos concuerdan: si el sustantivo es femenino, el adjetivo añade ة.",
    whenToUse: ["Concordancia de adjetivos y verbos con el sujeto."],
    formation: ["طالب → طالبة (estudiante m/f), كبير → كبيرة.", "Algunos femeninos no llevan ة: شمس (sol), أم (madre).", "Plurales de cosas concuerdan en femenino singular: الكتب جديدة."],
    commonMistakes: [
      { wrong: "السيارة جديد.", right: "السيارة جديدة.", why: "سيارة es femenino: el adjetivo lleva ة." },
      { wrong: "هي طالب.", right: "هي طالبة.", why: "Sujeto femenino → forma femenina." },
    ],
    examples: [
      { text: "أختي طبيبة.", reading: "ukhtī ṭabība.", translation: es("Mi hermana es médica.") },
      { text: "المدينة جميلة جدًا.", reading: "al-madīnatu jamīlatun jiddan.", translation: es("La ciudad es muy bonita.") },
    ],
    contrasts: [{ a: "مدرّس (profesor)", b: "مدرّسة (profesora / escuela)", explanation: "ة convierte a femenino." }],
    exercises: [
      { type: "mc", prompt: "المدينة ___. (grande)", options: ["كبيرة", "كبير", "الكبير", "كبار"], answers: ["كبيرة"], explanation: "مدينة es femenino." },
      { type: "mc", prompt: "«profesora» = ___", options: ["مدرّسة", "مدرّس", "مدرّسون", "مدرّسات"], answers: ["مدرّسة"], explanation: "Femenino con ة." },
      { type: "mc", prompt: "هي ___. (estudiante)", options: ["طالبة", "طالب", "طلاب", "الطالب"], answers: ["طالبة"], explanation: "Concordancia femenina." },
      { type: "mc", prompt: "الكتب ___. (nuevos — plural de cosas)", options: ["جديدة", "جديد", "جدد", "الجديدون"], answers: ["جديدة"], explanation: "Plural no humano → femenino singular." },
    ],
  },
  {
    id: "ar:g:possessive-suffixes",
    language: "ar",
    title: "Pronombres posesivos pegados: كتابي, كتابك…",
    cefr: "A2",
    errorCategory: "ar:pronoun-suffixes",
    summary: "Los posesivos son sufijos: كتاب + ي = كتابي (mi libro). Una palabra con posesivo ya es definida, así que no lleva ال.",
    whenToUse: ["Posesión: بيتي, سيارتك.", "Los mismos sufijos sirven de objeto con verbos y preposiciones: معي (conmigo)."],
    formation: [
      "ـي (mi) · ـكَ (tu, m) · ـكِ (tu, f) · ـه (su, de él) · ـها (su, de ella) · ـنا (nuestro) · ـهم (su, de ellos).",
      "Con ة, esta se convierte en ت: سيارة → سيارتي.",
    ],
    commonMistakes: [
      { wrong: "الكتابي", right: "كتابي", why: "Con sufijo posesivo no se usa ال." },
      { wrong: "سيارةي", right: "سيارتي", why: "ة se vuelve ت ante sufijo." },
    ],
    examples: [
      { text: "هذا هاتفي.", reading: "hādhā hātifī.", translation: es("Este es mi teléfono.") },
      { text: "بيتنا قريب من هنا.", reading: "baytunā qarībun min hunā.", translation: es("Nuestra casa está cerca de aquí.") },
    ],
    contrasts: [{ a: "بيته (su casa — de él)", b: "بيتها (su casa — de ella)", explanation: "El árabe distingue el poseedor por género." }],
    exercises: [
      { type: "mc", prompt: "«mi libro» = ___", options: ["كتابي", "الكتابي", "كتابك", "كتابه"], answers: ["كتابي"], explanation: "ـي = mi." },
      { type: "mc", prompt: "«su coche (de ella)» = ___", options: ["سيارتها", "سيارته", "سيارةها", "السيارتها"], answers: ["سيارتها"], explanation: "ة → ت + ها." },
      { type: "mc", prompt: "«nuestra casa» = ___", options: ["بيتنا", "بيتهم", "البيتنا", "بيتي"], answers: ["بيتنا"], explanation: "ـنا = nuestro." },
      { type: "mc", prompt: "«conmigo» = مع___", options: ["ي", "ك", "ه", "نا"], answers: ["ي"], explanation: "معي." },
    ],
  },
  {
    id: "ar:g:present",
    language: "ar",
    title: "El presente (المضارع)",
    cefr: "B1",
    errorCategory: "ar:present",
    summary: "El presente se forma con prefijos (y a veces sufijos) sobre la raíz: يكتب (él escribe), تكتب (ella escribe / tú escribes), أكتب (yo escribo), نكتب (nosotros).",
    whenToUse: ["Acciones presentes y habituales. Con سـ o سوف delante: futuro (سأكتب = escribiré)."],
    formation: ["أنا أَكتب · أنتَ تَكتب · أنتِ تَكتبين · هو يَكتب · هي تَكتب · نحن نَكتب · هم يَكتبون.", "Futuro: سـ + presente: سيذهب (irá).", "Negación: لا + presente: لا أعرف (no sé)."],
    commonMistakes: [
      { wrong: "أنا يكتب.", right: "أنا أكتب.", why: "Yo → prefijo أ." },
      { wrong: "هي يذهب.", right: "هي تذهب.", why: "Ella → prefijo ت." },
    ],
    examples: [
      { text: "أشرب القهوة كل صباح.", reading: "ashrabu l-qahwa kulla ṣabāḥ.", translation: es("Tomo café cada mañana.") },
      { text: "هل تتكلم العربية؟", reading: "hal tatakallamu l-ʿarabiyya?", translation: es("¿Hablas árabe?") },
    ],
    contrasts: [{ a: "يذهب (va)", b: "سيذهب (irá)", explanation: "سـ convierte el presente en futuro." }],
    exercises: [
      { type: "mc", prompt: "أنا ___ العربية. (estudiar: درس)", options: ["أدرس", "يدرس", "تدرس", "ندرس"], answers: ["أدرس"], explanation: "Yo → أ." },
      { type: "mc", prompt: "هي ___ في البنك. (trabajar: عمل)", options: ["تعمل", "يعمل", "أعمل", "يعملون"], answers: ["تعمل"], explanation: "Ella → ت." },
      { type: "mc", prompt: "نحن ___ إلى السوق. (ir: ذهب)", options: ["نذهب", "يذهب", "تذهب", "أذهب"], answers: ["نذهب"], explanation: "Nosotros → ن." },
      { type: "mc", prompt: "«No sé» = ___ أعرف", options: ["لا", "لم", "لن", "ما"], answers: ["لا"], explanation: "Negación del presente: لا." },
    ],
  },
  {
    id: "ar:g:past",
    language: "ar",
    title: "El pasado (الماضي)",
    cefr: "B1",
    errorCategory: "ar:past-tense",
    summary: "El pasado usa sufijos sobre la raíz: كتبَ (él escribió), كتبتُ (yo escribí), كتبنا (nosotros escribimos). Se niega con ما + pasado o con لم + presente.",
    whenToUse: ["Acciones terminadas en el pasado."],
    formation: ["هو كتبَ · هي كتبَتْ · أنا كتبْتُ · أنتَ كتبْتَ · نحن كتبْنا · هم كتبوا.", "Negación: ما ذهبتُ / لم أذهب (no fui)."],
    commonMistakes: [
      { wrong: "أنا ذهب أمس.", right: "أنا ذهبتُ أمس.", why: "Yo en pasado → ـتُ." },
      { wrong: "لم ذهبتُ.", right: "لم أذهب.", why: "لم va con el presente (forma apocopada)." },
    ],
    examples: [
      { text: "سافرنا إلى القاهرة الصيف الماضي.", reading: "sāfarnā ilā l-qāhira aṣ-ṣayfa l-māḍī.", translation: es("Viajamos a El Cairo el verano pasado.") },
      { text: "لم أفهم السؤال.", reading: "lam afham as-suʾāl.", translation: es("No entendí la pregunta.") },
    ],
    contrasts: [{ a: "كتبَ (escribió)", b: "يكتب (escribe)", explanation: "Pasado con sufijos; presente con prefijos." }],
    exercises: [
      { type: "mc", prompt: "أمس ___ فيلمًا. (yo vi: شاهد)", options: ["شاهدتُ", "شاهدَ", "أشاهد", "شاهدنا"], answers: ["شاهدتُ"], explanation: "Yo → ـتُ." },
      { type: "mc", prompt: "هي ___ إلى المدرسة. (fue: ذهب)", options: ["ذهبتْ", "ذهبَ", "ذهبوا", "تذهب"], answers: ["ذهبتْ"], explanation: "Ella → ـتْ." },
      { type: "mc", prompt: "«No fui» = لم ___", options: ["أذهب", "ذهبتُ", "ذهب", "يذهب"], answers: ["أذهب"], explanation: "لم + presente." },
      { type: "mc", prompt: "نحن ___ العشاء. (comimos: أكل)", options: ["أكلنا", "أكلوا", "نأكل", "أكلتُ"], answers: ["أكلنا"], explanation: "Nosotros → ـنا." },
    ],
  },
  {
    id: "ar:g:plurals-dual",
    language: "ar",
    title: "Dual y plurales rotos",
    cefr: "B2",
    errorCategory: "ar:plural",
    summary: "El árabe tiene dual (dos de algo) con ـان, plurales regulares (ـون masc., ـات fem.) y muchos «plurales rotos» que cambian la estructura interna de la palabra y hay que memorizar.",
    whenToUse: ["Dual: exactamente dos. Plural: tres o más."],
    formation: ["Dual: كتاب → كتابان (dos libros).", "Regular: مدرّس → مدرّسون · مدرّسة → مدرّسات.", "Rotos frecuentes: كتاب → كُتُب, ولد → أولاد, بيت → بيوت, رجل → رجال."],
    commonMistakes: [
      { wrong: "كتابات (libros)", right: "كتب", why: "كتاب tiene plural roto: كتب." },
      { wrong: "اثنان كتاب", right: "كتابان", why: "Para dos se usa el dual." },
    ],
    examples: [
      { text: "عندي أخوان.", reading: "ʿindī akhawān.", translation: es("Tengo dos hermanos.") },
      { text: "في المكتبة كتب كثيرة.", reading: "fī l-maktaba kutubun kathīra.", translation: es("En la biblioteca hay muchos libros.") },
    ],
    contrasts: [{ a: "بيتان (dos casas)", b: "بيوت (casas)", explanation: "Dual frente a plural roto." }],
    exercises: [
      { type: "mc", prompt: "«dos libros» = ___", options: ["كتابان", "كتب", "كتابات", "اثنان كتاب"], answers: ["كتابان"], explanation: "Dual: ـان." },
      { type: "mc", prompt: "Plural de ولد (niño): ___", options: ["أولاد", "ولدون", "ولدات", "ولدان"], answers: ["أولاد"], explanation: "Plural roto: أولاد." },
      { type: "mc", prompt: "Plural de مدرّسة (profesora): ___", options: ["مدرّسات", "مدرّسون", "مدارس", "مدرّستان"], answers: ["مدرّسات"], explanation: "Femenino regular: ـات." },
      { type: "mc", prompt: "Plural de بيت (casa): ___", options: ["بيوت", "بيتات", "بيتون", "أبيات"], answers: ["بيوت"], explanation: "Plural roto frecuente: بيوت." },
    ],
  },
  {
    id: "ar:g:kana-inna",
    language: "ar",
    title: "كان y إنّ: sus «hermanas» y el caso gramatical",
    cefr: "C1",
    errorCategory: "ar:kana-inna",
    summary: "كان (era/estaba) y sus hermanas (ليس, أصبح, ما زال…) ponen el predicado en acusativo; إنّ y sus hermanas (أنّ, لكنّ, لأنّ…) ponen el sujeto en acusativo. Se nota sobre todo en los adjetivos y en el dual/plural.",
    whenToUse: ["Frases nominales en pasado o negadas: كان الجو جميلاً, ليس الطالب موجودًا.", "Énfasis o subordinación: إنّ الطقسَ جميل, أعرف أنّ الدرسَ صعب."],
    formation: ["كان + sujeto (nominativo) + predicado (acusativo -an): كان المعلمُ مشغولاً.", "إنّ + sujeto (acusativo) + predicado (nominativo): إنّ المعلمَ مشغولٌ.", "Hermanas de كان: ليس, أصبح, صار, ما زال, ظلّ · de إنّ: أنّ, لكنّ, لأنّ, لعلّ, كأنّ."],
    commonMistakes: [
      { wrong: "كان الجو جميلٌ.", right: "كان الجو جميلاً.", why: "El predicado de كان va en acusativo." },
      { wrong: "إنّ الطالبُ مجتهدٌ.", right: "إنّ الطالبَ مجتهدٌ.", why: "El sujeto de إنّ va en acusativo." },
    ],
    examples: [
      { text: "كان الطقس باردًا أمس.", reading: "kāna ṭ-ṭaqsu bāridan ams.", translation: es("Ayer hacía frío.") },
      { text: "أعرف أنّ الامتحان صعب.", reading: "aʿrifu anna l-imtiḥāna ṣaʿb.", translation: es("Sé que el examen es difícil.") },
    ],
    contrasts: [{ a: "الجو جميلٌ (hace buen tiempo)", b: "كان الجو جميلاً (hacía buen tiempo)", explanation: "كان cambia el caso del predicado." }],
    exercises: [
      { type: "mc", prompt: "كان البيت ___. (grande)", options: ["كبيرًا", "كبيرٌ", "الكبير", "كبيرة"], answers: ["كبيرًا"], explanation: "Predicado de كان → acusativo -an." },
      { type: "mc", prompt: "ليس الطالب ___. (presente)", options: ["موجودًا", "موجودٌ", "الموجود", "موجودين"], answers: ["موجودًا"], explanation: "ليس es hermana de كان." },
      { type: "mc", prompt: "إنّ ___ جميلة. (la ciudad)", options: ["المدينةَ", "المدينةُ", "مدينةٌ", "المدينةِ"], answers: ["المدينةَ"], explanation: "Sujeto de إنّ → acusativo." },
      { type: "mc", prompt: "«Sé que…» = أعرف ___ الدرسَ مهم", options: ["أنّ", "إنّ", "كان", "ليس"], answers: ["أنّ"], explanation: "Tras verbos como «saber»: أنّ." },
    ],
  },
];
