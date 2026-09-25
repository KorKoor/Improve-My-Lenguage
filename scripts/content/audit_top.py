"""Auditoría de las palabras más frecuentes de cada paquete.

Marca entradas sospechosas para revisarlas a mano y corregirlas con
`overrides/<idioma>.json` (luego se reconstruye el paquete):

  python scripts/content/audit_top.py --lang fr --top 1000
  python scripts/content/audit_top.py --all --top 300 --summary

Heurísticas (ninguna es perfecta; sirven para priorizar la revisión):
  rara        la primera traducción es una palabra española poco usada (wordfreq)
  larga       traducción de más de 4 palabras (suele ser una definición)
  anotación   restos de Wiktionary: corchetes, barras, paréntesis al inicio
  categoría   verbo cuya traducción no es un infinitivo (suele ser una forma suelta)
  plural      el lema parece el plural de otro lema del paquete (giorni/giorno)
  sin_trad    no tiene traducción al español
  sin_ejemplo palabra muy frecuente sin frase de ejemplo
"""
from __future__ import annotations

import argparse
import gzip
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACKS = ROOT / "data" / "packs"
LANGS = ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"]

try:  # wordfreq es opcional: sin él no se marca «rara».
    from wordfreq import zipf_frequency
except Exception:  # pragma: no cover
    zipf_frequency = None  # type: ignore

ES_INFINITIVE = re.compile(r"^\S*?(ar|er|ir|ír)(se)?\b")
PLURAL_RULES: dict[str, list[tuple[str, list[str]]]] = {
    "it": [("i", ["o", "e", "a"]), ("e", ["a"])],
    "fr": [("s", [""]), ("x", [""]), ("aux", ["al"])],
    "pt": [("s", [""]), ("ões", ["ão"]), ("ães", ["ão"]), ("is", ["l"])],
    "en": [("s", [""]), ("es", [""]), ("ies", ["y"])],
    "nl": [("en", [""]), ("s", [""])],
    "sv": [("ar", [""]), ("er", [""]), ("or", ["a"])],
    "de": [("en", [""]), ("e", [""]), ("n", [""]), ("er", [""])],
}


def is_rare(translation: str) -> bool:
    """Primera palabra de la traducción con zipf < 2,3 en español (≈ menos de 1 por 5 millones)."""
    if zipf_frequency is None:
        return False
    words = [w for w in re.findall(r"[a-záéíóúñü]+", translation.lower()) if len(w) > 3]
    return bool(words) and all(zipf_frequency(w, "es") < 2.3 for w in words)


def has_annotation(t: str) -> bool:
    return bool(re.search(r"[\[\]{}=]|^\(|\(\s*\)|\s/\s|\d", t))


def category_mismatch(pos: str, translations: list[str]) -> bool:
    if not translations:
        return False
    first = translations[0].lower()
    if pos == "verb":
        return not any(ES_INFINITIVE.match(t.lower()) for t in translations) and not first.startswith(("hay", "tener que", "haber"))
    # (Sustantivos: «mujer», «lugar», «poder» terminan como infinitivos; no se comprueban.)
    return False


def plural_of(lemma: str, lang: str, lemmas: set[str]) -> str | None:
    for suffix, singular_endings in PLURAL_RULES.get(lang, []):
        if lemma.endswith(suffix) and len(lemma) > len(suffix) + 2:
            stem = lemma[: -len(suffix)]
            for end in singular_endings:
                cand = stem + end
                if cand != lemma and cand in lemmas:
                    return cand
    return None


def audit_entry(w: dict, lang: str, lemmas: set[str], rank: int) -> list[str]:
    flags: list[str] = []
    t = w.get("t") or []
    lemma = w.get("l", "")
    if not t:
        flags.append("sin_trad")
    else:
        if is_rare(t[0]):
            flags.append("rara")
        if any(len(x.split()) > 4 for x in t):
            flags.append("larga")
        if any(has_annotation(x) for x in t):
            flags.append("anotación")
        if category_mismatch(w.get("p", ""), t):
            flags.append("categoría")
    base = plural_of(lemma, lang, lemmas)
    if base and w.get("p") in ("noun", "adjective"):
        flags.append(f"plural→{base}")
    if rank <= 500 and not w.get("ex"):
        flags.append("sin_ejemplo")
    return flags


def audit(lang: str, top: int) -> list[tuple[int, dict, list[str]]]:
    data = json.load(gzip.open(PACKS / f"{lang}.json.gz", "rt", encoding="utf-8"))
    words = data["words"]
    lemmas = {w["l"] for w in words}
    out = []
    for i, w in enumerate(words[:top], start=1):
        flags = audit_entry(w, lang, lemmas, i)
        if flags:
            out.append((i, w, flags))
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lang", nargs="*", default=[])
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--top", type=int, default=1000)
    ap.add_argument("--summary", action="store_true", help="sólo recuento por idioma y tipo")
    args = ap.parse_args()
    langs = LANGS if args.all else args.lang
    if not langs:
        ap.error("indica --lang o --all")
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    for lang in langs:
        found = audit(lang, args.top)
        counts: dict[str, int] = {}
        for _, _, flags in found:
            for f in flags:
                key = f.split("→")[0]
                counts[key] = counts.get(key, 0) + 1
        print(f"[{lang}] {len(found)} sospechosas en las {args.top} primeras · {counts}")
        if args.summary:
            continue
        for rank, w, flags in found:
            print(f"  {rank:>5} {w['l']} [{w.get('p')}] = {' / '.join(w.get('t') or [])}   ← {', '.join(flags)}")


if __name__ == "__main__":
    main()
