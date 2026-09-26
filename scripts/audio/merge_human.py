"""
Añade las grabaciones humanas (data/audio/human-<idioma>.json, de
commons_audio.py) al manifiesto que lee la app: public/audio/<idioma>/index.json
→ "human": {clave del texto → URL}. El reproductor las prefiere a la voz
sintética. Árabe, japonés y coreano, sin voz libre, tienen un manifiesto sólo
con grabaciones humanas.

  python3 scripts/audio/merge_human.py [idiomas…]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HUMAN = ROOT / "data/audio"
OUT = ROOT / "public/audio"


def clean(url: str) -> str:
    """Quita los parámetros de seguimiento que a veces devuelve la API (…?utm_source=…)."""
    if "?" not in url:
        return url
    base = url.split("?")[0]
    # Forma mal armada: …/transcoded/a/ab/X.wav?utm…/X.wav?utm….mp3 → …/X.wav/X.wav.mp3
    if "/transcoded/" in base:
        name = base.rsplit("/", 1)[-1]
        return f"{base}/{name}.mp3"
    return base


def merge(lang: str) -> None:
    src = HUMAN / f"human-{lang}.json"
    if not src.exists():
        print(f"{lang}: sin grabaciones humanas")
        return
    data = json.loads(src.read_text("utf-8"))
    for v in data.values():
        v["url"] = clean(v["url"])
        v["author"] = " · ".join(x.strip() for x in v["author"].splitlines() if x.strip())
    src.write_text(json.dumps(dict(sorted(data.items())), ensure_ascii=False, indent=0), "utf-8")
    out_dir = OUT / lang
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / "index.json"
    manifest = json.loads(target.read_text("utf-8")) if target.exists() else {"voice": None, "license": None, "source": None, "files": {}}
    manifest["human"] = {k: v["url"] for k, v in sorted(data.items())}
    target.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(f"{lang}: {len(data)} grabaciones humanas en el manifiesto")


if __name__ == "__main__":
    for lang in sys.argv[1:] or ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"]:
        merge(lang)
