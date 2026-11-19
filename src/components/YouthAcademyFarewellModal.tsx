import React, { useState } from 'react';
import {
  Trophy,
  Award,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Scroll,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { PlayerConfig } from '../types';
import { compileYouthCareerSummary, YouthCareerSummary } from '../utils/age16TransferSystem';
import { t } from '../utils/localizationSystem';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface YouthAcademyFarewellModalProps {
  player: PlayerConfig;
  isOpen: boolean;
  onProceedToOffers: () => void;
  onClose?: () => void;
}

export const YouthAcademyFarewellModal: React.FC<YouthAcademyFarewellModalProps> = ({
  player,
  isOpen,
  onProceedToOffers,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'honors' | 'letter'>('stats');
  const [honorsPage, setHonorsPage] = useState(1);

  if (!isOpen) return null;

  const summary: YouthCareerSummary = compileYouthCareerSummary(player);
  const combinedHonors = [
    ...summary.trophies.map((tr) => ({
      id: `trophy-${tr.id}`,
      type: 'trophy' as const,
      tag: tr.category,
      title: tr.title,
      description: tr.description,
    })),
    ...summary.awards.map((aw) => ({
      id: `award-${aw.id}`,
      type: 'award' as const,
      tag: t('YOUTH_GRADUATION_INDIVIDUAL_AWARD'),
      title: aw.title,
      description: aw.description,
    })),
  ];
  const honorsPerPage = 4;
  const totalHonorsPages = Math.max(1, Math.ceil(combinedHonors.length / honorsPerPage));
  const safeHonorsPage = Math.min(honorsPage, totalHonorsPages);
  const visibleHonors = combinedHonors.slice(
    (safeHonorsPage - 1) * honorsPerPage,
    safeHonorsPage * honorsPerPage
  );

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose || onProceedToOffers}
      showCloseButton={Boolean(onClose)}
      id="youth-academy-farewell-modal"
      title={t('YOUTH_GRADUATION_TITLE')}
      subtitle={`${summary.playerName} • ${summary.academyName} (${summary.startAge} → ${summary.graduatingAge})`}
      badge={`${t('YOUTH_GRADUATION_OFFICIAL_MILESTONE')} • ${t('YOUTH_GRADUATION_AGE17_TAG')}`}
      icon={<GraduationCap className="w-5 h-5 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-3xl"
      tabs={[
        { id: 'stats', label: t('YOUTH_GRADUATION_STATS_TITLE'), icon: <Activity className="w-3.5 h-3.5" /> },
        {
          id: 'honors',
          label: `${t('YOUTH_GRADUATION_HONORS_TITLE')} (${combinedHonors.length})`,
          icon: <Trophy className="w-3.5 h-3.5" />,
        },
        { id: 'letter', label: t('YOUTH_GRADUATION_LETTER_TITLE'), icon: <Scroll className="w-3.5 h-3.5" /> },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'stats' | 'honors' | 'letter')}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-2">
            <span className="font-bold text-white">{player.name}</span>
            <span>•</span>
            <span>
              OVR: <strong className="text-amber-400">{player.ovr}</strong>
            </span>
            <span>•</span>
            <span>
              Fame: <strong className="text-amber-400">{player.fame || 0}</strong>
            </span>
          </div>
          <button
            id="proceed-to-pro-career-btn"
            type="button"
            onClick={onProceedToOffers}
            className="w-full sm:w-auto min-h-[48px] px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-amber-200 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer uppercase"
          >
            <span>{t('YOUTH_GRADUATION_PROCEED_BTN')}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      }
    >
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-amber-400 font-bold uppercase">
                {t('YOUTH_GRADUATION_ACADEMY_PRODIGY')}
              </div>
              <div className="text-base sm:text-lg font-black text-white">{summary.playerName}</div>
              <div className="text-xs text-slate-400">
                {summary.academyName} • Ages {summary.startAge} → {summary.graduatingAge}
              </div>
            </div>
            <div className="text-right">
              <div className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase">
                {t('YOUTH_GRADUATION_CHAPTER_COMPLETE')}
              </div>
              <div className="text-xs font-semibold text-emerald-400 mt-1">
                {t('YOUTH_GRADUATION_FINAL_STATUS')}:{' '}
                <strong className="text-white">{summary.finalYouthStatus}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_MATCHES')}</div>
              <div className="text-lg font-black text-white mt-0.5 font-arcade">{summary.totalMatches}</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_GOALS')}</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5 font-arcade">{summary.totalGoals}</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_ASSISTS')}</div>
              <div className="text-lg font-black text-cyan-400 mt-0.5 font-arcade">{summary.totalAssists}</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_MVPS')}</div>
              <div className="text-lg font-black text-amber-400 mt-0.5 font-arcade">{summary.totalMvps}</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_AVG_RATING')}</div>
              <div className="text-lg font-black text-purple-300 mt-0.5 font-arcade">{summary.avgRating}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{t('YOUTH_GRADUATION_DEV_TITLE')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_START_OVR')}</div>
                <div className="text-lg font-black text-slate-300 mt-0.5 font-arcade">{summary.startOvr}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_FINAL_OVR')}</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5 font-arcade">{summary.finalOvr}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_OVR_GAIN')}</div>
                <div className="text-lg font-black text-amber-400 mt-0.5 font-arcade">+{summary.ovrGrowth}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('YOUTH_GRADUATION_FAME_GAINED')}</div>
                <div className="text-lg font-black text-cyan-400 mt-0.5 font-arcade">+{summary.fameGained}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'honors' && (
        <div className="space-y-3">
          {combinedHonors.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400 bg-slate-950 border border-slate-800 rounded-xl">
              No academy trophies or individual awards recorded yet.
            </div>
          ) : (
            <>
              <ConsolePaginationBar
                currentPage={safeHonorsPage}
                totalPages={totalHonorsPages}
                onPageChange={setHonorsPage}
                totalItems={combinedHonors.length}
                pageSize={honorsPerPage}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visibleHonors.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-3"
                  >
                    <div
                      className={`p-2 rounded-lg border shrink-0 ${
                        item.type === 'trophy'
                          ? 'bg-amber-500/20 border-amber-400/40 text-amber-400'
                          : 'bg-blue-500/20 border-blue-400/40 text-blue-400'
                      }`}
                    >
                      {item.type === 'trophy' ? <Trophy className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-[10px] font-bold uppercase ${
                          item.type === 'trophy' ? 'text-amber-400' : 'text-blue-400'
                        }`}
                      >
                        {item.tag}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white">{item.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 leading-snug">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'letter' && (
        <div className="space-y-4">
          <ConsolePagedText
            resetKey={`${summary.playerName}-${summary.academyName}`}
            textSizeClass="text-sm sm:text-base"
            paragraphs={[`“${summary.directorFarewellLetter}”`]}
            maxCharsPerPage={360}
          />
          <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-start gap-2.5 text-amber-200 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="text-amber-300">{t('YOUTH_GRADUATION_NEXT_STAGE')}:</strong>{' '}
              {t('YOUTH_GRADUATION_NEXT_STAGE_DESC')}
            </div>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
