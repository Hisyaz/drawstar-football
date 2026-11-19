import React, { useState, useMemo } from 'react';
import { PlayerCardData } from '../types';
import {
  YOUTH_LEAGUES_DATABASE,
  YouthTeamData,
  YouthLeagueData,
  getPlayerCurrentYouthLeague,
} from '../data/youthLeaguesDatabase';
import { getFootballSchoolForClub } from '../data/youthFootballSchools';
import { rebuildPlayerYouthContextOnSwitch } from '../utils/clubContextRebuilder';
import {
  School,
  Globe,
  Lock,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

export interface ChangeAcademyModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onClose: () => void;
  onSwitchAcademy: (updatedPlayer: PlayerCardData) => void;
  showToast?: (msg: string) => void;
}

export const ChangeAcademyModal: React.FC<ChangeAcademyModalProps> = ({
  isOpen,
  player,
  onClose,
  onSwitchAcademy,
  showToast,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'same_league' | 'international' | 'rules'>('all');
  const [page, setPage] = useState(1);
  const [confirmingTeam, setConfirmingTeam] = useState<{
    team: YouthTeamData;
    league: YouthLeagueData;
    isInternational: boolean;
  } | null>(null);

  const fame = player.fame || 0;
  const currentTeamName = (player.youthTeamName || player.club || '').trim();
  const currentLeague = useMemo(() => getPlayerCurrentYouthLeague(player), [player]);

  const sameLeagueTeams = useMemo(() => {
    if (fame < 50) return [];
    return currentLeague.teams
      .filter((t) => t.name.toLowerCase().trim() !== currentTeamName.toLowerCase().trim())
      .map((team) => ({
        team,
        league: currentLeague,
        isInternational: false,
      }));
  }, [currentLeague, currentTeamName, fame]);

  const internationalTeams = useMemo(() => {
    if (fame <= 100) return [];
    const otherLeagues = Object.values(YOUTH_LEAGUES_DATABASE).filter(
      (l) => l.country.toLowerCase().trim() !== currentLeague.country.toLowerCase().trim()
    );

    const list: { team: YouthTeamData; league: YouthLeagueData; isInternational: boolean }[] = [];
    for (const l of otherLeagues) {
      for (const t of l.teams) {
        list.push({
          team: t,
          league: l,
          isInternational: true,
        });
      }
    }
    return list;
  }, [currentLeague, fame]);

  const displayedList = useMemo(() => {
    if (fame < 50) return [];
    if (selectedTab === 'same_league') return sameLeagueTeams;
    if (selectedTab === 'international') return internationalTeams;
    return [...sameLeagueTeams, ...internationalTeams];
  }, [fame, selectedTab, sameLeagueTeams, internationalTeams]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(displayedList.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedList = displayedList.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (!isOpen) return null;

  const handleExecuteSwitch = () => {
    if (!confirmingTeam) return;
    const { team, league, isInternational } = confirmingTeam;

    const updatedPlayer: PlayerCardData = rebuildPlayerYouthContextOnSwitch(player, team, {
      youthLeagueName: league.name,
      city: team.city,
      country: team.country,
      isInternational,
    });

    onSwitchAcademy(updatedPlayer);

    const toastMsg = isInternational
      ? `🛫 International Academy Relocation! Transferred to ${team.name} in ${team.country} (${team.youthLeague}). No salary or bonuses.`
      : `🏃 Academy Switch Complete! Transferred to ${team.name} (${team.youthLeague}). No salary or bonuses.`;

    if (showToast) {
      showToast(toastMsg);
    }

    setConfirmingTeam(null);
    onClose();
  };

  const tabs =
    fame < 50
      ? [
          { id: 'all', label: 'Status', icon: <Lock className="w-3.5 h-3.5" /> },
          { id: 'rules', label: 'How It Works', icon: <Info className="w-3.5 h-3.5" /> },
        ]
      : fame > 100
      ? [
          { id: 'all', label: `All (${sameLeagueTeams.length + internationalTeams.length})` },
          { id: 'same_league', label: `Same League (${sameLeagueTeams.length})` },
          { id: 'international', label: `International (${internationalTeams.length})` },
          { id: 'rules', label: 'Rules', icon: <Info className="w-3.5 h-3.5" /> },
        ]
      : [
          { id: 'all', label: `Same League (${sameLeagueTeams.length})` },
          { id: 'rules', label: 'Rules', icon: <Info className="w-3.5 h-3.5" /> },
        ];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      id="change-academy-modal"
      title="CHANGE ACADEMY"
      subtitle={`${currentTeamName || 'Youth Academy'} • ${currentLeague.country}`}
      badge="YOUTH ACADEMY NETWORK"
      icon={<School className="w-5 h-5 text-emerald-300" />}
      accentColor="emerald"
      maxWidthClass="sm:max-w-4xl"
      tabs={tabs}
      activeTabId={selectedTab}
      onTabChange={(id) => {
        setSelectedTab(id as 'all' | 'same_league' | 'international' | 'rules');
        setPage(1);
      }}
      headerRight={
        <div className="hidden sm:flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/50 px-2.5 py-1 rounded-lg text-amber-300 text-xs font-arcade">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>FAME {fame}</span>
        </div>
      }
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 truncate">
            Fame: <strong className="text-amber-300">{fame}</strong> •{' '}
            {fame < 50 ? 'Locked (<50)' : fame <= 100 ? 'Same League' : 'International Unlocked'}
          </div>
          <button
            id="change-academy-close-btn"
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase border border-slate-700 cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      }
    >
      {selectedTab === 'rules' ? (
        <ConsolePagedText
          resetKey={`rules-${fame}`}
          textSizeClass="text-sm sm:text-base"
          pages={[
            {
              heading: 'Academy Transfer Rules',
              bullets: [
                'Under 50 Fame: no external academies are scouting you yet.',
                '50–100 Fame: teams in your same domestic youth league can recruit you.',
                'Over 100 Fame: international academies from other countries unlock.',
                'Pure development switch: NO salary and NO signing bonuses.',
              ],
            },
            {
              heading: 'How to Increase Fame',
              bullets: [
                'Perform well in youth league matches with goals, assists, and high match ratings.',
                'Win Player of the Match & Team of the Week honors.',
                'Compete in the National Championship or International Youth Cup.',
              ],
            },
          ]}
        />
      ) : fame < 50 ? (
        <div
          id="change-academy-locked-state"
          className="p-4 sm:p-6 text-center rounded-xl bg-slate-950/90 border-2 border-slate-800 flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-14 h-14 rounded-xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-500" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base sm:text-lg font-black uppercase text-amber-400 tracking-wide">
              NO ACADEMIES SCOUTING YOU
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Youth academies require at least <strong className="text-amber-300">50 Fame</strong> to scout your talent and extend an academy switch proposal.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-1.5">
            <div className="flex justify-between text-xs font-arcade">
              <span className="text-slate-400">Current Fame:</span>
              <span className="text-amber-300 font-black">{fame} / 50</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-900 border border-slate-700 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, (fame / 50) * 100))}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 block pt-1">
              Need {Math.max(0, 50 - fame)} more Fame to unlock same league academy transfers.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTab('rules')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View How to Earn Fame</span>
          </button>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm bg-slate-950/80 border border-slate-800 rounded-xl">
          No matching academies found in this category.
        </div>
      ) : (
        <div className="space-y-3.5">
          <ConsolePaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={displayedList.length}
            pageSize={pageSize}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {paginatedList.map(({ team, league, isInternational }) => {
              const school = getFootballSchoolForClub(team.name, team.youthLeague, '', team.country);

              return (
                <div
                  key={`${league.id}-${team.id}`}
                  className={`p-4 rounded-xl border-2 transition-all duration-150 flex flex-col justify-between ${
                    isInternational
                      ? 'bg-slate-950 border-indigo-500/60 hover:border-indigo-400'
                      : 'bg-slate-950 border-emerald-500/60 hover:border-emerald-400'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                          isInternational
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/50'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        }`}
                      >
                        {isInternational ? '🌍 International' : '📍 Same League'}
                      </span>

                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-xs font-arcade text-amber-300 font-black">
                        <span>OVR</span>
                        <span className="text-white">{team.ovr}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                        {team.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                        <span>{league.flag}</span>
                        <span className="font-semibold text-slate-200">{team.youthLeague}</span>
                        <span>•</span>
                        <span className="text-slate-400">{team.city}, {team.country}</span>
                      </div>
                    </div>

                    {school && (
                      <div className="text-xs text-slate-300 space-y-0.5 border-t border-slate-800 pt-2">
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                          ⚽ {school.name}
                        </div>
                        <p className="text-slate-400 text-xs leading-snug line-clamp-2">
                          {school.corePhilosophy}
                        </p>
                      </div>
                    )}

                    {isInternational && (
                      <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-900/80 text-xs text-indigo-200 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Qualifies for {team.country} nationality at age 18!</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400 leading-tight">
                      <span className="text-slate-300 font-semibold block">Pure Academy Switch</span>
                      <span>No salary • No bonuses</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmingTeam({ team, league, isInternational })}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isInternational
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                      }`}
                    >
                      <span>SWITCH</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {confirmingTeam && (
        <div
          id="change-academy-confirmation-backdrop"
          className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-sm p-3 sm:p-6 safe-top safe-bottom flex items-center justify-center overflow-y-auto"
        >
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-2xl p-5 space-y-4 text-slate-100 shadow-2xl my-auto">
            <div className="flex items-center gap-2.5 text-amber-400 text-sm uppercase font-black">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>CONFIRM ACADEMY TRANSFER</span>
            </div>

            <div className="space-y-3 text-sm text-slate-200">
              <p>
                Switch your youth academy to <strong className="text-white">{confirmingTeam.team.name}</strong>?
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">New League:</span>
                  <span className="text-emerald-300 font-bold text-right">{confirmingTeam.team.youthLeague}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white font-bold text-right">
                    {confirmingTeam.team.city}, {confirmingTeam.team.country}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Financial Terms:</span>
                  <span className="text-amber-300 font-bold text-right">€0 Salary • €0 Bonus</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic">
                You will immediately relocate and continue your season matches and development with {confirmingTeam.team.name}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmingTeam(null)}
                className="min-h-[46px] px-4 py-2 rounded-xl text-xs font-black uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSwitch}
                className="min-h-[46px] px-5 py-2 rounded-xl text-xs font-black uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-md"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
