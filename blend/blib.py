"""Shared Blender helpers for the café assets: materials with real surface texture,
turned (lathe) parts, a soft studio that gives metal something to reflect, and a
render that also writes where labelled points land in the picture."""
import bpy, bmesh, math, json, os, random
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c) + (1.0,)


def node(nt, kind, loc=(0, 0), **inputs):
    n = nt.nodes.new(kind); n.location = loc
    for k, v in inputs.items(): n.inputs[k].default_value = v
    return n


def mat_basic(name, col, rough=.5, metal=0, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = lin(col) if isinstance(col, str) else col
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m


def mat_brass(name='Brass', base='#E2B65C', dark='#5A4421', rough=(.07, .32), lathe_rings=True, coat=.35, scale=1.0):
    """Polished lacquered brass: smudged roughness, fine turning rings, tarnish in the crevices."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    b = nt.nodes['Principled BSDF']; b.inputs['Metallic'].default_value = 1.0
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = .04
    tc = node(nt, 'ShaderNodeTexCoord', (-1200, 0))
    # smudges and fingerprints: low-frequency noise drives roughness
    smud = node(nt, 'ShaderNodeTexNoise', (-900, 300), Scale=18 * scale, Detail=6, Roughness=.6)
    nt.links.new(tc.outputs['Object'], smud.inputs['Vector'])
    sr = nt.nodes.new('ShaderNodeMapRange'); sr.location = (-650, 300)
    sr.inputs['From Min'].default_value = .42; sr.inputs['From Max'].default_value = .68
    sr.inputs['To Min'].default_value = rough[0]; sr.inputs['To Max'].default_value = rough[1]
    nt.links.new(smud.outputs['Fac'], sr.inputs['Value']); nt.links.new(sr.outputs['Result'], b.inputs['Roughness'])
    # tarnish: ambient occlusion pulls the colour toward old brown in the creases
    ao = nt.nodes.new('ShaderNodeAmbientOcclusion'); ao.location = (-900, 0); ao.inputs['Distance'].default_value = .012 * scale; ao.only_local = True
    ar = nt.nodes.new('ShaderNodeValToRGB'); ar.location = (-650, 0)
    ar.color_ramp.elements[0].position = .35; ar.color_ramp.elements[0].color = lin(dark)
    ar.color_ramp.elements[1].position = .85; ar.color_ramp.elements[1].color = lin(base)
    nt.links.new(ao.outputs['AO'], ar.inputs['Fac'])
    # a little colour wander so it is not one flat yellow
    cw = node(nt, 'ShaderNodeTexNoise', (-900, -300), Scale=6 * scale, Detail=3)
    nt.links.new(tc.outputs['Object'], cw.inputs['Vector'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.location = (-400, -100)
    mix.inputs['Factor'].default_value = .18
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.location = (-650, -300)
    cr.color_ramp.elements[0].color = lin('#D9A88A'); cr.color_ramp.elements[1].color = lin('#FFF6DA')
    nt.links.new(cw.outputs['Fac'], cr.inputs['Fac'])
    nt.links.new(ar.outputs['Color'], mix.inputs[6]); nt.links.new(cr.outputs['Color'], mix.inputs[7])
    nt.links.new(mix.outputs[2], b.inputs['Base Color'])
    if lathe_rings:
        # turning marks: very fine bands around the height of each part
        sep = nt.nodes.new('ShaderNodeSeparateXYZ'); sep.location = (-900, -550); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
        wv = node(nt, 'ShaderNodeTexWave', (-650, -550), Scale=900 * scale, Distortion=1.5, Detail=2)
        wv.wave_type = 'BANDS'; wv.bands_direction = 'Z'
        nt.links.new(tc.outputs['Object'], wv.inputs['Vector'])
        bump = node(nt, 'ShaderNodeBump', (-300, -550), Strength=.035, Distance=.0004)
        nt.links.new(wv.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    return m


def mat_glass(name='Glass', rough=0.0, tint=(1, 1, 1, 1)):
    m = mat_basic(name, tint, rough=rough, **{'Transmission Weight': 1.0, 'IOR': 1.5})
    return m


def mat_emit(name, col, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'BSDF_PRINCIPLED': nt.nodes.remove(n)
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = lin(col); e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
    return m


def lathe(name, prof, seg=96, mat=None, smooth=True, loc=(0, 0, 0)):
    """prof: list of (r, z) from bottom to top. Returns a closed turned mesh."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    rings = []
    for (r, z) in prof:
        ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), z)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            try: bm.faces.new((a[i], a[j], b[j], b[i]))
            except ValueError: pass
    if prof[0][0] > 0: bm.faces.new(list(reversed(rings[0])))
    if prof[-1][0] > 0: bm.faces.new(rings[-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); o.location = loc
    if smooth:
        for p in me.polygons: p.use_smooth = True
        o.modifiers.new('ws', 'WEIGHTED_NORMAL') if False else None
    if mat: me.materials.append(mat)
    return o


def curve_obj(name, pts, r, mat, closed=False, res=12, bres=4, kind='NURBS'):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = bres; cu.resolution_u = res
    cu.use_fill_caps = True
    sp = cu.splines.new(kind); sp.points.add(len(pts) - 1)
    for p, v in zip(sp.points, pts): p.co = (*v, 1)
    sp.use_endpoint_u = not closed; sp.use_cyclic_u = closed; sp.order_u = min(4, len(pts))
    o = bpy.data.objects.new(name, cu); bpy.context.scene.collection.objects.link(o)
    if mat: o.data.materials.append(mat)
    return o


def studio(world_top='#8A7C70', world_bot='#2A221D', strength=.9):
    sc = bpy.context.scene
    w = bpy.data.worlds.new('Studio'); sc.world = w; w.use_nodes = True; nt = w.node_tree
    bg = nt.nodes['Background']; bg.inputs['Strength'].default_value = strength
    tc = node(nt, 'ShaderNodeTexCoord', (-900, 0)); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); sep.location = (-700, 0)
    nt.links.new(tc.outputs['Generated'], sep.inputs['Vector'])
    rp = nt.nodes.new('ShaderNodeValToRGB'); rp.location = (-450, 0)
    rp.color_ramp.elements[0].position = .45; rp.color_ramp.elements[0].color = lin(world_bot)
    rp.color_ramp.elements[1].position = .62; rp.color_ramp.elements[1].color = lin(world_top)
    nt.links.new(sep.outputs['Z'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], bg.inputs['Color'])


