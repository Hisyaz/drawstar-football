import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Save,
  X,
  RefreshCw,
  Monitor,
  Terminal,
  Smartphone,
  Apple,
  CheckCircle,
} from 'lucide-react';
import {
  downloadWindowsGameZip,
  downloadLinuxGameZip,
  downloadDirectApkFile,
  collectAllGameSaveData,
  restoreGameSaveData,
} from '../utils/projectArchiveExporter';

interface ProjectSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
}

export const ProjectSyncModal: React.FC<ProjectSyncModalProps> = ({
  isOpen,
  onClose,
  showToast = (msg) => console.log(msg),
}) => {
  const [downloadingPlatform, setDownloadingPlatform] = useState<'pc' | 'linux' | 'apk' | null>(null);
  const [downloadStep, setDownloadStep] = useState<string>('');
  const [downloadPercent, setDownloadPercent] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download PC Windows offline edition
  const handleDownloadPC = async () => {
    try {
      setDownloadingPlatform('pc');
      setDownloadStep('Packaging Windows offline game & installer...');
      setDownloadPercent(10);

      await downloadWindowsGameZip((step, pct) => {
        setDownloadStep(step);
        setDownloadPercent(pct);
      });

      showToast('✅ Saved Windows PC game (.ZIP)! Double-click Setup-Game.bat or Play-Windows.bat.');
    } catch (err) {
      console.error('PC export error:', err);
      showToast('❌ Failed to package Windows offline game.');
    } finally {
      setTimeout(() => {
        setDownloadingPlatform(null);
        setDownloadStep('');
        setDownloadPercent(0);
      }, 800);
    }
  };

  // Download Linux offline edition
  const handleDownloadLinux = async () => {
    try {
      setDownloadingPlatform('linux');
      setDownloadStep('Packaging Linux offline game...');
      setDownloadPercent(10);

      await downloadLinuxGameZip((step, pct) => {
        setDownloadStep(step);
        setDownloadPercent(pct);
      });

      showToast('✅ Saved Linux game (.ZIP)! Run ./Play-Linux.sh.');
    } catch (err) {
      console.error('Linux export error:', err);
      showToast('❌ Failed to package Linux offline game.');
    } finally {
      setTimeout(() => {
        setDownloadingPlatform(null);
        setDownloadStep('');
        setDownloadPercent(0);
      }, 800);
    }
  };

  // Direct Android APK file download
  const handleDownloadApk = async () => {
    try {
      setDownloadingPlatform('apk');
      setDownloadStep('Generating Android APK installer (.apk)...');
      setDownloadPercent(15);

      await downloadDirectApkFile((step, pct) => {
        setDownloadStep(step);
        setDownloadPercent(pct);
      });

      showToast('🎉 DrawStar Android APK (.apk) downloaded directly to your device!');
    } catch (err) {
      console.error('APK export error:', err);
      showToast('❌ Failed to generate Android APK file.');
    } finally {
      setTimeout(() => {
        setDownloadingPlatform(null);
        setDownloadStep('');
        setDownloadPercent(0);
      }, 800);
    }
  };

  // Export Save Only
  const handleExportSaveOnly = () => {
    try {
      const data = collectAllGameSaveData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drawstar-career-save-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('💾 Career and option file saved successfully!');
    } catch {
      showToast('❌ Failed to export save file.');
    }
  };

  // Restore Save
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        const count = restoreGameSaveData(parsed);
        showToast(`✅ Successfully restored ${count} save entries! Reloading...`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error('Import error:', err);
        showToast('❌ Invalid JSON save file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 safe-top safe-bottom bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-950 border-0 sm:border-2 border-amber-400 rounded-none sm:rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92dvh]">
        {/* HEADER */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-400/50 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400 rounded-xl text-amber-400 shadow-sm shrink-0">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-white font-mono uppercase tracking-wider flex items-center gap-2 truncate">
                <span>OFFLINE DOWNLOAD CENTER</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans truncate">
                Choose your platform to play 100% offline with zero internet required.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
          
          {/* PROGRESS BAR (SHARED) */}
          {downloadingPlatform && (
            <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/50 space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  {downloadStep}
                </span>
                <span className="font-black">{downloadPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-amber-400/40 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-150"
                  style={{ width: `${downloadPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* 1. PC (WINDOWS) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border-2 border-amber-400/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md hover:border-amber-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-400 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-black text-sm text-white uppercase tracking-wider">
                    PC (Windows)
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold uppercase">
                    1-Click Installer
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Includes 1-click installer and desktop launcher. <strong>Zero Python or setup required.</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPC}
              disabled={downloadingPlatform !== null}
              className={`w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                downloadingPlatform === 'pc'
                  ? 'bg-amber-600/50 text-amber-200 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md active:scale-95'
              }`}
            >
              {downloadingPlatform === 'pc' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PACKAGING...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                  <span>DOWNLOAD PC (.ZIP)</span>
                </>
              )}
            </button>
          </div>

          {/* 2. LINUX */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border-2 border-sky-400/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md hover:border-sky-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/20 border border-sky-400/50 rounded-xl text-sky-400 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-black text-sm text-white uppercase tracking-wider">
                    Linux
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold uppercase">
                    Shell Runner
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Standalone offline archive with <code className="text-sky-300">Play-Linux.sh</code> runner script.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadLinux}
              disabled={downloadingPlatform !== null}
              className={`w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
                downloadingPlatform === 'linux'
                  ? 'bg-sky-600/50 text-sky-200 cursor-wait'
                  : 'bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 shadow-md active:scale-95'
              }`}
            >
              {downloadingPlatform === 'linux' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PACKAGING...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                  <span>DOWNLOAD LINUX (.ZIP)</span>
                </>
              )}
            </button>
          </div>

          {/* 3. MOBILE SECTION (ANDROID & IOS) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border-2 border-emerald-500/80 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                  Mobile
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-300/80 uppercase font-bold">
                Handheld Devices
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ANDROID APK */}
              <div className="p-3 bg-slate-950/90 rounded-xl border border-emerald-500/50 flex flex-col justify-between space-y-2.5 hover:border-emerald-400 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-white uppercase flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Android</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      .APK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Directly downloads standalone <code className="text-emerald-300 font-mono">.apk</code> to your device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadApk}
                  disabled={downloadingPlatform !== null}
                  className={`w-full min-h-[44px] py-2 px-3 rounded-lg font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    downloadingPlatform === 'apk'
                      ? 'bg-emerald-600/50 text-emerald-200 cursor-wait'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md active:scale-95'
                  }`}
                >
                  {downloadingPlatform === 'apk' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>PACKAGING...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                      <span>DOWNLOAD APK (.APK)</span>
                    </>
                  )}
                </button>
              </div>

              {/* IOS (COMING SOON) */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2.5 opacity-80">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-slate-300 uppercase flex items-center gap-1.5">
                      <Apple className="w-3.5 h-3.5 text-slate-400" />
                      <span>iOS (Apple)</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 uppercase">
                      SOON
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Standalone offline iOS package currently in preparation.
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full py-2 px-3 rounded-lg font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                >
                  <span>COMING SOON</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. CAREER SAVES BACKUP (COMPACT) */}
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-left w-full sm:w-auto">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Career Save Backup (.JSON)</span>
              </span>
              <p className="text-[10px] text-slate-400">
                Transfer your active career progress between devices anytime.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleExportSaveOnly}
                className="flex-1 sm:flex-initial min-h-[44px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer"
              >
                Export Save
              </button>
              <div className="flex-1 sm:flex-initial">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJsonFile}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[44px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Upload className="w-3 h-3 text-sky-400" />
                  <span>Import Save</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-3 safe-bottom bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
          <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1 truncate">
            <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">DrawStar 32-Bit: 100% Offline Standalone Architecture</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-colors shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
