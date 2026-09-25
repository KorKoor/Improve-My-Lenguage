import type { GrammarConcept } from "../types";

/** Portugués (con referencia al de Brasil): temas que completan A1 → C1 para hispanohablantes. */
const es = (t: string) => ({ es: t });

export const PT_GRAMMAR_CORE: GrammarConcept[] = [
  {
    id: "pt:g:plural-ao",
    language: "pt",
    title: "Plural de las palabras en -ão: -ões, -ães, -ãos",
    cefr: "A1",
    errorCategory: "pt:plural",
    summary:
      "La mayoría de las palabras en -ão hacen el plural en -ões (limão → limões), pero algunas muy comunes van en -ães (pão → pães, cão → cães) o -ãos (mão → mãos, irmão → irmãos). Las terminadas en -l cambian a -is: animal → animais.",
    whenToUse: ["Comprar y pedir: dois pães, três limões.", "Familia: meus irmãos."],
    formation: ["-ão → -ões (el caso más frecuente).", "Excepciones: pães, cães, alemães · mãos, irmãos, cidadãos.", "-al/-el/-ol → -ais/-éis/-óis: hotéis, faróis."],
    commonMistakes: [
      { wrong: "Duas mões", right: "Duas mãos", why: "Mão hace mãos." },
      { wrong: "Os hotels", right: "Os hotéis", why: "-el → -éis." },
    ],
    examples: [
      { text: "Quero dois pães, por favor.", translation: es("Quiero dos panes, por favor.") },
      { text: "Meus irmãos moram em São Paulo.", translation: es("Mis hermanos viven en São Paulo.") },
    ],
    contrasts: [{ a: "o avião → os aviões", b: "o irmão → os irmãos", explanation: "Regla general frente a excepción frecuente." }],
    exercises: [
      { type: "mc", prompt: "Eu tenho dois ___.", options: ["irmãos", "irmões", "irmães", "irmãoes"], answers: ["irmãos"], explanation: "Irmão → irmãos." },
      { type: "mc", prompt: "Compramos três ___.", options: ["limões", "limãos", "limães", "limãs"], answers: ["limões"], explanation: "Regla general: -ões." },
      { type: "fill", prompt: "Os ___ estão no zoológico. (animal)", answers: ["animais"], explanation: "-al → -ais." },
      { type: "correct", prompt: "Lave as mões antes de comer.", answers: ["Lave as mãos antes de comer."], explanation: "Mão → mãos." },
    ],
  },
  {
    id: "pt:g:possessivos",
    language: "pt",
    title: "Posesivos: meu, minha… y seu frente a dele/dela",
    cefr: "A1",
    errorCategory: "pt:possessives",
    summary:
      "Los posesivos concuerdan con lo poseído (meu carro, minha casa). En Brasil, seu/sua suele entenderse como «de usted/de ti»; para «de él/de ella» se prefiere dele/dela, que va detrás: o carro dele.",
    whenToUse: ["Objetos y familia: minha mãe, nossos amigos.", "Evitar ambigüedad: a casa dela."],
    formation: ["meu/minha/meus/minhas · teu/tua (Portugal y sur de Brasil) · seu/sua.", "nosso/nossa/nossos/nossas.", "dele, dela, deles, delas (detrás del nombre)."],
    commonMistakes: [
      { wrong: "Minha carro é novo.", right: "Meu carro é novo.", why: "Carro es masculino → meu." },
      { wrong: "Dela casa é bonita.", right: "A casa dela é bonita.", why: "Dela va detrás del sustantivo." },
    ],
    examples: [
      { text: "Esta é minha irmã e aquele é o marido dela.", translation: es("Esta es mi hermana y aquel es su marido.") },
      { text: "Qual é o seu nome?", translation: es("¿Cuál es tu/su nombre?") },
    ],
    contrasts: [{ a: "o livro dele (de él)", b: "o seu livro (tuyo/de usted)", explanation: "En Brasil seu tiende a significar «tu/su de usted»." }],
    exercises: [
      { type: "mc", prompt: "Esta é ___ mãe.", options: ["minha", "meu", "minhas", "meus"], answers: ["minha"], explanation: "Mãe es femenino singular." },
      { type: "mc", prompt: "Paulo? Eu conheço a namorada ___.", options: ["dele", "dela", "seu", "sua"], answers: ["dele"], explanation: "De Paulo → dele." },
      { type: "fill", prompt: "___ amigos chegaram. (nuestros)", answers: ["Nossos"], explanation: "Masculino plural → nossos." },
      { type: "correct", prompt: "Minha pai é médico.", answers: ["Meu pai é médico."], explanation: "Pai es masculino." },
    ],
  },
  {
    id: "pt:g:ir-infinitivo",
    language: "pt",
    title: "Futuro con ir + infinitivo (vou fazer)",
    cefr: "A2",
    errorCategory: "pt:future",
    summary:
      "En el habla, sobre todo en Brasil, el futuro se hace con ir + infinitivo sin preposición: vou viajar, vamos comer. El futuro simple (viajarei) suena formal o escrito.",
    whenToUse: ["Planes: Amanhã vou trabalhar.", "Predicciones: Vai chover."],
    formation: ["vou, vai, vamos, vão + infinitivo.", "Sin «a» entre ir y el infinitivo (a diferencia del español)."],
    commonMistakes: [
      { wrong: "Vou a estudar amanhã.", right: "Vou estudar amanhã.", why: "En portugués no hay «a» entre ir y el infinitivo." },
      { wrong: "Eles vai sair.", right: "Eles vão sair.", why: "Eles → vão." },
    ],
    examples: [
      { text: "A gente vai almoçar agora.", translation: es("Vamos a almorzar ahora.") },
      { text: "Você vai gostar desse filme.", translation: es("Te va a gustar esta película.") },
    ],
    contrasts: [{ a: "Vou viajar em maio.", b: "Viajarei em maio.", explanation: "Coloquial frente a formal." }],
    exercises: [
      { type: "mc", prompt: "Nós ___ visitar os avós.", options: ["vamos", "vão", "vou", "vai"], answers: ["vamos"], explanation: "Nós → vamos." },
      { type: "mc", prompt: "Eu vou ___ o jantar.", options: ["fazer", "a fazer", "faço", "fazendo"], answers: ["fazer"], explanation: "Sin preposición." },
      { type: "fill", prompt: "Elas ___ chegar tarde.", answers: ["vão"], explanation: "Elas → vão." },
      { type: "correct", prompt: "Vou a comprar pão.", answers: ["Vou comprar pão."], explanation: "Sin a." },
    ],
  },
  {
    id: "pt:g:estar-gerundio",
    language: "pt",
    title: "Estar + gerundio (estou fazendo)",
    cefr: "A2",
    errorCategory: "pt:progressive",
    summary:
      "Para lo que pasa ahora, en Brasil se usa estar + gerundio, igual que en español: estou lendo. En Portugal es más común estar a + infinitivo: estou a ler.",
    whenToUse: ["Acción en curso: O que você está fazendo?", "Situación temporal: Estou morando com amigos."],
    formation: ["estou, está, estamos, estão + -ando / -endo / -indo.", "Portugal: estar a + infinitivo."],
    commonMistakes: [
      { wrong: "Eu estou trabalhar.", right: "Eu estou trabalhando.", why: "Estar + gerundio (en Brasil), no + infinitivo." },
      { wrong: "Estamos estudiando.", right: "Estamos estudando.", why: "Gerundio portugués en -ando (no -iando)." },
    ],
    examples: [
      { text: "Está chovendo muito.", translation: es("Está lloviendo mucho.") },
      { text: "Estou aprendendo português.", translation: es("Estoy aprendiendo portugués.") },
    ],
    contrasts: [{ a: "Estou lendo (Brasil)", b: "Estou a ler (Portugal)", explanation: "Misma idea, distinta variedad." }],
    exercises: [
      { type: "mc", prompt: "Silêncio, o bebê está ___.", options: ["dormindo", "dormiendo", "dormir", "dorme"], answers: ["dormindo"], explanation: "Dormir → dormindo." },
      { type: "mc", prompt: "O que vocês estão ___?", options: ["fazendo", "fazer", "feito", "faziendo"], answers: ["fazendo"], explanation: "Fazer → fazendo." },
      { type: "fill", prompt: "Eu ___ trabalhando de casa esta semana.", answers: ["estou"], explanation: "Eu → estou." },
      { type: "correct", prompt: "Estamos comiendo pizza.", answers: ["Estamos comendo pizza."], explanation: "Gerundio portugués: comendo." },
    ],
  },
  {
    id: "pt:g:comparativos",
    language: "pt",
    title: "Comparativos: mais … (do) que, melhor, maior…",
    cefr: "A2",
    errorCategory: "pt:comparatives",
    summary:
      "Más … que se dice mais … (do) que. Irregulares: bom → melhor, mau/ruim → pior, grande → maior, pequeno → menor («mais pequeno» se oye sobre todo en Portugal). Igualdad: tão … quanto/como.",
    whenToUse: ["Comparar: São Paulo é maior do que o Rio.", "Opinar: Este é o melhor restaurante."],
    formation: ["mais / menos + adjetivo + (do) que.", "tão + adjetivo + quanto/como.", "Superlativo: o/a mais … de; -íssimo: lindíssimo."],
    commonMistakes: [
      { wrong: "É mais grande que o outro.", right: "É maior do que o outro.", why: "Grande → maior." },
      { wrong: "É mais bom.", right: "É melhor.", why: "Bom → melhor." },
    ],
    examples: [
      { text: "O metrô é mais rápido do que o ônibus.", translation: es("El metro es más rápido que el autobús.") },
      { text: "Ela é tão alta quanto a mãe.", translation: es("Es tan alta como su madre.") },
    ],
    contrasts: [{ a: "melhor (mejor)", b: "maior (mayor/más grande)", explanation: "No confundir melhor con maior." }],
    exercises: [
      { type: "mc", prompt: "Esta casa é ___ do que a nossa.", options: ["maior", "mais grande", "melhor grande", "grandíssima"], answers: ["maior"], explanation: "Grande → maior." },
      { type: "mc", prompt: "O café daqui é ___ da cidade.", options: ["o melhor", "o mais bom", "o maior bom", "melhor"], answers: ["o melhor"], explanation: "Bom → o melhor." },
      { type: "fill", prompt: "Ele é tão simpático ___ o irmão.", answers: ["quanto", "como"], explanation: "Tão … quanto/como." },
      { type: "correct", prompt: "Meu carro é mais pequeno que o seu.", answers: ["Meu carro é menor do que o seu.", "Meu carro é menor que o seu."], explanation: "Pequeno → menor." },
    ],
  },
  {
    id: "pt:g:mais-que-perfeito",
    language: "pt",
    title: "Pluscuamperfecto: tinha feito",
    cefr: "B1",
    errorCategory: "pt:pluperfect",
    summary:
      "Para una acción anterior a otra pasada se usa ter en imperfeito + participio: eu tinha saído (yo había salido). La forma simple (saíra) existe pero es literaria.",
    whenToUse: ["Quando cheguei, o filme já tinha começado.", "Nunca tinha visto neve."],
    formation: ["tinha, tinha, tínhamos, tinham + participio.", "El auxiliar es ter (no haver en el habla)."],
    commonMistakes: [
      { wrong: "Eu havia comido (en conversación).", right: "Eu tinha comido.", why: "En el habla se usa ter; haver suena formal." },
      { wrong: "Quando cheguei, ele já saiu.", right: "Quando cheguei, ele já tinha saído.", why: "Anterior a otro pasado → tinha + participio." },
    ],
    examples: [
      { text: "Eles já tinham jantado.", translation: es("Ya habían cenado.") },
      { text: "Eu nunca tinha estado no Brasil.", translation: es("Nunca había estado en Brasil.") },
    ],
    contrasts: [{ a: "Ele saiu quando cheguei.", b: "Ele tinha saído quando cheguei.", explanation: "Salió al llegar yo / ya había salido." }],
    exercises: [
      { type: "mc", prompt: "Nós ___ esquecido as chaves.", options: ["tínhamos", "temos", "tivemos", "tinha"], answers: ["tínhamos"], explanation: "Nós → tínhamos." },
      { type: "mc", prompt: "Quando liguei, ela já ___ dormido.", options: ["tinha", "teve", "tem", "tinham"], answers: ["tinha"], explanation: "Ela → tinha." },
      { type: "fill", prompt: "Eles ___ viajado antes. (ter)", answers: ["tinham"], explanation: "Eles tinham." },
      { type: "correct", prompt: "Eu já tinha fazido isso.", answers: ["Eu já tinha feito isso."], explanation: "Participio irregular: feito." },
    ],
  },
  {
    id: "pt:g:imperativo",
    language: "pt",
    title: "Imperativo en Brasil",
    cefr: "B1",
    errorCategory: "pt:imperative",
    summary:
      "Con você, el imperativo usa la forma del subjuntivo (fale, venha, faça). En el habla brasileña informal se oye mucho la forma de tu (fala!, vem!), aunque se trate de você.",
    whenToUse: ["Instrucciones: Vire à direita.", "Invitaciones: Entre, por favor!"],
    formation: ["Você: fale, coma, abra · irregulares: faça, venha, diga, vá, seja.", "Vocês: falem, comam.", "Negativo: não fale, não façam."],
    commonMistakes: [
      { wrong: "Não fala isso! (en registro formal)", right: "Não fale isso!", why: "Formal/escrito: forma del subjuntivo." },
      { wrong: "Faz o favor de sentar (a un cliente).", right: "Faça o favor de se sentar.", why: "Con você en registro cuidado → faça." },
    ],
    examples: [
      { text: "Venha jantar com a gente!", translation: es("¡Ven a cenar con nosotros!") },
      { text: "Não esqueça o guarda-chuva.", translation: es("No olvides el paraguas.") },
    ],
    contrasts: [{ a: "Fala mais devagar! (coloquial)", b: "Fale mais devagar, por favor. (cuidado)", explanation: "Mismo significado, distinto registro." }],
    exercises: [
      { type: "mc", prompt: "Por favor, ___ a porta. (você, fechar)", options: ["feche", "fecha", "fechar", "fechou"], answers: ["feche"], explanation: "Você → feche." },
      { type: "mc", prompt: "___ aqui amanhã! (você, vir)", options: ["Venha", "Vem", "Vir", "Veio"], answers: ["Venha"], explanation: "Registro cuidado → venha." },
      { type: "fill", prompt: "Não ___ barulho, crianças! (fazer, vocês)", answers: ["façam"], explanation: "Vocês → façam." },
      { type: "correct", prompt: "Senhor, sente-se e espera, por favor.", answers: ["Senhor, sente-se e espere, por favor."], explanation: "Con o senhor → espere." },
    ],
  },
  {
    id: "pt:g:subjuntivo-imperfeito",
    language: "pt",
    title: "Imperfeito do subjuntivo: se eu tivesse…",
    cefr: "B2",
    errorCategory: "pt:subj-imperfect",
    summary:
      "Equivale a nuestro «tuviera/tuviese». Se forma desde la 3.ª persona plural del pretérito perfeito: tiveram → tivesse, fizeram → fizesse. Aparece en hipótesis (se eu fosse…) y tras verbos en pasado (queria que você viesse).",
    whenToUse: ["Hipótesis: Se eu tivesse tempo, iria.", "Deseos pasados: Ela pediu que eu esperasse."],
    formation: ["Raíz de eles-perfeito + -sse: falassem → falasse, fossem → fosse.", "Condicional en la otra parte: iria, faria, seria."],
    commonMistakes: [
      { wrong: "Se eu tinha dinheiro, viajaria.", right: "Se eu tivesse dinheiro, viajaria.", why: "Hipótesis → subjuntivo imperfeito." },
      { wrong: "Queria que você vem.", right: "Queria que você viesse.", why: "Pasado + que → subjuntivo imperfeito." },
    ],
    examples: [
      { text: "Se fosse mais barato, eu comprava.", translation: es("Si fuera más barato, lo compraría.") },
      { text: "Seria ótimo se vocês pudessem vir.", translation: es("Sería genial que pudierais venir.") },
    ],
    contrasts: [{ a: "Se eu puder, vou. (futuro do subjuntivo)", b: "Se eu pudesse, iria.", explanation: "Condición posible / hipotética." }],
    exercises: [
      { type: "mc", prompt: "Se eu ___ rico, compraria uma casa.", options: ["fosse", "for", "era", "seja"], answers: ["fosse"], explanation: "Hipótesis → fosse." },
      { type: "mc", prompt: "Ele pediu que nós ___ cedo.", options: ["chegássemos", "chegamos", "cheguemos", "chegarmos"], answers: ["chegássemos"], explanation: "Pasado + que → imperfeito." },
      { type: "fill", prompt: "Se você ___ tempo, me ligaria? (ter)", answers: ["tivesse"], explanation: "Ter → tivesse." },
      { type: "correct", prompt: "Se eu sabia, teria ajudado.", answers: ["Se eu soubesse, teria ajudado."], explanation: "Saber → soubesse." },
    ],
  },
  {
    id: "pt:g:passiva-se",
    language: "pt",
    title: "Pasiva con ser y con se: vendem-se casas",
    cefr: "C1",
    errorCategory: "pt:passive",
    summary:
      "La pasiva analítica usa ser + participio concordado (A lei foi aprovada). La pasiva con se concuerda en la norma culta con el sustantivo: vendem-se casas, alugam-se quartos. En el habla brasileña es frecuente la forma impersonal (vende-se casas), pero en textos cuidados se prefiere la concordancia.",
    whenToUse: ["Noticias y textos formales: Foram presos dois suspeitos.", "Anuncios: Precisa-se de vendedores · Alugam-se apartamentos."],
    formation: ["ser + participio (concuerda): As obras foram concluídas.", "Verbo + se concordando con el sujeto paciente: consertam-se relógios.", "Con preposición es impersonal (singular): precisa-se de…"],
    commonMistakes: [
      { wrong: "Vende-se apartamentos (texto formal).", right: "Vendem-se apartamentos.", why: "Norma culta: el verbo concuerda con apartamentos." },
      { wrong: "Precisam-se de funcionários.", right: "Precisa-se de funcionários.", why: "Con preposición (de) es impersonal: singular." },
    ],
    examples: [
      { text: "O prédio foi construído em 1920.", translation: es("El edificio fue construido en 1920.") },
      { text: "Aqui se falam várias línguas.", translation: es("Aquí se hablan varias lenguas.") },
    ],
    contrasts: [{ a: "Alugam-se casas.", b: "Precisa-se de ajuda.", explanation: "Sujeto paciente (concuerda) / complemento con preposición (singular)." }],
    exercises: [
      { type: "mc", prompt: "___ quartos para estudantes.", options: ["Alugam-se", "Aluga-se de", "Alugou", "Alugado"], answers: ["Alugam-se"], explanation: "Quartos (plural) → alugam-se." },
      { type: "mc", prompt: "As provas ___ corrigidas ontem.", options: ["foram", "foi", "eram", "são"], answers: ["foram"], explanation: "Pasado + plural → foram." },
      { type: "fill", prompt: "Precisa-se ___ cozinheiro.", answers: ["de"], explanation: "Precisar de." },
      { type: "correct", prompt: "As cartas foi enviadas.", answers: ["As cartas foram enviadas."], explanation: "Plural → foram." },
    ],
  },
];
