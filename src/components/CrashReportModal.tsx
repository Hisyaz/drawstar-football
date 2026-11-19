import React, { useState } from 'react';
import {
  AlertTriangle,
  Download,
  Share2,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Check,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  CrashReport,
  downloadCrashReportFile,
  shareCrashReportData,
  clearCrashReports,
} from '../utils/crashReportSystem';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

interface CrashReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CrashReport | null;
  allReports?: CrashReport[];
  onRecover?: () => void;
  isAutomaticCrash?: boolean;
}

export const CrashReportModal: React.FC<CrashReportModalProps> = ({
  isOpen,
  onClose,
  report,
  allReports = [],
  onRecover,
  isAutomaticCrash = false,
}) => {
  const { t } = useLanguage();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(true);
  const [activeReportIndex, setActiveReportIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayReports = allReports.length > 0 ? allReports : (report ? [report] : []);
  const activeReport = displayReports[activeReportIndex] || report;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = (format: 'txt' | 'json' = 'txt') => {
    if (activeReport) {
      downloadCrashReportFile(activeReport, format);
      showToast(t('CRASH_COPIED') || 'Report downloaded');
    }
  };

  const handleShare = async () => {
    if (activeReport) {
      const result = await shareCrashReportData(activeReport);
      if (result.shared) {
        showToast(t('CRASH_SHARE_SUCCESS') || 'Shared successfully');
      } else if (result.copied) {
        showToast(t('CRASH_COPIED') || 'Report copied to clipboard!');
      } else {
        showToast('Sharing not supported on this browser.');
      }
    }
  };

  const handleRecover = () => {
    if (onRecover) {
      onRecover();
    }
    onClose();
  };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass="z-[99999]"
      accentColor={isAutomaticCrash ? 'rose' : 'amber'}
      maxWidthClass="sm:max-w-2xl"
      title={t('CRASH_TITLE')}
      subtitle={isAutomaticCrash ? t('CRASH_RECOVERY_MSG') : t('CRASH_SUBTITLE')}
      badge={isAutomaticCrash ? t('CRASH_AUTO_DETECTED') : undefined}
      icon={
        <AlertTriangle
          className={`w-5 h-5 ${isAutomaticCrash ? 'text-rose-400' : 'text-amber-400'}`}
        />
      }
      bodyClassName="p-3.5 sm:p-5 space-y-4"
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {allReports.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearCrashReports();
                  showToast('Crash log history cleared');
                }}
                className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Clear Logs</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {activeReport && (
              <>
                <button
                  type="button"
                  onClick={() => handleDownload('txt')}
                  className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Download className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{t('CRASH_DOWNLOAD_BTN')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('CRASH_SHARE_BTN')}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleRecover}
              className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>{t('CRASH_RECOVER_BTN')}</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-emerald-600/90 text-white text-xs px-4 py-2.5 rounded-xl text-center font-medium flex items-center justify-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Multiple reports selector if > 1 report */}
      {displayReports.length > 1 && (
        <ConsolePaginationBar
          currentPage={activeReportIndex + 1}
          totalPages={displayReports.length}
          onPageChange={(page) => setActiveReportIndex(page - 1)}
          label="INCIDENT"
        />
      )}

      {!activeReport ? (
        <div className="text-center py-8 text-slate-400 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <p className="text-sm font-medium text-slate-200">{t('CRASH_NO_ERRORS')}</p>
          <p className="text-xs text-slate-400">{t('CRASH_MANUAL_DESC')}</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Essential Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                {t('CRASH_ERR_TYPE')}
              </span>
              <span className="font-semibold text-red-400 text-sm block break-words">
                {activeReport.errorType}
              </span>
              {activeReport.occurrenceCount > 1 && (
                <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full mt-1">
                  {t('CRASH_OCCURRENCES')}: {activeReport.occurrenceCount}x
                </span>
              )}
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                {t('CRASH_AFFECTED_SYS')}
              </span>
              <span className="font-semibold text-sky-400 text-sm block break-words">
                {activeReport.affectedSystem}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                {t('CRASH_SCREEN')} & {t('CRASH_GAME_MODE')}
              </span>
              <span className="font-medium text-slate-200 block break-words">
                {activeReport.currentScreen} ({activeReport.gameMode})
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                {t('CRASH_LAST_ACTION')}
              </span>
              <span className="font-medium text-slate-200 block break-words">
                {activeReport.lastAction}
              </span>
            </div>
          </div>

          {/* Error Message Box */}
          <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] text-red-300 uppercase tracking-wider font-semibold block">
              {t('CRASH_ERR_MSG')}
            </span>
            <p className="text-xs sm:text-sm font-mono text-red-200 break-words leading-relaxed">
              {activeReport.errorMessage}
            </p>
          </div>

          {/* Career & Season State if available */}
          {activeReport.careerState && (
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-amber-400 uppercase tracking-wider font-bold block">
                ⚽ {t('CRASH_CAREER_STATE')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Player</span>
                  <span className="font-semibold text-white">{activeReport.careerState.playerName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Club</span>
                  <span className="font-semibold text-white">{activeReport.careerState.club || 'Free Agent'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Pos / OVR</span>
                  <span className="font-semibold text-emerald-400">
                    {activeReport.careerState.position || 'ST'} ({activeReport.careerState.ovr ?? 70})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Age / Season</span>
                  <span className="font-semibold text-amber-300">
                    {activeReport.careerState.age ?? 17}y (Yr {(activeReport.careerState.seasonIndex ?? 0) + 1})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Technical Details (Stack Trace & Timestamp) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full min-h-[44px] p-3 text-left flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{t('CRASH_DETAILS_TOGGLE')} & Stack Trace</span>
              </span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnicalDetails && (
              <div className="p-3 border-t border-slate-800 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-sans uppercase">Timestamp</span>
                  <span className="text-slate-200">{new Date(activeReport.timestamp).toLocaleString()}</span>
                </div>
                {activeReport.stackTrace ? (
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans uppercase mb-1">Stack Trace</span>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
                      {activeReport.stackTrace}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic font-sans">No stack trace logged for this event.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </ConsoleModalShell>
  );
};
