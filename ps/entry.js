import { emptyPixel, ShaderMount, paperTextureFragmentShader, getShaderNoiseTexture, getShaderColorFromString, ShaderFitOptions } from '@paper-design/shaders';
window.renderPaper = (p, w, h) => new Promise(res => {
  const el = document.createElement('div'); el.style.cssText = `width:${w}px;height:${h}px;position:absolute;left:0;top:0`; document.body.appendChild(el);
  const noise = getShaderNoiseTexture(); const ep = new Image(); ep.src = emptyPixel;
  const go = () => {
    const u = { u_image: ep, u_isImage: false, u_colorBack: getShaderColorFromString(p.colorBack || '#00000000'), u_colorPaper: getShaderColorFromString(p.colorPaper), u_colorShadow: getShaderColorFromString(p.colorShadow),
      u_blending: 0, u_distortion: 0, u_clip: false, u_angle: p.angle ?? 300, u_seed: p.seed ?? 4, u_roughness: p.roughness ?? .4, u_roughnessSize: p.roughnessSize ?? .5, u_roughnessRows: p.roughnessRows ?? 0,
      u_fiber: p.fiber ?? .4, u_fiberSize: p.fiberSize ?? .5, u_folds: p.folds ?? 0, u_foldSizeX: p.foldSizeX ?? 1, u_foldSizeY: p.foldSizeY ?? 1, u_foldOffsetX: p.foldOffsetX ?? 0, u_foldOffsetY: p.foldOffsetY ?? 0,
      u_wrinkles: p.wrinkles ?? 0, u_wrinkleSize: p.wrinkleSize ?? .65, u_crumples: p.crumples ?? 0, u_crumpleCount: p.crumpleCount ?? 6, u_drops: p.drops ?? 0, u_noiseTexture: noise,
      u_fit: ShaderFitOptions.cover, u_scale: p.scale ?? 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: .5, u_originY: .5, u_worldWidth: w, u_worldHeight: h };
    const m = new ShaderMount(el, paperTextureFragmentShader, u, { preserveDrawingBuffer: true }, 0, 0, 1, w * h * 4);
    setTimeout(() => { const c = el.querySelector('canvas'); const url = c.toDataURL('image/png'); m.dispose && m.dispose(); el.remove(); res(url); }, 800);
  };
  const wait = () => (noise.complete && ep.complete) ? go() : setTimeout(wait, 50); wait();
});
window.__ready = true;
