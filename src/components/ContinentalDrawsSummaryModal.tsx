import React from 'react';
import { ArrowRight, AlertCircle, Eye, Calendar, Trophy } from 'lucide-react';
import { ContinentalCompetitionId } from '../types/continentalCompetitions';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell } from './common/ConsolePager';

interface ContinentalDrawsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectTournamentDraw?: (compId: ContinentalCompetitionId) => void;
  isSouthAmerica?: boolean;
  region?: 'europe' | 'south_america' | 'other';
  playerClub?: string;
  playerLeague?: string;
  seasonYear?: string;
  onProceedToBlock?: () => void;
  player?: any;
}

export const ContinentalDrawsSummaryModal: React.FC<ContinentalDrawsSummaryModalProps> = ({
  isOpen,
  onClose,
  onInspectTournamentDraw,
  isSouthAmerica,
  region,
  playerClub,
  playerLeague,
  seasonYear = '2026/27',
  onProceedToBlock,
  player,
}) => {
  const { t } = useLanguage();

  const isSA = isSouthAmerica !== undefined ? isSouthAmerica : region === 'south_america';
  const effectiveClub = playerClub || player?.club || 'Your Club';
  const effectiveLeague = playerLeague || player?.league || 'First Division';

  const comps: { id: ContinentalCompetitionId; title: string; subtitle: string; icon: string; bgGradient: string }[] = isSA
    ? [
        {
          id: 'CONMEBOL_LIB',
          title: 'Copa De Proceres',
          subtitle: t('COMP_SUBTITLE_LIB') || '32 Clubs • 8 Groups of 4',
          icon: '👑',
          bgGradient: 'from-amber-950/40 to-slate-900',
        },
        {
          id: 'CONMEBOL_SUD',
          title: 'Sudaca',
          subtitle: t('COMP_SUBTITLE_SUD') || '32 Clubs • 8 Groups of 4',
          icon: '🌐',
          bgGradient: 'from-sky-950/40 to-slate-900',
        },
      ]
    : [
        {
          id: 'UEFA_CL',
          title: 'European Winners League',
          subtitle: t('COMP_SUBTITLE_UCL') || '36 Elite European Clubs • Swiss League Stage',
          icon: '⭐',
          bgGradient: 'from-blue-950/40 to-slate-900',
        },
        {
          id: 'UEFA_EL',
          title: 'European Euroleague',
          subtitle: t('COMP_SUBTITLE_UEL') || '36 Clubs • Swiss League Stage',
          icon: '🛡️',
          bgGradient: 'from-orange-950/40 to-slate-900',
        },
        {
          id: 'UEFA_ECL',
          title: 'European Confederations Cup',
          subtitle: t('COMP_SUBTITLE_UECL') || '36 Clubs • 6 Matchdays Stage',
          icon: '🏆',
          bgGradient: 'from-emerald-950/40 to-slate-900',
        },
      ];

  const headerTitle = isSA
    ? `${seasonYear} ${t('CONMEBOL_DRAWS_COMPLETED') || 'Sudamericonferencia Continental Draws Completed'}`
    : `${seasonYear} ${t('EUROPEAN_DRAWS_COMPLETED') || 'European Competition Draws Completed'}`;

  const phaseLabel = isSA
    ? t('JULY_MIDSEASON_STOP') || 'JULY MID-SEASON STOP • CONTINENTAL DRAWS'
    : t('AUGUST_PRESEASON_DRAWS') || 'AUGUST PRESEASON • EUROPEAN DRAWS';

  const nextBlockLabel = isSA
    ? t('SUMMER_BLOCK_SA') || 'Summer Block (August → December)'
    : t('SUMMER_BLOCK_EU') || 'Summer Block (August → January)';

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={headerTitle}
      subtitle={phaseLabel}
      badge={seasonYear}
      icon={<Trophy className="w-5 h-5 text-amber-400" />}
      accentColor={isSA ? 'amber' : 'blue'}
      maxWidthClass="sm:max-w-2xl"
      zIndexClass="z-[110]"
      bodyClassName="p-3.5 sm:p-6 space-y-4"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onProceedToBlock || onClose}
            className="min-h-[48px] w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <span className="truncate">{t('PROCEED_TO', { block: nextBlockLabel }) || `Proceed to ${nextBlockLabel}`}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      }
    >
      {/* Phase Tag */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-black uppercase tracking-wider text-slate-200">
        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{phaseLabel}</span>
      </div>

      {/* Club Qualification Status Card */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-sm font-black shrink-0">
              🛡️
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-black text-white truncate">{effectiveClub}</h4>
              <p className="text-xs text-slate-400 truncate">{effectiveLeague}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold shrink-0">
            {t('DOMESTIC_FOCUS') || 'Domestic Focus'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-100 text-sm flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>{t('NOT_PARTICIPATING_CONTINENTAL') || 'Not participating in continental tournaments this season.'}</strong>{' '}
            {t('FOCUS_DOMESTIC_CAMPAIGN') || 'You will focus 100% of physical conditioning on the domestic league and cup campaign!'}
          </span>
        </div>
      </div>

      {/* Competitions Draw Status */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {t('OFFICIAL_TOURNAMENT_DRAWS_CONDUCTED') || 'Official Tournament Draws Conducted:'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {comps.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-xl bg-gradient-to-br ${c.bgGradient} border border-slate-800 flex items-center justify-between gap-2.5 hover:border-slate-700 transition`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">{c.icon}</span>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-sm font-black text-white truncate">{c.title}</h5>
                  <p className="text-xs text-slate-400 truncate">{c.subtitle}</p>
                </div>
              </div>
              {onInspectTournamentDraw && (
                <button
                  type="button"
                  onClick={() => onInspectTournamentDraw(c.id)}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0"
                  title={`Inspect ${c.title} Draw`}
                >
                  <Eye className="w-4 h-4 text-slate-200" />
                  <span>{t('INSPECT') || 'Inspect'}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </ConsoleModalShell>
  );
};
