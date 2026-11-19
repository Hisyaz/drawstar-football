import { useEffect, useState } from "react";
import { BRANDS, brandAllowsEra, type BrandId } from "@/equipment/brands";
import { bootImageUrl, type BootPicture } from "@/equipment/bootArt";
import {
  bootDesign,
  bootMaterial,
  bootPaint,
  bootsFor,
  type BootEraId,
} from "@/equipment/bootCatalog";
import { colorsForBoot, deleteBoot, loadBoots, upsertBoot, type SavedBoot } from "@/equipment/bootRegistry";

const ERAS: { id: BootEraId; label: string }[] = [
  { id: "rustic", label: "Rustic" },
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "current", label: "Current" },
];

function uniqueName(existing: readonly SavedBoot[], base: string) {
  let name = base;
  let n = 2;
  const taken = new Set(existing.map((boot) => boot.name.toLowerCase()));
  while (taken.has(name.toLowerCase())) {
    name = `${base} ${n}`;
    n += 1;
  }
  return name;
}

function bootFrom(designId: string, subOptionId: string | undefined, existing: readonly SavedBoot[], id?: string, name?: string): SavedBoot {
  const design = bootDesign(designId);
  const sub = design.subs?.find((item) => item.id === subOptionId) ?? design.subs?.[0];
  return {
    id: id ?? `boot_${Date.now()}`,
    name: name ?? uniqueName(existing, design.name),
    designId: design.id,
    subOptionId: sub?.id,
    colors: colorsForBoot(design.id),
  };
}

