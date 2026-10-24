"""The gold heart clock from the jewelry table, whole and taken apart.
Run: python3.11 heart_clock.py out.png [samples] [width] [mode: whole|exploded]"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix
from blib import *

D = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'heart.png')
samples = int(sys.argv[2]) if len(sys.argv) > 2 else 48
W = int(sys.argv[3]) if len(sys.argv) > 3 else 900
mode = sys.argv[4] if len(sys.argv) > 4 else 'whole'
EX = mode == 'exploded'
sc = reset()

gold = mat_brass('GoldPlate', base='#F2CE6E', dark='#7A5420', rough=(.05, .22), lathe_rings=False, coat=.5, scale=.6)
goldAntique = mat_brass('GoldRelief', base='#E5BB5A', dark='#4E3414', rough=(.12, .36), lathe_rings=False, coat=.3, scale=.8)
black = mat_basic('BlackRim', '#16131A', rough=.42, **{'Coat Weight': .4, 'Coat Roughness': .2})
glass = mat_basic('Crystal', '#FFFFFF', rough=0, **{'Transmission Weight': 1.0, 'IOR': 1.08, 'Thin Film Thickness': 260, 'Thin Film IOR': 1.33})
wireblue = mat_basic('WireBlue', '#3C7BD6', rough=.35)
case = mat_basic('MovementCase', '#1C1B1F', rough=.55)

# dial: the rose print, softly lit from inside
dm = bpy.data.materials.new('RoseDial'); dm.use_nodes = True; nt = dm.node_tree; b = nt.nodes['Principled BSDF']
im = nt.nodes.new('ShaderNodeTexImage'); im.image = bpy.data.images.load(os.path.join(D, 'tex', 'rose_dial.png')); im.extension = 'EXTEND'
tcd = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.vector_type = 'POINT'
mp.inputs['Scale'].default_value = (1 / .164, 1 / .164, 1); mp.inputs['Location'].default_value = (.5, .5, 0)
nt.links.new(tcd.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], im.inputs['Vector'])
nt.links.new(im.outputs['Color'], b.inputs['Base Color']); nt.links.new(im.outputs['Color'], b.inputs['Emission Color'])
b.inputs['Emission Strength'].default_value = .55; b.inputs['Roughness'].default_value = .35
b.inputs['Coat Weight'].default_value = .6; b.inputs['Coat Roughness'].default_value = .08

# ---------- the heart: classic parametric curve, a little taller than wide ----------
def heart_pts(scale, n=200, inset=0.0):
    P = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = 16 * math.sin(t) ** 3; y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        P.append((x * scale, (y + 17.2) * scale * 1.24))
    if inset:
        cx = sum(p[0] for p in P) / n; cy = sum(p[1] for p in P) / n
        P = [(cx + (x - cx) * (1 - inset), cy + (y - cy) * (1 - inset)) for x, y in P]
    return P

HS = .0098  # ~0.31 m wide
ZF = 0.0
outer = heart_pts(HS)
# the frame front is the x-z plane, facing -y
curve_obj('HeartRim', [(x, ZF - .012, y) for x, y in outer[::2]], .0135, gold, closed=True, res=6, bres=6)
curve_obj('HeartRimInner', [(x, ZF - .016, y) for x, y in heart_pts(HS, inset=.11)[::2]], .0055, goldAntique, closed=True, res=6, bres=4)
# back panel: filled heart, a shallow tray
bm = bmesh.new(); vs = [bm.verts.new((x, .004, y)) for x, y in heart_pts(HS, inset=.04)]; bm.faces.new(vs)
bmesh.ops.triangulate(bm, faces=bm.faces)
me = bpy.data.meshes.new('Back'); bm.to_mesh(me); bm.free()
back = bpy.data.objects.new('Back', me); sc.collection.objects.link(back)
hm = mat_brass('Hammered', base='#EAC567', dark='#8A6428', rough=(.1, .3), lathe_rings=False, coat=.4, scale=.8)
hn = hm.node_tree; vb = hn.nodes.new('ShaderNodeTexVoronoi'); vb.inputs['Scale'].default_value = 160
bb = hn.nodes.new('ShaderNodeBump'); bb.inputs['Strength'].default_value = .25; bb.inputs['Distance'].default_value = .0008
hn.links.new(vb.outputs['Distance'], bb.inputs['Height']); hn.links.new(bb.outputs['Normal'], hn.nodes['Principled BSDF'].inputs['Normal'])
me.materials.append(hm)
sol = back.modifiers.new('s', 'SOLIDIFY'); sol.thickness = .006

# dial centre: left of middle, in the upper body, as in the photo
DC = Vector((-.036, 0, .205)); DR = .082
def at(v, dy):  # exploded: parts fan out toward the camera and to the left
    return Vector((v.x - (dy * .9 if EX else 0), v.y - (dy * 1.1 if EX else 0), v.z + (dy * .25 if EX else 0)))

def disc(name, r, th, loc, mat, seg=96):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=th, vertices=seg, location=loc, rotation=(math.pi / 2, 0, 0))
    o = bpy.context.object; o.data.materials.append(mat); bpy.ops.object.shade_smooth(); return o

def ring(name, r_in, r_out, th, loc, mat, holes=0):
    bm = bmesh.new(); seg = 128
    for a_r in (r_in, r_out): pass
    outerV = []; innerV = []
    for z in (-th / 2, th / 2):
        outerV.append([bm.verts.new((r_out * math.cos(2 * math.pi * i / seg), z, r_out * math.sin(2 * math.pi * i / seg))) for i in range(seg)])
        innerV.append([bm.verts.new((r_in * math.cos(2 * math.pi * i / seg), z, r_in * math.sin(2 * math.pi * i / seg))) for i in range(seg)])
    for i in range(seg):
        j = (i + 1) % seg
        bm.faces.new((outerV[0][i], outerV[0][j], outerV[1][j], outerV[1][i]))
        bm.faces.new((innerV[0][j], innerV[0][i], innerV[1][i], innerV[1][j]))
        bm.faces.new((outerV[0][j], outerV[0][i], innerV[0][i], innerV[0][j]))
        bm.faces.new((outerV[1][i], outerV[1][j], innerV[1][j], innerV[1][i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.location = loc; me.materials.append(mat)
    bv = o.modifiers.new('b', 'BEVEL'); bv.width = .0012; bv.segments = 2
    for p in me.polygons: p.use_smooth = True
    return o

dial = disc('Dial', DR, .003, at(DC + Vector((0, -.006, 0)), .05), dm)
rim = ring('BlackRim', DR - .002, DR + .012, .008, at(DC + Vector((0, -.009, 0)), .1), black)
for k in range(6):  # screw holes round the black rim
    a = k * math.pi / 3 + .3
    p = at(DC + Vector((math.cos(a) * (DR + .005), -.0135, math.sin(a) * (DR + .005))), .1)
    bpy.ops.mesh.primitive_cylinder_add(radius=.0022, depth=.003, location=p, rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(mat_basic('hole', '#050405', rough=.9))
# gold ring with twelve studs (the one waiting in the toolbox)
studring = ring('StudRing', DR - .004, DR + .006, .005, at(DC + Vector((0, -.015, 0)), .16), gold)
for k in range(12):
    a = k * math.pi / 6
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.0034, location=at(DC + Vector((math.cos(a) * (DR + .001), -.018, math.sin(a) * (DR + .001))), .16), segments=20, ring_count=10)
    bpy.ops.object.shade_smooth(); bpy.context.object.data.materials.append(gold)
# hands: ornate, flat, gold
def hand(name, length, width, ang, y):
    s = [(0, -.012), (width * .5, 0), (width * .35, length * .55), (width * .9, length * .7), (0, length), (-width * .9, length * .7), (-width * .35, length * .55), (-width * .5, 0)]
    bm = bmesh.new(); vs = [bm.verts.new((x, 0, z)) for x, z in s]; bm.faces.new(vs)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); me.materials.append(gold)
    o.modifiers.new('s', 'SOLIDIFY').thickness = .0012
    o.rotation_euler = (0, ang, 0); o.location = at(DC + Vector((0, y, 0)), .21); return o
hand('Hour', .05, .009, math.radians(-60), -.02)
hand('Minute', .072, .007, math.radians(25), -.022)
bpy.ops.mesh.primitive_cylinder_add(radius=.004, depth=.006, location=at(DC + Vector((0, -.022, 0)), .21), rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(gold)
# crystal: a shallow domed glass
cg = disc('Crystal', DR + .002, .0012, at(DC + Vector((0, -.026, 0)), .27), glass)
# movement on the back: black box, shaft, two blue wires (as on the table)
mv = Vector((.25, .08, .12)) if EX else DC + Vector((0, .02, 0))
bpy.ops.mesh.primitive_cube_add(size=1, location=mv); box = bpy.context.object; box.scale = (.056, .017, .056); box.data.materials.append(case)
bv = box.modifiers.new('b', 'BEVEL'); bv.width = .003; bv.segments = 3
bpy.ops.mesh.primitive_cylinder_add(radius=.0028, depth=.03, location=mv + Vector((0, -.022, 0)), rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(mat_basic('shaft', '#C9CCD2', metal=1, rough=.2))
for k, dz in enumerate((-.006, .006)):
    p0 = mv + Vector((-.028, 0, dz)); curve_obj('wire', [tuple(p0), tuple(p0 + Vector((-.03, .01, -.01 + k * .01))), tuple(p0 + Vector((-.055, .02, -.035 + k * .02))), tuple(p0 + Vector((-.07, .01, -.06 + k * .01)))], .0016, wireblue, res=8)

# ---------- the rose relief in the upper right lobe ----------
def petal_patch(name, w, h, cup, curl, mat):
    bm = bmesh.new(); nu, nv = 10, 12; G = []
    for v in range(nv + 1):
        t = v / nv; row = []
        for u in range(nu + 1):
            s = (u / nu - .5) * 2
            width = w * math.sin(math.pi * (.15 + .85 * t)) ** .7
            x = s * width; z = h * t
            y = -cup * (1 - s * s) * math.sin(math.pi * t) + curl * t ** 3
            row.append(bm.verts.new((x, y, z)))
        G.append(row)
    for a, b_ in zip(G, G[1:]):
        for i in range(nu): bm.faces.new((a[i], a[i + 1], b_[i + 1], b_[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); me.materials.append(mat)
    o.modifiers.new('s', 'SOLIDIFY').thickness = .0012; o.modifiers.new('sub', 'SUBSURF').levels = 1
    for p in me.polygons: p.use_smooth = True
    return o

def rose3d(center, size, seed):
    """A relief rose: rings of cupped petals, outer ones lying back, inner ones rising toward the viewer."""
    rnd = random.Random(seed)
    rings = [(8, 1.0, 18, 0.0), (7, .74, 34, .006), (6, .5, 52, .012), (4, .3, 70, .018)]
    for n, rad, tilt, fwd in rings:
        off = rnd.random() * 6
        for k in range(n):
            a = off + 2 * math.pi * k / n
            p = petal_patch('petal', size * .3 * rad + .003, size * .55 * rad + .004, size * .09 * rad, size * .05, goldAntique)
            p.rotation_euler = (math.radians(tilt + rnd.uniform(-6, 6)), a, 0)
            p.location = Vector(center) + Vector((math.cos(a + math.pi / 2) * 0, -fwd, 0))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=size * .11, location=Vector(center) + Vector((0, -.022, 0)))
    bpy.context.object.scale = (1, .8, 1); bpy.ops.object.shade_smooth(); bpy.context.object.data.materials.append(goldAntique)

for i, (x, z, s) in enumerate([(.09, .29, .05), (.117, .235, .042), (.064, .24, .036), (.122, .305, .032)]):
    rose3d((x, -.004, z), s, i)
for (x, z, a) in [(.07, .315, .8), (.133, .265, -.4), (.095, .2, -1.2), (.045, .275, 2.1)]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.016, location=(x, -.006, z), segments=24, ring_count=12)
    lf = bpy.context.object; lf.scale = (1.5, .25, .55); lf.rotation_euler = (0, a, 0); bpy.ops.object.shade_smooth(); lf.data.materials.append(goldAntique)

# ---------- studio, camera, render ----------
studio(strength=.65)
softbox((-.6, -.7, .6), (.5, 1.0), 90, '#FFF1DE', look=(0, 0, .2))
softbox((.7, -.4, .3), (.4, .8), 45, '#E6ECFF', look=(0, 0, .2))
softbox((0, .5, .5), (.5, .4), 50, '#FFE2EE', look=(0, 0, .2))
card((-.25, -.3, .2), (.05, .6), 8, look=(0, 0, .2)); card((.3, -.25, .3), (.04, .5), 5, look=(0, 0, .2))
card((.5, -1.5, .45), (.9, .7), 1.6, '#FFF6EC', look=(0, 0, .2))
motes((0, -.05, .16), .24, n=30, seed=7, flatten=.8)
ink(thick=1.8, wobble=.8)
bloom(size=8, threshold=.6, strength=1.2)
if os.environ.get('CLAY'): clay()

marks = {'frame': (-.13, -.012, .1), 'roses': (.1, -.02, .25), 'dial': tuple(at(DC + Vector((.03, -.006, -.03)), .05)), 'rim': tuple(at(DC + Vector((-DR - .006, -.009, 0)), .1)),
         'studs': tuple(at(DC + Vector((0, -.018, DR + .001)), .16)), 'hands': tuple(at(DC + Vector((.02, -.021, .03)), .21)), 'crystal': tuple(at(DC + Vector((-DR * .7, -.026, -DR * .7)), .27)),
         'movement': tuple(mv + Vector((.028, 0, -.02))), 'wires': tuple(mv + Vector((-.09, .015, -.05)))}
if EX: camera((.42, -1.05, .34), (-.1, -.12, .2), lens=42)
else: camera((.18, -1.05, .26), (0, 0, .19), lens=60)
render(out, W, int(W * (.72 if EX else 1.12)), samples=samples, marks=marks, blend=os.path.join(D, 'heart_clock_' + mode + '.blend'))
print('rendered', out)
