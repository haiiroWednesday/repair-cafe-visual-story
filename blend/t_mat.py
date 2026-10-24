import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from blib import *
sc = reset()
m = mat_brass()
for i, x in enumerate((-.06, .06)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=.05, location=(x, 0, .05), segments=64, ring_count=32); bpy.ops.object.shade_smooth()
    bpy.context.object.data.materials.append(m if i == 0 else mat_basic('plain', '#E2B65C', rough=.15, metal=1))
studio(strength=.7)
softbox((-.5, -.55, .55), (.35, .9), 70, '#FFF1DE', look=(0, 0, .05))
card((-.22, -.18, .25), (.05, .5), 9, look=(0, 0, .05))
camera((0, -.5, .12), (0, 0, .05), lens=60)
b = m.node_tree.nodes['Principled BSDF']
print('links into base:', [l.from_node.name + ':' + l.from_socket.identifier for l in m.node_tree.links if l.to_node == b])
render(os.path.abspath('t_mat.png'), 400, 240, samples=16)
