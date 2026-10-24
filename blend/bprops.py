"""Café props rebuilt in Blender, framed exactly like the old three.js renders so they drop into
the pages in the same place. Usage: python3.11 bprops.py jobs.json outdir [samples]
jobs.json: {key: job} as written by the page build (need3d.json)."""
import sys, os, json, math, random, subprocess, hashlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view
import blib
from blib import *

D = os.path.dirname(os.path.abspath(__file__)); TEX = os.path.join(D, 'tex')
GOLD_HEX = '#D9B160'

# ---------------- textures ----------------
def conv_opt(opt, prof):
    n = len(prof); acc = [0.0]
    for (r0, z0), (r1, z1) in zip(prof, prof[1:]): acc.append(acc[-1] + math.hypot(r1 - r0, z1 - z0))
    L = acc[-1]
    def arc(v):
        x = v * (n - 1); i = min(int(x), n - 2); f = x - i
        return (acc[i] * (1 - f) + acc[i + 1] * f) / L
    def rad(v):
        x = v * (n - 1); i = min(int(x), n - 2); f = x - i
        return prof[i][0] * (1 - f) + prof[i + 1][0] * f
    o = dict(opt)
    if 'gold' in o: o['gold'] = [arc(v) for v in o['gold']]
    if o.get('band'): o['band'] = [arc(v) for v in o['band']]
    for k in ('scallop', 'dots'):
        if o.get(k): o[k] = [arc(o[k][0]), o[k][1]]
    if o.get('roses'):
        v, cnt, r = o['roses']; rr = max(rad(v), .05)
        # texture px per unit: across = 2048 / (2 pi rr), down = 1024 / L ; paint roses squashed so they land round
        o['roses'] = [arc(v), cnt, r]; o['sy'] = (1024 / L) / (2048 / (2 * math.pi * rr))
    return o

def china_tex(tint, opt, prof=None):
    if prof: opt = conv_opt(opt, prof)
    name = 'china_' + hashlib.md5(json.dumps([tint, opt], sort_keys=True).encode()).hexdigest()[:10]
    if not os.path.exists(os.path.join(TEX, name + '_col.png')):
        subprocess.run(['python3', os.path.join(D, 'chinatex.py'), json.dumps([{'name': name, 'tint': tint, 'opt': opt}])], check=True)
    return name

def mat_china(tint, opt, lustre=True, prof=None):
    name = china_tex(tint, opt, prof)
    m = bpy.data.materials.new('China'); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    ci = nt.nodes.new('ShaderNodeTexImage'); ci.image = bpy.data.images.load(os.path.join(TEX, name + '_col.png'))
    gi = nt.nodes.new('ShaderNodeTexImage'); gi.image = bpy.data.images.load(os.path.join(TEX, name + '_gold.png')); gi.image.colorspace_settings.name = 'Non-Color'
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    nt.links.new(gi.outputs['Color'], mix.inputs[0]); nt.links.new(ci.outputs['Color'], mix.inputs[6]); mix.inputs[7].default_value = lin(GOLD_HEX)
    nt.links.new(mix.outputs[2], b.inputs['Base Color']); nt.links.new(gi.outputs['Color'], b.inputs['Metallic'])
    rr = nt.nodes.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = .22; rr.inputs['To Max'].default_value = .1
    nt.links.new(gi.outputs['Color'], rr.inputs['Value']); nt.links.new(rr.outputs['Result'], b.inputs['Roughness'])
    b.inputs['Subsurface Weight'].default_value = .18; b.inputs['Subsurface Scale'].default_value = .02
    b.inputs['Coat Weight'].default_value = .9; b.inputs['Coat Roughness'].default_value = .03
    if lustre: b.inputs['Thin Film Thickness'].default_value = 240; b.inputs['Thin Film IOR'].default_value = 1.38
    return m

def mat_gold(): return mat_brass('Gold', base='#D6B56E', dark='#7A5726', rough=(.08, .24), lathe_rings=False, coat=.4, scale=6)

