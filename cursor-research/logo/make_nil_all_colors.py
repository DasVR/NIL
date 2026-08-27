#!/usr/bin/env python3
"""Generate NIL logos in all candidate colors."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT = "/home/das/projects/finn-pentest-harness/cursor-research/logo"
os.makedirs(OUT, exist_ok=True)

ABYSS = (5, 5, 7)
CREAM = (232, 228, 220)

PALETTES = {
    "amber":   {"accent": (245, 166, 35),  "name": "Amber CRT"},
    "phosphor":{"accent": (220, 235, 245), "name": "Phosphor White"},
    "coral":   {"accent": (235, 128, 108), "name": "Muted Coral"},
    "violet":  {"accent": (160, 130, 245), "name": "Violet"},
}

F_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

def rounded_tile(size, radius, bg):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=bg)
    return img

def glow(img, color, radius=30, strength=0.45):
    alpha = img.split()[3]
    blurred = alpha.filter(ImageFilter.GaussianBlur(radius))
    glow_layer = Image.new("RGBA", img.size, color + (0,))
    glow_layer.putalpha(blurred.point(lambda p: int(p * strength)))
    return Image.alpha_composite(glow_layer, img)

def add_scanlines(img, step=4, alpha=8):
    d = ImageDraw.Draw(img, "RGBA")
    W, H = img.size
    for y in range(0, H, step):
        d.line([(0, y), (W, y)], fill=(255, 255, 255, alpha))

def draw_N_icon(d, S, accent, abyss):
    margin = 160
    bar_w = 140
    x1 = margin
    x2 = margin + bar_w
    x3 = S - margin - bar_w
    x4 = S - margin
    yt = margin
    yb = S - margin
    N_poly = [
        (x1, yt), (x2, yt), (x2, yb - int(bar_w*1.6)),
        (x3, yt), (x4, yt), (x4, yb), (x3, yb),
        (x3, yt + int(bar_w*1.6)), (x1, yb), (x1, yt)
    ]
    d.polygon(N_poly, fill=accent)
    notch = 90
    notches = [
        (x1 + 40, yt + 60, notch),
        (x4 - 40 - notch, yb - 60 - notch, notch),
        ((x1+x2)//2 - notch//2, (yt+yb)//2 - notch//2, notch),
    ]
    for nx, ny, nw in notches:
        d.rectangle([nx, ny, nx+nw, ny+nw], fill=abyss)

def draw_N_monogram(d, M, accent, abyss):
    m_margin = 90
    m_bar = 80
    mx1 = m_margin
    mx2 = m_margin + m_bar
    mx3 = M - m_margin - m_bar
    mx4 = M - m_margin
    myt = m_margin
    myb = M - m_margin
    N_poly_m = [
        (mx1, myt), (mx2, myt), (mx2, myb - int(m_bar*1.6)),
        (mx3, myt), (mx4, myt), (mx4, myb), (mx3, myb),
        (mx3, myt + int(m_bar*1.6)), (mx1, myb), (mx1, myt)
    ]
    d.polygon(N_poly_m, fill=accent)
    m_notch = 55
    m_notches = [
        (mx1 + 25, myt + 35, m_notch),
        (mx4 - 25 - m_notch, myb - 35 - m_notch, m_notch),
        ((mx1+mx2)//2 - m_notch//2, (myt+myb)//2 - m_notch//2, m_notch),
    ]
    for nx, ny, nw in m_notches:
        d.rectangle([nx, ny, nx+nw, ny+nw], fill=abyss)

def draw_wordmark(d, W, H, accent, cream, label=None):
    f_word = font(F_BOLD, 320)
    word = "NIL"
    wb = d.textbbox((0, 0), word, font=f_word)
    ww = wb[2] - wb[0]
    wh = wb[3] - wb[1]
    wx = (W - ww) // 2 - wb[0]
    wy = (H - wh) // 2 - wb[1]
    d.text((wx, wy), word, font=f_word, fill=cream)
    cursor_w = 140
    cursor_h = 34
    cx = wx + ww - 40
    cy = wy + wh + 30
    d.rounded_rectangle([cx, cy, cx+cursor_w, cy+cursor_h], radius=10, fill=accent)
    if label:
        f_label = font(F_BOLD, 40)
        d.text((W//2 - 120, H - 80), label, font=f_label, fill=(160, 160, 160, 200))

S = 1024
W, H = 1600, 500
W2, H2 = 1800, 650
M = 512

for key, pal in PALETTES.items():
    accent = pal["accent"]
    label = pal["name"]

    # icon
    icon = rounded_tile(S, 160, ABYSS)
    add_scanlines(icon, step=5, alpha=6)
    d = ImageDraw.Draw(icon, "RGBA")
    draw_N_icon(d, S, accent, ABYSS)
    icon = glow(icon, accent, radius=45, strength=0.5)
    icon.save(f"{OUT}/nil-icon-{key}.png")

    # monogram
    mono = rounded_tile(M, 100, ABYSS)
    add_scanlines(mono, step=5, alpha=6)
    d = ImageDraw.Draw(mono, "RGBA")
    draw_N_monogram(d, M, accent, ABYSS)
    mono = glow(mono, accent, radius=30, strength=0.5)
    mono.save(f"{OUT}/nil-monogram-{key}.png")

    # transparent wordmark
    wm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(wm, "RGBA")
    draw_wordmark(d, W, H, accent, CREAM)
    wm = glow(wm, accent, radius=25, strength=0.3)
    wm.save(f"{OUT}/nil-wordmark-{key}.png")

    # preview on abyss with label
    preview = Image.new("RGBA", (W2, H2), ABYSS + (255,))
    add_scanlines(preview, step=5, alpha=6)
    preview.paste(wm, ((W2 - wm.width)//2, (H2 - wm.height)//2 - 40), wm)
    f_label = font(F_BOLD, 42)
    d = ImageDraw.Draw(preview, "RGBA")
    d.text((W2//2 - len(label)*12, H2 - 90), label, font=f_label, fill=(160, 160, 160, 200))
    preview.save(f"{OUT}/nil-wordmark-preview-{key}.png")

print("done:", sorted(os.listdir(OUT)))
