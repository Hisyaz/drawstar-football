import React from 'react';
import { LogOut, Save, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

interface LeaveUniqueCareerModalProps {
  isOpen: boolean;
  onSaveAndReturn: () => void;
  onReturnWithoutSaving: () => void;
  onCancel: () => void;
  isCharacterCreation?: boolean;
  isBlueprintPending?: boolean;
  activeSlotId?: number;
}

export const LeaveUniqueCareerModal: React.FC<LeaveUniqueCareerModalProps> = ({
  isOpen,
  onSaveAndReturn,
  onReturnWithoutSaving,
  onCancel,
  isCharacterCreation = false,
  isBlueprintPending = false,
  activeSlotId = 1,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const isPendingUnconfirmedBlueprint = isCharacterCreation || isBlueprintPending;

  const title = isPendingUnconfirmedBlueprint
    ? t('EXIT_CHARACTER_CREATION') || 'EXIT CHARACTER CREATION?'
    : t('LEAVE_UNIQUE_CAREER') || 'LEAVE UNIQUE CAREER?';

  const subtitle = isPendingUnconfirmedBlueprint
    ? t('UNCONFIRMED_BLUEPRINT_REFUND_SUBTITLE') ||
      `Slot ${activeSlotId} will NOT be saved yet • 1 Champion Credit protected`
    : `${t('ACTIVE_SAVE_SLOT') || 'Active Save Slot'}: Slot ${activeSlotId}`;

  const bodyCopy = isBlueprintPending
    ? `Your character blueprint is not confirmed yet. Your career is only saved to Slot ${activeSlotId} and your 1 Champion Credit is only spent once you press CONFIRM AND START. Leaving now will safely return your 1 Champion Credit.`
    : isCharacterCreation
    ? t('DISCARD_CHARACTER_WARNING', { slot: activeSlotId }) ||
      `Returning without saving will discard unconfirmed character setup changes. Select SAVE & RETURN to preserve your progress in Slot ${activeSlotId}.`
    : t('SAVE_BEFORE_MENU_PROMPT', { slot: activeSlotId }) ||
      `Save your career progress to Slot ${activeSlotId} before returning to the Main Menu, or exit without saving.`;

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      subtitle={subtitle}
      icon={<LogOut className="w-5 h-5 text-amber-400" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-md"
      bodyClassName="p-4 sm:p-5 flex flex-col justify-center"
      footer={
        <div className="space-y-2.5">
          {!isBlueprintPending && (
            <button
              type="button"
              onClick={onSaveAndReturn}
              className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 border border-emerald-400/40 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>
                {t('SAVE_AND_RETURN') || 'SAVE & RETURN'} (SLOT {activeSlotId})
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onReturnWithoutSaving}
            className="w-full min-h-[46px] py-2.5 px-4 bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-rose-700/70 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>
              {isBlueprintPending
                ? t('CANCEL_SETUP_AND_REFUND_CREDIT') || 'CANCEL SETUP & REFUND 1 CREDIT'
                : t('RETURN_TO_MENU_WITHOUT_SAVING') || 'RETURN TO MENU WITHOUT SAVING'}
            </span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full min-h-[44px] py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>{isBlueprintPending ? t('KEEP_CREATING') || 'KEEP CREATING' : t('CANCEL') || 'CANCEL'}</span>
          </button>
        </div>
      }
    >
      <ConsolePagedText paragraphs={[bodyCopy]} resetKey={`leave-${activeSlotId}-${isCharacterCreation}-${isBlueprintPending}`} />
    </ConsoleModalShell>
  );
};

