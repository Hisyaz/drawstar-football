/** Both pictures come from the same draw. Cached until the colors change. */

export type BallPicture = "match" | "preview";

const SIZE: Record<BallPicture, number> = { match: 64, preview: 256 };

const cache = new Map<string, string>();

function shade(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(n.slice(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(n.slice(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(n.slice(4, 6), 16) + amount));
  return `rgb(${r},${g},${b})`;
}

function circle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}

function pixelBallColor(paintId: string, x: number, y: number, c0: string, c1: string, c2: string): string {
  const cut = paintId.indexOf(":");
  const house = cut < 0 ? "brand" : paintId.slice(0, cut);
  const base = cut < 0 ? paintId : paintId.slice(cut + 1);
  const simple = house === "plain" || house === "generic";
  const n = (x * 13 + y * 7) % 17;
  let color = c0;
  if (base === "woven_bands") color = y % (simple ? 6 : 4) < 2 ? c0 : c1;
  else if (base === "laced_bladder") color = !simple && Math.abs(x - 16) < 2 && y > 10 && y < 22 && y % 3 !== 0 ? c1 : c0;
  else if (base === "ghost_seam") color = Math.abs(y - 16) < 1 ? c1 : c0;
  else if (base === "molded_grooves") color = Math.abs((x + y) % (simple ? 8 : 5)) < 2 ? c1 : c0;
  else if (base === "street_seams") color = x % 8 === 0 || y % 8 === 0 ? c1 : c0;
  else if (base === "grained_skin") color = n % (simple ? 7 : 4) === 0 ? shade(c1, -10) : c0;
  else if (base === "flecked_shell") color = n % 4 === 0 ? c1 : !simple && n % 9 === 0 ? (c2 || c1) : c0;
  else if (base === "sensor_ring") {
    const d = Math.hypot(x - 16, y - 16);
    color = d < (simple ? 2 : 3) || (!simple && d > 8 && d < 11) ? c1 : c0;
  } else if (base === "modern_panels" || base === "gloss_panels" || base === "classic_panels") {
    const bands = simple ? 2 : 4;
    const slice = Math.floor((x / 32) * bands);
    color = slice % 2 === 0 ? c0 : c1;
    if (!simple && y % 8 === 0 && x > 8 && x < 24) color = shade(c0, -40);
    if (!simple && c2 && slice === bands - 1) color = c2;
  } else {
    color = (x < 16 && y < 16) || (x >= 16 && y >= 16) ? c0 : c1;
  }
  if (simple) return color;
  if (house === "leone" && (Math.abs(x - 16) === 5 || Math.abs(y - 16) === 5) && x > 8 && x < 24 && y > 8 && y < 24) return c1;
  if (house === "electrik") {
    const d = Math.hypot(x - 16, y - 16);
    if (d > 6 && d < 8) return c1;
  }
  if (house === "tapitas" && Math.abs(x - y) < 1 && x > 8 && x < 24) return c1;
  if (house === "low_systems" && y === 21 && x > 8 && x < 24) return c1;
  return color;
}

/** Preview only. Match sprites keep the smooth draw. */
function drawPixelBall(ctx: CanvasRenderingContext2D, size: number, paintId: string, colors: readonly string[]) {
  const n = 32;
  const off = document.createElement("canvas");
  off.width = n;
  off.height = n;
  const g = off.getContext("2d");
  if (!g) return;
  const [c0, c1, c2] = [colors[0] || "#f8fafc", colors[1] || "#111827", colors[2] || colors[1] || "#111827"];
  const cx = 16;
  const cy = 16;
  const r = 14;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > r + 0.2) continue;
      g.fillStyle = d > r - 1 ? "#111111" : pixelBallColor(paintId, x, y, c0, c1, c2);
      g.fillRect(x, y, 1, 1);
    }
  }
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fillRect(10, 8, 2, 2);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(off, 0, 0, size, size);
}

function pentagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = rot + (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function paintPanels(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a: string, b: string, accent?: string) {
  ctx.fillStyle = a;
  circle(ctx, cx, cy, r);
  ctx.fill();
  ctx.fillStyle = b;
  pentagon(ctx, cx, cy, r * 0.28, 0);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
    pentagon(ctx, cx + Math.cos(ang) * r * 0.62, cy + Math.sin(ang) * r * 0.62, r * 0.22, ang);
    ctx.fill();
  }
  if (accent) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(1.5, r * 0.035);
    circle(ctx, cx, cy, r * 0.46);
    ctx.stroke();
  }
}

