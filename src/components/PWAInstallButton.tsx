import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ConsoleModalShell } from './common/ConsolePager';

export const PWAInstallButton: React.FC<{ variant?: 'banner' | 'compact' | 'menu' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  const buttonLabel = isAndroid
    ? 'Install APK / App'
    : isIOS
    ? 'Install on iOS'
    : 'Install App (Offline)';

  return (
    <>
      {variant === 'menu' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 rounded-lg text-emerald-300 hover:text-emerald-100 hover:border-emerald-400 transition-all text-xs font-medium cursor-pointer shadow-sm group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-pixel text-[11px] truncate">{buttonLabel}</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-mono shrink-0">
            OFFLINE
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Install DrawStar for 100% offline play on your phone or PC"
          className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 transition-all text-xs font-medium cursor-pointer shadow-md backdrop-blur-sm active:scale-95 group"
        >
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-pixel text-[10px] tracking-wide">{buttonLabel}</span>
          <Download className="w-3.5 h-3.5 text-emerald-400/80 ml-0.5 shrink-0" />
        </button>
      )}

      <ConsoleModalShell
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        zIndexClass="z-[99999]"
        accentColor="emerald"
        maxWidthClass="sm:max-w-md"
        title="Offline Mobile App (APK)"
        subtitle="Install DrawStar on your phone for 100% offline play"
        icon={<Smartphone className="w-5 h-5 text-emerald-400" />}
        bodyClassName="p-4 sm:p-5 space-y-4"
        footer={
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="w-full min-h-[48px] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Got It
          </button>
        }
      >
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          DrawStar runs 100% offline without needing internet. Install it directly onto your device:
        </p>

        <div className="space-y-3 text-sm bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-sans">
          {isAndroid || !isIOS ? (
            <>
              <div className="flex items-start gap-2.5">
                <span className="bg-emerald-500/20 text-emerald-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  1
                </span>
                <span className="text-slate-200 leading-relaxed">
                  Tap the <strong>three dots (⋮)</strong> menu in Chrome or your browser.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-emerald-500/20 text-emerald-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  2
                </span>
                <span className="text-slate-200 leading-relaxed">
                  Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-emerald-500/20 text-emerald-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  3
                </span>
                <span className="text-slate-200 leading-relaxed">
                  Android will generate a native <strong>WebAPK</strong> icon that opens fullscreen and plays offline anytime!
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5">
                <span className="bg-blue-500/20 text-blue-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  1
                </span>
                <span className="text-slate-200 leading-relaxed">
                  Tap the <strong>Share</strong> button in Safari&apos;s bottom toolbar.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-blue-500/20 text-blue-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  2
                </span>
                <span className="text-slate-200 leading-relaxed">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-blue-500/20 text-blue-300 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  3
                </span>
                <span className="text-slate-200 leading-relaxed">
                  Tap <strong>"Add"</strong> in the top right to install the standalone game.
                </span>
              </div>
            </>
          )}
        </div>
      </ConsoleModalShell>
    </>
  );
};
