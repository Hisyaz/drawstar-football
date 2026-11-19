export const KIT_COLORS = [
  { id: "black", label: "Black", hex: "#111111" },
  { id: "white", label: "White", hex: "#f8fafc" },
  { id: "red", label: "Red", hex: "#dc2626" },
  { id: "blue", label: "Blue", hex: "#2563eb" },
  { id: "yellow", label: "Yellow", hex: "#facc15" },
  { id: "grey", label: "Grey", hex: "#6b7280" },
  { id: "dark_grey", label: "Dark Grey", hex: "#374151" },
  { id: "light_grey", label: "Light Grey", hex: "#d1d5db" },
  { id: "brown", label: "Brown", hex: "#7c4a2d" },
  { id: "light_brown", label: "Light Brown", hex: "#c4a574" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "purple", label: "Purple", hex: "#7c3aed" },
  { id: "green", label: "Green", hex: "#16a34a" },
  { id: "sky", label: "Sky Blue", hex: "#38bdf8" },
  { id: "lime", label: "Lime", hex: "#84cc16" },
  { id: "pink", label: "Pink", hex: "#f9a8d4" },
  { id: "fuchsia", label: "Fuchsia", hex: "#d946ef" },
  { id: "maroon", label: "Maroon", hex: "#7f1d1d" },
  { id: "silver", label: "Silver", hex: "#cbd5e1" },
  { id: "navy", label: "Navy Blue", hex: "#1e3a8a" },
  { id: "gold", label: "Gold", hex: "#d4af37" },
  { id: "aqua", label: "Aqua", hex: "#22d3ee" },
  { id: "slate", label: "Dark Slate Grey", hex: "#334155" },
  { id: "chocolate", label: "Chocolate", hex: "#5c3317" },
] as const;

export type KitColorId = (typeof KIT_COLORS)[number]["id"];

export function kitHex(id: KitColorId): string {
  return KIT_COLORS.find((color) => color.id === id)?.hex ?? "#f8fafc";
}
