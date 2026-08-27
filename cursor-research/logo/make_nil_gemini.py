#!/usr/bin/env python3
"""Rebuild NIL logo in Gemini's exact palette: cream bg, deep violet, lavender, coral."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT = "/home/das/projects/finn-pentest-harness/cursor-research/logo"
os.makedirs(OUT, exist_ok=True)

# Gemini logo palette
CREAM_BG   = (245, 242, 236)   # #f5f2ec warm off-white
VIOLET     = (69, 42, 132)     # #452a84 deep violet (main mark)
LAVENDER   = (169, 177, 240)   # #a9b1f0 light violet
CORAL      = (254, 111, 105)   # #fe6f69 warm coral
DEEP       = (60, 36, 115)     # darker violet for depth

F_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

def rounded_tile(size, radius, bg):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=bg)
    return img

def soft_shadow(img, radius=40, strength=0.35):
    """Add a soft drop shadow behind the mark (on the cream tile)."""
    alpha = img.split()[3]
    blurred = alpha.filter(ImageFilter.GaussianBlur(radius))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    shadow.putalpha(blurred.point(lambda p: int(p * strength)))
    return Image.alpha_composite(shadow, img)

def draw_N_icon(d, S, abyss_outline=False):
    """Geometric N with square notches, in the violet palette."""
    margin = 170
    bar_w = 150
    x1 = margin
    x2 = margin + bar_w
    x3 = S - margin - bar_w
    x4 = S - margin
    yt = margin
    yb = S - margin

    # main N in violet
    N_poly = [
        (x1, yt), (x2, yt), (x2, yb - int(bar_w*1.6)),
        (x3, yt), (x4, yt), (x4, yb), (x3, yb),
        (x3, yt + int(bar_w*1.6)), (x1, yb), (x1, yt)
    ]
    d.polygon(N_poly, fill=VIOLET)

    # Notches - fill with cream (cut out)
    notch = 95
    notches = [
        (x1 + 40, yt + 60, notch),
        (x4 - 40 - notch, yb - 60 - notch, notch),
        ((x1+x2)//2 - notch//2, (yt+yb)//2 - notch//2, notch),
    ]
    for nx, ny, nw in notches:
        d.rectangle([nx, ny, nx+nw, ny+nw], fill=CREAM_BG)

    # coral accent - a small coral square in the center notch's right area
    # put coral in bottom-left notch + lavender in top-right for dual accent
    accent_w = 55
    d.rectangle(
        [x1+40+notch-accent_w, yt+60+notch-accent_w, x1+40+notch, yt+60+notch],
        fill=CORAL
    )
    d.rectangle(
        [x4-40-notch, yb-60-notch, x4-40-notch+accent_w, yb-60-notch+accent_w],
        fill=LAVENDER
    )


# ---------- 1. App icon: cream tile, violet N, coral+lavender notches ----------
S = 1024
icon = rounded_tile(S, 60, CREAM_BG)
d = ImageDraw.Draw(icon, "RGBA")
# gradient tile background (subtle cream->lavender)
for px in range(0, S):
    t = px / S
    c = (int(CREAM_BG[0] + (LAVENDER[0]-CREAM_BG[0])*t*0.4),
         int(CREAM_BG[1] + (LAVENDER[1]-CREAM_BG[1])*t*0.4),
         int(CREAM_BG[2] + (LAVENDER[2]-CREAM_BG[2])*t*0.4))
    d.line([(px, 0), (px, S)], fill=c)
draw_N_icon(d, S)
# soft shadow
icon = soft_shadow(icon, radius=50, strength=0.25)
icon.save(f"{OUT}/nil-icon-gemini.png")

# ---------- 2. Wordmark: NIL with violet gradient + coral cursor ----------
W, H = 1800, 600
wm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(wm, "RGBA")
f_word = font(F_BOLD, 380)
word = "NIL"
wb = d.textbbox((0, 0), word, font=f_word)
ww = wb[2]-wb[0]; wh = wb[3]-wb[1]
wx = (W-ww)//2 - wb[0]
wy = (H-wh)//2 - wb[1]
# violet text
d.text((wx, wy), word, font=f_word, fill=VIOLET)
# coral cursor block
cw = 150; ch = 42
cx = wx + ww + 50
cy = wy + wh//2 - ch//2
d.rounded_rectangle([cx, cy, cx+cw, cy+ch], radius=12, fill=CORAL)
wm.save(f"{OUT}/nil-wordmark-gemini.png")

# ---------- 3. Wordmark preview on white/cream bg ----------
W2, H2 = 2000, 700
preview = Image.new("RGBA", (W2, H2), CREAM_BG + (255,))
preview.paste(wm, ((W2-wm.width)//2, (H2-wm.height)//2), wm)
preview.save(f"{OUT}/nil-wordmark-gemini-preview.png")

print("done")
