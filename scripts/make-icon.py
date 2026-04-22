#!/usr/bin/env python3
"""Génère une icône style roundel BMW (PNG 1024px)."""
from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 1024
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "bmw-roundel.png")

BLACK = (0, 0, 0, 255)
WHITE = (255, 255, 255, 255)
BLUE = (28, 105, 212, 255)   # bleu BMW-like
TRANSPARENT = (0, 0, 0, 0)

img = Image.new("RGBA", (SIZE, SIZE), TRANSPARENT)
d = ImageDraw.Draw(img)

cx = cy = SIZE // 2

# Anneau noir extérieur
outer_r = SIZE // 2 - 4
d.ellipse((cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r), fill=BLACK)

# Cercle intérieur blanc (base des 4 quadrants)
inner_r = int(outer_r * 0.78)
d.ellipse((cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r), fill=WHITE)

# Quadrants : haut-gauche + bas-droite = blanc (déjà) ; haut-droit + bas-gauche = bleu
# On dessine 2 pieslices bleus
d.pieslice((cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r),
           start=-90, end=0, fill=BLUE)   # haut-droit
d.pieslice((cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r),
           start=90, end=180, fill=BLUE)   # bas-gauche

# Texte "BMW" dans l'anneau supérieur
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Helvetica.ttc", int(SIZE * 0.11))
except Exception:
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(SIZE * 0.11))

text = "BMW"
bbox = d.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
text_y = cy - int((inner_r + outer_r) / 2) - th // 2 - int(SIZE * 0.005)
d.text((cx - tw // 2 - bbox[0], text_y - bbox[1]), text, fill=WHITE, font=font)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT, "PNG")
print(f"Écrit : {OUT} ({SIZE}x{SIZE})")