def mat_tea(glow=.35):
    m = bpy.data.materials.new('Tea'); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = lin('#C99A72' if os.environ.get('STYLE', '25d') == '25d' else '#B9773F'); b.inputs['Roughness'].default_value = .04
    b.inputs['Transmission Weight'].default_value = .7; b.inputs['IOR'].default_value = 1.33
    b.inputs['Emission Color'].default_value = lin('#E9A35A'); b.inputs['Emission Strength'].default_value = glow
    vol = nt.nodes.new('ShaderNodeVolumeAbsorption'); vol.inputs['Color'].default_value = lin('#C27A3A'); vol.inputs['Density'].default_value = 18
    nt.links.new(vol.outputs['Volume'], nt.nodes['Material Output'].inputs['Volume'])
    return m

def mat_steam():
    m = bpy.data.materials.new('Steam'); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'BSDF_PRINCIPLED': nt.nodes.remove(n)
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = lin('#FFF4EA'); e.inputs['Strength'].default_value = 3.0
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader'); mx.inputs['Fac'].default_value = .12
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m

# ---------------- geometry ----------------
def lathe_uv(name, prof, seg=96, mat=None, p0=0.0, pl=2 * math.pi, cap=True):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); uv = bm.loops.layers.uv.new()
    n = len(prof); full = abs(pl - 2 * math.pi) < 1e-6; cols = seg + 1
    acc = [0.0]
    for (r0, z0), (r1, z1) in zip(prof, prof[1:]): acc.append(acc[-1] + math.hypot(r1 - r0, z1 - z0))
    V = [a / acc[-1] for a in acc]
    rings = [[bm.verts.new((r * math.cos(p0 + pl * i / seg), r * math.sin(p0 + pl * i / seg), z)) for i in range(cols)] for r, z in prof]
    for k in range(n - 1):
        for i in range(seg):
            f = bm.faces.new((rings[k][i], rings[k][i + 1], rings[k + 1][i + 1], rings[k + 1][i]))
            for lp, (u, v) in zip(f.loops, [(i / seg, V[k]), ((i + 1) / seg, V[k]), ((i + 1) / seg, V[k + 1]), (i / seg, V[k + 1])]):
                lp[uv].uv = (u, v)
    if full: bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    for p in me.polygons: p.use_smooth = True
    if mat: me.materials.append(mat)
    return o

def tube(name, pts, r, mat, res=10):
    return curve_obj(name, [tuple(p) for p in pts], r, mat, res=res, bres=4)

def steam(base, h, seed, n=2):
    rnd = random.Random(seed); sm = mat_steam(); objs = []
    for k in range(n):
        x0 = rnd.uniform(-.08, .08); pts = []
        for i in range(7):
            t = i / 6; pts.append((x0 + math.sin(t * 5 + k * 2) * .05 * t, rnd.uniform(-.02, .02), base + t * h))
        o = curve_obj('steam', pts, .006, sm, res=10, bres=3)
        o.data.bevel_factor_mapping_start = 'SPLINE'; o.data.taper_radius_mode = 'MULTIPLY'
        objs.append(o)
    noink(objs); return objs

