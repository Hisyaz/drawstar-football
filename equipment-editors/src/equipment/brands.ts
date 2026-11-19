export type BrandId = "leone" | "electrik" | "tapitas" | "low_systems" | "generic";

export const BRANDS: readonly { id: BrandId; label: string; note: string }[] = [
  { id: "leone", label: "Leone", note: "Classic shape, even on a new boot" },
  { id: "electrik", label: "Electrik", note: "Modern, loud, built to be seen" },
  { id: "tapitas", label: "Tapitas", note: "Old patterns mixed with new ones" },
  { id: "low_systems", label: "Low Systems", note: "New brand. Simple, made to perform" },
  { id: "generic", label: "Generic", note: "No brand. One last per era, more choices" },
];

export function brandAllowsEra(brand: BrandId, era: string): boolean {
  if (brand === "low_systems") return era === "modern" || era === "current";
  return true;
}

export function brandLabel(id: BrandId): string {
  return BRANDS.find((b) => b.id === id)?.label ?? id;
}
