import type { GrammarConcept } from "../types";

/** Alemán: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const DE_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "de:g:trennbare-verben",
    language: "de",
    title: "Verbos separables: anfangen → Ich fange an",
    cefr: "A2",
    errorCategory: "de:separable",
    summary:
      "Muchos verbos llevan un prefijo que se separa y va al final de la frase en presente y pasado simple: aufstehen → Ich stehe um 7 Uhr auf. En el infinitivo y en las subordinadas se vuelven a unir.",
    whenToUse: ["Rutina diaria: aufstehen, einkaufen, fernsehen, anrufen.", "Planes: Wann kommst du an?"],
    formation: [
      "Presente: verbo conjugado en 2.ª posición + prefijo al final: Ich rufe dich morgen an.",
      "Perfekt: prefijo + ge + participio: angerufen, aufgestanden.",
      "Con modal: infinitivo unido al final: Ich muss früh aufstehen.",
    ],
    commonMistakes: [
      { wrong: "Ich anrufe dich morgen.", right: "Ich rufe dich morgen an.", why: "El prefijo an va al final." },
      { wrong: "Ich habe gerufen dich an.", right: "Ich habe dich angerufen.", why: "Participio completo al final: angerufen." },
    ],
    examples: [
      { text: "Der Film fängt um acht Uhr an.", translation: es("La película empieza a las ocho.") },
      { text: "Kannst du bitte das Fenster aufmachen?", translation: es("¿Puedes abrir la ventana, por favor?") },
    ],
    contrasts: [{ a: "Ich kaufe im Supermarkt ein.", b: "Ich muss noch einkaufen.", explanation: "Separado con verbo conjugado / unido en infinitivo." }],
    exercises: [
      { type: "mc", prompt: "Ich ___ jeden Tag um 6 Uhr ___.", options: ["stehe … auf", "aufstehe … –", "stehe auf … –", "auf … stehe"], answers: ["stehe … auf"], explanation: "Verbo en 2.ª posición, prefijo al final." },
      { type: "mc", prompt: "Wann kommt der Zug ___?", options: ["an", "zu", "ein", "aus"], answers: ["an"], explanation: "ankommen = llegar." },
      { type: "fill", prompt: "Ich habe dich gestern ___. (anrufen)", answers: ["angerufen"], explanation: "an + ge + rufen." },
      { type: "correct", prompt: "Wir einkaufen am Samstag.", answers: ["Wir kaufen am Samstag ein."], explanation: "El prefijo ein va al final." },
    ],
  },
  {
    id: "de:g:dativ-praepositionen",
    language: "de",
    title: "Preposiciones que siempre van con dativo",
    cefr: "A2",
    errorCategory: "de:dative-prep",
    summary:
      "aus, bei, mit, nach, seit, von y zu siempre rigen dativo: mit dem Bus, zu der (zur) Arbeit. Truco para recordarlas: se cantan con la melodía del Danubio azul.",
    whenToUse: ["Medios y compañía: mit meiner Mutter.", "Origen y destino: aus Spanien, zum Arzt."],
    formation: [
      "Dativo: dem (masc./neutro), der (fem.), den + -n (plural).",
      "Contracciones: zu dem → zum, zu der → zur, bei dem → beim, von dem → vom.",
    ],
    commonMistakes: [
      { wrong: "Ich fahre mit den Bus.", right: "Ich fahre mit dem Bus.", why: "Mit + dativo masculino → dem." },
      { wrong: "Ich gehe zu die Schule.", right: "Ich gehe zur Schule.", why: "Zu + dativo femenino → zur." },
    ],
    examples: [
      { text: "Ich komme aus Mexiko und wohne seit einem Jahr in Berlin.", translation: es("Soy de México y vivo en Berlín desde hace un año.") },
      { text: "Nach dem Essen gehen wir spazieren.", translation: es("Después de comer vamos a pasear.") },
    ],
    contrasts: [{ a: "Ich gehe zum Arzt.", b: "Ich bin beim Arzt.", explanation: "Dirección (zu) frente a estar en casa/consulta de alguien (bei)." }],
    exercises: [
      { type: "mc", prompt: "Er wohnt bei ___ Eltern.", options: ["seinen", "seine", "seiner", "sein"], answers: ["seinen"], explanation: "Dativo plural → seinen." },
      { type: "mc", prompt: "Ich fahre ___ Arbeit.", options: ["zur", "zum", "zu die", "nach die"], answers: ["zur"], explanation: "Die Arbeit (fem.) → zur." },
      { type: "fill", prompt: "Das Geschenk ist von ___ Freund. (mein)", answers: ["meinem"], explanation: "Von + dativo masc. → meinem." },
      { type: "correct", prompt: "Sie spricht mit der Kinder.", answers: ["Sie spricht mit den Kindern."], explanation: "Dativo plural: den Kindern." },
    ],
  },
  {
    id: "de:g:praeteritum",
    language: "de",
    title: "Präteritum de sein, haben y los modales",
    cefr: "A2",
    errorCategory: "de:praeteritum",
    summary:
      "En la conversación el pasado suele ir en Perfekt, pero sein, haben y los verbos modales se usan casi siempre en Präteritum: ich war, ich hatte, ich konnte, ich musste.",
    whenToUse: ["Contar el pasado de forma natural: Gestern war ich müde.", "Narraciones y textos escritos (con todos los verbos)."],
    formation: [
      "sein: war, warst, war, waren, wart, waren.",
      "haben: hatte, hattest, hatte, hatten, hattet, hatten.",
      "Modales sin Umlaut + -te: können → konnte, müssen → musste, wollen → wollte.",
    ],
    commonMistakes: [
      { wrong: "Ich habe müde gewesen.", right: "Ich war müde.", why: "Con sein se prefiere el Präteritum (y el Perfekt sería bin gewesen)." },
      { wrong: "Ich könnte nicht kommen (= no pude).", right: "Ich konnte nicht kommen.", why: "Könnte (con Umlaut) es condicional: «podría»." },
    ],
    examples: [
      { text: "Wir hatten keine Zeit.", translation: es("No teníamos tiempo.") },
      { text: "Als Kind wollte ich Pilot werden.", translation: es("De niño quería ser piloto.") },
    ],
    contrasts: [{ a: "Ich konnte schwimmen.", b: "Ich könnte schwimmen.", explanation: "Sabía/pude nadar frente a podría nadar." }],
    exercises: [
      { type: "mc", prompt: "Gestern ___ ich krank.", options: ["war", "bin", "hatte", "wäre"], answers: ["war"], explanation: "Pasado de sein → war." },
      { type: "mc", prompt: "Wir ___ leider arbeiten.", options: ["mussten", "müssten", "musste", "müssen"], answers: ["mussten"], explanation: "Wir + pasado de müssen → mussten." },
      { type: "fill", prompt: "Du ___ Glück! (haben, pasado)", answers: ["hattest"], explanation: "Du hattest." },
      { type: "correct", prompt: "Gestern ich war sehr müde.", answers: ["Gestern war ich sehr müde.", "Ich war gestern sehr müde."], explanation: "El verbo va en segunda posición: Gestern war ich…" },
    ],
  },
  {
    id: "de:g:komparativ",
    language: "de",
    title: "Comparativo y superlativo",
    cefr: "A2",
    errorCategory: "de:comparative",
    summary:
      "Se añade -er (schneller) y am -sten (am schnellsten). Muchos adjetivos cortos toman Umlaut: alt → älter, groß → größer. Irregulares: gut → besser → am besten, viel → mehr, gern → lieber.",
    whenToUse: ["Comparar: Berlin ist größer als München.", "Preferencias: Ich trinke lieber Tee."],
    formation: ["Comparativo + als: kleiner als.", "Igualdad: so … wie: so alt wie ich.", "Superlativo: am + -sten o der/die/das + -ste."],
    commonMistakes: [
      { wrong: "Er ist mehr alt als ich.", right: "Er ist älter als ich.", why: "No se usa mehr; -er con Umlaut." },
      { wrong: "Sie ist größer wie ich.", right: "Sie ist größer als ich.", why: "Comparativo + als (wie sólo con so … wie)." },
    ],
    examples: [
      { text: "Das ist das beste Restaurant der Stadt.", translation: es("Es el mejor restaurante de la ciudad.") },
      { text: "Ich fahre lieber mit dem Fahrrad.", translation: es("Prefiero ir en bici.") },
    ],
    contrasts: [{ a: "so groß wie", b: "größer als", explanation: "Igualdad frente a superioridad." }],
    exercises: [
      { type: "mc", prompt: "Mein Bruder ist ___ als ich.", options: ["jünger", "mehr jung", "junger", "am jüngsten"], answers: ["jünger"], explanation: "Jung → jünger." },
      { type: "mc", prompt: "Dieser Kaffee ist ___ als der andere.", options: ["besser", "guter", "mehr gut", "am besten"], answers: ["besser"], explanation: "Gut → besser." },
      { type: "fill", prompt: "Im Sommer ist es hier am ___. (warm)", answers: ["wärmsten"], explanation: "Warm → am wärmsten." },
      { type: "correct", prompt: "Anna ist größer wie Tom.", answers: ["Anna ist größer als Tom."], explanation: "Comparativo + als." },
    ],
  },
  {
    id: "de:g:nebensaetze",
    language: "de",
    title: "Subordinadas: weil, dass, wenn… (verbo al final)",
    cefr: "B1",
    errorCategory: "de:subordinate",
    summary:
      "En las subordinadas el verbo conjugado va al final: Ich lerne Deutsch, weil ich in Berlin arbeite. Si la subordinada va primero, la principal empieza por el verbo: Wenn es regnet, bleibe ich zu Hause.",
    whenToUse: ["Causas: weil · Contenido: dass · Condición/tiempo: wenn, als, ob."],
    formation: [
      "Conector + sujeto + … + verbo conjugado.",
      "Con separable: …, weil ich früh aufstehe.",
      "Subordinada delante → verbo de la principal justo después de la coma.",
    ],
    commonMistakes: [
      { wrong: "…, weil ich habe keine Zeit.", right: "…, weil ich keine Zeit habe.", why: "Tras weil, verbo al final." },
      { wrong: "Wenn ich Zeit habe, ich komme.", right: "Wenn ich Zeit habe, komme ich.", why: "Tras la subordinada, primero el verbo." },
    ],
    examples: [
      { text: "Ich glaube, dass er heute nicht kommt.", translation: es("Creo que hoy no viene.") },
      { text: "Weißt du, ob das Museum geöffnet ist?", translation: es("¿Sabes si el museo está abierto?") },
    ],
    contrasts: [{ a: "…, denn ich bin müde.", b: "…, weil ich müde bin.", explanation: "Denn no cambia el orden; weil manda el verbo al final." }],
    exercises: [
      { type: "mc", prompt: "Ich bleibe zu Hause, weil ich krank ___.", options: ["bin", "habe", "sein", "ist"], answers: ["bin"], explanation: "Verbo al final: bin." },
      { type: "mc", prompt: "Wenn es morgen regnet, ___ wir ins Kino.", options: ["gehen", "wir gehen", "gehen wir nicht", "geht"], answers: ["gehen"], explanation: "Tras la subordinada: verbo + sujeto (gehen wir)." },
      { type: "fill", prompt: "Er sagt, dass er keine Zeit ___.", answers: ["hat"], explanation: "Verbo al final." },
      { type: "correct", prompt: "Ich lerne Deutsch, weil ich will in Wien arbeiten.", answers: ["Ich lerne Deutsch, weil ich in Wien arbeiten will."], explanation: "Modal conjugado al final." },
    ],
  },
  {
    id: "de:g:reflexiv",
    language: "de",
    title: "Verbos reflexivos: sich freuen, sich interessieren…",
    cefr: "B1",
    errorCategory: "de:reflexive",
    summary:
      "Como en español, el pronombre cambia con la persona (mich, dich, sich, uns, euch, sich), pero no siempre coinciden los verbos: sich beeilen (darse prisa), sich erinnern an (acordarse de).",
    whenToUse: ["Emociones y rutinas: sich freuen, sich ärgern, sich duschen."],
    formation: [
      "Acusativo: mich, dich, sich, uns, euch, sich.",
      "Con otro complemento directo → dativo: Ich wasche mir die Hände.",
      "Muchos llevan preposición fija: sich freuen auf/über, sich interessieren für.",
    ],
    commonMistakes: [
      { wrong: "Ich freue sich.", right: "Ich freue mich.", why: "Con ich → mich." },
      { wrong: "Ich interessiere mich in Musik.", right: "Ich interessiere mich für Musik.", why: "Preposición fija: für." },
    ],
    examples: [
      { text: "Wir freuen uns auf die Ferien.", translation: es("Tenemos muchas ganas de que lleguen las vacaciones.") },
      { text: "Erinnerst du dich an mich?", translation: es("¿Te acuerdas de mí?") },
    ],
    contrasts: [{ a: "sich freuen auf (algo futuro)", b: "sich freuen über (algo presente/pasado)", explanation: "Ilusión por lo que viene / alegría por lo que hay." }],
    exercises: [
      { type: "mc", prompt: "Beeil ___! Der Bus kommt.", options: ["dich", "mich", "sich", "dir"], answers: ["dich"], explanation: "Imperativo a du → dich." },
      { type: "mc", prompt: "Wir interessieren uns ___ Kunst.", options: ["für", "an", "über", "in"], answers: ["für"], explanation: "sich interessieren für." },
      { type: "fill", prompt: "Ihr freut ___ sicher über das Geschenk.", answers: ["euch"], explanation: "Ihr → euch." },
      { type: "correct", prompt: "Er erinnert sich nicht von dem Namen.", answers: ["Er erinnert sich nicht an den Namen."], explanation: "sich erinnern an + acusativo." },
    ],
  },
  {
    id: "de:g:zu-infinitiv",
    language: "de",
    title: "zu + infinitivo y um … zu (para)",
    cefr: "B1",
    errorCategory: "de:zu-infinitive",
    summary:
      "Tras muchos verbos y expresiones el infinitivo lleva zu al final: Ich habe keine Lust, heute zu kochen. Para expresar finalidad se usa um … zu: Ich lerne Deutsch, um in Berlin zu studieren.",
    whenToUse: ["Tras versuchen, vergessen, anfangen, Lust haben, es ist wichtig…", "Finalidad con el mismo sujeto: um … zu."],
    formation: [
      "…, (etwas) zu + infinitivo al final.",
      "Separables: zu entre prefijo y verbo: anzurufen, aufzustehen.",
      "Sin zu tras modales y werden: Ich kann kommen.",
    ],
    commonMistakes: [
      { wrong: "Ich versuche mehr Sport machen.", right: "Ich versuche, mehr Sport zu machen.", why: "Tras versuchen → zu + infinitivo." },
      { wrong: "Ich muss zu arbeiten.", right: "Ich muss arbeiten.", why: "Los modales no llevan zu." },
      { wrong: "Ich spare, für ein Auto zu kaufen.", right: "Ich spare, um ein Auto zu kaufen.", why: "Finalidad → um … zu." },
    ],
    examples: [
      { text: "Vergiss nicht, mich anzurufen!", translation: es("¡No olvides llamarme!") },
      { text: "Sie ist nach Deutschland gekommen, um zu arbeiten.", translation: es("Vino a Alemania para trabajar.") },
    ],
    contrasts: [{ a: "um … zu (mismo sujeto)", b: "damit (sujeto distinto)", explanation: "Ich erkläre es, damit du es verstehst." }],
    exercises: [
      { type: "mc", prompt: "Es ist schwer, früh ___.", options: ["aufzustehen", "zu aufstehen", "aufstehen", "aufstehen zu"], answers: ["aufzustehen"], explanation: "Separable: auf + zu + stehen." },
      { type: "mc", prompt: "Er arbeitet viel, ___ Geld zu sparen.", options: ["um", "für", "damit", "zu"], answers: ["um"], explanation: "Finalidad: um … zu." },
      { type: "fill", prompt: "Hast du Lust, heute ins Kino ___ gehen?", answers: ["zu"], explanation: "Lust haben → zu + infinitivo." },
      { type: "correct", prompt: "Wir können zu kommen.", answers: ["Wir können kommen."], explanation: "Modal sin zu." },
    ],
  },
  {
    id: "de:g:relativsaetze",
    language: "de",
    title: "Oraciones de relativo: der, die, das…",
    cefr: "B2",
    errorCategory: "de:relative",
    summary:
      "El pronombre relativo toma el género y número de la palabra a la que se refiere, pero el caso de su función dentro de la oración relativa. Y el verbo va al final: Der Mann, den ich gesehen habe, …",
    whenToUse: ["Precisar o añadir información sobre alguien o algo."],
    formation: [
      "Nominativo: der, die, das, die · Acusativo: den, die, das, die.",
      "Dativo: dem, der, dem, denen · Genitivo: dessen, deren.",
      "Preposición delante: die Stadt, in der ich wohne.",
    ],
    commonMistakes: [
      { wrong: "Das ist der Freund, der ich getroffen habe.", right: "Das ist der Freund, den ich getroffen habe.", why: "Complemento directo → acusativo den." },
      { wrong: "Die Leute, mit die ich arbeite…", right: "Die Leute, mit denen ich arbeite…", why: "Mit + dativo plural → denen." },
    ],
    examples: [
      { text: "Das Buch, das du mir geschenkt hast, ist toll.", translation: es("El libro que me regalaste es genial.") },
      { text: "Die Frau, deren Hund bellt, ist meine Nachbarin.", translation: es("La mujer cuyo perro ladra es mi vecina.") },
    ],
    contrasts: [{ a: "der Mann, der mich sieht", b: "der Mann, den ich sehe", explanation: "Él es sujeto (nominativo) / es objeto (acusativo)." }],
    exercises: [
      { type: "mc", prompt: "Der Film, ___ wir gestern gesehen haben, war lang.", options: ["den", "der", "dem", "dessen"], answers: ["den"], explanation: "Acusativo masculino → den." },
      { type: "mc", prompt: "Die Kinder, mit ___ ich spiele, sind nett.", options: ["denen", "die", "den", "deren"], answers: ["denen"], explanation: "Mit + dativo plural → denen." },
      { type: "fill", prompt: "Das ist die Firma, für ___ ich arbeite.", answers: ["die"], explanation: "Für + acusativo femenino → die." },
      { type: "correct", prompt: "Der Mann, der ich helfe, ist alt.", answers: ["Der Mann, dem ich helfe, ist alt."], explanation: "Helfen rige dativo → dem." },
    ],
  },
  {
    id: "de:g:genitiv",
    language: "de",
    title: "Genitivo y preposiciones con genitivo",
    cefr: "C1",
    errorCategory: "de:genitive",
    summary:
      "El genitivo expresa posesión en registro cuidado (das Auto meines Vaters) y lo rigen preposiciones formales como wegen, trotz, während, statt, innerhalb. En el habla coloquial muchas veces se sustituye por von + dativo.",
    whenToUse: ["Textos formales y noticias: wegen des Regens.", "Posesión: die Hauptstadt des Landes."],
    formation: [
      "des (+ -s/-es) para masc./neutro: des Mannes, des Kindes.",
      "der para femenino y plural: der Frau, der Kinder.",
      "Preposiciones: wegen, trotz, während, statt, innerhalb, außerhalb.",
    ],
    commonMistakes: [
      { wrong: "wegen dem Wetter (en un texto formal)", right: "wegen des Wetters", why: "En registro formal, genitivo con -s." },
      { wrong: "das Haus des Lehrer", right: "das Haus des Lehrers", why: "Masculino en genitivo añade -s." },
    ],
    examples: [
      { text: "Trotz des Regens sind wir spazieren gegangen.", translation: es("A pesar de la lluvia fuimos a pasear.") },
      { text: "Während der Sitzung darf man nicht telefonieren.", translation: es("Durante la reunión no se puede hablar por teléfono.") },
    ],
    contrasts: [{ a: "das Auto von meinem Vater (coloquial)", b: "das Auto meines Vaters (cuidado)", explanation: "Mismo significado, distinto registro." }],
    exercises: [
      { type: "mc", prompt: "Wegen ___ Streiks fährt kein Zug.", options: ["des", "dem", "der", "den"], answers: ["des"], explanation: "Der Streik (masc.) → des Streiks." },
      { type: "mc", prompt: "Innerhalb ___ Woche bekommen Sie eine Antwort.", options: ["einer", "einem", "eine", "eines"], answers: ["einer"], explanation: "Die Woche (fem.) → einer." },
      { type: "fill", prompt: "Das ist das Fahrrad meines ___. (Bruder)", answers: ["Bruders"], explanation: "Masculino → -s." },
      { type: "correct", prompt: "Trotz dem schlechten Wetter kamen alle.", answers: ["Trotz des schlechten Wetters kamen alle."], explanation: "Trotz + genitivo." },
    ],
  },
];