# ---------------- kinds ----------------
def teacup(o):
    tint = o.get('tint') or '#EFA3A6'; marks = {}
    sp = [(0, 0), (.34, 0), (.38, .02), (.52, .05), (.54, .065), (.5, .07), (.37, .045), (.17, .04), (0, .04)]
    lathe_uv('Saucer', sp, mat=mat_china(tint, {'gold': [.86], 'roses': [.55, 6, 20], 'roseCol': tint, 'dots': [.95, 60]}, prof=sp))
    gold = mat_gold()
    tor = bpy.ops.mesh.primitive_torus_add(major_radius=.535, minor_radius=.008, location=(0, 0, .063)); bpy.context.object.data.materials.append(gold)
    if o.get('cut'):
        cp = [(0, .045), (.12, .045), (.13, .06), (.06, .1), (.05, .16), (.12, .2), (.22, .28), (.28, .42), (.3, .58), (.31, .72), (.3, .73), (.28, .58), (.26, .42), (.2, .29), (0, .26)]
        glass = mat_basic('CupGlass', '#FFFFFF', rough=0, **{'Transmission Weight': 1, 'IOR': 1.45, 'Thin Film Thickness': 300, 'Thin Film IOR': 1.4})
        lathe_uv('Glass', cp, mat=glass)
        pct = o.get('pct') or 0; yb = .27; yl = .27 + (.71 - .27) * pct / 100
        rAt = lambda y: .2 + (.26 - .2) * (y - .29) / (.42 - .29) if y < .42 else (.26 + .02 * (y - .42) / .16 if y < .58 else .28 + .015 * (y - .58) / .14)
        tp = [(0, yb), (.19, yb), (rAt(.35) * .96, .35)] + [(rAt(y) * .96, y) for y in [yb + (yl - yb) * k / 8 for k in range(1, 9)] if y > .35] + [(0, yl)]
        tp = sorted(tp[1:-1], key=lambda p: p[1]); tp = [(0, yb)] + tp + [(0, yl)]
        lathe_uv('TeaVol', tp, mat=mat_tea(.5))
        bpy.ops.mesh.primitive_torus_add(major_radius=.31, minor_radius=.009, location=(0, 0, .725)); bpy.context.object.data.materials.append(gold)
        bpy.ops.mesh.primitive_torus_add(major_radius=.3, minor_radius=.014, location=(0, 0, .69)); bpy.context.object.data.materials.append(mat_basic('band', tint, rough=.3, **{'Coat Weight': 1}))
        marks['teaY'] = (0, 0, yl)
        if pct > 60: steam(.76, .32, int(pct))
        return marks
    cp = [(0, .045), (.12, .045), (.13, .06), (.09, .1), (.1, .13), (.26, .2), (.36, .32), (.42, .46), (.44, .5), (.43, .505), (.4, .46), (.34, .33), (.24, .22), (0, .19)]
    lathe_uv('Cup', cp, mat=mat_china(tint, {'gold': [.06, .9, .94], 'band': [.78, .86], 'roses': [.6, 6, 30], 'roseCol': tint, 'scallop': [.82, 18]}, prof=cp))
    bpy.ops.mesh.primitive_torus_add(major_radius=.435, minor_radius=.01, location=(0, 0, .5)); bpy.context.object.data.materials.append(gold)
    if o.get('pct') is not None:
        yl = .2 + (.46 - .2) * o['pct'] / 100; rl = max(.05, .24 + (.4 - .24) * (yl - .22) / (.46 - .22))
        bpy.ops.mesh.primitive_circle_add(vertices=96, radius=rl, fill_type='NGON', location=(0, 0, yl)); t = bpy.context.object; t.data.materials.append(mat_tea(.45))
        if o['pct'] > 45: steam(yl + .04, .38, int(o['pct']))
    # handle: a gold curl, in the x-z plane
    tube('Handle', [(.41, 0, .43), (.58, 0, .46), (.62, 0, .36), (.52, 0, .26), (.36, 0, .26)], .028, gold)
    tube('Curl', [(.56, 0, .465), (.64, 0, .5), (.66, 0, .45), (.61, 0, .44)], .014, gold)
    return marks

def teapot(o):
    tint = o.get('tint') or '#86AEDC'; gold = mat_gold()
    bp = [(0, 0), (.2, 0), (.22, .03), (.2, .05), (.3, .12), (.38, .26), (.37, .4), (.3, .52), (.22, .58), (.2, .6), (0, .6)]
    lathe_uv('Body', bp, mat=mat_china(tint, {'gold': [.06, .1, .93], 'roses': [.56, 3, 42], 'roseCol': '#E8857B', 'scallop': [.85, 16], 'band': [.7, .74]}, prof=bp))
    lp = [(0, .6), (.21, .6), (.2, .64), (.15, .7), (.08, .73), (.05, .76), (.07, .8), (0, .84)]
    lathe_uv('Lid', lp, mat=mat_china(tint, {'gold': [.1, .6], 'dots': [.3, 40]}, prof=lp))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.05, location=(0, 0, .85)); bpy.ops.object.shade_smooth(); bpy.context.object.data.materials.append(gold)
    tube('Spout', [(-.3, 0, .22), (-.45, 0, .3), (-.52, 0, .48), (-.6, 0, .56)], .05, mat_china(tint, {}))
    tube('Handle', [(.34, 0, .48), (.56, 0, .52), (.6, 0, .32), (.46, 0, .16), (.34, 0, .16)], .035, gold)
    steam(.62, .4, 5, n=3)
    # a wisp curling out of the spout too
    noink([curve_obj('spoutsteam', [(-.6, 0, .58), (-.66, 0, .66), (-.62, 0, .76), (-.7, 0, .86)], .01, mat_steam(), res=10)])
    return {}

