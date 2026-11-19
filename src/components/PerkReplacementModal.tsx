import React, { useState } from 'react';
import { CareerPerk, getActivePerks, getLocalizedPerk } from '../utils/perksSystem';
import { PlayerCardData } from '../types';
import { PerkIcon } from './PerkIcon';
import { AlertTriangle, Check, ShieldAlert, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

interface PerkReplacementModalProps {
  player: PlayerCardData;
  newPerk: CareerPerk;
  isForced?: boolean;
  onReplace: (oldPerkId: string, newPerkId: string) => void;
  onDiscard: (discardedPerkId: string) => void;
  onClose: () => void;
}

export const PerkReplacementModal: React.FC<PerkReplacementModalProps> = ({
  player,
  newPerk,
  isForced = false,
  onReplace,
  onDiscard,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const isMandatory = isForced || newPerk.id === 'snake';
  const locNewPerk = getLocalizedPerk(newPerk, language);
  const rawActivePerks = getActivePerks(player);
  const activePerks = rawActivePerks.map((p) => getLocalizedPerk(p, language));
  const [selectedOldPerk, setSelectedOldPerk] = useState<CareerPerk | null>(null);
  const [pendingAction, setPendingAction] = useState<'none' | 'confirm_discard' | 'confirm_replace'>('none');
  const [activeTab, setActiveTab] = useState<'slots' | 'new_perk'>('slots');
  const [slotPage, setSlotPage] = useState<number>(1);

  const pageSize = 2;
  const totalSlotPages = Math.max(1, Math.ceil(activePerks.length / pageSize));
  const safePage = Math.min(slotPage, totalSlotPages);
  const visibleSlots = activePerks.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleConfirmReplace = () => {
    if (selectedOldPerk) {
      onReplace(selectedOldPerk.id, newPerk.id);
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    if (isMandatory) return;
    onDiscard(newPerk.id);
    onClose();
  };

  const footerContent = (() => {
    if (pendingAction === 'confirm_discard' && !isMandatory) {
      return (
        <div className="space-y-2.5 w-full">
          <p className="text-xs sm:text-sm text-amber-200 font-semibold text-center">
            Discard <strong className="text-amber-300">{locNewPerk.name}</strong> and retain all 5 active perks?
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={() => setPendingAction('none')}
              className="min-h-[46px] flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-extrabold text-xs uppercase hover:bg-slate-700 transition cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmDiscard}
              className="min-h-[48px] flex-[2] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3] shrink-0" />
              <span>CONFIRM DISCARD & KEEP 5</span>
            </button>
          </div>
        </div>
      );
    }

    if (pendingAction === 'confirm_replace' && selectedOldPerk) {
      return (
        <div className="space-y-2.5 w-full">
          <p className="text-xs sm:text-sm text-rose-200 font-semibold text-center">
            Permanently replace <strong className="text-rose-300">{selectedOldPerk.name}</strong> with{' '}
            <strong className="text-amber-300">{locNewPerk.name}</strong>?
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={() => setPendingAction('none')}
              className="min-h-[46px] flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-extrabold text-xs uppercase hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReplace}
              className="min-h-[48px] flex-[2] px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>CONFIRM REPLACEMENT</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
        {!isMandatory ? (
          <button
            type="button"
            onClick={() => {
              setSelectedOldPerk(null);
              setPendingAction('confirm_discard');
            }}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-400 text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Keep Current 5 (Discard {locNewPerk.name})</span>
          </button>
        ) : (
          <div className="text-xs text-rose-300 font-bold flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Select an active slot above to replace</span>
          </div>
        )}
      </div>
    );
  })();

  return (
    <ConsoleModalShell
      isOpen={true}
      onClose={isMandatory ? undefined : onClose}
      closeDisabled={isMandatory}
      showCloseButton={!isMandatory}
      title={
        isMandatory
          ? t('REPLACE_PERK_WITH', { name: locNewPerk.name }) || `REPLACE WITH "${locNewPerk.name}"`
          : t('MANAGE_NEW_PERK', { name: locNewPerk.name }) || `NEW PERK: "${locNewPerk.name}"`
      }
      subtitle={locNewPerk.shortDescription}
      badge={
        isMandatory
          ? t('MANDATORY_PERK_ASSIGNMENT') || 'MANDATORY PERK • SLOTS FULL'
          : t('PERK_CAPACITY_REACHED') || 'PERK CAPACITY REACHED (5/5)'
      }
      icon={<PerkIcon iconName={locNewPerk.iconName} className="w-6 h-6 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-2xl"
      tabs={[
        { id: 'slots', label: 'Replace Active Slot', badge: activePerks.length },
        { id: 'new_perk', label: 'New Perk Details' },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'slots' | 'new_perk')}
      footer={footerContent}
    >
      <div className="p-4 sm:p-5 space-y-4 text-left">
        {activeTab === 'slots' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                {isMandatory
                  ? t('MANDATORY_PERK_NOTICE') ||
                    'This career trait is mandatory and cannot be declined. Select which existing perk to permanently replace.'
                  : t('VOLUNTARY_PERK_NOTICE') ||
                    'Replaced perks become permanently deactivated and can never be reactivated later in your career.'}
              </span>
            </div>

            {totalSlotPages > 1 && (
              <ConsolePaginationBar
                currentPage={safePage}
                totalPages={totalSlotPages}
                onPageChange={setSlotPage}
                totalItems={activePerks.length}
                pageSize={pageSize}
                label="SLOTS"
              />
            )}

            <div className="space-y-2.5">
              {visibleSlots.map((perk, idx) => {
                const slotNumber = (safePage - 1) * pageSize + idx + 1;
                const isSelected = selectedOldPerk?.id === perk.id;
                return (
                  <button
                    key={perk.id}
                    type="button"
                    onClick={() => {
                      setSelectedOldPerk(perk);
                      setPendingAction('confirm_replace');
                    }}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 min-h-[76px] ${
                      isSelected
                        ? 'bg-rose-950/60 border-rose-400 shadow-lg'
                        : 'bg-slate-950 border-slate-700 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-200 shrink-0">
                      <PerkIcon iconName={perk.iconName} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-slate-400">SLOT {slotNumber}</span>
                        <span className="text-sm font-black text-white truncate">{perk.name}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                          {perk.category}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300 font-semibold mt-1 line-clamp-2">
                        ✨ {perk.effect}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-2 rounded-lg text-xs font-black shrink-0 ${
                        isSelected ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-600'
                      }`}
                    >
                      {isSelected ? 'SELECTED' : 'REPLACE'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'new_perk' && (
          <ConsolePagedText
            resetKey={locNewPerk.id}
            pages={[
              {
                heading: `${locNewPerk.name} (${locNewPerk.category})`,
                paragraphs: [locNewPerk.shortDescription],
                bullets: [
                  `Benefit: ${locNewPerk.effect}`,
                  `How Obtained: ${locNewPerk.howToObtain}`,
                ],
              },
            ]}
          />
        )}
      </div>
    </ConsoleModalShell>
  );
};
