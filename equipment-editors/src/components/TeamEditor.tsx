import { useEffect, useState } from "react";
import { BRANDS, type BrandId } from "@/equipment/brands";
import { KIT_COLORS, type KitColorId } from "@/equipment/kitPalette";
import { shirtImageUrl } from "@/equipment/shirtArt";
import { deleteTeam, loadTeams, setKit, upsertTeam } from "@/equipment/teamRegistry";
import {
  BORDERS,
  COLLARS,
  CUFFS,
  FONTS,
  KIT_SLOTS,
  PATTERNS,
  blankShirt,
  type ClubTeam,
  type KitSlot,
  type ShirtDesign,
} from "@/equipment/uniformCatalog";

function uniqueName(existing: readonly ClubTeam[]) {
  let name = "New Club";
  let n = 2;
  const taken = new Set(existing.map((team) => team.name.toLowerCase()));
  while (taken.has(name.toLowerCase())) {
    name = `New Club ${n}`;
    n += 1;
  }
  return name;
}

function colorSelect(value: KitColorId, onChange: (id: KitColorId) => void) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as KitColorId)}
      className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-[11px] text-white"
    >
      {KIT_COLORS.map((color) => (
        <option key={color.id} value={color.id}>
          {color.label}
        </option>
      ))}
    </select>
  );
}

