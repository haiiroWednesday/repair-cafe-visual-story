"""The lamp-table candelabra, as a hybrid: the real one's three polished columns, trefoil base
and crossbar, dressed with ornament from an antique bouillotte (petal bobeches, wax-drip
sleeves, frosted bent-tip bulbs, reeded tubes, scalloped base, scroll handle, aged bronze in
the hollows). Run: python3.11 candelabra.py out.png [samples] [width] [view]"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from blib import *

D = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'candelabra.png')
samples = int(sys.argv[2]) if len(sys.argv) > 2 else 48
W = int(sys.argv[3]) if len(sys.argv) > 3 else 900
view = sys.argv[4] if len(sys.argv) > 4 else 'front'
random.seed(4)
sc = reset()

polished = mat_brass('Polished', base='#E9BE63', dark='#6B4E22', rough=(.06, .26))
antique = mat_brass('Antique', base='#C99A4A', dark='#3A2812', rough=(.18, .45), coat=.15)
ivory = mat_basic('WaxSleeve', '#CDB27A', rough=.45, **{'Subsurface Weight': .25, 'Subsurface Scale': .004})
frost = mat_basic('Frosted', '#FFF8EC', rough=.32, **{'Transmission Weight': 1.0, 'IOR': 1.5})
glow = mat_emit('Filament', '#FFC27A', 60)
litglass = mat_basic('FrostedLit', '#FFF1DA', rough=.35, **{'Transmission Weight': .6, 'IOR': 1.5, 'Emission Color': lin('#FFC98A'), 'Emission Strength': 2.6})

# ---------- where the columns stand: from the photo, two at the left (one behind), one at the right ----------
COLS = [(-0.006, -0.032), (-0.038, 0.034), (0.108, 0.004)]
LIT = [True, False, True]
LOBE = .052
BASE_H = .024

def in_union(x, y):
    return any((x - cx) ** 2 + (y - cy) ** 2 < LOBE ** 2 for cx, cy in COLS) or (x - .02) ** 2 + y ** 2 < .045 ** 2

def outline(n=360, scallop=.0035):
    cx0, cy0 = sum(c[0] for c in COLS) / 3, sum(c[1] for c in COLS) / 3
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n; d = (math.cos(a), math.sin(a)); t = 0
        for k in range(200):
            tt = k * .0012
            if in_union(cx0 + d[0] * tt, cy0 + d[1] * tt): t = tt
        r = t + scallop * math.sin(a * 44) ** 2
        pts.append((cx0 + d[0] * r, cy0 + d[1] * r))
    return pts, (cx0, cy0)

def slab(name, pts, center, z0, z1, inset, mat, bevel=.004):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    cx, cy = center
    def ring(z, k):
        return [bm.verts.new((cx + (x - cx) * k, cy + (y - cy) * k, z)) for x, y in pts]
    bot = ring(z0, 1.0); top = ring(z1, inset)
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n; bm.faces.new((bot[i], bot[j], top[j], top[i]))
    bm.faces.new(list(reversed(bot))); bm.faces.new(top)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    bv = o.modifiers.new('bev', 'BEVEL'); bv.width = bevel; bv.segments = 3; bv.limit_method = 'ANGLE'
    return o

pts, cen = outline()
slab('BaseFoot', pts, cen, 0, .008, .985, antique)
slab('BaseStep', pts, cen, .008, .016, .93, antique)
slab('BaseTop', pts, cen, .016, BASE_H, .86, polished, bevel=.003)
# rolled rim of scrolls round the top step
rim = [(cen[0] + (x - cen[0]) * .9, cen[1] + (y - cen[1]) * .9, .0165) for x, y in pts[::3]]
curve_obj('BaseRim', rim, .0028, antique, closed=True, res=4, bres=3)
# little C-scroll medallions on the front lobe edges, as on the antique base
for k in range(9):
    a = math.radians(-150 + k * 22)
    x = cen[0] + math.cos(a) * .072; y = cen[1] + math.sin(a) * .06
    if not in_union(x, y): continue
    sp = [(x + .006 * math.cos(t) * (1 - t / 9), y + .006 * math.sin(t) * (1 - t / 9) - .002, .0105 + .0004 * t) for t in [i * .45 for i in range(14)]]
    curve_obj('scroll', sp, .0012, antique, res=3, bres=2)
# three ball feet
for a in (90, 210, 330):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.006, location=(cen[0] + math.cos(math.radians(a)) * .06, cen[1] + math.sin(math.radians(a)) * .05, .001))
    bpy.context.object.data.materials.append(antique); bpy.ops.object.shade_smooth()

# ---------- one column: the photo's turned profile, with a reeded tube ----------
S = .000636
def zz(y): return (1470 - y) * S
PROF = [(.026, 0), (.026, .006), (.022, .010), (.016, .016), (.0175, .022), (.0175, .025), (.0135, .031), (.0145, .04), (.0185, .054), (.0215, .067),
        (.0222, .076), (.0205, .088), (.0165, .097), (.0128, .103), (.0128, .106), (.017, .109), (.017, .113), (.0128, .117), (.014, .123), (.0195, .133),
        (.0228, .143), (.0205, .154), (.015, .161), (.0132, .165)]
TUBE0, TUBE1 = .165, zz(822)

def reeded_tube(name, x, y, z0, z1, r, flutes=18, depth=.0006, seg=144, mat=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    nz = 60
    for k in range(nz + 1):
        z = z0 + (z1 - z0) * k / nz; ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            rr = r - depth * (0.5 + 0.5 * math.cos(a * flutes)) ** 3
            ring.append(bm.verts.new((x + rr * math.cos(a), y + rr * math.sin(a), z)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    for p in me.polygons: p.use_smooth = True
    me.materials.append(mat); return o

def bobeche(name, x, y, z, R=.034, petals=8, mat=None):
    """A flower dish: scalloped, petals curling up and twisting a little."""
    me = bpy.data.meshes.new(name); bm = bmesh.new(); grid = []
    nu, nv = 14, 192
    for u in range(nu + 1):
        t = u / nu; row = []
        for v in range(nv):
            a = 2 * math.pi * v / nv
            lobe = abs(math.cos(a * petals / 2)) ** .55
            edge = .84 + .2 * lobe
            rr = (.012 + (R - .012) * t) * (1 + (edge - 1) * t)
            lift = .009 * t ** 2 * (.55 + .8 * lobe) + .002 * t * math.sin(a * petals + 1.2)
            twist = .18 * t * math.sin(a * petals)
            row.append(bm.verts.new((x + rr * math.cos(a + twist * .1), y + rr * math.sin(a + twist * .1), z + lift)))
        grid.append(row)
    for a, b in zip(grid, grid[1:]):
        for i in range(nv):
            j = (i + 1) % nv; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    for p in me.polygons: p.use_smooth = True
    so = o.modifiers.new('thick', 'SOLIDIFY'); so.thickness = .0018; so.offset = -1
    o.modifiers.new('sub', 'SUBSURF').levels = 1
    me.materials.append(mat); return o

def sleeve(name, x, y, z0, h, r=.0125, mat=None, seed=0):
    """Candle sleeve with wax runs down from an uneven lip."""
    rnd = random.Random(seed)
    me = bpy.data.meshes.new(name); bm = bmesh.new(); seg = 96; nz = 40; rings = []
    drips = [(rnd.uniform(0, 2 * math.pi), rnd.uniform(.25, .7) * h, rnd.uniform(.18, .32)) for _ in range(7)]
    for k in range(nz + 1):
        zf = k / nz; z = z0 + h * zf; ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg; rr = r
            for (da, dl, dw) in drips:
                dd = math.atan2(math.sin(a - da), math.cos(a - da))
                below = (h - (z - z0))
                if below < dl:
                    w = dw * (1 - below / dl * .6)
                    if abs(dd) < w: rr += .0032 * math.cos(dd / w * math.pi / 2) ** 2 * (1 - (below / dl) ** 4)
            ring.append(bm.verts.new((x + rr * math.cos(a), y + rr * math.sin(a), z)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg; bm.faces.new((a[i], a[j], b[j], b[i]))
    top = rings[-1]
    for i, v in enumerate(top):
        a = 2 * math.pi * i / seg; v.co.z += .0018 * math.sin(a * 3 + seed) + .001 * math.sin(a * 7)
    c = bm.verts.new((x, y, z0 + h - .002))
    for i in range(seg): bm.faces.new((top[i], top[(i + 1) % seg], c))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    for p in me.polygons: p.use_smooth = True
    me.materials.append(mat); return o

def bulb(name, x, y, z0, lit, bend=1):
    prof = [(.0055, 0), (.009, .006), (.0135, .016), (.0145, .025), (.012, .036), (.0075, .046), (.0035, .055), (.0012, .062), (0, .066)]
    o = lathe(name, [(r, z0 + z) for r, z in prof], seg=64, mat=litglass if lit else frost, loc=(0, 0, 0))
    for v in o.data.vertices:
        h = v.co.z - (z0 + .04)
        if h > 0: v.co.x += bend * 9 * h ** 2; v.co.y += bend * 2 * h ** 2
    o.location = (x, y, 0)
    if lit:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.0035, location=(x, y, z0 + .022)); f = bpy.context.object; f.scale = (1, 1, 2.2); f.data.materials.append(glow)
        L = bpy.data.lights.new('bulb', 'POINT'); L.energy = 2.2; L.shadow_soft_size = .006; L.color = lin('#FFD39A')[:3]
        lo = bpy.data.objects.new('bulbL', L); sc.collection.objects.link(lo); lo.location = (x, y, z0 + .024)
    return o

tops = []
for (x, y), lit in zip(COLS, LIT):
    lathe('Turned', [(r, z + BASE_H) for r, z in PROF], seg=128, mat=polished, loc=(x, y, 0))
    reeded_tube('Tube', x, y, TUBE0 + BASE_H, TUBE1 + BASE_H, .0128, mat=polished)
    zc = TUBE1 + BASE_H
    lathe('Collar', [(.0128, zc), (.0155, zc + .003), (.0175, zc + .006), (.0145, zc + .008), (.0105, zc + .009)], seg=96, mat=polished, loc=(x, y, 0))
    bobeche('Bobeche', x, y, zc + .007, mat=antique)
    lathe('Cup', [(.0105, zc + .007), (.0148, zc + .011), (.016, zc + .02), (.0138, zc + .022)], seg=96, mat=antique, loc=(x, y, 0))
    sh = .055
    sleeve('Sleeve', x, y, zc + .019, sh, mat=ivory, seed=int(x * 1000))
    bulb('Bulb', x, y, zc + .019 + sh - .004, lit, bend=1 if x > 0 else -1)
    tops.append((x, y, zc + .004))

# ---------- crossbar and the scroll handle ----------
zb = tops[0][2] - .002
a, b = Vector(tops[1]), Vector(tops[2])
curve_obj('Crossbar', [(a.x, a.y, zb), ((a.x + b.x) / 2, (a.y + b.y) / 2, zb + .002), (b.x, b.y, zb)], .0035, polished, res=8)
curve_obj('Stub', [(tops[0][0], tops[0][1], zb), ((tops[0][0] + (a.x + b.x) / 2) / 2, (tops[0][1] + (a.y + b.y) / 2) / 2, zb + .001), ((a.x + b.x) / 2, (a.y + b.y) / 2, zb + .002)], .0028, polished, res=6)
mx, my = (a.x + b.x) / 2, (a.y + b.y) / 2
lathe('Finial', [(.0055, zb), (.0075, zb + .006), (.005, zb + .012), (.0065, zb + .016), (.003, zb + .022), (0, zb + .023)], seg=48, mat=antique, loc=(mx, my, 0))
# trefoil loop: three lobes, ends curled into little volutes
hp = []
for i in range(161):
    t = -math.pi * .92 + i / 160 * math.pi * 1.84
    r = .022 * (1 + .38 * math.cos(3 * t))
    hp.append((mx + r * math.sin(t), my, zb + .045 + r * math.cos(t) * .95))
curve_obj('Handle', hp[::4], .0024, antique, res=6)
for sd in (-1, 1):
    vol = [(mx + sd * (.006 + .004 * math.cos(u)) , my, zb + .024 + .004 * math.sin(u) + u * .0006) for u in [k * .5 for k in range(14)]]
    curve_obj('Volute', vol, .0018, antique, res=4)

# cord out of the back of the base
curve_obj('Cord', [(cen[0] + .04, cen[1] + .05, .004), (cen[0] + .09, cen[1] + .12, .003), (cen[0] + .02, cen[1] + .22, .003), (cen[0] - .12, cen[1] + .26, .003)], .0022, mat_basic('cord', '#C9B07A', rough=.4, **{'Transmission Weight': .4}), res=10)

# ---------- studio ----------
studio(strength=.7)
softbox((-.5, -.55, .55), (.35, .9), 70, '#FFF1DE', look=(0, 0, .2))
softbox((.55, -.35, .35), (.3, .7), 35, '#E8EEFF', look=(0, 0, .2))
softbox((0, .6, .7), (.6, .3), 40, '#FFE6EE', look=(0, 0, .25))
card((-.22, -.18, .25), (.05, .5), 9, look=(0, 0, .25))
card((.3, -.12, .25), (.04, .5), 5, look=(0, 0, .25))
# floor removed: contact shadow is added after render

marks = {f'bulb{i}': (c[0], c[1], TUBE1 + BASE_H + .019 + .055 + .03) for i, c in enumerate(COLS)}
marks.update({f'socket{i}': (c[0], c[1], TUBE1 + BASE_H + .045) for i, c in enumerate(COLS)})
marks.update({'base': (cen[0] + .02, cen[1] - .05, .012), 'cordExit': (cen[0] + .09, cen[1] + .12, .003), 'cordEnd': (cen[0] - .12, cen[1] + .26, .003), 'handle': (mx, my, zb + .07), 'bobeche': (COLS[2][0] + .03, COLS[2][1], TUBE1 + BASE_H + .012), 'baluster': (COLS[0][0] + .02, COLS[0][1] - .01, zz(1300) + BASE_H), 'tube': (COLS[2][0] + .013, COLS[2][1], .25)})
if view == 'front': camera((.16, -1.18, .46), (.04, 0, .262), lens=60)
else: camera((.62, -.9, .52), (.04, 0, .25), lens=60)
motes((.04, 0, .45), .16, n=36, seed=11, flatten=.6)
ink(thick=2.0, wobble=.9)
if not os.environ.get('NOBLOOM'): bloom(size=9, threshold=.5, strength=1.3)
if os.environ.get('CLAY'): clay()
render(out, W, int(W * 1.55), samples=samples, marks=marks, blend=os.path.join(D, 'candelabra.blend'))
print('rendered', out)
