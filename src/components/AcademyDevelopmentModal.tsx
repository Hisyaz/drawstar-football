import React, { useState } from 'react';
import { AcademySeasonApplicationResult } from '../types/youthFootballSchools';
import { Sparkles, Check, Building, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface AcademyDevelopmentModalProps {
  report: AcademySeasonApplicationResult;
  onClose: () => void;
}

export const AcademyDevelopmentModal: React.FC<AcademyDevelopmentModalProps> = ({
  report,
  onClose,
}) => {
  const { t } = useLanguage();
  const { school, positionCategory, allocatedStats, totalPoints } = report;
  const [activeTab, setActiveTab] = useState<'attributes' | 'philosophy'>('attributes');
  const [statPage, setStatPage] = useState(1);

  const pageSize = 4;
  const totalStatPages = Math.max(1, Math.ceil(allocatedStats.length / pageSize));
  const safeStatPage = Math.min(statPage, totalStatPages);
  const visibleStats = allocatedStats.slice((safeStatPage - 1) * pageSize, safeStatPage * pageSize);

  return (
    <ConsoleModalShell
      isOpen={true}
      onClose={onClose}
      showCloseButton={false}
      title={t('Club Development Complete')}
      subtitle={`${school.flag} ${school.name} (${t('Style #{num}', { num: `${school.styleNumber}` })})`}
      badge={`+${totalPoints} ${t('STAT PTS')}`}
      icon={<Building className="w-5 h-5 text-emerald-300" />}
      accentColor="emerald"
      maxWidthClass="sm:max-w-lg"
      tabs={[
        {
          id: 'attributes',
          label: `${t('Attributes Enhanced')} (${allocatedStats.length})`,
          icon: <Sparkles className="w-3.5 h-3.5" />,
        },
        {
          id: 'philosophy',
          label: t('Philosophy Ethos'),
          icon: <BookOpen className="w-3.5 h-3.5" />,
        },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'attributes' | 'philosophy')}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs sm:text-sm font-black px-5 py-3 rounded-xl border-2 border-emerald-200 shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 uppercase"
        >
          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>{t('Continue Career')}</span>
        </button>
      }
    >
      {activeTab === 'attributes' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold uppercase tracking-wider text-emerald-300">
              {t('Attributes Enhanced (+{pts} Stat Points Total)', { pts: `${totalPoints}` })}
            </span>
          </div>

          <ConsolePaginationBar
            currentPage={safeStatPage}
            totalPages={totalStatPages}
            onPageChange={setStatPage}
            totalItems={allocatedStats.length}
            pageSize={pageSize}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {visibleStats.map((stat) => {
              const pts = stat.statPointsInvested ?? stat.gain;
              const hasLevelUp = stat.gain > 0;
              const progPct = Math.round((stat.newProgress ?? 0) * 100);

              return (
                <div
                  key={stat.key}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 uppercase truncate">{t(stat.label)}</div>
                    <div className="text-xs text-slate-400 font-arcade mt-0.5">
                      {hasLevelUp ? (
                        <>
                          {stat.oldVal} → <strong className="text-white">{stat.newVal}</strong> (+{stat.gain})
                        </>
                      ) : (
                        <>
                          Lvl <strong className="text-white">{stat.newVal}</strong> ({progPct}%)
                        </>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-arcade font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
                    +{pts} PTS
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-400">
            {school.flag} {school.name} • {t('Club Training System')}
          </div>
          <ConsolePagedText
            resetKey={`${school.name}-${positionCategory}`}
            textSizeClass="text-sm sm:text-base"
            pages={[
              {
                heading: t('Philosophy Ethos'),
                paragraphs: [
                  `“${t(school.corePhilosophy)}”`,
                  t(
                    'Your club drilled your positional foundations ({category}) into their tactical DNA. Development points are invested directly as stat points advancing your attribute progress towards level ups and stat breaks.',
                    { category: t(positionCategory) }
                  ),
                ],
              },
            ]}
          />
        </div>
      )}
    </ConsoleModalShell>
  );
};

