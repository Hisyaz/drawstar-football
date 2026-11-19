import React, { useState, useMemo, useEffect } from 'react';
import { PlayerConfig } from '../types';
import { generateManagerRoleProposal } from '../utils/youthLeagueSystem';
import { getSubPositionInfo } from '../utils/statCalculations';
import { useLanguage } from '../context/LanguageContext';
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { ConsoleModalShell } from './common/ConsolePager';

interface YouthManagerMeetingModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  onConfirmRole: (chosenSubPosition: string, acceptedProposal: boolean) => void;
}

export const YouthManagerMeetingModal: React.FC<YouthManagerMeetingModalProps> = ({
  isOpen,
  player,
  onConfirmRole,
}) => {
  const { t } = useLanguage();
  const proposal = useMemo(() => {
    return generateManagerRoleProposal(player);
  }, [player.id, player.position, isOpen]);

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [selectedSubPosition, setSelectedSubPosition] = useState(proposal.subPosition);

  useEffect(() => {
    setSelectedSubPosition(proposal.subPosition);
    setIsCustomRole(false);
  }, [proposal]);

  if (!isOpen) return null;

  const assignedSubInfo = getSubPositionInfo(proposal.subPosition);
  const assignedSubName = assignedSubInfo?.name ? assignedSubInfo.name.split(' (')[0] : proposal.subPosition;

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={() => onConfirmRole(selectedSubPosition, !isCustomRole)}
      showCloseButton={false}
      zIndexClass="z-[9999]"
      title={t('YOUTH_MEETING_TITLE') || 'Manager Tactical Role Proposal'}
      subtitle={t('YOUTH_MEETING_SUBTITLE', {
        club: player.club || t('YOUTH_ACADEMY_FALLBACK') || 'Youth Academy',
      })}
      badge={t('YOUTH_MEETING_HEADER') || 'FIRST MANAGER MEETING'}
      icon={<UserCheck className="w-5 h-5 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-2xl"
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <button
          type="button"
          onClick={() => onConfirmRole(selectedSubPosition, !isCustomRole)}
          className="w-full min-h-[48px] py-3 px-6 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 uppercase"
        >
          <span>{t('YOUTH_CONFIRM_ROLE_BTN') || 'CONFIRM & BEGIN SEASON'}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      }
    >
      <div className="space-y-2.5 border-b border-slate-800 pb-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              {t('YOUTH_COACH_ASSESSMENT') || "Head Coach's Assessment"}
            </div>
            <p className="text-sm text-slate-100 italic leading-relaxed">
              {t('YOUTH_COACH_SPEECH', {
                role: assignedSubName,
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-sky-400" /> {t('Position') || 'Position'}
            </span>
            <p className="text-sm font-black text-white mt-0.5 font-arcade">
              {player.position || proposal.proposedPosition}
            </p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5 text-indigo-400" /> {t('TACTICAL_ROLE_LABEL') || 'Tactical Role'}
            </span>
            <p className="text-sm font-black text-indigo-300 mt-0.5 truncate font-arcade">
              {assignedSubInfo?.name || proposal.subPosition}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          {t('YOUTH_SELECT_ROLE_DECISION') || 'Select Your Role Decision'}:
        </label>

        <button
          type="button"
          onClick={() => {
            setIsCustomRole(false);
            setSelectedSubPosition(proposal.subPosition);
          }}
          className={`w-full text-left p-3.5 rounded-xl border-2 cursor-pointer transition-all min-h-[56px] ${
            !isCustomRole
              ? 'border-amber-400 bg-amber-500/20'
              : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
          }`}
        >
          <div className="text-sm font-black text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t('YOUTH_ACCEPT_ROLE_TITLE') || "ACCEPT MANAGER'S ASSIGNED ROLE"}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {t('YOUTH_ACCEPT_ROLE_DESC', {
              role: assignedSubName,
              code: proposal.subPosition,
            })}
          </p>
        </button>

        <div
          onClick={() => setIsCustomRole(true)}
          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all space-y-2.5 ${
            isCustomRole
              ? 'border-purple-400 bg-purple-500/20'
              : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{t('YOUTH_REJECT_ROLE_TITLE') || 'REJECT & CHOOSE ANOTHER SUB-POSITION'}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {t('YOUTH_REJECT_ROLE_DESC', {
                pos: player.position || proposal.proposedPosition,
              })}
            </p>
          </div>

          {isCustomRole && (
            <div className="pt-2.5 border-t border-purple-500/30 space-y-2.5">
              <div className="flex flex-wrap gap-2">
                {proposal.allowedSubPositions.map((subCode) => {
                  const info = getSubPositionInfo(subCode);
                  const label = info?.name || subCode;
                  return (
                    <button
                      key={subCode}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubPosition(subCode);
                      }}
                      className={`min-h-[42px] px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer border-2 ${
                        selectedSubPosition === subCode
                          ? 'bg-purple-600 text-white border-purple-300 shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-500/50 text-xs text-amber-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-bold block mb-0.5">
                    {t('YOUTH_SUBPOS_WARN_TITLE')}
                  </strong>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {t('YOUTH_SUBPOS_WARN_DESC')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConsoleModalShell>
  );
};