def softbox(loc, size, energy, col='#FFF4E6', look=(0, 0, .2), visible_in_glossy=True):
    L = bpy.data.lights.new('box', 'AREA'); L.shape = 'RECTANGLE'; L.size = size[0]; L.size_y = size[1]; L.energy = energy; L.color = lin(col)[:3]
    o = bpy.data.objects.new('box', L); bpy.context.scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(look) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return o


def card(loc, size, strength, col='#FFFFFF', look=(0, 0, .2)):
    """An emissive card the camera cannot see: it only shows up as a long highlight in metal."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc); o = bpy.context.object
    o.scale = (size[0], size[1], 1)
    o.rotation_euler = (Vector(look) - Vector(loc)).to_track_quat('Z', 'Y').to_euler()
    o.data.materials.append(mat_emit('card', col, strength))
    o.visible_camera = False; o.visible_shadow = False
    noink([o])
    return o


def shadow_floor(z=0, size=4):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z)); o = bpy.context.object
    o.is_shadow_catcher = True
    o.data.materials.append(mat_basic('floor', '#4A3B30', rough=.55))
    noink([o])
    return o


def camera(loc, look, lens=60, ortho=None):
    sc = bpy.context.scene
    c = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); sc.collection.objects.link(c); sc.camera = c
    c.location = loc; c.rotation_euler = (Vector(look) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    if ortho: c.data.type = 'ORTHO'; c.data.ortho_scale = ortho
    else: c.data.lens = lens
    return c


def render(out, w, h, samples=48, marks=None, blend=None):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 10; sc.cycles.glossy_bounces = 6; sc.cycles.transmission_bounces = 8
    sc.render.resolution_x = w; sc.render.resolution_y = h; sc.render.resolution_percentage = 100
    sc.render.film_transparent = True; sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
    sc.render.filepath = out
    if blend: bpy.ops.wm.save_as_mainfile(filepath=blend)
    if marks:
        bpy.context.view_layer.update(); cam = sc.camera; res = {}
        for k, p in marks.items():
            v = world_to_camera_view(sc, cam, Vector(p)); res[k] = [round(v.x, 4), round(1 - v.y, 4)]
        json.dump(res, open(os.path.splitext(out)[0] + '.json', 'w'))
    bpy.ops.render.render(write_still=True)


# ---------------- the house look: inked contours, bloom, motes ----------------
def noink(objs):
    """Keep floors, light cards and motes out of the pen lines."""
    c = bpy.data.collections.get('NoInk') or bpy.data.collections.new('NoInk')
    if c.name not in bpy.context.scene.collection.children: bpy.context.scene.collection.children.link(c)
    for o in objs:
        for uc in list(o.users_collection): uc.objects.unlink(o)
        c.objects.link(o)


def ink(thick=1.7, wobble=1.1, color='#5E5450', crease=118, inner=True):
    """Freestyle contours drawn like a pen: tapered ends, slow wobble, silhouettes heavier than inner edges."""
    sc = bpy.context.scene; sc.render.use_freestyle = True; sc.render.line_thickness_mode = 'RELATIVE'
    vl = sc.view_layers[0]; vl.use_freestyle = True; fs = vl.freestyle_settings
    fs.crease_angle = math.radians(crease)
    for ls in list(fs.linesets): fs.linesets.remove(ls)
    def lineset(name, sil, border, crease_e, th, alpha):
        ls = fs.linesets.new(name)
        ls.select_by_visibility = True; ls.visibility = 'VISIBLE'
        ls.select_silhouette = sil; ls.select_border = border; ls.select_crease = crease_e
        ls.select_contour = sil; ls.select_external_contour = sil
        nc = bpy.data.collections.get('NoInk')
        if nc: ls.select_by_collection = True; ls.collection = nc; ls.collection_negation = 'EXCLUSIVE'
        st = ls.linestyle; st.color = lin(color)[:3]; st.thickness = th; st.alpha = alpha
        st.caps = 'ROUND'; st.chaining = 'PLAIN'; st.use_same_object = True
        tm = st.thickness_modifiers.new('taper', 'ALONG_STROKE'); tm.mapping = 'CURVE'
        cv = tm.curve.curves[0]; pts = cv.points
        pts[0].location = (0, .25); pts[1].location = (1, .3); pts.new(.5, 1.0); tm.curve.update()
        gm = st.geometry_modifiers.new('wob', 'PERLIN_NOISE_1D'); gm.frequency = 6; gm.amplitude = wobble; gm.octaves = 2
        return ls
    lineset('outer', True, True, False, thick, 1.0)
    if inner: lineset('inner', False, False, True, thick * .55, .7)


def bloom(size=7, threshold=2.0, strength=1.0):
    """Glow only from what is really bright (filaments, motes, lit glass), added on top;
    the glow also lifts alpha so it shows on a transparent page."""
    sc = bpy.context.scene; sc.use_nodes = True; nt = sc.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    sc.view_layers[0].use_pass_emit = True
    rl = nt.nodes.new('CompositorNodeRLayers'); co = nt.nodes.new('CompositorNodeComposite')
    gl = nt.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.quality = 'HIGH'; gl.size = size; gl.threshold = threshold; gl.mix = 1.0
    nt.links.new(rl.outputs['Emit'], gl.inputs['Image'])
    sc_ = nt.nodes.new('CompositorNodeMixRGB'); sc_.blend_type = 'MULTIPLY'; sc_.inputs[0].default_value = 1
    sc_.inputs[2].default_value = (strength, strength * .92, strength * .8, 1)
    nt.links.new(gl.outputs['Image'], sc_.inputs[1])
    add = nt.nodes.new('CompositorNodeMixRGB'); add.blend_type = 'ADD'; add.inputs[0].default_value = 1
    nt.links.new(rl.outputs['Image'], add.inputs[1]); nt.links.new(sc_.outputs['Image'], add.inputs[2])
    bw = nt.nodes.new('CompositorNodeRGBToBW'); nt.links.new(sc_.outputs['Image'], bw.inputs['Image'])
    mx = nt.nodes.new('CompositorNodeMath'); mx.operation = 'MAXIMUM'; mx.use_clamp = True
    nt.links.new(rl.outputs['Alpha'], mx.inputs[0]); nt.links.new(bw.outputs['Val'], mx.inputs[1])
    sa = nt.nodes.new('CompositorNodeSetAlpha'); sa.mode = 'REPLACE_ALPHA'
    nt.links.new(add.outputs['Image'], sa.inputs['Image']); nt.links.new(mx.outputs['Value'], sa.inputs['Alpha'])
    nt.links.new(sa.outputs['Image'], co.inputs['Image'])


MOTE_COLS = ['#FFE3A3', '#F7C6D9', '#CFE8FF', '#D9F2E3', '#E6DAFF']
def motes(center, radius, n=40, size=(.0012, .004), seed=3, strength=(2.5, 7), cols=MOTE_COLS, flatten=1.0):
    """Floating specks of light, like dust caught in lamplight in an animated film."""
    rnd = random.Random(seed); out = []
    mats = [mat_emit('mote' + c, c, 1) for c in cols]
    for i in range(n):
        while True:
            p = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1) * flatten, rnd.uniform(-1, 1)))
            if p.length < 1: break
        loc = Vector(center) + p * radius
        bpy.ops.mesh.primitive_ico_sphere_add(radius=rnd.uniform(*size), subdivisions=2, location=loc)
        o = bpy.context.object; o.visible_shadow = False
        m = mats[i % len(mats)].copy(); m.node_tree.nodes['Emission'].inputs['Strength'].default_value = rnd.uniform(*strength)
        o.data.materials.append(m); out.append(o)
    noink(out)
    return out


def iridescent(name, base='#F6F2F8', rough=.08, thick=480, ior=1.45, coat=1.0):
    m = mat_basic(name, base, rough=rough, **{'Thin Film Thickness': thick, 'Thin Film IOR': ior, 'Coat Weight': coat, 'Coat Roughness': .05})
    return m


def clay():
    """Override every material with plain clay to check geometry before finish."""
    cm = mat_basic('Clay', '#CFC8BE', rough=.7)
    for o in bpy.context.scene.objects:
        if o.type in ('MESH', 'CURVE') and o.visible_camera:
            o.data.materials.clear(); o.data.materials.append(cm)
