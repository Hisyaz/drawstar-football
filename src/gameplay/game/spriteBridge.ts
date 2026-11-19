/**
 * Bake-time limb bridging. Sprites are drawn as hand-placed pixel parts, so some poses leave
 * detached blocks (a boot, hand or lower leg floating with a gap). After a sprite is baked (once, then cached),
 * we find disconnected pixel groups and connect each one to the body with a 2px line in the group's own colour.
 * Zero cost at runtime: sprites are cached.
 */
export function bridgeLimbs(canvas: HTMLCanvasElement): number {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const lab = new Int16Array(w * h).fill(-1);
  const comps: number[][] = [];
  const stack: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (d[i * 4 + 3] < 128 || lab[i] >= 0) continue;
    const id = comps.length, px: number[] = [];
    lab[i] = id; stack.push(i);
    while (stack.length) {
      const c = stack.pop()!; px.push(c);
      const cx = c % w, cy = (c / w) | 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        if (!ox && !oy) continue;
        const nx = cx + ox, ny = cy + oy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (lab[n] >= 0 || d[n * 4 + 3] < 128) continue;
        lab[n] = id; stack.push(n);
      }
    }
    comps.push(px);
  }
  if (comps.length < 2) return 0;
  let main = 0;
  for (let k = 1; k < comps.length; k++) if (comps[k].length > comps[main].length) main = k;
  const mainPx = comps[main].slice();
  const done = new Set<number>([main]);
  let bridged = 0;
  const set = (x: number, y: number, r: number, g: number, b: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const o = (y * w + x) * 4;
    if (d[o + 3] >= 128) return;
    d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
  };
  for (;;) {
    let best = -1, bd = 1e9, ba = -1, bb = -1;
    for (let k = 0; k < comps.length; k++) {
      if (done.has(k) || comps[k].length < 4) continue;
      const cp = comps[k];
      for (let a = 0; a < cp.length; a++) {
        const ax = cp[a] % w, ay = (cp[a] / w) | 0;
        for (let m = 0; m < mainPx.length; m++) {
          const dx = (mainPx[m] % w) - ax, dy = ((mainPx[m] / w) | 0) - ay;
          const dd = dx * dx * 3 + dy * dy + (dy > 0 ? 400 : 0); // prefer joining UPWARD (to hip/torso) and vertically, not sideways onto the other leg
          if (dd < bd) { bd = dd; best = k; ba = cp[a]; bb = mainPx[m]; }
        }
      }
    }
    if (best < 0 || bd > 760) break; // never bridge more than 14px
    let x0 = ba % w, y0 = (ba / w) | 0;
    const x1 = bb % w, y1 = (bb / w) | 0;
    const r = d[ba * 4], g = d[ba * 4 + 1], b = d[ba * 4 + 2];
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (let guard = 0; guard < 64; guard++) {
      set(x0, y0, r, g, b);
      if (dy >= dx) set(x0 + 1, y0, r, g, b); else set(x0, y0 + 1, r, g, b); // 2px thick
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    for (const p of comps[best]) mainPx.push(p);
    done.add(best); bridged++;
  }
  if (bridged) ctx.putImageData(img, 0, 0);
  return bridged;
}