def candle(o):
    col = o.get('col') or '#F2B8C6'; gold = mat_gold()
    lathe_uv('Holder', [(0, 0), (.16, 0), (.16, .02), (.06, .05), (.04, .12), (.06, .15), (.03, .2), (.1, .24), (.11, .26), (0, .26)], mat=gold)
    wax = bpy.data.materials.new('Wax'); wax.use_nodes = True; nt = wax.node_tree; b = nt.nodes['Principled BSDF']
    wv = nt.nodes.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Z'; wv.inputs['Scale'].default_value = 7; wv.inputs['Distortion'].default_value = 0
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Rotation'].default_value = (0, .5, 0)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], wv.inputs['Vector'])
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.interpolation = 'CONSTANT'; cr.color_ramp.elements[0].color = lin(col); cr.color_ramp.elements[1].position = .72; cr.color_ramp.elements[1].color = lin('#FFFDF9')
    nt.links.new(wv.outputs['Fac'], cr.inputs['Fac']); nt.links.new(cr.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Subsurface Weight'].default_value = .6; b.inputs['Subsurface Scale'].default_value = .03; b.inputs['Roughness'].default_value = .35
    lathe_uv('Wax', [(0, .26), (.05, .26), (.045, .96), (.035, .965), (0, .96)], mat=wax)
    flame(Vector((0, 0, 1.03)), 1.0)
    return {'flame': (0, 0, 1.03)}

def flame(p, s=1.0):
    fm = mat_emit('Flame', '#FFD27A', 9); core = mat_emit('Core', '#FF9A4A', 14)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.04 * s, location=p, segments=32, ring_count=16); f = bpy.context.object; f.scale = (.8, .8, 1.9); f.data.materials.append(fm)
    for v in f.data.vertices:
        if v.co.z > 0: v.co.x *= max(.05, 1 - v.co.z * 18 / s); v.co.y *= max(.05, 1 - v.co.z * 18 / s)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.017 * s, location=p - Vector((0, 0, .012 * s))); c = bpy.context.object; c.scale = (.8, .8, 1.6); c.data.materials.append(core)
    L = bpy.data.lights.new('fl', 'POINT'); L.energy = 6 * s; L.color = lin('#FFC27A')[:3]; L.shadow_soft_size = .02
    lo = bpy.data.objects.new('fl', L); bpy.context.scene.collection.objects.link(lo); lo.location = p
    noink([f, c])

def flower(center, colr, size, seed, gold=None):
    rnd = random.Random(seed)
    pm = mat_basic('Petal', colr, rough=.45, **{'Subsurface Weight': .5, 'Subsurface Scale': .02, 'Sheen Weight': .5, 'Coat Weight': .2})
    light = mat_basic('PetalL', '#FFFDF9', rough=.4, **{'Subsurface Weight': .4})
    for ring, (n, rad, tilt) in enumerate([(9, 1.0, 25), (7, .7, 45), (5, .42, 65)]):
        off = rnd.random() * 6
        for k in range(n):
            a = off + 2 * math.pi * k / n
            bm = bmesh.new(); G = []
            for vv in range(9):
                t = vv / 8; row = []
                for uu in range(7):
                    s_ = (uu / 6 - .5) * 2; wdt = size * .35 * rad * math.sin(math.pi * (.12 + .88 * t)) ** .7
                    row.append(bm.verts.new((s_ * wdt, -size * .12 * rad * (1 - s_ * s_) * math.sin(math.pi * t) + size * .05 * t ** 3, size * .6 * rad * t)))
                G.append(row)
            for r1, r2 in zip(G, G[1:]):
                for i in range(6): bm.faces.new((r1[i], r1[i + 1], r2[i + 1], r2[i]))
            me = bpy.data.meshes.new('pet'); bm.to_mesh(me); bm.free()
            p = bpy.data.objects.new('pet', me); bpy.context.scene.collection.objects.link(p); me.materials.append(pm if ring < 2 or k % 2 else light)
            for q in me.polygons: q.use_smooth = True
            p.modifiers.new('s', 'SOLIDIFY').thickness = size * .015
            # petal stands up from the flower centre, facing out
            p.rotation_euler = (math.radians(90 - tilt), 0, a); p.location = center
    bpy.ops.mesh.primitive_uv_sphere_add(radius=size * .1, location=center + Vector((0, 0, size * .05))); bpy.ops.object.shade_smooth()
    bpy.context.object.data.materials.append(mat_emit('Pollen', '#FFE08A', 2.5))

