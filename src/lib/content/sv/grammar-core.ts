import type { GrammarConcept } from "../types";

/** Sueco: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const SV_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "sv:g:questions-inte",
    language: "sv",
    title: "Preguntas y negación con inte",
    cefr: "A1",
    errorCategory: "sv:questions",
    summary:
      "Para preguntar sí/no el verbo pasa al principio: Talar du svenska? Con interrogativos (vad, var, när, hur, varför) el verbo va justo después: Var bor du? La negación inte va detrás del verbo conjugado en la oración principal: Jag talar inte tyska.",
    whenToUse: ["Preguntas: Kommer du i morgon?", "Negar: Jag förstår inte."],
    formation: ["Verbo + sujeto + … ? (sí/no).", "Interrogativo + verbo + sujeto: Vad heter du?", "Sujeto + verbo + inte."],
    commonMistakes: [
      { wrong: "Du talar svenska?", right: "Talar du svenska?", why: "La pregunta invierte verbo y sujeto." },
      { wrong: "Jag inte förstår.", right: "Jag förstår inte.", why: "En la principal inte va tras el verbo." },
    ],
    examples: [
      { text: "Var ligger stationen?", translation: es("¿Dónde está la estación?") },
      { text: "Jag dricker inte kaffe.", translation: es("No bebo café.") },
    ],
    contrasts: [{ a: "Jag förstår inte.", b: "…att jag inte förstår.", explanation: "Principal (inte tras el verbo) / subordinada (inte antes)." }],
    exercises: [
      { type: "mc", prompt: "___ du i Stockholm?", options: ["Bor", "Du bor", "Bo", "Bor inte du"], answers: ["Bor"], explanation: "Pregunta sí/no → verbo primero." },
      { type: "mc", prompt: "Vad ___?", options: ["heter du", "du heter", "heter", "du"], answers: ["heter du"], explanation: "Interrogativo + verbo + sujeto." },
      { type: "fill", prompt: "Jag talar ___ spanska. (no)", answers: ["inte"], explanation: "Negación → inte." },
      { type: "correct", prompt: "Jag inte gillar fisk.", answers: ["Jag gillar inte fisk."], explanation: "Inte tras el verbo." },
    ],
  },
  {
    id: "sv:g:ska-kommer-att",
    language: "sv",
    title: "Futuro: ska y kommer att",
    cefr: "A2",
    errorCategory: "sv:future",
    summary:
      "Ska + infinitivo expresa planes e intenciones (Jag ska resa till Malmö). Kommer att + infinitivo, predicciones sin voluntad (Det kommer att regna). También se usa el presente con una expresión de tiempo: Jag åker i morgon.",
    whenToUse: ["Plan: Vi ska äta ute i kväll.", "Predicción: Du kommer att gilla den."],
    formation: ["ska + infinitivo (sin att).", "kommer att + infinitivo.", "Presente + tiempo futuro."],
    commonMistakes: [
      { wrong: "Jag ska att resa.", right: "Jag ska resa.", why: "Ska va sin att." },
      { wrong: "Det ska regna i morgon (predicción del tiempo).", right: "Det kommer att regna i morgon.", why: "Predicción sin intención → kommer att." },
    ],
    examples: [
      { text: "Vad ska du göra i helgen?", translation: es("¿Qué vas a hacer el fin de semana?") },
      { text: "Det kommer att bli kallt.", translation: es("Va a hacer frío.") },
    ],
    contrasts: [{ a: "Jag ska flytta.", b: "Priserna kommer att stiga.", explanation: "Intención propia / predicción." }],
    exercises: [
      { type: "mc", prompt: "I kväll ___ vi titta på film.", options: ["ska", "kommer", "ska att", "kommer till"], answers: ["ska"], explanation: "Plan → ska." },
      { type: "mc", prompt: "Hon ___ att vinna, hon är bäst.", options: ["kommer", "ska", "blir", "vill"], answers: ["kommer"], explanation: "Predicción → kommer att." },
      { type: "fill", prompt: "Det kommer ___ snöa.", answers: ["att"], explanation: "Kommer att." },
      { type: "correct", prompt: "Vi ska att åka till Göteborg.", answers: ["Vi ska åka till Göteborg."], explanation: "Ska sin att." },
    ],
  },
  {
    id: "sv:g:modals",
    language: "sv",
    title: "Verbos modales: kan, vill, måste, får, behöver",
    cefr: "A2",
    errorCategory: "sv:modals",
    summary:
      "Van seguidos de infinitivo sin att: Jag kan simma. Kan = poder/saber, vill = querer, måste = tener que, får = tener permiso, behöver = necesitar. «No hace falta» es behöver inte; måste inte también se usa en ese sentido.",
    whenToUse: ["Permiso: Får jag sitta här?", "Obligación: Jag måste jobba.", "Necesidad: Du behöver inte komma."],
    formation: ["modal + infinitivo (sin att).", "Pasado: kunde, ville, måste, fick, behövde."],
    commonMistakes: [
      { wrong: "Jag vill att äta.", right: "Jag vill äta.", why: "Tras modal, sin att." },
      { wrong: "Jag vill går hem.", right: "Jag vill gå hem.", why: "Tras modal, infinitivo (gå), no presente." },
    ],
    examples: [
      { text: "Kan du hjälpa mig?", translation: es("¿Puedes ayudarme?") },
      { text: "Man får inte parkera här.", translation: es("Aquí no se puede aparcar.") },
    ],
    contrasts: [{ a: "Du får inte röka.", b: "Du behöver inte röka.", explanation: "Prohibido / no hace falta." }],
    exercises: [
      { type: "mc", prompt: "___ jag öppna fönstret? (permiso)", options: ["Får", "Måste", "Vill att", "Ska att"], answers: ["Får"], explanation: "Permiso → får." },
      { type: "mc", prompt: "Jag ___ gå nu, bussen går snart.", options: ["måste", "får att", "vill att", "behöver att"], answers: ["måste"], explanation: "Obligación → måste." },
      { type: "fill", prompt: "Du ___ inte betala, det är gratis.", answers: ["behöver"], explanation: "No hace falta → behöver inte." },
      { type: "correct", prompt: "Jag kan att laga mat.", answers: ["Jag kan laga mat."], explanation: "Sin att." },
    ],
  },
  {
    id: "sv:g:comparatives",
    language: "sv",
    title: "Comparativo y superlativo: större, störst",
    cefr: "A2",
    errorCategory: "sv:comparatives",
    summary:
      "Se añade -are / -ast (billig → billigare → billigast) y se compara con än. Algunos cambian de vocal: stor → större → störst, lång → längre → längst. Irregulares: bra → bättre → bäst, dålig → sämre → sämst, många → fler → flest. Adjetivos largos o en -isk usan mer/mest.",
    whenToUse: ["Comparar: Stockholm är större än Malmö.", "Superlativo: Det är den bästa boken."],
    formation: ["-are än · -ast.", "Cambio de vocal: större, längre, yngre, äldre.", "mer/mest: mer praktisk, mest intressant."],
    commonMistakes: [
      { wrong: "mer stor", right: "större", why: "Stor tiene comparativo propio." },
      { wrong: "Han är äldre som jag.", right: "Han är äldre än jag.", why: "Comparativo + än." },
    ],
    examples: [
      { text: "Tåget är snabbare än bussen.", translation: es("El tren es más rápido que el autobús.") },
      { text: "Det här är det bästa kaffet i stan.", translation: es("Este es el mejor café de la ciudad.") },
    ],
    contrasts: [{ a: "lika stor som", b: "större än", explanation: "Igual de grande que / más grande que." }],
    exercises: [
      { type: "mc", prompt: "Min bror är ___ än jag.", options: ["äldre", "gammalare", "mer gammal", "äldst"], answers: ["äldre"], explanation: "Gammal → äldre." },
      { type: "mc", prompt: "Den här filmen är ___ än den andra.", options: ["bättre", "braare", "mer bra", "bäst"], answers: ["bättre"], explanation: "Bra → bättre." },
      { type: "fill", prompt: "Det är den billig___ tröjan i butiken.", answers: ["aste"], explanation: "Forma definida del superlativo: billigaste." },
      { type: "correct", prompt: "Sverige är mer stor än Danmark.", answers: ["Sverige är större än Danmark."], explanation: "Stor → större." },
    ],
  },
  {
    id: "sv:g:imperative",
    language: "sv",
    title: "Imperativo",
    cefr: "A2",
    errorCategory: "sv:imperative",
    summary:
      "El imperativo es la raíz del verbo: los verbos de los grupos 2 y 4 pierden la -a del infinitivo (skriva → skriv!, läsa → läs!, komma → kom!), mientras que los del grupo 1, con presente en -ar, la conservan (vänta!, titta!). Es igual para una o varias personas.",
    whenToUse: ["Instrucciones: Sväng vänster.", "Invitaciones: Kom in!"],
    formation: ["Grupo 1 (-ar): igual al infinitivo: vänta, öppna.", "Grupos 2 y 4: infinitivo sin -a: läs, skriv, kom, sov.", "Negativo: inte delante del verbo: Glöm inte!"],
    commonMistakes: [
      { wrong: "Skriva ditt namn här!", right: "Skriv ditt namn här!", why: "Skriva → skriv." },
      { wrong: "Vänt!", right: "Vänta!", why: "Grupo 1 conserva la -a." },
    ],
    examples: [
      { text: "Stäng dörren, tack.", translation: es("Cierra la puerta, por favor.") },
      { text: "Glöm inte nycklarna!", translation: es("¡No olvides las llaves!") },
    ],
    contrasts: [{ a: "Läs boken!", b: "Titta på filmen!", explanation: "Läsa pierde -a; titta (grupo 1) la conserva." }],
    exercises: [
      { type: "mc", prompt: "___ här! (komma)", options: ["Kom", "Komma", "Kommer", "Kommit"], answers: ["Kom"], explanation: "Komma → kom." },
      { type: "mc", prompt: "___ lite! (vänta)", options: ["Vänta", "Vänt", "Väntar", "Väntade"], answers: ["Vänta"], explanation: "Grupo 1: vänta." },
      { type: "fill", prompt: "___ högt, tack! (läsa)", answers: ["Läs"], explanation: "Läsa → läs." },
      { type: "correct", prompt: "Skriva till mig!", answers: ["Skriv till mig!"], explanation: "Skriva → skriv." },
    ],
  },
  {
    id: "sv:g:sin-hans",
    language: "sv",
    title: "Posesivo reflexivo: sin frente a hans/hennes",
    cefr: "B1",
    errorCategory: "sv:possessive-reflexive",
    summary:
      "Si el poseedor es el sujeto de la misma oración (3.ª persona), se usa sin/sitt/sina: Anna älskar sin hund (su propio perro). Hans/hennes/deras indican a otra persona: Anna älskar hans hund (el perro de él). Sin nunca va en el sujeto.",
    whenToUse: ["Evitar ambigüedades: Erik ringde sin bror / hans bror."],
    formation: ["sin (en-ord), sitt (ett-ord), sina (plural).", "Nunca en el sujeto: Hans bror ringde (no «sin bror ringde»)."],
    commonMistakes: [
      { wrong: "Maria tog hennes väska (su propio bolso).", right: "Maria tog sin väska.", why: "El bolso es del sujeto → sin." },
      { wrong: "Sin mamma bor i Lund.", right: "Hans mamma bor i Lund. / Hennes mamma bor i Lund.", why: "Sin no puede ir en el sujeto." },
    ],
    examples: [
      { text: "Han bor med sina föräldrar.", translation: es("Vive con sus (propios) padres.") },
      { text: "Lisa lånade hans cykel.", translation: es("Lisa tomó prestada la bici de él.") },
    ],
    contrasts: [{ a: "Pelle tvättar sin bil.", b: "Pelle tvättar hans bil.", explanation: "Lava su propio coche / el coche de otro hombre." }],
    exercises: [
      { type: "mc", prompt: "Olle ringde ___ mamma igår. (su propia madre)", options: ["sin", "hans", "sitt", "sina"], answers: ["sin"], explanation: "Poseedor = sujeto, en-ord → sin." },
      { type: "mc", prompt: "Barnen leker med ___ leksaker.", options: ["sina", "sin", "deras", "sitt"], answers: ["sina"], explanation: "Plural → sina." },
      { type: "fill", prompt: "Hon säljer ___ hus. (su propia casa, ett-ord)", answers: ["sitt"], explanation: "Ett-ord → sitt." },
      { type: "correct", prompt: "Anna glömde hennes telefon hemma. (su propio teléfono)", answers: ["Anna glömde sin telefon hemma."], explanation: "Poseedor = sujeto → sin." },
    ],
  },
  {
    id: "sv:g:som",
    language: "sv",
    title: "Relativo som",
    cefr: "B1",
    errorCategory: "sv:relative",
    summary:
      "Som equivale a «que» y sirve para personas y cosas: mannen som bor här. Cuando som es objeto se puede omitir (boken [som] jag läser). En la relativa, inte va antes del verbo, como en toda subordinada: filmen som jag inte såg.",
    whenToUse: ["Describir: Kvinnan som ringde var min chef.", "Con preposición al final: stolen som jag sitter på."],
    formation: ["som + (sujeto) + verbo.", "Omisible si es objeto.", "Preposición al final de la relativa."],
    commonMistakes: [
      { wrong: "Boken vad jag läser är bra.", right: "Boken som jag läser är bra.", why: "Relativo → som (vad es «qué»)." },
      { wrong: "filmen som jag såg inte", right: "filmen som jag inte såg", why: "En subordinada, inte antes del verbo." },
    ],
    examples: [
      { text: "Det är huset som jag växte upp i.", translation: es("Esa es la casa donde crecí.") },
      { text: "Personen som vann fick en bil.", translation: es("La persona que ganó recibió un coche.") },
    ],
    contrasts: [{ a: "boken som jag läser", b: "boken jag läser", explanation: "Mismo significado: som (objeto) puede omitirse." }],
    exercises: [
      { type: "mc", prompt: "Mannen ___ står där är min pappa.", options: ["som", "vad", "vem", "vilken"], answers: ["som"], explanation: "Relativo → som." },
      { type: "mc", prompt: "Det är låten som jag ___.", options: ["inte gillar", "gillar inte", "gillar inte inte", "inte gillar inte"], answers: ["inte gillar"], explanation: "Subordinada: inte + verbo." },
      { type: "fill", prompt: "Staden ___ jag bor i är liten.", answers: ["som"], explanation: "som … i." },
      { type: "correct", prompt: "Kvinnan vem ringde var min syster.", answers: ["Kvinnan som ringde var min syster."], explanation: "Relativo → som." },
    ],
  },
];
