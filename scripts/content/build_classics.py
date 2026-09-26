"""
Clásicos de dominio público (Wikisource) para leer: fábulas, cuentos y relatos
breves en los 12 idiomas. Se importan una vez, se revisan a mano y se guardan
con su fuente, autor y licencia; la app calcula el nivel de cada texto con el
vocabulario (lib/reading/text.ts → analyzeTokens), nunca a ojo.

  python3 scripts/content/build_classics.py [idiomas…]

Salida: data/readings/<idioma>.json → [{id, title, author, work, url, license, paragraphs}].
Los textos largos se recortan (se indica «fragmento»).
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

from opencc import OpenCC  # pip install opencc-python-reimplemented

T2S = OpenCC("t2s")  # el chino de la app es simplificado

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data/readings"
DEBUG = bool(__import__("os").environ.get("DEBUG"))
UA = "ImproveMyLanguagesBot/1.0 (https://github.com/KorKoor/Improve-My-Lenguage; aprendizaje de idiomas)"
MAX_CHARS = {"ja": 1800, "zh": 1500, "ko": 1800}
DEFAULT_MAX = 3000

# (título en Wikisource, autor, obra, párrafos iniciales que saltar: cabeceras
# de la edición revisadas a mano). Autores fallecidos hace más de 70 años.
JACOBS = "Esopo (versión de Joseph Jacobs, 1894)"
CLASSICS: dict[str, list[tuple[str, str, str, int]]] = {
    "en": [
        ("The Fables of Æsop (Jacobs)/The Fox and the Grapes", JACOBS, "Fábulas de Esopo", 5),
        ("The Fables of Æsop (Jacobs)/The Lion and the Mouse", JACOBS, "Fábulas de Esopo", 5),
        ("The Fables of Æsop (Jacobs)/The Hare and the Tortoise", JACOBS, "Fábulas de Esopo", 5),
        ("The Fables of Æsop (Jacobs)/The Dog and the Shadow", JACOBS, "Fábulas de Esopo", 6),
    ],
    "fr": [
        ("Fables d’Ésope (trad. Chambry, 1927)/Le Corbeau et le Renard", "Esopo (trad. Émile Chambry, 1927)", "Fábulas de Esopo", 6),
        ("Fables de La Fontaine (éd. 1874)/Le Corbeau et le Renard", "Jean de La Fontaine", "Fábulas", 5),
        ("Fables de La Fontaine (éd. 1874)/La Cigale et la Fourmi", "Jean de La Fontaine", "Fábulas", 5),
    ],
    "de": [
        ("Die Sternthaler (1857)", "Hermanos Grimm", "Cuentos de niños y del hogar (1857)", 9),
        ("Der süße Brei (1857)", "Hermanos Grimm", "Cuentos de niños y del hogar (1857)", 9),
        ("Rothkäppchen (1857)", "Hermanos Grimm", "Cuentos de niños y del hogar (1857)", 9),
    ],
    "it": [
        ("Le avventure di Pinocchio/Capitolo 1", "Carlo Collodi", "Las aventuras de Pinocho", 0),
        ("Le avventure di Pinocchio/Capitolo 2", "Carlo Collodi", "Las aventuras de Pinocho", 1),
    ],
    "pt": [
        ("Fabulas de Narizinho/A cigarra e a formiga", "Monteiro Lobato", "Fábulas de Narizinho (1921)", 4),
    ],
    "nl": [
        ("Mengelingen/Proeve van fabelen/De Vos en de Hond", "Anónimo (s. XVIII)", "Mengelingen", 1),
        ("Sprookjes uit de nalatenschap van Moeder de Gans/12", "Anónimo (trad. neerlandesa, s. XIX)", "Sprookjes uit de nalatenschap van Moeder de Gans", 1),
    ],
    "sv": [
        ("50 småhistorier/Räven och katten", "Anónimo", "50 småhistorier", 1),
        ("50 småhistorier/Räven och vargen", "Anónimo", "50 småhistorier", 1),
        ("50 småhistorier/Lejonet och räven", "Anónimo", "50 småhistorier", 1),
    ],
    "ru": [
        ("Первая русская книга для чтения (Толстой)", "León Tolstói", "Primer libro ruso de lectura", 3),
        ("Филипок (Толстой)", "León Tolstói", "Cuentos para niños", 2),
        ("Лев и собачка (Толстой)", "León Tolstói", "Cuentos para niños", 2),
    ],
    "ar": [
        ("كليلة ودمنة (الأميرية، 1937)/باب الناسك والضيف", "Bidpai (trad. Ibn al-Muqaffa)", "Calila e Dimna", 2),
    ],
    "ja": [
        ("注文の多い料理店", "Kenji Miyazawa", "El restaurante de los muchos pedidos (1924)", 4),
        ("桃太郎", "Ryūnosuke Akutagawa", "Momotarō (1924)", 4),
    ],
    "ko": [
        ("제일 짧은 동화", "Bang Jeong-hwan", "Revista «Eorini» (1930)", 2),
    ],
    "zh": [
        ("一件小事", "Lu Xun", "Grito de llamada (1919)", 0),
    ],
}

# Correcciones revisadas a mano: la inicial ornamental que falta en el escaneo
# (se ve en la imagen), ruido de OCR y notas del editor al final del texto.
FIXES: dict[str, list[tuple[str, str]]] = {
    "The Fables of Æsop (Jacobs)/The Dog and the Shadow": [("T happened", "IT happened")],
    "كليلة ودمنة (الأميرية، 1937)/باب الناسك والضيف": [(" E ", " "), ("( انقضى باب التاسك والضيف )", ""), (") انقضى باب التاسك والضيف )", "")],
}
# El texto termina antes de este párrafo (notas del editor, avisos de licencia).
END_AT: dict[str, str] = {"一件小事": "（一九二〇年七月。）"}
# Avisos de licencia de Wikisource que a veces quedan dentro del texto.
LICENSE_NOTE = re.compile(r"Public domain|この著作物は|属于公有领域|屬於公有領域|перешло в общественное достояние|공유 저작물|domaine public", re.I)

# Títulos de subpáginas que solos no dicen nada.
DISPLAY = {
    "Fables d’Ésope (trad. Chambry, 1927)/Le Corbeau et le Renard": "Le Corbeau et le Renard (Ésope)",
    "Fables de La Fontaine (éd. 1874)/Le Corbeau et le Renard": "Le Corbeau et le Renard (La Fontaine)",
    "Le avventure di Pinocchio/Capitolo 1": "Pinocchio · Capitolo 1",
    "Le avventure di Pinocchio/Capitolo 2": "Pinocchio · Capitolo 2",
    "Sprookjes uit de nalatenschap van Moeder de Gans/12": "Het vroolijke sprookje van den kleinen Frits",
}

SKIP_CLASSES = {"thumbcaption", "thumb", "thumbinner", "gallery", "gallerytext", "catlinks", "ws-summary", "wst-header", "licenseContainer", "ws-license", "wst-rh", "ws-noexport", "headertemplate", "reference", "references", "mw-editsection", "noprint", "ws-header", "navbox", "mw-references-wrap", "pagenum", "ws-pagenum", "mw-cite-backlink"}
SKIP_TAGS = {"style", "script", "table", "sup", "figcaption", "math"}
VOID = {"br", "img", "hr", "meta", "link", "input", "wbr", "col", "source"}


class Extract(HTMLParser):
    """Texto de los párrafos y poemas, sin encabezados de navegación, notas ni tablas."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, bool, bool]] = []  # (tag, skip, block)
        self.paragraphs: list[str] = []
        self.cur: list[str] = []

    def skipping(self) -> bool:
        return any(s for _, s, _ in self.stack)

    def flush(self) -> None:
        text = re.sub(r"[ \t ]+", " ", "".join(self.cur)).strip()
        text = re.sub(r" *\n *", "\n", text)
        if text:
            self.paragraphs.append(text)
        self.cur = []

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            if tag == "br" and not self.skipping():
                self.cur.append("\n")
            # Inicial ornamental (una imagen con la letra en «alt»).
            alt = dict(attrs).get("alt") or ""
            if tag == "img" and len(alt) == 1 and alt.isalpha() and not self.skipping():
                self.cur.append(alt)
            return
        cls = set((dict(attrs).get("class") or "").split())
        skip = tag in SKIP_TAGS or bool(cls & SKIP_CLASSES) or (tag == "span" and "mw-headline" in cls) or tag in {"h1", "h2", "h3", "h4"}
        block = tag in {"p", "div", "li", "dd", "blockquote"}
        if block and not self.skipping():
            self.flush()
        self.stack.append((tag, skip, block))

    def handle_endtag(self, tag):
        while self.stack:
            t, _, block = self.stack.pop()
            if block and not self.skipping():
                self.flush()
            if t == tag:
                break

    def handle_data(self, data):
        if not self.skipping():
            self.cur.append(data)


