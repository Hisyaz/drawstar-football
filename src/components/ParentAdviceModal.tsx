import React, { useState, useEffect } from 'react';
import { PARENT_ADVICE_EFFECTS } from '../utils/parentCardSystem';
import { ParentAdviceEffect } from '../types/parentCards';
import { Heart, Check, RefreshCw } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface ParentAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIconicUpgraded: boolean;
  onApplyAdvice: (effect: ParentAdviceEffect) => void;
}

export const ParentAdviceModal: React.FC<ParentAdviceModalProps> = ({
  isOpen,
  onClose,
  isIconicUpgraded,
  onApplyAdvice,
}) => {
  const [selectedEffectId, setSelectedEffectId] = useState<string>(PARENT_ADVICE_EFFECTS[0].id);
  const [iconicPage, setIconicPage] = useState<number>(1);
  const [randomRolledEffect, setRandomRolledEffect] = useState<ParentAdviceEffect>(() => {
    return PARENT_ADVICE_EFFECTS[Math.floor(Math.random() * PARENT_ADVICE_EFFECTS.length)];
  });

  useEffect(() => {
    if (isOpen) {
      setRandomRolledEffect(
        PARENT_ADVICE_EFFECTS[Math.floor(Math.random() * PARENT_ADVICE_EFFECTS.length)]
      );
      setIconicPage(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRollRandom = () => {
    const rolled = PARENT_ADVICE_EFFECTS[Math.floor(Math.random() * PARENT_ADVICE_EFFECTS.length)];
    setRandomRolledEffect(rolled);
  };

  const activeEffect = isIconicUpgraded
    ? PARENT_ADVICE_EFFECTS.find((e) => e.id === selectedEffectId) || PARENT_ADVICE_EFFECTS[0]
    : randomRolledEffect;

  const handleConfirm = () => {
    onApplyAdvice(activeEffect);
    onClose();
  };

  const PAGE_SIZE = 3;
  const totalPages = Math.max(1, Math.ceil(PARENT_ADVICE_EFFECTS.length / PAGE_SIZE));
  const safePage = Math.min(iconicPage, totalPages);
  const pagedEffects = PARENT_ADVICE_EFFECTS.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={isIconicUpgraded ? '👑 ICONIC PARENT: SELECT ADVICE' : 'ASK PARENTS FOR ADVICE'}
      subtitle="PERK • PARENTS' GUIDANCE"
      badge="PERK"
      icon={<Heart className="w-5 h-5 fill-rose-400 text-rose-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-2xl"
      zIndexClass="z-[10000]"
      bodyClassName="p-4 sm:p-6 space-y-4 font-pixel"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] bg-slate-900 hover:bg-slate-800 text-slate-300 font-arcade border border-slate-700 px-4 py-2 rounded-lg text-xs uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="min-h-[48px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black font-arcade px-6 py-2.5 rounded-lg pixel-bevel-gold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer active:translate-y-0.5 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>ACCEPT & APPLY ADVICE</span>
          </button>
        </div>
      }
    >
      <ConsolePagedText
        textSizeClass="text-sm sm:text-base"
        paragraphs={[
          isIconicUpgraded
            ? 'Because your parent card is upgraded to Iconic, you have the rare privilege of choosing exactly which piece of advice fits your current career needs best.'
            : 'Your parents provide heartfelt guidance based on their life experience. Receive their blessing to boost morale, recover energy, or sharpen composure.',
        ]}
      />

      {isIconicUpgraded ? (
        <div className="space-y-3">
          <span className="text-xs font-arcade font-black text-amber-400 uppercase tracking-wider block">
            CHOOSE ONE ACTIVE COUNSEL:
          </span>
          {totalPages > 1 && (
            <ConsolePaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setIconicPage}
              totalItems={PARENT_ADVICE_EFFECTS.length}
              pageSize={PAGE_SIZE}
              label="COUNSEL PAGE"
            />
          )}
          <div className="grid grid-cols-1 gap-2.5">
            {pagedEffects.map((effect) => {
              const isSelected = selectedEffectId === effect.id;
              return (
                <div
                  key={effect.id}
                  onClick={() => setSelectedEffectId(effect.id)}
                  className={`p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-400 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs sm:text-sm font-black font-arcade text-white uppercase">
                      {effect.title}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-pixel px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded shrink-0">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-sans text-slate-200 leading-relaxed">
                    {effect.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-950 border-2 border-emerald-500/60 rounded-2xl p-5 text-center space-y-2.5 relative shadow-inner">
            <div className="w-11 h-11 rounded-xl bg-emerald-900/60 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-pixel uppercase tracking-widest text-emerald-400 block">
              ADVICE FROM HOME READY
            </span>
            <h4 className="text-base sm:text-lg font-black font-arcade text-white uppercase tracking-wide">
              {activeEffect.title}
            </h4>
            <p className="text-sm sm:text-base font-sans text-slate-100 leading-relaxed">
              {activeEffect.description}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleRollRandom}
              className="min-h-[44px] px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-amber-300 text-xs font-arcade uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Ask For Different Advice</span>
            </button>
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};

