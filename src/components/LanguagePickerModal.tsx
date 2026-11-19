import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, Sparkles, FileCode, Lock, Flag, List } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../utils/localizationSystem';
import { LanguagePacketModal } from './LanguagePacketModal';
import { LanguageFlagCarousel } from './LanguageFlagCarousel';
import { ConsoleModalShell, ConsolePageTab } from './common/ConsolePager';

interface LanguagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPCOMING_LANGUAGES = [
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    region: 'Deutschland & DACH',
  },
  {
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    region: 'Italia',
  },
  {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية (السعودية)',
    flag: '🇸🇦',
    region: 'Saudi Arabia & Gulf',
  },
];

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage, languagesList, t, isPacketLoaded, activePacket, hasPacketForLanguage } = useLanguage();
  const [notice, setNotice] = useState<string | null>(null);
  const [showPacketModal, setShowPacketModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'carousel' | 'list'>('carousel');

  if (!isOpen) return null;

  const allLanguages = [
    ...languagesList.map((lang) => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      region: lang.region,
      hasPacket: hasPacketForLanguage(lang.code),
    })),
    ...UPCOMING_LANGUAGES.map((lang) => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      region: lang.region,
      hasPacket: false,
    })),
  ];

  const tabs: ConsolePageTab[] = [
    {
      id: 'carousel',
      label: 'Carousel',
      icon: <Flag className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'list',
      label: 'List',
      icon: <List className="w-4 h-4 shrink-0" />,
      badge: allLanguages.length,
    },
  ];

  const modalContent = (
    <>
      <ConsoleModalShell
        isOpen={isOpen}
        onClose={onClose}
        zIndexClass="z-[99999]"
        accentColor="blue"
        maxWidthClass={activeTab === 'carousel' ? 'sm:max-w-3xl' : 'sm:max-w-lg'}
        title={t('NAV_SELECT_LANGUAGE') || 'Language'}
        subtitle={
          isPacketLoaded
            ? `${activePacket?.meta?.languageName || 'Packet Loaded'}`
            : 'No Packet Loaded'
        }
        icon={<Globe className="w-5 h-5 text-blue-400" />}
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'carousel' | 'list')}
        headerRight={
          <button
            type="button"
            onClick={() => setShowPacketModal(true)}
            className="min-h-[44px] px-3 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
            title="Manage Language Packets (JSON)"
          >
            <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-mono text-xs hidden sm:inline">Packets</span>
            {isPacketLoaded && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </button>
        }
        bodyClassName="p-3 sm:p-5 space-y-3"
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs font-sans text-slate-300 flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Languages require an installed packet to be selectable.</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl border border-slate-600 font-arcade text-xs uppercase font-bold cursor-pointer active:scale-95 shrink-0"
            >
              {t('CLOSE') || 'CLOSE'}
            </button>
          </div>
        }
      >
        {notice && (
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {activeTab === 'carousel' ? (
          <div className="py-2 flex flex-col items-center justify-center min-h-[260px]">
            <LanguageFlagCarousel
              onConfirm={(code) => {
                setLanguage(code);
                onClose();
              }}
              onClose={onClose}
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {allLanguages.map((langItem) => {
              const isSelected = currentLanguage === langItem.code;
              const hasPacket = langItem.hasPacket;

              return (
                <button
                  key={langItem.code}
                  type="button"
                  disabled={!hasPacket}
                  onClick={() => {
                    if (!hasPacket) {
                      setNotice(`${langItem.name} has no Language Packet yet.`);
                      setTimeout(() => setNotice(null), 3000);
                      return;
                    }
                    setLanguage(langItem.code as LanguageCode);
                    onClose();
                  }}
                  className={`w-full min-h-[56px] p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-left ${
                    !hasPacket
                      ? 'bg-slate-950/40 border-slate-800 opacity-50 cursor-not-allowed select-none'
                      : isSelected
                      ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/40 cursor-pointer'
                      : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 hover:border-slate-600 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-2xl filter drop-shadow select-none shrink-0 ${!hasPacket ? 'grayscale-[60%]' : ''}`}>
                      {langItem.flag}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold ${
                            !hasPacket
                              ? 'text-slate-400'
                              : isSelected
                              ? 'text-white'
                              : 'text-slate-100'
                          }`}
                        >
                          {langItem.nativeName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({langItem.name})
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 truncate">
                        {langItem.region}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {isSelected && hasPacket && (
                      <span className="text-[10px] font-mono font-bold bg-blue-500 text-slate-950 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                      </span>
                    )}
                    {hasPacket && !isSelected && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 px-2 py-1 rounded-md">
                        READY
                      </span>
                    )}
                    {!hasPacket && (
                      <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-400 border border-slate-700 px-2 py-1 rounded-md flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" /> INACTIVE
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ConsoleModalShell>

      {/* LANGUAGE PACKET MODAL */}
      <LanguagePacketModal
        isOpen={showPacketModal}
        onClose={() => setShowPacketModal(false)}
      />
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

/**
 * Direct Language Packet Button for quick access to Packet Hub
 */
export const LanguagePacketButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPacketLoaded } = useLanguage();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Universal Language Packet Hub (Load/Download/Edit game text)"
        className={`min-h-[44px] bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500/50 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-500/10 cursor-pointer ${className}`}
      >
        <FileCode className="w-4 h-4 text-indigo-400" />
        <span className="hidden sm:inline text-xs font-black uppercase">
          {isPacketLoaded ? 'PACKET' : 'NO PACKET'}
        </span>
        {isPacketLoaded && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </button>

      <LanguagePacketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

/**
 * Top-Right Globe Button Component for navigation bars & menus
 */
export const LanguagePickerButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { languageInfo } = useLanguage();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Change Language / Cambiar Idioma"
        className={`min-h-[44px] min-w-[44px] px-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-2 border-blue-500/80 hover:border-blue-400 pixel-bevel-raised shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition select-none active:scale-95 ${className}`}
      >
        <Globe className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="text-sm leading-none shrink-0">{languageInfo.flag}</span>
        <span className="hidden xl:inline text-[10px] font-mono text-slate-300 font-bold uppercase">{languageInfo.code}</span>
      </button>

      <LanguagePickerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
