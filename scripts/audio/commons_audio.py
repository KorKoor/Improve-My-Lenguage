"""
Grabaciones humanas (Wikimedia Commons / Lingua Libre) con autor y licencia.

  python3 scripts/audio/commons_audio.py [idiomas…]

1. Lee los textos que deben sonar (scripts/audio/.texts/<idioma>.json, de
   collect-texts.ts) y los audios que ya traen las palabras (Wiktionary).
2. En italiano, árabe, japonés y coreano (donde Wiktionary tiene pocos
   audios) busca además en la categoría «Lingua Libre pronunciation-<iso>».
3. Pide a Commons el autor y la licencia de cada archivo.
4. Escribe data/audio/human-<idioma>.json: clave del texto → {url, file, author, license}.

Respeta la API: User-Agent identificable, lotes de 50 y pausas.
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEXTS = ROOT / "scripts/audio/.texts"
OUT = ROOT / "data/audio"
API = "https://commons.wikimedia.org/w/api.php"
UA = "ImproveMyLanguagesBot/1.0 (https://github.com/KorKoor/Improve-My-Lenguage; aprendizaje de idiomas)"
LL = {"it": "ita", "ar": "ara", "ja": "jpn", "ko": "kor"}


def api(params: dict) -> dict:
    params = {**params, "format": "json", "maxlag": "5"}
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(12):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.loads(r.read())
            if "error" in data and data["error"].get("code") == "maxlag":
                time.sleep(5)
                continue
            time.sleep(0.4)
            return data
        except Exception as err:  # 429 u otros: esperar y reintentar
            wait = min(60, 5 * (attempt + 1))
            print(f"    reintento en {wait}s ({err})")
            time.sleep(wait)
    raise RuntimeError("Commons no responde")


def key_of(text: str) -> str:
    """Igual que audioKey() en src/lib/audio-key.ts (los textos ya vienen normalizados)."""
    return text.lower()


def transcoded_mp3(url: str) -> str:
    """https://upload.wikimedia.org/wikipedia/commons/a/ab/X.wav → …/transcoded/a/ab/X.wav/X.wav.mp3 (lo reproduce cualquier navegador)."""
    url = url.split("?")[0]
    if url.endswith(".mp3"):
        return url
    m = re.match(r"(https://upload\.wikimedia\.org/wikipedia/commons/)([0-9a-f]/[0-9a-f]{2}/)(.+)$", url)
    return f"{m.group(1)}transcoded/{m.group(2)}{m.group(3)}/{m.group(3)}.mp3" if m else url


CACHE = ROOT / ".cache/commons"


def lingua_libre(iso3: str, targets: set[str]) -> dict[str, str]:
    """Clave del texto → título del archivo, recorriendo la categoría de Lingua Libre."""
    found: dict[str, str] = {}
    for title in category_titles(iso3):
        mm = re.match(r"File:LL-Q\d+ \([a-z]+\)-(.+)\.(wav|ogg|flac|mp3)$", title)
        if not mm:
            continue
        rest = mm.group(1)
        # «Hablante-palabra»: el hablante puede tener guiones, así que se prueba cada corte.
        for i, ch in enumerate(rest):
            if ch == "-":
                word = rest[i + 1 :].replace("_", " ").lower()
                if word in targets and word not in found:
                    found[word] = title
    return found


def category_titles(iso3: str) -> list[str]:
    """Todos los archivos de la categoría (se guardan en .cache para no repetir la consulta)."""
    cached = CACHE / f"ll-{iso3}.json"
    if cached.exists():
        return json.loads(cached.read_text("utf-8"))
    titles: list[str] = []
    params = {"action": "query", "list": "categorymembers", "cmtitle": f"Category:Lingua Libre pronunciation-{iso3}", "cmlimit": "500", "cmtype": "file"}
    pages = 0
    while True:
        data = api(params)
        titles += [m["title"] for m in data["query"]["categorymembers"]]
        pages += 1
        if "continue" not in data:
            break
        params.update(data["continue"])
        if pages % 20 == 0:
            print(f"    {iso3}: {pages * 500} archivos revisados")
    CACHE.mkdir(parents=True, exist_ok=True)
    cached.write_text(json.dumps(titles, ensure_ascii=False), "utf-8")
    return titles


def metadata(titles: list[str]) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for i in range(0, len(titles), 50):
        batch = titles[i : i + 50]
        data = api({"action": "query", "prop": "imageinfo", "iiprop": "url|extmetadata", "iiextmetadatafilter": "Artist|LicenseShortName", "titles": "|".join(batch)})
        for page in data["query"]["pages"].values():
            info = (page.get("imageinfo") or [None])[0]
            if not info:
                continue
            meta = info.get("extmetadata", {})
            artist = re.sub(r"<[^>]+>", "", html.unescape(meta.get("Artist", {}).get("value", "")))
            artist = " · ".join(x.strip() for x in artist.splitlines() if x.strip())
            out[page["title"]] = {
                "url": transcoded_mp3(info["url"]),
                "file": page["title"].removeprefix("File:"),
                "author": artist or "desconocido",
                "license": meta.get("LicenseShortName", {}).get("value", "ver archivo"),
            }
    return out


def title_from_url(url: str) -> str | None:
    m = re.search(r"/commons/(?:transcoded/)?[0-9a-f]/[0-9a-f]{2}/([^/]+)", url)
    # Commons normaliza los títulos con espacios, no con guiones bajos.
    return "File:" + urllib.parse.unquote(html.unescape(m.group(1))).replace("_", " ") if m else None


def build(lang: str) -> None:
    items = json.loads((TEXTS / f"{lang}.json").read_text("utf-8"))
    targets = {it["key"] for it in items}
    # Audios que ya traen las palabras del vocabulario (Wiktionary → Commons).
    existing: dict[str, str] = {}
    wordfile = TEXTS / f"{lang}.words-audio.json"
    if wordfile.exists():
        for key, url in json.loads(wordfile.read_text("utf-8")).items():
            t = title_from_url(url)
            if t and key in targets:
                existing[key] = t
    found = dict(existing)
    if lang in LL:
        print(f"  {lang}: buscando en Lingua Libre…")
        for key, title in lingua_libre(LL[lang], targets - set(found)).items():
            found[key] = title
    meta = metadata(sorted(set(found.values())))
    result = {key: meta[t] for key, t in found.items() if t in meta}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"human-{lang}.json").write_text(json.dumps(dict(sorted(result.items())), ensure_ascii=False, indent=0), "utf-8")
    print(f"{lang}: {len(result)} grabaciones humanas de {len(targets)} textos ({len(existing)} de Wiktionary)")


if __name__ == "__main__":
    for lang in sys.argv[1:] or ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"]:
        build(lang)
