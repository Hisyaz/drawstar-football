import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, UserRound, Users } from 'lucide-react';
import { PRESET_PLAYERS } from '../../constants';
import { PlayerCardData } from '../../types';
import { LeagueDatabase, ManagerStudioRecord } from '../../types/leagueEditor';
import { createDefaultAppearanceV2 } from '../../gameplay/game/appearanceV2';
import { CANONICAL_PLAYSTYLES, FORMATION_LIST, getDefaultTactics } from '../../gameplay/game/formations';
import { saveLeagueDatabase } from '../../utils/leagueDatabaseSystem';
import { applyAppearanceV2ToPlayerCard, playerCardToAppearanceV2 } from '../../utils/gameplayAdapter';
import { CardControls } from '../CardControls';
import { PlayerFacePortrait } from '../PlayerFacePortrait';
import { CaptainFullBodyPreview } from '../CaptainFullBodyPreview';
import { InMatchSpritePreview } from '../InMatchSpritePreview';

interface Props {
  leagueDb: LeagueDatabase;
  onUpdateDb: (db: LeagueDatabase) => void;
  showToast: (message: string) => void;
}

const makeManagerId = (records: Record<string, ManagerStudioRecord>) => {
  let id = '';
  do {
    id = `manager_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  } while (records[id] || Object.values(records).some((record) => record.id === id));
  return id;
};

const newManager = (records: Record<string, ManagerStudioRecord>, teamId?: string): ManagerStudioRecord => ({
  id: makeManagerId(records),
  name: 'New Manager', nationality: 'ENG', age: 45,
  teamId,
  appearanceV2: createDefaultAppearanceV2(), attire: 'full_suit',
  jacketColor: '#172554', shirtColor: '#f8fafc', tieColor: '#b91c1c', pantsColor: '#0f172a',
  preferredPlaystyle: 'possession', preferredFormation: '4-3-3', tactics: getDefaultTactics('possession'),
});

const mapManagerPlaystyle = (style?: string): ManagerStudioRecord['preferredPlaystyle'] => {
  const aliases: Record<string, ManagerStudioRecord['preferredPlaystyle']> = {
    counter_attack: 'counterattack', long_balls: 'long_ball', gegenpressing: 'gegenpress',
  };
  return aliases[style || ''] || (style as ManagerStudioRecord['preferredPlaystyle']) || 'possession';
};

/** Migrate team-embedded managers into ID-linked Manager Studio profiles. */
const ensureTeamManagerProfiles = (db: LeagueDatabase): LeagueDatabase | null => {
  const managers = { ...(db.managers || {}) };
  const teams = { ...db.teams };
  const occupiedIds = new Set([
    ...Object.keys(managers),
    ...Object.values(managers).map((manager) => manager.id),
  ]);
  let changed = false;

  Object.values(teams).forEach((team) => {
    const linkedById = team.managerId ? managers[team.managerId] : undefined;
    const matching = Object.values(managers).find((manager) => manager.teamId === team.id);
    let manager = linkedById && (!linkedById.teamId || linkedById.teamId === team.id)
      ? linkedById
      : matching;
    if (manager?.teamId && manager.teamId !== team.id) manager = undefined;

    if (!manager) {
      const candidate = team.managerId || `manager_team_${team.id}`;
      let id = candidate;
      let suffix = 2;
      while (occupiedIds.has(id)) id = `${candidate}_${suffix++}`;
      occupiedIds.add(id);
      const legacy = team.manager;
      const style = mapManagerPlaystyle(legacy?.primaryTactic?.playstyle || legacy?.primaryTactic?.style);
      const defaults = getDefaultTactics(style);
      manager = {
        id,
        name: legacy?.name || `Manager ${team.shortName || team.id}`,
        nationality: legacy?.nationality || team.countryCode || 'ENG',
        age: legacy?.age || 45,
        teamId: team.id,
        appearanceV2: createDefaultAppearanceV2(),
        attire: 'full_suit',
        jacketColor: '#172554', shirtColor: '#f8fafc', tieColor: '#b91c1c', pantsColor: '#0f172a',
        preferredPlaystyle: style,
        preferredFormation: (legacy?.primaryTactic?.formation || '4-3-3') as ManagerStudioRecord['preferredFormation'],
        tactics: {
          ...defaults,
          defensiveLine: (legacy?.primaryTactic?.defensiveLine || defaults.defensiveLine) as ManagerStudioRecord['tactics']['defensiveLine'],
          defensiveStyle: (legacy?.primaryTactic?.defensiveStyle || defaults.defensiveStyle) as ManagerStudioRecord['tactics']['defensiveStyle'],
          offsideTrap: legacy?.primaryTactic?.offsideTrap === 'YES',
          compactness: (legacy?.primaryTactic?.compactness || defaults.compactness) as ManagerStudioRecord['tactics']['compactness'],
          creation: (legacy?.primaryTactic?.passingStyle || defaults.creation) as ManagerStudioRecord['tactics']['creation'],
          finalThird: (legacy?.primaryTactic?.finalThirdApproach || defaults.finalThird) as ManagerStudioRecord['tactics']['finalThird'],
          shape: (legacy?.primaryTactic?.teamShape || defaults.shape) as ManagerStudioRecord['tactics']['shape'],
          runs: (legacy?.primaryTactic?.attackingSupport || defaults.runs) as ManagerStudioRecord['tactics']['runs'],
        },
      };
      managers[id] = manager;
      changed = true;
    } else {
      const primary = team.manager?.primaryTactic;
      const style = mapManagerPlaystyle(primary?.playstyle || primary?.style || manager.preferredPlaystyle);
      const defaults = getDefaultTactics(style);
      const synchronized: ManagerStudioRecord = {
        ...manager,
        id: manager.id,
        teamId: team.id,
        name: team.manager?.name || manager.name,
        nationality: team.manager?.nationality || manager.nationality,
        age: team.manager?.age || manager.age,
        preferredPlaystyle: style,
        preferredFormation: (primary?.formation || manager.preferredFormation || '4-3-3') as ManagerStudioRecord['preferredFormation'],
        tactics: primary ? {
          ...manager.tactics,
          defensiveLine: (primary.defensiveLine || defaults.defensiveLine) as ManagerStudioRecord['tactics']['defensiveLine'],
          defensiveStyle: (primary.defensiveStyle || defaults.defensiveStyle) as ManagerStudioRecord['tactics']['defensiveStyle'],
          offsideTrap: primary.offsideTrap === 'YES',
          compactness: (primary.compactness || defaults.compactness) as ManagerStudioRecord['tactics']['compactness'],
          creation: (primary.passingStyle || defaults.creation) as ManagerStudioRecord['tactics']['creation'],
          finalThird: (primary.finalThirdApproach || defaults.finalThird) as ManagerStudioRecord['tactics']['finalThird'],
          shape: (primary.teamShape || defaults.shape) as ManagerStudioRecord['tactics']['shape'],
          runs: (primary.attackingSupport || defaults.runs) as ManagerStudioRecord['tactics']['runs'],
        } : manager.tactics || defaults,
      };
      if (JSON.stringify(manager) !== JSON.stringify(synchronized)) {
        manager = synchronized;
        managers[manager.id] = manager;
        changed = true;
      }
    }

    if (team.managerId !== manager.id) {
      teams[team.id] = { ...team, managerId: manager.id };
      changed = true;
    }
    const linkedTeam = teams[team.id];
    const oldProfile = linkedTeam.manager;
    const managerVisuals = {
      id: manager.id,
      appearanceV2: manager.appearanceV2,
      attire: manager.attire,
      jacketColor: manager.jacketColor,
      shirtColor: manager.shirtColor,
      tieColor: manager.tieColor,
      pantsColor: manager.pantsColor,
    };
    if (JSON.stringify({ id: oldProfile?.id, appearanceV2: oldProfile?.appearanceV2, attire: oldProfile?.attire, jacketColor: oldProfile?.jacketColor, shirtColor: oldProfile?.shirtColor, tieColor: oldProfile?.tieColor, pantsColor: oldProfile?.pantsColor }) !== JSON.stringify(managerVisuals)) {
      teams[team.id] = {
        ...linkedTeam,
        manager: { ...linkedTeam.manager, name: manager.name, nationality: manager.nationality, age: manager.age, ...managerVisuals },
      };
      changed = true;
    }
    Object.values(managers).forEach((otherManager) => {
      if (otherManager.id !== manager?.id && otherManager.teamId === team.id) {
        managers[otherManager.id] = { ...otherManager, teamId: undefined };
        changed = true;
      }
    });
  });

  return changed ? { ...db, managers, teams } : null;
};

const hydrateManager = (manager: ManagerStudioRecord): ManagerStudioRecord => ({
  ...manager,
  preferredPlaystyle: manager.preferredPlaystyle || 'possession',
  preferredFormation: manager.preferredFormation || '4-3-3',
  tactics: manager.tactics || getDefaultTactics(manager.preferredPlaystyle || 'possession'),
});

const kitColors = (manager: ManagerStudioRecord) => ({
  primaryColor: manager.attire === 'shirt_only' ? manager.shirtColor : manager.jacketColor,
  secondaryColor: manager.attire === 'sportswear' ? manager.shirtColor : manager.tieColor,
  shortsColor: manager.pantsColor,
  socksColor: manager.pantsColor,
});

export const ManagerStudio: React.FC<Props> = ({ leagueDb, onUpdateDb, showToast }) => {
  const records = leagueDb.managers || {};
  const teams = useMemo(() => Object.values(leagueDb.teams).sort((a, b) => a.name.localeCompare(b.name)), [leagueDb.teams]);
  const [managerTab, setManagerTab] = useState<'teams' | 'free'>('teams');
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => teams[0]?.id || '');
  const [selectedId, setSelectedId] = useState<string>(() => teams[0]?.managerId || Object.keys(records)[0] || '');
  const selected = selectedId ? records[selectedId] : undefined;
  const [draft, setDraft] = useState<ManagerStudioRecord | null>(selected ? hydrateManager(selected) : null);

  useEffect(() => {
    const migrated = ensureTeamManagerProfiles(leagueDb);
    if (migrated) {
      onUpdateDb(migrated);
      saveLeagueDatabase(migrated);
    }
  }, [leagueDb, onUpdateDb]);

  useEffect(() => {
    if (managerTab !== 'teams') return;
    const team = leagueDb.teams[selectedTeamId] || teams[0];
    if (!team) return;
    if (team.id !== selectedTeamId) setSelectedTeamId(team.id);
    const manager = team.managerId ? records[team.managerId] : undefined;
    if (manager && manager.id !== selectedId) {
      setSelectedId(manager.id);
      setDraft(hydrateManager(manager));
    }
  }, [managerTab, selectedTeamId, teams, leagueDb.teams, records, selectedId]);

  const updateDraft = (patch: Partial<ManagerStudioRecord>) => setDraft((current) => current ? { ...current, ...patch } : current);
  const updateTactics = (patch: Partial<ManagerStudioRecord['tactics']>) => setDraft((current) => current ? { ...current, tactics: { ...current.tactics, ...patch } } : current);
  const updateTeamAssociation = (teamId: string) => {
    if (!teamId) { updateDraft({ teamId: undefined }); return; }
    const team = leagueDb.teams[teamId];
    const primary = team?.manager?.primaryTactic;
    const rawPlaystyle = primary?.playstyle || primary?.style || 'possession';
    const preferredPlaystyle = mapManagerPlaystyle(rawPlaystyle);
    const defaults = getDefaultTactics(preferredPlaystyle);
    updateDraft({
      teamId,
      preferredPlaystyle,
      preferredFormation: (primary?.formation || team?.preferredFormation || '4-3-3') as ManagerStudioRecord['preferredFormation'],
      tactics: {
        ...defaults,
        defensiveLine: (primary?.defensiveLine || defaults.defensiveLine) as ManagerStudioRecord['tactics']['defensiveLine'],
        defensiveStyle: (primary?.defensiveStyle || defaults.defensiveStyle) as ManagerStudioRecord['tactics']['defensiveStyle'],
        offsideTrap: primary?.offsideTrap === 'YES',
        compactness: (primary?.compactness || defaults.compactness) as ManagerStudioRecord['tactics']['compactness'],
        creation: (primary?.passingStyle || defaults.creation) as ManagerStudioRecord['tactics']['creation'],
        finalThird: (primary?.finalThirdApproach || defaults.finalThird) as ManagerStudioRecord['tactics']['finalThird'],
        shape: (primary?.teamShape || defaults.shape) as ManagerStudioRecord['tactics']['shape'],
        runs: (primary?.attackingSupport || defaults.runs) as ManagerStudioRecord['tactics']['runs'],
      },
    });
  };
  const create = () => {
    const manager = newManager(records, managerTab === 'teams' ? selectedTeamId : undefined);
    setSelectedId(manager.id);
    setDraft(manager);
  };
  const save = () => {
    if (!draft || !draft.name.trim()) { showToast('Enter a manager name before saving.'); return; }
    const savedManager = { ...draft, name: draft.name.trim() };
    const managers = { ...(leagueDb.managers || {}), [draft.id]: savedManager };
    const teams = { ...leagueDb.teams };
    const oldTeamId = records[draft.id]?.teamId;
    if (oldTeamId && oldTeamId !== draft.teamId && teams[oldTeamId]?.managerId === draft.id) {
      teams[oldTeamId] = { ...teams[oldTeamId], managerId: undefined };
    }
    if (draft.teamId && teams[draft.teamId]) {
      const team = teams[draft.teamId];
      const previousManagerId = team.managerId;
      if (previousManagerId && previousManagerId !== draft.id && managers[previousManagerId]) {
        managers[previousManagerId] = { ...managers[previousManagerId], teamId: undefined };
      }
      const oldManager = team.manager;
      const existingTactic = oldManager?.primaryTactic;
      const styleMap: Record<string, 'possession' | 'gegenpressing' | 'counter_attack' | 'long_balls' | 'catenaccio'> = {
        possession: 'possession', arteta_control: 'possession', conservative: 'possession', gegenpress: 'gegenpressing',
        counterattack: 'counter_attack', long_ball: 'long_balls', brexitball: 'long_balls', futbol_champan: 'possession', jogobonito: 'possession', custom: 'possession',
      };
      teams[draft.teamId] = {
        ...team,
        managerId: draft.id,
        manager: {
          id: savedManager.id,
          name: savedManager.name,
          isCustomName: true,
          nationality: savedManager.nationality,
          age: savedManager.age,
          appearanceV2: savedManager.appearanceV2,
          attire: savedManager.attire,
          jacketColor: savedManager.jacketColor,
          shirtColor: savedManager.shirtColor,
          tieColor: savedManager.tieColor,
          pantsColor: savedManager.pantsColor,
          hasSecondaryTactic: oldManager?.hasSecondaryTactic || false,
          secondaryTactic: oldManager?.secondaryTactic,
          primaryTactic: {
            ...existingTactic,
            formation: savedManager.preferredFormation as any,
            style: styleMap[savedManager.preferredPlaystyle] || 'possession',
            playstyle: savedManager.preferredPlaystyle,
            positions: existingTactic?.positions || [],
            defensiveLine: savedManager.tactics.defensiveLine,
            defensiveStyle: savedManager.tactics.defensiveStyle,
            offsideTrap: savedManager.tactics.offsideTrap ? 'YES' : 'NO',
            compactness: savedManager.tactics.compactness,
            passingStyle: savedManager.tactics.creation,
            finalThirdApproach: savedManager.tactics.finalThird,
            teamShape: savedManager.tactics.shape,
            attackingSupport: savedManager.tactics.runs,
          },
        },
      };
    }
    const nextDb = { ...leagueDb, managers, teams };
    onUpdateDb(nextDb);
    saveLeagueDatabase(nextDb);
    setSelectedId(draft.id);
    showToast('Manager saved to the Manager Studio.');
  };

  const likenessPlayer = useMemo(() => {
    const base = PRESET_PLAYERS[0];
    if (!draft) return base;
    const managerBase = {
      ...base,
      id: draft.id,
      name: draft.name || 'Manager',
      age: draft.age,
      club: draft.teamId ? leagueDb.teams[draft.teamId]?.name || 'Unattached' : 'Unattached',
      kit: { ...base.kit, color1: kitColors(draft).primaryColor, color2: kitColors(draft).secondaryColor },
    } as PlayerCardData;
    return applyAppearanceV2ToPlayerCard(managerBase, draft.appearanceV2);
  }, [draft, leagueDb.teams]);

  const onLikenessChange = (updated: PlayerCardData) => {
    if (!draft) return;
    updateDraft({ appearanceV2: playerCardToAppearanceV2(updated) });
  };

  const setAttireColor = (key: 'jacketColor' | 'shirtColor' | 'tieColor' | 'pantsColor', value: string) => updateDraft({ [key]: value } as Partial<ManagerStudioRecord>);

  const freeManagers = Object.values(records).filter((manager) => !manager.teamId || !leagueDb.teams[manager.teamId]);
  const visibleTeams = teams.filter((team) => {
    const leagueName = leagueDb.leagues[team.leagueId]?.name || '';
    const query = teamSearch.toLowerCase();
    return `${team.name} ${team.countryName || team.countryCode} ${leagueName}`.toLowerCase().includes(query);
  });
  const activeTeam = selectedTeamId ? leagueDb.teams[selectedTeamId] : undefined;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4 text-white">
      <aside className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-arcade text-sm font-black uppercase text-indigo-200">Manager Studio</h2>
          <button type="button" onClick={create} className="min-h-10 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-black flex items-center gap-1.5"><Plus size={15}/> New</button>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-900 p-1">
          <button type="button" onClick={() => setManagerTab('teams')} className={`min-h-10 rounded-md text-[10px] font-black uppercase ${managerTab === 'teams' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Teams</button>
          <button type="button" onClick={() => {
            setManagerTab('free');
            const free = Object.values(records).filter(manager => !manager.teamId || !leagueDb.teams[manager.teamId]);
            if (free[0]) { setSelectedId(free[0].id); setDraft(hydrateManager(free[0])); }
            else { setSelectedId(''); setDraft(null); }
          }} className={`min-h-10 rounded-md text-[10px] font-black uppercase ${managerTab === 'free' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Free Manager</button>
        </div>
        {managerTab === 'teams' ? <>
          <input value={teamSearch} onChange={e => setTeamSearch(e.target.value)} placeholder="Search teams..." className="w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-xs text-white" />
          <div className="space-y-1 max-h-[55vh] overflow-y-auto">
            {visibleTeams.map((team) => {
              const teamManager = team.managerId ? records[team.managerId] : undefined;
              return <button key={team.id} type="button" onClick={() => {
                setSelectedTeamId(team.id);
                if (teamManager) { setSelectedId(teamManager.id); setDraft(hydrateManager(teamManager)); }
              }} className={`w-full p-3 rounded-lg border text-left ${selectedTeamId === team.id ? 'border-indigo-400 bg-indigo-950/60' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}>
                <span className="block text-xs font-bold">{team.name}</span>
                <span className="block mt-1 text-[10px] text-slate-500">{leagueDb.leagues[team.leagueId]?.name || team.countryName || team.countryCode}</span>
                <span className="block mt-1 text-[10px] text-slate-400">{teamManager?.name || team.manager?.name || 'Manager profile loading…'}</span>
              </button>;
            })}
          </div>
        </> : <div className="space-y-1 max-h-[55vh] overflow-y-auto">
          {freeManagers.map((manager) => (
            <button key={manager.id} type="button" onClick={() => { setSelectedId(manager.id); setDraft(hydrateManager(manager)); }} className={`w-full p-3 rounded-lg border text-left ${selectedId === manager.id ? 'border-indigo-400 bg-indigo-950/60' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}>
              <span className="block text-xs font-bold">{manager.name}</span>
              <span className="block mt-1 text-[10px] text-slate-400">ID# {manager.id}</span>
            </button>
          ))}
          {!freeManagers.length && <div className="py-8 text-center text-xs text-slate-500"><Users className="mx-auto mb-2"/>No free managers.</div>}
        </div>}
      </aside>

      {draft ? <main className="min-w-0 space-y-4">
        <section className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-arcade text-sm font-black uppercase">Manager creator</h2><p className="text-xs text-slate-400 mt-1">Likeness follows the Player Editor. Clothing uses manager attire.</p></div>
            <button type="button" onClick={save} className="min-h-11 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2"><Save size={15}/> Save Manager</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5"><span className="block text-[10px] uppercase text-slate-500">Manager ID#</span><span className="block mt-1 text-xs font-mono text-indigo-200 break-all">{draft.id}</span></div>
            <label className="text-[10px] uppercase text-slate-400">Name<input value={draft.name} onChange={e => updateDraft({ name: e.target.value })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-white" /></label>
            <label className="text-[10px] uppercase text-slate-400">Nationality<input value={draft.nationality} onChange={e => updateDraft({ nationality: e.target.value.toUpperCase().slice(0, 3) })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-white" /></label>
            <label className="text-[10px] uppercase text-slate-400">Age<input type="number" min={18} max={100} value={draft.age} onChange={e => updateDraft({ age: Math.max(18, Number(e.target.value) || 18) })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-white" /></label>
            <label className="text-[10px] uppercase text-slate-400">Preferred playstyle<select value={draft.preferredPlaystyle} onChange={e => { const style = e.target.value as ManagerStudioRecord['preferredPlaystyle']; updateDraft({ preferredPlaystyle: style, tactics: getDefaultTactics(style) }); }} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-white">{CANONICAL_PLAYSTYLES.filter(style => style !== 'custom').map(style => <option key={style} value={style}>{style.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</option>)}</select></label>
            <label className="text-[10px] uppercase text-slate-400">Preferred formation<select value={draft.preferredFormation} onChange={e => updateDraft({ preferredFormation: e.target.value as ManagerStudioRecord['preferredFormation'] })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-white">{FORMATION_LIST.filter(formation => formation.id !== 'custom').map(formation => <option key={formation.id} value={formation.id}>{formation.name}</option>)}</select></label>
            {managerTab === 'teams' && activeTeam ? <label className="text-[10px] uppercase text-slate-400 md:col-span-3">Manager assigned to {activeTeam.name}<select value={draft.teamId === activeTeam.id ? draft.id : activeTeam.managerId || ''} onChange={e => {
              const nextManager = records[e.target.value];
              if (nextManager) { setSelectedId(nextManager.id); setDraft({ ...hydrateManager(nextManager), teamId: activeTeam.id }); }
            }} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-white">
              {!records[draft.id] && <option value={draft.id}>{draft.name} · New manager</option>}
              {Object.values(records).filter(manager => !manager.teamId || manager.teamId === activeTeam.id).map(manager => <option key={manager.id} value={manager.id}>{manager.name} · ID# {manager.id}</option>)}
            </select><span className="block mt-1 normal-case text-[10px] text-slate-500">Select an existing free manager, or create a new manager for this team.</span></label> : <label className="text-[10px] uppercase text-slate-400 md:col-span-3">Team association<select value={draft.teamId || ''} onChange={e => updateTeamAssociation(e.target.value)} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-3 text-sm text-white"><option value="">Free Manager</option>{teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>}
          </div>
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h3 className="font-arcade text-[10px] font-black uppercase text-indigo-200">Tactical instructions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="text-[10px] uppercase text-slate-400">Defensive line · {draft.tactics.defensiveLine}<input type="range" min={1} max={5} value={draft.tactics.defensiveLine} onChange={e => updateTactics({ defensiveLine: Number(e.target.value) as ManagerStudioRecord['tactics']['defensiveLine'] })} className="mt-2 w-full accent-indigo-400" /></label>
              <label className="text-[10px] uppercase text-slate-400">Compactness · {draft.tactics.compactness}<input type="range" min={1} max={4} value={draft.tactics.compactness} onChange={e => updateTactics({ compactness: Number(e.target.value) as ManagerStudioRecord['tactics']['compactness'] })} className="mt-2 w-full accent-indigo-400" /></label>
              <label className="text-[10px] uppercase text-slate-400">Defensive style<select value={draft.tactics.defensiveStyle} onChange={e => updateTactics({ defensiveStyle: e.target.value as ManagerStudioRecord['tactics']['defensiveStyle'] })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs text-white"><option value="zonal">Zonal</option><option value="mixed">Mixed</option><option value="marking">Marking</option></select></label>
              <label className="text-[10px] uppercase text-slate-400">Creation<select value={draft.tactics.creation} onChange={e => updateTactics({ creation: e.target.value as ManagerStudioRecord['tactics']['creation'] })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs text-white"><option value="short">Short passing</option><option value="mixed">Mixed</option><option value="long">Long passing</option></select></label>
              <label className="text-[10px] uppercase text-slate-400">Final third<select value={draft.tactics.finalThird} onChange={e => updateTactics({ finalThird: e.target.value as ManagerStudioRecord['tactics']['finalThird'] })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs text-white"><option value="secure">Secure</option><option value="crossing">Crossing</option><option value="early_shoot">Early shots</option></select></label>
              <label className="text-[10px] uppercase text-slate-400">Team shape<select value={draft.tactics.shape} onChange={e => updateTactics({ shape: e.target.value as ManagerStudioRecord['tactics']['shape'] })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs text-white"><option value="free">Free</option><option value="relational">Relational</option><option value="strict">Strict</option><option value="total_football">Total football</option></select></label>
              <label className="text-[10px] uppercase text-slate-400">Attacking runs<select value={draft.tactics.runs} onChange={e => updateTactics({ runs: e.target.value as ManagerStudioRecord['tactics']['runs'] })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs text-white"><option value="moderate">Moderate</option><option value="all_attack">All attack</option><option value="low">Low</option><option value="all_defend">All defend</option></select></label>
              <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={draft.tactics.offsideTrap} onChange={e => updateTactics({ offsideTrap: e.target.checked })} className="accent-indigo-400" /> Offside trap</label>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-3">
          <h3 className="font-arcade text-xs font-black uppercase text-amber-200">Manager attire</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <label className="col-span-2 md:col-span-1 text-[10px] uppercase text-slate-400">Outfit<select value={draft.attire} onChange={e => updateDraft({ attire: e.target.value as ManagerStudioRecord['attire'] })} className="mt-1 w-full min-h-10 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs text-white"><option value="full_suit">Full suit + tie</option><option value="shirt_only">Shirt only</option><option value="sportswear">Sportswear</option><option value="long_jacket">Long jacket</option></select></label>
            {([['jacketColor','Jacket'],['shirtColor','Shirt'],['tieColor','Tie'],['pantsColor','Trousers']] as const).map(([key,label]) => <label key={key} className="text-[10px] uppercase text-slate-400">{label}<input type="color" value={draft[key]} onChange={e => setAttireColor(key,e.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-slate-700 bg-slate-900 p-1" /></label>)}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 flex items-center gap-3"><UserRound className="text-amber-300"/><span className="text-xs text-slate-300">{draft.attire.replace('_',' ')} · jacket {draft.jacketColor} · shirt {draft.shirtColor}</span></div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-950/80 p-4">
          <h3 className="font-arcade text-xs font-black uppercase text-sky-200 mb-3">Likeness preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-center"><div className="text-[9px] uppercase text-slate-400 mb-2">Portrait</div><PlayerFacePortrait player={likenessPlayer} hideTeam /></div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-center"><div className="text-[9px] uppercase text-slate-400 mb-2">Captain-style body</div><CaptainFullBodyPreview player={likenessPlayer} width={110} height={180} scale={1.3} allowFlip /></div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-center"><div className="text-[9px] uppercase text-slate-400 mb-2">In-game</div><InMatchSpritePreview player={likenessPlayer} kitOverride={kitColors(draft)} showPoseControls scale={1.45}/></div>
          </div>
          <div className="mt-4 border-t border-slate-800 pt-4"><CardControls player={likenessPlayer} onChange={onLikenessChange} onRandomize={() => {}} onReset={() => {}} isEditorMode careerMode="editor" initialTab="biometrics" visibleTabs={['biometrics']} /></div>
        </section>
      </main> : <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">Choose a manager or create a new one to begin.</div>}
    </div>
  );
};
