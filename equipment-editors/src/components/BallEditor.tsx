import { useEffect, useState } from "react";
import { BRANDS, brandAllowsEra, type BrandId } from "@/equipment/brands";
import {
  BALL_TYPES,
  designAllowsWinter,
  designsFor,
  materialById,
  resolveBall,
  slotChoices,
  type BallTypeId,
} from "@/equipment/ballCatalog";
import { ballImageUrl, type BallPicture } from "@/equipment/ballArt";
import {
  colorsForDesign,
  deleteBall,
  loadBalls,
  upsertBall,
  type SavedBall,
} from "@/equipment/ballRegistry";

function uniqueName(existing: readonly SavedBall[], base: string) {
  let name = base;
  let n = 2;
  const taken = new Set(existing.map((b) => b.name.toLowerCase()));
  while (taken.has(name.toLowerCase())) {
    name = `${base} ${n}`;
    n += 1;
  }
  return name;
}

function ballFrom(designId: string, subOptionId: string | undefined, existing: readonly SavedBall[], id?: string, name?: string, winter = false): SavedBall {
  const resolved = resolveBall(designId, subOptionId);
  const useWinter = winter && designAllowsWinter(resolved.materialId);
  return {
    id: id ?? `ball_${Date.now()}`,
    name: name ?? uniqueName(existing, resolved.design.name),
    designId: resolved.design.id,
    subOptionId: resolved.subOptionId,
    materialId: resolved.materialId,
    winter: useWinter,
    colors: colorsForDesign(resolved.design.id, [], useWinter, resolved.subOptionId),
  };
}

