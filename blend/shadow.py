"""Soft contact shadow under a transparent render: an ellipse at the bottom of the object's alpha."""
import sys
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA'); a = np.asarray(im.getchannel('A'))
ys, xs = np.nonzero(a > 40); bot = ys.max(); rows = xs[ys > bot - 25]
x0, x1 = float(rows.min()), float(rows.max()); bot = float(bot); cx = (x0 + x1) / 2; w = (x1 - x0) * .62; h = w * .14
sh = Image.new('L', im.size, 0); ImageDraw.Draw(sh).ellipse([cx - w, bot - h * .6, cx + w, bot + h * .9], fill=120)
sh = sh.filter(ImageFilter.GaussianBlur(w * .12))
base = Image.new('RGBA', im.size, (60, 45, 35, 0)); base.putalpha(sh)
base.alpha_composite(im); base.save(dst)