export function BootEditor({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(embedded);
  const [boots, setBoots] = useState<SavedBoot[]>([]);
  const [draft, setDraft] = useState<SavedBoot | null>(null);
  const [picture, setPicture] = useState<BootPicture>("side");
  const [error, setError] = useState("");

  const show = () => {
    const loaded = loadBoots();
    setBoots(loaded);
    setDraft(loaded[0] ? { ...loaded[0], colors: [...loaded[0].colors] } : null);
    setError("");
    setOpen(true);
  };

  useEffect(() => {
    if (embedded) show();
  }, [embedded]);

  const design = draft ? bootDesign(draft.designId) : null;
  const material = design ? bootMaterial(design.materialId) : null;

  const applyDesign = (designId: string, subOptionId?: string) => {
    if (!draft) return;
    setDraft(bootFrom(designId, subOptionId, boots, draft.id, draft.name));
  };

  const setBrand = (brand: BrandId) => {
    const era = ERAS.find((item) => brandAllowsEra(brand, item.id) && bootsFor(brand, item.id).length);
    const next = era ? bootsFor(brand, era.id)[0] : undefined;
    if (next) applyDesign(next.id, next.subs?.[0]?.id);
  };

  const setEra = (era: BootEraId) => {
    if (!design) return;
    const next = bootsFor(design.brand, era)[0];
    if (next) applyDesign(next.id, next.subs?.[0]?.id);
  };

  const setColor = (index: number, value: string) => {
    if (!draft) return;
    const colors = [...draft.colors];
    colors[index] = value;
    setDraft({ ...draft, colors });
  };

  const save = () => {
    if (!draft) return;
    try {
      const next = upsertBoot(draft);
      setBoots(next);
      const saved = next.find((boot) => boot.id === draft.id) ?? next[0];
      setDraft(saved ? { ...saved, colors: [...saved.colors] } : null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  const remove = () => {
    if (!draft) return;
    const next = deleteBoot(draft.id);
    setBoots(next);
    setDraft(next[0] ? { ...next[0], colors: [...next[0].colors] } : null);
    setError("");
  };

  const eras = design ? ERAS.filter((era) => brandAllowsEra(design.brand, era.id)) : [];
  const designs = design ? bootsFor(design.brand, design.era) : [];

  return (
    <>
      {!embedded && (
      <button
        type="button"
        onClick={show}
        className="fixed bottom-3 left-28 z-[80] rounded border border-sky-400/70 bg-slate-950/90 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-sky-200"
      >
        BOOT EDITOR
      </button>
      )}
      {open && (
        <div className={embedded ? "text-slate-100" : "fixed inset-0 z-[90] overflow-auto bg-[#050a18]/96 p-3 text-slate-100"}>
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <h1 className="font-mono text-sm tracking-widest text-sky-200">BOOT EDITOR</h1>
            {!embedded && (
            <button type="button" onClick={() => setOpen(false)} className="rounded border border-slate-600 px-2 py-1 font-mono text-[10px]">
              CLOSE
            </button>
            )}
          </div>
          <div className="mx-auto mt-3 grid max-w-5xl gap-3 md:grid-cols-[220px_1fr]">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(bootFrom("leo_rustic", undefined, boots));
                  setError("");
                }}
                className="rounded border border-sky-500/60 px-2 py-1 font-mono text-[10px] text-sky-200"
              >
                NEW BOOT
              </button>
              <ul className="flex max-h-[40vh] flex-col gap-1 overflow-auto md:max-h-[70vh]">
                {boots.map((boot) => (
                  <li key={boot.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ ...boot, colors: [...boot.colors] });
                        setError("");
                      }}
                      className={`w-full rounded border px-2 py-1 text-left font-mono text-[11px] ${
                        draft?.id === boot.id ? "border-sky-400 text-sky-100" : "border-slate-700 text-slate-300"
                      }`}
                    >
                      {boot.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {draft && design && material && (
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <div>
                  <div className="flex h-40 items-center justify-center rounded border border-slate-700 bg-slate-900">
                    <img
                      alt=""
                      src={bootImageUrl(design.id, draft.colors, picture, bootPaint(design.id, draft.subOptionId))}
                      className={picture === "match" ? "h-12 w-12 [image-rendering:pixelated]" : "h-44 w-44 [image-rendering:pixelated]"}
                    />
                  </div>
                  <div className="mt-2 flex gap-1">
                    {(["side", "match"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPicture(mode)}
                        className={`flex-1 rounded border px-1 py-1 font-mono text-[10px] uppercase ${
                          picture === mode ? "border-sky-400 text-sky-100" : "border-slate-700 text-slate-400"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-slate-400">
                    NAME
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white"
                    />
                  </label>
                  <label className="font-mono text-[10px] text-slate-400">
                    BRAND
                    <select
                      value={design.brand}
                      onChange={(e) => setBrand(e.target.value as BrandId)}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white"
                    >
                      {BRANDS.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="font-mono text-[10px] text-slate-400">
                    TYPE
                    <select
                      value={design.era}
                      onChange={(e) => setEra(e.target.value as BootEraId)}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white"
                    >
                      {eras.map((era) => (
                        <option key={era.id} value={era.id}>
                          {era.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="font-mono text-[10px] text-slate-400">
                    DESIGN
                    <select
                      value={design.id}
                      onChange={(e) => applyDesign(e.target.value)}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white"
                    >
                      {designs.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {design.subs && (
                    <label className="font-mono text-[10px] text-slate-400">
                      PATTERN
                      <select
                        value={draft.subOptionId ?? design.subs[0].id}
                        onChange={(e) => applyDesign(design.id, e.target.value)}
                        className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white"
                      >
                        {design.subs.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <p className="font-mono text-[10px] text-slate-500">
                    MATERIAL · {material.name}. {design.role}. Colors do not change stats.
                  </p>
                  <div className="flex flex-col gap-2">
                    {design.slots.map((slot, i) => (
                      <div key={slot.name} className="font-mono text-[10px] text-slate-400">
                        {slot.name}
                        <div className="mt-1 flex gap-1">
                          {slot.colors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              aria-label={color}
                              onClick={() => setColor(i, color)}
                              className={`h-6 w-6 rounded-sm border ${draft.colors[i] === color ? "border-sky-300" : "border-white/20"}`}
                              style={{ background: color }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {error && <p className="font-mono text-[11px] text-red-300">{error}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={save} className="rounded border border-sky-400 px-3 py-1 font-mono text-[10px] text-sky-100">
                      SAVE
                    </button>
                    <button type="button" onClick={remove} className="rounded border border-slate-600 px-3 py-1 font-mono text-[10px] text-slate-300">
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
