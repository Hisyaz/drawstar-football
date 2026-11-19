import { bootDesign } from "./bootCatalog";
import { drawPixelBoot } from "./bootPixel";

export type BootPicture = "side" | "match";

const SIZE: Record<BootPicture, number> = { side: 280, match: 64 };
const cache = new Map<string, string>();

function paint(ctx: CanvasRenderingContext2D, designId: string, colors: readonly string[], kind: BootPicture, paintId?: string) {
  const design = bootDesign(designId);
  const s = SIZE[kind];
  drawPixelBoot(ctx, s, s, design.brand, designId, colors, kind === "side");
}

export function bootImageUrl(designId: string, colors: readonly string[], kind: BootPicture, paintId?: string): string {
  const key = `${kind}|${designId}|${paintId ?? ""}|${colors.join(",")}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  const s = SIZE[kind];
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  paint(ctx, designId, colors, kind, paintId);
  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}
