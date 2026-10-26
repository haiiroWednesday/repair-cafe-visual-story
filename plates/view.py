import sys
from PIL import Image
for n in sys.argv[1:]:
    im=Image.open(f'out/{n}.png'); bg=Image.new('RGB',im.size,'#efe6d6'); bg.paste(im,(0,0),im); bg.save(f'out/_v_{n}.jpg',quality=88); print(n, im.size)
