import React, { useState } from 'react';
import { PlayerCardData, Nationality } from '../types';
import { InternationalCallUp, NationalTeam } from '../types/nationalTeam';
import {
  getEligibleNationalities,
  createNationalTeam,
} from '../utils/nationalTeamSystem';
import { getNationalTeamsDatabase } from '../utils/nationalTeamDatabaseManager';
import { useTestMode } from '../utils/testModeSystem';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Lock, Unlock, Award, Flag, Users, Shield } from 'lucide-react';
import { ConsoleModalShell, ConsolePaginationBar, ConsolePageTab } from './common/ConsolePager';

interface NationalTeamPanelProps {
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  onTriggerCallUpModal: (callUp: InternationalCallUp) => void;
}

const SQUAD_PAGE_SIZE = 6;

export const NationalTeamPanel: React.FC<NationalTeamPanelProps> = ({
  player,
  onUpdatePlayer,
  onTriggerCallUpModal,
}) => {
  const { t } = useLanguage();
  const { isTestMode } = useTestMode();
  const activeNat = player.nationality || { code: 'ENG', iso: 'gb-eng', name: 'England' };
  const eligibleNats = getEligibleNationalities(player);
  const isSeniorLocked = Boolean(player.isSeniorLocked || player.seniorNationalTeamLocked);

  const [activeSection, setActiveSection] = useState<'eligibility' | 'caps' | 'lab'>('eligibility');
  const [selectedInspectNat, setSelectedInspectNat] = useState<Nationality>(activeNat);
  const [inspectTier, setInspectTier] = useState<'U17' | 'U20' | 'Senior'>('Senior');
  const [nationalTeamModal, setNationalTeamModal] = useState<NationalTeam | null>(null);
  const [squadPage, setSquadPage] = useState<number>(1);

  // Filter other nationalities that are NOT the active nationality
  const otherNats = eligibleNats.filter((n) => n.code !== activeNat.code);

  const handleSwitchPrimaryNationality = (targetNat: Nationality) => {
    if (isSeniorLocked) return;
    const currentActiveNat = activeNat;
    const currentOthers = [
      ...(player.otherNationalities || []),
      ...(player.extraNationalities || []),
    ];
    const updatedOthersList: Nationality[] = [...currentOthers];
    if (currentActiveNat.code !== targetNat.code) {
      if (!updatedOthersList.some((n) => n.code === currentActiveNat.code)) {
        updatedOthersList.push(currentActiveNat);
      }
    }
    const cleanOthers = updatedOthersList.filter((n) => n.code !== targetNat.code);
    const updated: PlayerCardData = {
      ...player,
      nationality: targetNat,
      otherNationalities: cleanOthers,
      extraNationalities: cleanOthers,
    };
    onUpdatePlayer(updated);
    setSelectedInspectNat(targetNat);
  };

  const handleTestCallUp = (tier: 'U17' | 'U20' | 'Senior', nation?: Nationality) => {
    const targetNat = nation || activeNat;
    const testCallUp: InternationalCallUp = {
      id: `test-${targetNat.code}-${tier}-${Date.now()}`,
      nation: targetNat,
      tier,
      competitionName:
        tier === 'U17'
          ? 'U17 World Championship Qualifiers'
          : tier === 'U20'
          ? 'U20 Continental Youth Championship'
          : 'World Championship Final Stage',
      managerName: `${targetNat.name} Head Coach`,
      role: 'Key Starter',
      bonusFame: tier === 'Senior' ? 150 : tier === 'U20' ? 80 : 40,
      date: new Date().toLocaleDateString('en-GB'),
      isSeniorLockWarning: tier === 'Senior' && !isSeniorLocked,
    };

    onTriggerCallUpModal(testCallUp);
  };

  const handleOpenNationalTeamSquad = (nation: Nationality, tier: 'U17' | 'U20' | 'Senior') => {
    const db = getNationalTeamsDatabase();
    const found = db.find(
      (item) => item.nation.code === nation.code || item.nation.name.toLowerCase() === nation.name.toLowerCase()
    );

    if (found) {
      const squadForTier =
        tier === 'Senior'
          ? found.squad
          : tier === 'U20'
          ? found.u20Squad || found.squad
          : found.u17Squad || found.squad;

      const teamObj: NationalTeam = {
        ...found,
        squad: squadForTier,
        tier,
        ovr: found.teamOvr || found.ovr || 75,
      };
      setSquadPage(1);
      setNationalTeamModal(teamObj);
    } else {
      const team = createNationalTeam(nation, tier, [player]);
      setSquadPage(1);
      setNationalTeamModal(team);
    }
  };

  const consoleTabs: ConsolePageTab[] = [
    { id: 'eligibility', label: 'Eligibility', badge: eligibleNats.length, icon: <Flag className="w-3.5 h-3.5" /> },
    { id: 'caps', label: 'Career Caps', icon: <Award className="w-3.5 h-3.5" /> },
    ...(isTestMode ? [{ id: 'lab', label: 'Squad Lab', icon: <Users className="w-3.5 h-3.5" /> }] : []),
  ];

  const squadTotal = nationalTeamModal?.squad.length || 0;
  const squadTotalPages = Math.max(1, Math.ceil(squadTotal / SQUAD_PAGE_SIZE));
  const safeSquadPage = Math.min(Math.max(1, squadPage), squadTotalPages);
  const visibleSquad = nationalTeamModal
    ? nationalTeamModal.squad.slice((safeSquadPage - 1) * SQUAD_PAGE_SIZE, safeSquadPage * SQUAD_PAGE_SIZE)
    : [];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur relative overflow-hidden space-y-4 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-black tracking-wide text-white uppercase truncate">
              International Team & Career Hub
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-snug">
              Eligibility, U17/U20 switching & Senior commitment
            </p>
          </div>
        </div>

        {/* Lock Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {isSeniorLocked ? (
            <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>SENIOR LOCKED ({player.seniorNation || activeNat.name})</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>UNLOCKED ({eligibleNats.length} Nations)</span>
            </div>
          )}
        </div>
      </div>

      {/* Console Page Tabs */}
      <nav
        aria-label="National Team Panel Pages"
        className={`grid ${consoleTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}
      >
        {consoleTabs.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as 'eligibility' | 'caps' | 'lab')}
              className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-arcade uppercase flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[11px] font-mono opacity-80">({tab.badge})</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* PAGE 1: ELIGIBILITY */}
      {activeSection === 'eligibility' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Nationality Card */}
          <div className="bg-slate-950/90 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" /> ACTIVE NATIONALITY
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">({activeNat.code})</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded-md overflow-hidden border border-black/30 shadow-md shrink-0">
                <img
                  src={`https://flagcdn.com/w80/${(activeNat.iso || 'gb-eng').toLowerCase()}.png`}
                  alt={activeNat.code}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-black text-white truncate">{activeNat.name}</h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Origin: <strong className="text-slate-200">{player.startingCity || 'Hometown'}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Other Nationalities List */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" /> OTHER ELIGIBLE NATIONS
              </span>
              <span className="text-xs font-mono font-bold text-sky-400">({otherNats.length})</span>
            </div>

            {otherNats.length > 0 ? (
              <div className="space-y-2 pt-1">
                {otherNats.map((nat) => (
                  <div
                    key={nat.code}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-bold text-slate-200 shadow-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={`https://flagcdn.com/w40/${(nat.iso || 'gb-eng').toLowerCase()}.png`}
                        alt={nat.code}
                        className="w-5 h-3.5 object-cover rounded-[2px] border border-black/20 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="truncate">{nat.name}</span>
                      <span className="text-xs text-sky-400 font-mono">({nat.code})</span>
                    </div>

                    {!isSeniorLocked && (
                      <button
                        type="button"
                        onClick={() => handleSwitchPrimaryNationality(nat)}
                        className="min-h-[44px] px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-black uppercase tracking-wide transition cursor-pointer active:scale-95"
                      >
                        {t('SWITCH_PRIMARY_NATION') || 'Make Primary'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 leading-relaxed">
                No secondary nationalities registered. You can acquire extra nationalities through family cards and origin choices.
              </p>
            )}
          </div>
        </div>
      )}

      {/* PAGE 2: CAREER CAPS */}
      {activeSection === 'caps' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* U17 Progression */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-sky-400 uppercase">U17 Level</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">{player.u17Nation || 'Not Represented'}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 border-t border-slate-800/80 pt-2">
              <span>Caps: <strong className="text-white">{player.u17Caps || 0}</strong></span>
              <span>Goals: <strong className="text-amber-400">{player.u17Goals || 0}</strong></span>
            </div>
            {isTestMode && (
              <button
                type="button"
                onClick={() => handleTestCallUp('U17')}
                className="w-full min-h-[44px] mt-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-sky-300 transition cursor-pointer text-center active:scale-95"
              >
                Trigger U17 Call-Up Test
              </button>
            )}
          </div>

          {/* U20 Progression */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-indigo-400 uppercase">U20 Level</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">{player.u20Nation || 'Not Represented'}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 border-t border-slate-800/80 pt-2">
              <span>Caps: <strong className="text-white">{player.u20Caps || 0}</strong></span>
              <span>Goals: <strong className="text-amber-400">{player.u20Goals || 0}</strong></span>
            </div>
            {isTestMode && (
              <button
                type="button"
                onClick={() => handleTestCallUp('U20')}
                className="w-full min-h-[44px] mt-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-indigo-300 transition cursor-pointer text-center active:scale-95"
              >
                Trigger U20 Call-Up Test
              </button>
            )}
          </div>

          {/* Senior Progression */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-amber-400 uppercase flex items-center gap-1">
                Senior Level {isSeniorLocked && <Lock className="w-3.5 h-3.5 text-rose-400" />}
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 truncate">{player.seniorNation || 'Uncommitted'}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 border-t border-slate-800/80 pt-2">
              <span>Caps: <strong className="text-white">{player.seniorCaps || player.internationalCaps || 0}</strong></span>
              <span>Goals: <strong className="text-amber-400">{player.seniorGoals || player.internationalGoals || 0}</strong></span>
            </div>
            {isTestMode && (
              <button
                type="button"
                onClick={() => handleTestCallUp('Senior')}
                className="w-full min-h-[44px] mt-1 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 rounded-xl text-xs font-black text-amber-200 transition cursor-pointer text-center active:scale-95"
              >
                Trigger Senior Call-Up Test
              </button>
            )}
          </div>
        </div>
      )}

      {/* PAGE 3: SQUAD LAB (TEST MODE) */}
      {activeSection === 'lab' && isTestMode && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div>
            <h4 className="text-sm font-black uppercase text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400" /> National Team Squad Generator (23 Players)
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Inspect National Team rosters procedurally built from real database stars + nation name generators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={selectedInspectNat.code}
              onChange={(e) => {
                const found = eligibleNats.find((n) => n.code === e.target.value);
                if (found) setSelectedInspectNat(found);
              }}
              className="min-h-[44px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white cursor-pointer"
            >
              {eligibleNats.map((n) => (
                <option key={n.code} value={n.code}>
                  {n.name} ({n.code})
                </option>
              ))}
            </select>

            <select
              value={inspectTier}
              onChange={(e) => setInspectTier(e.target.value as 'U17' | 'U20' | 'Senior')}
              className="min-h-[44px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-amber-400 cursor-pointer"
            >
              <option value="U17">U17</option>
              <option value="U20">U20</option>
              <option value="Senior">Senior</option>
            </select>

            <button
              type="button"
              onClick={() => handleOpenNationalTeamSquad(selectedInspectNat, inspectTier)}
              className="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black rounded-xl transition cursor-pointer shadow-sm active:scale-95"
            >
              View Squad
            </button>
          </div>
        </div>
      )}

      {/* National Team Squad Modal View */}
      <ConsoleModalShell
        isOpen={Boolean(nationalTeamModal)}
        onClose={() => setNationalTeamModal(null)}
        title={nationalTeamModal ? `${nationalTeamModal.nation.name} ${nationalTeamModal.tier} Squad` : 'National Squad'}
        subtitle={
          nationalTeamModal
            ? `Manager: ${nationalTeamModal.manager.name} • Team OVR: ${nationalTeamModal.ovr}`
            : undefined
        }
        badge={nationalTeamModal ? `${squadTotal} PLAYERS` : undefined}
        icon={<Shield className="w-5 h-5 text-sky-400" />}
        accentColor="sky"
        maxWidthClass="sm:max-w-3xl"
        zIndexClass="z-[130]"
        bodyClassName="p-3 sm:p-5 space-y-4"
        footer={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {squadTotalPages > 1 && (
              <ConsolePaginationBar
                currentPage={safeSquadPage}
                totalPages={squadTotalPages}
                onPageChange={setSquadPage}
                totalItems={squadTotal}
                pageSize={SQUAD_PAGE_SIZE}
                label="SQUAD PAGE"
              />
            )}
            <button
              type="button"
              onClick={() => setNationalTeamModal(null)}
              className="min-h-[48px] px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xl font-arcade text-xs uppercase font-bold cursor-pointer active:scale-95 sm:ml-auto"
            >
              Close Squad
            </button>
          </div>
        }
      >
        {nationalTeamModal && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-10 h-7 rounded overflow-hidden border border-black/30 shrink-0">
                <img
                  src={`https://flagcdn.com/w80/${(nationalTeamModal.nation.iso || 'gb-eng').toLowerCase()}.png`}
                  alt={nationalTeamModal.nation.code}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-xs sm:text-sm text-slate-300">
                Manager: <strong className="text-amber-300">{nationalTeamModal.manager.name}</strong> • Team Rating:{' '}
                <strong className="text-emerald-400">{nationalTeamModal.ovr} OVR</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visibleSquad.map((sq, idx) => (
                <div
                  key={sq.id || idx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-10 py-1 rounded bg-slate-900 text-amber-400 font-mono font-black text-xs text-center border border-slate-800 shrink-0">
                      {sq.position || 'ST'}
                    </span>
                    <span className="font-bold text-white truncate">{sq.name}</span>
                  </div>
                  <span className="font-black text-amber-300 font-mono shrink-0">{sq.ovr} OVR</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ConsoleModalShell>
    </div>
  );
};
