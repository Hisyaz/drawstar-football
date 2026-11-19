import React, { useState } from 'react';
import {
  Menu,
  X,
  Database,
  ShoppingBag,
  Layers,
  Save,
  FolderHeart,
  Settings,
  Music,
  Globe,
  FileCode,
  User,
  Crown,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import {
  PixelGearIcon,
  PixelShopIcon,
  PixelCardsIcon,
  PixelCrownIcon,
} from './pixel/PixelIcons';
import { useLanguage } from '../context/LanguageContext';
import { useProfile } from '../utils/profileSystem';
import { ProfileAvatar } from './ProfileAvatar';

interface CompactHeaderMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  championCredits: number;
  activeSaveSlotId: number;
  careerMode: string;
  isEditorMode: boolean;
  isCharacterConfirmed: boolean;
  isTestMode: boolean;
  onOpenStore: () => void;
  onOpenCollection: () => void;
  onOpenLegendObjectives: () => void;
  onManualSave: () => void;
  onOpenSaveSlots: () => void;
  onOpenOptionFile: () => void;
  onOpenGraphicSettings: () => void;
  onOpenLanguagePicker: () => void;
  onOpenLanguagePacket: () => void;
  onOpenProfile: () => void;
  onOpenSoundtrack: () => void;
}

export const CompactHeaderMenuModal: React.FC<CompactHeaderMenuModalProps> = ({
  isOpen,
  onClose,
  championCredits,
  activeSaveSlotId,
  careerMode,
  isEditorMode,
  isCharacterConfirmed,
  isTestMode,
  onOpenStore,
  onOpenCollection,
  onOpenLegendObjectives,
  onManualSave,
  onOpenSaveSlots,
  onOpenOptionFile,
  onOpenGraphicSettings,
  onOpenLanguagePicker,
  onOpenLanguagePacket,
  onOpenProfile,
  onOpenSoundtrack,
}) => {
  const { t, languageInfo } = useLanguage();
  const { activeProfile } = useProfile();

  if (!isOpen) return null;

  const handleAction = (cb: () => void) => {
    onClose();
    cb();
  };

  return (
    <div
      id="compact-header-menu-overlay"
      className="fixed inset-0 z-50 h-[100dvh] safe-top safe-bottom flex flex-col bg-slate-950/95 backdrop-blur-md font-pixel select-none animate-in fade-in duration-200 overflow-hidden"
    >
      {/* Top Bar with Close */}
      <header className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-900 border-b-2 border-amber-500/80 pixel-bevel-gold flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Menu className="w-5 h-5 text-amber-400 shrink-0" />
          <h2 className="text-sm font-black font-arcade uppercase tracking-wide text-amber-300 truncate">
            QUICK ACCESS MENU
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] px-3 py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border-2 border-slate-700 hover:border-amber-400 pixel-bevel-raised flex items-center gap-1.5 cursor-pointer font-arcade text-xs font-black uppercase transition-all shrink-0"
        >
          <X className="w-4 h-4" />
          <span>CLOSE</span>
        </button>
      </header>

      {/* Menu Grid Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-3.5 sm:p-6 space-y-4 max-w-lg w-full mx-auto">
        {/* Active Profile Header Card */}
        {activeProfile && (
          <button
            type="button"
            onClick={() => handleAction(onOpenProfile)}
            className="w-full min-h-[56px] p-3.5 bg-slate-900/90 border-2 border-amber-500/70 pixel-bevel-gold flex items-center justify-between gap-2 cursor-pointer hover:border-amber-400 transition-all shadow-md text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ProfileAvatar color={activeProfile.avatarColor} size="md" name={activeProfile.name} showGlow />
              <div className="min-w-0">
                <span className="text-[10px] font-pixel text-amber-400/90 uppercase tracking-wider block">
                  ACTIVE PROFILE
                </span>
                <span className="font-arcade font-black text-sm text-white block truncate">
                  {activeProfile.name}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1.5 bg-amber-500 text-slate-950 text-[10px] font-arcade font-black uppercase pixel-corners shrink-0">
              MANAGE
            </span>
          </button>
        )}

        {/* Quick Career Actions */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-pixel uppercase tracking-widest text-slate-400 font-bold block px-1">
            CAREER & STORAGE
          </span>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5">
            {careerMode === 'unique_career' && !isEditorMode && (
              <>
                <button
                  type="button"
                  onClick={() => handleAction(onManualSave)}
                  className="min-h-[56px] p-3 bg-emerald-950/80 hover:bg-emerald-900/90 border-2 border-emerald-500/70 pixel-bevel-emerald text-emerald-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left min-w-0"
                >
                  <Save className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="block leading-tight truncate">QUICK SAVE</span>
                    <span className="text-[10px] text-emerald-400/80 font-pixel">SLOT #{activeSaveSlotId}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onOpenSaveSlots)}
                  className="min-h-[56px] p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-amber-400 pixel-bevel-raised text-amber-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left min-w-0"
                >
                  <FolderHeart className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="block leading-tight truncate">SAVE SLOTS</span>
                    <span className="text-[10px] text-slate-400 font-pixel">5 SLOTS</span>
                  </div>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => handleAction(onOpenStore)}
              className="min-h-[56px] p-3 bg-amber-950/80 hover:bg-amber-900/90 border-2 border-amber-500/70 pixel-bevel-gold text-amber-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left min-w-0"
            >
              <PixelShopIcon size={18} className="text-amber-400 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <span className="block leading-tight truncate">CARD STORE</span>
                <span className="text-[10px] text-amber-400 font-pixel">{championCredits.toLocaleString()} CREDITS</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenCollection)}
              className="min-h-[56px] p-3 bg-cyan-950/80 hover:bg-cyan-900/90 border-2 border-cyan-500/70 pixel-bevel-cyan text-cyan-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left min-w-0"
            >
              <PixelCardsIcon size={18} className="text-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <span className="block leading-tight truncate">COLLECTION</span>
                <span className="text-[10px] text-cyan-400/80 font-pixel">DECK & ARCHIVE</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenOptionFile)}
              className="min-h-[56px] p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-blue-400 pixel-bevel-raised text-blue-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left sm:col-span-2 min-w-0"
            >
              <Database className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <span className="block leading-tight truncate">OPTION FILE DATABASE</span>
                <span className="text-[10px] text-slate-400 font-pixel">CUSTOM LEAGUES, CLUBS & ROSTERS</span>
              </div>
            </button>
          </div>
        </div>

        {/* System & Audio Settings */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-pixel uppercase tracking-widest text-slate-400 font-bold block px-1">
            SETTINGS & AUDIO
          </span>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleAction(onOpenGraphicSettings)}
              className="min-h-[56px] p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-amber-400 pixel-bevel-raised text-slate-200 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left min-w-0"
            >
              <PixelGearIcon size={18} color="#f59e0b" className="shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <span className="block leading-tight truncate">GRAPHICS</span>
                <span className="text-[10px] text-amber-400/80 font-pixel">FPS & FIDELITY</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenSoundtrack)}
              className="min-h-[56px] p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-purple-400 pixel-bevel-raised text-purple-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left min-w-0"
            >
              <Music className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <span className="block leading-tight truncate">SOUNDTRACK</span>
                <span className="text-[10px] text-slate-400 font-pixel">MUSIC & PLAYLISTS</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenLanguagePicker)}
              className="min-h-[56px] p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-blue-400 pixel-bevel-raised text-slate-200 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left min-w-0"
            >
              <Globe className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <span className="block leading-tight truncate">LANGUAGE</span>
                <span className="text-[10px] text-slate-400 font-pixel">{languageInfo.flag} {languageInfo.name}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(onOpenLanguagePacket)}
              className="min-h-[56px] p-3 bg-slate-900/90 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-indigo-400 pixel-bevel-raised text-indigo-300 font-arcade text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 text-left min-w-0"
            >
              <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <span className="block leading-tight truncate">PACKET HUB</span>
                <span className="text-[10px] text-slate-400 font-pixel">CUSTOM TRANSLATION</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Close Footer for Phone Thumb Reach */}
      <footer className="px-3.5 py-2.5 bg-slate-900 border-t-2 border-slate-800 shrink-0 safe-bottom">
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-100 border-2 border-slate-700 hover:border-amber-400 font-arcade text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <X className="w-4 h-4 shrink-0" />
            <span>CLOSE MENU</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