def api(lang: str, params: dict) -> dict:
    url = f"https://{lang}.wikisource.org/w/api.php?" + urllib.parse.urlencode({**params, "format": "json", "formatversion": "2"})
    for attempt in range(8):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
                data = json.loads(r.read())
            time.sleep(0.5)
            return data
        except Exception as err:
            time.sleep(3 * (attempt + 1))
            print(f"    reintento ({err})")
    return {}


def clean(paragraphs: list[str], lang: str) -> list[str]:
    out = []
    for p in paragraphs:
        p = re.sub(r"\[\d+\]", "", p).replace("\ufeff", "").strip()
        # Saltos de línea de la edición impresa: se une el párrafo.
        p = re.sub(r"\s*\n\s*", "" if lang in ("ja", "zh") else " ", p)
        # Guiones de fin de línea: «Mäd- chen» → «Mädchen».
        p = re.sub(r"(\w)- (\w)", r"\1\2", p)
        if lang == "zh":
            p = T2S.convert(p)
        if lang == "ja":
            # Lecturas entre paréntesis (furigana): la app ya las muestra al tocar.
            p = re.sub(r"（[ぁ-ゖァ-ヺー]+）", "", p)
        # Fuera líneas de navegación y de edición.
        if not p or re.fullmatch(r"[\d\s.·—–\-←→<>|]+", p) or len(p) < 3:
            continue
        out.append(p)
    return out


