"""
Orden de trazos real para la caligrafía (japonés y chino).

  npx tsx --conditions=react-server scripts/content/stroke-chars.ts   (lista de caracteres)
  python3 scripts/content/build_strokes.py

Fuentes (se guardan en cada archivo generado):
  - Japonés (kana y kanji): KanjiVG, © Ulrich Apel y colaboradores, CC BY-SA 3.0
    https://kanjivg.tagaini.net
  - Chino (hanzi): Make Me a Hanzi (graphics.txt), derivado de las fuentes
    Arphic PL KaitiM GB y UKai, Arphic Public License
    https://github.com/skishore/makemeahanzi

Salida: data/strokes/<idioma>.json. Cada trazo es una polilínea en una caja de
100 × 100 que empieza donde empieza el trazo real (así la animación muestra la
dirección y la práctica de calcar compara puntos) y lleva una descripción en
palabras generada a partir de la forma, para lectores de pantalla.
"""
import json
import math
import re
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHARS = ROOT / "scripts/content/.strokes/chars.json"
CACHE = ROOT / ".cache/strokes"
OUT = ROOT / "data/strokes"
UA = "ImproveMyLanguagesBot/1.0 (https://github.com/KorKoor/Improve-My-Lenguage)"
KANJIVG = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/{:05x}.svg"
MMAH = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/graphics.txt"


def fetch(url: str, target: Path) -> Path:
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=120) as r:
            target.write_bytes(r.read())
        time.sleep(0.1)
    return target


# ── Caminos SVG → puntos ────────────────────────────────────────────────────
TOKEN = re.compile(r"[MmLlCcSsHhVvZz]|-?\d*\.?\d+(?:e-?\d+)?")


def path_points(d: str, steps: int = 8) -> list[tuple[float, float]]:
    """Muestrea un camino SVG (M, L, H, V, C, S y sus relativos) en una polilínea."""
    toks = TOKEN.findall(d)
    pts: list[tuple[float, float]] = []
    x = y = 0.0
    cmd = ""
    last_ctrl: tuple[float, float] | None = None
    i = 0

    def num() -> float:
        nonlocal i
        v = float(toks[i])
        i += 1
        return v

    while i < len(toks):
        if re.fullmatch(r"[A-Za-z]", toks[i]):
            cmd = toks[i]
            i += 1
            if cmd in "Zz":
                continue
        rel = cmd.islower()
        c = cmd.upper()
        if c == "M":
            x, y = (x + num(), y + num()) if rel else (num(), num())
            pts.append((x, y))
            cmd = "l" if rel else "L"
            last_ctrl = None
        elif c == "L":
            x, y = (x + num(), y + num()) if rel else (num(), num())
            pts.append((x, y))
            last_ctrl = None
        elif c == "H":
            x = x + num() if rel else num()
            pts.append((x, y))
        elif c == "V":
            y = y + num() if rel else num()
            pts.append((x, y))
        elif c in "CS":
            if c == "C":
                x1, y1 = num(), num()
                if rel:
                    x1, y1 = x + x1, y + y1
            else:
                x1, y1 = (2 * x - last_ctrl[0], 2 * y - last_ctrl[1]) if last_ctrl else (x, y)
            x2, y2, ex, ey = num(), num(), num(), num()
            if rel:
                x2, y2, ex, ey = x + x2, y + y2, x + ex, y + ey
            for k in range(1, steps + 1):
                t = k / steps
                mt = 1 - t
                pts.append((
                    mt**3 * x + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t**3 * ex,
                    mt**3 * y + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t**3 * ey,
                ))
            last_ctrl = (x2, y2)
            x, y = ex, ey
        else:
            i += 1
    return pts


def simplify(pts: list[tuple[float, float]], min_gap: float = 2.5) -> list[tuple[float, float]]:
    out = [pts[0]]
    for p in pts[1:-1]:
        if math.dist(p, out[-1]) >= min_gap:
            out.append(p)
    if len(pts) > 1:
        out.append(pts[-1])
    return out


def to_d(pts: list[tuple[float, float]]) -> str:
    f = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts)


# ── Descripción en palabras (lectores de pantalla) ─────────────────────────
def zone(p: tuple[float, float]) -> str:
    v = "arriba" if p[1] < 36 else "abajo" if p[1] > 64 else "en medio"
    h = "a la izquierda" if p[0] < 36 else "a la derecha" if p[0] > 64 else ""
    return f"{v} {h}".strip() if h or v != "en medio" else "en el centro"


def direction(a: tuple[float, float], b: tuple[float, float]) -> str:
    dx, dy = b[0] - a[0], b[1] - a[1]
    if abs(dy) < 0.4 * abs(dx):
        return "hacia la derecha" if dx > 0 else "hacia la izquierda"
    if abs(dx) < 0.4 * abs(dy):
        return "hacia abajo" if dy > 0 else "hacia arriba"
    return "en diagonal hacia " + ("abajo" if dy > 0 else "arriba") + " a la " + ("derecha" if dx > 0 else "izquierda")


