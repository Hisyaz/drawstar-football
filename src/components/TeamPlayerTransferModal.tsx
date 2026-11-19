import React, { useState } from 'react';
import { PlayerCardData } from '../types';
import { EditorTeamData, SquadGroupKey } from '../types/leagueEditor';
import { SQUAD_GROUP_LIMITS, getActivePlayerCount } from '../utils/squadSaveFileSystem';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRightLeft } from 'lucide-react';
import { ConsoleModalShell } from './common/ConsolePager';

interface TeamPlayerTransferModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  sourceTeam: EditorTeamData;
  sourceGroupKey: SquadGroupKey;
  sourceSlotNumber: number;
  allTeams: Record<string, EditorTeamData>;
  onTransfer: (destTeamId: string, destGroupKey: SquadGroupKey) => void;
  onClose: () => void;
}

export const TeamPlayerTransferModal: React.FC<TeamPlayerTransferModalProps> = ({
  isOpen,
  player,
  sourceTeam,
  sourceGroupKey,
  sourceSlotNumber,
  allTeams,
  onTransfer,
  onClose,
}) => {
  const { t } = useLanguage();
  const destinationTeams = (Object.values(allTeams || {}) as EditorTeamData[]).filter(
    (t) => t.id !== sourceTeam.id
  );
  const [selectedDestTeamId, setSelectedDestTeamId] = useState<string>(
    destinationTeams[0]?.id || ''
  );
  const [selectedDestGroupKey, setSelectedDestGroupKey] = useState<SquadGroupKey>('squad');

  if (!isOpen) return null;

  const destTeam = allTeams[selectedDestTeamId];
  const destGroupLimits = SQUAD_GROUP_LIMITS[selectedDestGroupKey];
  const destActiveCount = destTeam ? getActivePlayerCount(destTeam, selectedDestGroupKey) : 0;
  const isDestFull = destActiveCount >= destGroupLimits.max;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestTeamId) return;
    onTransfer(selectedDestTeamId, selectedDestGroupKey);
    onClose();
  };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t('TRANSFER PLAYER')}
      subtitle={t('Move {name} to another official club', { name: player.name })}
      maxWidthClass="sm:max-w-lg"
      accentColor="purple"
      icon={<ArrowRightLeft className="w-5 h-5 text-purple-300" />}
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {t('Cancel')}
          </button>
          <button
            type="submit"
            form="team-player-transfer-form"
            disabled={isDestFull || !selectedDestTeamId}
            className={`min-h-[44px] flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
              isDestFull || !selectedDestTeamId
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 shrink-0" />
            {t('Transfer Player')}
          </button>
        </div>
      }
    >
      <form id="team-player-transfer-form" onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Player Card Summary */}
        <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-black text-white truncate">{player.name}</div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="font-bold text-amber-400">{player.ovr} OVR</span>
              <span>•</span>
              <span className="text-slate-300 font-mono">{player.position} ({player.subPosition})</span>
              <span>•</span>
              <span>{t('Age {age}', { age: player.age })}</span>
            </div>
          </div>
          <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
            #{sourceSlotNumber}
          </div>
        </div>

        {/* Destination Team Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {t('Destination Team *')}
          </label>
          <select
            value={selectedDestTeamId}
            onChange={(e) => setSelectedDestTeamId(e.target.value)}
            className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-purple-500 cursor-pointer"
          >
            {destinationTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.countryCode})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Squad Group Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {t('Destination Squad Group *')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['squad', 'reserves', 'u20', 'u17'] as SquadGroupKey[]).map((gKey) => {
              const limits = SQUAD_GROUP_LIMITS[gKey];
              const isSel = selectedDestGroupKey === gKey;
              const count = destTeam ? getActivePlayerCount(destTeam, gKey) : 0;
              const full = count >= limits.max;

              return (
                <button
                  key={gKey}
                  type="button"
                  onClick={() => setSelectedDestGroupKey(gKey)}
                  className={`min-h-[56px] p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSel
                      ? 'bg-purple-950/60 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-black uppercase truncate">{t(limits.label)}</span>
                  <span className={`text-[10px] font-mono mt-1 ${full ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                    {count} / {limits.max} {full ? t('(FULL)') : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isDestFull && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs font-bold text-red-300">
            {t('The selected destination squad group is full ({current}/{max}). Select another group or team.', { current: destActiveCount, max: destGroupLimits.max })}
          </div>
        )}
      </form>
    </ConsoleModalShell>
  );
};