def vase(o):
    gold = mat_gold()
    vp = [(0, 0), (.12, 0), (.12, .02), (.08, .05), (.16, .16), (.2, .3), (.17, .42), (.1, .5), (.09, .56), (.13, .6), (.12, .61), (.08, .58), (0, .58)]
    lathe_uv('Vase', vp, mat=mat_china('#86AEDC', {'gold': [.04, .97], 'dots': [.5, 30], 'band': [.55, .62]}, prof=vp))
    cols = o.get('cols') or ['#EFA3A6', '#F6DEA2', '#C9B8E8', '#EFA3A6', '#F7D3CC', '#C9B8E8', '#F6DEA2']
    pos = [(0, .86, 0), (-.16, .78, .05), (.16, .8, .04), (-.07, .96, -.05), (.09, .95, .02), (-.24, .66, 0), (.24, .68, 0)]
    stem = mat_basic('Stem', '#7FA36E', rough=.5, **{'Subsurface Weight': .3})
    leaf = mat_basic('Leaf', '#9ACBB3', rough=.4, **{'Subsurface Weight': .4, 'Sheen Weight': .3})
    for i, (x, y, z) in enumerate(pos):
        c = Vector((x, -z, y))
        tube('stem', [(0, 0, .5), (x * .5, -z * .5, (y + .5) / 2 + .03), tuple(c)], .006, stem, res=6)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.05, location=(x * .7 + .04, -z, y * .9)); lf = bpy.context.object
        lf.scale = (1.5, .3, .6); lf.rotation_euler = (0, .5 * (1 if i % 2 else -1), 0); bpy.ops.object.shade_smooth(); lf.data.materials.append(leaf)
        flower(c, cols[i % len(cols)], .16 + (i % 3) * .02, i)
    return {}

def stand(o):
    tint = o.get('tint') or '#EFA3A6'; gold = mat_gold()
    for (Y, R) in o['tiers']:
        tp_ = [(0, Y), (R * .25, Y), (R * .3, Y + .006), (R * .9, Y + .02), (R, Y + .04), (R * .99, Y + .05), (R * .9, Y + .036), (R * .3, Y + .024), (0, Y + .024)]
        lathe_uv('Tier', tp_, seg=128, mat=mat_china(tint, {'gold': [.63, .66], 'roses': [.74, 12, 13], 'roseCol': tint, 'dots': [.6, 90]}, prof=tp_))
        bpy.ops.mesh.primitive_torus_add(major_radius=R * .995, minor_radius=.006, location=(0, 0, Y + .046)); bpy.context.object.data.materials.append(gold)
    top, bot = o['tiers'][0][0], o['tiers'][-1][0]
    bpy.ops.mesh.primitive_cylinder_add(radius=.012, depth=top - bot + .32, location=(0, 0, (top + bot) / 2 + .1)); bpy.context.object.data.materials.append(gold)
    for k in range(len(o['tiers']) - 1):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.025, location=(0, 0, (o['tiers'][k][0] + o['tiers'][k + 1][0]) / 2)); bpy.ops.object.shade_smooth(); bpy.context.object.data.materials.append(gold)
    bpy.ops.mesh.primitive_torus_add(major_radius=.06, minor_radius=.01, location=(0, 0, top + .3), rotation=(math.pi / 2, 0, 0)); bpy.context.object.data.materials.append(gold)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.022, location=(0, 0, top + .38)); bpy.ops.object.shade_smooth(); bpy.context.object.data.materials.append(gold)
    lathe_uv('Foot', [(0, bot - .07), (.12, bot - .07), (.12, bot - .06), (.05, bot - .03), (.02, bot - .01), (0, bot - .01)], mat=gold)
    return {}

