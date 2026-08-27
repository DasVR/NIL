#!/usr/bin/env python3
"""Generate NIL logo variants — transparent wordmark + correct backgrounds."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT = "/home/das/projects/finn-pentest-harness/cursor-research/logo"
os.makedirs(OUT, exist_ok=True)

ABYSS = (5, 5, 7)
AMBER = (245, 166, 35)
CREAM = (232, 228, 220)

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

# ---------- 1. App icon: geometric N monogram with notches ----------
S = 1024
icon = rounded_tile(S, 160, ABYSS)
add_scanlines(icon, step=5, alpha=6)
d = ImageDraw.Draw(icon, "RGBA")

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
d.polygon(N_poly, fill=AMBER)

notch = 90
notches = [
    (x1 + 40, yt + 60, notch),
    (x4 - 40 - notch, yb - 60 - notch, notch),
    ((x1+x2)//2 - notch//2, (yt+yb)//2 - notch//2, notch),
]
for nx, ny, nw in notches:
    d.rectangle([nx, ny, nx+nw, ny+nw], fill=ABYSS)

icon = glow(icon, AMBER, radius=45, strength=0.5)
icon.save(f"{OUT}/nil-icon.png")

# ---------- 2. Wordmark: NIL on transparent background ----------
W, H = 1600, 500
wm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(wm, "RGBA")

f_word = font(F_BOLD, 320)
word = "NIL"
wb = d.textbbox((0, 0), word, font=f_word)
ww = wb[2] - wb[0]
wh = wb[3] - wb[1]
wx = (W - ww) // 2 - wb[0]
wy = (H - wh) // 2 - wb[1]

d.text((wx, wy), word, font=f_word, fill=CREAM)

cursor_w = 140
cursor_h = 34
cx = wx + ww - 40
cy = wy + wh + 30
d.rounded_rectangle([cx, cy, cx+cursor_w, cy+cursor_h], radius=10, fill=AMBER)

wm = glow(wm, AMBER, radius=25, strength=0.3)
wm.save(f"{OUT}/nil-wordmark.png")

# ---------- 3. Wordmark preview on abyss background ----------
W2, H2 = 1800, 600
wm_bg = Image.new("RGBA", (W2, H2), ABYSS + (255,))
add_scanlines(wm_bg, step=5, alpha=6)
# paste centered wordmark
wm_resized = wm.copy()
wmcx = (W2 - wm_resized.width) // 2
wmcy = (H2 - wm_resized.height) // 2
wm_bg.paste(wm_resized, (wmcx, wmcy), wm_resized)
wm_bg.save(f"{OUT}/nil-wordmark-preview.png")

# ---------- 4. Monogram favicon ----------
M = 512
mono = rounded_tile(M, 100, ABYSS)
add_scanlines(mono, step=5, alpha=6)
d = ImageDraw.Draw(mono, "RGBA")

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
d.polygon(N_poly_m, fill=AMBER)
m_notch = 55
m_notches = [
    (mx1 + 25, myt + 35, m_notch),
    (mx4 - 25 - m_notch, myb - 35 - m_notch, m_notch),
    ((mx1+mx2)//2 - m_notch//2, (myt+myb)//2 - m_notch//2, m_notch),
]
for nx, ny, nw in m_notches:
    d.rectangle([nx, ny, nx+nw, ny+nw], fill=ABYSS)

mono = glow(mono, AMBER, radius=30, strength=0.5)
mono.save(f"{OUT}/nil-monogram.png")

print("done:", os.listdir(OUT))
