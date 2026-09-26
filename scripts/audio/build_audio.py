"""
Audio pregenerado con voces libres (Piper), para que la app suene bien en
cualquier dispositivo aunque no tenga voces instaladas. Gratis y en local.

Pasos:
  1. npx tsx --conditions=react-server scripts/audio/collect-texts.ts   (textos → scripts/audio/.texts/)
  2. python3 -m venv .cache/piper-env && .cache/piper-env/bin/pip install "piper-tts[zh]" imageio-ffmpeg
     (el chino: pip install --no-deps g2pw && pip install "transformers<6" si no se quiere torch)
  3. .cache/piper-env/bin/python scripts/audio/build_audio.py [idiomas…]

Genera public/audio/<idioma>/<id>.mp3 y public/audio/<idioma>/index.json
(clave del texto → archivo). Idempotente: el nombre del archivo es un hash de
voz + texto, así que sólo se genera lo que falta y se borra lo que sobra.

Voces: sólo las que permiten uso comercial (ver src/lib/audio-key.ts). Árabe,
japonés y coreano no tienen voz libre así: usan grabaciones humanas y la voz
del navegador.
"""
import hashlib
import json
import subprocess
import sys
import tempfile
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEXTS = ROOT / "scripts/audio/.texts"
OUT = ROOT / "public/audio"
MODELS = ROOT / ".cache/piper-voices"
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main"

# Mantener sincronizado con PREGEN_VOICES en src/lib/audio-key.ts.
VOICES = {
    "en": ("en_US-ljspeech-medium", "Dominio público (LJ Speech)"),
    "fr": ("fr_FR-siwis-medium", "CC BY 4.0 (SIWIS)"),
    "de": ("de_DE-thorsten-medium", "CC0 (Thorsten-Voice)"),
    "it": ("it_IT-paola-medium", "CC0"),
    "pt": ("pt_BR-faber-medium", "CC0"),
    "nl": ("nl_NL-pim-medium", "CC0"),
    "sv": ("sv_SE-nst-medium", "CC0 (NST)"),
    "ru": ("ru_RU-denis-medium", "CC0"),
    "zh": ("zh_CN-chaowen-medium", "CC0"),
}


def model_path(voice: str) -> Path:
    lang_region, name, quality = voice.split("-")
    family = lang_region.split("_")[0]
    base = f"{family}/{lang_region}/{name}/{quality}/{voice}"
    MODELS.mkdir(parents=True, exist_ok=True)
    onnx = MODELS / f"{voice}.onnx"
    for suffix in (".onnx", ".onnx.json"):
        target = MODELS / f"{voice}{suffix}"
        if not target.exists():
            print(f"  descargando {voice}{suffix}…")
            urllib.request.urlretrieve(f"{HF}/{base}{suffix}", target)
    return onnx


def ffmpeg() -> str:
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


def build(lang: str) -> None:
    if lang not in VOICES:
        print(f"{lang}: sin voz libre de uso comercial; se omite")
        return
    from piper import PiperVoice
    from piper.config import SynthesisConfig

    voice_name, license_ = VOICES[lang]
    items = json.loads((TEXTS / f"{lang}.json").read_text("utf-8"))
    # download_dir: recursos extra (el chino necesita el modelo g2pW, ~600 MB, que se baja solo).
    voice = PiperVoice.load(str(model_path(voice_name)), download_dir=MODELS)
    # Un poco más despacio que lo normal: es para aprender.
    config = SynthesisConfig(length_scale=1.12)
    out_dir = OUT / lang
    out_dir.mkdir(parents=True, exist_ok=True)
    files: dict[str, str] = {}
    made = 0
    for it in items:
        name = hashlib.sha1(f"{voice_name}|{it['text']}".encode()).hexdigest()[:12] + ".mp3"
        files[it["key"]] = name
        target = out_dir / name
        if target.exists():
            continue
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as wf:
                voice.synthesize_wav(it["text"], wf, syn_config=config)
            # MP3 mono a 32 kbps: se oye bien en móviles y pesa ~4 KB por segundo.
            subprocess.run(
                [ffmpeg(), "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-ar", "22050", "-b:a", "32k", str(target)],
                check=True,
            )
        made += 1
        if made % 100 == 0:
            print(f"  {lang}: {made} nuevos…")
    # Borra lo que ya no está en el manifiesto.
    keep = set(files.values())
    removed = 0
    for f in out_dir.glob("*.mp3"):
        if f.name not in keep:
            f.unlink()
            removed += 1
    # Conserva las grabaciones humanas que añadió merge_human.py.
    old = out_dir / "index.json"
    human = json.loads(old.read_text("utf-8")).get("human") if old.exists() else None
    manifest = {"voice": voice_name, "license": license_, "source": "https://huggingface.co/rhasspy/piper-voices", "files": dict(sorted(files.items()))}
    if human:
        manifest["human"] = human
    (out_dir / "index.json").write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), "utf-8")
    size = sum(f.stat().st_size for f in out_dir.glob("*.mp3"))
    print(f"{lang}: {len(files)} textos · {made} nuevos · {removed} borrados · {size / 1e6:.1f} MB")


if __name__ == "__main__":
    for lang in sys.argv[1:] or list(VOICES):
        build(lang)
