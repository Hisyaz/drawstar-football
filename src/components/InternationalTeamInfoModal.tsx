import React, { useState } from 'react';
import { InternationalYouthClub } from '../types/youthLeague';
import { KitRenderer } from './KitRenderer';
import { Globe, Users, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell } from './common/ConsolePager';

interface InternationalTeamInfoModalProps {
  isOpen: boolean;
  club: InternationalYouthClub | null;
  onClose: () => void;
}

export const InternationalTeamInfoModal: React.FC<InternationalTeamInfoModalProps> = ({
  isOpen,
  club,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'squad'>('overview');

  if (!isOpen || !club) return null;

  const kitConfig = {
    color1: club.primaryColor || '#3b82f6',
    color2: club.secondaryColor || '#ffffff',
    pattern: 'stripes' as const,
    collar: 'round' as const,
  };

  return (
    <ConsoleModalShell
      id="international-team-info-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={club.name}
      subtitle={`${club.federation} ${t('FEDERATION') || 'FEDERATION'} · ${club.country.toUpperCase()}`}
      badge={`${club.teamOvr} OVR`}
      icon={<span className="text-lg">{club.flag}</span>}
      accentColor="amber"
      maxWidthClass="sm:max-w-2xl"
      tabs={[
        { id: 'overview', label: 'Kit & Ratings', icon: <Shield className="w-3.5 h-3.5" /> },
        { id: 'squad', label: 'Youth Squad', badge: club.representativePlayers.length, icon: <Users className="w-3.5 h-3.5" /> },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'overview' | 'squad')}
      bodyClassName="p-4 sm:p-5 space-y-4 bg-slate-950/90"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer border border-slate-600 transition-all text-center uppercase"
          >
            {t('CLOSE_TEAM_PREVIEW') || 'Close Team Preview'}
          </button>
        </div>
      }
    >
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 items-center">
            <div className="flex flex-col items-center justify-center space-y-2 border-b sm:border-b-0 sm:border-r border-slate-800 pb-4 sm:pb-0 sm:pr-4">
              <span className="text-xs font-bold text-slate-400 uppercase">{t('OFFICIAL_UNIFORM') || 'Official Uniform'}</span>
              <KitRenderer kit={kitConfig} size="sm" showSponsor={false} />
              <span className="text-xs font-mono text-slate-300">{club.preferredFormation} {t('FORMATION') || 'Formation'}</span>
            </div>

            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  {t('TEAM_OVR') || 'Team Overall (OVR)'}
                </span>
                <span className="text-lg font-black text-amber-400 px-3 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/40">
                  {club.teamOvr} OVR
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/30">
                  <div className="text-xs text-rose-400 font-bold uppercase">{t('ATTACK') || 'Attack'}</div>
                  <div className="text-lg font-black text-white mt-0.5">{club.attOvr}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-sky-500/30">
                  <div className="text-xs text-sky-400 font-bold uppercase">{t('MIDFIELD') || 'Midfield'}</div>
                  <div className="text-lg font-black text-white mt-0.5">{club.midOvr}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                  <div className="text-xs text-emerald-400 font-bold uppercase">{t('DEFENSE') || 'Defense'}</div>
                  <div className="text-lg font-black text-white mt-0.5">{club.defOvr}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'squad' && (
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> {t('REPRESENTATIVE_SQUAD') || 'Representative Youth Squad'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {club.representativePlayers.map((player) => {
              let posBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              if (player.position === 'MID') posBg = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
              if (player.position === 'DEF') posBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              if (player.position === 'GK') posBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

              return (
                <div
                  key={player.id}
                  className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-2 py-1 rounded-lg text-xs font-black border shrink-0 ${posBg}`}>
                      {t(player.position) || player.position}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white truncate">{player.name}</div>
                      <div className="text-xs text-slate-400 truncate">{t(player.country) || player.country}</div>
                    </div>
                  </div>

                  <div className="text-xs font-black text-amber-300 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 shrink-0">
                    {player.ovr} OVR
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
