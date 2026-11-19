import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, TrendingUp, Award, ShieldAlert, ArrowRight, CheckCircle2, Flame, HeartPulse } from 'lucide-react';
import { ConsoleModalShell, ConsolePaginationBar, ConsolePagedText } from './common/ConsolePager';

export type LifecycleMilestoneType = 'age_10' | 'age_20' | 'age_28' | 'age_33';

export interface LifecycleMilestoneData {
  type: LifecycleMilestoneType;
  age: number;
}

interface CareerLifecycleMilestoneModalProps {
  isOpen: boolean;
  data: LifecycleMilestoneData | null;
  onClose: () => void;
}

export const CareerLifecycleMilestoneModal: React.FC<CareerLifecycleMilestoneModalProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  const { t } = useLanguage();
  const [age10Page, setAge10Page] = useState(1);

  useEffect(() => {
    if (isOpen) setAge10Page(1);
  }, [isOpen, data?.type]);

  if (!isOpen || !data) return null;

  const { type, age } = data;

  const accentColor =
    type === 'age_10'
      ? 'emerald'
      : type === 'age_20'
      ? 'blue'
      : type === 'age_28'
      ? 'amber'
      : 'rose';

  const title =
    type === 'age_10'
      ? t('Player Development System')
      : type === 'age_20'
      ? t('Adulthood & Pro Level Reached')
      : type === 'age_28'
      ? t('Physical Peak Reached')
      : t('Physical Regression Begins');

  const subtitle =
    type === 'age_10'
      ? t('Career Guidance • Age {age}', { age })
      : type === 'age_20'
      ? t('Career Milestone • Age {age}', { age })
      : type === 'age_28'
      ? t('Peak Athletic Window • Age {age}', { age })
      : t('Veteran Phase • Age {age}', { age });

  const icon =
    type === 'age_10' ? (
      <Sparkles className="w-5 h-5 text-emerald-300" />
    ) : type === 'age_20' ? (
      <TrendingUp className="w-5 h-5 text-blue-300" />
    ) : type === 'age_28' ? (
      <Award className="w-5 h-5 text-amber-300" />
    ) : (
      <HeartPulse className="w-5 h-5 text-rose-300 animate-pulse" />
    );

  const ctaLabel =
    type === 'age_10'
      ? t('Understood • Continue Career')
      : type === 'age_20'
      ? t('Continue to Age 20 Season')
      : type === 'age_28'
      ? t('Acknowledge Physical Peak')
      : t('Accept Veteran Reality');

  const ctaClass =
    type === 'age_10'
      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950'
      : type === 'age_20'
      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:brightness-110 text-white'
      : type === 'age_28'
      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-slate-950'
      : 'bg-gradient-to-r from-rose-500 to-red-600 hover:brightness-110 text-white';

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      showCloseButton={false}
      maxWidthClass="sm:max-w-2xl"
      accentColor={accentColor}
      title={title}
      subtitle={subtitle}
      badge={`AGE ${age}`}
      icon={icon}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={`w-full min-h-[48px] px-5 rounded-xl font-black font-arcade text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer active:scale-95 ${ctaClass}`}
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
        </button>
      }
    >
      <div className="p-4 sm:p-6 space-y-4">
        {type === 'age_10' && (
          <div className="space-y-4">
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
              {t('Welcome to the structured Club Development System! Your progression is designed to mirror a real football career trajectory:')}
            </p>

            <div className="sm:hidden">
              <ConsolePaginationBar
                currentPage={age10Page}
                totalPages={2}
                onPageChange={setAge10Page}
                label="PHASES"
              />
            </div>

            <div className="space-y-3">
              {(age10Page === 1 ? true : false) && (
                <>
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                    <div className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs shrink-0">
                      10-19
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-emerald-300 text-sm">{t('Youth Foundation Phase (Ages 10–19)')}</div>
                      <div className="text-xs sm:text-sm text-slate-200 space-y-1 mt-1">
                        <div>• <strong className="text-emerald-400">{t('+15 Personal Stat Points')}</strong> {t('to allocate directly into your attributes every season.')}</div>
                        <div>• <strong className="text-amber-300">{t('Club Academy Development')}</strong>: {t("Automatic position growth based on your club's Tier & Football Philosophy.")}</div>
                        <div>• <strong className="text-blue-300">{t('Weekly Training')}</strong>: {t('Complete drill sessions to earn bonus attribute increments.')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
                    <div className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-black text-xs shrink-0">
                      20-27
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-blue-300 text-sm">{t('Professional Prime Phase')}</div>
                      <div className="text-xs sm:text-sm text-slate-200 mt-0.5">
                        {t('Development stabilizes at')} <span className="font-bold text-blue-400">{t('+5 Stat Points')}</span> {t('per season as you compete at senior professional speed.')}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className={`${age10Page === 2 ? 'block' : 'hidden sm:block'} space-y-3`}>
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
                  <div className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs shrink-0">
                    28-32
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-amber-300 text-sm">{t('Physical Peak Window')}</div>
                    <div className="text-xs sm:text-sm text-slate-200 mt-0.5">
                      {t('Stat point generation ceases')} (<span className="font-bold text-amber-400">{t('0 Points/Year')}</span>). {t('You reach your absolute physical maximum.')}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
                  <div className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-black text-xs shrink-0">
                    33+
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-rose-300 text-sm">{t('Natural Physical Regression')}</div>
                    <div className="text-xs sm:text-sm text-slate-200 mt-0.5">
                      {t('Natural aging sets in:')} <span className="font-bold text-rose-400">{t('-3 Pace, -3 Stamina, and -3 Strength')}</span> {t('lost every season until retirement.')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-xs sm:text-sm text-slate-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('Stat points are fully preserved in your pool until you choose to assign them!')}</span>
            </div>
          </div>
        )}

        {type === 'age_20' && (
          <div className="space-y-4">
            <ConsolePagedText
              paragraphs={[
                `"${t("Teenage years are over, your development will continue but slower since you already reached a pro level of development, you'll still keep learning and developing your playstyle as you get experience, and that at 28 it'll stop and you'll start slowly downgrading from there after reaching physical peak.")}"`,
              ]}
              textSizeClass="text-sm sm:text-base text-slate-100 italic leading-relaxed"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <span className="text-slate-400 font-mono text-xs">{t('Current Phase')}</span>
                <span className="font-bold text-blue-400 text-sm sm:text-base mt-1">{t('Senior Pro Development')}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <span className="text-slate-400 font-mono text-xs">{t('Annual Stat Points')}</span>
                <span className="font-bold text-emerald-400 text-sm sm:text-base mt-1">{t('+5 PTS / Season')}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('Take advantage of training focus, coaching staff, and performance facilities to maximize your remaining growth window before Age 28.')}
            </p>
          </div>
        )}

        {type === 'age_28' && (
          <div className="space-y-4">
            <ConsolePagedText
              paragraphs={[
                `"${t('You reached your physical peak! You can keep working to retain your ability, but development points have capped and you will start to slowly degrade from here.')}"`,
              ]}
              textSizeClass="text-sm sm:text-base text-slate-100 italic leading-relaxed"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <span className="text-slate-400 font-mono text-xs">{t('Current Status')}</span>
                <span className="font-bold text-amber-400 text-sm sm:text-base mt-1">{t('Athletic Peak (Capped)')}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <span className="text-slate-400 font-mono text-xs">{t('Annual Stat Points')}</span>
                <span className="font-bold text-slate-200 text-sm sm:text-base mt-1">{t('0 PTS / Season')}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-700/40 text-xs sm:text-sm text-amber-200 flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{t('Maintain peak match ratings and invest in recovery & performance upgrades to delay physical decline!')}</span>
            </div>
          </div>
        )}

        {type === 'age_33' && (
          <div className="space-y-4">
            <ConsolePagedText
              paragraphs={[
                `"${t("From now on you'll regress from this point onward. You'll start losing -3 in physical stats (all of them: Pace, Stamina, and Strength) every year until retirement.")}"`,
              ]}
              textSizeClass="text-sm sm:text-base text-slate-100 italic leading-relaxed"
            />

            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2.5">
              <div className="flex items-center gap-2 text-red-300 font-bold text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{t('Annual Physical Decay Active:')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-red-500/30">
                  <div className="text-slate-400 text-xs">{t('PACE')}</div>
                  <div className="font-black text-rose-400 text-sm sm:text-base">-3 / {t('yr')}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-red-500/30">
                  <div className="text-slate-400 text-xs">{t('STAMINA')}</div>
                  <div className="font-black text-rose-400 text-sm sm:text-base">-3 / {t('yr')}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-red-500/30">
                  <div className="text-slate-400 text-xs">{t('STRENGTH')}</div>
                  <div className="font-black text-rose-400 text-sm sm:text-base">-3 / {t('yr')}</div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('Tip: The {item} lifestyle upgrade mitigates decay to -2/yr and provides +5 retirement protection years.', { item: t('World-Class Football Performance Center') })}
            </p>
          </div>
        )}
      </div>
    </ConsoleModalShell>
  );
};