def cake(o):
    y0, y1, y2 = o['y0'], o['y1'], o['y2']
    pp = [(0, y0 - .025), (.44, y0 - .025), (.46, y0 - .01), (.44, y0), (0, y0)]
    lathe_uv('Plate', pp, seg=128, mat=mat_china('#86AEDC', {'gold': [.6], 'dots': [.8, 80]}, prof=pp))
    def frost(name, col, drip):
        m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
        b.inputs['Base Color'].default_value = lin(col); b.inputs['Roughness'].default_value = .38
        b.inputs['Subsurface Weight'].default_value = .5; b.inputs['Subsurface Scale'].default_value = .02; b.inputs['Sheen Weight'].default_value = .4
        b.inputs['Coat Weight'].default_value = .3
        return m
    def tier(r, a, b, col, drip):
        lathe_uv('Tier', [(0, a), (r, a), (r, b), (0, b)], seg=128, mat=frost('Sponge', col, drip))
        # dripping icing collar: a ring whose lower edge hangs in drops
        bm = bmesh.new(); seg = 192; top_ = []; low = []
        for i in range(seg):
            ang = 2 * math.pi * i / seg; dl = .02 + .035 * max(0, math.sin(ang * 12)) ** 3 * (1 + .5 * math.sin(ang * 5))
            top_.append(bm.verts.new(((r + .006) * math.cos(ang), (r + .006) * math.sin(ang), b + .004)))
            low.append(bm.verts.new(((r + .008) * math.cos(ang), (r + .008) * math.sin(ang), b - dl)))
        for i in range(seg): bm.faces.new((low[i], low[(i + 1) % seg], top_[(i + 1) % seg], top_[i]))
        c = bm.verts.new((0, 0, b + .006)); [bm.faces.new((top_[i], top_[(i + 1) % seg], c)) for i in range(seg)]
        me = bpy.data.meshes.new('icing'); bm.to_mesh(me); bm.free()
        ob = bpy.data.objects.new('icing', me); bpy.context.scene.collection.objects.link(ob); me.materials.append(frost('Icing', drip, None))
        ob.modifiers.new('s', 'SOLIDIFY').thickness = .008; ob.modifiers.new('sub', 'SUBSURF').levels = 1
        for q in me.polygons: q.use_smooth = True
        for z in (b, a + .006):
            bpy.ops.mesh.primitive_torus_add(major_radius=r + .004, minor_radius=.016, location=(0, 0, z), major_segments=96)
            bpy.context.object.data.materials.append(frost('Bead', '#FFFDF9', None))
    tier(.4, y0, y1, '#F8E6B4', '#F7D3CC'); tier(.28, y1, y2, '#F7D3CC', '#FFFDF9')
    cherry = mat_basic('Cherry', '#E8857B', rough=.08, **{'Coat Weight': 1, 'Subsurface Weight': .3})
    for i in range(10):
        a = i / 10 * math.pi * 2 + .2
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.022, location=(math.cos(a) * .35, -math.sin(a) * .35, y1 + .025)); bpy.ops.object.shade_smooth(); bpy.context.object.data.materials.append(cherry)
    # sprinkles that catch the light
    rnd = random.Random(2); sp = [mat_basic('spr' + c, c, rough=.2, **{'Thin Film Thickness': 350}) for c in ['#E8857B', '#EFC15E', '#8FCBB2', '#86AEDC', '#B79FD6']]
    for i in range(70):
        a = rnd.random() * 6.283; r = rnd.uniform(.05, .26)
        bpy.ops.mesh.primitive_cylinder_add(radius=.005, depth=.022, location=(math.cos(a) * r, math.sin(a) * r, y2 + .012), rotation=(math.pi / 2, 0, rnd.random() * 6.283))
        bpy.context.object.data.materials.append(sp[i % 5])
    cols = ['#E8857B', '#EFC15E', '#8FCBB2', '#86AEDC', '#B79FD6']; marks = {}
    for i, (x, z) in enumerate(o.get('candles') or []):
        bpy.ops.mesh.primitive_cylinder_add(radius=.007, depth=.11, location=(x, -z, y2 + .06)); bpy.context.object.data.materials.append(mat_basic('cw', cols[i % 5], rough=.3, **{'Subsurface Weight': .4}))
        flame(Vector((x, -z, y2 + .14)), .35)
    return marks