function paint(
  ctx: CanvasRenderingContext2D,
  paintId: string,
  colors: readonly string[],
  kind: BallPicture,
) {
  const s = SIZE[kind];
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.42;
  const [c0, c1, c2] = colors;
  const basePaint = paintId.includes(":") ? paintId.slice(paintId.indexOf(":") + 1) : paintId;
  const hq = kind === "preview";
  if (hq) {
    drawPixelBall(ctx, s, paintId, colors);
    return;
  }

  ctx.clearRect(0, 0, s, s);
  ctx.save();
  circle(ctx, cx, cy, r);
  ctx.clip();

  switch (basePaint) {
    case "woven_bands": {
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = c1;
      const band = r * 0.22;
      for (let y = cy - r; y < cy + r; y += band * 2) ctx.fillRect(0, y, s, band);
      break;
    }
    case "grained_skin": {
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = c1;
      const step = hq ? 7 : 5;
      for (let y = 2; y < s; y += step) {
        for (let x = ((y / step) % 2) * 3; x < s; x += step) ctx.fillRect(x, y, hq ? 2 : 1, hq ? 2 : 1);
      }
      break;
    }
    case "flecked_shell": {
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = c1;
      for (let i = 0; i < (hq ? 70 : 28); i++) {
        const ang = (i * 2.399) % (Math.PI * 2);
        const rad = ((i * 17) % 100) / 100 * r;
        ctx.fillRect(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, hq ? 3 : 2, hq ? 3 : 2);
      }
      ctx.strokeStyle = c2 ?? c1;
      ctx.lineWidth = r * 0.04;
      circle(ctx, cx, cy, r * 0.55);
      ctx.stroke();
      break;
    }
    case "ghost_seam": {
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = c1;
      ctx.globalAlpha = hq ? 0.45 : 0.7;
      ctx.lineWidth = Math.max(1, r * 0.025);
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.7, cy);
      ctx.quadraticCurveTo(cx, cy - r * 0.25, cx + r * 0.7, cy);
      ctx.moveTo(cx, cy - r * 0.7);
      ctx.quadraticCurveTo(cx + r * 0.2, cy, cx, cy + r * 0.7);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case "molded_grooves": {
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = c1;
      ctx.lineWidth = Math.max(1.25, r * 0.045);
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(cx + i * r * 0.28, cy, r * 0.95, 0.4, Math.PI - 0.4);
        ctx.stroke();
      }
      break;
    }
    case "street_seams": {
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = c1;
      ctx.lineWidth = r * 0.08;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.moveTo(cx - r * 0.7, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.7, cy + r * 0.7);
      ctx.stroke();
      break;
    }
    case "laced_bladder": {
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = shade(c0, -40);
      ctx.lineWidth = Math.max(1, r * 0.03);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.72, r * 0.5, 0.4, 0, Math.PI * 2);
      ctx.stroke();
      const lx = cx + r * 0.18;
      const ly = cy - r * 0.08;
      ctx.strokeStyle = c1;
      ctx.lineWidth = Math.max(1.5, r * 0.06);
      ctx.beginPath();
      ctx.moveTo(lx - r * 0.16, ly - r * 0.12);
      ctx.lineTo(lx + r * 0.16, ly + r * 0.12);
      ctx.moveTo(lx + r * 0.16, ly - r * 0.12);
      ctx.lineTo(lx - r * 0.16, ly + r * 0.12);
      ctx.stroke();
      break;
    }
    case "sensor_ring": {
      ctx.fillStyle = c0;
      ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = c1;
      ctx.lineWidth = r * 0.1;
      circle(ctx, cx, cy, r * 0.62);
      ctx.stroke();
      ctx.fillStyle = c1;
      circle(ctx, cx, cy, r * 0.08);
      ctx.fill();
      break;
    }
    case "gloss_panels":
    case "classic_panels":
      paintPanels(ctx, cx, cy, r, c0, c1);
      break;
    default:
      paintPanels(ctx, cx, cy, r, c0, c1, c2);
  }

  ctx.restore();

  ctx.save();
  circle(ctx, cx, cy, r);
  ctx.clip();
  if (hq) {
    const light = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r);
    light.addColorStop(0, "rgba(255,255,255,0.45)");
    light.addColorStop(0.45, "rgba(255,255,255,0)");
    light.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, s, s);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = hq ? 3 : 1.5;
  circle(ctx, cx, cy, r);
  ctx.stroke();
}

/** Both pictures come from the same draw. Cached until the colors change. */
export function ballImageUrl(paintId: string, colors: readonly string[], kind: BallPicture): string {
  const key = `${kind}|${paintId}|${colors.join(",")}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  const s = SIZE[kind];
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingEnabled = kind === "preview";
  paint(ctx, paintId, colors, kind);
  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}
