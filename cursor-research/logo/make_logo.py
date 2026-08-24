#!/usr/bin/env python3
"""Generate FINN logo variants — app icon + wordmark, dark terminal aesthetic."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT = "/home/das/projects/finn-pentest-harness/cursor-research/logo"
os.makedirs(OUT, exist_ok=True)

ABYSS = (5, 5, 7)          # #050507
GREEN = (0, 217, 146)      # #00d992
GREEN_DIM = (0, 150, 100)
WHITE = (235, 240, 238)

def font(size, bold=True):
    path = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
    return ImageFont.truetype(path, size)

def rounded_tile(size, radius, bg):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=bg)
    return img

def glow(img, radius=18, strength=1.0):
    """Add a soft green glow around bright pixels."""
    alpha = img.split()[3]
    blurred = alpha.filter(ImageFilter.GaussianBlur(radius))
    glow_layer = Image.new("RGBA", img.size, GREEN + (0,))
    glow_layer.putalpha(blurred.point(lambda p: int(p * strength)))
    return Image.alpha_composite(glow_layer, img)

# ---------- 1. App icon: terminal cursor `>_` ----------
S = 1024
icon = rounded_tile(S, 220, ABYSS)

# scanline texture (subtle)
d = ImageDraw.Draw(icon, "RGBA")
for y in range(0, S, 4):
    d.line([(0, y), (S, y)], fill=(255, 255, 255, 6))

# draw a bold `>` chevron + cursor block, centered
f_chev = font(430, bold=True)
chev = ">"
# measure
bbox = d.textbbox((0, 0), chev, font=f_chev)
cw = bbox[2] - bbox[0]
ch = bbox[3] - bbox[1]
cx = (S - cw) // 2 - 40
cy = (S - ch) // 2 - bbox[1]
d.text((cx, cy), chev, font=f_chev, fill=GREEN)

# cursor block after the chevron
block_w = 60
block_h = 300
bx = cx + cw + 30
by = (S - block_h) // 2
d.rounded_rectangle([bx, by, bx+block_w, by+block_h], radius=18, fill=GREEN)

icon = glow(icon, radius=40, strength=0.5)
icon.save(f"{OUT}/finn-icon.png")

# ---------- 2. Wordmark: `> finn` ----------
W, H = 1600, 500
wm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(wm, "RGBA")

f_prompt = font(300, bold=True)
f_word = font(300, bold=True)

# `>` in green
prompt = ">"
pb = d.textbbox((0, 0), prompt, font=f_prompt)
pw = pb[2] - pb[0]
ph = pb[3] - pb[1]
py = (H - ph) // 2 - pb[1]
d.text((40, py), prompt, font=f_prompt, fill=GREEN)

# "finn" in white
word = "finn"
wb = d.textbbox((0, 0), word, font=f_word)
ww = wb[2] - wb[0]
wh = wb[3] - wb[1]
wx = 40 + pw + 60
wy = (H - wh) // 2 - wb[1]
d.text((wx, wy), word, font=f_word, fill=WHITE)

# cursor block after "finn"
block_w = 34
block_h = 200
bx = wx + ww + 40
by = (H - block_h) // 2
d.rounded_rectangle([bx, by, bx+block_w, by+block_h], radius=10, fill=GREEN)

wm = glow(wm, radius=30, strength=0.35)
wm.save(f"{OUT}/finn-wordmark.png")

# ---------- 3. App icon: monogram F (sharp, bracket-wrapped) ----------
icon2 = rounded_tile(S, 220, ABYSS)
d = ImageDraw.Draw(icon2, "RGBA")
for y in range(0, S, 4):
    d.line([(0, y), (S, y)], fill=(255, 255, 255, 6))

f_mono = font(560, bold=True)
mono = "F"
mb = d.textbbox((0, 0), mono, font=f_mono)
mw = mb[2] - mb[0]
mh = mb[3] - mb[1]
mx = (S - mw) // 2 - mb[0]
my = (S - mh) // 2 - mb[1]
d.text((mx, my), mono, font=f_mono, fill=GREEN)

# green underline bar (like a cursor line)
bar_y = my + mh + 30
d.rounded_rectangle([mx+40, bar_y, mx+mw-40, bar_y+26], radius=13, fill=GREEN)

icon2 = glow(icon2, radius=40, strength=0.5)
icon2.save(f"{OUT}/finn-monogram.png")

print("done:", os.listdir(OUT))
