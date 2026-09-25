#!/usr/bin/env python3
"""
Improve My Languages — generador de paquetes de vocabulario desde datos públicos.

Construye, para cada idioma, ~9 000 palabras ordenadas por frecuencia real
(A1 → C1) con traducción al español, pronunciación (IPA y, si existe, audio
grabado de Wikimedia Commons), lectura (kana, pinyin, transliteración),
género y frases de ejemplo reales traducidas al español.

Fuentes (todas con licencia abierta; ver /creditos en la app):
  • wordfreq (Robyn Speer, datos CC BY-SA 4.0): frecuencia → nivel.
  • Wiktionary en español (vía kaikki.org / wiktextract, CC BY-SA 4.0):
    definiciones en español, tablas de traducción, IPA, audio.
  • Wiktionary en inglés (vía kaikki.org, CC BY-SA 4.0): lemas, formas
    flexionadas, lecturas, IPA, audio y glosas para el pivote inglés→español.
  • Tatoeba (CC BY 2.0 FR): frases de ejemplo con traducción humana al español.

Uso (desde la raíz del repo; requiere Python 3.10+ y `pip install -r scripts/content/requirements.txt`):
  python scripts/content/build_packs.py --lang de fr it        # idiomas concretos
  python scripts/content/build_packs.py --all                  # todos
  python scripts/content/build_packs.py --lang de --size 3000  # paquete más pequeño

Las descargas (~1 GB en total) se guardan en .cache/content/ (ignorado por git)
y se reutilizan. La salida va a data/packs/<código>.json.gz.

Principio: nunca inventar. Si una palabra no tiene traducción española fiable
ni ninguna frase de ejemplo, NO entra en el paquete.
"""
from __future__ import annotations

import argparse
import bz2
import gzip
import json
import math
import os
import re
import sys
import time
import unicodedata
import urllib.request
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / ".cache" / "content"
OUT = ROOT / "data" / "packs"

ES_DUMP = "https://kaikki.org/eswiktionary/raw-wiktextract-data.jsonl.gz"
EN_KAIKKI = "https://kaikki.org/dictionary/{name}/kaikki.org-dictionary-{name}.jsonl.gz"
TATOEBA = "https://downloads.tatoeba.org/exports/per_language/{iso3}/{file}"


@dataclass(frozen=True)
class Lang:
    code: str
    iso3: str  # Tatoeba
    en_name: str | None  # kaikki (Wiktionary en inglés); None = no se usa
    es_codes: tuple[str, ...]  # lang_code en el Wiktionary en español
    script: str  # regex de la escritura válida (filtra ruido de wordfreq)
    spaced: bool = True
    articles: dict = field(default_factory=dict)  # género → artículo


LANGS: dict[str, Lang] = {
    "en": Lang("en", "eng", "English", ("en",), r"^[a-z][a-z'\-]*$"),
    "fr": Lang("fr", "fra", "French", ("fr",), r"^[a-zàâæçéèêëîïôœùûüÿ][a-zàâæçéèêëîïôœùûüÿ'\-]*$", articles={"masculine": "le", "feminine": "la"}),
    "de": Lang("de", "deu", "German", ("de",), r"^[a-zäöüß][a-zäöüß\-]*$", articles={"masculine": "der", "feminine": "die", "neuter": "das"}),
    "it": Lang("it", "ita", "Italian", ("it",), r"^[a-zàèéìíîòóùú][a-zàèéìíîòóùú'\-]*$", articles={"masculine": "il", "feminine": "la"}),
    "pt": Lang("pt", "por", "Portuguese", ("pt",), r"^[a-záâãàçéêíóôõúü][a-záâãàçéêíóôõúü\-]*$", articles={"masculine": "o", "feminine": "a"}),
    "nl": Lang("nl", "nld", "Dutch", ("nl",), r"^[a-zäëïöüé][a-zäëïöüé'\-]*$", articles={"masculine": "de", "feminine": "de", "common": "de", "neuter": "het"}),
    "sv": Lang("sv", "swe", "Swedish", ("sv",), r"^[a-zåäöé][a-zåäöé\-]*$", articles={"common": "en", "neuter": "ett"}),
    "ru": Lang("ru", "rus", "Russian", ("ru",), r"^[а-яё][а-яё\-]*$"),
    "ar": Lang("ar", "ara", "Arabic", ("ar",), r"^[ء-ي]+$"),
    "ja": Lang("ja", "jpn", "Japanese", ("ja",), r"^[぀-ヿ一-鿿々]+$", spaced=False),
    "ko": Lang("ko", "kor", "Korean", ("ko",), r"^[가-힣]+$"),
    "zh": Lang("zh", "cmn", "Chinese", ("zh", "cmn"), r"^[一-鿿]+$", spaced=False),
}

# Categorías gramaticales del Wiktionary → las de la app.
POS = {
    "noun": "noun", "verb": "verb", "adj": "adjective", "adv": "adverb", "pron": "pronoun",
    "prep": "preposition", "postp": "preposition", "conj": "conjunction", "det": "determiner",
    "article": "determiner", "intj": "interjection", "particle": "particle", "num": "numeral",
    "phrase": "phrase", "prep_phrase": "phrase", "counter": "noun", "classifier": "noun",
}
POS_ES = {"noun": "noun", "verb": "verb", "adj": "adj", "adv": "adv", "pron": "pron", "prep": "prep", "conj": "conj",
          "intj": "intj", "article": "det", "det": "det", "num": "num", "particle": "particle", "phrase": "phrase"}
FUNCTION_POS = {"pron", "adv", "prep", "conj", "det", "article", "particle", "num", "intj", "postp", "contraction"}
FORM_SKIP_TAGS = {"regional", "colloquial", "misspelling", "nonstandard", "dialectal", "eye-dialect", "pronunciation-spelling", "obsolete", "archaic", "rare", "informal", "slang", "Internet", "abbreviation", "UK-dialect", "Scotland"}
SKIP_TAGS = {"obsolete", "archaic", "rare", "dated", "historical", "dialectal", "nonstandard", "misspelling",
             "Cantonese", "Hokkien", "Min-Nan", "Hakka", "Wu", "Classical", "Literary-Chinese", "Teochew"}

# Rango de frecuencia → nivel (misma curva que la app: src/lib/content/packs.ts).
# θ = -2.5 + 1.27·ln(rango/300); umbrales CEFR en θ = -2, -1, 0, 1, 2.
CEFR_BOUNDS = [("A1", 445), ("A2", 978), ("B1", 2150), ("B2", 4730), ("C1", 10400)]

TOPIC_KEYWORDS = {
    "food": ["aliment", "comida", "bebida", "cocina", "fruta", "verdura", "food", "drink", "cooking", "fruit", "vegetable", "beverage", "meal"],
    "tech": ["informática", "tecnología", "internet", "computing", "computer", "software", "electronics", "internet"],
    "business": ["economía", "comercio", "negocio", "finanzas", "economics", "business", "finance", "commerce", "money"],
    "work": ["profesión", "oficio", "trabajo", "occupation", "profession", "employment", "job"],
    "travel": ["transporte", "viaje", "turismo", "vehículo", "transport", "travel", "tourism", "vehicle"],
    "music": ["música", "instrumento", "music", "musical"],
    "fitness": ["deporte", "cuerpo", "sport", "sports", "anatomy", "exercise"],
    "feelings": ["emoción", "sentimiento", "emotion", "feeling"],
    "science": ["ciencia", "biología", "física", "química", "medicina", "science", "biology", "physics", "chemistry", "medicine"],
    "gaming": ["juego", "game", "games", "gaming", "video game"],
}


DEBUG = False
SURFACE_LIMIT = 30000  # formas frecuentes que se examinan (incluye flexiones)
LEMMA_LIMIT = 10400    # tope de C1 en palabras-lema (ver CEFR_BOUNDS)
DROPPED: list = []


