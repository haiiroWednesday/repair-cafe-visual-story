"""Photograph paper and cloth in Blender: a real displaced sheet under a low raking light, shot straight down.
Run: python3.11 texstudio.py NAME [samples]
Crumpled paper = soft folds (clouds) + crease networks at three sizes (Voronoi F2-F1, some as ridges, some as valleys)
+ a fibre bump in the shader. Cloth = thread height maps from fabricmaps.py on a gently wrinkled sheet."""
import bpy, sys, os, math
D = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(D, 'maps'); O = os.path.join(D, 'studio'); os.makedirs(O, exist_ok=True)
name = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else sys.argv[1]
samples = int(sys.argv[-1]) if sys.argv[-1].isdigit() else 32
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c) + (1.0,)

PAPER = {  # base colour, crease strength, sizes, roughness, seed
    'paper_cream': ('#EEE6D2', 1.0, (1.0, .32, .11), .85, 1),
    'paper_grey':  ('#E8E4DB', 1.25, (1.2, .4, .14), .85, 2),
    'paper_navy':  ('#26357E', .8, (1.0, .32, .11), .75, 3),
    'paper_lined': ('#F3EFE5', .55, (1.3, .45, .16), .85, 4),
    'paper_grid':  ('#F1EEE6', .5, (1.3, .45, .16), .85, 5),
    'kraft':       ('#C29466', 1.1, (.8, .26, .09), .8, 6),
    'gold':        ('#D8B35E', 1.5, (.55, .18, .06), .28, 7),
    'film':        ('#C54A22', .25, (1.5, .5, .2), .55, 8),
}
FABRIC = {'gingham_pink': .9, 'gingham_green': .9, 'denim': 1.0, 'knit': 1.4, 'herringbone': .9, 'mesh': 1.0}
isPaper = name in PAPER
W, H = (1800, 1125) if isPaper else (1100, 1100)
if os.environ.get('QUICK'): W, H = W // 3, H // 3
SX, SY = (3.2, 2.0) if isPaper else (2.0, 2.0)

bpy.ops.mesh.primitive_grid_add(x_subdivisions=(300 if os.environ.get('QUICK') else 900) if isPaper else 500, y_subdivisions=(190 if os.environ.get('QUICK') else 560) if isPaper else 500, size=1)
sheet = bpy.context.object; sheet.scale = (SX, SY, 1); bpy.ops.object.transform_apply(scale=True)
bpy.ops.object.shade_smooth()

def displace(kind, size, strength, seed, w=None, depth=2):
    t = bpy.data.textures.new(f'{kind}{seed}', kind)
    if kind == 'VORONOI':
        t.distance_metric = 'DISTANCE'; t.weight_1, t.weight_2, t.weight_3, t.weight_4 = (w or (-1, 1, 0, 0)); t.noise_scale = size
    else:
        t.noise_scale = size; t.noise_depth = depth
    m = sheet.modifiers.new(f'd{seed}', 'DISPLACE'); m.texture = t; m.strength = strength; m.texture_coords = 'LOCAL'; m.mid_level = .5
    # offset each layer so the networks do not line up
    e = bpy.data.objects.new(f'e{seed}', None); sc.collection.objects.link(e); e.location = (seed * .37, seed * .53, 0); m.texture_coords = 'OBJECT'; m.texture_coords_object = e

CREASE = {'paper_cream': 'crease_a', 'paper_grey': 'crease_b', 'paper_navy': 'crease_a', 'paper_lined': 'crease_c', 'paper_grid': 'crease_c', 'kraft': 'crease_b', 'gold': 'crease_d', 'film': 'crease_c'}
if isPaper:
    col, k, (s1, s2, s3), rough, seed = PAPER[name]
    cimg = bpy.data.images.load(f'{M}/{CREASE[name]}.png'); cimg.colorspace_settings.name = 'Non-Color'
    t = bpy.data.textures.new('crease', 'IMAGE'); t.image = cimg
    md = sheet.modifiers.new('crease', 'DISPLACE'); md.texture = t; md.texture_coords = 'UV'; md.strength = .16 * k; md.mid_level = .5
    displace('CLOUDS', .9, .06 * k, seed * 10 + 1, depth=2)
else:
    displace('CLOUDS', .7, .035, 91, depth=2)

