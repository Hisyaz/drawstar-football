import React from 'react';
import { KeyMatchPlayMode, CAREER_PLAY_MODES } from '../utils/matchImportanceSystem';
import { useLanguage } from '../context/LanguageContext';
import { LanguagePickerButton } from './LanguagePickerModal';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';
import { Trophy, Flame, Gauge, CheckCircle2, Sparkles, ChevronRight, Check } from 'lucide-react';

interface CareerModeSelectorModalProps {
  isOpen: boolean;
  currentMode?: KeyMatchPlayMode;
  onSelectMode: (mode: KeyMatchPlayMode) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const CareerModeSelectorModal: React.FC<CareerModeSelectorModalProps> = ({
  isOpen,
  currentMode = 'decisive',
  onSelectMode,
  onClose,
  isInitialSetup = false,
}) => {
  const { t } = useLanguage();
  const [selected, setSelected] = React.useState<KeyMatchPlayMode>(currentMode || 'decisive');

  if (!isOpen) return null;

  const modes: KeyMatchPlayMode[] = ['slow', 'decisive', 'finals_only'];
  const selectedIndex = Math.max(0, modes.indexOf(selected));

  const handleConfirm = () => {
    onSelectMode(selected);
    if (onClose) onClose();
  };

  const getModeStyles = (modeKey: KeyMatchPlayMode, isSelected: boolean) => {
    switch (modeKey) {
      case 'slow':
        return {
          themeColor: 'blue',
          cardClass: isSelected
            ? 'bg-sky-950/70 border-2 border-sky-400 pixel-bevel-cyan shadow-[0_0_25px_rgba(56,189,248,0.25)] ring-1 ring-sky-300/40'
            : 'bg-slate-950/80 border-2 border-slate-800 hover:border-sky-500/60 pixel-bevel-raised hover:bg-sky-950/20',
          titleColor: 'text-sky-300',
          badgeClass: 'bg-sky-950 text-sky-300 border border-sky-500 pixel-bevel-cyan',
          iconColor: 'text-sky-400',
          buttonClass: isSelected
            ? 'bg-sky-400 text-slate-950 font-black pixel-bevel-cyan'
            : 'bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 pixel-bevel-raised',
          shortLabel: t('100% Matches'),
        };
      case 'decisive':
        return {
          themeColor: 'green',
          cardClass: isSelected
            ? 'bg-emerald-950/70 border-2 border-emerald-400 pixel-bevel-emerald shadow-[0_0_25px_rgba(52,211,153,0.25)] ring-1 ring-emerald-300/40'
            : 'bg-slate-950/80 border-2 border-slate-800 hover:border-emerald-500/60 pixel-bevel-raised hover:bg-emerald-950/20',
          titleColor: 'text-emerald-300',
          badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-500 pixel-bevel-emerald',
          iconColor: 'text-emerald-400',
          buttonClass: isSelected
            ? 'bg-emerald-400 text-slate-950 font-black pixel-bevel-emerald'
            : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 pixel-bevel-raised',
          shortLabel: t('~30% High Stakes'),
        };
      case 'finals_only':
        return {
          themeColor: 'red',
          cardClass: isSelected
            ? 'bg-rose-950/70 border-2 border-rose-400 pixel-bevel-crimson shadow-[0_0_25px_rgba(244,63,94,0.25)] ring-1 ring-rose-300/40'
            : 'bg-slate-950/80 border-2 border-slate-800 hover:border-rose-500/60 pixel-bevel-raised hover:bg-rose-950/20',
          titleColor: 'text-rose-300',
          badgeClass: 'bg-rose-950 text-rose-300 border border-rose-500 pixel-bevel-crimson',
          iconColor: 'text-rose-400',
          buttonClass: isSelected
            ? 'bg-rose-400 text-slate-950 font-black pixel-bevel-crimson'
            : 'bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 pixel-bevel-raised',
          shortLabel: t('~10% Finals Only'),
        };
    }
  };

  const renderModeDetailCard = (modeKey: KeyMatchPlayMode, isMobileSingle: boolean) => {
    const mode = CAREER_PLAY_MODES[modeKey];
    const isSelected = selected === modeKey;
    const style = getModeStyles(modeKey, isSelected);

    return (
      <div
        key={modeKey}
        id={isMobileSingle ? `career-mode-mobile-option-${modeKey}` : `career-mode-option-${modeKey}`}
        onClick={() => setSelected(modeKey)}
        className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-xl transition-all duration-150 cursor-pointer space-y-4 ${style.cardClass}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-[11px] font-mono font-black uppercase px-2.5 py-0.5 ${style.badgeClass}`}>
              {t(mode.badge)}
            </span>

            {mode.recommendedTag && (
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-amber-400 text-slate-950 pixel-bevel-gold font-mono">
                ★ {t(mode.recommendedTag)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-lg sm:text-xl font-black uppercase tracking-wider pixel-text-shadow ${style.titleColor}`}>
              {t(mode.name)}
            </h3>
            <div className={style.iconColor}>
              {modeKey === 'slow' ? (
                <Gauge className="w-6 h-6" />
              ) : modeKey === 'decisive' ? (
                <Flame className="w-6 h-6" />
              ) : (
                <Trophy className="w-6 h-6" />
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
            {t(mode.tagline)}
          </p>

          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {t(mode.description)}
          </p>

          <ul className="space-y-2 pt-2 border-t border-slate-800/80">
            {mode.highlights.map((h, i) => (
              <li key={i} className="text-sm sm:text-xs text-slate-200 flex items-start gap-2 leading-relaxed font-sans">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${style.iconColor}`} />
                <span>{t(h)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            {style.shortLabel}
          </span>

          <button
            id={isMobileSingle ? `career-mode-mobile-btn-select-${modeKey}` : `career-mode-btn-select-${modeKey}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelected(modeKey);
            }}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${style.buttonClass}`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t('SELECTED')}</span>
              </>
            ) : (
              <span>{t('SELECT')}</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <ConsoleModalShell
      id="career-mode-selector-modal-card"
      isOpen={isOpen}
      onClose={onClose}
      closeDisabled={isInitialSetup || !onClose}
      showCloseButton={Boolean(onClose && !isInitialSetup)}
      title={t('Select Match Importance Mode')}
      subtitle={`${t('Choose how frequently you step onto the pitch for interactive')} ${t('Key Matches')}.`}
      badge={isInitialSetup ? t('NEW UNIQUE CAREER CONFIGURATION') : t('CAREER MATCH ENGINE SETTINGS')}
      icon={<Sparkles className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-5xl"
      headerRight={<LanguagePickerButton />}
      bodyClassName="p-3 sm:p-5 space-y-4"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div id="career-mode-active-summary" className="text-xs sm:text-sm text-slate-300 text-center sm:text-left font-mono">
            {t('Active Mode:')} <strong className="text-amber-400 uppercase">{t(CAREER_PLAY_MODES[selected].name)}</strong> — {t(CAREER_PLAY_MODES[selected].badge)}
          </div>

          <button
            id="career-mode-btn-confirm"
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black font-mono text-xs sm:text-sm uppercase tracking-wider border-2 border-amber-300 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{isInitialSetup ? t('Confirm Career Mode & Continue') : t('Save Match Settings')}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      }
    >
      {/* MOBILE: CONSOLE MODE PAGE SWITCHER (1 MODE AT A TIME, ZERO SCROLL CRAM) */}
      <div className="md:hidden space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {modes.map((modeKey) => {
            const mode = CAREER_PLAY_MODES[modeKey];
            const isActive = selected === modeKey;
            return (
              <button
                key={modeKey}
                type="button"
                onClick={() => setSelected(modeKey)}
                className={`min-h-[44px] px-2 py-2 rounded-lg border text-[11px] font-arcade font-black uppercase truncate cursor-pointer transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-200'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {t(mode.badge)}
              </button>
            );
          })}
        </div>

        <ConsolePaginationBar
          currentPage={selectedIndex + 1}
          totalPages={modes.length}
          onPageChange={(p) => setSelected(modes[p - 1])}
          label="MODE"
        />

        {renderModeDetailCard(selected, true)}
      </div>

      {/* DESKTOP: 3-COLUMN SIDE-BY-SIDE MODE COMPARISON */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {modes.map((modeKey) => renderModeDetailCard(modeKey, false))}
      </div>
    </ConsoleModalShell>
  );
};