export function BallEditor({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(embedded);
  const [balls, setBalls] = useState<SavedBall[]>([]);
  const [draft, setDraft] = useState<SavedBall | null>(null);
  const [picture, setPicture] = useState<BallPicture>("preview");
  const [error, setError] = useState("");

  const show = () => {
    const loaded = loadBalls();
    setBalls(loaded);
    setDraft(loaded[0] ? { ...loaded[0], colors: [...loaded[0].colors] } : null);
    setError("");
    setOpen(true);
  };

  useEffect(() => {
    if (embedded) show();
    // The menu mounts this editor already open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedded]);

  const resolved = draft ? resolveBall(draft.designId, draft.subOptionId) : null;
  const material = resolved ? materialById(resolved.materialId) : null;
  const design = resolved?.design ?? null;

  const applyDesign = (designId: string, subOptionId?: string, winter = false) => {
    if (!draft) return;
    const next = ballFrom(designId, subOptionId, balls, draft.id, draft.name, winter);
    setDraft(next);
  };

  const setBrand = (brand: BrandId) => {
    const era = BALL_TYPES.find((type) => brandAllowsEra(brand, type.id) && designsFor(brand, type.id).length)?.id;
    const next = era ? designsFor(brand, era)[0] : undefined;
    if (next) applyDesign(next.id, next.subs?.[0]?.id, false);
  };

  const setType = (type: BallTypeId) => {
    if (!design) return;
    const next = designsFor(design.brand, type)[0];
    if (next) applyDesign(next.id, next.subs?.[0]?.id, !!draft?.winter && designAllowsWinter(next.materialId));
  };

  const setWinter = (winter: boolean) => {
    if (!draft || !design || !designAllowsWinter(resolved!.materialId)) return;
    setDraft({
      ...draft,
      winter,
      colors: colorsForDesign(draft.designId, draft.colors, winter, draft.subOptionId),
    });
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
      const next = upsertBall(draft);
      setBalls(next);
      const saved = next.find((b) => b.id === draft.id) ?? next[0];
      setDraft(saved ? { ...saved, colors: [...saved.colors] } : null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  const remove = () => {
    if (!draft) return;
    const next = deleteBall(draft.id);
    setBalls(next);
    setDraft(next[0] ? { ...next[0], colors: [...next[0].colors] } : null);
    setError("");
  };

  const eras = design ? BALL_TYPES.filter((type) => brandAllowsEra(design.brand, type.id)) : [];
  const designs = design && material ? designsFor(design.brand, material.type) : [];

  return (
    <>
      {!embedded && (
      <button
        type="button"
        onClick={show}
        className="fixed bottom-3 left-3 z-[80] rounded border border-amber-400/70 bg-slate-950/90 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-amber-200"
      >
        BALL EDITOR
      </button>
      )}
      {open && (
        <div className={embedded ? "text-slate-100" : "fixed inset-0 z-[90] overflow-auto bg-[#050a18]/96 p-3 text-slate-100"}>
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <h1 className="font-mono text-sm tracking-widest text-amber-200">BALL EDITOR</h1>
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
                  setDraft(ballFrom("leo_hide", undefined, balls));
                  setError("");
                }}
                className="rounded border border-amber-500/60 px-2 py-1 font-mono text-[10px] text-amber-200"
              >
                NEW BALL
              </button>
              <ul className="flex max-h-[40vh] flex-col gap-1 overflow-auto md:max-h-[70vh]">
                {balls.map((ball) => (
                  <li key={ball.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ ...ball, colors: [...ball.colors] });
                        setError("");
                      }}
                      className={`w-full rounded border px-2 py-1 text-left font-mono text-[11px] ${
                        draft?.id === ball.id ? "border-amber-400 text-amber-100" : "border-slate-700 text-slate-300"
                      }`}
                    >
                      {ball.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {draft && material && design && resolved && (
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <div>
                  <div className="flex h-40 items-center justify-center rounded border border-slate-700 bg-slate-900">
                    <img
                      alt=""
                      src={ballImageUrl(resolved.paint, draft.colors, picture)}
                      className={picture === "match" ? "h-12 w-12 [image-rendering:pixelated]" : "h-40 w-40 [image-rendering:pixelated]"}
                    />
                  </div>
                  <div className="mt-2 flex gap-1">
                    {(["preview", "match"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPicture(mode)}
                        className={`flex-1 rounded border px-1 py-1 font-mono text-[10px] uppercase ${
                          picture === mode ? "border-amber-400 text-amber-100" : "border-slate-700 text-slate-400"
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
                      value={material.type}
                      onChange={(e) => setType(e.target.value as BallTypeId)}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white"
                    >
                      {eras.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label} ({type.years})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="font-mono text-[10px] text-slate-400">
                    DESIGN
                    <select
                      value={design.id}
                      onChange={(e) => applyDesign(e.target.value, undefined, !!draft.winter)}
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
                        onChange={(e) => applyDesign(design.id, e.target.value, !!draft.winter)}
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
                  <p className="font-mono text-[10px] text-slate-500">MATERIAL · {material.name}. Colors do not change stats.</p>
                  {designAllowsWinter(resolved.materialId) && (
                    <label className="flex items-center gap-2 font-mono text-[10px] text-amber-100">
                      <input type="checkbox" checked={!!draft.winter} onChange={(e) => setWinter(e.target.checked)} />
                      WINTER
                    </label>
                  )}
                  <div className="flex flex-col gap-2">
                    {design.slots.map((slot, i) => (
                      <div key={slot.name} className="font-mono text-[10px] text-slate-400">
                        {slot.name}
                        <div className="mt-1 flex gap-1">
                          {slotChoices(slot, !!draft.winter).map((color) => (
                            <button
                              key={color}
                              type="button"
                              aria-label={color}
                              onClick={() => setColor(i, color)}
                              className={`h-6 w-6 rounded-sm border ${draft.colors[i] === color ? "border-amber-300" : "border-white/20"}`}
                              style={{ background: color }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">{material.style}</p>
                  {error && <p className="font-mono text-[11px] text-red-300">{error}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={save} className="rounded border border-amber-400 px-3 py-1 font-mono text-[10px] text-amber-100">
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
