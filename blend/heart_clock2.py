"""The rose heart clock from the jewelry table, at its real size and with its real parts.
Measured against Cyn's two photos: a gold heart about 47 cm across with a thick polished tube rim,
three relief roses up the right lobe and a small spray at the cleft, a big round dial (black bezel ring
with screw holes, night-blue rose face) set low in the left lobe. Off the clock: a gold chapter ring
with Arabic numerals, a flat glass lens, small gold open-work hands plus a long second hand,
and a black quartz movement with a AA battery.
Run: python3.11 heart_clock2.py out.png [samples] [width] [mode: whole|tray]"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from blib import *

D = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'heart2.png')
samples = int(sys.argv[2]) if len(sys.argv) > 2 else 48
W = int(sys.argv[3]) if len(sys.argv) > 3 else 900
mode = sys.argv[4] if len(sys.argv) > 4 else 'whole'
TRAY = mode == 'tray'
sc = reset()

gold = mat_brass('GoldPlate', base='#F4D67E', dark='#8A6224', rough=(.04, .16), lathe_rings=False, coat=.6, scale=.6)
goldRelief = mat_brass('GoldRelief', base='#E9C566', dark='#5A3E16', rough=(.1, .3), lathe_rings=False, coat=.3, scale=.8)
goldAged = mat_brass('GoldAged', base='#E6C474', dark='#7A5A26', rough=(.2, .4), lathe_rings=False, coat=.15, scale=.9)
backG = mat_brass('Back', base='#F0D287', dark='#C79E52', rough=(.3, .45), lathe_rings=False, coat=.1, scale=.7)
black = mat_basic('BlackBezel', '#000000', rough=.45, **{'Specular IOR Level': .25})
hole = mat_basic('Hole', '#040304', rough=.9)
ink_m = mat_basic('Numeral', '#1A140F', rough=.5)
glass = mat_basic('Lens', '#EAF7F2', rough=0, **{'Alpha': (.16 if TRAY else .05), 'Specular IOR Level': .35})
glass.blend_method = 'BLEND' if hasattr(glass, 'blend_method') else None
case = mat_basic('Movement', '#1B1A1E', rough=.5)
copper = mat_basic('Copper', '#C9773A', metal=1, rough=.25)
batt = mat_basic('BattBody', '#151417', rough=.3, **{'Coat Weight': .6, 'Coat Roughness': .1})
silver = mat_basic('Steel', '#D3D6DC', metal=1, rough=.18)
red = mat_basic('Red', '#D22B2B', rough=.35)

# rose face texture, lightly self-lit so it reads the way it does under the room lights
dm = bpy.data.materials.new('RoseDial'); dm.use_nodes = True; nt = dm.node_tree; b = nt.nodes['Principled BSDF']
im = nt.nodes.new('ShaderNodeTexImage'); im.image = bpy.data.images.load(os.path.join(D, 'tex', 'rose_dial2.png')); im.extension = 'EXTEND'
tcd = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.vector_type = 'POINT'
nt.links.new(tcd.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], im.inputs['Vector'])
nt.links.new(im.outputs['Color'], b.inputs['Base Color']); nt.links.new(im.outputs['Color'], b.inputs['Emission Color'])
b.inputs['Emission Strength'].default_value = .22; b.inputs['Roughness'].default_value = .4
b.inputs['Coat Weight'].default_value = .12; b.inputs['Coat Roughness'].default_value = .2

# ---------- the heart outline: two lobes and tangent sides to a point ----------
RL, AX, ZC = .15, .085, .33
def heart_pts(n=240, grow=0.0):
    rl = RL
    d = math.hypot(AX, ZC); th = math.atan2(ZC, AX); ph = math.acos(min(1, rl / d))
    cands = [th + math.pi - ph, th + math.pi + ph]
    tR = max(cands, key=lambda t: AX + rl * math.cos(t))
    tC = math.acos(-AX / rl)
    m = n // 2; seg_line = m // 4
    tp = (AX + rl * math.cos(tR), ZC + rl * math.sin(tR))
    right = [(tp[0] * i / seg_line, tp[1] * i / seg_line) for i in range(seg_line)]
    arc = m - seg_line
    t0 = tR if tR < tC else tR - 2 * math.pi
    for i in range(arc + 1):
        t = t0 + (tC - t0) * i / arc; right.append((AX + rl * math.cos(t), ZC + rl * math.sin(t)))
    left = [(-x, z) for x, z in reversed(right[1:-1])]
    P = right + left
    if grow:  # inset/outset by scaling about the heart's middle
        f = 1 + grow / .2; cz = .23
        P = [(x * f, cz + (z - cz) * f) for x, z in P]
    return P

def inside(p, P):
    x, y = p; c = False
    for i in range(len(P)):
        x1, y1 = P[i]; x2, y2 = P[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
def edge_dist(p, P):
    best = 9
    for i in range(len(P)):
        ax, ay = P[i - 1]; bx, by = P[i]; dx, dy = bx - ax, by - ay
        t = max(0, min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / (dx * dx + dy * dy or 1)))
        best = min(best, math.hypot(p[0] - ax - t * dx, p[1] - ay - t * dy))
    return best

H = heart_pts()
RIM = .023            # tube radius of the polished rim
# biggest dial that sits in the left half, as in the photos (it nearly touches the rim at left and bottom)
best = (0, None)
for i in [-9]:
    for j in range(15, 40):
        p = (i * .005, j * .01)
        if inside(p, H):
            r = edge_dist(p, H) - RIM * .9
            if r > best[0]: best = (r, p)
BR, (dcx, dcz) = best
BR = min(BR, .145)
DC = Vector((dcx, 0, dcz))
FR = BR - .022        # rose face radius inside the black bezel
print('bezel r', BR, 'centre', dcx, dcz)

# ---------- placement: whole clock stands upright facing -y; tray mode lays everything flat on z=0 ----------
def place(o, loc, upright_rot=(0, 0, 0)):
    o.location = loc; o.rotation_euler = upright_rot

def tube(name, P, r, y, mat):
    return curve_obj(name, [(x, y, z) for x, z in P[::2]], r, mat, closed=True, res=8, bres=8)

heart_parts = []
rim = tube('Rim', H, RIM, -.012, gold); heart_parts.append(rim)
inner = tube('RimInner', heart_pts(grow=-.03), .006, -.006, goldRelief); heart_parts.append(inner)
outer_lip = tube('RimLip', heart_pts(grow=.012), .008, .004, goldAged); heart_parts.append(outer_lip)
bm = bmesh.new(); vs = [bm.verts.new((x, .006, z)) for x, z in heart_pts(grow=-.01)]; bm.faces.new(vs)
bmesh.ops.triangulate(bm, faces=bm.faces)
me = bpy.data.meshes.new('Back'); bm.to_mesh(me); bm.free()
back = bpy.data.objects.new('Back', me); sc.collection.objects.link(back); me.materials.append(backG)
back.modifiers.new('s', 'SOLIDIFY').thickness = .006; heart_parts.append(back)

def ring(name, r_in, r_out, th, mat, seg=160):
    bm = bmesh.new(); O = []; I = []
    for z in (-th / 2, th / 2):
        O.append([bm.verts.new((r_out * math.cos(2 * math.pi * i / seg), z, r_out * math.sin(2 * math.pi * i / seg))) for i in range(seg)])
        I.append([bm.verts.new((r_in * math.cos(2 * math.pi * i / seg), z, r_in * math.sin(2 * math.pi * i / seg))) for i in range(seg)])
    for i in range(seg):
        j = (i + 1) % seg
        bm.faces.new((O[0][i], O[0][j], O[1][j], O[1][i])); bm.faces.new((I[0][j], I[0][i], I[1][i], I[1][j]))
        bm.faces.new((O[0][j], O[0][i], I[0][i], I[0][j])); bm.faces.new((O[1][i], O[1][j], I[1][j], I[1][i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); me.materials.append(mat)
    bv = o.modifiers.new('b', 'BEVEL'); bv.width = min(.0015, th * .3); bv.segments = 2
    for p in me.polygons: p.use_smooth = True
    return o

def disc(name, r, th, mat, seg=128):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=th, vertices=seg, location=(0, 0, 0), rotation=(math.pi / 2, 0, 0))
    o = bpy.context.object; o.name = name; o.data.materials.append(mat); bpy.ops.object.shade_smooth()
    bpy.ops.object.transform_apply(rotation=True); return o

def group(name, objs):
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e)
    for o in objs: o.parent = e
    return e

# the face + bezel stay in the heart (that is how the owner holds it in the second photo)
face = disc('Face', FR + .004, .003, dm); face.location = DC + Vector((0, -.004, 0))
mp.inputs['Scale'].default_value = (1 / (2 * (FR + .004)), 1 / (2 * (FR + .004)), 1)
mp.inputs['Location'].default_value = (.5, .5, 0)
# map texture onto the x/z face: object coords (x, y, z) -> use x and z
sep = nt.nodes.new('ShaderNodeSeparateXYZ'); cmb = nt.nodes.new('ShaderNodeCombineXYZ')
nt.links.new(tcd.outputs['Object'], sep.inputs[0]); nt.links.new(sep.outputs['X'], cmb.inputs['X']); nt.links.new(sep.outputs['Z'], cmb.inputs['Y'])
nt.links.new(cmb.outputs[0], mp.inputs['Vector'])
bezel = ring('Bezel', FR - .002, BR, .012, black); bezel.location = DC + Vector((0, -.009, 0))
holes = []
for k in range(8):
    a = k * math.pi / 4 + math.pi / 8
    h = disc('h%d' % k, .0028, .004, hole, seg=16)
    h.location = DC + Vector((math.cos(a) * (BR - .009), -.0152, math.sin(a) * (BR - .009))); holes.append(h)
# hub where the movement shaft comes through
hub = disc('Hub', .006, .006, case, seg=32); hub.location = DC + Vector((0, -.008, 0))
heart_parts += [face, bezel, hub] + holes

# ---------- relief roses up the right lobe, a small spray at the cleft ----------
def petal_patch(w, h, cup, curl, mat):
    bm = bmesh.new(); nu, nv = 10, 12; G = []
    for v in range(nv + 1):
        t = v / nv; row = []
        for u in range(nu + 1):
            s = (u / nu - .5) * 2
            width = w * math.sin(math.pi * (.15 + .85 * t)) ** .7
            row.append(bm.verts.new((s * width, -cup * (1 - s * s) * math.sin(math.pi * t) + curl * t ** 3, h * t)))
        G.append(row)
    for a_, b_ in zip(G, G[1:]):
        for i in range(nu): bm.faces.new((a_[i], a_[i + 1], b_[i + 1], b_[i]))
    me = bpy.data.meshes.new('petal'); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('petal', me); sc.collection.objects.link(o); me.materials.append(mat)
    o.modifiers.new('s', 'SOLIDIFY').thickness = .0014; o.modifiers.new('sub', 'SUBSURF').levels = 1
    for p in me.polygons: p.use_smooth = True
    return o

def rose3d(center, size, seed):
    rnd = random.Random(seed); objs = []
    for n, rad, tilt, fwd in [(8, 1.0, 16, 0.0), (7, .74, 32, .007), (6, .5, 50, .014), (4, .3, 70, .021)]:
        off = rnd.random() * 6
        for k in range(n):
            a = off + 2 * math.pi * k / n
            p = petal_patch(size * .3 * rad + .003, size * .55 * rad + .004, size * .09 * rad, size * .05, goldRelief)
            p.rotation_euler = (math.radians(tilt + rnd.uniform(-6, 6)), a, 0)
            p.location = Vector(center) + Vector((0, -fwd, 0)); objs.append(p)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=size * .11, location=Vector(center) + Vector((0, -.024, 0)))
    o = bpy.context.object; o.scale = (1, .8, 1); bpy.ops.object.shade_smooth(); o.data.materials.append(goldRelief); objs.append(o)
    return objs

def leaf(x, z, ang, L=.034):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=L / 2, location=(x, -.008, z), segments=24, ring_count=12)
    o = bpy.context.object; o.scale = (1.6, .22, .5); o.rotation_euler = (0, ang, 0); bpy.ops.object.shade_smooth(); o.data.materials.append(goldRelief)
    return o

# find free room in the right lobe, clear of the bezel
def clear(x, z, r): return math.hypot(x - dcx, z - dcz) > BR + r + .004 and inside((x, z), H) and edge_dist((x, z), H) > RIM + r * .7
spots = []
for (x, z, s) in [(.152, .372, .085), (.163, .272, .08), (.122, .19, .062), (.064, .418, .05)]:
    print('rose', x, z, s, 'clear' if clear(x, z, s * .55) else 'BLOCKED')
    spots.append((x, z, s))
for i, (x, z, s) in enumerate(spots):
    heart_parts += rose3d((x, -.004, z), s, i)
for (x, z, a) in [(.2, .42, .9), (.205, .32, -.3), (.2, .225, -.6), (.115, .23, 2.2), (.105, .14, -1.0), (.11, .41, 2.6), (.03, .43, 1.9)]:
    heart_parts.append(leaf(x, z, a))

heart = group('Heart', heart_parts)

# ---------- loose parts ----------
# chapter ring: an aged gold band with twelve Arabic numerals, set radially
CR_IN, CR_OUT = FR - .026, FR + .001
chap = ring('ChapterRing', CR_IN, CR_OUT, .004, goldAged)
nums = []
for n in range(1, 13):
    a = math.pi / 2 - n * math.pi / 6
    bpy.ops.object.text_add(location=(0, 0, 0)); t = bpy.context.object
    t.data.body = str(n); t.data.size = .022; t.data.align_x = 'CENTER'; t.data.align_y = 'CENTER'; t.data.extrude = .0006
    t.data.materials.append(ink_m)
    rr = (CR_IN + CR_OUT) / 2
    t.rotation_euler = (math.pi / 2, math.pi / 2 - a, 0)
    t.location = (math.cos(a) * rr, -.0028, math.sin(a) * rr)
    t.parent = chap; nums.append(t)

lens = disc('Lens', FR + .006, .0028, glass)
lensEdge = ring('LensEdge', FR + .0035, FR + .006, .0028, mat_basic('LensEdge', '#BFE3D2', rough=.05, **{'Alpha': .55}))
lensEdge.parent = lens

def openwork_hand(name, L, w, loop_at, loop_r, mat):
    """Flat gold hand: a slim blade, an open ring near the hub and a spade tip, like the ones in her palm."""
    objs = []
    bm = bmesh.new()
    s = [(-w * .5, -.012), (w * .5, -.012), (w * .3, L * .8), (w * 1.3, L * .86), (0, L), (-w * 1.3, L * .86), (-w * .3, L * .8)]
    vs = [bm.verts.new((x, 0, z)) for x, z in s]; bm.faces.new(vs)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); me.materials.append(mat)
    o.modifiers.new('s', 'SOLIDIFY').thickness = .0008; objs.append(o)
    lp = ring(name + 'Loop', loop_r * .55, loop_r, .0008, mat, seg=48); lp.location = (0, 0, L * loop_at); objs.append(lp)
    hb = ring(name + 'Hub', .0012, .004, .0008, mat, seg=32); objs.append(hb)
    return group(name + 'G', objs)

hour = openwork_hand('Hour', .062, .0034, .48, .009, gold)
minute = openwork_hand('Minute', .088, .0026, .55, .0085, gold)
# long second hand with a counterweight, the thin rod lying by the movement
bpy.ops.mesh.primitive_cylinder_add(radius=.0007, depth=.13, location=(0, 0, .045)); sec = bpy.context.object; sec.data.materials.append(goldAged)
bpy.ops.mesh.primitive_cylinder_add(radius=.003, depth=.0012, location=(0, 0, -.017), rotation=(math.pi / 2, 0, 0)); cw = bpy.context.object; cw.data.materials.append(goldAged)
second = group('SecondG', [sec, cw])

# movement: 56 x 56 x 16 mm black box, AA battery seated on top, red adjust button, brass shaft
mv_objs = []
bpy.ops.mesh.primitive_cube_add(size=1); box = bpy.context.object; box.scale = (.056, .016, .056); box.data.materials.append(case)
bv = box.modifiers.new('b', 'BEVEL'); bv.width = .002; bv.segments = 3; mv_objs.append(box)
for gx in range(4):  # the vent grille
    for gz in range(2):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-.012 + gx * .008, .0082, .016 + gz * .007)); g = bpy.context.object; g.scale = (.004, .001, .004); g.data.materials.append(hole); mv_objs.append(g)
bpy.ops.mesh.primitive_cylinder_add(radius=.0071, depth=.05, location=(0, .012, -.017), rotation=(0, math.pi / 2, 0)); bb = bpy.context.object; bb.data.materials.append(batt); mv_objs.append(bb)
bpy.ops.mesh.primitive_cylinder_add(radius=.0072, depth=.014, location=(.018, .012, -.017), rotation=(0, math.pi / 2, 0)); bc = bpy.context.object; bc.data.materials.append(copper); mv_objs.append(bc)
bpy.ops.mesh.primitive_cylinder_add(radius=.0028, depth=.002, location=(.0255, .012, -.017), rotation=(0, math.pi / 2, 0)); bn = bpy.context.object; bn.data.materials.append(silver); mv_objs.append(bn)
bpy.ops.mesh.primitive_cylinder_add(radius=.0025, depth=.003, location=(.019, .0085, .019), rotation=(math.pi / 2, 0, 0)); rb = bpy.context.object; rb.data.materials.append(red); mv_objs.append(rb)
bpy.ops.mesh.primitive_cylinder_add(radius=.0022, depth=.022, location=(0, -.015, 0), rotation=(math.pi / 2, 0, 0)); sh = bpy.context.object; sh.data.materials.append(gold); mv_objs.append(sh)
for o in mv_objs: bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o; bpy.ops.object.shade_smooth()
movement = group('MovementG', mv_objs)

# ---------- arrange ----------
marks = {}
if not TRAY:
    # whole: everything back in place, hands at about ten past ten
    heart.location = (0, 0, 0)
    chap.location = DC + Vector((0, -.017, 0))
    lens.location = DC + Vector((0, -.024, 0))
    hour.location = DC + Vector((0, -.021, 0)); hour.rotation_euler = (0, math.radians(-60), 0)
    minute.location = DC + Vector((0, -.022, 0)); minute.rotation_euler = (0, math.radians(58), 0)
    second.location = DC + Vector((0, -.0225, 0)); second.rotation_euler = (0, math.radians(160), 0)
    movement.location = DC + Vector((0, .02, 0))
    marks = {'frame': (-.2, -.03, .2), 'roses': (spots[0][0], -.03, spots[0][1]), 'face': tuple(DC + Vector((.02, -.02, -.03))), 'bezel': tuple(DC + Vector((-BR + .006, -.015, 0))),
             'ring': tuple(DC + Vector((0, -.02, CR_OUT - .004))), 'hands': tuple(DC + Vector((.02, -.022, .03))), 'lens': tuple(DC + Vector((-FR * .6, -.025, -FR * .6)))}
    camera((.16, -1.45, .3), (0, 0, .225), lens=60)
    WH = (W, int(W * 1.0))
else:
    # tray: the parts laid out flat the way they were on the table, seen from above, true to scale
    for o in (heart, chap, lens, hour, minute, second):
        o.rotation_euler = (math.radians(-90), 0, 0)
    movement.rotation_euler = (math.radians(90), 0, 0)  # face up: -y front becomes +z up
    heart.location = (-.16, -.25, .0)
    chap.location = (.25, .12, .002)
    lens.location = (.25, -.2, .002)
    movement.location = (.5, .14, .008)
    hour.location = (.47, -.07, .001); hour.rotation_euler = (math.radians(-90), 0, math.radians(30))
    minute.location = (.52, -.09, .001); minute.rotation_euler = (math.radians(-90), 0, math.radians(18))
    second.location = (.6, -.05, .001); second.rotation_euler = (math.radians(-90), 0, math.radians(8))
    bpy.context.view_layer.update()
    def wp(o, v=(0, 0, 0)): return tuple(o.matrix_world @ Vector(v))
    marks = {'frame': wp(heart, (-.22, -.012, .18)), 'roses': wp(heart, (spots[0][0], -.02, spots[0][1])), 'face': wp(heart, tuple(DC + Vector((.03, -.01, -.05)))),
             'bezel': wp(heart, tuple(DC + Vector((-BR + .005, -.015, -.02)))), 'ring': wp(chap, (0, 0, CR_OUT - .006)), 'lens': wp(lens, (FR * .55, 0, FR * .55)),
             'hands': wp(minute), 'second': wp(second, (0, 0, .09)), 'movement': wp(movement, (.02, 0, .02)), 'battery': wp(movement, (0, .012, -.017))}
    camera((.115, -.03, 2.0), (.115, -.03, 0), ortho=1.12)
    WH = (W, int(W * .66))

studio(strength=.6)
softbox((-.6, -.8, .9), (.6, 1.0), 110, '#FFF1DE', look=(0, 0, .15))
softbox((.8, -.5, .5), (.4, .8), 50, '#E6ECFF', look=(0, 0, .15))
softbox((0, .6, .8), (.5, .4), 40, '#FFE2EE', look=(0, 0, .15))
card((-.3, -.35, .3), (.05, .7), 8, look=(0, 0, .2)); card((.35, -.3, .35), (.04, .6), 5, look=(0, 0, .2))
card((.5, -1.6, .5), (1.0, .8), 1.8, '#FFF6EC', look=(0, 0, .2))
ink(thick=1.6, wobble=.7)
bloom(size=7, threshold=.7, strength=.9)
if os.environ.get('CLAY'): clay()
render(out, WH[0], WH[1], samples=samples, marks=marks, blend=os.path.join(D, 'heart2_' + mode + '.blend'))
print('rendered', out)
