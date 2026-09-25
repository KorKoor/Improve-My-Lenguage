/**
 * Pares mínimos: dos palabras que sólo se distinguen por un sonido difícil
 * para hispanohablantes. Entrenan el oído antes que la boca. Escritos a mano,
 * con el significado de cada palabra y una pista breve del contraste.
 */
import type { LanguageCode } from "./types";

export interface MinimalPair {
  a: string;
  b: string;
  /** Significados en español de a y b. */
  es: [string, string];
}

export interface PairSet {
  id: string;
  title: string;
  tip: string;
  pairs: MinimalPair[];
}

const P = (a: string, b: string, ea: string, eb: string): MinimalPair => ({ a, b, es: [ea, eb] });

export const MINIMAL_PAIRS: Partial<Record<LanguageCode, PairSet[]>> = {
  fr: [
    { id: "u-ou", title: "u / ou", tip: "«u» se dice con los labios de «u» pero la lengua de «i». «ou» es nuestra «u».", pairs: [P("tu", "tout", "tú", "todo"), P("vu", "vous", "visto", "vosotros"), P("rue", "roue", "calle", "rueda"), P("dessus", "dessous", "encima", "debajo"), P("bu", "bout", "bebido", "extremo")] },
    { id: "nasales", title: "Vocales nasales", tip: "an/en suena abierta (como «a» por la nariz), on más cerrada (como «o»), in/ain como una «e» abierta nasal.", pairs: [P("vent", "vont", "viento", "van"), P("lent", "long", "lento", "largo"), P("pain", "pont", "pan", "puente"), P("sans", "son", "sin", "sonido")] },
  ],
  en: [
    { id: "i-ee", title: "i corta / ee larga", tip: "«ee» es una «i» larga y tensa; «i» es más corta y relajada, casi hacia la «e».", pairs: [P("ship", "sheep", "barco", "oveja"), P("live", "leave", "vivir", "irse"), P("bit", "beat", "trozo", "golpear"), P("fill", "feel", "llenar", "sentir"), P("sit", "seat", "sentarse", "asiento")] },
    { id: "a-e", title: "a de «cat» / e", tip: "La vocal de «bad» abre la boca más que nuestra «e», casi entre «a» y «e».", pairs: [P("bad", "bed", "malo", "cama"), P("man", "men", "hombre", "hombres"), P("sat", "set", "se sentó", "conjunto")] },
    { id: "b-v", title: "b / v", tip: "En inglés la «v» se hace con los dientes de arriba sobre el labio de abajo.", pairs: [P("berry", "very", "baya", "muy"), P("ban", "van", "prohibir", "furgoneta"), P("best", "vest", "mejor", "chaleco")] },
  ],
  de: [
    { id: "u-ue", title: "u / ü", tip: "«ü» se dice con los labios de «u» y la lengua de «i».", pairs: [P("Mutter", "Mütter", "madre", "madres"), P("Buch", "Bücher", "libro", "libros"), P("fuhr", "für", "condujo", "para")] },
    { id: "o-oe", title: "o / ö", tip: "«ö» se dice con los labios de «o» y la lengua de «e».", pairs: [P("schon", "schön", "ya", "bonito"), P("Bogen", "Bögen", "arco", "arcos")] },
    { id: "ch-sch", title: "ch / sch", tip: "«ch» tras i/e es un soplo suave (como un gato que bufa); «sch» es nuestra «sh» de «shhh».", pairs: [P("Kirche", "Kirsche", "iglesia", "cereza"), P("mich", "misch", "me", "mezcla")] },
  ],
  it: [
    { id: "dobles", title: "Consonantes dobles", tip: "Las dobles se sostienen un instante más: «palla» dura más que «pala».", pairs: [P("pala", "palla", "pala", "pelota"), P("caro", "carro", "querido", "carro"), P("sete", "sette", "sed", "siete"), P("nono", "nonno", "noveno", "abuelo"), P("capello", "cappello", "cabello", "sombrero")] },
  ],
  pt: [
    { id: "o-abierta", title: "ô cerrada / ó abierta", tip: "ô se dice cerrada (casi «u»); ó abierta como nuestra «o» exagerada.", pairs: [P("avô", "avó", "abuelo", "abuela"), P("pôde", "pode", "pudo", "puede")] },
    { id: "nasal", title: "Nasales", tip: "ão suena como «aun» por la nariz; ã como una «a» nasal.", pairs: [P("pão", "pau", "pan", "palo"), P("lã", "lá", "lana", "allá")] },
  ],
  nl: [
    { id: "g-k", title: "g / k", tip: "La «g» neerlandesa es como la «j» española, suave y del fondo de la garganta.", pairs: [P("goud", "koud", "oro", "frío"), P("gat", "kat", "agujero", "gato")] },
  ],
  ru: [
    { id: "y-i", title: "ы / и", tip: "«ы» es una «i» dicha con la lengua hacia atrás, como si fueras a decir «u».", pairs: [P("мыло", "мило", "jabón", "lindo"), P("быть", "бить", "ser", "golpear"), P("был", "бил", "era", "golpeaba")] },
    { id: "blanda", title: "Consonante dura / blanda", tip: "La «ь» ablanda la consonante anterior: se pone la lengua como para una «i».", pairs: [P("брат", "брать", "hermano", "tomar"), P("мат", "мать", "mate", "madre")] },
  ],
  ja: [
    { id: "largas", title: "Vocales cortas / largas", tip: "La vocal larga dura el doble y cambia el significado.", pairs: [P("おばさん", "おばあさん", "tía", "abuela"), P("おじさん", "おじいさん", "tío", "abuelo"), P("ここ", "こうこう", "aquí", "bachillerato")] },
    { id: "dobles", title: "Consonante doble (っ)", tip: "La っ es una pausa breve antes de la consonante.", pairs: [P("きて", "きって", "ven", "sello postal"), P("かこ", "かっこ", "pasado", "paréntesis")] },
  ],
  ko: [
    { id: "tres-series", title: "Suave / tensa / aspirada", tip: "ㄱ es suave, ㄲ tensa (sin aire), ㅋ con un soplo de aire.", pairs: [P("불", "뿔", "fuego", "cuerno"), P("달", "딸", "luna", "hija"), P("자다", "차다", "dormir", "patear")] },
  ],
  zh: [
    { id: "tonos", title: "Tonos", tip: "El tono cambia la palabra: 3.º baja y sube; 4.º cae con fuerza.", pairs: [P("买", "卖", "comprar (mǎi)", "vender (mài)"), P("妈", "马", "mamá (mā)", "caballo (mǎ)"), P("汤", "糖", "sopa (tāng)", "azúcar (táng)"), P("问", "吻", "preguntar (wèn)", "besar (wěn)")] },
  ],
  ar: [
    { id: "h-h", title: "ح / ه", tip: "ح es una «h» fuerte desde la garganta; ه es una «h» suave como en inglés.", pairs: [P("حَرّ", "هَرّ", "calor", "gato"), P("حَبّ", "هَبّ", "grano", "sopló")] },
    { id: "s-enfatica", title: "س / ص", tip: "ص es una «s» enfática: la lengua baja y la vocal suena más oscura.", pairs: [P("سيف", "صيف", "espada", "verano"), P("سَبْر", "صَبْر", "sondeo", "paciencia")] },
  ],
};

export function pairSetsFor(lang: LanguageCode): PairSet[] {
  return MINIMAL_PAIRS[lang] ?? [];
}
