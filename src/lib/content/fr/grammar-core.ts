import type { GrammarConcept } from "../types";

/** Francés: temas que completan el programa A1 → C1, pensados para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const FR_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "fr:g:questions",
    language: "fr",
    title: "Hacer preguntas: est-ce que, inversión y entonación",
    cefr: "A1",
    errorCategory: "fr:questions",
    summary:
      "El francés tiene tres registros para preguntar: entonación (Tu viens ?), est-ce que (Est-ce que tu viens ?) e inversión, más formal (Viens-tu ?). Con il/elle y un verbo que acaba en vocal se añade -t- : A-t-il faim ?",
    whenToUse: ["Conversación: Tu habites où ?", "Neutro y seguro: Est-ce que vous avez une chambre ?", "Formal o escrito: Pouvez-vous m'aider ?"],
    formation: [
      "Est-ce que + frase: Est-ce qu'il pleut ?",
      "Inversión: verbo-sujeto con guion: Parlez-vous anglais ?",
      "Interrogativos: où, quand, comment, pourquoi, combien, qui, que/qu'est-ce que.",
    ],
    commonMistakes: [
      { wrong: "Que tu fais ?", right: "Qu'est-ce que tu fais ?", why: "Que al inicio exige est-ce que o inversión (Que fais-tu ?)." },
      { wrong: "A il faim ?", right: "A-t-il faim ?", why: "Entre vocales se intercala -t-." },
    ],
    examples: [
      { text: "Est-ce que vous parlez espagnol ?", translation: es("¿Habla usted español?") },
      { text: "Où est-ce que tu travailles ?", translation: es("¿Dónde trabajas?") },
    ],
    contrasts: [{ a: "Tu viens ce soir ?", b: "Viens-tu ce soir ?", explanation: "Coloquial frente a formal: mismo significado." }],
    exercises: [
      { type: "mc", prompt: "___ vous avez des enfants ?", options: ["Est-ce que", "Qu'est-ce que", "Est-ce", "Que"], answers: ["Est-ce que"], explanation: "Pregunta de sí/no → est-ce que." },
      { type: "mc", prompt: "___ tu fais ce week-end ?", options: ["Qu'est-ce que", "Est-ce que", "Quoi", "Que"], answers: ["Qu'est-ce que"], explanation: "¿Qué…? → qu'est-ce que." },
      { type: "fill", prompt: "Parle-___-il français ? (letra de enlace)", answers: ["t"], explanation: "Vocal + il → -t-." },
      { type: "correct", prompt: "A elle un chien ?", answers: ["A-t-elle un chien ?", "Est-ce qu'elle a un chien ?", "Elle a un chien ?"], explanation: "A-t-elle…?" },
    ],
  },
  {
    id: "fr:g:possessifs",
    language: "fr",
    title: "Posesivos: mon, ma, mes…",
    cefr: "A1",
    errorCategory: "fr:possessives",
    summary:
      "El posesivo concuerda con lo poseído, no con el poseedor: sa mère puede ser «su madre» de él o de ella. Ante vocal, el femenino usa mon/ton/son: mon amie, son école.",
    whenToUse: ["Familia y objetos: mon frère, ta voiture, leurs enfants."],
    formation: [
      "mon/ma/mes · ton/ta/tes · son/sa/ses.",
      "notre/nos · votre/vos · leur/leurs.",
      "Femenino + vocal → mon, ton, son: mon adresse.",
    ],
    commonMistakes: [
      { wrong: "ma amie", right: "mon amie", why: "Ante vocal se usa mon aunque sea femenino." },
      { wrong: "Pierre et sa femme… → Pierre et son femme", right: "Pierre et sa femme", why: "Concuerda con femme (femenino), no con Pierre." },
    ],
    examples: [
      { text: "Voici mes parents et leur chien.", translation: es("Estos son mis padres y su perro.") },
      { text: "Elle cherche son école.", translation: es("Busca su escuela.") },
    ],
    contrasts: [{ a: "son livre (de él o de ella)", b: "sa maison (de él o de ella)", explanation: "El género lo decide la cosa poseída." }],
    exercises: [
      { type: "mc", prompt: "C'est ___ amie Julie.", options: ["mon", "ma", "mes", "me"], answers: ["mon"], explanation: "Amie empieza por vocal → mon." },
      { type: "mc", prompt: "Nous aimons ___ quartier.", options: ["notre", "nos", "nous", "leur"], answers: ["notre"], explanation: "Nosotros + singular → notre." },
      { type: "fill", prompt: "Ils ont vendu ___ voiture. (su, de ellos)", answers: ["leur"], explanation: "De ellos, singular → leur." },
      { type: "correct", prompt: "Ma école est grande.", answers: ["Mon école est grande."], explanation: "Ante vocal → mon." },
    ],
  },
  {
    id: "fr:g:futur-proche",
    language: "fr",
    title: "Futur proche: aller + infinitivo",
    cefr: "A2",
    errorCategory: "fr:futur-proche",
    summary:
      "Como en español «voy a + infinitivo»: je vais partir. Es el futuro más usado en la conversación. En la negación, ne…pas rodea a aller: je ne vais pas sortir.",
    whenToUse: ["Planes e intenciones: On va manger ensemble.", "Algo que está a punto de pasar: Attention, tu vas tomber !"],
    formation: ["aller (vais, vas, va, allons, allez, vont) + infinitivo.", "Negación: ne + aller + pas + infinitivo."],
    commonMistakes: [
      { wrong: "Je vais à manger.", right: "Je vais manger.", why: "Sin preposición entre aller y el infinitivo." },
      { wrong: "Je vais ne pas venir.", right: "Je ne vais pas venir.", why: "La negación rodea a aller." },
    ],
    examples: [
      { text: "Demain, je vais visiter le Louvre.", translation: es("Mañana voy a visitar el Louvre.") },
      { text: "Il va pleuvoir ce soir.", translation: es("Va a llover esta noche.") },
    ],
    contrasts: [{ a: "Je vais partir.", b: "Je partirai.", explanation: "Futuro cercano/coloquial frente a futuro simple (más formal o lejano)." }],
    exercises: [
      { type: "mc", prompt: "Nous ___ prendre le train.", options: ["allons", "allez", "vont", "va"], answers: ["allons"], explanation: "Nous → allons." },
      { type: "mc", prompt: "Ils ___ arriver en retard.", options: ["vont", "vais", "va", "allons"], answers: ["vont"], explanation: "Ils → vont." },
      { type: "fill", prompt: "Tu ___ adorer ce film !", answers: ["vas"], explanation: "Tu → vas." },
      { type: "correct", prompt: "Je vais à travailler demain.", answers: ["Je vais travailler demain."], explanation: "Sin à." },
    ],
  },
  {
    id: "fr:g:partitifs",
    language: "fr",
    title: "Partitivos: du, de la, des… y pas de",
    cefr: "A2",
    errorCategory: "fr:partitives",
    summary:
      "El francés no deja el sustantivo «desnudo»: «quiero pan» es je veux du pain. En negativa, todos se convierten en de (d'): je ne veux pas de pain.",
    whenToUse: ["Cantidades indefinidas: de l'eau, du fromage, des pommes.", "Negación: Il n'y a pas de lait."],
    formation: [
      "du (masc.) · de la (fem.) · de l' (vocal) · des (plural).",
      "Negación: pas de / pas d' (excepto con être: ce n'est pas du vin).",
      "Cantidad exacta: beaucoup de, un peu de, un kilo de (sin artículo).",
    ],
    commonMistakes: [
      { wrong: "Je mange pain.", right: "Je mange du pain.", why: "Hace falta el partitivo." },
      { wrong: "Je n'ai pas du temps.", right: "Je n'ai pas de temps.", why: "En negativa → de." },
      { wrong: "beaucoup des amis", right: "beaucoup d'amis", why: "Tras expresiones de cantidad → de." },
    ],
    examples: [
      { text: "Tu veux du café ou du thé ?", translation: es("¿Quieres café o té?") },
      { text: "Il n'y a plus de place.", translation: es("Ya no hay sitio.") },
    ],
    contrasts: [{ a: "J'aime le chocolat.", b: "Je mange du chocolat.", explanation: "Con gustos, artículo definido; con una cantidad, partitivo." }],
    exercises: [
      { type: "mc", prompt: "Je voudrais ___ eau, s'il vous plaît.", options: ["de l'", "du", "de la", "des"], answers: ["de l'"], explanation: "Eau empieza por vocal → de l'." },
      { type: "mc", prompt: "Nous n'avons pas ___ enfants.", options: ["d'", "des", "de les", "les"], answers: ["d'"], explanation: "Negación → de/d'." },
      { type: "fill", prompt: "Elle achète ___ salade. (partitivo)", answers: ["de la"], explanation: "Salade es femenino → de la." },
      { type: "correct", prompt: "Il y a beaucoup des touristes.", answers: ["Il y a beaucoup de touristes."], explanation: "Beaucoup de." },
    ],
  },
  {
    id: "fr:g:cest-ilest",
    language: "fr",
    title: "C'est o il est",
    cefr: "A2",
    errorCategory: "fr:cest-ilest",
    summary:
      "C'est va seguido de un determinante o nombre (c'est un médecin, c'est Marie) y de adjetivos para juzgar algo general (c'est facile). Il/elle est va con un adjetivo que describe a alguien o algo concreto, o con una profesión sin artículo (il est médecin).",
    whenToUse: ["Presentar: C'est mon frère.", "Describir: Il est grand.", "Opinión general: C'est génial !"],
    formation: ["c'est + un/une/le/mon… + nombre.", "il/elle est + adjetivo o profesión sin artículo.", "c'est + adjetivo masculino para ideas: c'est important."],
    commonMistakes: [
      { wrong: "Il est un bon professeur.", right: "C'est un bon professeur.", why: "Con artículo → c'est." },
      { wrong: "C'est médecin.", right: "Il est médecin.", why: "Profesión sin artículo → il/elle est." },
    ],
    examples: [
      { text: "C'est une belle ville, elle est très animée.", translation: es("Es una ciudad bonita, está muy animada.") },
      { text: "Apprendre une langue, c'est passionnant.", translation: es("Aprender un idioma es apasionante.") },
    ],
    contrasts: [{ a: "Il est avocat.", b: "C'est un avocat célèbre.", explanation: "Profesión sola / con artículo y adjetivo." }],
    exercises: [
      { type: "mc", prompt: "Qui est-ce ? — ___ ma voisine.", options: ["C'est", "Elle est", "Il est", "Est"], answers: ["C'est"], explanation: "Determinante (ma) → c'est." },
      { type: "mc", prompt: "Marie ? ___ architecte.", options: ["Elle est", "C'est", "Elle a", "C'est une"], answers: ["Elle est"], explanation: "Profesión sin artículo → elle est." },
      { type: "fill", prompt: "Ce film ? ___ nul ! (juicio general)", answers: ["C'est"], explanation: "Juicio → c'est." },
      { type: "correct", prompt: "Il est un homme très gentil.", answers: ["C'est un homme très gentil."], explanation: "Con un → c'est." },
    ],
  },
  {
    id: "fr:g:mieux-meilleur",
    language: "fr",
    title: "Comparativos: plus, moins, aussi… y meilleur / mieux",
    cefr: "B1",
    errorCategory: "fr:comparatives",
    summary:
      "Se compara con plus / moins / aussi + adjetivo + que. Ojo: «mejor» tiene dos formas: meilleur (adjetivo, acompaña a un nombre) y mieux (adverbio, acompaña a un verbo).",
    whenToUse: ["Comparar: Paris est plus grand que Lyon.", "Mejor/peor: Ce vin est meilleur. Elle chante mieux."],
    formation: [
      "plus / moins / aussi + adjetivo + que.",
      "bon → meilleur(e)(s) · bien → mieux.",
      "Superlativo: le/la/les plus + adjetivo: la plus belle ville.",
    ],
    commonMistakes: [
      { wrong: "Ce restaurant est plus bon.", right: "Ce restaurant est meilleur.", why: "Bon → meilleur, nunca plus bon." },
      { wrong: "Il parle meilleur que moi.", right: "Il parle mieux que moi.", why: "Con verbo → mieux." },
    ],
    examples: [
      { text: "C'est le meilleur croissant de la ville.", translation: es("Es el mejor cruasán de la ciudad.") },
      { text: "Je me sens mieux aujourd'hui.", translation: es("Hoy me siento mejor.") },
    ],
    contrasts: [{ a: "un meilleur prix", b: "on mange mieux ici", explanation: "Meilleur con nombre, mieux con verbo." }],
    exercises: [
      { type: "mc", prompt: "Ta solution est ___ que la mienne.", options: ["meilleure", "mieux", "plus bonne", "meilleur"], answers: ["meilleure"], explanation: "Solution es femenino → meilleure." },
      { type: "mc", prompt: "Tu conduis ___ que ton frère.", options: ["mieux", "meilleur", "plus bien", "bon"], answers: ["mieux"], explanation: "Con verbo → mieux." },
      { type: "fill", prompt: "Lyon est ___ grand que Paris. (menos)", answers: ["moins"], explanation: "Menos → moins." },
      { type: "correct", prompt: "Ce gâteau est plus bon que l'autre.", answers: ["Ce gâteau est meilleur que l'autre."], explanation: "Plus bon → meilleur." },
    ],
  },
  {
    id: "fr:g:plus-que-parfait",
    language: "fr",
    title: "Plus-que-parfait (había hecho)",
    cefr: "B1",
    errorCategory: "fr:plus-que-parfait",
    summary:
      "Equivale al pluscuamperfecto español: una acción anterior a otra pasada. Se forma con avoir o être en imparfait + participio, siguiendo las mismas reglas del passé composé.",
    whenToUse: ["Antes de otro pasado: Quand je suis arrivé, le film avait commencé.", "Con si para lamentos: Si j'avais su…"],
    formation: ["avait/étais + participio: j'avais fini, elle était partie.", "Mismo auxiliar que en passé composé (être con verbos de movimiento y pronominales)."],
    commonMistakes: [
      { wrong: "Elle avait parti.", right: "Elle était partie.", why: "Partir usa être (y concuerda)." },
      { wrong: "Quand il est arrivé, nous avons déjà mangé.", right: "Quand il est arrivé, nous avions déjà mangé.", why: "Lo anterior → plus-que-parfait." },
    ],
    examples: [
      { text: "Je n'avais jamais vu la mer avant.", translation: es("Nunca había visto el mar antes.") },
      { text: "Ils étaient déjà partis.", translation: es("Ya se habían ido.") },
    ],
    contrasts: [{ a: "Il a fini quand je suis arrivé.", b: "Il avait fini quand je suis arrivé.", explanation: "Terminó en ese momento / ya había terminado antes." }],
    exercises: [
      { type: "mc", prompt: "Nous ___ déjà dîné.", options: ["avions", "avons", "étions", "aurons"], answers: ["avions"], explanation: "Avoir en imparfait + participio." },
      { type: "mc", prompt: "Elle ___ sortie avant la pluie.", options: ["était", "avait", "est", "a"], answers: ["était"], explanation: "Sortir usa être." },
      { type: "fill", prompt: "Je n'___ pas compris la question. (avoir, plus-que-parfait)", answers: ["avais"], explanation: "Je n'avais pas compris." },
      { type: "correct", prompt: "Ils avaient arrivé en retard.", answers: ["Ils étaient arrivés en retard."], explanation: "Arriver usa être." },
    ],
  },
  {
    id: "fr:g:gerondif",
    language: "fr",
    title: "Gerundio: en + participio presente",
    cefr: "B2",
    errorCategory: "fr:gerondif",
    summary:
      "En + -ant expresa simultaneidad o manera, como nuestro gerundio: Il chante en cuisinant (canta mientras cocina). Se forma a partir de la raíz de nous en presente: nous parlons → en parlant.",
    whenToUse: ["Dos acciones a la vez: Ne téléphone pas en conduisant.", "Manera o medio: C'est en pratiquant qu'on apprend."],
    formation: ["Raíz de nous + -ant: finissons → finissant, prenons → prenant.", "Irregulares: être → étant, avoir → ayant, savoir → sachant.", "Siempre con en y el mismo sujeto que el verbo principal."],
    commonMistakes: [
      { wrong: "J'ai appris le français parlant avec des amis.", right: "J'ai appris le français en parlant avec des amis.", why: "El gerundio lleva en." },
      { wrong: "en sayant", right: "en sachant", why: "Savoir es irregular: sachant." },
    ],
    examples: [
      { text: "Elle écoute de la musique en travaillant.", translation: es("Escucha música mientras trabaja.") },
      { text: "En arrivant, j'ai vu le problème.", translation: es("Al llegar, vi el problema.") },
    ],
    contrasts: [{ a: "En sortant, il a fermé la porte.", b: "Quand il est sorti, il a fermé la porte.", explanation: "Mismo sentido; el gerundio es más compacto." }],
    exercises: [
      { type: "mc", prompt: "Il s'est blessé en ___.", options: ["courant", "courir", "court", "courrant"], answers: ["courant"], explanation: "Nous courons → courant." },
      { type: "mc", prompt: "On apprend en ___ des erreurs.", options: ["faisant", "faire", "fait", "faisons"], answers: ["faisant"], explanation: "Nous faisons → faisant." },
      { type: "fill", prompt: "Je me suis endormi en ___ la télé. (regarder)", answers: ["regardant"], explanation: "Regard- + ant." },
      { type: "correct", prompt: "Il lit mangeant.", answers: ["Il lit en mangeant."], explanation: "Falta en." },
    ],
  },
  {
    id: "fr:g:accord-participe",
    language: "fr",
    title: "Concordancia del participio pasado",
    cefr: "B2",
    errorCategory: "fr:agreement",
    summary:
      "Con être, el participio concuerda con el sujeto (elles sont parties). Con avoir, no concuerda… salvo si el complemento directo va ANTES del verbo: la lettre que j'ai écrite, je les ai vus.",
    whenToUse: ["Escritura cuidada: cartas, correos, exámenes (en la oral casi nunca se oye)."],
    formation: [
      "être: concuerda con el sujeto: Marie est allée.",
      "avoir: invariable, salvo complemento directo antepuesto (que, la, les…).",
      "Pronominales: normalmente concuerdan: elle s'est levée.",
    ],
    commonMistakes: [
      { wrong: "Elles sont arrivé.", right: "Elles sont arrivées.", why: "Con être concuerda con el sujeto." },
      { wrong: "Les photos que j'ai pris.", right: "Les photos que j'ai prises.", why: "Complemento directo (que = photos) antepuesto → concuerda." },
    ],
    examples: [
      { text: "Ces chaussures ? Je les ai achetées hier.", translation: es("¿Estos zapatos? Los compré ayer.") },
      { text: "Nous nous sommes rencontrés à Madrid.", translation: es("Nos conocimos en Madrid.") },
    ],
    contrasts: [{ a: "J'ai écrit une lettre.", b: "La lettre que j'ai écrite.", explanation: "Complemento después (sin concordancia) / antes (concuerda)." }],
    exercises: [
      { type: "mc", prompt: "Mes amies sont ___ hier.", options: ["venues", "venu", "venus", "venue"], answers: ["venues"], explanation: "Être + femenino plural." },
      { type: "mc", prompt: "Cette robe ? Je l'ai ___ en solde.", options: ["achetée", "acheté", "achetés", "achetées"], answers: ["achetée"], explanation: "L' (= la robe) antepuesto → achetée." },
      { type: "fill", prompt: "Elle s'est ___ tôt. (lever)", answers: ["levée"], explanation: "Pronominal → concuerda con elle." },
      { type: "correct", prompt: "Les lettres que j'ai reçu sont belles.", answers: ["Les lettres que j'ai reçues sont belles."], explanation: "Que (= les lettres) antepuesto → reçues." },
    ],
  },
];
