import React, { useState } from 'react';
import { PlayerCardData, ManagerState, AccountingState } from '../types';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';
import {
  Briefcase,
  DollarSign,
  Building2,
  Shield,
  ArrowRight,
  Compass,
  Zap,
  Award,
  School,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface AgentModal32BitProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerCardData;
  manager?: ManagerState;
  accounting?: AccountingState;
  onSwitchAcademy?: () => void;
  onTriggerDirective?: (
    directive: 'pro_contract_renewal' | 'pro_request_transfer' | 'pro_playing_time' | 'tactical_meeting'
  ) => void;
  onFireAgent?: () => void;
  primaryHex?: string;
  accentHex?: string;
}

export const AgentModal32Bit: React.FC<AgentModal32BitProps> = ({
  isOpen,
  onClose,
  player,
  manager,
  accounting,
  onSwitchAcademy,
  onTriggerDirective,
  onFireAgent,
}) => {
  const [confirmFire, setConfirmFire] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'directives' | 'contract'>('directives');

  if (!isOpen) return null;

  const isPro = isProfessionalPlayer(player);
  const effectiveManagerName = manager?.name || (player as any).managerName || 'Family Representative';
  const effectiveAgency =
    manager?.agencyName || (manager as any)?.agency || (player as any).agencyName || 'Independent Management';
  const agentArchetype =
    manager?.agentType || manager?.managerType || (manager as any)?.archetype || 'professional';
  const isParentAgent = agentArchetype === 'family' || (player as any).hasParentAgent;

  return (
    <ConsoleModalShell
      id="agent-modal-32bit-container"
      isOpen={isOpen}
      onClose={onClose}
      title={isPro ? 'AGENT HEADQUARTERS' : 'YOUTH AGENT & LIAISON'}
      subtitle={`${effectiveManagerName} • ${effectiveAgency}`}
      badge={isPro ? '32-BIT PRO DESK' : 'ACADEMY LIAISON'}
      icon={<Briefcase className="w-5 h-5 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-2xl"
      tabs={
        isPro
          ? [
              { id: 'directives', label: 'Directives' },
              { id: 'contract', label: 'Contract & Agent' },
            ]
          : undefined
      }
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'directives' | 'contract')}
      footer={
        !isPro ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSwitchAcademy) onSwitchAcademy();
            }}
            className="w-full min-h-[48px] py-3 px-4 pixel-corners bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <School className="w-4 h-4 shrink-0" />
            <span>[SWITCH ACADEMY] DISCUSS TRANSFER OPTIONS</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-arcade font-bold text-xs uppercase tracking-wider cursor-pointer transition active:scale-95"
          >
            Close Agent Desk
          </button>
        )
      }
    >
      <div className="p-4 sm:p-5 space-y-4 font-pixel text-left">
        {!isPro ? (
          <div className="space-y-4">
            <div className="bg-slate-950 border-2 border-slate-800 pixel-corners p-4 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  CURRENT YOUTH CLUB
                </span>
                <span className="text-xs font-arcade text-emerald-400 font-black">
                  AGE {player.age || 10} PROSPECT
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-retro">
                <span className="text-slate-200">
                  Enrolled at:{' '}
                  <strong className="text-white">{player.youthLeagueTeam || player.club || 'Youth Academy'}</strong>
                </span>
                <span className="text-amber-400 font-arcade font-bold">{player.fame || 0} FAME</span>
              </div>
            </div>

            <ConsolePagedText
              resetKey="youth-agent"
              paragraphs={[
                'As a youth prospect, your agent handles school and academy representation. You can request your agent to find and initiate a transfer to another youth academy in your country or abroad.',
                'Move to a higher-tier or international academy (requires 50+ Fame for domestic, 100+ Fame for abroad).',
              ]}
            />
          </div>
        ) : (
          <>
            {activeTab === 'directives' && (
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider font-arcade">
                  AGENT DIRECTIVES & ACTIONS
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onTriggerDirective) onTriggerDirective('pro_contract_renewal');
                    }}
                    className="min-h-[76px] p-3.5 bg-slate-950 hover:bg-slate-800 border-2 border-amber-500/70 hover:border-amber-400 pixel-corners text-left cursor-pointer transition-all active:translate-y-0.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300">
                      <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>1. "I WANT A NEW CONTRACT"</span>
                    </div>
                    <p className="text-xs text-slate-300 font-retro leading-snug">
                      Instruct agent to open salary renegotiations and demand improved contract terms.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onTriggerDirective) onTriggerDirective('pro_request_transfer');
                    }}
                    className="min-h-[76px] p-3.5 bg-slate-950 hover:bg-slate-800 border-2 border-sky-500/70 hover:border-sky-400 pixel-corners text-left cursor-pointer transition-all active:translate-y-0.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-sky-300">
                      <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>2. "I WANT A NEW CLUB"</span>
                    </div>
                    <p className="text-xs text-slate-300 font-retro leading-snug">
                      Demand a formal transfer listing and have your representative seek outside offers.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onTriggerDirective) onTriggerDirective('pro_playing_time');
                    }}
                    className="min-h-[76px] p-3.5 bg-slate-950 hover:bg-slate-800 border-2 border-emerald-500/70 hover:border-emerald-400 pixel-corners text-left cursor-pointer transition-all active:translate-y-0.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-emerald-300">
                      <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>3. "I WANT MORE MINUTES"</span>
                    </div>
                    <p className="text-xs text-slate-300 font-retro leading-snug">
                      Request agent intervention with the head coach to guarantee starter playing minutes.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onTriggerDirective) onTriggerDirective('tactical_meeting');
                    }}
                    className="min-h-[76px] p-3.5 bg-slate-950 hover:bg-slate-800 border-2 border-purple-500/70 hover:border-purple-400 pixel-corners text-left cursor-pointer transition-all active:translate-y-0.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-purple-300">
                      <Compass className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>4. "TACTICAL SQUAD MEETING"</span>
                    </div>
                    <p className="text-xs text-slate-300 font-retro leading-snug">
                      Discuss position adaptation and tactical versatility with team staff.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="space-y-4">
                <div className="bg-slate-950 border-2 border-slate-800 pixel-corners p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-1 border-b border-slate-800 pb-2">
                    <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      {player.club || 'Pro Club'} • CONTRACT TERMS
                    </span>
                    <span className="text-xs font-arcade text-sky-300 font-bold">
                      {player.contractYearsRemaining || 2} YEARS LEFT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-arcade">
                    <div className="p-2.5 bg-slate-900 pixel-corners border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">ROLE</span>
                      <span className="font-black text-white">
                        {player.squadRole || player.playingTimeExpectation || 'STARTER'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900 pixel-corners border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">SQUAD LEVEL</span>
                      <span className="font-black text-emerald-400">{player.squadDestination || 'First Team'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 pixel-corners border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">ANNUAL WAGE</span>
                      <span className="font-black text-amber-300">
                        €
                        {(
                          accounting?.yearlySalary ||
                          ((player as any).wage ? (player as any).wage * 52 : (player as any).salaryAnnual || 50000)
                        ).toLocaleString()}
                        /yr
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900 pixel-corners border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">RELEASE CLAUSE</span>
                      <span className="font-black text-purple-300">
                        {player.releaseClause ? `€${player.releaseClause.toLocaleString()}` : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {manager && (
                  <div className="bg-slate-950 border border-slate-800 pixel-corners p-3.5 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 uppercase">{manager.name}</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-arcade font-bold pixel-corners uppercase">
                        {agentArchetype}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-arcade">
                      <span className="text-slate-200">
                        NEG:{' '}
                        <strong className="text-amber-400">
                          {manager.negotiation ?? (manager as any).stats?.negotiation ?? 70}
                        </strong>
                      </span>
                      <span className="text-slate-200">
                        NET:{' '}
                        <strong className="text-sky-400">
                          {manager.network ?? (manager as any).stats?.network ?? 70}
                        </strong>
                      </span>
                      <span className="text-slate-200">
                        MKT:{' '}
                        <strong className="text-emerald-400">
                          {manager.marketing ?? (manager as any).stats?.marketing ?? 70}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                {!isParentAgent && onFireAgent && (
                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <span className="text-xs text-slate-300 font-retro">
                      Unhappy with agency results? You can terminate representation.
                    </span>
                    {!confirmFire ? (
                      <button
                        type="button"
                        onClick={() => setConfirmFire(true)}
                        className="min-h-[44px] px-4 py-2 pixel-corners bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/60 text-xs font-black uppercase cursor-pointer"
                      >
                        FIRE AGENT
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onFireAgent();
                            onClose();
                          }}
                          className="min-h-[44px] px-4 py-2 pixel-corners bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase cursor-pointer"
                        >
                          CONFIRM TERMINATION
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmFire(false)}
                          className="min-h-[44px] px-4 py-2 pixel-corners bg-slate-800 text-slate-200 text-xs font-bold cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ConsoleModalShell>
  );
};
