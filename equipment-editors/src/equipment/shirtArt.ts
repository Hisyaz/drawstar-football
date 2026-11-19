import { kitHex } from "./kitPalette";
import type { BrandId } from "./brands";
import { FONTS, type ShirtDesign } from "./uniformCatalog";

const cache = new Map<string, string>();

function mix(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const n = hex.replace("#", "");
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${ch(ar, br)},${ch(ag, bg)},${ch(ab, bb)})`;
}

function tune(brand: BrandId) {
  if (brand === "leone") return { stripe: 4, hoop: 4, sash: 4, collar: 1 };
  if (brand === "electrik") return { stripe: 2, hoop: 2, sash: 2, collar: 0 };
  if (brand === "tapitas") return { stripe: 3, hoop: 5, sash: 3, collar: 2 };
  if (brand === "low_systems") return { stripe: 6, hoop: 6, sash: 2, collar: 0 };
  return { stripe: 8, hoop: 8, sash: 2, collar: 0 };
}

function cloth(design: ShirtDesign, brand: BrandId, x: number, y: number, sleeve: boolean): string {
  const base = kitHex(design.base);
  const base2 = kitHex(design.base2);
  const mark = kitHex(design.patternColor);
  const t = tune(brand);
  const p = design.pattern;
  if (p === "stripes") return Math.floor(x / t.stripe) % 2 === 0 ? base : mark;
  if (p === "hoops") return Math.floor(y / t.hoop) % 2 === 0 ? base : mark;
  if (p === "half") return x < 24 ? base : base2;
  if (p === "sash_left") return Math.abs(x - (8 + y * 0.55)) < t.sash ? mark : base;
  if (p === "sash_right") return Math.abs(x - (40 - y * 0.55)) < t.sash ? mark : base;
  if (p === "raglan") return sleeve ? mark : base;
  if (p === "gradient") return mix(base, base2, Math.min(1, y / 48));
  if (p === "check") return (Math.floor(x / (brand === "generic" ? 6 : 4)) + Math.floor(y / (brand === "generic" ? 6 : 4))) % 2 === 0 ? base : mark;
  if (p === "diagonal") return x + y > (brand === "electrik" ? 48 : 52) ? base2 : base;
  if (p === "chest_line") return y > 18 && y < 18 + (brand === "leone" ? 6 : 4) ? mark : base;
  if (p === "two") return sleeve ? base2 : base;
  if (p === "middle") return Math.abs(x - 24) < (brand === "low_systems" ? 1 : 3) ? mark : base;
  return base;
}

/** Front shirt. The brand only shifts the collar and the pattern, not the colors. */
export function shirtImageUrl(design: ShirtDesign, brand: BrandId = "generic", kind: "preview" | "match" = "preview"): string {
  const key = `${kind}|${brand}|${JSON.stringify(design)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const scale = kind === "preview" ? 4 : 2;
  const off = document.createElement("canvas");
  off.width = 48;
  off.height = 56;
  const g = off.getContext("2d");
  if (!g) return "";
  const collar = kitHex(design.collarColor);
  const cuff = kitHex(design.cuffColor);
  const cuffRows = design.cuff === "big" ? 5 : design.cuff === "normal" ? 3 : design.cuff === "small" ? 2 : 0;
  const pad = tune(brand).collar;
  const filled: boolean[][] = Array.from({ length: 56 }, () => Array(48).fill(false));

  for (let y = 0; y < 56; y++) {
    for (let x = 0; x < 48; x++) {
      const inSleeve = (x < 14 && y > 10 && y < 28 && x > 3 + (y - 10) * 0.15) || (x > 33 && y > 10 && y < 28 && x < 44 - (y - 10) * 0.15);
      const inBody = x > 13 && x < 34 && y > 8 && y < 50 && y > 8 + Math.abs(x - 24) * 0.15;
      if (!inBody && !inSleeve) continue;
      const neck = (x - 24) ** 2 / (36 + pad * 4) + (y - 10) ** 2 / (16 + pad * 2) < 1 && y < 16 + pad;
      const vee = design.collar === "vneck" && Math.abs(x - 24) < (brand === "electrik" ? 12 : 16) - y && y > 8 && y < (brand === "leone" ? 18 : 22);
      const polo = design.collar === "polo" && Math.abs(x - 24) < (brand === "tapitas" ? 9 : 7) && y > 8 && y < 18 + pad;
      if (design.collar === "crew" && neck) {
        if (y < 12 + pad) {
          g.fillStyle = collar;
          g.fillRect(x, y, 1, 1);
          filled[y][x] = true;
        }
        continue;
      }
      if (vee || (polo && Math.abs(x - 24) < 2)) {
        g.fillStyle = collar;
        g.fillRect(x, y, 1, 1);
        filled[y][x] = true;
        continue;
      }
      const onCuff = cuffRows > 0 && inSleeve && y > 27 - cuffRows;
      g.fillStyle = onCuff ? cuff : cloth(design, brand, x, y, inSleeve);
      g.fillRect(x, y, 1, 1);
      filled[y][x] = true;
    }
  }

  if (design.collar === "polo") {
    g.fillStyle = collar;
    g.fillRect(20 - pad, 8, 8 + pad * 2, 2);
    g.fillStyle = "#111";
    g.fillRect(23, 12, 1, 1);
    if (brand !== "generic") g.fillRect(23, 15, 1, 1);
  }

  g.fillStyle = "#111111";
  for (let y = 0; y < 56; y++) {
    for (let x = 0; x < 48; x++) {
      if (filled[y][x]) continue;
      const touch = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => filled[y + dy]?.[x + dx]);
      if (touch) g.fillRect(x, y, 1, 1);
    }
  }

  const text = design.sponsor.trim().slice(0, 12).toUpperCase();
  if (text) {
    const font = FONTS.find((item) => item.id === design.font)?.css ?? "sans-serif";
    g.font = `8px ${font}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (design.border === "small") {
      g.lineWidth = 1;
      g.strokeStyle = kitHex(design.borderColor);
      g.strokeText(text, 24, 28);
    }
    if (design.border === "broad") {
      g.lineWidth = 2;
      g.strokeStyle = kitHex(design.borderColor);
      g.strokeText(text, 24, 28);
    }
    g.fillStyle = kitHex(design.letterColor);
    g.fillText(text, 24, 28);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 48 * scale;
  canvas.height = 56 * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}