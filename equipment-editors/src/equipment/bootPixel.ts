/** Side preview is a hand-drawn 32-bit boot. The match sprite stays the simple last. */

export type BootLast = "round" | "blade" | "tongue" | "slab" | "sock";
export type BootMotif = "laces" | "stripes" | "saddle" | "bolt" | "slash" | "band" | "block" | "wave" | "chevron" | "cage";

const SIMPLE: Record<BootLast, readonly string[]> = {
  round: [
    "            ######",
    "         ##########",
    "       ############",
    "      ##############",
    "     ################",
    "    ##################",
    "   ####################",
    "  ######################",
    " ########################",
    "##########################",
    "oooooooooooooooooooooooooo",
    " tt  tt  tt  tt  tt  tt  ",
  ],
  blade: [
    "              ########",
    "           ############",
    "        ################",
    "      ###################",
    "    ######################",
    "   ########################",
    "  ##########################",
    " ############################",
    "##############################",
    "oooooooooooooooooooooooooooooo",
    " tt  tt  tt  tt  tt  tt  tt  ",
  ],
  tongue: [
    "          ######  ######",
    "         ################",
    "       ##################",
    "      ####################",
    "     ######################",
    "    ########################",
    "   ##########################",
    "  ############################",
    " ##############################",
    "##############################",
    "oooooooooooooooooooooooooooooo",
    " tt  tt  tt  tt  tt  tt  tt  ",
  ],
  slab: [
    "             ########",
    "          ############",
    "        ################",
    "      ####################",
    "    ########################",
    "   ##########################",
    "  ############################",
    " ##############################",
    "##############################",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    " tt  tt  tt  tt  tt  tt  tt  ",
  ],
  sock: [
    "         CCCCCCCCCC",
    "        CCCCCCCCCCCC",
    "        CCC####CCCCC",
    "      ###############",
    "     #################",
    "    ###################",
    "   #####################",
    "  #######################",
    " #########################",
    "###########################",
    "ooooooooooooooooooooooooooo",
    " tt  tt  tt  tt  tt  tt   ",
  ],
};

function shade(hex: string, amount: number): string {
  const n = (hex || "#888888").replace("#", "");
  if (n.length < 6) return hex || "#888888";
  const ch = (i: number) => Math.min(255, Math.max(0, parseInt(n.slice(i, i + 2), 16) + amount));
  return `rgb(${ch(0)},${ch(2)},${ch(4)})`;
}

export type BootShape = "rustic" | "classic" | "low" | "high" | "blade" | "sock" | "laceless";

export function bootShape(designId: string, brand: string): BootShape {
  const id = designId.toLowerCase();
  if (/sock|knit/.test(id) || (brand === "electrik" && /def|hold/.test(id))) return "sock";
  if (/rustic|cleat/.test(id)) return "rustic";
  if (/def|wall|ankle/.test(id)) return "high";
  if (/classic|saddle/.test(id)) return "classic";
  if (/ghost|ping|slip|clean|laceless/.test(id)) return "laceless";
  if (brand === "electrik" && /pass/.test(id)) return "laceless";
  if (brand === "low_systems" && /pass|skill/.test(id)) return "laceless";
  if (brand === "electrik" && /speed|stream|skill/.test(id)) return "blade";
  return "low";
}

export function bootLook(designId: string, brand: string): { last: BootLast; motif: BootMotif; shape: BootShape; era: "old" | "modern" | "current" } {
  const id = designId.toLowerCase();
  const shape = bootShape(id, brand);
  const era = /cur_|_speed|_pass|_def|_bal|ghost|knit|prism/.test(id) ? "current" : /mod_|modern|stream|fin/.test(id) ? "modern" : "old";
  let motif: BootMotif = "laces";
  if (brand === "leone") motif = /bal/.test(id) ? "band" : /classic|speed|mod_skill/.test(id) ? "stripes" : /pass|control/.test(id) ? "saddle" : "laces";
  else if (brand === "electrik") motif = /bal|shape/.test(id) ? "chevron" : /def|hold/.test(id) ? "cage" : "bolt";
  else if (brand === "tapitas") motif = /bal|wave/.test(id) ? "wave" : "slash";
  else if (brand === "low_systems") motif = /control|def|band|hold/.test(id) ? "band" : "block";
  else {
    const motifs: BootMotif[] = ["stripes", "bolt", "slash", "band", "wave", "saddle"];
    motif = motifs[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % motifs.length];
  }
  const last: BootLast = shape === "blade" || shape === "laceless" ? "blade" : shape === "sock" || shape === "high" ? "sock" : shape === "rustic" ? "slab" : "round";
  return { last, motif, shape, era };
}

