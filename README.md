# Repair Café Silicon Valley · a visual story

COMM 3 visual story about Repair Café Silicon Valley, Sunday October 18, 2026, Billy DeFrank Center, San José. Story text is placeholder until the author writes it.

## What's here

| Folder | What it is |
| --- | --- |
| `paper/` | The paper edition (main submission). Collage spreads on rendered paper. `build.py` writes `pub/index.html`. |
| `nb/` | The notebook: a planner-style flip book with a pop-up café, injected into the paper edition. `build_nb.py` writes `part.html`. |
| `sticker/` | "Order Up", the web/sticker version, plus the shared frame builders (`frames.js`, `frames.css`). |
| `diorama/` | The three.js teapot café. Paper models in the other editions are stills of these models. |
| `cf/` | The cuckoo clock Colorfigure. |
| `blend/` | Blender scripts and renders for the heart clock and candelabra. |
| `ps/` | Paper Shaders grain renders used by the paper textures. |

## Building

```
cd nb && npm install && python3 assets.py && python3 build_nb.py
cd ../paper && python3 build.py   # writes paper/pub/index.html
cd pub && python3 -m http.server 8765
```

The asset scripts read the original event photos from the paths they were attached at. The built pages in `paper/pub/` already include web-sized copies, so serving `pub/` works without them.

Photographs by the author. Paper models are stills of the author's 3D café. Reconstructions are labelled in the pages.
