/**
 * Historias graduadas para principiantes (A1–A2), escritas a mano: frases
 * cortas, vocabulario de las 500 palabras más frecuentes, traducción frase a
 * frase y preguntas de comprensión en español.
 */
import type { CefrLevel, LanguageCode } from "./types";

export interface StoryLine {
  t: string;
  es: string;
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

const L = (t: string, es: string): StoryLine => ({ t, es });
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
};

export function storiesFor(lang: LanguageCode): Story[] {
  return STORIES[lang] ?? [];
}

export function getStory(lang: LanguageCode, id: string): Story | undefined {
  return storiesFor(lang).find((s) => s.id === id);
}