def describe(pts: list[tuple[float, float]], n: int, total: int) -> str:
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    length = math.hypot(dx, dy)
    path_len = sum(math.dist(p, q) for p, q in zip(pts, pts[1:]))
    head = f"Trazo {n} de {total}" if total > 1 else "Un solo trazo"
    if path_len < 9:
        return f"{head}: un punto corto, {zone(a)}."
    # Esquina: el punto más alejado de la recta inicio–final (o del inicio, si el trazo vuelve).
    if length > 1:
        dev = [abs(dx * (a[1] - p[1]) - dy * (a[0] - p[0])) / length for p in pts]
    else:
        dev = [math.dist(a, p) for p in pts]
    k = max(range(len(pts)), key=lambda i: dev[i])
    first, second = math.dist(a, pts[k]), math.dist(pts[k], b)
    if dev[k] > 0.3 * max(length, 1) and first > 8 and second > 8:
        d1, d2 = direction(a, pts[k]), direction(pts[k], b)
        if d1 != d2:
            return f"{head}: empieza {zone(a)}, va {d1} y luego gira {d2}."
    shape = {"hacia la derecha": "horizontal, de izquierda a derecha", "hacia la izquierda": "horizontal, de derecha a izquierda",
             "hacia abajo": "vertical, de arriba abajo", "hacia arriba": "vertical, de abajo arriba"}.get(direction(a, b), direction(a, b))
    extra = ", curvado" if dev[k] > 0.12 * max(length, 1) else ""
    if second <= 8 < first and dev[k] > 0.12 * max(length, 1) and length > 1:
        extra = ", con un ganchito al final"
    return f"{head}: empieza {zone(a)}, {shape}{extra}."


def finish(strokes_pts: list[list[tuple[float, float]]]) -> list[dict]:
    total = len(strokes_pts)
    return [{"d": to_d(simplify(p)), "desc": describe(p, i + 1, total)} for i, p in enumerate(strokes_pts)]


# ── KanjiVG (japonés) ───────────────────────────────────────────────────────
def kanjivg(ch: str) -> list[dict] | None:
    try:
        svg = fetch(KANJIVG.format(ord(ch)), CACHE / "kanjivg" / f"{ord(ch):05x}.svg").read_text("utf-8")
    except Exception as err:
        print(f"  {ch}: sin KanjiVG ({err})")
        return None
    ds = re.findall(r'<path id="kvg:[0-9a-f]+-s\d+"[^>]*?\sd="([^"]+)"', svg)
    if not ds:
        return None
    scale = 100 / 109
    return finish([[(x * scale, y * scale) for x, y in path_points(d)] for d in ds])


# ── Make Me a Hanzi (chino) ─────────────────────────────────────────────────
def mmah(targets: set[str]) -> dict[str, list[dict]]:
    path = fetch(MMAH, CACHE / "makemeahanzi-graphics.txt")
    out: dict[str, list[dict]] = {}
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            row = json.loads(line)
            if row["character"] not in targets:
                continue
            # Coordenadas 1024 × 1024 con el eje y hacia arriba (900 = borde superior).
            strokes = [[(x / 1024 * 100, (900 - y) / 1024 * 100) for x, y in med] for med in row["medians"]]
            out[row["character"]] = finish(strokes)
    return out


def main() -> None:
    chars = json.loads(CHARS.read_text("utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    ja = []
    for c in chars["ja"]:
        s = kanjivg(c["ch"])
        if s:
            ja.append({**c, "strokes": s})
    (OUT / "ja.json").write_text(json.dumps({
        "source": "KanjiVG", "url": "https://kanjivg.tagaini.net", "author": "Ulrich Apel y colaboradores de KanjiVG",
        "license": "CC BY-SA 3.0", "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/deed.es", "chars": ja,
    }, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(f"ja: {len(ja)} de {len(chars['ja'])} caracteres")

    zh_rows = chars["zh"]
    got = mmah({c["ch"] for c in zh_rows})
    zh = [{**c, "r": re.sub(r" \([^)]*\)", "", c["r"]), "strokes": got[c["ch"]]} for c in zh_rows if c["ch"] in got]
    (OUT / "zh.json").write_text(json.dumps({
        "source": "Make Me a Hanzi", "url": "https://github.com/skishore/makemeahanzi", "author": "Shaunak Kishore; trazos derivados de las fuentes Arphic PL KaitiM GB y UKai",
        "license": "Arphic Public License", "licenseUrl": "http://ftp.gnu.org/non-gnu/chinese-fonts-truetype/LICENSE", "chars": zh,
    }, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(f"zh: {len(zh)} de {len(zh_rows)} caracteres")


if __name__ == "__main__":
    main()
