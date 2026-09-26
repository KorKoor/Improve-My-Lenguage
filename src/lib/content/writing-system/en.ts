// Revisión nativa: pendiente
import { N, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

export const EN_WRITING: WritingSystem = {
  alphabetNote: "26 letras, sin ñ ni tildes. Los nombres de las letras son muy distintos del español: aprende a deletrear tu nombre.",
  spelling: true,
  alphabet: [
    N("A a", "ei"), N("B b", "bi"), N("C c", "si"), N("D d", "di"), N("E e", "i"), N("F f", "ef"), N("G g", "yi (dyi)"),
    N("H h", "eich"), N("I i", "ai"), N("J j", "yei (dyei)"), N("K k", "kei"), N("L l", "el"), N("M m", "em"), N("N n", "en"),
    N("O o", "ou"), N("P p", "pi"), N("Q q", "kiu"), N("R r", "ar"), N("S s", "es"), N("T t", "ti"), N("U u", "iu"),
    N("V v", "vi"), N("W w", "dábel-iu"), N("X x", "eks"), N("Y y", "uai"), N("Z z", "zi (EE. UU.) / zed (R. U.)"),
  ],
  signs: [
    SG("'", "apóstrofo", "Une contracciones (I'm = I am) y marca posesión (Anna's = de Anna).", "Anna's book", "el libro de Anna"),
    SG("I", "«yo» siempre con mayúscula", "El pronombre I (yo) se escribe con mayúscula en cualquier posición.", "Yes, I can.", "Sí, puedo."),
    SG("“ ”", "comillas", "Comillas altas: “Hello”. No hay ¿ ni ¡.", "“Hi!”", "«¡Hola!»"),
  ],
  typing: { phone: "El inglés no necesita letras especiales: vale el teclado en español. Desactiva la autocorrección en español si te cambia las palabras (o añade el teclado de inglés).", computer: "Vale tu teclado en español. Si quieres, añade el de inglés en Configuración › Hora e idioma (Windows) o Teclado › Fuentes de entrada (Mac)." },
  units: [
    {
      id: "capitals",
      level: "A1",
      kind: "capitals",
      title: "Mayúsculas en inglés",
      rules: [
        R("caps-days", "Días, meses, idiomas y nacionalidades con mayúscula", "Al revés que en español: Monday, January, English, Spanish. Y el pronombre I siempre con mayúscula.", [["on Monday", undefined, "el lunes"], ["I speak Spanish.", undefined, "Hablo español."]], { q: "¿Cuál está bien escrita?", options: ["I study English on Mondays.", "i study english on mondays.", "I study english on Mondays."], answer: "I study English on Mondays.", lang: "target" }),
        R("dates-us", "Fechas: cuidado con el orden", "En EE. UU. se escribe mes/día: 7/4 es 4 de julio. En Reino Unido, día/mes como en español. Escribir el mes con letras evita líos: July 4.", [["July 4, 2026", undefined, "4 de julio de 2026 (EE. UU.)"], ["4 July 2026", undefined, "4 de julio de 2026 (R. U.)"]], { q: "En EE. UU., ¿qué fecha es 3/5?", options: ["5 de marzo", "3 de mayo"], answer: "5 de marzo", lang: "es" }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Puntuación y números",
      rules: [
        R("no-inverted", "Sin ¿ ni ¡", "Las preguntas y exclamaciones sólo llevan el signo al final: How are you?", [["How are you?", undefined, "¿Cómo estás?"], ["Great!", undefined, "¡Genial!"]], { q: "¿Cuál está bien escrita?", options: ["Where are you?", "¿Where are you?", "¿Where are you"], answer: "Where are you?", lang: "target" }),
        R("decimal-point", "Punto decimal y coma de miles", "Al revés que en muchos países hispanos: 3.5 (three point five) y 1,000 (mil).", [["3.5 km", undefined, "3,5 km"], ["$1,200", undefined, "1200 dólares"]], { q: "¿Cómo se escribe «dos y medio» en inglés?", options: ["2.5", "2,5"], answer: "2.5", lang: "target" }),
      ],
    },
    {
      id: "contractions",
      level: "A1",
      kind: "signs",
      title: "Contracciones con apóstrofo",
      rules: [
        R("contractions", "I'm, don't, it's", "En el habla se unen palabras y el apóstrofo marca lo que falta: I am → I'm, do not → don't, it is → it's.", [["I'm tired.", undefined, "Estoy cansado."], ["I don't know.", undefined, "No sé."]], { q: "¿Cómo se contrae «do not»?", options: ["don't", "dont", "do'nt"], answer: "don't", lang: "target" }),
        R("its", "it's / its", "it's = it is (es / está). its = su (de una cosa o animal), sin apóstrofo.", [["It's cold.", undefined, "Hace frío."], ["The dog wants its ball.", undefined, "El perro quiere su pelota."]], { q: "Completa: «___ raining» (está lloviendo).", options: ["It's", "Its"], answer: "It's", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Palabras que suenan igual",
      rules: [
        R("there-their", "there / their / they're", "Suenan igual (der): there = allí / hay; their = su (de ellos); they're = they are.", [["There is a park.", undefined, "Hay un parque."], ["Their car is red.", undefined, "Su coche (de ellos) es rojo."], ["They're here.", undefined, "Están aquí."]], { q: "Completa: «___ house is big» (su casa, de ellos).", options: ["Their", "There", "They're"], answer: "Their", lang: "target" }),
        R("to-too-two", "to / too / two", "Suenan igual (tu): to = a / para; too = también, demasiado; two = dos.", [["I go to school.", undefined, "Voy a la escuela."], ["Me too!", undefined, "¡Yo también!"], ["two cats", undefined, "dos gatos"]], { q: "Completa: «I want ___ coffees» (dos cafés).", options: ["two", "too", "to"], answer: "two", lang: "target" }),
      ],
    },
  ],
};
