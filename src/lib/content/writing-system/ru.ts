// Revisión nativa: pendiente
import { N, scriptTyping, SG } from "./helpers";
import { R } from "./rule";
import type { WritingSystem } from "./types";

/** Nombres de las letras rusas (así se deletrea: «эм, а, эм, а»). */
export const RU_WRITING: WritingSystem = {
  alphabetNote: "33 letras en este orden. Es el orden del diccionario y el que se usa al deletrear.",
  spelling: true,
  alphabet: [
    N("А а", "a", "а"), N("Б б", "be", "бэ"), N("В в", "ve", "вэ"), N("Г г", "gue", "гэ"), N("Д д", "de", "дэ"), N("Е е", "ye", "е"),
    N("Ё ё", "yo", "ё"), N("Ж ж", "zhe", "жэ"), N("З з", "ze", "зэ"), N("И и", "i", "и"), N("Й й", "i kratkoye (i breve)", "и краткое"),
    N("К к", "ka", "ка"), N("Л л", "el", "эль"), N("М м", "em", "эм"), N("Н н", "en", "эн"), N("О о", "o", "о"), N("П п", "pe", "пэ"),
    N("Р р", "er", "эр"), N("С с", "es", "эс"), N("Т т", "te", "тэ"), N("У у", "u", "у"), N("Ф ф", "ef", "эф"), N("Х х", "ja", "ха"),
    N("Ц ц", "tse", "цэ"), N("Ч ч", "che", "че"), N("Ш ш", "sha", "ша"), N("Щ щ", "shcha", "ща"), N("Ъ ъ", "tviordy znak (signo duro)", "твёрдый знак"),
    N("Ы ы", "y", "ы"), N("Ь ь", "miajki znak (signo blando)", "мягкий знак"), N("Э э", "e", "э"), N("Ю ю", "yu", "ю"), N("Я я", "ya", "я"),
  ],
  signs: [
    SG("ё", "yo (con dos puntos)", "En libros y periódicos casi siempre se escribe е sin puntos, pero se lee «yo»: ещё, всё.", "ещё", "todavía, más"),
    SG("´", "acento de intensidad", "Sólo en diccionarios y libros para aprender: вода́. En textos normales no aparece.", "молоко́", "leche"),
    SG("« »", "comillas", "Comillas angulares, sin espacios: «Привет».", "«Да»", "«Sí»"),
    SG("—", "raya", "Sustituye al verbo «ser» en el presente: Москва — столица (Moscú es la capital).", "Я — студент.", "Soy estudiante."),
  ],
  typing: scriptTyping("ruso", "En el móvil puedes escribir en cirílico con el teclado ЙЦУКЕН; la ё suele estar pulsando largo la е."),
  units: [
    {
      id: "capitals",
      level: "A1",
      kind: "capitals",
      title: "Mayúsculas y usted",
      rules: [
        R("lower-days", "Días, meses e idiomas en minúscula", "Como en español: понедельник, январь, русский язык. Nombres de personas y ciudades con mayúscula.", [["в понедельник", "v panidél'nik", "el lunes"], ["Я говорю по-русски.", undefined, "Hablo ruso."]], { q: "¿Cómo se escribe «enero»?", options: ["январь", "Январь"], answer: "январь", lang: "target" }),
        R("vy", "Вы con mayúscula en cartas", "Вы (usted) se escribe con mayúscula cuando te diriges a una persona por escrito, por respeto. En diálogos de libros, вы en minúscula.", [["Как Вы поживаете?", undefined, "¿Cómo está usted? (carta)"]], { q: "En un correo formal a una persona, «usted» se escribe…", options: ["Вы", "вы"], answer: "Вы", lang: "target" }),
      ],
    },
    {
      id: "signs",
      level: "A1",
      kind: "signs",
      title: "ё, ь, ъ: signos que cambian la palabra",
      rules: [
        R("yo-e", "ё se escribe casi siempre como е", "Verás все (todos) y всё (todo) escritos igual. El contexto (y la app) te dice cómo se lee.", [["все", "fsie", "todos"], ["всё", "fsio", "todo"]], { q: "¿Qué palabra se lee «fsio» (todo)?", options: ["всё", "все"], answer: "всё", lang: "target" }),
        R("soft-sign-writing", "No olvides la ь", "Sin ь es otra palabra o un error: брат (hermano) / брать (tomar). Los infinitivos suelen acabar en -ть.", [["брат", "brat", "hermano"], ["брать", "brat'", "tomar"]], { q: "¿Cómo se escribe «tomar»?", options: ["брать", "брат"], answer: "брать", lang: "target" }),
      ],
    },
    {
      id: "punctuation",
      level: "A1",
      kind: "punctuation",
      title: "Puntuación rusa",
      rules: [
        R("comma-chto", "Coma antes de что, где, когда…", "Las subordinadas van separadas por coma: Я знаю, что он дома. Sin ¿ ni ¡.", [["Я думаю, что да.", undefined, "Creo que sí."]], { q: "¿Cuál está bien puntuada?", options: ["Я знаю, где он.", "Я знаю где он.", "¿Я знаю, где он?"], answer: "Я знаю, где он.", lang: "target" }),
        R("dash", "La raya en lugar de «es»", "En presente el verbo «ser» no se dice; entre dos sustantivos se escribe una raya: Мой брат — врач.", [["Мой брат — врач.", undefined, "Mi hermano es médico."]], { q: "¿Cuál está bien escrita?", options: ["Анна — врач.", "Анна есть врач."], answer: "Анна — врач.", lang: "target" }),
      ],
    },
    {
      id: "spelling-a2",
      level: "A2",
      kind: "spelling",
      title: "Reglas de escritura de las vocales",
      rules: [
        R("zhi-shi", "жи, ши con и (nunca ы)", "Tras ж y ш se escribe и aunque suene «y»: жизнь, машина.", [["машина", "mashýna", "coche"], ["жизнь", "zhyzn'", "vida"]], { q: "¿Cómo se escribe «coche»?", options: ["машина", "машына"], answer: "машина", lang: "target" }),
        R("cha-shcha", "ча, ща con а (nunca я); чу, щу con у", "Tras ч y щ se escribe а y у: час, чай, чудо.", [["чай", "chay", "té"], ["час", "chas", "hora"]], { q: "¿Cómo se escribe «té»?", options: ["чай", "чяй"], answer: "чай", lang: "target" }),
      ],
    },
  ],
};
