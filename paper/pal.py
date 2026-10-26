"""The café's little companion: a teacup spirit on a lace saucer, drawn by hand-ish SVG, then given the stippled
paper grain of the earliest graphics. Also a satin bow and a pearl string in the same finish."""
import os, math, asyncio, numpy as np
from PIL import Image
from scipy import ndimage
import paperkit as K
from lacetex import raster
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kit', 'pal')
LINE = '#7E6E64'; GOLD = '#D2B36A'
def scallops(cx, cy, rx, ry, n, r):
    s = ''
    for i in range(n):
        a = i / n * 2 * math.pi
        s += f'<circle cx="{cx + math.cos(a) * rx:.1f}" cy="{cy + math.sin(a) * ry:.1f}" r="{r}"/>'
    return s
CUP = f'''<svg xmlns="http://www.w3.org/2000/svg" width="220" height="260" viewBox="0 0 220 260">
<defs><filter id="w"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.1"/></filter>
<clipPath id="bowl"><path d="M44 120 C46 168 74 196 110 196 C146 196 172 168 174 120 Z"/></clipPath></defs>
<g filter="url(#w)" stroke="{LINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
 <!-- lace saucer -->
 <g fill="#FFFDF8" stroke-width="1.4">{scallops(110, 214, 86, 22, 30, 6.5)}</g>
 <ellipse cx="110" cy="214" rx="86" ry="22" fill="#FFFDF8" stroke-width="1.6"/>
 <ellipse cx="110" cy="212" rx="64" ry="14" fill="#F6EEDC" stroke-width="1.2"/>
 <g fill="#E9DFCB" stroke="none">{scallops(110, 214, 76, 18.5, 26, 1.6)}</g>
 <ellipse cx="110" cy="212" rx="64" ry="14" fill="none" stroke="{GOLD}" stroke-width="1.2" stroke-dasharray="3 3"/>
 <!-- handle -->
 <path d="M170 132 C204 126 206 170 170 172" fill="none" stroke-width="9" stroke="{LINE}"/>
 <path d="M170 132 C204 126 206 170 170 172" fill="none" stroke-width="5.6" stroke="#FFFDF8"/>
 <path d="M172 138 C194 136 196 162 172 166" fill="none" stroke-width="1.6" stroke="{GOLD}"/>
 <!-- bowl -->
 <path d="M44 120 C46 168 74 196 110 196 C146 196 172 168 174 120 Z" fill="#FFFDF8"/>
 <g clip-path="url(#bowl)" stroke="none">
  <path d="M30 140 C80 150 140 150 190 140 L190 160 C140 170 80 170 30 160 Z" fill="#F7D3DA"/>
  <g fill="#E8857B"><circle cx="78" cy="152" r="5"/><circle cx="110" cy="156" r="5.6"/><circle cx="142" cy="152" r="5"/></g>
  <g fill="#8FCBB2"><path d="M70 154 c-6 -1 -8 -5 -6 -8 c4 1 6 4 6 8z"/><path d="M86 154 c6 -1 8 -5 6 -8 c-4 1 -6 4 -6 8z"/><path d="M102 158 c-6 -1 -8 -5 -6 -8 c4 1 6 4 6 8z"/><path d="M118 158 c6 -1 8 -5 6 -8 c-4 1 -6 4 -6 8z"/><path d="M134 154 c-6 -1 -8 -5 -6 -8 c4 1 6 4 6 8z"/><path d="M150 154 c6 -1 8 -5 6 -8 c-4 1 -6 4 -6 8z"/></g>
  <path d="M30 186 C80 196 140 196 190 186" fill="none" stroke="{GOLD}" stroke-width="2"/>
 </g>
 <path d="M44 120 C46 168 74 196 110 196 C146 196 172 168 174 120" fill="none"/>
 <path d="M58 132 C60 158 74 176 92 184" fill="none" stroke="#fff" stroke-width="4" opacity=".9"/>
 <!-- rim and tea -->
 <ellipse cx="109" cy="120" rx="65" ry="15" fill="#FFFDF8"/>
 <ellipse cx="109" cy="121" rx="56" ry="10" fill="#C98E5E" stroke-width="1.4"/>
 <path d="M70 120 C88 114 120 114 140 118" fill="none" stroke="#E7B88C" stroke-width="2.4"/>
 <ellipse cx="109" cy="120" rx="65" ry="15" fill="none" stroke="{GOLD}" stroke-width="2.6"/>
 <ellipse cx="109" cy="120" rx="65" ry="15" fill="none"/>
 <!-- face -->
 <path d="M90 166 c3 -5 9 -5 12 0" fill="none" stroke="#3E3531" stroke-width="2.6"/>
 <path d="M120 166 c3 -5 9 -5 12 0" fill="none" stroke="#3E3531" stroke-width="2.6"/>
 <path d="M106 174 c3 3 7 3 10 0" fill="none" stroke="#3E3531" stroke-width="2"/>
 <g fill="#F4A3B4" stroke="none" opacity=".75"><ellipse cx="84" cy="176" rx="7" ry="4"/><ellipse cx="138" cy="176" rx="7" ry="4"/></g>
 <!-- a satin bow on the handle side -->
 <g fill="#F2B8C6" stroke-width="1.4"><path d="M160 112 c-8 -14 -26 -14 -22 -2 c2 6 12 8 22 2z"/><path d="M160 112 c8 -16 26 -12 22 0 c-2 6 -12 6 -22 0z"/><path d="M158 112 l-8 16 l6 -2 l2 5 z M162 112 l10 14 l-6 -1 l-1 5 z"/><circle cx="160" cy="112" r="4.4"/></g>
</g></svg>'''
STEAM = f'''<svg xmlns="http://www.w3.org/2000/svg" width="220" height="140" viewBox="0 0 220 140"><g fill="none" stroke-linecap="round">
 <path d="M96 136 C80 112 116 100 100 76 C88 58 108 42 124 50 C138 58 128 76 114 70" stroke="#FFFFFF" stroke-width="7" opacity=".85"/>
 <path d="M96 136 C80 112 116 100 100 76 C88 58 108 42 124 50 C138 58 128 76 114 70" stroke="#E9DCCB" stroke-width="2" stroke-dasharray="1 5"/>
 <path d="M124 134 C114 116 136 108 126 92" stroke="#FFFFFF" stroke-width="5" opacity=".7"/>
</g></svg>'''
def grain(path, out, amt=.10):
    im = np.array(Image.open(path).convert('RGBA')).astype(np.float32); a = im[..., 3] / 255; h, w = a.shape
    st = K.fbm(h, w, [(2, 1), (1, .9)], 7) * 2.2
    dots = (np.random.default_rng(3).random((h, w)) > .965) * .08
    im[..., :3] *= (1 + st[..., None] * amt - dots[..., None])
    Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGBA').save(out, method=6, quality=90)
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    asyncio.run(raster([(CUP, 440, 520, os.path.join(OUT, 'cup_raw.png')), (STEAM, 440, 280, os.path.join(OUT, 'steam_raw.png'))]))
    grain(os.path.join(OUT, 'cup_raw.png'), os.path.join(OUT, 'pal_cup.webp')); grain(os.path.join(OUT, 'steam_raw.png'), os.path.join(OUT, 'pal_steam.webp'), .04)
    print('pal')