def fetch(lang: str, title: str) -> tuple[list[str], str] | None:
    params = {"action": "parse", "page": title, "prop": "text|displaytitle", "redirects": "1", "disablelimitreport": "1"}
    data = api(lang, params)
    parse = data.get("parse")
    if not parse:
        raise SystemExit(f"{lang}: «{title}» no existe o Wikisource no respondió; vuelve a ejecutar")
    text = parse["text"]
    # Si el texto viene de páginas escaneadas (ProofreadPage), sólo ese bloque.
    m = re.search(r'<div class="prp-pages-output"', text)
    if m:
        text = text[m.start():]
    ex = Extract()
    ex.feed(text)
    ex.flush()
    paras = clean(ex.paragraphs, lang)
    return paras, parse["title"]


def trim(paras: list[str], limit: int) -> tuple[list[str], bool]:
    out, total = [], 0
    for p in paras:
        if total + len(p) > limit and out:
            return out, True
        out.append(p)
        total += len(p)
    return out, False


def build(lang: str) -> None:
    items = []
    for title, author, work, skip in CLASSICS.get(lang, []):
        got = fetch(lang, title)
        if not got:
            continue
        paras, real_title = got
        if DEBUG:
            print(f"--- {lang} {real_title}")
            for i, p in enumerate(paras[:14]):
                print(f"  {i:2} {p[:110]}")
        paras = paras[skip:]
        for i, p in enumerate(paras):
            if LICENSE_NOTE.search(p) or (title in END_AT and p.startswith(END_AT[title])):
                paras = paras[:i]
                break
        for a, b in FIXES.get(title, []):
            paras = [p.replace(a, b).strip() for p in paras]
        if not paras:
            print(f"  {lang}: «{title}» sin texto")
            continue
        paras, cut = trim(paras, MAX_CHARS.get(lang, DEFAULT_MAX))
        short = DISPLAY.get(title) or re.sub(r"\s*\((La Fontaine|Толстой|Monteiro Lobato|1857|[^)]*\d{4}[^)]*)\)$", "", real_title.split("/")[-1])
        items.append({
            "id": re.sub(r"[^\w]+", "-", real_title.lower()).strip("-")[:60],
            "title": short,
            "author": author,
            "work": work,
            "url": f"https://{lang}.wikisource.org/wiki/" + urllib.parse.quote(real_title.replace(" ", "_")),
            "license": "Dominio público",
            "excerpt": cut,
            "paragraphs": paras,
        })
        print(f"  {lang}: «{short}» · {len(paras)} párrafos · {sum(map(len, paras))} caracteres{' (fragmento)' if cut else ''}")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{lang}.json").write_text(json.dumps(items, ensure_ascii=False, indent=1), "utf-8")


if __name__ == "__main__":
    for lang in sys.argv[1:] or list(CLASSICS):
        build(lang)