def cefr_for_rank(rank: int) -> str:
    for level, upper in CEFR_BOUNDS:
        if rank <= upper:
            return level
    return "C2"


def band_for_rank(rank: int) -> int:
    return 1 if rank <= 1000 else 2 if rank <= 3000 else 3 if rank <= 6000 else 4 if rank <= 10000 else 5


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


# ── Descargas con caché ─────────────────────────────────────────────────────
def fetch(url: str, name: str) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    dest = CACHE / name
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    log(f"descargando {url}")
    tmp = dest.with_suffix(dest.suffix + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": "ImproveMyLanguages-content-builder/1.0 (educational; contact via repo)"})
    with urllib.request.urlopen(req, timeout=120) as r, open(tmp, "wb") as f:
        total = int(r.headers.get("Content-Length") or 0)
        done = 0
        while chunk := r.read(1 << 20):
            f.write(chunk)
            done += len(chunk)
            if total and done % (50 << 20) < (1 << 20):
                log(f"  {done >> 20} / {total >> 20} MB")
    tmp.rename(dest)
    return dest


def open_text(path: Path):
    if path.suffix == ".gz":
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    if path.suffix == ".bz2":
        return bz2.open(path, "rt", encoding="utf-8", errors="replace")
    return open(path, encoding="utf-8", errors="replace")


# ── Limpieza de texto ───────────────────────────────────────────────────────
PAREN = re.compile(r"\s*[\(\[][^\)\]]*[\)\]]")
REF = re.compile(r"_?\(\d[\d,\s–-]*\)")


def clean_es_gloss(g: str) -> str:
    g = REF.sub("", g).replace("_", " ")
    g = PAREN.sub("", g).strip().rstrip(".").strip()
    return g


ES_DESCRIPTION = re.compile(
    r"(?i)^(pasado|participio|gerundio|plural|singular|forma|tercera|primera|segunda|femenino|masculino|"
    r"tiempo|conjugación|verbo auxiliar|abreviatura|sigla|variante|grafía)\b"
)


def short_chunks(gloss: str, max_words: int = 5, max_len: int = 40) -> list[str]:
    out = []
    for part in re.split(r"[;,]\s*", gloss):
        p = part.strip().strip(".").strip()
        if not p or len(p) > max_len or len(p.split()) > max_words or ES_DESCRIPTION.match(p):
            continue
        out.append(p[0].lower() + p[1:] if p[:1].isupper() and not p[1:2].isupper() else p)
    return out


ARTICLE_TAG = re.compile(r"^\[(el|la|los|las|un|una)\]\s*", re.I)
WITH_TAG = re.compile(r"\s*\[with ([^\]]+)\]\s*$", re.I)
TAIL_TAG = re.compile(r"\s*\[([^\]]+)\]\s*$")
INNER_TAG = re.compile(r"(\w)\[(\w+)\]")


def tidy_translation(c: str) -> str:
    """Anotaciones de las tablas de traducción de Wiktionary → texto natural:
    «pertenecer [with en or a]» → «pertenecer a» · «[el] ala» → «ala» ·
    «mermar[se]» → «mermar» · «sin precedente[s]» → «sin precedentes» ·
    «jugar / juguetear [con]» → «jugar con» · «[a] tiempo completo» → «a tiempo completo»."""
    c = ARTICLE_TAG.sub("", c.strip())
    # Primero lo pegado a la palabra: «mermar[se]», «precedente[s]».
    c = INNER_TAG.sub(lambda x: x.group(1) + ("" if x.group(2) == "se" else x.group(2)), c)
    tail = ""
    m = WITH_TAG.search(c)
    if m:
        tail = re.split(r"\s+or\s+|/", m.group(1))[-1].strip()
        c = c[: m.start()]
    else:
        m = TAIL_TAG.search(c)
        if m and m.start() > 0:
            tail = re.split(r"\s*/\s*", m.group(1))[0].strip()
            c = c[: m.start()]
    c = re.sub(r"^\[(\w+)\]\s*", lambda x: x.group(1) + " ", c)  # «[a] tiempo completo»
    c = re.sub(r"\s*\[[^\]]*\]\s*", " ", c)  # «echar [el / tanto] ojo» → «echar ojo»
    parts = re.split(r"\s*/\s*", c)
    if len(parts) > 1 and all(len(x) >= 3 for x in parts):
        c = parts[0]  # «jugar / juguetear» → «jugar» (pero «y/o» se queda)
    c = re.sub(r"[\[\]{}|=]+", " ", f"{c} {tail}")  # restos sueltos: «someterse ]», «doce docenas =»
    return re.sub(r"\s+", " ", c).strip()


def clean_candidate(c: str) -> str:
    c = tidy_translation(c)
    c = re.sub(r"[₀-₉⁰-⁹\d]+$", "", c).strip(" .;:·-")
    return c if c and len(c) <= 60 else ""


def english_heads(gloss: str, pos: str) -> list[str]:
    """'to walk; to go on foot' → ['walk']; 'house (building)' → ['house']."""
    g = PAREN.sub("", gloss)
    heads = []
    for part in re.split(r"[;,]\s*", g):
        p = part.strip().lower()
        if pos == "verb" and p.startswith("to "):
            p = p[3:]
        p = re.sub(r"^(a|an|the) ", "", p)
        if p and re.fullmatch(r"[a-z][a-z' \-]*", p) and len(p.split()) <= 3:
            heads.append(p)
    return heads


FORM_GLOSS = re.compile(
    r"\b(?:forms?|plural|singular|case|inflection|nominali[sz]ation|participle|superlative|comparative|diminutive|"
    r"dative|genitive|accusative|nominative|instrumental|prepositional|imperative|conjugation|romanization|spelling|"
    r"alternative|abbreviation|contraction)\s+(?:\w+\s+){0,3}?of\s+([^\s(,;:.\"“”]+)",
    re.IGNORECASE,
)


GRAMMAR_TAGS = {
    "past", "present", "future", "plural", "singular", "participle", "gerund", "infinitive", "imperative", "subjunctive",
    "indicative", "conditional", "first-person", "second-person", "third-person", "comparative", "superlative",
    "nominative", "accusative", "genitive", "dative", "instrumental", "prepositional", "locative", "ablative", "vocative",
    "masculine", "feminine", "neuter", "definite", "indefinite", "polite", "formal", "informal", "preterite", "imperfect",
    "perfect", "passive", "active", "negative", "diminutive", "augmentative", "possessive", "contraction", "construct",
    "stem", "adverbial", "attributive", "predicative", "romanization", "hiragana", "katakana", "kanji", "simplified", "traditional",
}
GLOSS_STOP = {"the", "a", "an", "this", "that", "these", "those", "its", "his", "her", "their", "any", "some", "one", "each", "every"}


def gloss_form_of(gloss: str) -> str | None:
    """'Dative plural of der' → 'der'. Sólo glosas cortas que *empiezan* describiendo
    la forma («The ordinal form of the number six» o «diminutive of the female
    name…» no son formas flexionadas)."""
    if len(gloss) > 140:
        return None
    m = FORM_GLOSS.search(gloss)
    if not m or m.start() > 30 or m.group(1).lower() in GLOSS_STOP:
        return None
    return m.group(1)


def singulars(head: str) -> list[str]:
    out = [head]
    if head.endswith("ies") and len(head) > 4:
        out.append(head[:-3] + "y")
    elif head.endswith("es") and len(head) > 4:
        out += [head[:-2], head[:-1]]
    elif head.endswith("s") and not head.endswith("ss") and len(head) > 3:
        out.append(head[:-1])
    return out


def strip_marks(s: str) -> str:
    """Quita acentos de énfasis (ruso) y harakat (árabe) para comparar formas."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return unicodedata.normalize("NFC", s)


# La palabra de primer nivel va siempre seguida de "lang" (las anidadas no):
# así se lee sin parsear el JSON completo, que es lo caro.
WORD_RE = re.compile(r'"word": "((?:[^"\\]|\\.)*)", "lang": "')


def fast_word(line: str) -> str | None:
    m = WORD_RE.search(line)
    if not m:
        return None
    try:
        return json.loads(f'"{m.group(1)}"')
    except json.JSONDecodeError:
        return None


# ── 1. Wiktionary en español: glosas, traducciones inversas, inglés→español ──
@dataclass
class EsEntry:
    pos: str
    glosses: list[str]
    ipa: str | None
    audio: str | None
    tags: list[str]
    cats: list[str]
    form_of: list[str]


def load_es_dump(targets: set[str]):
    """Una pasada sobre todo el Wiktionary en español (≈100 MB comprimido)."""
    path = fetch(ES_DUMP, "eswiktionary-raw.jsonl.gz")
    code_to_lang = {c: l for l, L in LANGS.items() if l in targets for c in L.es_codes}
    need_english = True  # pivote inglés→español (para todos los idiomas salvo inglés)
    entries: dict[str, dict[str, list[EsEntry]]] = defaultdict(lambda: defaultdict(list))
    reverse: dict[str, dict[str, list[tuple[str, str]]]] = defaultdict(lambda: defaultdict(list))
    english: dict[str, list[tuple[str, list[str]]]] = defaultdict(list)
    n = 0
    log("leyendo Wiktionary en español…")
    with open_text(path) as f:
        for line in f:
            n += 1
            if n % 500_000 == 0:
                log(f"  {n:,} entradas")
            code_m = re.search(r'"lang_code": "([a-z\-]+)"', line)
            if not code_m:
                continue
            code = code_m.group(1)
            if code != "es" and code not in code_to_lang and not (need_english and code == "en"):
                continue
            if code == "es" and '"translations"' not in line:
                continue
            try:
                r = json.loads(line)
            except json.JSONDecodeError:
                continue
            word = r.get("word")
            pos = r.get("pos", "")
            if not word:
                continue
            if code == "es":
                es_pos = POS_ES.get(pos)
                for t in r.get("translations", []) or []:
                    lang = code_to_lang.get(t.get("lang_code", ""))
                    tw = (t.get("word") or "").strip()
                    if lang and tw and es_pos:
                        idx = str(t.get("sense_index") or "1")
                        primary = idx.startswith("1") and not idx.startswith("1" + "0")
                        reverse[lang][tw].append((word, es_pos, primary))
                continue
            glosses, form_of = [], []
            for s in r.get("senses", []):
                fo = s.get("form_of")
                if fo:
                    form_of += [x.get("word") for x in fo if x.get("word")]
                    continue
                for g in s.get("glosses", []):
                    cg = clean_es_gloss(g)
                    if cg and not re.match(r"(?i)(forma|plural|participio|gerundio|primera|segunda|tercera|femenino) ", cg):
                        glosses.append(cg)
            ipa = next((s["ipa"] for s in r.get("sounds", []) if s.get("ipa")), None)
            audio = next((s["mp3_url"] for s in r.get("sounds", []) if s.get("mp3_url")), None)
            cats = [c.get("name", "") if isinstance(c, dict) else str(c) for c in r.get("categories", [])]
            e = EsEntry(POS_ES.get(pos, pos), glosses, ipa, audio, r.get("tags", []) or [], cats, form_of)
            if code == "en" and "en" not in code_to_lang:
                if glosses:
                    english[word.lower()].append((e.pos, glosses))
                continue
            if code == "en":
                english[word.lower()].append((e.pos, glosses))
            entries[code_to_lang[code]][word].append(e)
    log(f"Wiktionary es: {sum(len(v) for v in entries.values()):,} entradas de idiomas objetivo, "
        f"{sum(len(v) for v in reverse.values()):,} traducciones inversas, {len(english):,} palabras inglesas")
    return entries, reverse, english


# ── 1b. Tablas de traducción del Wiktionary en inglés (triangulación) ────────
EN_ENGLISH = "https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl.gz"
BAD_TR_TAGS = {"colloquial", "slang", "vulgar", "archaic", "obsolete", "dated", "rare", "dialectal", "regional", "Rioplatense", "Spain", "Chile", "Argentina", "Cuba", "Peru"}


def tri_key(lang: str, w: str) -> str:
    """Ruso y árabe: sin tildes de acento/harakat para comparar. Japonés, nunca (perdería el dakuten)."""
    return strip_marks(w) if lang in ("ru", "ar") else w


def load_en_translations(targets: set[str]):
    """
    Cada acepción inglesa lista su traducción a decenas de idiomas. Si la
    palabra objetivo y una española comparten acepción, son traducción directa
    ("house · dwelling": es casa · de Haus · ko 집 · zh 房子).
    Devuelve: triang[lang][palabra] = [españolas, por orden de acepción] y
    en_es[palabra inglesa] = [españolas]. Se cachea el resultado derivado.
    """
    derived = CACHE / "en-translations.json.gz"
    codes = {c: l for l, L in LANGS.items() for c in L.es_codes if l != "en"}
    if derived.exists():
        with gzip.open(derived, "rt", encoding="utf-8") as f:
            data = json.load(f)
        return data["triang"], data["en_es"]
    path = fetch(EN_ENGLISH, "enwiktionary-English.jsonl.gz")
    triang: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
    en_es: dict[str, list[str]] = defaultdict(list)
    log("leyendo tablas de traducción del Wiktionary en inglés (una sola vez, luego se cachea)…")
    n = 0
    with open_text(path) as f:
        for line in f:
            n += 1
            if n % 200_000 == 0:
                log(f"  {n:,} entradas inglesas")
            if '"lang_code": "es"' not in line:
                continue
            r = json.loads(line)
            if r.get("lang_code") != "en":
                continue
            items = list(r.get("translations") or [])
            for sense in r.get("senses", []):
                items += sense.get("translations") or []
            groups: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
            order: list[str] = []
            for t in items:
                code = t.get("lang_code") or t.get("code")
                w = (t.get("word") or "").strip()
                if not w or not code or set(t.get("tags") or []) & BAD_TR_TAGS:
                    continue
                key = t.get("sense") or ""
                if key not in groups:
                    order.append(key)
                if code == "es":
                    groups[key]["es"].append(w)
                elif code in codes:
                    groups[key][codes[code]].append(w)
            word = r.get("word", "").lower()
            for key in order:
                g = groups[key]
                es_words = g.get("es") or []
                for w in es_words:
                    if w not in en_es[word]:
                        en_es[word].append(w)
                if not es_words:
                    continue
                for lang, ws in g.items():
                    if lang == "es":
                        continue
                    for w in ws:
                        lst = triang[lang][tri_key(lang, w)]
                        for e in es_words[:2]:
                            if e not in lst:
                                lst.append(e)
    data = {"triang": {l: dict(v) for l, v in triang.items()}, "en_es": dict(en_es)}
    with gzip.open(derived, "wt", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    log(f"tablas: {sum(len(v) for v in data['triang'].values()):,} palabras trianguladas, {len(en_es):,} inglesas con español")
    return data["triang"], data["en_es"]


# ── 2. Wiktionary en inglés: lemas, formas, lecturas, glosas inglesas ────────
@dataclass
class EnEntry:
    pos: str
    glosses: list[str] = field(default_factory=list)
    ipa: str | None = None
    audio: str | None = None
    gender: str | None = None
    reading: str | None = None
    cats: list[str] = field(default_factory=list)
    examples: list[tuple[str, str | None]] = field(default_factory=list)
    conj: dict[str, list[str | None]] | None = None


# ── Conjugación (tablas de Wiktionary) ──────────────────────────────────────
PERSONS = [("first-person", "singular"), ("second-person", "singular"), ("third-person", "singular"),
           ("first-person", "plural"), ("second-person", "plural"), ("third-person", "plural")]
# (clave, etiquetas que deben estar, etiquetas que NO deben estar), en orden de utilidad.
MOODS = {"indicative", "subjunctive", "conditional", "imperative"}
NON_FINITE = {"participle", "gerund", "adverbial", "infinitive", "noun-from-verb"}
# (clave, etiquetas necesarias, etiquetas prohibidas), en orden de utilidad. El modo
# indicativo es implícito: muchas tablas (ruso, neerlandés) no lo etiquetan.
CONJ_ROWS = [
    ("ind.pres", {"present"}, (MOODS - {"indicative"}) | {"perfect", "progressive"}),
    ("ind.pret", {"preterite"}, (MOODS - {"indicative"}) | {"perfect"}),
    ("ind.past", {"past"}, (MOODS - {"indicative"}) | {"perfect", "historic", "anterior", "progressive"}),
    ("ind.impf", {"imperfect"}, (MOODS - {"indicative"}) | {"perfect", "progressive"}),
    ("ind.fut", {"future"}, (MOODS - {"indicative"}) | {"perfect", "progressive"}),
    ("cond", {"conditional"}, {"perfect", "subjunctive"}),
    ("subj.pres", {"subjunctive", "present"}, {"perfect"}),
    ("imp", {"imperative"}, {"negative"}),
]
CONJ_SKIP = {"multiword-construction", "table-tags", "inflection-template", "romanization", "rare", "archaic", "obsolete",
             "dialectal", "colloquial", "formal", "majestic", "Flanders", "canonical"}


IT_ACCENTED_MONO = {"è", "dà", "dì", "là", "lì", "né", "sé", "sì", "tè", "ciò", "già", "giù", "può", "più", "fé"}


def display_form(lang: str, form: str) -> str:
    """Quita marcas de pronunciación de las tablas: acento tónico ruso (де́лать)
    y acentos italianos que no van en la ortografía (sóno → sono, sarò se queda)."""
    if lang in ("ru", "uk"):
        # Sólo el acento tónico (U+0301/U+0300); «й» y «ё» se conservan.
        return form.replace("\u0301", "").replace("\u0300", "")
    if lang == "it":
        words = []
        for w in form.split(" "):
            head, last = w[:-1], w[-1:]
            w = strip_marks(head) + last
            # Monosílabos: sólo llevan tilde los diacríticos (è, dà, sì…); «fà» → «fa».
            if len(re.findall(r"[aeiouàèéìòù]+", w)) <= 1 and w not in IT_ACCENTED_MONO:
                w = strip_marks(w)
            words.append(w)
        return " ".join(words)
    return form


def conjugation_table(forms: list[dict], lang: str = "") -> dict[str, list[str | None]] | None:
    """Tabla compacta {tiempo: [yo, tú, él, nosotros, vosotros, ellos]} (None si falta)."""
    table: dict[str, list[str | None]] = {}
    for key, need, avoid in CONJ_ROWS:
        row: list[str | None] = [None] * 6
        for f in forms:
            tags = set(f.get("tags") or [])
            form = (f.get("form") or "").strip()
            if not form or form in ("-", "—", "–") or "+" in form or " of " in form or tags & CONJ_SKIP or tags & NON_FINITE or not need <= tags or tags & avoid:
                continue
            persons = [i for i, (person, number) in enumerate(PERSONS) if person in tags and number in tags]
            if not persons and "plural" in tags and not any(t.endswith("-person") for t in tags):
                persons = [3, 4, 5]  # neerlandés/alemán: una forma para todo el plural
            for i in persons:
                if row[i] is None:
                    row[i] = display_form(lang, form)
        filled = sum(1 for x in row if x)
        # Imperativo: basta con 2 personas; el resto de tiempos necesita la mayoría.
        if filled >= (2 if key == "imp" else 4):
            table[key] = row
    # «ind.past» y «ind.pret» son el mismo tiempo en idiomas distintos: nos quedamos con uno.
    if "ind.pret" in table:
        table.pop("ind.past", None)
    return table or None


def reading_for(lang: str, r: dict) -> str | None:
    forms = r.get("forms", []) or []
    roman = next((f["form"] for f in forms if "romanization" in (f.get("tags") or [])), None)
    if lang == "ja":
        head = (r.get("head_templates") or [{}])[0].get("args", {})
        kana = (head.get("1") or "").replace("%", "").replace("^", "")
        if not re.fullmatch(r"[぀-ヿ]+", kana or ""):
            kana = next((s.get("other") for s in r.get("sounds", []) if re.fullmatch(r"[぀-ヿ]+", s.get("other") or "")), "")
        parts = [p for p in (kana, roman) if p and p != r.get("word")]
        return " · ".join(parts) or None
    if lang == "zh":
        return next((s["zh_pron"] for s in r.get("sounds", []) if s.get("zh_pron") and "Mandarin" in (s.get("tags") or []) and "Pinyin" in (s.get("tags") or [])), None)
    if lang in ("ru", "ar"):
        canon = next((f["form"] for f in forms if "canonical" in (f.get("tags") or [])), None)
        parts = [p for p in (canon if canon and canon != r.get("word") else None, roman) if p]
        return " · ".join(parts) or None
    if lang == "ko":
        return roman
    return None


def load_en_kaikki(lang: str, surface: set[str]):
    """Dos pasadas: (1) formas flexionadas → lema, (2) datos de los lemas necesarios."""
    L = LANGS[lang]
    path = fetch(EN_KAIKKI.format(name=L.en_name), f"enwiktionary-{L.en_name}.jsonl.gz")
    want = surface | {s.capitalize() for s in surface} if L.spaced else set(surface)
    if lang == "ko":
        # wordfreq separa la raíz verbal (있, 좋, 만들): cargamos también su infinitivo (있다…).
        want |= {w + "다" for w in surface if len(w) <= 2}
    form_to_lemma: dict[str, list[str]] = defaultdict(list)
    lemma_entries: dict[str, list[EnEntry]] = defaultdict(list)
    # «was»: su primera acepción es «pasado de be» y sólo tiene una coloquial
    # propia → se enseña bajo «be». «left» (adjetivo con muchas acepciones) no.
    form_first: set[str] = set()
    own_senses: dict[str, int] = defaultdict(int)
    # Formas con rasgos gramaticales (pasado, plural…), frente a meras variantes
    # («och» como variante proscrita de «att» no es una forma de «att»).
    inflected: set[str] = set()
    # Palabras con un sentido propio de clase cerrada (pronombre, preposición…):
    # «tu» (tú), «sous» (bajo), «cela» (eso) nunca son sobre todo una forma de
    # otro verbo aunque Wiktionary liste antes ese uso (participio de «taire»).
    function_word: set[str] = set()

    def parse_entry(r: dict) -> EnEntry | None:
        pos = r.get("pos", "")
        if pos == "character" and lang == "zh":
            first = next((g for s in r.get("senses", []) for g in s.get("glosses", [])[:1]), "")
            pos = "verb" if first.startswith("to ") else "particle" if re.match(r"(?i)(used |indicates|.*marker|particle|nominali)", first) else "noun"
        if pos not in POS:
            return None
        e = EnEntry(POS[pos])
        for s in r.get("senses", []):
            tags = set(s.get("tags") or [])
            if "form_of" in s or "alt_of" in s or tags & SKIP_TAGS or "form-of" in tags:
                continue
            gl = s.get("glosses", [])[:1]
            if gl and gloss_form_of(gl[0]):
                continue
            for g in gl:
                e.glosses.append(g)
            for ex in (s.get("examples") or [])[:2]:
                if ex.get("text") and len(e.examples) < 3:
                    e.examples.append((ex["text"], ex.get("translation") or ex.get("english")))
            for t in tags:
                if t in ("masculine", "feminine", "neuter", "common") and not e.gender:
                    e.gender = t
            e.cats += [c for c in (s.get("topics") or [])]
        if not e.glosses:
            return None
        for snd in r.get("sounds", []):
            if not e.ipa and snd.get("ipa") and not (set(snd.get("tags") or []) & {"Cantonese", "Hokkien"}):
                e.ipa = snd["ipa"]
            if not e.audio and snd.get("mp3_url"):
                e.audio = snd["mp3_url"]
        if not e.gender:
            for t in r.get("head_templates") or []:
                exp = t.get("expansion", "")
                m = re.search(r"\s(m|f|n|c)(?:\s|$|,|\))", exp)
                if m:
                    e.gender = {"m": "masculine", "f": "feminine", "n": "neuter", "c": "common"}[m.group(1)]
                    break
        e.reading = reading_for(lang, r)
        if e.pos == "verb" and lang not in ("ja", "zh", "ko", "en"):
            e.conj = conjugation_table(r.get("forms") or [], lang)
        e.cats += [c.get("name", "") if isinstance(c, dict) else str(c) for c in (r.get("categories") or [])][:20]
        return e

    log(f"[{lang}] pasada 1/2 sobre Wiktionary en inglés (formas → lema)…")
    needed: set[str] = set(want)
    with open_text(path) as f:
        for line in f:
            w = fast_word(line)
            if w is None or w not in want:
                continue
            r = json.loads(line)
            for si, s in enumerate(r.get("senses", [])):
                tags = set(s.get("tags") or [])
                # Variantes dialectales, arcaicas o erratas no son formas que enseñar.
                if tags & FORM_SKIP_TAGS:
                    continue
                links = [fo.get("word") for fo in (s.get("form_of") or []) + (s.get("alt_of") or [])]
                if not links and tags & {"form-of", "alt-of"}:
                    links = [gloss_form_of(g) for g in s.get("glosses", [])[:1]]
                links = [normalize_link(lang, l) for l in links if l]
                links = [l for l in links if l and l != w and " " not in l]
                if links and si == 0:
                    form_first.add(w)
                elif not links:
                    own_senses[w] += 1
                    if r.get("pos") in FUNCTION_POS:
                        function_word.add(w)
                if links and tags & GRAMMAR_TAGS:
                    inflected.add(w)
                for lemma in links:
                    form_to_lemma[w].append(lemma)
                    needed.add(lemma)
    log(f"[{lang}] pasada 2/2 (datos de {len(needed):,} lemas)…")
    with open_text(path) as f:
        for line in f:
            w = fast_word(line)
            if w is None or w not in needed:
                continue
            e = parse_entry(json.loads(line))
            if e:
                lemma_entries[w].append(e)
    log(f"[{lang}] {len(lemma_entries):,} lemas con datos, {len(form_to_lemma):,} formas flexionadas")
    primary_form = {w for w in form_first if own_senses[w] <= 1 and w not in function_word}
    variant_only = {w for w in form_to_lemma if w not in inflected and own_senses[w] >= 2}
    return form_to_lemma, lemma_entries, primary_form, variant_only


# ── 3. Tatoeba: frases reales con traducción humana al español ──────────────
def load_tatoeba(lang: str) -> list[tuple[str, str]]:
    L = LANGS[lang]
    try:
        src = fetch(TATOEBA.format(iso3=L.iso3, file=f"{L.iso3}_sentences.tsv.bz2"), f"tatoeba-{L.iso3}.tsv.bz2")
        links = fetch(TATOEBA.format(iso3=L.iso3, file=f"{L.iso3}-spa_links.tsv.bz2"), f"tatoeba-{L.iso3}-spa.tsv.bz2")
        spa = fetch(TATOEBA.format(iso3="spa", file="spa_sentences.tsv.bz2"), "tatoeba-spa.tsv.bz2")
    except Exception as err:  # noqa: BLE001 — Tatoeba es opcional
        log(f"[{lang}] Tatoeba no disponible: {err}")
        return []
    pairs_ids: dict[str, str] = {}
    with open_text(links) as f:
        for line in f:
            a, b = line.rstrip("\n").split("\t")[:2]
            pairs_ids.setdefault(a, b)
    wanted_spa = set(pairs_ids.values())
    spa_text: dict[str, str] = {}
    with open_text(spa) as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) >= 3 and p[0] in wanted_spa:
                spa_text[p[0]] = p[2]
    pairs = []
    with open_text(src) as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) >= 3 and p[0] in pairs_ids and pairs_ids[p[0]] in spa_text:
                pairs.append((p[2], spa_text[pairs_ids[p[0]]]))
    log(f"[{lang}] Tatoeba: {len(pairs):,} frases con traducción al español")
    return pairs


def load_tatoeba_mono(lang: str, force: bool = False) -> list[str]:
    """Frases en el idioma (sin exigir traducción) para dar contexto a palabras raras."""
    L = LANGS[lang]
    path = CACHE / f"tatoeba-{L.iso3}.tsv.bz2"
    if force and not path.exists():
        try:
            path = fetch(TATOEBA.format(iso3=L.iso3, file=f"{L.iso3}_sentences.tsv.bz2"), f"tatoeba-{L.iso3}.tsv.bz2")
        except Exception:  # noqa: BLE001
            return []
    if not path.exists():
        return []
    out = []
    with open_text(path) as f:
        for line in f:
            p = line.rstrip("\n").split("\t")
            if len(p) >= 3 and len(p[2]) <= 90:
                out.append(p[2])
    return out


TOKEN = re.compile(r"\w+", re.UNICODE)


def tokens(lang: str, text: str) -> list[str]:
    t = [strip_marks(x.lower()) for x in TOKEN.findall(text)]
    if lang == "ar":  # clíticos frecuentes pegados: و ف ب ل ك ال
        t = [re.sub(r"^(وال|بال|فال|كال|لل|ال|و|ف|ب)(?=\w{2,})", "", x) for x in t]
    return t


# ── 4. Construcción del paquete ─────────────────────────────────────────────
def gender_note(lang: str, lemma: str, gender: str | None) -> str | None:
    if not gender:
        return None
    label = {"masculine": "Masculino", "feminine": "Femenino", "neuter": "Neutro", "common": "Género común"}[gender]
    art = LANGS[lang].articles.get(gender)
    if art and lang == "fr" and re.match(r"[aeiouhàâéèêîôû]", lemma):
        art = "l'"
    if art and lang == "it" and re.match(r"[aeiou]", lemma):
        art = "l'"
    return f"{label}: {art}{'' if art.endswith(chr(39)) else ' '}{lemma}." if art else f"{label}."


def topics_for(cats: list[str], pos: str) -> list[str]:
    blob = " ".join(cats).lower()
    out = [t for t, kws in TOPIC_KEYWORDS.items() if any(k in blob for k in kws)]
    if pos == "conjunction":
        out.append("connectors")
    return out[:3] or ["everyday"]


def slugify(lemma: str) -> str:
    s = lemma.strip().lower().replace(" ", "-")
    s = re.sub(r"[|,/\\?#%]", "", s)
    return s


KO_PARTICLES = sorted(
    ["은", "는", "이", "가", "을", "를", "에", "에서", "의", "도", "로", "으로", "와", "과", "하고", "에게", "한테", "만", "까지", "부터", "보다", "처럼", "이나", "나", "랑", "이랑", "께서", "요", "이에요", "예요", "입니다", "이다"],
    key=len, reverse=True,
)
KO_ENDINGS = sorted(
    ["어요", "아요", "여요", "해요", "었어요", "았어요", "했어요", "었다", "았다", "했다", "어", "아", "고", "는", "은", "을", "면", "서", "지", "게", "기", "니까", "습니다", "ㅂ니다", "세요", "셨어요", "겠다", "겠어요", "죠", "네요", "는데", "지만", "도록"],
    key=len, reverse=True,
)


AR_HARAKAT = re.compile("[\u064B-\u0652\u0670\u0640]")


def normalize_link(lang: str, w: str) -> str:
    """El destino de «form_of» viene vocalizado (هٰذَا, бы́ть); las entradas no."""
    if lang == "ar":
        # Sólo harakat, alif superíndice y tatweel: la hamza (أ, إ, ؤ) es parte de la letra.
        return AR_HARAKAT.sub("", w).replace("\u0671", "\u0627")  # alif wasla → alif
    if lang in ("ru", "uk"):
        return w.replace("\u0301", "").replace("\u0300", "")
    return w


AR_PREFIXES = ["وبال", "وال", "بال", "فال", "كال", "ولل", "لل", "ال", "و", "ف", "ب", "ل", "ك", "س"]
AR_SUFFIXES = ["هما", "كما", "هم", "هن", "كم", "كن", "نا", "ها", "ني", "ون", "ين", "ات", "وا", "تم", "ه", "ك", "ي", "ت", "ة"]


def ar_candidates(w: str) -> list[str]:
    """والكتاب → كتاب · بها → ب+ها · كانت → كان (se valida después contra el diccionario)."""
    stems = [w]
    for p in AR_PREFIXES:
        if w.startswith(p) and len(w) - len(p) >= 2:
            stems.append(w[len(p):])
    out: list[str] = []
    for st in stems:
        out.append(st)
        for s_ in AR_SUFFIXES:
            if st.endswith(s_) and len(st) - len(s_) >= 2:
                base = st[: -len(s_)]
                out.append(base)
                if s_ == "ة":
                    continue
                if s_ in ("ت",) and not base.endswith("ة"):
                    out.append(base + "ة")  # مدرستي → مدرسة
    seen, uniq = set(), []
    for c in out[1:]:
        if c not in seen:
            seen.add(c)
            uniq.append(c)
    return uniq


def ko_candidates(w: str) -> list[str]:
    """학교에 → 학교 · 먹었어요 → 먹다 · 했어요 → 하다 (se valida después contra el diccionario)."""
    out = [w + "다"]
    for p in KO_PARTICLES:
        if w.endswith(p) and len(w) > len(p):
            out.append(w[: -len(p)])
    for e in KO_ENDINGS:
        if w.endswith(e) and len(w) > len(e):
            stem = w[: -len(e)]
            out += [stem + "다", stem + "하다"] if not stem.endswith("하") else [stem + "다"]
    if w.endswith(("했어요", "했다", "해요", "했어")):
        out.append(w.split("했")[0].split("해")[0] + "하다")
    return out


def build(lang: str, size: int, es_entries, reverse, english, triang, en_es) -> dict:
    L = LANGS[lang]
    from wordfreq import top_n_list, zipf_frequency  # import tardío: dependencia sólo del generador

    wf_lang = "zh" if lang == "zh" else lang
    rx = re.compile(L.script)
    freq = [w for w in top_n_list(wf_lang, 60000) if rx.match(w)]
    log(f"[{lang}] {len(freq):,} palabras frecuentes válidas")
    surface = set(freq[:SURFACE_LIMIT])

    if L.en_name:
        form_to_lemma, en_lemmas, primary_form, variant_only = load_en_kaikki(lang, surface)
        if lang == "zh":
            # El Wiktionary guarda los datos bajo la forma tradicional; mostramos
            # la simplificada (la que usa wordfreq y se enseña en China continental).
            for w in list(form_to_lemma):
                if w not in en_lemmas:
                    src = next((l for l in form_to_lemma[w] if l in en_lemmas), None)
                    if src:
                        en_lemmas[w] = en_lemmas[src]
                        del form_to_lemma[w]
    else:
        form_to_lemma, en_lemmas, primary_form, variant_only = defaultdict(list), {}, set(), set()
        for w, es in es_entries[lang].items():
            for e in es:
                for lem in e.form_of:
                    form_to_lemma[w].append(lem)

    es_by_lemma = es_entries.get(lang, {})
    ov_path = Path(__file__).with_name("overrides") / f"{lang}.json"
    raw_ov: dict = json.loads(ov_path.read_text(encoding="utf-8")) if ov_path.exists() else {}
    raw_ov.pop("_comment", None)
    # "_forms": {"est": "être"} fuerza forma → lema (homógrafos que el corpus resuelve mal).
    forced_forms: dict[str, str] = raw_ov.pop("_forms", None) or {}
    overrides: dict[str, list[str] | None] = {}
    pos_override: dict[str, str] = {}
    for k, v in raw_ov.items():
        if isinstance(v, dict):
            overrides[k] = v.get("t")
            if v.get("p"):
                pos_override[k] = v["p"]
        else:
            overrides[k] = v
    rev = reverse.get(lang, {})

    def variants(w: str) -> list[str]:
        return [w, w.capitalize()] if L.spaced else [w]

    # Rango del lema = primera aparición de cualquiera de sus formas.
    lemma_rank: dict[str, int] = {}
    lemma_forms: dict[str, set[str]] = defaultdict(set)
    freq_pos = {w: i for i, w in enumerate(freq)}

    def is_lemma(v: str) -> bool:
        return v in en_lemmas or any(e.glosses for e in es_by_lemma.get(v, []))

    # Alemán: wordfreq pone todo en minúsculas ("zeit"). Decidimos entre
    # "Zeit" (sustantivo) y "zeit" contando el uso real en mitad de frase.
    case_count: dict[str, int] = defaultdict(int)
    if lang == "de":
        for t in load_tatoeba_mono(lang, force=True):
            for tok in re.findall(r"\w+", t)[1:]:
                case_count[tok] += 1

    def resolve(w: str) -> list[str]:
        if w in forced_forms:
            return [forced_forms[w]]
        # Una corrección revisada a mano define la palabra aunque Wiktionary no la tenga como lema.
        if isinstance(overrides.get(w), list) and w in pos_override:
            return [w]
        if lang == "de" and w.capitalize() != w:
            cap, low = w.capitalize(), w
            cap_noun = any(e.pos == "noun" for e in en_lemmas.get(cap, []))
            cap_c, low_c = case_count.get(cap, 0), case_count.get(low, 0)
            if cap_noun and cap_c > low_c:
                low_ok = is_lemma(low) and low_c >= 0.25 * cap_c
                return [cap] + ([low] if low_ok else [])
            if cap_noun and is_lemma(low) and low_c > 0 and cap_c >= 0.25 * low_c and any(e.pos == "verb" for e in en_lemmas.get(low, [])):
                return [low, cap]  # leben / das Leben, essen / das Essen
        if lang == "ko" and len(w) == 1 and is_lemma(w + "다") and w not in overrides and not any(e.pos == "noun" for e in en_lemmas.get(w, [])):
            return [w + "다"]  # wordfreq separa la raíz: 있 → 있다, 좋 → 좋다
        if lang == "ko" and not is_lemma(w) and not form_to_lemma.get(w):
            base = next((c for c in ko_candidates(w) if is_lemma(c)), None)
            if base:
                return [base]
        if lang == "ar" and not is_lemma(w) and not form_to_lemma.get(w):
            for c in ar_candidates(w):
                if is_lemma(c):
                    return [c]
                via = next((f for f in form_to_lemma.get(c) or [] if is_lemma(f)), None)
                if via:
                    return [via]
        if len(w) == 1 and L.spaced and any(e.pos == "pronoun" for e in en_lemmas.get(w.upper(), [])):
            return [w.upper()]  # «i» → «I»: la entrada en minúscula es la letra
        for v in variants(w):
            forms = form_to_lemma.get(v) or []
            base = next((f for f in forms if is_lemma(f)), None)
            if base and is_lemma(v) and v in variant_only:
                return [v]
            if base and (not is_lemma(v) or v in primary_form or freq_pos.get(base.lower(), 10**9) < freq_pos.get(w, 10**9)):
                return [base]
            if is_lemma(v):
                return [v]
        return []

    surface_rank: dict[str, int] = {}  # forma → rango de su lema (para medir la dificultad de las frases)
    debug = set(filter(None, (os.environ.get("DEBUG_WORDS") or "").split(",")))  # DEBUG_WORDS=الذي,있 …
    for i, w in enumerate(freq[:SURFACE_LIMIT]):
        cands = resolve(w)
        if w in debug:
            log(f"[{lang}] DEBUG {w!r}: resolve → {cands} · lema={is_lemma(w)} · formas→{form_to_lemma.get(w)}")
        for lem in cands:
            lemma_forms[lem].add(w)
            lemma_forms[lem].add(strip_marks(lem.lower()))
            if lem not in lemma_rank:
                lemma_rank[lem] = len(lemma_rank) + 1
            surface_rank.setdefault(w, lemma_rank[lem])

    # Frases de ejemplo: índice inverso token → frases.
    pairs = load_tatoeba(lang)
    by_token: dict[str, list[int]] = defaultdict(list)
    by_prefix: dict[str, list[int]] = defaultdict(list)
    if L.spaced:
        for idx, (t, _) in enumerate(pairs):
            if len(t) <= 120:
                for tok in set(tokens(lang, t)):
                    by_token[tok].append(idx)
                    if lang == "ko":
                        for k in range(1, min(len(tok), 6) + 1):
                            if len(by_prefix[tok[:k]]) < 60:
                                by_prefix[tok[:k]].append(idx)
    rank_of = surface_rank
    mono_sents = load_tatoeba_mono(lang)
    mono_by_token: dict[str, list[int]] = defaultdict(list)
    if L.spaced:
        for idx, t in enumerate(mono_sents):
            for tok in set(tokens(lang, t)):
                if len(mono_by_token[tok]) < 40:
                    mono_by_token[tok].append(idx)

    def mono_example(lemma: str) -> str | None:
        forms = {strip_marks(f.lower()) for f in lemma_forms[lemma]}
        if L.spaced:
            ids = {i for f in forms for i in mono_by_token.get(f, [])}
            if lang == "ko" and not ids:
                stem = lemma[:-1] if lemma.endswith("다") and len(lemma) >= 2 else lemma
                ids = {i for i, t in enumerate(mono_sents[:200000]) if stem in t}
                ids = set(list(ids)[:40])
            cands = [mono_sents[i] for i in ids]
        else:
            cands = [t for t in mono_sents if lemma in t][:40]
        cands = [t for t in cands if 15 <= len(t) <= 90]
        return min(cands, key=len) if cands else None

    def examples_for(lemma: str, rank: int) -> list[tuple[str, str]]:
        forms = {strip_marks(f.lower()) for f in lemma_forms[lemma]}
        if L.spaced:
            ids = {i for f in forms for i in by_token.get(f, [])}
            if lang == "ko":  # partículas y terminaciones pegadas: 학교에, 먹었어요…
                stem = lemma[:-1] if lemma.endswith("다") and len(lemma) >= 2 else lemma
                ids |= {i for i in by_prefix.get(stem, [])}
        else:
            ids = {i for i, (t, _) in enumerate(pairs) if len(t) <= 40 and lemma in t}
        scored = []
        for i in ids:
            t, es = pairs[i]
            toks = tokens(lang, t) if L.spaced else list(t)
            n = len(toks)
            if n < (3 if L.spaced else 4) or n > (14 if L.spaced else 28):
                continue
            hard = sum(1 for x in toks if rank_of.get(x, 99999) > rank + 1500) if L.spaced else 0
            scored.append((hard * 3 + abs(n - (8 if L.spaced else 12)), len(t), t, es))
        scored.sort()
        out, seen = [], set()
        for _, _, t, es in scored:
            if t not in seen:
                out.append((t, es))
                seen.add(t)
            if len(out) == 2:
                break
        return out

    words, stats = [], defaultdict(int)
    for lemma, rank in sorted(lemma_rank.items(), key=lambda x: x[1]):
        if len(words) >= size or rank > LEMMA_LIMIT:
            break
        en = (en_lemmas.get(lemma) or [None])[0]
        if len(lemma) == 1 and lang not in ("ja", "zh"):
            # «a», «I», «y», «à»: la entrada de la letra va primero; queremos la palabra.
            en = next((e for e in en_lemmas.get(lemma, []) if e.pos in ("preposition", "conjunction", "pronoun", "determiner")), en)
        es_list = [e for e in es_by_lemma.get(lemma, []) if e.glosses]
        es = es_list[0] if es_list else None
        pos = pos_override.get(lemma) or (en.pos if en else (POS.get(es.pos) if es else None))
        if not pos:
            continue
        if lang not in ("ja", "zh", "ko") and len(lemma) == 1 and pos not in ("preposition", "conjunction", "pronoun", "determiner"):
            continue
        if lemma in overrides and overrides[lemma] is None:
            stats["descartadas"] += 1  # ruido del corpus, nombre propio o forma flexionada (revisado)
            continue
        if lang == "ja" and re.fullmatch(r"[぀-ヿ]", lemma) and lemma not in overrides:
            continue  # sílaba suelta de la tokenización, no una palabra

        # Traducción española por VOTACIÓN de tres fuentes independientes:
        #   directa (Wiktionary es) · inversa (tablas de traducción de palabras
        #   españolas, acepción principal) · pivote (glosa inglesa → Wiktionary es).
        # Una traducción que aparece en varias fuentes gana; así las palabras más
        # polisémicas ("alle", "geben", "durch") reciben su sentido principal.
        votes: dict[str, float] = defaultdict(float)
        origin: dict[str, str] = {}
        definition = None

        def vote(cand: str, weight: float, src: str) -> None:
            c = clean_candidate(cand)
            if not c:
                return
            key = c.lower()
            votes[key] += weight
            origin.setdefault(key, src)
            display.setdefault(key, c)

        display: dict[str, str] = {}
        ordered = sorted(es_list, key=lambda e: 0 if POS.get(e.pos) == pos else 1)
        for e in ordered:
            factor = 1.0 if POS.get(e.pos) == pos else 0.5
            k = 0
            for g in e.glosses[:3]:
                chunks = short_chunks(g)
                if not chunks and not definition and not ES_DESCRIPTION.match(g):
                    definition = g[:140]
                for c in chunks:
                    vote(c, factor * (1.0 if k == 0 else 0.8 if k == 1 else 0.6), "wiktionary-es")
                    k += 1
        seen_rev = set()
        for w, p, prim in rev.get(lemma, []):
            same_pos = POS.get(p, p) == pos
            weight = 1.2 if (prim and same_pos) else 0.6 if prim else 0.3 if same_pos else 0.15
            if w.lower() in seen_rev:
                weight *= 0.2  # repetido: refuerza poco
            seen_rev.add(w.lower())
            vote(w, weight, "wiktionary-es-translations")
        # Para el inglés el «pivote por el inglés» no tiene sentido: sólo directa e inversa.
        if lang == "en":
            # Inglés: las tablas de traducción del propio Wiktionary inglés son directas
            # (ordenadas por acepción: la primera es la más usada).
            for k, w in enumerate((en_es.get(lemma.lower()) or [])[:4]):
                vote(w, 1.4 if k == 0 else 1.0 if k == 1 else 0.6, "wiktionary-en")
        tri = [] if lang == "en" else (triang.get(lang, {}).get(tri_key(lang, lemma)) or [])
        for k, w in enumerate(tri[:4]):
            vote(w, 1.3 if k == 0 else 0.9 if k == 1 else 0.5, "wiktionary-en")
        if en and lang != "en":
            for gi, g in enumerate(en.glosses[:2]):
                for head in english_heads(g, pos)[:2]:
                    table = next((en_es[h] for h in singulars(head) if h in en_es), [])
                    for ci, c in enumerate(table[:2]):
                        vote(c, (1.1 if ci == 0 else 0.6) * (1.0 if gi == 0 else 0.6), "pivot-en")
        if en and lang != "en":
            want_pos = {"adjective": "adj", "adverb": "adv", "pronoun": "pron", "preposition": "prep", "conjunction": "conj"}.get(pos, pos)
            for gi, g in enumerate(en.glosses[:2]):
                for head in english_heads(g, pos)[:2]:
                    options = next((english[h] for h in singulars(head) if h in english), [])
                    pick = next((x for x in options if x[0] == want_pos), options[0] if options else None)
                    if pick:
                        for ci, c in enumerate(short_chunks(pick[1][0])[:2] if pick[1] else []):
                            # El Wiktionary inglés ordena las acepciones por uso: la primera pesa más.
                            vote(c, (1.25 if ci == 0 else 0.8) * (1.0 if gi == 0 else 0.6), "pivot-en")
        # Frecuencia real en español: entre traducciones con votos parecidos gana la
        # palabra común («cuestión» antes que «flujo»), y las rarísimas («casalicio»,
        # «maguer») no se enseñan salvo que sean la única opción.
        def es_zipf(c: str) -> float:
            ws = [x for x in re.findall(r"[\wáéíóúüñ]+", c.lower()) if len(x) > 3] or re.findall(r"[\wáéíóúüñ]+", c.lower())
            return min((zipf_frequency(x, "es") for x in ws), default=0.0)

        zipf = {k: es_zipf(display[k]) for k in votes}
        ranked = sorted(votes.items(), key=lambda kv: -(kv[1] * (0.75 + 0.05 * min(zipf[kv[0]], 6))))
        keep = [(k, v) for i, (k, v) in enumerate(ranked) if i == 0 or zipf[k] >= 2.5]
        # Las alternativas necesitan un apoyo comparable al de la principal (≥ 40 %).
        top = keep[0][1] if keep else 0
        translations = [display[k] for i, (k, v) in enumerate(keep) if v >= 0.5 and (i == 0 or v >= 0.4 * top)][:3] or [display[k] for k, _ in ranked[:1]]
        source = origin[ranked[0][0]] if ranked else None
        if not translations and definition:
            translations = [definition]
            source = "wiktionary-es"
        if overrides.get(lemma) and not translations:
            translations, source = overrides[lemma][:3], "curated"
        if not translations:
            stats["sin_traduccion"] += 1
            if DEBUG and len(DROPPED) < 60:
                DROPPED.append(("sin traducción", rank, lemma, pos, (en.glosses[:2] if en else None)))
            continue
        translations = translations[:3]
        if overrides.get(lemma):
            # Corrección revisada por una persona (scripts/content/overrides/<código>.json).
            translations = overrides[lemma][:3]
            source = "curated"
            stats["corregidas"] += 1

        exs = examples_for(lemma, rank)
        ex_out = [[t, es_t, "tatoeba"] for t, es_t in exs]
        if not ex_out:
            fallback = mono_example(lemma)
            if fallback:
                ex_out.append([fallback, None, "tatoeba"])
        if not ex_out and en and en.examples:
            t = next((t for t, _ in en.examples if t and len(t) <= 120), None)
            if t:
                ex_out.append([t, None, "wiktionary"])
        if not ex_out:
            # Sin frase de ejemplo la palabra sigue siendo útil (significado, recuerdo, lectura):
            # en idiomas con poco Tatoeba (coreano, árabe) descartarla vaciaba los niveles altos.
            stats["sin_ejemplo"] += 1

        stats[source] += 1
        ipa = (es.ipa if es and es.ipa else en.ipa if en else None)
        if ipa and not ipa.startswith(("/", "[")):
            ipa = f"/{ipa}/"
        cats = (es.cats if es else []) + (en.cats if en else [])
        gender = (en.gender if en else None) or next((t for t in (es.tags if es else []) if t in ("masculine", "feminine", "neuter", "common")), None)
        entry = {
            "s": slugify(lemma), "l": lemma, "p": pos, "r": rank, "c": cefr_for_rank(rank), "b": band_for_rank(rank),
            "t": translations, "src": source, "tp": topics_for(cats, pos), "ex": ex_out,
        }
        if definition and definition not in translations:
            entry["d"] = definition
        if ipa:
            entry["i"] = ipa
        audio = (es.audio if es and es.audio else en.audio if en else None)
        if audio:
            entry["a"] = audio
        reading = en.reading if en else None
        if reading:
            entry["rd"] = reading
        # Tablas de conjugación de los verbos más útiles (hasta B2): el entrenador de verbos las usa.
        conj = next((x.conj for x in en_lemmas.get(lemma, []) if x.pos == "verb" and x.conj), None) if pos == "verb" and rank <= 4730 else None
        if conj:
            entry["cj"] = conj
        # Formas flexionadas vistas en el corpus: permiten traducir al tocar
        # cualquier forma en el lector ("geht" → "gehen").
        forms = sorted({f for f in lemma_forms[lemma] if f and f != lemma.lower() and f != lemma}, key=lambda f: freq_pos.get(f, 10**9))[: 25 if lang in ("ar", "ru", "de", "fr", "it", "pt") else 15]
        if forms:
            entry["f"] = forms
        note = gender_note(lang, lemma, gender) if pos == "noun" else None
        if note:
            entry["n"] = note
        words.append(entry)

    # Slugs únicos (dos lemas pueden normalizar igual: "Arm"/"arm").
    seen: dict[str, int] = {}
    for w in words:
        base = w["s"]
        if base in seen:
            seen[base] += 1
            w["s"] = f"{base}-{seen[base]}"
        else:
            seen[base] = 1

    levels = defaultdict(int)
    for w in words:
        levels[w["c"]] += 1
    log(f"[{lang}] {len(words):,} palabras · por nivel {dict(sorted(levels.items()))} · {dict(stats)}")
    return {
        "meta": {
            "language": lang,
            "generatedAt": time.strftime("%Y-%m-%d"),
            "count": len(words),
            "levels": dict(sorted(levels.items())),
            "sources": [
                {"name": "wordfreq", "url": "https://github.com/rspeer/wordfreq", "license": "CC BY-SA 4.0", "use": "frecuencia y nivel"},
                {"name": "Wiktionary (es) vía kaikki.org", "url": "https://kaikki.org/eswiktionary/", "license": "CC BY-SA 4.0", "use": "definiciones y traducciones al español"},
                {"name": "Wiktionary (en) vía kaikki.org", "url": "https://kaikki.org/dictionary/", "license": "CC BY-SA 4.0", "use": "lemas, pronunciación, lecturas y audio"},
                {"name": "Tatoeba", "url": "https://tatoeba.org", "license": "CC BY 2.0 FR", "use": "frases de ejemplo y sus traducciones"},
                {"name": "Wikimedia Commons", "url": "https://commons.wikimedia.org", "license": "varias licencias libres (ver cada archivo)", "use": "audio de pronunciación"},
            ],
        },
        "words": words,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lang", nargs="*", default=[], help="códigos de idioma (en fr de it pt nl sv ru ar ja ko zh)")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--size", type=int, default=10400, help="máximo de palabras por idioma (C1 ≈ 10 400 lemas)")
    args = ap.parse_args()
    targets = list(LANGS) if args.all else args.lang
    bad = [t for t in targets if t not in LANGS]
    if not targets or bad:
        ap.error(f"indica --all o --lang con códigos válidos: {', '.join(LANGS)}")
    OUT.mkdir(parents=True, exist_ok=True)
    es_entries, reverse, english = load_es_dump(set(targets))
    triang, en_es = load_en_translations(set(targets))
    for lang in targets:
        pack = build(lang, args.size, es_entries, reverse, english, triang, en_es)
        dest = OUT / f"{lang}.json.gz"
        with gzip.open(dest, "wt", encoding="utf-8", compresslevel=9) as f:
            json.dump(pack, f, ensure_ascii=False, separators=(",", ":"))
        log(f"[{lang}] → {dest.relative_to(ROOT)} ({dest.stat().st_size / 1e6:.1f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
