import React, { useState } from 'react';
import { PlayerCardData, PlayerPositionSlot } from '../types';
import {
  ManagerPositionProposal,
  addPlayerNewPosition,
  calculatePositionSlotOvr,
} from '../utils/positionMasterySystem';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Sparkles, Check, X } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface ManagerPositionChangeModalProps {
  player: PlayerCardData;
  proposal: ManagerPositionProposal;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (updatedPlayer: PlayerCardData) => void;
}

export const ManagerPositionChangeModal: React.FC<ManagerPositionChangeModalProps> = ({
  player,
  proposal,
  isOpen,
  onClose,
  onAccept,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dilemma' | 'proposal'>('dilemma');

  if (!isOpen) return null;

  const hypotheticalSlot: PlayerPositionSlot = {
    id: 'hypothetical_new_pos',
    slotIndex: (player.positions?.length || 1) + 1,
    position: proposal.position,
    subPosition: proposal.subPosition,
    playStyle: proposal.playStyle,
    tier: 'I',
    isMain: false,
  };

  const projectedTierIOvr = calculatePositionSlotOvr(player, hypotheticalSlot);
  const hypotheticalTierIVOvr = calculatePositionSlotOvr(player, {
    ...hypotheticalSlot,
    tier: 'IV',
  });

  const handleAccept = () => {
    const updated = addPlayerNewPosition(player, {
      position: proposal.position,
      subPosition: proposal.subPosition,
      playStyle: proposal.playStyle,
    });
    onAccept(updated);
  };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t('MANAGER_REQUESTS_ROLE_CHANGE') || 'Manager Requests New Tactical Position'}
      subtitle={t('TACTICAL_MEETING') || 'Tactical Meeting • Manager Directive'}
      icon={<ShieldAlert className="w-5 h-5 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-xl"
      zIndexClass="z-[100]"
      tabs={[
        { id: 'dilemma', label: t('Tactical Dilemma') },
        { id: 'proposal', label: t('Proposed Position') },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'dilemma' | 'proposal')}
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4 shrink-0" />
            <span>{t('DECLINE_REQUEST') || 'Decline Proposal'}</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="min-h-[48px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{t('ACCEPT_NEW_POSITION') || 'Accept & Learn Position'}</span>
          </button>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-4 text-left">
        {activeTab === 'dilemma' && (
          <div className="space-y-4">
            <ConsolePagedText
              resetKey={`${proposal.subPosition}-dilemma`}
              pages={[
                {
                  heading: t('HEAD_COACH_DILEMMA') || 'Head Coach Tactical Dilemma',
                  paragraphs: [`"${proposal.explanation}"`],
                },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400">
                  {t('CURRENT_POSITION_RIVAL') || 'Squad Stalwart at your position'}
                </span>
                <div className="text-base font-black text-white">{proposal.rivalStarName}</div>
                <div className="text-xs sm:text-sm text-amber-400 font-bold">
                  {proposal.rivalStarOvr} OVR • {player.subPosition || player.position}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400">
                  {t('SQUAD_TACTICAL_WEAKNESS') || 'Squad Vulnerability'}
                </span>
                <div className="text-base font-black text-white">{proposal.weakStarterName}</div>
                <div className="text-xs sm:text-sm text-rose-400 font-bold">
                  {proposal.weakStarterOvr} OVR • {proposal.subPosition}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proposal' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border-2 border-amber-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2.5">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {t('PROPOSED_POSITION') || 'Proposed Position & Role'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
                  {proposal.position} • {proposal.subPosition}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-lg font-black text-white">
                    {proposal.subPosition} ({proposal.playStyle})
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300">
                    Starts at <strong className="text-amber-300">Tier I Mastery</strong> (-40% penalty on non-physical stats)
                  </div>
                </div>

                <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-2xl font-black text-amber-400">
                    {projectedTierIOvr} <span className="text-xs text-slate-300 font-medium">OVR (Tier I)</span>
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-400 font-bold">
                    {projectedTierIOvr} → {hypotheticalTierIVOvr} OVR at Tier IV
                  </div>
                </div>
              </div>
            </div>

            <ConsolePagedText
              resetKey={`${proposal.subPosition}-explainer`}
              paragraphs={[
                t('POSITION_DEVELOPMENT_EXPLAINER') ||
                  'You can develop this position up to Tier IV (0% penalty) in your Development tab by spending 10 stat points per tier. If you play 80%+ of a season at Tier IV, you can make it your permanent Main Position!',
              ]}
            />
          </div>
        )}
      </div>
    </ConsoleModalShell>
  );
};