export function TeamEditor({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(embedded);
  const [teams, setTeams] = useState<ClubTeam[]>([]);
  const [draft, setDraft] = useState<ClubTeam | null>(null);
  const [slot, setSlot] = useState<KitSlot>("home");
  const [error, setError] = useState("");

  const show = () => {
    const loaded = loadTeams();
    setTeams(loaded);
    setDraft(loaded[0] ? structuredClone(loaded[0]) : null);
    setSlot("home");
    setError("");
    setOpen(true);
  };

  useEffect(() => {
    if (embedded) show();
  }, [embedded]);

  const shirt = draft?.kits[slot] ?? null;

  const patch = (partial: Partial<ShirtDesign>) => {
    if (!draft || !shirt) return;
    setDraft(setKit(draft, slot, { ...shirt, ...partial }));
  };

  const save = () => {
    if (!draft) return;
    try {
      const next = upsertTeam(draft);
      setTeams(next);
      setDraft(structuredClone(next.find((team) => team.id === draft.id) ?? next[0]));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  return (
    <>
      {!embedded && (
        <button type="button" onClick={show} className="fixed bottom-3 left-3 z-[80] font-mono text-[10px] text-amber-100">
          TEAMS
        </button>
      )}
      {open && draft && (
        <div className={embedded ? "text-slate-100" : "fixed inset-0 z-[90] overflow-auto bg-[#050a18] p-3 text-slate-100"}>
          <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-[200px_180px_1fr]">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const team: ClubTeam = {
                    id: `club_${Date.now()}`,
                    name: uniqueName(teams),
                    brand: "generic",
                    kits: {
                      home: blankShirt({ sponsor: "HOME" }),
                      away: blankShirt({ base: "white", patternColor: "navy", collarColor: "navy", sponsor: "AWAY" }),
                      gk: blankShirt({ base: "lime", patternColor: "black", collarColor: "black", sponsor: "GK" }),
                    },
                  };
                  setDraft(team);
                }}
                className="rounded border border-amber-500/60 px-2 py-1 font-mono text-[10px] text-amber-200"
              >
                NEW CLUB
              </button>
              <ul className="flex max-h-[40vh] flex-col gap-1 overflow-auto md:max-h-[70vh]">
                {teams.map((team) => (
                  <li key={team.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(structuredClone(team));
                        setSlot("home");
                      }}
                      className={`w-full rounded border px-2 py-1 text-left font-mono text-[11px] ${
                        draft.id === team.id ? "border-amber-400 text-amber-100" : "border-slate-700 text-slate-300"
                      }`}
                    >
                      {team.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex h-52 items-center justify-center rounded border border-slate-700 bg-slate-900">
                {shirt && <img alt="" src={shirtImageUrl(shirt, draft.brand, "preview")} className="h-48 [image-rendering:pixelated]" />}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {KIT_SLOTS.filter((item) => item.required || draft.kits[item.id]).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSlot(item.id)}
                    className={`rounded border px-1 py-1 font-mono text-[9px] ${slot === item.id ? "border-amber-300 text-amber-100" : "border-slate-700 text-slate-400"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                {!draft.kits.third && (
                  <button type="button" className="font-mono text-[9px] text-slate-400" onClick={() => setDraft(setKit(draft, "third", blankShirt({ base: "maroon", sponsor: "THIRD" })))}>
                    + THIRD
                  </button>
                )}
                {!draft.kits.gk2 && (
                  <button type="button" className="font-mono text-[9px] text-slate-400" onClick={() => setDraft(setKit(draft, "gk2", blankShirt({ base: "orange", sponsor: "GK2" })))}>
                    + GK 2
                  </button>
                )}
              </div>
            </div>
            {shirt && (
              <div className="grid grid-cols-2 gap-2">
                <label className="col-span-2 font-mono text-[10px] text-slate-400">
                  CLUB
                  <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white" />
                </label>
                <label className="col-span-2 font-mono text-[10px] text-slate-400">
                  BRAND
                  <select value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value as BrandId })} className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white">
                    {BRANDS.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.label}</option>
                    ))}
                  </select>
                </label>
                <label className="font-mono text-[10px] text-slate-400">COLLAR
                  <select value={shirt.collar} onChange={(e) => patch({ collar: e.target.value as ShirtDesign["collar"] })} className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-[11px] text-white">
                    {COLLARS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label className="font-mono text-[10px] text-slate-400">PATTERN
                  <select value={shirt.pattern} onChange={(e) => patch({ pattern: e.target.value as ShirtDesign["pattern"] })} className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-[11px] text-white">
                    {PATTERNS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label className="font-mono text-[10px] text-slate-400">BASE{colorSelect(shirt.base, (base) => patch({ base }))}</label>
                <label className="font-mono text-[10px] text-slate-400">BASE 2{colorSelect(shirt.base2, (base2) => patch({ base2 }))}</label>
                <label className="font-mono text-[10px] text-slate-400">PATTERN COLOR{colorSelect(shirt.patternColor, (patternColor) => patch({ patternColor }))}</label>
                <label className="font-mono text-[10px] text-slate-400">COLLAR COLOR{colorSelect(shirt.collarColor, (collarColor) => patch({ collarColor }))}</label>
                <label className="font-mono text-[10px] text-slate-400">CUFF
                  <select value={shirt.cuff} onChange={(e) => patch({ cuff: e.target.value as ShirtDesign["cuff"] })} className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-[11px] text-white">
                    {CUFFS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label className="font-mono text-[10px] text-slate-400">CUFF COLOR{colorSelect(shirt.cuffColor, (cuffColor) => patch({ cuffColor }))}</label>
                <label className="col-span-2 font-mono text-[10px] text-slate-400">CHEST SPONSOR
                  <input value={shirt.sponsor} onChange={(e) => patch({ sponsor: e.target.value })} className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white" />
                </label>
                <label className="font-mono text-[10px] text-slate-400">TYPOGRAPHY
                  <select value={shirt.font} onChange={(e) => patch({ font: e.target.value as ShirtDesign["font"] })} className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-[11px] text-white">
                    {FONTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label className="font-mono text-[10px] text-slate-400">LETTER COLOR{colorSelect(shirt.letterColor, (letterColor) => patch({ letterColor }))}</label>
                <label className="font-mono text-[10px] text-slate-400">BORDER
                  <select value={shirt.border} onChange={(e) => patch({ border: e.target.value as ShirtDesign["border"] })} className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-[11px] text-white">
                    {BORDERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
                <label className="font-mono text-[10px] text-slate-400">BORDER COLOR{colorSelect(shirt.borderColor, (borderColor) => patch({ borderColor }))}</label>
                {error && <p className="col-span-2 font-mono text-[11px] text-red-300">{error}</p>}
                <div className="col-span-2 flex gap-2">
                  <button type="button" onClick={save} className="rounded border border-amber-400 px-3 py-1 font-mono text-[10px] text-amber-100">SAVE</button>
                  <button type="button" onClick={() => { const next = deleteTeam(draft.id); setTeams(next); setDraft(structuredClone(next[0])); }} className="rounded border border-slate-600 px-3 py-1 font-mono text-[10px] text-slate-300">DELETE</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