# ---------------- 2.5D: flat stepped light, crayon grain, ink on top ----------------
LIGHT = Vector((-.45, -.55, .7)).normalized()
def toonify():
    crayon = bpy.data.images.load(os.path.join(TEX, 'crayon.png'))
    for m in list(bpy.data.materials):
        if not m.use_nodes: continue
        nt = m.node_tree; b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if b is None: continue
        out = nt.nodes['Material Output']
        # what colour was it, and was it metal or glass?
        bc_link = next((l for l in nt.links if l.to_socket == b.inputs['Base Color']), None)
        mt_link = next((l for l in nt.links if l.to_socket == b.inputs['Metallic']), None)
        base_val = tuple(b.inputs['Base Color'].default_value); metal_val = b.inputs['Metallic'].default_value
        trans = b.inputs['Transmission Weight'].default_value; glow = b.inputs['Emission Strength'].default_value
        geo = nt.nodes.new('ShaderNodeNewGeometry')
        dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'; dot.inputs[1].default_value = LIGHT
        nt.links.new(geo.outputs['Normal'], dot.inputs[0])
        rp = nt.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.interpolation = 'CONSTANT'
        e = rp.color_ramp.elements; e[0].position = 0; e[0].color = (.66, .64, .7, 1); e[1].position = .32; e[1].color = (.86, .85, .88, 1)
        e2 = e.new(.6); e2.color = (1, 1, 1, 1)
        nt.links.new(dot.outputs['Value'], rp.inputs['Fac'])
        # metal gets a bright band where the light catches it
        mr = nt.nodes.new('ShaderNodeValToRGB'); mr.color_ramp.interpolation = 'CONSTANT'
        f = mr.color_ramp.elements; f[0].position = 0; f[0].color = (.55, .5, .48, 1); f[1].position = .3; f[1].color = (.85, .82, .8, 1)
        f2 = f.new(.62); f2.color = (1.05, 1.03, 1, 1); f3 = f.new(.88); f3.color = (1.12, 1.1, 1.06, 1)
        nt.links.new(dot.outputs['Value'], mr.inputs['Fac'])
        sel = nt.nodes.new('ShaderNodeMix'); sel.data_type = 'RGBA'
        if mt_link: nt.links.new(mt_link.from_socket, sel.inputs[0])
        else: sel.inputs[0].default_value = metal_val
        nt.links.new(rp.outputs['Color'], sel.inputs[6]); nt.links.new(mr.outputs['Color'], sel.inputs[7])
        mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs[0].default_value = 1
        if bc_link: nt.links.new(bc_link.from_socket, mul.inputs[6])
        else: mul.inputs[6].default_value = base_val
        nt.links.new(sel.outputs[2], mul.inputs[7])
        tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (5, 5, 5)
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
        ci = nt.nodes.new('ShaderNodeTexImage'); ci.image = crayon; ci.projection = 'BOX'; ci.projection_blend = .35
        nt.links.new(mp.outputs['Vector'], ci.inputs['Vector'])
        cr = nt.nodes.new('ShaderNodeMix'); cr.data_type = 'RGBA'; cr.blend_type = 'MULTIPLY'; cr.inputs[0].default_value = .85
        nt.links.new(mul.outputs[2], cr.inputs[6]); nt.links.new(ci.outputs['Color'], cr.inputs[7])
        em = nt.nodes.new('ShaderNodeEmission'); nt.links.new(cr.outputs[2], em.inputs['Color']); em.inputs['Strength'].default_value = 1.0 + glow * .6
        if trans > .5 and m.name not in ('Tea',) and not m.name.startswith('Tea'):
            # glass: mostly see-through with a pale tint, the ink does the drawing
            tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader'); mx.inputs['Fac'].default_value = .16
            nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs['Surface'])
        else:
            nt.links.new(em.outputs[0], out.inputs['Surface'])
        for l in list(nt.links):
            if l.to_socket == out.inputs['Volume']: nt.links.remove(l)

