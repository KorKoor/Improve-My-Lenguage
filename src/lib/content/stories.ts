/**
 * Historias graduadas para principiantes (A1–A2), escritas a mano: frases
 * cortas, vocabulario de las 500 palabras más frecuentes, traducción frase a
 * frase y preguntas de comprensión en español.
 */
import type { CefrLevel, LanguageCode } from "./types";

export interface StoryLine {
  t: string;
  es: string;
  /** Transcripción latina (ruso, árabe, japonés, coreano, chino). */
  r?: string;
}

export interface StoryQuestion {
  q: string;
  options: string[];
  answer: string;
}

export interface Story {
  id: string;
  level: CefrLevel;
  emoji: string;
  title: string;
  lines: StoryLine[];
  questions: StoryQuestion[];
}

const L = (t: string, es: string, r?: string): StoryLine => (r ? { t, es, r } : { t, es });
const Q = (q: string, answer: string, ...others: string[]): StoryQuestion => ({ q, answer, options: [answer, ...others].sort((a, b) => a.localeCompare(b, "es")) });

export const STORIES: Partial<Record<LanguageCode, Story[]>> = {
  fr: [
    {
      id: "cafe", level: "A1", emoji: "☕", title: "Au café",
      lines: [
        L("Marie entre dans un café.", "Marie entra en un café."),
        L("Il est huit heures du matin.", "Son las ocho de la mañana."),
        L("« Bonjour ! Un café, s'il vous plaît. »", "«¡Buenos días! Un café, por favor.»"),
        L("« Avec du lait ? » demande le serveur.", "«¿Con leche?», pregunta el camarero."),
        L("« Non, merci. Et un croissant. »", "«No, gracias. Y un cruasán.»"),
        L("Le café est chaud et le croissant est très bon.", "El café está caliente y el cruasán está muy bueno."),
        L("Marie paie trois euros et elle part au travail.", "Marie paga tres euros y se va al trabajo."),
      ],
      questions: [Q("¿Qué hora es?", "Las ocho de la mañana", "Las tres de la tarde", "Mediodía"), Q("¿Toma el café con leche?", "No", "Sí", "No lo dice"), Q("¿Cuánto paga?", "Tres euros", "Ocho euros", "Nada")],
    },
    {
      id: "famille", level: "A1", emoji: "👨‍👩‍👧", title: "Ma famille",
      lines: [
        L("Je m'appelle Lucas et j'ai dix ans.", "Me llamo Lucas y tengo diez años."),
        L("J'habite à Lyon avec ma famille.", "Vivo en Lyon con mi familia."),
        L("Ma mère est médecin.", "Mi madre es médica."),
        L("Mon père travaille dans une école.", "Mi padre trabaja en una escuela."),
        L("J'ai une petite sœur. Elle s'appelle Léa.", "Tengo una hermana pequeña. Se llama Léa."),
        L("Nous avons aussi un chien, Max.", "También tenemos un perro, Max."),
        L("Le dimanche, nous mangeons chez ma grand-mère.", "Los domingos comemos en casa de mi abuela."),
      ],
      questions: [Q("¿Dónde vive Lucas?", "En Lyon", "En París", "En Madrid"), Q("¿Qué es su madre?", "Médica", "Profesora", "Camarera"), Q("¿Cómo se llama el perro?", "Max", "Léa", "Lucas")],
    },
    {
      id: "train", level: "A2", emoji: "🚆", title: "Le train en retard",
      lines: [
        L("Hier, Paul devait prendre le train pour Paris.", "Ayer, Paul tenía que tomar el tren a París."),
        L("Il est arrivé à la gare à neuf heures.", "Llegó a la estación a las nueve."),
        L("Mais le train avait une heure de retard.", "Pero el tren tenía una hora de retraso."),
        L("Alors, il a acheté un journal et un sandwich.", "Así que compró un periódico y un bocadillo."),
        L("Il a parlé avec une femme très sympathique.", "Habló con una mujer muy simpática."),
        L("Elle aussi allait à Paris pour le travail.", "Ella también iba a París por trabajo."),
        L("Finalement, le voyage a été plus agréable que prévu.", "Al final, el viaje fue más agradable de lo previsto."),
      ],
      questions: [Q("¿Qué problema tuvo el tren?", "Llegó con una hora de retraso", "Se canceló", "Estaba lleno"), Q("¿Qué compró Paul?", "Un periódico y un bocadillo", "Un billete nuevo", "Un café"), Q("¿Cómo fue el viaje al final?", "Más agradable de lo previsto", "Muy aburrido", "Muy caro")],
    },
  ],
  en: [
    {
      id: "family", level: "A1", emoji: "👨‍👩‍👧", title: "My family",
      lines: [
        L("My name is Sam and I live in London.", "Me llamo Sam y vivo en Londres."),
        L("I live with my mother and my brother.", "Vivo con mi madre y mi hermano."),
        L("My mother is a nurse.", "Mi madre es enfermera."),
        L("My brother is ten years old.", "Mi hermano tiene diez años."),
        L("We have a small dog called Toby.", "Tenemos un perro pequeño que se llama Toby."),
        L("On Sundays we go to the park together.", "Los domingos vamos juntos al parque."),
      ],
      questions: [Q("¿Dónde vive Sam?", "En Londres", "En Nueva York", "En Madrid"), Q("¿Qué es su madre?", "Enfermera", "Médica", "Profesora"), Q("¿Cuántos años tiene su hermano?", "Diez", "Doce", "Ocho")],
    },
    {
      id: "coffee", level: "A1", emoji: "☕", title: "At the café",
      lines: [
        L("Anna goes into a small café.", "Anna entra en una cafetería pequeña."),
        L("It is eight o'clock in the morning.", "Son las ocho de la mañana."),
        L("\"Good morning! A coffee, please.\"", "«¡Buenos días! Un café, por favor.»"),
        L("\"With milk?\" asks the waiter.", "«¿Con leche?», pregunta el camarero."),
        L("\"No, thank you. And a muffin.\"", "«No, gracias. Y una magdalena.»"),
        L("The coffee is hot and the muffin is very good.", "El café está caliente y la magdalena está muy buena."),
        L("Anna pays four dollars and goes to work.", "Anna paga cuatro dólares y se va al trabajo."),
      ],
      questions: [Q("¿Qué hora es?", "Las ocho de la mañana", "Las cuatro de la tarde", "Mediodía"), Q("¿Toma el café con leche?", "No", "Sí", "No lo dice"), Q("¿Cuánto paga?", "Cuatro dólares", "Ocho dólares", "Nada")],
    },
    {
      id: "new-job", level: "A2", emoji: "💼", title: "My first day",
      lines: [
        L("Yesterday was my first day at a new job.", "Ayer fue mi primer día en un trabajo nuevo."),
        L("I woke up early because I was nervous.", "Me desperté temprano porque estaba nervioso."),
        L("The office was big and full of plants.", "La oficina era grande y estaba llena de plantas."),
        L("My boss showed me my desk and my computer.", "Mi jefe me enseñó mi mesa y mi ordenador."),
        L("At lunch, I ate with two friendly colleagues.", "A la hora de comer, comí con dos compañeros simpáticos."),
        L("In the afternoon I answered emails and made a few calls.", "Por la tarde respondí correos e hice algunas llamadas."),
        L("When I got home, I was tired but happy.", "Cuando llegué a casa, estaba cansado pero contento."),
      ],
      questions: [Q("¿Por qué se despertó temprano?", "Porque estaba nervioso", "Porque vive lejos", "Porque tenía hambre"), Q("¿Cómo era la oficina?", "Grande y con plantas", "Pequeña y oscura", "Vacía"), Q("¿Cómo se sentía al volver?", "Cansado pero contento", "Triste", "Enfadado")],
    },
  ],
  it: [
    {
      id: "famiglia", level: "A1", emoji: "👨‍👩‍👧", title: "La mia famiglia",
      lines: [
        L("Mi chiamo Marco e abito a Napoli.", "Me llamo Marco y vivo en Nápoles."),
        L("Ho una sorella e un fratello.", "Tengo una hermana y un hermano."),
        L("Mia madre fa la cuoca.", "Mi madre es cocinera."),
        L("Mio padre lavora in una banca.", "Mi padre trabaja en un banco."),
        L("La domenica mangiamo dalla nonna.", "Los domingos comemos en casa de la abuela."),
      ],
      questions: [Q("¿Dónde vive Marco?", "En Nápoles", "En Roma", "En Milán"), Q("¿Qué es su madre?", "Cocinera", "Profesora", "Médica"), Q("¿Dónde comen los domingos?", "En casa de la abuela", "En un restaurante", "En el banco")],
    },
    {
      id: "bar", level: "A1", emoji: "☕", title: "Al bar",
      lines: [
        L("Giulia entra in un bar.", "Giulia entra en un bar."),
        L("Sono le otto di mattina.", "Son las ocho de la mañana."),
        L("«Buongiorno! Un cappuccino, per favore.»", "«¡Buenos días! Un capuchino, por favor.»"),
        L("«E un cornetto?» chiede il barista.", "«¿Y un cruasán?», pregunta el camarero."),
        L("«Sì, grazie. Al cioccolato.»", "«Sí, gracias. De chocolate.»"),
        L("Il cappuccino è caldo e il cornetto è buonissimo.", "El capuchino está caliente y el cruasán está buenísimo."),
        L("Giulia paga due euro e va al lavoro.", "Giulia paga dos euros y se va al trabajo."),
      ],
      questions: [Q("¿Qué pide Giulia primero?", "Un capuchino", "Un té", "Agua"), Q("¿De qué es el cruasán?", "De chocolate", "De crema", "Sin nada"), Q("¿Cuánto paga?", "Dos euros", "Ocho euros", "Nada")],
    },
    {
      id: "weekend", level: "A2", emoji: "⛰️", title: "Il fine settimana",
      lines: [
        L("Sabato scorso sono andato in montagna con i miei amici.", "El sábado pasado fui a la montaña con mis amigos."),
        L("Siamo partiti presto, alle sette.", "Salimos temprano, a las siete."),
        L("Faceva freddo, ma il cielo era azzurro.", "Hacía frío, pero el cielo estaba azul."),
        L("Abbiamo camminato per tre ore.", "Caminamos durante tres horas."),
        L("In cima abbiamo mangiato dei panini.", "En la cima comimos unos bocadillos."),
        L("La sera eravamo stanchi ma felici.", "Por la noche estábamos cansados pero felices."),
      ],
      questions: [Q("¿Con quién fue a la montaña?", "Con sus amigos", "Con su familia", "Solo"), Q("¿Qué tiempo hacía?", "Frío pero con cielo azul", "Llovía", "Mucho calor"), Q("¿Cuánto caminaron?", "Tres horas", "Siete horas", "Una hora")],
    },
  ],
  pt: [
    {
      id: "familia", level: "A1", emoji: "👨‍👩‍👧", title: "A minha família",
      lines: [
        L("Eu me chamo Júlia e moro em Lisboa.", "Me llamo Julia y vivo en Lisboa."),
        L("Tenho um irmão mais velho.", "Tengo un hermano mayor."),
        L("A minha mãe é professora.", "Mi madre es profesora."),
        L("O meu pai trabalha num hospital.", "Mi padre trabaja en un hospital."),
        L("Aos sábados vamos à praia juntos.", "Los sábados vamos juntos a la playa."),
      ],
      questions: [Q("¿Dónde vive Julia?", "En Lisboa", "En Oporto", "En Río"), Q("¿Qué es su madre?", "Profesora", "Médica", "Cocinera"), Q("¿Adónde van los sábados?", "A la playa", "Al cine", "Al hospital")],
    },
    {
      id: "padaria", level: "A1", emoji: "🥐", title: "Na padaria",
      lines: [
        L("Pedro entra numa padaria.", "Pedro entra en una panadería."),
        L("São sete horas da manhã.", "Son las siete de la mañana."),
        L("«Bom dia! Um café e um pão de queijo, por favor.»", "«¡Buenos días! Un café y un pan de queso, por favor.»"),
        L("«Mais alguma coisa?» pergunta a moça.", "«¿Algo más?», pregunta la chica."),
        L("«Não, obrigado. Quanto é?»", "«No, gracias. ¿Cuánto es?»"),
        L("«São seis reais.»", "«Son seis reales.»"),
        L("Pedro paga e vai para o trabalho de ônibus.", "Pedro paga y se va al trabajo en autobús."),
      ],
      questions: [Q("¿Qué pide Pedro?", "Un café y un pan de queso", "Un té", "Un zumo"), Q("¿Cuánto cuesta?", "Seis reales", "Siete reales", "Dos reales"), Q("¿Cómo va al trabajo?", "En autobús", "Andando", "En coche")],
    },
    {
      id: "praia", level: "A2", emoji: "🏖️", title: "Um dia na praia",
      lines: [
        L("No domingo, fomos à praia com a família.", "El domingo fuimos a la playa con la familia."),
        L("Fazia muito calor e o mar estava tranquilo.", "Hacía mucho calor y el mar estaba tranquilo."),
        L("As crianças brincaram na areia a manhã toda.", "Los niños jugaron en la arena toda la mañana."),
        L("Ao meio-dia, comemos peixe num restaurante pequeno.", "Al mediodía comimos pescado en un restaurante pequeño."),
        L("À tarde, meu pai dormiu debaixo do guarda-sol.", "Por la tarde, mi padre durmió debajo de la sombrilla."),
        L("Voltamos para casa cansados, mas muito contentes.", "Volvimos a casa cansados, pero muy contentos."),
      ],
      questions: [Q("¿Qué tiempo hacía?", "Mucho calor", "Frío", "Llovía"), Q("¿Qué comieron?", "Pescado", "Pizza", "Nada"), Q("¿Qué hizo el padre por la tarde?", "Durmió bajo la sombrilla", "Nadó", "Cocinó")],
    },
  ],
  de: [
    {
      id: "familie", level: "A1", emoji: "👨‍👩‍👧", title: "Meine Familie",
      lines: [
        L("Ich heiße Anna und wohne in München.", "Me llamo Anna y vivo en Múnich."),
        L("Ich habe einen Bruder und eine Schwester.", "Tengo un hermano y una hermana."),
        L("Meine Mutter ist Ärztin.", "Mi madre es médica."),
        L("Mein Vater arbeitet in einer Schule.", "Mi padre trabaja en una escuela."),
        L("Am Sonntag essen wir bei Oma.", "El domingo comemos en casa de la abuela."),
      ],
      questions: [Q("¿Dónde vive Anna?", "En Múnich", "En Berlín", "En Viena"), Q("¿Qué es su madre?", "Médica", "Profesora", "Cocinera"), Q("¿Dónde comen el domingo?", "En casa de la abuela", "En un restaurante", "En la escuela")],
    },
    {
      id: "baecker", level: "A1", emoji: "🥨", title: "Beim Bäcker",
      lines: [
        L("Tom geht zum Bäcker.", "Tom va a la panadería."),
        L("Es ist sieben Uhr morgens.", "Son las siete de la mañana."),
        L("„Guten Morgen! Zwei Brötchen, bitte.“", "«¡Buenos días! Dos panecillos, por favor.»"),
        L("„Sonst noch etwas?“, fragt die Verkäuferin.", "«¿Algo más?», pregunta la vendedora."),
        L("„Ja, eine Brezel. Was kostet das?“", "«Sí, un pretzel. ¿Cuánto cuesta?»"),
        L("„Zusammen drei Euro.“", "«Tres euros en total.»"),
        L("Tom bezahlt und frühstückt zu Hause.", "Tom paga y desayuna en casa."),
      ],
      questions: [Q("¿Cuántos panecillos pide?", "Dos", "Tres", "Uno"), Q("¿Cuánto paga en total?", "Tres euros", "Siete euros", "Dos euros"), Q("¿Dónde desayuna?", "En casa", "En la panadería", "En el trabajo")],
    },
    {
      id: "umzug", level: "A2", emoji: "📦", title: "Die neue Wohnung",
      lines: [
        L("Letzten Monat bin ich nach Hamburg gezogen.", "El mes pasado me mudé a Hamburgo."),
        L("Meine neue Wohnung ist klein, aber hell.", "Mi piso nuevo es pequeño, pero luminoso."),
        L("Sie hat einen Balkon mit Blick auf den Park.", "Tiene un balcón con vistas al parque."),
        L("Am ersten Tag haben mir meine Nachbarn geholfen.", "El primer día me ayudaron mis vecinos."),
        L("Wir haben die Kisten zusammen getragen.", "Llevamos las cajas juntos."),
        L("Danach habe ich sie zum Kaffee eingeladen.", "Después los invité a un café."),
      ],
      questions: [Q("¿Adónde se mudó?", "A Hamburgo", "A Berlín", "A un pueblo"), Q("¿Cómo es el piso?", "Pequeño pero luminoso", "Grande y oscuro", "Muy caro"), Q("¿Quién lo ayudó?", "Sus vecinos", "Su familia", "Nadie")],
    },
  ],
  nl: [
    {
      id: "cafe", level: "A1", emoji: "☕", title: "In het café",
      lines: [
        L("Sanne gaat naar een klein café.", "Sanne va a un café pequeño."),
        L("Het is negen uur 's ochtends.", "Son las nueve de la mañana."),
        L("„Goedemorgen! Een koffie, alstublieft.”", "«¡Buenos días! Un café, por favor.»"),
        L("„Met melk?” vraagt de ober.", "«¿Con leche?», pregunta el camarero."),
        L("„Ja, graag. En een broodje kaas.”", "«Sí, por favor. Y un bocadillo de queso.»"),
        L("Sanne betaalt vijf euro en gaat naar haar werk.", "Sanne paga cinco euros y se va al trabajo."),
      ],
      questions: [Q("¿Qué hora es?", "Las nueve de la mañana", "Las cinco de la tarde", "Mediodía"), Q("¿Toma el café con leche?", "Sí", "No", "No lo dice"), Q("¿Cuánto paga?", "Cinco euros", "Nueve euros", "Nada")],
    },
    {
      id: "familie", level: "A1", emoji: "👨‍👩‍👧", title: "Mijn familie",
      lines: [
        L("Ik heet Tim en ik woon in Utrecht.", "Me llamo Tim y vivo en Utrecht."),
        L("Ik woon met mijn ouders en mijn zus.", "Vivo con mis padres y mi hermana."),
        L("Mijn moeder is lerares.", "Mi madre es profesora."),
        L("Mijn vader werkt in een ziekenhuis.", "Mi padre trabaja en un hospital."),
        L("We hebben ook een kat. Ze heet Poes.", "También tenemos una gata. Se llama Poes."),
        L("Op zondag fietsen we samen.", "Los domingos vamos juntos en bicicleta."),
      ],
      questions: [Q("¿Dónde vive Tim?", "En Utrecht", "En Ámsterdam", "En Madrid"), Q("¿Dónde trabaja su padre?", "En un hospital", "En una escuela", "En casa"), Q("¿Qué hacen los domingos?", "Van en bicicleta", "Van al cine", "Cocinan")],
    },
  ],
  sv: [
    {
      id: "fika", level: "A1", emoji: "☕", title: "Fika",
      lines: [
        L("Anna och Erik tar en fika.", "Anna y Erik se toman un café con algo dulce."),
        L("De sitter på ett litet kafé.", "Están sentados en una cafetería pequeña."),
        L("Anna dricker kaffe och Erik dricker te.", "Anna bebe café y Erik bebe té."),
        L("De äter kanelbullar.", "Comen bollos de canela."),
        L("Kanelbullarna är varma och goda.", "Los bollos están calientes y ricos."),
        L("Efter fikan går de hem.", "Después del café se van a casa."),
      ],
      questions: [Q("¿Qué bebe Erik?", "Té", "Café", "Agua"), Q("¿Qué comen?", "Bollos de canela", "Pan con queso", "Fruta"), Q("¿Adónde van después?", "A casa", "Al trabajo", "Al parque")],
    },
    {
      id: "familj", level: "A1", emoji: "👨‍👩‍👧", title: "Min familj",
      lines: [
        L("Jag heter Lisa och jag bor i Göteborg.", "Me llamo Lisa y vivo en Gotemburgo."),
        L("Jag har en bror och en syster.", "Tengo un hermano y una hermana."),
        L("Min mamma är läkare.", "Mi madre es médica."),
        L("Min pappa lagar mat varje dag.", "Mi padre cocina todos los días."),
        L("Vi har en hund som heter Bosse.", "Tenemos un perro que se llama Bosse."),
        L("På lördag går vi till skogen.", "El sábado vamos al bosque."),
      ],
      questions: [Q("¿Dónde vive Lisa?", "En Gotemburgo", "En Estocolmo", "En Oslo"), Q("¿Qué es su madre?", "Médica", "Profesora", "Cocinera"), Q("¿Adónde van el sábado?", "Al bosque", "A la playa", "Al cine")],
    },
  ],
  ru: [
    {
      id: "kafe", level: "A1", emoji: "☕", title: "В кафе",
      lines: [
        L("Анна идёт в кафе.", "Anna va a un café.", "Ánna idyót v kafé."),
        L("Сейчас восемь часов утра.", "Son las ocho de la mañana.", "Seychás vósem' chasóv útra."),
        L("«Здравствуйте! Кофе, пожалуйста».", "«¡Hola! Un café, por favor.»", "«Zdrávstvuyte! Kófe, pozhálusta»."),
        L("«С молоком?» — спрашивает официант.", "«¿Con leche?», pregunta el camarero.", "«S molokóm?» — spráshivayet ofitsiánt."),
        L("«Нет, спасибо. И булочку».", "«No, gracias. Y un bollo.»", "«Net, spasíbo. I búlochku»."),
        L("Анна платит двести рублей и идёт на работу.", "Anna paga doscientos rublos y se va al trabajo.", "Ánna plátit dvésti rubléy i idyót na rabótu."),
      ],
      questions: [Q("¿Qué hora es?", "Las ocho de la mañana", "Las dos de la tarde", "Medianoche"), Q("¿Toma el café con leche?", "No", "Sí", "No lo dice"), Q("¿Cuánto paga?", "Doscientos rublos", "Ocho rublos", "Nada")],
    },
    {
      id: "semya", level: "A1", emoji: "👨‍👩‍👧", title: "Моя семья",
      lines: [
        L("Меня зовут Иван. Я живу в Москве.", "Me llamo Iván. Vivo en Moscú.", "Menyá zovút Iván. Ya zhivú v Moskvé."),
        L("У меня есть сестра. Её зовут Маша.", "Tengo una hermana. Se llama Masha.", "U menyá yest' sestrá. Yeyó zovút Másha."),
        L("Мама работает в школе.", "Mamá trabaja en una escuela.", "Máma rabótayet v shkóle."),
        L("Папа — врач.", "Papá es médico.", "Pápa — vrach."),
        L("У нас есть собака.", "Tenemos un perro.", "U nas yest' sobáka."),
        L("Вечером мы пьём чай вместе.", "Por la tarde tomamos té juntos.", "Véchérom my p'yom chay vméste."),
      ],
      questions: [Q("¿Dónde vive Iván?", "En Moscú", "En Kiev", "En Madrid"), Q("¿Dónde trabaja su madre?", "En una escuela", "En un hospital", "En una tienda"), Q("¿Qué hacen por la tarde?", "Toman té juntos", "Ven la tele", "Pasean al perro")],
    },
  ],
  ar: [
    {
      id: "maqha", level: "A1", emoji: "☕", title: "في المقهى",
      lines: [
        L("يدخل أحمد إلى المقهى.", "Ahmed entra en el café.", "yadkhulu Aḥmad ilā al-maqhā."),
        L("الساعة الثامنة صباحا.", "Son las ocho de la mañana.", "as-sāʿa ath-thāmina ṣabāḥan."),
        L("«صباح الخير! قهوة من فضلك».", "«¡Buenos días! Un café, por favor.»", "«ṣabāḥ al-khayr! qahwa min faḍlak»."),
        L("«بالحليب؟» يسأل النادل.", "«¿Con leche?», pregunta el camarero.", "«bil-ḥalīb?» yasʾalu an-nādil."),
        L("«لا، شكرا. وقطعة كعك».", "«No, gracias. Y un trozo de pastel.»", "«lā, shukran. wa-qiṭʿat kaʿk»."),
        L("يدفع أحمد عشرة دراهم ويذهب إلى العمل.", "Ahmed paga diez dírhams y se va al trabajo.", "yadfaʿu Aḥmad ʿasharat darāhim wa-yadhhabu ilā al-ʿamal."),
      ],
      questions: [Q("¿Qué hora es?", "Las ocho de la mañana", "Las diez de la noche", "Mediodía"), Q("¿Toma el café con leche?", "No", "Sí", "No lo dice"), Q("¿Cuánto paga?", "Diez dírhams", "Ocho dírhams", "Nada")],
    },
    {
      id: "usra", level: "A1", emoji: "👨‍👩‍👧", title: "عائلتي",
      lines: [
        L("اسمي سارة وأسكن في القاهرة.", "Me llamo Sara y vivo en El Cairo.", "ismī Sāra wa-askunu fī al-Qāhira."),
        L("عندي أخ صغير اسمه عمر.", "Tengo un hermano pequeño que se llama Omar.", "ʿindī akh ṣaghīr ismuhu ʿUmar."),
        L("أمي معلمة.", "Mi madre es profesora.", "ummī muʿallima."),
        L("أبي يعمل في مستشفى.", "Mi padre trabaja en un hospital.", "abī yaʿmalu fī mustashfā."),
        L("يوم الجمعة نأكل عند جدتي.", "El viernes comemos en casa de mi abuela.", "yawm al-jumuʿa naʾkulu ʿinda jaddatī."),
      ],
      questions: [Q("¿Dónde vive Sara?", "En El Cairo", "En Dubái", "En Madrid"), Q("¿Qué es su madre?", "Profesora", "Médica", "Cocinera"), Q("¿Dónde comen el viernes?", "En casa de la abuela", "En un restaurante", "En el hospital")],
    },
  ],
  ja: [
    {
      id: "kissaten", level: "A1", emoji: "☕", title: "きっさてんで",
      lines: [
        L("ゆいさんは きっさてんに はいります。", "Yui entra en una cafetería.", "Yui-san wa kissaten ni hairimasu."),
        L("いま、あさ はちじです。", "Ahora son las ocho de la mañana.", "Ima, asa hachi-ji desu."),
        L("「おはようございます。コーヒーを おねがいします。」", "«Buenos días. Un café, por favor.»", "«Ohayō gozaimasu. Kōhī o onegai shimasu.»"),
        L("「ミルクは いりますか。」", "«¿Quiere leche?»", "«Miruku wa irimasu ka.»"),
        L("「いいえ、けっこうです。」", "«No, gracias.»", "«Iie, kekkō desu.»"),
        L("ゆいさんは よんひゃくえん はらって、かいしゃに いきます。", "Yui paga cuatrocientos yenes y va a la oficina.", "Yui-san wa yonhyaku-en haratte, kaisha ni ikimasu."),
      ],
      questions: [Q("¿Qué hora es?", "Las ocho de la mañana", "Las cuatro de la tarde", "Medianoche"), Q("¿Quiere leche?", "No", "Sí", "No lo dice"), Q("¿Adónde va después?", "A la oficina", "A casa", "A la escuela")],
    },
    {
      id: "kazoku", level: "A1", emoji: "👨‍👩‍👧", title: "わたしの かぞく",
      lines: [
        L("わたしは けんです。とうきょうに すんでいます。", "Soy Ken. Vivo en Tokio.", "Watashi wa Ken desu. Tōkyō ni sunde imasu."),
        L("ちちと ははと いもうとが います。", "Tengo padre, madre y una hermana pequeña.", "Chichi to haha to imōto ga imasu."),
        L("ちちは いしゃです。", "Mi padre es médico.", "Chichi wa isha desu."),
        L("ははは りょうりが じょうずです。", "Mi madre cocina muy bien.", "Haha wa ryōri ga jōzu desu."),
        L("にちようびに みんなで こうえんに いきます。", "Los domingos vamos todos al parque.", "Nichiyōbi ni minna de kōen ni ikimasu."),
      ],
      questions: [Q("¿Dónde vive Ken?", "En Tokio", "En Osaka", "En Kioto"), Q("¿Qué es su padre?", "Médico", "Profesor", "Cocinero"), Q("¿Adónde van los domingos?", "Al parque", "Al cine", "A la playa")],
    },
  ],
  ko: [
    {
      id: "kape", level: "A1", emoji: "☕", title: "카페에서",
      lines: [
        L("민수 씨가 카페에 들어가요.", "Minsu entra en una cafetería.", "Minsu-ssiga kape-e deureogayo."),
        L("지금 아침 여덟 시예요.", "Ahora son las ocho de la mañana.", "Jigeum achim yeodeol siyeyo."),
        L("\"안녕하세요. 커피 한 잔 주세요.\"", "«Hola. Un café, por favor.»", "\"Annyeonghaseyo. Keopi han jan juseyo.\""),
        L("\"우유 넣을까요?\"", "«¿Le pongo leche?»", "\"Uyu neoeulkkayo?\""),
        L("\"아니요, 괜찮아요.\"", "«No, gracias.»", "\"Aniyo, gwaenchanayo.\""),
        L("민수 씨는 사천 원을 내고 회사에 가요.", "Minsu paga cuatro mil wones y va a la oficina.", "Minsu-ssineun sacheon woneul naego hoesa-e gayo."),
      ],
      questions: [Q("¿Qué hora es?", "Las ocho de la mañana", "Las cuatro de la tarde", "Mediodía"), Q("¿Quiere leche?", "No", "Sí", "No lo dice"), Q("¿Cuánto paga?", "Cuatro mil wones", "Ocho mil wones", "Nada")],
    },
    {
      id: "gajok", level: "A1", emoji: "👨‍👩‍👧", title: "우리 가족",
      lines: [
        L("저는 지은이에요. 서울에 살아요.", "Soy Jieun. Vivo en Seúl.", "Jeoneun Jieun-ieyo. Seoul-e sarayo."),
        L("우리 가족은 네 명이에요.", "Mi familia somos cuatro.", "Uri gajogeun ne myeongieyo."),
        L("아버지는 선생님이에요.", "Mi padre es profesor.", "Abeojineun seonsaengnimieyo."),
        L("어머니는 은행에서 일해요.", "Mi madre trabaja en un banco.", "Eomeonineun eunhaeng-eseo ilhaeyo."),
        L("주말에 같이 밥을 먹어요.", "Los fines de semana comemos juntos.", "Jumare gachi babeul meogeoyo."),
      ],
      questions: [Q("¿Dónde vive Jieun?", "En Seúl", "En Busan", "En Tokio"), Q("¿Cuántos son en su familia?", "Cuatro", "Tres", "Cinco"), Q("¿Dónde trabaja su madre?", "En un banco", "En una escuela", "En un hospital")],
    },
  ],
  zh: [
    {
      id: "kafeiguan", level: "A1", emoji: "☕", title: "在咖啡馆",
      lines: [
        L("小王走进一家咖啡馆。", "Xiao Wang entra en una cafetería.", "Xiǎo Wáng zǒujìn yì jiā kāfēiguǎn."),
        L("现在是早上八点。", "Ahora son las ocho de la mañana.", "Xiànzài shì zǎoshang bā diǎn."),
        L("「你好！请给我一杯咖啡。」", "«¡Hola! Un café, por favor.»", "«Nǐ hǎo! Qǐng gěi wǒ yì bēi kāfēi.»"),
        L("「要加牛奶吗？」", "«¿Le pongo leche?»", "«Yào jiā niúnǎi ma?»"),
        L("「不要，谢谢。」", "«No, gracias.»", "«Bú yào, xièxie.»"),
        L("小王付了二十块钱，然后去上班。", "Xiao Wang paga veinte yuanes y luego va a trabajar.", "Xiǎo Wáng fùle èrshí kuài qián, ránhòu qù shàngbān."),
      ],
      questions: [Q("¿Qué hora es?", "Las ocho de la mañana", "Las veinte horas", "Mediodía"), Q("¿Quiere leche?", "No", "Sí", "No lo dice"), Q("¿Cuánto paga?", "Veinte yuanes", "Ocho yuanes", "Nada")],
    },
    {
      id: "jiating", level: "A1", emoji: "👨‍👩‍👧", title: "我的家",
      lines: [
        L("我叫李明，我住在北京。", "Me llamo Li Ming y vivo en Pekín.", "Wǒ jiào Lǐ Míng, wǒ zhù zài Běijīng."),
        L("我家有四口人。", "En mi familia somos cuatro.", "Wǒ jiā yǒu sì kǒu rén."),
        L("爸爸是医生，妈妈是老师。", "Papá es médico y mamá es profesora.", "Bàba shì yīshēng, māma shì lǎoshī."),
        L("我还有一个妹妹。", "También tengo una hermana pequeña.", "Wǒ hái yǒu yí ge mèimei."),
        L("周末我们一起吃饭。", "Los fines de semana comemos juntos.", "Zhōumò wǒmen yìqǐ chīfàn."),
      ],
      questions: [Q("¿Dónde vive Li Ming?", "En Pekín", "En Shanghái", "En Madrid"), Q("¿Qué es su madre?", "Profesora", "Médica", "Cocinera"), Q("¿Cuántos son en la familia?", "Cuatro", "Tres", "Dos")],
    },
  ],
};

export function storiesFor(lang: LanguageCode): Story[] {
  return STORIES[lang] ?? [];
}

export function getStory(lang: LanguageCode, id: string): Story | undefined {
  return storiesFor(lang).find((s) => s.id === id);
}