function detailedRows(shape: BootShape, motif: BootMotif): string[] {
  const W = 40;
  const H = 24;
  const g = Array.from({ length: H }, () => Array(W).fill(" "));
  const put = (x: number, y: number, ch: string) => {
    if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = ch;
  };
  const spec = {
    rustic: { toe: 3, toeTop: 13, vamp: 9, collarAt: 18, collarTop: 3, heelTop: 2, sole: 16, soleRows: 3, stud: 20 },
    classic: { toe: 2, toeTop: 12, vamp: 7, collarAt: 24, collarTop: 5, heelTop: 4, sole: 16, soleRows: 2, stud: 19 },
    high: { toe: 2, toeTop: 13, vamp: 9, collarAt: 14, collarTop: 1, heelTop: 0, sole: 17, soleRows: 2, stud: 20 },
    low: { toe: 2, toeTop: 12, vamp: 7, collarAt: 26, collarTop: 6, heelTop: 5, sole: 16, soleRows: 2, stud: 19 },
    blade: { toe: 0, toeTop: 13, vamp: 8, collarAt: 28, collarTop: 8, heelTop: 7, sole: 16, soleRows: 1, stud: 18 },
    sock: { toe: 2, toeTop: 12, vamp: 7, collarAt: 12, collarTop: 1, heelTop: 0, sole: 17, soleRows: 2, stud: 20 },
    laceless: { toe: 2, toeTop: 12, vamp: 8, collarAt: 27, collarTop: 7, heelTop: 6, sole: 16, soleRows: 2, stud: 19 },
  }[shape];

  for (let x = spec.toe; x <= 36; x++) {
    let top = spec.vamp;
    const into = x - spec.toe;
    if (into < 4) top = spec.toeTop - into * 2;
    if (x >= spec.collarAt) top = spec.collarTop;
    if (x >= 33) top = spec.heelTop;
    for (let y = top; y < spec.sole; y++) put(x, y, y === top ? "h" : "b");
    if (x >= 33) {
      for (let y = top; y < spec.sole; y++) put(x, y, shape === "sock" ? "C" : "K");
    }
  }

  if (shape === "classic") {
    for (let x = 14; x <= 20; x++) for (let y = 3; y <= spec.vamp; y++) put(x, y, y === 3 ? "h" : "b");
  }
  if (shape === "sock") {
    for (let x = 14; x <= 32; x++) for (let y = 1; y <= 4; y++) if (g[y][x] !== " ") put(x, y, "C");
  }

  for (let row = 0; row < spec.soleRows; row++) {
    for (let x = spec.toe; x <= 36; x++) put(x, spec.sole + row, row === spec.soleRows - 1 ? "O" : "o");
  }
  const studs = shape === "rustic" ? 6 : 8;
  for (let i = 0; i < studs; i++) {
    const x = spec.toe + 2 + i * 4;
    put(x, spec.stud, "t");
    put(x + 1, spec.stud, "t");
    if (shape === "rustic" || shape === "high") put(x, spec.stud + 1, "t");
  }

  const laceBar = (y: number, x0: number, x1: number) => {
    for (let x = x0; x <= x1; x++) put(x, y, "L");
    put(x0 - 1, y, "L");
    put(x1 + 1, y, "L");
  };
  if (shape === "classic") {
    laceBar(4, 13, 21);
    laceBar(6, 12, 21);
    laceBar(8, 11, 20);
    laceBar(10, 11, 19);
  } else if (shape === "rustic") {
    laceBar(10, 12, 22);
    laceBar(12, 12, 22);
    laceBar(14, 13, 21);
    for (let x = 8; x <= 12; x++) put(x, 14, "n");
  } else if (shape === "high") {
    laceBar(4, 12, 18);
    laceBar(6, 11, 18);
    laceBar(8, 11, 18);
    laceBar(10, 12, 18);
    laceBar(12, 12, 17);
  } else if (shape === "low") {
    for (let y = 8; y <= 11; y++) if (y % 2 === 0) laceBar(y, 11, 16);
  } else if (shape === "blade") {
    laceBar(10, 12, 16);
  }

  const mark = (x: number, y: number) => {
    if (g[y]?.[x] === "b" || g[y]?.[x] === "h") put(x, y, "M");
  };
  if (motif === "stripes") {
    for (let y = 8; y <= 15; y++) {
      mark(24, y);
      mark(26, y);
      mark(28, y);
    }
  } else if (motif === "bolt") {
    for (let i = 0; i < 8; i++) {
      mark(20 + i, 14 - Math.floor(i / 2));
      mark(21 + i, 14 - Math.floor(i / 2));
    }
  } else if (motif === "slash") {
    for (let i = 0; i < 10; i++) {
      mark(18 + i, 15 - Math.floor(i / 2));
      mark(18 + i, 14 - Math.floor(i / 2));
    }
  } else if (motif === "saddle") {
    for (let y = 9; y <= 15; y++) for (let x = 22; x <= 30; x++) if ((x + y) % 2 === 0) mark(x, y);
  } else if (motif === "band") {
    for (let x = 16; x <= 32; x++) mark(x, 13);
  } else if (motif === "wave") {
    for (let x = 16; x <= 32; x++) mark(x, 12 + (Math.floor(x / 2) % 2));
  } else if (motif === "chevron" || motif === "cage") {
    for (let y = 9; y <= 15; y++) for (let x = 22; x <= 32; x += motif === "cage" ? 2 : 3) mark(x, y);
  } else if (motif === "block") {
    for (let y = 10; y <= 14; y++) for (let x = 26; x <= 32; x++) mark(x, y);
  }
  return g.map((row) => row.join(""));
}

