import React, { useMemo, useState } from 'react';
import { EditorTeamData } from '../../../types/leagueEditor';
import { FormationName, TacticalPlaystyle } from '../../../gameplay/types';
import { TacticalPitchBoard } from '../../../gameplay/components/TacticalPitchBoard';
import { TacticalGamePlanModal, GamePlanPayload } from '../../../gameplay/components/TacticalGamePlanModal';
import {
  editorTeamToGameplayTeam,
  applyGamePlanToEditorTeam,
} from '../../../utils/gameplayAdapter';
import { createDefaultManager } from '../../../utils/tacticalSystem';
import { Users, Sliders, Sparkles } from 'lucide-react';

interface ClubStartingXISectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubStartingXISection: React.FC<ClubStartingXISectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  const [isGamePlanOpen, setIsGamePlanOpen] = useState(false);

  const gameplayTeam = useMemo(() => editorTeamToGameplayTeam(team), [team]);

  const handleApplyGamePlan = (plan: GamePlanPayload) => {
    const nextTeam = applyGamePlanToEditorTeam(
      team,
      plan.homeTeam,
      plan.homeFormation,
      plan.homePlaystyle,
      plan.homeTactics,
      plan.homeRoles
    );
    onUpdate(nextTeam);
    showToast(`Applied ${plan.homeFormation} (${plan.homePlaystyle}) & Set-Piece Roles to ${team.name}!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 03
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Users className="w-7 h-7 text-emerald-400" />
            TACTICAL GAME PLAN &amp; STARTING XI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Powered by the 32-Bit Tactical Matrix: drag &amp; swap pitch coordinates, customize formations, tactical philosophy, and set-piece specialists.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsGamePlanOpen(true)}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer transition shrink-0"
        >
          <Sliders className="w-4 h-4" />
          Open Full Tactical Game Plan &amp; Roles
        </button>
      </div>

      {/* SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400">FORMATION</div>
          <div className="text-sm font-black text-amber-400">{gameplayTeam.preferredFormation}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400">PHILOSOPHY</div>
          <div className="text-sm font-black text-emerald-400 uppercase">{gameplayTeam.tacticalPlaystyle}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400">LINEUP SIZE</div>
          <div className="text-sm font-black text-white">11 XI + {gameplayTeam.substitutes?.length || 0} Bench</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400">SET-PIECE ROLES</div>
            <div className="text-xs font-bold text-cyan-300">Captain, FK, Corners, PK</div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        </div>
      </div>

      {/* LIVE INTERACTIVE PITCH BOARD (SINGLE SOURCE OF TRUTH) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 h-[640px] flex flex-col">
        <TacticalPitchBoard
          team={gameplayTeam}
          side="home"
          selectedPlayerId={null}
          onSelectPlayer={() => setIsGamePlanOpen(true)}
          formation={gameplayTeam.preferredFormation as FormationName}
          onChangeFormation={(f) => {
            onUpdate((prev) => {
              const baseMgr = prev.manager || createDefaultManager(prev.name, prev.countryCode);
              return {
                ...prev,
                manager: {
                  ...baseMgr,
                  primaryTactic: {
                    ...baseMgr.primaryTactic,
                    formation: f as any,
                  },
                },
              };
            });
          }}
          tacticalPlaystyle={gameplayTeam.tacticalPlaystyle as TacticalPlaystyle}
          captainId={gameplayTeam.roles?.captainId}
          activeKit={gameplayTeam.kit}
        />
      </div>

      {/* FULL GAME PLAN MODAL */}
      <TacticalGamePlanModal
        isOpen={isGamePlanOpen}
        onClose={() => setIsGamePlanOpen(false)}
        initialHomeTeam={gameplayTeam}
        initialAwayTeam={gameplayTeam}
        initialHomeFormation={gameplayTeam.preferredFormation}
        initialAwayFormation={gameplayTeam.preferredFormation}
        initialHomePlaystyle={gameplayTeam.tacticalPlaystyle}
        initialAwayPlaystyle={gameplayTeam.tacticalPlaystyle}
        initialHomeTactics={gameplayTeam.tactics}
        initialAwayTactics={gameplayTeam.tactics}
        initialHomeRoles={gameplayTeam.roles}
        initialAwayRoles={gameplayTeam.roles}
        onApplyGamePlan={handleApplyGamePlan}
      />
    </div>
  );
};
