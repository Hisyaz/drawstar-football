import React, { useState, useEffect } from 'react';
import { PlayerConfig } from '../types';
import { Building2, Home, ArrowRight } from 'lucide-react';
import { isPerformanceModeActive, shouldDisableAnimations } from '../utils/graphicSettingsSystem';
import { useLanguage } from '../context/LanguageContext';

interface YouthClubCinematicModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  isBigClub: boolean;
  onProceed: () => void;
}

export const YouthClubCinematicModal: React.FC<YouthClubCinematicModalProps> = ({
  isOpen,
  player,
  isBigClub,
  onProceed,
}) => {
  const { t } = useLanguage();
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const localText =
    t('YOUTH_CINEMATIC_LOCAL_TEXT') ||
    `Tu viaje empieza cerca de casa.\n\nEste es el club de barrio por el que pasaste caminando mil veces.\n\nTe acordás de ver a los chicos más grandes jugar acá y soñar con ponerte la misma camiseta.\n\nAhora, por primera vez, entrás a esta cancha siendo uno de ellos.\n\nEl viaje empieza acá.`;

  const bigClubText =
    t('YOUTH_CINEMATIC_BIG_CLUB_TEXT') ||
    `Tu viaje empieza con sacrificio.\n\nCada entrenamiento te exige un viaje larguísimo, a casi tres horas de tu casa.\n\nEl viaje es agotador, pero el momento en que pisás el predio todo cobra sentido.\n\nEste es un escenario mucho más grande.\n\nEl nivel es altísimo.\n\nAhora tenés que demostrar que estás a la altura.`;

  const fullText = isBigClub ? bigClubText : localText;

  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      setIsTypingComplete(false);
      return;
    }

    // In performance mode or with animations disabled, show immediately without lag
    if (isPerformanceModeActive() || shouldDisableAnimations()) {
      setDisplayedText(fullText);
      setIsTypingComplete(true);
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    // Fast, ultra-responsive typewriter pacing using requestAnimationFrame / time delta to avoid background throttling
    const startTime = performance.now();
    const charsPerSec = 180; // 180 chars per second
    let animId: number;

    const tick = (now: number) => {
      if (isPerformanceModeActive() || shouldDisableAnimations()) {
        setDisplayedText(fullText);
        setIsTypingComplete(true);
        return;
      }
      const elapsed = (now - startTime) / 1000;
      currentIndex = Math.min(fullText.length, Math.floor(elapsed * charsPerSec) + 6);
      setDisplayedText(fullText.slice(0, currentIndex));

      if (currentIndex < fullText.length) {
        animId = requestAnimationFrame(tick);
      } else {
        setDisplayedText(fullText);
        setIsTypingComplete(true);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isOpen, fullText]);

  const handleSkipTyping = () => {
    if (!isTypingComplete) {
      setDisplayedText(fullText);
      setIsTypingComplete(true);
    }
  };

  // Keyboard shortcut: Space or Enter to reveal text or proceed
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!isTypingComplete) {
          e.preventDefault();
          handleSkipTyping();
        } else {
          e.preventDefault();
          onProceed();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isTypingComplete, fullText, onProceed]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 h-[100dvh] w-full bg-black/95 backdrop-blur-md flex items-center justify-center sm:p-4 font-pixel select-none"
      onClick={!isTypingComplete ? handleSkipTyping : undefined}
    >
      <div
        className="bg-slate-950 sm:border-2 border-amber-500 sm:rounded-2xl max-w-2xl w-full h-full sm:h-auto sm:max-h-[90dvh] flex flex-col shadow-2xl relative overflow-hidden cursor-default"
        onClick={(e) => {
          if (!isTypingComplete) {
            e.stopPropagation();
            handleSkipTyping();
          }
        }}
      >
        <header className="p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-950 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest mx-auto font-arcade">
            {isBigClub ? <Building2 className="w-3.5 h-3.5 text-amber-400" /> : <Home className="w-3.5 h-3.5 text-blue-400" />}
            {isBigClub
              ? t('JOINING_BIG_ACADEMY') || 'INCORPORACIÓN A GRAN ACADEMIA JUVENIL'
              : t('JOINING_LOCAL_CLUB') || 'INCORPORACIÓN AL CLUB DE BARRIO LOCAL'}
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {player.club || 'Youth Academy'}
            </h2>
            <p className="text-xs text-amber-400 tracking-widest uppercase">
              {player.city || 'Home City'} • {t('YOUTH_LEAGUE_U10') || 'LIGA JUVENIL U10'}
            </p>
          </div>
        </header>

        <div
          className="px-4 py-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain relative cursor-pointer"
          onClick={handleSkipTyping}
          title={!isTypingComplete ? 'Click to reveal entire narrative instantly' : undefined}
        >
          <div className="max-w-xl mx-auto text-left text-slate-100 font-mono text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line select-text">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-2.5 h-5 ml-1 bg-amber-400 animate-pulse align-middle shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            )}
            {!isTypingComplete && (
              <div className="mt-4 text-xs text-amber-400/90 font-mono flex items-center justify-between border-t border-slate-800 pt-2.5 select-none">
                <span>⚡ {t('FAST_CINEMATIC_TEXT') || 'Texto Cinemático Rápido'}</span>
                <span className="font-bold">{t('CLICK_OR_SPACE_SKIP') || 'TOCAR O ESPACIO ▶'}</span>
              </div>
            )}
          </div>
        </div>

        <footer className="px-4 py-3 sm:p-4 border-t border-slate-800 bg-slate-950 shrink-0 safe-bottom flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {!isTypingComplete && (
            <button
              type="button"
              onClick={handleSkipTyping}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer uppercase"
            >
              {t('CLICK_OR_SPACE_SKIP') || 'SKIP TEXT'}
            </button>
          )}
          <button
            type="button"
            onClick={onProceed}
            className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group uppercase"
          >
            <span>{t('MEET_YOUR_YOUTH_MANAGER') || 'CONOCÉ A TU DT JUVENIL'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </footer>
      </div>
    </div>
  );
};