m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; out = nt.nodes['Material Output']
tc = nt.nodes.new('ShaderNodeTexCoord')
if isPaper:
    b.inputs['Base Color'].default_value = lin(col); b.inputs['Roughness'].default_value = rough
    if name == 'gold': b.inputs['Metallic'].default_value = 1.0
    # paper fibre: fine noise into a gentle bump; tiny fibres as a second, sharper noise
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 900; n1.inputs['Detail'].default_value = 8
    n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 60; n2.inputs['Detail'].default_value = 4
    vor = nt.nodes.new('ShaderNodeTexVoronoi'); vor.feature = 'DISTANCE_TO_EDGE'; vor.inputs['Scale'].default_value = 48 if name != 'gold' else 90
    nt.links.new(tc.outputs['Object'], n1.inputs['Vector']); nt.links.new(tc.outputs['Object'], n2.inputs['Vector']); nt.links.new(tc.outputs['Object'], vor.inputs['Vector'])
    ci = nt.nodes.new('ShaderNodeTexImage'); ci.image = cimg; ci.interpolation = 'Cubic'; nt.links.new(tc.outputs['UV'], ci.inputs['Vector'])
    mixh = nt.nodes.new('ShaderNodeMath'); mixh.operation = 'MULTIPLY_ADD'; mixh.inputs[1].default_value = .012
    nt.links.new(n1.outputs['Fac'], mixh.inputs[0]); nt.links.new(ci.outputs['Color'], mixh.inputs[2])
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = (.55 if name != 'gold' else .9) * min(1.2, k); bump.inputs['Distance'].default_value = .06
    nt.links.new(mixh.outputs[0], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    # a little blotchiness in the colour, as in real stock
    ramp = nt.nodes.new('ShaderNodeMix'); ramp.data_type = 'RGBA'; ramp.inputs['A'].default_value = lin(col)
    c2 = [min(1, v * (1.06 if name != 'paper_navy' else 1.12)) for v in lin(col)[:3]] + [1]; ramp.inputs['B'].default_value = c2
    nt.links.new(n2.outputs['Fac'], ramp.inputs['Factor']); nt.links.new(ramp.outputs['Result'], b.inputs['Base Color'])
else:
    strength = FABRIC[name]
    def img(path, cs='sRGB'):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(path); n.image.colorspace_settings.name = cs; n.interpolation = 'Cubic'
        mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 1, 1)
        nt.links.new(tc.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], n.inputs['Vector']); return n
    ci = img(f'{M}/{name}_col.png'); hi = img(f'{M}/{name}_h.png', 'Non-Color')
    nt.links.new(ci.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = .92
    b.inputs['Sheen Weight'].default_value = .6; b.inputs['Sheen Roughness'].default_value = .5
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = strength; bump.inputs['Distance'].default_value = .004
    nt.links.new(hi.outputs['Color'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    if os.path.exists(f'{M}/{name}_a.png'):
        ai = img(f'{M}/{name}_a.png', 'Non-Color'); nt.links.new(ai.outputs['Color'], b.inputs['Alpha'])
    m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
sheet.data.materials.append(m)
for f in sheet.data.polygons: f.use_smooth = True

# raking light from the upper left, a soft fill, a little sky
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = 2.0; sun.data.angle = math.radians(7); sun.rotation_euler = (math.radians(58), 0, math.radians(-135))
fill = bpy.data.objects.new('fill', bpy.data.lights.new('fill', 'SUN')); sc.collection.objects.link(fill)
fill.data.energy = .35; fill.data.angle = math.radians(30); fill.rotation_euler = (math.radians(20), 0, math.radians(60))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Strength'].default_value = .22
w.node_tree.nodes['Background'].inputs['Color'].default_value = (1, .98, .95, 1)
if name == 'gold':  # metal needs something to reflect
    for i, (x, y, e) in enumerate([(-2, -1.5, 300), (2.5, 1.2, 160)]):
        L = bpy.data.objects.new(f'a{i}', bpy.data.lights.new(f'a{i}', 'AREA')); sc.collection.objects.link(L); L.data.energy = e; L.data.size = 2.5; L.location = (x, y, 2.2)
        L.rotation_euler = (0, 0, 0); L.data.shape = 'DISK'
        L.rotation_euler = (math.atan2(-y, 2.2) * -1 * 0, 0, 0)

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (0, 0, 5); cam.data.type = 'ORTHO'; cam.data.ortho_scale = max(SX, SY) * .96
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = W, H; sc.render.film_transparent = name == 'mesh'
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA' if name == 'mesh' else 'RGB'
sc.render.filepath = os.path.join(O, name + '.png')
bpy.ops.render.render(write_still=True); print('done', name)
