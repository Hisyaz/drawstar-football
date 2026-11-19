import React, { useState, useMemo, useEffect } from 'react';
import { ProContractOffer } from '../types/streetCards';
import { PlayerConfig } from '../types';
import { getPlayStyleDetail } from '../utils/statCalculations';
import { getValidPlayStylesForSubPosition } from '../utils/playerIdentitySystem';
import { t } from '../utils/localizationSystem';
import { UserCheck, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface ManagerPlaystyleModalProps {
  isOpen: boolean;
  offer: ProContractOffer | null;
  player: PlayerConfig;
  onConfirmPlaystyle: (chosenPlaystyle: string, acceptedManagerStyle: boolean) => void;
}

export const ManagerPlaystyleModal: React.FC<ManagerPlaystyleModalProps> = ({
  isOpen,
  offer,
  player,
  onConfirmPlaystyle,
}) => {
  const managerStyle = offer?.expectedPlaystyle || 'Complete Forward';
  const subPos = offer?.expectedSubPosition || player.subPosition || player.position || 'ST';

  // Valid tactical playstyles for this sub-position (strictly excluding Basic)
  const validTacticalStyles = useMemo(() => {
    return getValidPlayStylesForSubPosition(subPos).filter(
      (s) => s.toLowerCase() !== 'basic'
    );
  }, [subPos]);

  const alternateStyles = useMemo(() => {
    return validTacticalStyles.filter((s) => s.toLowerCase() !== managerStyle.toLowerCase());
  }, [validTacticalStyles, managerStyle]);

  const [selectedChoice, setSelectedChoice] = useState<'accept' | 'custom'>('accept');
  const [activeTab, setActiveTab] = useState<'request' | 'decision'>('request');
  const [customStyle, setCustomStyle] = useState<string>(() => {
    if (
      player.playStyle &&
      player.playStyle.toLowerCase() !== 'basic' &&
      player.playStyle.toLowerCase() !== managerStyle.toLowerCase() &&
      validTacticalStyles.includes(player.playStyle)
    ) {
      return player.playStyle;
    }
    return alternateStyles[0] || validTacticalStyles[0] || 'Balanced';
  });

  useEffect(() => {
    if (isOpen && offer) {
      setSelectedChoice('accept');
      setActiveTab('request');
    }
  }, [isOpen, offer]);

  if (!isOpen || !offer) return null;

  const handleConfirm = () => {
    if (selectedChoice === 'accept') {
      onConfirmPlaystyle(managerStyle, true);
    } else {
      onConfirmPlaystyle(customStyle, false);
    }
  };

  const managerStyleDetail = getPlayStyleDetail(subPos, managerStyle);
  const chosenCustomDetail = getPlayStyleDetail(subPos, customStyle);

  const pitchParagraphs = [
    t('MGR_PLAYSTYLE_PITCH', {
      name: player.name || 'Son',
      style: managerStyle,
      subPos,
    }) ||
      `"${player.name || 'Son'}, in our professional setup I need you to adopt the ${managerStyle} playstyle. It is central to our tactical setup for your ${subPos} role."`,
    managerStyleDetail
      ? `${managerStyleDetail.description}${
          managerStyleDetail.modernExample
            ? ` (${t('MGR_PLAYSTYLE_EXAMPLE', { example: managerStyleDetail.modernExample }) || `Example: ${managerStyleDetail.modernExample}`})`
            : ''
        }`
      : '',
  ].filter(Boolean);

  return (
    <ConsoleModalShell
      id="manager-playstyle-modal"
      isOpen={isOpen}
      onClose={handleConfirm}
      showCloseButton={false}
      closeDisabled={true}
      maxWidthClass="sm:max-w-2xl"
      accentColor="amber"
      title={t('MGR_PLAYSTYLE_REQ_TITLE', { managerName: offer.managerName }) || `Manager ${offer.managerName}'s Playstyle Request`}
      subtitle={
        t('MGR_PLAYSTYLE_SYSTEM_ROLE', {
          formation: offer.managerFormation || '4-3-3',
          tacticalStyle: offer.managerTacticalStyle,
          subPos,
        }) || `System: ${offer.managerFormation || '4-3-3'} (${offer.managerTacticalStyle}) • Role: ${subPos}`
      }
      badge={t('MGR_PLAYSTYLE_HEADER', { clubName: offer.clubName }) || `MANAGER MEETING • ${offer.clubName}`}
      icon={<UserCheck className="w-5 h-5 text-amber-300" />}
      tabs={[
        { id: 'request', label: "Manager's Pitch" },
        { id: 'decision', label: 'Your Response' },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'request' | 'decision')}
      bodyClassName="p-4 sm:p-6 space-y-4"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {activeTab === 'request' ? (
            <button
              type="button"
              onClick={() => setActiveTab('decision')}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl text-xs sm:text-sm font-black font-arcade text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>CHOOSE YOUR RESPONSE</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full min-h-[48px] px-6 py-3 rounded-xl text-xs sm:text-sm font-black font-arcade text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{t('MGR_PLAYSTYLE_CONFIRM_BTN')}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      }
    >
      {activeTab === 'request' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800 pb-3">
            <span className="text-xs font-arcade uppercase text-amber-300">Requested Playstyle</span>
            <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-200 font-arcade font-black text-xs sm:text-sm">
              {managerStyle} ({subPos})
            </span>
          </div>
          <ConsolePagedText
            resetKey={`${offer.clubName}-${managerStyle}`}
            paragraphs={pitchParagraphs}
            maxCharsPerPage={360}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* OPTION 1: ACCEPT MANAGER PLAYSTYLE */}
          <div
            onClick={() => setSelectedChoice('accept')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 bg-slate-950 ${
              selectedChoice === 'accept'
                ? 'border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-950/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <CheckCircle2
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                selectedChoice === 'accept' ? 'text-emerald-400' : 'text-slate-600'
              }`}
            />
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-white">
                {t('MGR_PLAYSTYLE_OPT1_TITLE', { style: managerStyle })}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('MGR_PLAYSTYLE_OPT1_DESC', { managerName: offer.managerName })}
              </p>
            </div>
          </div>

          {/* OPTION 2: REBUT & CHOOSE ANOTHER PLAYSTYLE */}
          <div
            onClick={() => setSelectedChoice('custom')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 bg-slate-950 ${
              selectedChoice === 'custom'
                ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-950/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldAlert
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                selectedChoice === 'custom' ? 'text-amber-400' : 'text-slate-600'
              }`}
            />
            <div className="space-y-2 w-full min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white">
                {t('MGR_PLAYSTYLE_OPT2_TITLE')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('MGR_PLAYSTYLE_OPT2_DESC', { subPos })}
              </p>

              {selectedChoice === 'custom' && (
                <div className="pt-2 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    {t('CHOOSE_PLAYSTYLE_FOR_POS', { subPos }) || `Choose Valid Playstyle for ${subPos}:`}
                  </label>
                  <select
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-amber-400 outline-none"
                  >
                    {alternateStyles.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {chosenCustomDetail && (
                    <p className="text-xs sm:text-sm text-indigo-300 leading-relaxed">
                      {chosenCustomDetail.description}
                      {chosenCustomDetail.modernExample && (
                        <span className="block text-indigo-400/90 mt-0.5">
                          {t('MGR_PLAYSTYLE_EXAMPLE', { example: chosenCustomDetail.modernExample }) ||
                            `Example: ${chosenCustomDetail.modernExample}`}
                        </span>
                      )}
                    </p>
                  )}

                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs sm:text-sm space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{t('MGR_PLAYSTYLE_WARN_TITLE')}</span>
                    </div>
                    <p className="leading-relaxed text-amber-200/95">
                      {t('MGR_PLAYSTYLE_WARN_DESC')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