function blit(ctx: CanvasRenderingContext2D, rows: readonly string[], colors: readonly string[], px: number, ox: number, oy: number) {
  const [c0, c1, c2] = colors;
  const body = c0 || "#f4f1ea";
  const mark = c1 || "#111827";
  const sole = c2 || shade(mark, -20);
  const ink = "#111111";
  const grid = rows.map((row) => row.split(""));
  const colorAt = (ch: string, y: number) => {
    if (ch === " " || ch === ".") return "";
    if (ch === "t") return ink;
    if (ch === "o" || ch === "P") return ch === "P" ? shade(sole, 30) : sole;
    if (ch === "O") return shade(sole, -25);
    if (ch === "M" || ch === "K" || ch === "T" || ch === "C") return mark;
    if (ch === "L") return "#1c1917";
    if (ch === "n") return shade(body, -30);
    if (ch === "h" || ch === "H") return shade(body, 36);
    if (y < 5) return shade(body, 18);
    if (y > 8) return shade(body, -22);
    return body;
  };

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const color = colorAt(grid[y][x], y);
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x * px, oy + y * px, px, px);
    }
  }
  ctx.fillStyle = ink;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (colorAt(grid[y][x], y)) continue;
      const touch = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const ny = y + dy;
        const nx = x + dx;
        return ny >= 0 && nx >= 0 && ny < grid.length && nx < grid[ny].length && !!colorAt(grid[ny][nx], ny);
      });
      if (touch) ctx.fillRect(ox + x * px, oy + y * px, px, px);
    }
  }
}

function drawSimple(ctx: CanvasRenderingContext2D, width: number, height: number, shape: BootShape, colors: readonly string[]) {
  const last: BootLast = shape === "high" || shape === "sock" ? "sock" : shape === "rustic" ? "slab" : shape === "blade" || shape === "laceless" ? "blade" : "round";
  const rows = SIMPLE[last];
  const gridW = Math.max(...rows.map((row) => row.length));
  const px = Math.max(1, Math.floor(Math.min(width / (gridW + 2), height / (rows.length + 2))));
  const ox = Math.floor((width - gridW * px) / 2);
  const oy = Math.floor((height - rows.length * px) / 2);
  const body = colors[0] || "#f8fafc";
  const mark = colors[1] || "#111827";
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === " ") continue;
      ctx.fillStyle = ch === "o" || ch === "O" ? shade(body, -40) : ch === "t" ? "#111" : ch === "C" ? mark : body;
      ctx.fillRect(ox + x * px, oy + y * px, px, px);
    }
  }
  if (shape === "classic" || shape === "high" || shape === "rustic") {
    ctx.fillStyle = "#1c1917";
    ctx.fillRect(ox + px * 6, oy + px * 3, px * 5, px);
  }
}

/** Side preview uses the drawn boot. Match uses the small last. */
export function drawPixelBoot(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brand: string,
  designId: string,
  colors: readonly string[],
  detailed: boolean,
) {
  const { last, motif, shape } = bootLook(designId, brand);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  if (!detailed) {
    drawSimple(ctx, width, height, shape, colors);
    return;
  }
  const rows = detailedRows(shape, motif);
  const gridW = Math.max(...rows.map((row) => row.length));
  const px = Math.max(4, Math.floor(Math.min((width - 16) / gridW, (height - 16) / rows.length)));
  const ox = Math.floor((width - gridW * px) / 2);
  const oy = Math.floor((height - rows.length * px) / 2);
  blit(ctx, rows, colors, px, ox, oy);
}
