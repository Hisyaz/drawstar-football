import React, { useState } from 'react';
import { EditorTeamData, LeagueDatabase, SquadGroupKey } from '../../../types/leagueEditor';
import { PlayerCardData } from '../../../types';
import {
  ensureTeamSquadSaveFile,
  addPlayerToSquadGroup,
  deletePlayerFromSquadGroup,
  transferPlayerBetweenTeams,
  updatePlayerInSquadGroup,
  getActivePlayerCount,
  getOccupiedNumbersForTeamGroup,
  SQUAD_GROUP_LIMITS,
} from '../../../utils/squadSaveFileSystem';
import { TeamPlayerEditorModal } from '../../TeamPlayerEditorModal';
import { TeamPlayerTransferModal } from '../../TeamPlayerTransferModal';
import { ConsolePaginationBar } from '../../common/ConsolePager';
import { Users, UserPlus, Edit3, ArrowRightLeft, Trash2 } from 'lucide-react';

interface ClubSquadSectionProps {
  team: EditorTeamData;
  leagueDb: LeagueDatabase;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
  initialGroup?: SquadGroupKey;
  onEditPlayerInFullEditor?: (player: PlayerCardData, slotNumber: number, groupKey: SquadGroupKey) => void;
}

export const ClubSquadSection: React.FC<ClubSquadSectionProps> = ({
  team,
  leagueDb,
  onUpdate,
  showToast = () => {},
  initialGroup,
  onEditPlayerInFullEditor,
}) => {
  const [activeGroup, setActiveGroup] = useState<SquadGroupKey>(initialGroup || 'squad');
  const [squadPage, setSquadPage] = useState(1);
  const [editingPlayerModal, setEditingPlayerModal] = useState<{
    slotNumber: number;
    player: PlayerCardData;
  } | null>(null);
  const [transferPlayerModal, setTransferPlayerModal] = useState<{
    slotNumber: number;
    player: PlayerCardData;
  } | null>(null);

  const SLOTS_PER_PAGE = 6;
  const teamWithSquad = ensureTeamSquadSaveFile(team);
  const currentSlots = teamWithSquad.squadSaveFile?.[activeGroup] || [];
  const totalPages = Math.max(1, Math.ceil(currentSlots.length / SLOTS_PER_PAGE));
  const safePage = Math.min(squadPage, totalPages);
  const pagedSlots = currentSlots.slice((safePage - 1) * SLOTS_PER_PAGE, safePage * SLOTS_PER_PAGE);
  const limits = SQUAD_GROUP_LIMITS[activeGroup];
  const activeCount = getActivePlayerCount(teamWithSquad, activeGroup);
  const isFull = activeCount >= limits.max;

  const handleAddPlayer = () => {
    const res = addPlayerToSquadGroup(teamWithSquad, activeGroup);
    if (res.error) {
      showToast(res.error);
    } else if (res.updatedTeam) {
      onUpdate(res.updatedTeam);
      showToast(`Added new prospect to ${limits.label}`);
    }
  };

  const handleDeletePlayer = (slotNumber: number, playerName: string) => {
    const res = deletePlayerFromSquadGroup(teamWithSquad, activeGroup, slotNumber);
    if (res.error) {
      showToast(res.error);
    } else if (res.updatedTeam) {
      onUpdate(res.updatedTeam);
      showToast(`Removed ${playerName} from roster`);
    }
  };

  const handleSaveEditedPlayer = (slotNumber: number, updatedPlayer: PlayerCardData) => {
    const updatedTeam = updatePlayerInSquadGroup(teamWithSquad, activeGroup, slotNumber, updatedPlayer);
    onUpdate(updatedTeam);
    showToast(`Updated ${updatedPlayer.name}`);
    setEditingPlayerModal(null);
  };

  const handleTransferPlayer = (
    fromSlotNumber: number,
    targetTeamId: string,
    targetGroup: SquadGroupKey
  ) => {
    const destTeam = leagueDb.teams[targetTeamId];
    if (!destTeam) {
      showToast('Destination team not found');
      return;
    }
    const res = transferPlayerBetweenTeams(
      teamWithSquad,
      destTeam,
      activeGroup,
      targetGroup,
      fromSlotNumber
    );
    if (res.error) {
      showToast(res.error);
    } else if (res.updatedSourceTeam) {
      onUpdate(res.updatedSourceTeam);
      showToast(`Transferred player successfully`);
    }
    setTransferPlayerModal(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 04
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Users className="w-7 h-7 text-sky-400" />
            SQUAD ROSTER & PLAYERS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Manage complete player rosters, jersey numbers, attributes, age, positions, and intra-club player transfers.
          </p>
        </div>

        {/* Add Player Button */}
        <button
          type="button"
          disabled={isFull}
          onClick={handleAddPlayer}
          className={`min-h-[44px] w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
            isFull
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20 active:scale-95'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Add Player ({activeCount}/{limits.max})
        </button>
      </div>

      {/* SQUAD CATEGORY TABS */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
        {(['squad', 'reserves', 'u20', 'u17'] as SquadGroupKey[]).map((groupKey) => {
          const groupLimits = SQUAD_GROUP_LIMITS[groupKey];
          const count = getActivePlayerCount(teamWithSquad, groupKey);
          const isActive = activeGroup === groupKey;

          return (
            <button
              key={groupKey}
              type="button"
              onClick={() => {
                setActiveGroup(groupKey);
                setSquadPage(1);
              }}
              className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-between sm:justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="truncate">{groupLimits.label}</span>
              <span
                className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md shrink-0 ${
                  isActive ? 'bg-sky-950 text-sky-200' : 'bg-slate-950 text-slate-500'
                }`}
              >
                {count}/{groupLimits.max}
              </span>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <ConsolePaginationBar
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setSquadPage}
          totalItems={currentSlots.length}
          pageSize={SLOTS_PER_PAGE}
          label="ROSTER PAGE"
        />
      )}

      {/* SQUAD LIST SLOTS */}
      <div className="space-y-3">
        {pagedSlots.map((slot) => {
          const player = slot.player;
          const isOccupied = !!player;

          if (isOccupied && player) {
            return (
              <div
                key={`slot_${slot.slotNumber}`}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md"
              >
                {/* Left: Shirt Number & Identity */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col items-center justify-center text-cyan-300 font-mono font-black text-sm shrink-0 shadow-inner">
                    <span>#{player.number ?? player.shirtNumber ?? slot.slotNumber}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-black text-white truncate">
                        {player.name}
                      </span>
                      <span className="text-xs font-black text-amber-400 font-mono bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded-md shrink-0">
                        {player.ovr} OVR
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono flex-wrap">
                      <span className="text-cyan-400 font-bold">
                        {player.position} {player.subPosition ? `(${player.subPosition})` : ''}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">Age {player.age}</span>
                      <span>•</span>
                      <span>{player.nationality?.name || team.countryCode}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="grid grid-cols-3 sm:flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (onEditPlayerInFullEditor) {
                        onEditPlayerInFullEditor(player, slot.slotNumber, activeGroup);
                      } else {
                        setEditingPlayerModal({ slotNumber: slot.slotNumber, player });
                      }
                    }}
                    className="min-h-[44px] px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferPlayerModal({ slotNumber: slot.slotNumber, player })}
                    className="min-h-[44px] px-3 bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                    <span>Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlayer(slot.slotNumber, player.name)}
                    className="min-h-[44px] px-3 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          }

          {/* Empty Spot */}
          return (
            <div
              key={`slot_empty_${slot.slotNumber}`}
              className="bg-slate-950/40 border border-dashed border-slate-800/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-75 hover:opacity-100 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 font-mono font-bold text-xs shrink-0">
                  #{slot.slotNumber}
                </div>
                <div className="text-xs font-bold text-slate-400 truncate">
                  Slot #{slot.slotNumber} — Empty Roster Spot
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddPlayer}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-sky-950 hover:text-sky-300 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                + Fill Spot
              </button>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <ConsolePaginationBar
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setSquadPage}
          totalItems={currentSlots.length}
          pageSize={SLOTS_PER_PAGE}
          label="ROSTER PAGE"
        />
      )}

      {/* EDIT PLAYER MODAL */}
      {editingPlayerModal && (
        <TeamPlayerEditorModal
          isOpen={true}
          onClose={() => setEditingPlayerModal(null)}
          player={editingPlayerModal.player}
          slotNumber={editingPlayerModal.slotNumber}
          groupLabel={limits.label}
          occupiedNumbers={getOccupiedNumbersForTeamGroup(
            teamWithSquad,
            activeGroup,
            editingPlayerModal.player.id
          )}
          onSave={(updated) =>
            handleSaveEditedPlayer(editingPlayerModal.slotNumber, updated)
          }
        />
      )}

      {/* TRANSFER PLAYER MODAL */}
      {transferPlayerModal && (
        <TeamPlayerTransferModal
          isOpen={true}
          onClose={() => setTransferPlayerModal(null)}
          player={transferPlayerModal.player}
          sourceTeam={teamWithSquad}
          sourceGroupKey={activeGroup}
          sourceSlotNumber={transferPlayerModal.slotNumber}
          allTeams={leagueDb.teams}
          onTransfer={(destTeamId, destGroupKey) =>
            handleTransferPlayer(transferPlayerModal.slotNumber, destTeamId, destGroupKey)
          }
        />
      )}
    </div>
  );
};