KINDS = {'teacup': teacup, 'teapot': teapot, 'candle': candle, 'vase': vase, 'stand': stand, 'cake': cake}

def cam_for(job):
    W, H = job.get('w', 600), job.get('h', 600)
    c = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); bpy.context.scene.collection.objects.link(c); bpy.context.scene.camera = c
    if job.get('ortho'):
        th = job.get('tilt') if job.get('tilt') is not None else .26; az = job.get('az') or 0; cy = job.get('cy') or 0
        c.data.type = 'ORTHO'; c.data.sensor_fit = 'HORIZONTAL'; c.data.ortho_scale = job.get('span') or 1
        p = Vector((math.sin(az) * math.cos(th) * 8, -math.cos(az) * math.cos(th) * 8, cy + math.sin(th) * 8)); look = Vector((0, 0, cy))
    else:
        d = job.get('dist') or 3.2; el = job.get('el') or .45; az = job.get('az') or -.5; ty = job.get('ty') or .3
        c.data.sensor_fit = 'VERTICAL'; c.data.angle_y = math.radians(job.get('fov') or 26)
        p = Vector((math.sin(az) * d * math.cos(el), -math.cos(az) * d * math.cos(el), math.sin(el) * d + ty)); look = Vector((0, 0, ty))
    c.location = p; c.rotation_euler = (look - p).to_track_quat('-Z', 'Y').to_euler()
    c.data.clip_start = .01; c.data.clip_end = 100
    return W, H

def render_job(key, job, outdir, samples):
    sc = reset()
    marks = KINDS[job['kind']](job) or {}
    blib.studio(world_top='#F3ECE2', world_bot='#8D8076', strength=.85)
    softbox((-2.2, -2.6, 2.6), (1.6, 2.2), 380, '#FFF2E0', look=(0, 0, .4))
    softbox((2.6, -1.4, 1.2), (1.2, 1.8), 160, '#E4ECFF', look=(0, 0, .4))
    softbox((0, 2.4, 2.2), (1.6, 1.0), 240, '#FFE4F0', look=(0, 0, .5))
    W, H = cam_for(job)
    flat = os.environ.get('STYLE', '25d') == '25d'
    if flat: toonify()
    ink(thick=2.7 if flat else 1.5, wobble=1.0 if flat else .7)
    bloom(size=7, threshold=.5, strength=1.0)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.use_denoising = True
    sc.render.resolution_x = W; sc.render.resolution_y = int(H); sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    if flat: sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
    else: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
    sc.render.filepath = os.path.join(outdir, key + '.png')
    bpy.context.view_layer.update(); meta = {}
    for k, p in marks.items():
        v = world_to_camera_view(sc, sc.camera, Vector(p)); meta[k] = 1 - v.y if k == 'teaY' else [v.x, 1 - v.y]
    json.dump(meta or None, open(os.path.join(outdir, key + '.json'), 'w'))
    bpy.ops.render.render(write_still=True)
    print('ok', key, flush=True)

if __name__ == '__main__':
    jobs = json.load(open(sys.argv[1])); outdir = sys.argv[2]; samples = int(sys.argv[3]) if len(sys.argv) > 3 else 32
    os.makedirs(outdir, exist_ok=True)
    only = sys.argv[4].split(',') if len(sys.argv) > 4 else None
    for k, j in jobs.items():
        if j['kind'] not in KINDS or (only and k not in only): continue
        if os.path.exists(os.path.join(outdir, k + '.png')) and not os.environ.get('FORCE'): continue
        render_job(k, j, outdir, samples)
