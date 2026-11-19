import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ParentCardInstance } from '../types/parentCards';
import { getParentCardIntroStory, isWastedTalentArchetype } from '../utils/parentCardIntroSystem';
import { getRarityBadgeText } from '../utils/parentCardSystem';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  FastForward,
  ChevronRight,
  Sparkles,
  Flame,
  AlertTriangle,
  Check,
  Zap,
} from 'lucide-react';
import { haptics } from '../utils/hapticsSystem';
import { isPerformanceModeActive, shouldDisableAnimations } from '../utils/graphicSettingsSystem';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface ParentCardIntroModalProps {
  card: ParentCardInstance;
  playerType?: string;
  onConfirm: () => void;
}

export const ParentCardIntroModal: React.FC<ParentCardIntroModalProps> = ({
  card,
  playerType,
  onConfirm,
}) => {
  const { language, t } = useLanguage();
  const isWasted = isWastedTalentArchetype(playerType);

  // Story Text based on parent card type, rarity tier, player archetype, and language
  const fullStoryText = getParentCardIntroStory(card.typeId, card.rarity, playerType, language);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const storyParagraphs = useMemo(() => {
    const raw = (fullStoryText || '').trim();
    if (!raw) return [];
    const byNewline = raw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    if (byNewline.length > 1) return byNewline;
    // Split single long paragraph by sentences into clean ~260-320 char chunks
    const sentences = raw.match(/[^.!?]+[.!?]+(\s|$)/g) || [raw];
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      if (current.length > 0 && current.length + s.length > 280) {
        chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length > 0 ? chunks : [raw];
  }, [fullStoryText]);

  // Fluid, fast, letter-by-letter typewriter effect with natural literary cadence
  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);

    if (!fullStoryText) {
      setIsTypingComplete(true);
      return;
    }

    if (isPerformanceModeActive() || shouldDisableAnimations()) {
      setDisplayedText(fullStoryText);
      setIsTypingComplete(true);
      return;
    }

    let currentIndex = 0;
    const startTime = performance.now();
    const charsPerSec = 180;
    let animId: number;

    const tick = (now: number) => {
      if (isPerformanceModeActive() || shouldDisableAnimations()) {
        setDisplayedText(fullStoryText);
        setIsTypingComplete(true);
        return;
      }

      const elapsed = (now - startTime) / 1000;
      currentIndex = Math.min(fullStoryText.length, Math.floor(elapsed * charsPerSec) + 4);
      setDisplayedText(fullStoryText.slice(0, currentIndex));

      if (currentIndex < fullStoryText.length) {
        animId = requestAnimationFrame(tick);
      } else {
        setDisplayedText(fullStoryText);
        setIsTypingComplete(true);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [fullStoryText]);

  const handleSkipTyping = useCallback(() => {
    setDisplayedText(fullStoryText);
    setIsTypingComplete(true);
    haptics.buttonPress();
  }, [fullStoryText]);

  const handleProceed = useCallback(() => {
    haptics.success();
    onConfirm();
  }, [onConfirm]);

  // Keyboard navigation: Space or Enter reveals text or proceeds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isTypingComplete) {
          handleSkipTyping();
        } else {
          handleProceed();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTypingComplete, handleSkipTyping, handleProceed]);

  const progressPercent = Math.min(
    100,
    Math.round((displayedText.length / Math.max(1, fullStoryText.length)) * 100)
  );

  return (
    <ConsoleModalShell
      isOpen={true}
      showCloseButton={false}
      zIndexClass="z-[10000]"
      maxWidthClass="sm:max-w-5xl"
      accentColor={isWasted ? 'rose' : 'amber'}
      title={getRarityBadgeText(card.rarity, card.name)}
      subtitle={`${card.rarity === 'iconic' ? '★ ICONIC' : card.rarity.toUpperCase()} PARENT • ${card.name}`}
      badge="AGE 10 PROLOGUE"
      icon={
        isWasted ? (
          <Flame className="w-5 h-5 text-red-400" />
        ) : (
          <BookOpen className="w-5 h-5 text-amber-400" />
        )
      }
      headerRight={
        !isTypingComplete ? (
          <button
            type="button"
            onClick={handleSkipTyping}
            className="min-h-[44px] px-3 text-xs font-arcade uppercase tracking-wider text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <FastForward className="w-4 h-4 text-amber-400" />
            <span>{t('INSTANT_REVEAL') || 'REVEAL'}</span>
          </button>
        ) : undefined
      }
      bodyClassName="flex flex-col"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 min-w-0">
            {isTypingComplete ? (
              <span className="font-sans text-emerald-400 flex items-center gap-1.5 font-bold truncate">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {t('STORY_REVEALED_PROCEED') || 'Origin Story Revealed • Ready for Early Career Choices'}
              </span>
            ) : (
              <span className="font-sans text-amber-300 flex items-center gap-1.5 truncate">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                {t('WRITING_STORY_LETTER_BY_LETTER') || 'Writing childhood origin story...'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto sm:ml-auto">
            {!isTypingComplete && (
              <button
                type="button"
                onClick={handleSkipTyping}
                className="flex-1 sm:flex-initial min-h-[48px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-arcade text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
              >
                {t('INSTANT_REVEAL') || 'INSTANT REVEAL'}
              </button>
            )}
            <button
              type="button"
              onClick={handleProceed}
              className={`flex-1 sm:flex-initial min-h-[48px] px-6 rounded-xl ${
                isWasted
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 hover:brightness-110 text-white shadow-lg shadow-rose-900/50'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-900/40'
              } font-black font-arcade text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all`}
            >
              <span className="truncate">{t('CONTINUE_TO_EARLY_CAREER_CHOICES') || 'CONTINUE'}</span>
              <ChevronRight className="w-4 h-4 stroke-[3] shrink-0" />
            </button>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 gap-4">
        {/* Compact Thematic Header Strip */}
        <div
          className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 shrink-0 ${
            isWasted
              ? 'bg-red-950/60 border-red-600/80 text-red-100'
              : 'bg-amber-950/50 border-amber-500/50 text-amber-100'
          }`}
        >
          {isWasted ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div className="text-xs sm:text-sm font-sans leading-snug min-w-0">
            <span
              className={`font-arcade font-black uppercase block tracking-wider ${
                isWasted ? 'text-red-300' : 'text-amber-300'
              }`}
            >
              {isWasted
                ? t('VOLATILE_GENIUS_TITLE') || 'VOLATILE GENIUS • AGE 10'
                : t('FOUNDATIONAL_HERITAGE_TITLE') || 'FOUNDATIONAL HERITAGE • AGE 10'}
            </span>
          </div>
        </div>

        {/* Full-Width Readable Story Area */}
        {isTypingComplete ? (
          <div className="flex-1 flex flex-col justify-center">
            <ConsolePagedText
              paragraphs={storyParagraphs}
              maxCharsPerPage={380}
              textSizeClass="text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose text-slate-100"
              resetKey={card.id}
            />
          </div>
        ) : (
          <div
            onClick={handleSkipTyping}
            className="flex-1 flex flex-col justify-start cursor-pointer py-2"
            title="Tap anywhere to reveal text immediately"
          >
            <p className="text-base sm:text-xl md:text-2xl text-slate-100 font-sans leading-relaxed sm:leading-loose">
              {displayedText}
              <span
                className={`inline-block w-2.5 h-[1.15em] ml-1.5 align-middle ${
                  isWasted ? 'bg-red-500' : 'bg-amber-400'
                } animate-pulse`}
              />
            </p>
          </div>
        )}

        {/* Real-Time Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
          <div
            className={`h-full transition-all duration-75 ${
              isWasted
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </ConsoleModalShell>
  );
};

