"""Download, instance and subset the CV fonts.

Produces Latin + Greek subsets in public/fonts as:
  - .ttf   consumed by jsPDF when generating the vector PDF
  - .woff2 consumed by @font-face so the on-screen preview uses the same metrics

Run with:  python scripts/build-fonts.py
"""

from __future__ import annotations

import io
import pathlib
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

NOTO = "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts"
SANS_VF = f"{NOTO}/NotoSans/unhinted/variable-ttf/NotoSans%5Bwdth,wght%5D.ttf"
SANS_VF_ITALIC = f"{NOTO}/NotoSans/unhinted/variable-ttf/NotoSans-Italic%5Bwdth,wght%5D.ttf"
SERIF = f"{NOTO}/NotoSerif/hinted/ttf/NotoSerif-{{style}}.ttf"

OUT_DIR = pathlib.Path(__file__).resolve().parent.parent / "public" / "fonts"

# Modern Greek + Western/Central European Latin + the punctuation a CV actually uses.
UNICODE_RANGES = [
    (0x0020, 0x007E),  # basic latin
    (0x00A0, 0x00FF),  # latin-1 supplement
    (0x0100, 0x017F),  # latin extended-a
    (0x0384, 0x038A),  # greek tonos marks
    (0x038C, 0x038C),
    (0x038E, 0x03A1),
    (0x03A3, 0x03CE),  # greek lowercase incl. accented
    (0x2010, 0x201F),  # dashes and quotes
    (0x2020, 0x2022),  # dagger, bullet
    (0x2026, 0x2026),  # ellipsis
    (0x2030, 0x2030),
    (0x2039, 0x203A),
    (0x2044, 0x2044),
    (0x20AC, 0x20AC),  # euro
    (0x2116, 0x2116),
    (0x2122, 0x2122),  # trademark
    (0x2190, 0x2193),  # arrows
    (0x25AA, 0x25AB),
    (0x25CF, 0x25CF),
    (0x2713, 0x2714),  # check marks
]

# family key -> list of (style suffix, wght, wdth, italic source)
VARIANTS = {
    "NotoSans": [("Regular", 400, 100, False), ("Bold", 700, 100, False),
                 ("Italic", 400, 100, True), ("BoldItalic", 700, 100, True)],
    "NotoSansCondensed": [("Regular", 400, 75, False), ("Bold", 700, 75, False),
                          ("Italic", 400, 75, True), ("BoldItalic", 700, 75, True)],
}
SERIF_STYLES = ["Regular", "Bold", "Italic", "BoldItalic"]


def unicodes() -> list[int]:
    codes: list[int] = []
    for start, end in UNICODE_RANGES:
        codes.extend(range(start, end + 1))
    return codes


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "cvsible-font-build"})
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def write_subset(font: TTFont, name: str) -> None:
    options = subset.Options()
    options.layout_features = ["kern", "liga", "clig", "ccmp", "locl", "mark", "mkmk"]
    options.drop_tables += ["DSIG"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.notdef_outline = True
    options.recalc_bounds = True
    options.hinting = False

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=unicodes())
    subsetter.subset(font)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ttf_path = OUT_DIR / f"{name}.ttf"
    font.flavor = None
    font.save(ttf_path)

    font.flavor = "woff2"
    font.save(OUT_DIR / f"{name}.woff2")
    print(f"  {name:34s} ttf {ttf_path.stat().st_size // 1024:4d} KB"
          f"   woff2 {(OUT_DIR / f'{name}.woff2').stat().st_size // 1024:4d} KB")


def main() -> None:
    print("downloading variable sources...")
    roman = download(SANS_VF)
    italic = download(SANS_VF_ITALIC)

    for family, variants in VARIANTS.items():
        print(f"{family}:")
        for style, wght, wdth, is_italic in variants:
            source = italic if is_italic else roman
            font = TTFont(io.BytesIO(source))
            instancer.instantiateVariableFont(font, {"wght": wght, "wdth": wdth}, inplace=True)
            write_subset(font, f"{family}-{style}")

    print("NotoSerif:")
    for style in SERIF_STYLES:
        font = TTFont(io.BytesIO(download(SERIF.format(style=style))))
        write_subset(font, f"NotoSerif-{style}")


if __name__ == "__main__":
    main()
