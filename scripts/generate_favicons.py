#!/usr/bin/env python3
"""Generate light/dark favicon assets from source logo PNGs.

Usage:
  python3 scripts/generate_favicons.py
"""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

LIGHT_SOURCE = PUBLIC / "market-ai-logo.png"
DARK_SOURCE = PUBLIC / "market-ai-logo-white.png"

PAD_RATIO = 0.06
ALPHA_THRESHOLD = 2


def tight_crop(image: Image.Image) -> Image.Image:
    alpha = image.split()[-1]
    mask = alpha.point(lambda value: 255 if value >= ALPHA_THRESHOLD else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("source image is fully transparent")
    return image.crop(bbox)


def render_square(source: Image.Image, size: int, pad_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    available = max(1, int(round(size * (1 - 2 * pad_ratio))))
    scale = min(available / source.width, available / source.height)
    target_w = max(1, int(round(source.width * scale)))
    target_h = max(1, int(round(source.height * scale)))
    resized = source.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = (size - target_w) // 2
    y = (size - target_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def write_set(source_path: Path, suffix: str) -> None:
    source = Image.open(source_path).convert("RGBA")
    icon = tight_crop(source)

    targets = {
        f"favicon-16x16{suffix}.png": 16,
        f"favicon-32x32{suffix}.png": 32,
        f"apple-touch-icon{suffix}.png": 180,
        f"android-chrome-192x192{suffix}.png": 192,
        f"android-chrome-512x512{suffix}.png": 512,
    }

    rendered = {}
    for filename, size in targets.items():
        out = render_square(icon, size, PAD_RATIO)
        rendered[size] = out
        out.save(PUBLIC / filename, "PNG")

    ico_name = "favicon.ico" if suffix == "" else f"favicon{suffix}.ico"
    rendered[32].save(
        PUBLIC / ico_name,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )


def main() -> None:
    write_set(LIGHT_SOURCE, "")
    write_set(DARK_SOURCE, "-dark")
    print("Generated light and dark favicon assets.")


if __name__ == "__main__":
    main()
