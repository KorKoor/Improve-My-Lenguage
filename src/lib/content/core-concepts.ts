/**
 * Vocabulario núcleo A0 → A1, en español y en el orden en que conviene
 * aprenderlo: lo concreto y útil primero (personas, casa, comida, verbos de
 * todos los días, adjetivos básicos, colores, tiempo). El Camino guiado busca
 * cada concepto en el paquete del idioma (por su traducción) y sólo si falta
 * recurre a la frecuencia.
 */
export const CORE_CONCEPTS: string[] = [
  // Personas y familia
  "hombre", "mujer", "niño", "amigo", "familia", "madre", "padre", "hijo", "hija", "hermano", "hermana", "persona",
  // Verbos esenciales
  "ser", "tener", "ir", "querer", "hacer", "comer", "beber", "hablar", "ver", "saber",
  // Casa y objetos
  "casa", "puerta", "mesa", "cama", "libro", "teléfono", "coche", "llave", "dinero", "ropa",
  // Comida y bebida
  "agua", "pan", "café", "leche", "té", "comida", "fruta", "manzana", "carne", "pescado", "vino", "cerveza",
  // Adjetivos básicos
  "grande", "pequeño", "bueno", "malo", "nuevo", "viejo", "joven", "bonito", "caliente", "frío", "feliz", "cansado",
  // Más verbos del día a día
  "venir", "dormir", "trabajar", "vivir", "leer", "escribir", "comprar", "pagar", "abrir", "cerrar", "esperar", "gustar",
  // Tiempo
  "día", "noche", "semana", "mes", "año", "hora", "hoy", "mañana", "ayer", "ahora", "siempre", "nunca",
  // Lugares
  "ciudad", "calle", "tienda", "escuela", "trabajo", "hotel", "restaurante", "estación", "baño", "hospital", "país", "mundo",
  // Colores
  "rojo", "azul", "verde", "blanco", "negro", "amarillo",
  // Cuerpo y salud
  "cabeza", "mano", "ojo", "boca", "corazón", "enfermo",
  // Naturaleza y clima
  "sol", "lluvia", "mar", "árbol", "perro", "gato", "flor",
  // Útiles para conversar
  "sí", "no", "gracias", "aquí", "allí", "mucho", "poco", "muy", "también", "bien", "mal", "más", "menos",
  // Verbos para comunicarse
  "decir", "preguntar", "responder", "entender", "necesitar", "poder", "buscar", "encontrar", "llamar", "ayudar", "aprender", "estudiar",
  // Números (los básicos van en Primeros pasos; aquí los que faltan)
  "ocho", "nueve", "cien", "mil",
  // Vida cotidiana
  "nombre", "palabra", "pregunta", "problema", "tiempo", "cosa", "vez", "juego", "música", "película", "fiesta", "viaje",
  // Movimiento y acciones
  "salir", "entrar", "llegar", "volver", "caminar", "correr", "jugar", "cocinar", "lavar", "limpiar",
  // Adjetivos útiles
  "fácil", "difícil", "importante", "rápido", "lento", "caro", "barato", "cerca", "lejos", "abierto", "cerrado", "listo",
  // Sentimientos y opiniones
  "amor", "miedo", "pensar", "creer", "sentir", "recordar", "olvidar", "preferir",
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .trim();

/**
 * Correcciones por idioma cuando la palabra más frecuente que «traduce» el
 * concepto no es la que se enseña (coloquial, otro sentido o forma suelta).
 * `null` = no enseñar ese concepto como palabra suelta en ese idioma.
 */
export const CORE_OVERRIDES: Partial<Record<string, Record<string, string | null>>> = {
  fr: { gustar: "aimer", mañana: "demain", cama: "lit", cansado: "fatigué", dormir: "dormir", cerrar: "fermer", dinero: "argent", coche: "voiture", pescado: "poisson", saber: "savoir" },
  it: { dinero: "soldi", comida: "cibo", bonito: "bello", cansado: "stanco", gustar: "piacere", coche: "macchina" },
  pt: { coche: "carro", bonito: "bonito", cansado: "cansado" },
  de: { coche: "Auto", amigo: "Freund", abrir: "öffnen", gustar: "mögen", hablar: "sprechen", mañana: "morgen" },
  ja: { nunca: null, familia: "家族", ser: null, leche: "牛乳", carne: "肉", cerrar: "閉める", nuevo: "新しい", dinero: "お金", fruta: "果物", mesa: "テーブル", dormir: "寝る", querer: "欲しい" },
  zh: {
    ser: "是", padre: "爸爸", hija: "女儿", hablar: "说", libro: "书", dinero: "钱", pan: "面包", leche: "牛奶", comida: "饭",
    joven: "年轻", feliz: "高兴", trabajar: "工作", comprar: "买", cerrar: "关", gustar: "喜欢", madre: "妈妈", mujer: "女人",
  },
  ru: { hacer: "делать", coche: "машина", dinero: "деньги", bueno: "хороший", viejo: "старый", fruta: "фрукт", comida: "еда", escribir: "писать" },
  ar: {
    hombre: "رجل", familia: "عائلة", ser: null, tener: null, pan: null, malo: "سيء", joven: "شاب", bonito: "جميل", gustar: "أحب", vino: "نبيذ",
  },
  ko: {
    ser: "이다", padre: "아버지", persona: "사람", tener: "있다", hablar: "말하다", coche: "자동차", leche: "우유", carne: "고기",
    grande: "크다", bueno: "좋다", nuevo: "새롭다", viejo: "오래되다", frío: "춥다", venir: "오다", esperar: "기다리다",
    gustar: "좋아하다", estación: "역", nunca: null, rojo: "빨갛다", comer: "먹다", querer: "원하다", semana: null, pescado: "생선",
    pagar: "내다", abrir: "열다",
  },
};

/** Busca cada concepto entre las traducciones: primero como traducción principal, luego como secundaria. */
export function resolveConcepts<T extends { lemma: string; rank?: number; translations: Partial<Record<string, string[]>> }>(vocab: T[], native = "es", lang = ""): T[] {
  const first = new Map<string, T>();
  const second = new Map<string, T>();
  const byLemma = new Map<string, T>();
  const better = (a: T, b: T | undefined) => !b || (a.rank ?? 1e9) < (b.rank ?? 1e9);
  for (const v of vocab) {
    if (!byLemma.has(v.lemma)) byLemma.set(v.lemma, v);
    const trs = (v.translations[native] ?? v.translations.es ?? []).map(norm);
    if (trs[0] && better(v, first.get(trs[0]))) first.set(trs[0], v);
    if (trs[1] && better(v, second.get(trs[1]))) second.set(trs[1], v);
  }
  const fixes = CORE_OVERRIDES[lang] ?? {};
  const out: T[] = [];
  const used = new Set<T>();
  for (const c of CORE_CONCEPTS) {
    const fix = fixes[c];
    if (fix === null) continue;
    // Con corrección, sólo la palabra corregida (si no está en el paquete, se omite el concepto).
    const v = fix !== undefined ? byLemma.get(fix) : (first.get(c) ?? second.get(c));
    if (v && !used.has(v)) {
      used.add(v);
      out.push(v);
    }
  }
  return out;
}
