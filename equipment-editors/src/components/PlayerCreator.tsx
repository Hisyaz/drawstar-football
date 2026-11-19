import { useEffect, useState } from "react";
import { bootDesign, bootPaint } from "@/equipment/bootCatalog";
import { bootImageUrl } from "@/equipment/bootArt";
import { loadBoots } from "@/equipment/bootRegistry";
import { statsWithBoots } from "@/equipment/playerEffects";
import {
  deletePlayer,
  getSelectedPlayer,
  loadPlayers,
  setSelectedPlayerId,
  upsertPlayer,
  type SavedPlayer,
} from "@/equipment/playerRegistry";

const FIELDS: { key: keyof SavedPlayer; label: string }[] = [
  { key: "speed", label: "SPEED" },
  { key: "sprintSpeed", label: "SPRINT" },
  { key: "shotPower", label: "POWER" },
  { key: "passing", label: "PASSING" },
  { key: "dribbling", label: "DRIBBLE" },
  { key: "tackling", label: "TACKLE" },
  { key: "heading", label: "HEADING" },
];

function blank(existing: readonly SavedPlayer[]): SavedPlayer {
  const taken = new Set(existing.map((player) => player.name.toLowerCase()));
  let name = "New Player";
  let n = 2;
  while (taken.has(name.toLowerCase())) {
    name = `New Player ${n}`;
    n += 1;
  }
  return {
    id: `player_${Date.now()}`,
    name,
    speed: 70,
    sprintSpeed: 70,
    shotPower: 70,
    passing: 70,
    tackling: 60,
    heading: 64,
    dribbling: 70,
    bootId: loadBoots()[0]?.id ?? "",
  };
}

export function PlayerCreator({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(embedded);
  const [players, setPlayers] = useState<SavedPlayer[]>([]);
  const [draft, setDraft] = useState<SavedPlayer | null>(null);
  const [error, setError] = useState("");

  const show = () => {
    const loaded = loadPlayers();
    const selected = getSelectedPlayer();
    setPlayers(loaded);
    setDraft({ ...selected });
    setError("");
    setOpen(true);
  };

  useEffect(() => {
    if (embedded) show();
  }, [embedded]);

  const boots = loadBoots();
  const boot = boots.find((item) => item.id === draft?.bootId) ?? boots[0];
  const design = boot ? bootDesign(boot.designId) : null;
  const rated = draft ? statsWithBoots(draft) : null;

  const save = () => {
    if (!draft) return;
    try {
      const next = upsertPlayer(draft);
      setPlayers(next);
      setSelectedPlayerId(draft.id);
      const saved = next.find((player) => player.id === draft.id) ?? next[0];
      setDraft(saved ? { ...saved } : null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  };

  const remove = () => {
    if (!draft) return;
    const next = deletePlayer(draft.id);
    setPlayers(next);
    setSelectedPlayerId(next[0].id);
    setDraft({ ...next[0] });
    setError("");
  };

  return (
    <>
      {!embedded && (
      <button
        type="button"
        onClick={show}
        className="fixed bottom-3 left-52 z-[80] rounded border border-emerald-400/70 bg-slate-950/90 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-emerald-200"
      >
        PLAYER
      </button>
      )}
      {open && draft && (
        <div className={embedded ? "text-slate-100" : "fixed inset-0 z-[90] overflow-auto bg-[#050a18]/96 p-3 text-slate-100"}>
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <h1 className="font-mono text-sm tracking-widest text-emerald-200">PLAYER CREATOR</h1>
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
                  setDraft(blank(players));
                  setError("");
                }}
                className="rounded border border-emerald-500/60 px-2 py-1 font-mono text-[10px] text-emerald-200"
              >
                NEW PLAYER
              </button>
              <ul className="flex max-h-[40vh] flex-col gap-1 overflow-auto md:max-h-[70vh]">
                {players.map((player) => (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ ...player });
                        setError("");
                      }}
                      className={`w-full rounded border px-2 py-1 text-left font-mono text-[11px] ${
                        draft.id === player.id ? "border-emerald-400 text-emerald-100" : "border-slate-700 text-slate-300"
                      }`}
                    >
                      {player.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <div className="flex h-36 items-center justify-center rounded border border-slate-700 bg-slate-900">
                {boot && design && (
                  <img alt="" className="h-28 w-28" src={bootImageUrl(design.id, boot.colors, "side", bootPaint(design.id, boot.subOptionId))} />
                )}
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {FIELDS.map((field) => (
                    <label key={field.key} className="font-mono text-[10px] text-slate-400">
                      {field.label}
                      <input
                        type="number"
                        min={40}
                        max={99}
                        value={Number(draft[field.key])}
                        onChange={(e) => setDraft({ ...draft, [field.key]: Number(e.target.value) })}
                        className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white"
                      />
                    </label>
                  ))}
                </div>
                <label className="font-mono text-[10px] text-slate-400">
                  BOOTS
                  <select
                    value={draft.bootId}
                    onChange={(e) => setDraft({ ...draft, bootId: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-white"
                  >
                    {boots.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                {rated && (
                  <p className="font-mono text-[10px] text-slate-500">
                    IN MATCH · SPD {rated.speed} · SPRINT {rated.sprintSpeed} · POW {rated.shotPower} · PASS {rated.passing} · DRIBBLE {rated.dribbling}
                  </p>
                )}
                {error && <p className="font-mono text-[11px] text-red-300">{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={save} className="rounded border border-emerald-400 px-3 py-1 font-mono text-[10px] text-emerald-100">
                    SAVE
                  </button>
                  <button type="button" onClick={remove} className="rounded border border-slate-600 px-3 py-1 font-mono text-[10px] text-slate-300">
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
