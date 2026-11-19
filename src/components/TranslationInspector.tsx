import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Wand2,
  X,
  Plus,
  Check,
  Copy,
  Download,
  Trash2,
  ListFilter,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Globe,
  CheckCircle2,
  Eye,
  Crosshair,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMagicTool } from '../utils/testModeSystem';
import {
  TranslationAuditItem,
  getAuditItems,
  addAuditItem,
  removeAuditItem,
  clearAuditItems,
  exportAuditAsJson,
  exportAuditAsCsv,
  runPredefinedScan,
  TRIGGER_MAGIC_INSPECT_EVENT,
  TRIGGER_MAGIC_AUDIT_EVENT,
} from '../utils/translationAuditSystem';
import { recordInspectedText } from '../utils/translationInspectorSystem';
import { haptics } from '../utils/hapticsSystem';
import { ConsoleModalShell, ConsolePaginationBar } from './common/ConsolePager';

interface TranslationInspectorProps {
  onToast?: (msg: string) => void;
  externalOpenReport?: boolean;
  onCloseExternalReport?: () => void;
}

export const TranslationInspector: React.FC<TranslationInspectorProps> = ({
  onToast,
  externalOpenReport,
  onCloseExternalReport,
}) => {
  const { currentLanguage, t } = useLanguage();
  const { isMagicTool, isTestMode } = useMagicTool();
  const [isInspectorActive, setIsInspectorActive] = useState<boolean>(false);
  const [showAuditCenter, setShowAuditCenter] = useState<boolean>(false);
  const [selectedElementData, setSelectedElementData] = useState<{
    text: string;
    screen: string;
    category: TranslationAuditItem['category'];
    suggested: string;
  } | null>(null);

  const [auditList, setAuditList] = useState<TranslationAuditItem[]>([]);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditTab, setAuditTab] = useState<'items' | 'actions'>('items');
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'csv' | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isHoldingOrDragging, setIsHoldingOrDragging] = useState<boolean>(false);
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const pointerDownTimeRef = useRef<number>(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldOrDragRef = useRef<boolean>(false);

  // Sync with external report trigger
  useEffect(() => {
    if (externalOpenReport) {
      setShowAuditCenter(true);
      setAuditList(getAuditItems());
    }
  }, [externalOpenReport]);

  // Sync with custom window events triggered from DeveloperTestDashboard Magic Tool tab
  useEffect(() => {
    const handleInspectEvent = (e: Event) => {
      const custom = e as CustomEvent<{ active?: boolean; toggle?: boolean }>;
      if (custom.detail?.toggle) {
        setIsInspectorActive((prev) => !prev);
      } else {
        setIsInspectorActive(custom.detail?.active ?? true);
      }
    };
    const handleAuditEvent = (e: Event) => {
      const custom = e as CustomEvent<{ open?: boolean }>;
      setShowAuditCenter(custom.detail?.open ?? true);
      setAuditList(getAuditItems());
    };

    window.addEventListener(TRIGGER_MAGIC_INSPECT_EVENT, handleInspectEvent);
    window.addEventListener(TRIGGER_MAGIC_AUDIT_EVENT, handleAuditEvent);
    return () => {
      window.removeEventListener(TRIGGER_MAGIC_INSPECT_EVENT, handleInspectEvent);
      window.removeEventListener(TRIGGER_MAGIC_AUDIT_EVENT, handleAuditEvent);
    };
  }, []);

  const loadItems = useCallback(() => {
    setAuditList(getAuditItems());
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Global Click & Hover Inspector Listener
  const hoverOutlineRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isInspectorActive) {
      if (hoverOutlineRef.current) {
        hoverOutlineRef.current.style.outline = '';
        hoverOutlineRef.current.style.cursor = '';
        hoverOutlineRef.current = null;
      }
      return;
    }

    const isIgnoredControl = (el: HTMLElement | null) => {
      if (!el) return true;
      return (
        Boolean(el.closest('#drawstar-translation-inspector-ui')) ||
        Boolean(el.closest('#top-bar-inspector-btn')) ||
        Boolean(el.closest('#magic-inspect-button'))
      );
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || isIgnoredControl(target)) return;

      let elToOutline = target;
      if (!target.innerText?.trim()) {
        const parent = target.closest('button, a, h1, h2, h3, h4, h5, p, span, [title], [aria-label]');
        if (parent && parent instanceof HTMLElement && !isIgnoredControl(parent)) {
          elToOutline = parent;
        }
      }

      if (hoverOutlineRef.current && hoverOutlineRef.current !== elToOutline) {
        hoverOutlineRef.current.style.outline = '';
        hoverOutlineRef.current.style.cursor = '';
      }

      hoverOutlineRef.current = elToOutline;
      elToOutline.style.outline = '2px dashed #f59e0b';
      elToOutline.style.cursor = 'crosshair';
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target === hoverOutlineRef.current) {
        target.style.outline = '';
        target.style.cursor = '';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks inside our own inspector overlay or toggle buttons
      if (!target || isIgnoredControl(target)) return;

      e.preventDefault();
      e.stopPropagation();

      // Find best text representation
      let text = target.innerText?.trim() || target.textContent?.trim() || '';

      if (!text) {
        const ancestorWithText = target.closest(
          'button, a, h1, h2, h3, h4, h5, h6, p, span, label, [title], [aria-label], [alt], div'
        );
        if (ancestorWithText && ancestorWithText instanceof HTMLElement) {
          text = ancestorWithText.innerText?.trim() || ancestorWithText.textContent?.trim() || '';
        }
      }

      if (!text) {
        text =
          target.getAttribute('title') ||
          target.getAttribute('aria-label') ||
          target.getAttribute('alt') ||
          '';
      }

      // If text is extremely long (e.g. a whole card/section), pick the closest heading or child with text
      if (text.length > 300) {
        const specificChild = target.querySelector('h1, h2, h3, h4, p, span, button');
        if (specificChild && specificChild instanceof HTMLElement && specificChild.innerText?.trim()) {
          text = specificChild.innerText.trim();
        } else {
          text = text.slice(0, 250);
        }
      }

      if (!text) {
        if (onToast) onToast('⚠️ Clicked element contains no readable text.');
        return;
      }

      // Infer current screen
      let inferredScreen = '32-Bit Main Menu';
      if (document.querySelector('[id*="main-menu"]')) inferredScreen = '32-Bit Main Menu';
      else if (document.querySelector('[id*="wonderkid"]')) inferredScreen = 'Wonderkid Profile Creator';
      else if (document.querySelector('[id*="development"]') || target.closest('[id*="development"]')) inferredScreen = 'Player Development Panel';
      else if (document.querySelector('[id*="parent-card"]') || target.closest('[id*="choice-system"]')) inferredScreen = 'Parent Card Selection';
      else if (document.querySelector('[id*="collection"]')) inferredScreen = 'Cards Collection';
      else if (target.closest('header')) inferredScreen = 'Top Navigation Header';

      // Infer category
      let category: TranslationAuditItem['category'] = 'UI Label';
      const lower = text.toLowerCase();
      if (lower.includes('player') && (lower.includes('parent') || lower.includes('born') || lower.includes('family'))) {
        category = 'Card Description';
      } else if (lower.includes('pace') || lower.includes('shooting') || lower.includes('passing') || lower.includes('dribbling') || lower.includes('defending') || lower.includes('ovr')) {
        category = 'Stat / Attribute';
      } else if (lower.includes('perk') || lower.includes('shadow') || lower.includes('playstyle')) {
        category = 'Perk / Playstyle';
      } else if (lower.includes('trophy') || lower.includes('cup') || lower.includes('ballon') || lower.includes('champion')) {
        category = 'Trophy';
      } else if (inferredScreen === 'Wonderkid Profile Creator') {
        category = 'Wonderkid Profile';
      }

      setSelectedElementData({
        text,
        screen: inferredScreen,
        category,
        suggested: '',
      });

      // Automatically open the floating inspector panel with the inspected element details
      setIsExpanded(true);

      // Turn off pointer-events-blocking inspector once an element is picked
      setIsInspectorActive(false);
      if (hoverOutlineRef.current) {
        hoverOutlineRef.current.style.outline = '';
        hoverOutlineRef.current.style.cursor = '';
        hoverOutlineRef.current = null;
      }
      if (onToast) onToast(`🪄 Inspected: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsInspectorActive(false);
        if (hoverOutlineRef.current) {
          hoverOutlineRef.current.style.outline = '';
          hoverOutlineRef.current.style.cursor = '';
          hoverOutlineRef.current = null;
        }
        if (onToast) onToast('Magic Inspect mode cancelled.');
      }
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown);
      if (hoverOutlineRef.current) {
        hoverOutlineRef.current.style.outline = '';
        hoverOutlineRef.current.style.cursor = '';
      }
    };
  }, [isInspectorActive, onToast]);

  const handleSavePickedText = () => {
    if (!selectedElementData) return;

    addAuditItem({
      screen: selectedElementData.screen,
      category: selectedElementData.category,
      englishText: selectedElementData.text,
      currentRenderedText: selectedElementData.text,
      targetLanguage: currentLanguage,
      suggestedTranslation: selectedElementData.suggested || undefined,
    });

    try {
      recordInspectedText(
        selectedElementData.text,
        selectedElementData.screen,
        currentLanguage,
        selectedElementData.suggested || `Category: ${selectedElementData.category}`
      );
    } catch {}

    loadItems();
    if (onToast) onToast(`✨ Text flagged and saved to Translation Audit list!`);
    setSelectedElementData(null);
  };

  const handleCopyJson = () => {
    const json = exportAuditAsJson(auditList);
    navigator.clipboard.writeText(json);
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2500);
    if (onToast) onToast('📋 Translation Audit JSON copied to clipboard!');
  };

  const handleCopyCsv = () => {
    const csv = exportAuditAsCsv(auditList);
    navigator.clipboard.writeText(csv);
    setCopiedFormat('csv');
    setTimeout(() => setCopiedFormat(null), 2500);
    if (onToast) onToast('📋 Translation Audit CSV copied to clipboard!');
  };

  const handleDownloadJson = () => {
    const json = exportAuditAsJson(auditList);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawstar-translations-audit-${currentLanguage}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onToast) onToast('💾 Translation report downloaded!');
  };

  const handlePreScan = () => {
    const scanned = runPredefinedScan(currentLanguage);
    setAuditList(scanned);
    if (onToast) onToast(`🔍 Pre-scan completed! Added known untranslated items.`);
  };

  const filteredItems = auditList.filter((item) => {
    const matchesCategory = activeFilterCategory === 'all' || item.category === activeFilterCategory;
    const matchesSearch =
      !searchQuery ||
      item.englishText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.screen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.suggestedTranslation && item.suggestedTranslation.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    pointerDownTimeRef.current = Date.now();
    hasMovedRef.current = false;
    isDraggingRef.current = false;
    isHoldOrDragRef.current = false;

    const container = document.getElementById('drawstar-floating-inspector-container');
    const targetEl = container || (e.currentTarget as HTMLElement);
    const rect = targetEl.getBoundingClientRect();
    dragStartOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const target = e.currentTarget;
    const pointerId = e.pointerId;

    // Start 200ms hold timer: holding the click/tap enters drag mode without opening menu
    holdTimerRef.current = setTimeout(() => {
      isHoldOrDragRef.current = true;
      isDraggingRef.current = true;
      setIsHoldingOrDragging(true);
      haptics.buttonPress();
      try {
        target.setPointerCapture?.(pointerId);
      } catch {}
    }, 200);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!pointerDownPosRef.current) return;
    const deltaX = e.clientX - pointerDownPosRef.current.x;
    const deltaY = e.clientY - pointerDownPosRef.current.y;
    const dist = Math.hypot(deltaX, deltaY);

    if (dist > 5 || isHoldOrDragRef.current) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        isHoldOrDragRef.current = true;
        hasMovedRef.current = true;
        setIsHoldingOrDragging(true);
        try {
          e.currentTarget.setPointerCapture?.(e.pointerId);
        } catch {}
      }

      const newX = Math.max(8, Math.min(window.innerWidth - 80, e.clientX - dragStartOffsetRef.current.x));
      const newY = Math.max(8, Math.min(window.innerHeight - 80, e.clientY - dragStartOffsetRef.current.y));
      setFloatingPos({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const startPos = pointerDownPosRef.current;
    const duration = Date.now() - pointerDownTimeRef.current;
    const dist = startPos ? Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y) : 0;
    const wasHoldOrDrag = isHoldOrDragRef.current || isDraggingRef.current || dist > 5 || duration >= 200;

    pointerDownPosRef.current = null;
    isDraggingRef.current = false;
    setIsHoldingOrDragging(false);

    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}

    if (wasHoldOrDrag) {
      // User held the click or dragged: save position, DO NOT open menu!
      isHoldOrDragRef.current = true;
      setFloatingPos((currentPos) => {
        if (currentPos) {
          try {
            localStorage.setItem('drawstar_magic_inspect_pos', JSON.stringify(currentPos));
          } catch {}
        }
        return currentPos;
      });

      // Keep flag true for 120ms to swallow any following browser click event
      setTimeout(() => {
        isHoldOrDragRef.current = false;
      }, 120);
      return;
    }

    // It was a quick single click / tap! (duration < 200ms and dist <= 5px)
    isHoldOrDragRef.current = false;
    haptics.buttonPress();
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    pointerDownPosRef.current = null;
    isDraggingRef.current = false;
    isHoldOrDragRef.current = false;
    setIsHoldingOrDragging(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  return (
    <div id="drawstar-translation-inspector-ui">
      {/* ========================================================================= */}
      {/* 1. FLOATING INSPECTOR TRIGGER (DRAGGABLE & EXPANDABLE FLOATING ICON) */}
      {/* ========================================================================= */}
      {(isMagicTool || isInspectorActive) && (
        <div
          id="drawstar-floating-inspector-container"
          className="fixed z-[9999] select-none touch-none"
          style={
            floatingPos
              ? { left: `${floatingPos.x}px`, top: `${floatingPos.y}px` }
              : { right: '1.25rem', top: '5.5rem' }
          }
        >
          {!isExpanded ? (
            /* COMPACT FLOATING ICON (EXPANDS ON PRESS OR DRAG) */
            <div className="relative group">
              <button
                type="button"
                id="magic-inspect-button"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isHoldOrDragRef.current) {
                    e.preventDefault();
                    return;
                  }
                  if (!isExpanded) {
                    setIsExpanded(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsExpanded(true);
                  }
                }}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all shadow-2xl cursor-pointer active:scale-95 border-2 touch-none select-none ${
                  isHoldingOrDragging
                    ? 'scale-110 ring-4 ring-amber-400 bg-amber-500 text-slate-950 border-white shadow-[0_0_30px_rgba(245,158,11,1)] cursor-grabbing'
                    : isInspectorActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse'
                    : 'bg-slate-950/95 text-amber-400 border-amber-400/80 pixel-bevel-gold hover:border-amber-300 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
                }`}
                title={
                  isHoldingOrDragging
                    ? 'Dragging Magic Tool... Release to place'
                    : isInspectorActive
                    ? 'Magic Inspect ACTIVE • Tap once to open, hold to drag'
                    : 'Magic Tool • Tap once to open, hold to drag'
                }
                aria-label="Magic Tool Floating Menu"
              >
                {isInspectorActive ? (
                  <Crosshair className="w-5 h-5 text-slate-950 animate-spin stroke-[2.5]" />
                ) : (
                  <Wand2 className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                )}
              </button>

              {/* Audit Counter Badge */}
              {auditList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 border border-white text-white font-black text-[9px] shadow-md animate-bounce pointer-events-none">
                  {auditList.length}
                </span>
              )}

              {/* Status Ping when Inspect Mode is Active */}
              {isInspectorActive && (
                <span className="absolute -bottom-1 -left-1 px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-arcade text-[8px] font-black pixel-corners shadow border border-emerald-300 pointer-events-none">
                  ON
                </span>
              )}
            </div>
          ) : (
            /* EXPANDED FLOATING OPTIONS PANEL */
            <div
              className="w-[calc(100vw-2rem)] sm:w-80 bg-slate-950/98 backdrop-blur-xl border-2 border-amber-400 pixel-corners pixel-bevel-gold p-3.5 shadow-[0_0_35px_rgba(0,0,0,0.95)] space-y-2.5 animate-in fade-in zoom-in-95 duration-150 max-h-[75dvh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle & Header */}
              <div
                className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs cursor-move select-none gap-2"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div className="flex items-center gap-1.5 text-amber-300 font-arcade font-black text-[11px] uppercase tracking-wider truncate">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{selectedElementData ? 'INSPECTED ELEMENT' : 'MAGIC INSPECT'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                  {selectedElementData && (
                    <button
                      type="button"
                      onClick={() => setSelectedElementData(null)}
                      className="min-h-[44px] px-2.5 text-[10px] font-pixel bg-slate-800 hover:bg-slate-700 text-amber-300 rounded cursor-pointer"
                      title="Back to options"
                    >
                      MENU
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded bg-slate-900 hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Minimize to floating icon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

                {/* VIEW A: IF ELEMENT IS INSPECTED */}
                {selectedElementData ? (
                  <div className="space-y-2.5 font-pixel text-left">
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase tracking-wider mb-1">
                        Detected Text:
                      </span>
                      <div className="p-2 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-white leading-relaxed max-h-24 overflow-y-auto custom-scrollbar select-all">
                        {selectedElementData.text}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase tracking-wider mb-1">
                          Category:
                        </label>
                        <select
                          value={selectedElementData.category}
                          onChange={(e) =>
                            setSelectedElementData({
                              ...selectedElementData,
                              category: e.target.value as TranslationAuditItem['category'],
                            })
                          }
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 text-[11px] font-bold text-amber-300 rounded cursor-pointer"
                        >
                          <option value="UI Label">UI Label</option>
                          <option value="Card Description">Card Description</option>
                          <option value="Wonderkid Profile">Wonderkid Profile</option>
                          <option value="Stat / Attribute">Stat / Attribute</option>
                          <option value="Perk / Playstyle">Perk / Playstyle</option>
                          <option value="Position">Position</option>
                          <option value="Club / Manager">Club / Manager</option>
                          <option value="Trophy">Trophy</option>
                          <option value="Popup / Explainer">Popup / Explainer</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase tracking-wider mb-1">
                          Location:
                        </label>
                        <input
                          type="text"
                          value={selectedElementData.screen}
                          onChange={(e) =>
                            setSelectedElementData({
                              ...selectedElementData,
                              screen: e.target.value,
                            })
                          }
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 text-[11px] text-white rounded font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase tracking-wider mb-1">
                        Suggested ({currentLanguage}):
                      </label>
                      <textarea
                        rows={2}
                        value={selectedElementData.suggested}
                        onChange={(e) =>
                          setSelectedElementData({
                            ...selectedElementData,
                            suggested: e.target.value,
                          })
                        }
                        placeholder="Type Spanish translation..."
                        className="w-full p-1.5 bg-slate-900 border border-slate-700 text-xs text-emerald-300 rounded font-mono placeholder:text-slate-600 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSavePickedText}
                        className="flex-1 min-h-[44px] py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade text-xs font-black uppercase rounded border border-emerald-300 shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        <span>SAVE ITEM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedElementData(null)}
                        className="min-h-[44px] py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-pixel rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW B: DEFAULT OPTIONS */
                  <>
                    {/* Option 1: Toggle Inspect Mode */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsInspectorActive((prev) => !prev);
                      }}
                      className={`w-full min-h-[44px] py-2 px-3 font-arcade text-[10px] sm:text-xs font-black uppercase tracking-wider pixel-corners border-2 flex items-center justify-between cursor-pointer transition-all active:scale-95 shadow-md ${
                        isInspectorActive
                          ? 'bg-amber-400 text-slate-950 border-amber-200 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border-slate-700 hover:border-amber-400/80 pixel-bevel-raised'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Crosshair className={`w-4 h-4 ${isInspectorActive ? 'animate-spin' : ''}`} />
                        <span>{isInspectorActive ? 'INSPECTING ACTIVE' : 'CLICK TO INSPECT'}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-pixel ${
                          isInspectorActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isInspectorActive ? 'ACTIVE' : 'START'}
                      </span>
                    </button>

                    {/* Option 2: Open Audit Center */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuditCenter(true);
                        setIsExpanded(false);
                      }}
                      className="w-full min-h-[44px] py-2 px-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 border-2 border-slate-700 hover:border-cyan-400 pixel-bevel-raised pixel-corners flex items-center justify-between font-arcade text-[10px] sm:text-xs font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span>AUDIT CENTER</span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-200 border border-cyan-500/50 text-[9px] font-pixel">
                        {auditList.length} ITEMS
                      </span>
                    </button>

                    {/* Option 3: Run Predefined Scan */}
                    <button
                      type="button"
                      onClick={() => {
                        handlePreScan();
                      }}
                      className="w-full min-h-[44px] py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-slate-700 hover:border-amber-400 pixel-bevel-raised pixel-corners flex items-center justify-between font-arcade text-[10px] sm:text-xs font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5">
                        <Search className="w-4 h-4 text-amber-400" />
                        <span>SCAN UNTRANSLATED</span>
                      </div>
                      <span className="text-[9px] font-pixel text-slate-400">AUTO</span>
                    </button>

                    {/* Move Hint */}
                    <div className="text-[9px] font-pixel text-slate-500 text-center uppercase tracking-widest pt-1 border-t border-slate-800">
                      ✦ DRAG ICON ANYWHERE ON SCREEN ✦
                    </div>
                  </>
                )}
              </div>
            )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FULL TRANSLATION AUDIT & EXPORT CENTER MODAL */}
      {/* ========================================================================= */}
      <ConsoleModalShell
        isOpen={showAuditCenter}
        onClose={() => {
          setShowAuditCenter(false);
          setConfirmClearAll(false);
          if (onCloseExternalReport) onCloseExternalReport();
        }}
        id="translation-audit-center-modal"
        title="TRANSLATION AUDIT & EXPORT"
        subtitle={`${auditList.length} items flagged • Target: ${currentLanguage}`}
        badge="MAGIC INSPECTOR"
        icon={<Globe className="w-5 h-5 text-amber-300" />}
        accentColor="amber"
        maxWidthClass="sm:max-w-4xl"
        zIndexClass="z-[10001]"
        tabs={[
          { id: 'items', label: 'Audited Items', badge: filteredItems.length, icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'actions', label: 'Export & Scan', icon: <Download className="w-3.5 h-3.5" /> },
        ]}
        activeTabId={auditTab}
        onTabChange={(id) => setAuditTab(id as 'items' | 'actions')}
        bodyClassName="p-3 sm:p-5 space-y-3.5"
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 truncate">
              Copy JSON or export flagged translation strings.
            </span>
            <button
              type="button"
              onClick={() => {
                setShowAuditCenter(false);
                setConfirmClearAll(false);
                if (onCloseExternalReport) onCloseExternalReport();
              }}
              className="min-h-[48px] px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-arcade text-xs font-bold rounded-xl cursor-pointer shrink-0"
            >
              CLOSE
            </button>
          </div>
        }
      >
        {auditTab === 'actions' ? (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-arcade text-xs font-black text-amber-300 uppercase">
                Export Translation Audit Report
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Export all {auditList.length} flagged strings in JSON or CSV format, or run the automatic pre-scan on known card and UI sections.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="min-h-[48px] py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedFormat === 'json' ? 'COPIED JSON!' : 'COPY AS JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCsv}
                  className="min-h-[48px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{copiedFormat === 'csv' ? 'COPIED CSV!' : 'COPY CSV'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="min-h-[48px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>DOWNLOAD JSON FILE</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handlePreScan();
                    setAuditPage(1);
                    setAuditTab('items');
                  }}
                  className="min-h-[48px] py-2.5 px-4 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>PRE-SCAN KNOWN AREAS</span>
                </button>
              </div>
            </div>

            {auditList.length > 0 && (
              <div className="bg-rose-950/30 border border-rose-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase text-rose-300">Danger Zone</div>
                  <p className="text-xs text-slate-300">
                    Clear all {auditList.length} flagged translation items from local audit storage.
                  </p>
                </div>
                {!confirmClearAll ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="min-h-[44px] px-4 py-2 bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-600 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Items</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearAuditItems();
                        loadItems();
                        setConfirmClearAll(false);
                        setAuditPage(1);
                      }}
                      className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                    >
                      Confirm Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setAuditPage(1);
                  }}
                  placeholder="Filter audited text or screen..."
                  className="w-full min-h-[44px] pl-9 pr-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono"
                />
              </div>

              <select
                value={activeFilterCategory}
                onChange={(e) => {
                  setActiveFilterCategory(e.target.value);
                  setAuditPage(1);
                }}
                className="w-full sm:w-56 min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs font-bold text-amber-300"
              >
                {[
                  'all',
                  'Card Description',
                  'Wonderkid Profile',
                  'Stat / Attribute',
                  'Perk / Playstyle',
                  'Position',
                  'Club / Manager',
                  'Trophy',
                  'Popup / Explainer',
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? `ALL CATEGORIES (${auditList.length})` : cat}
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const pageSize = 8;
              const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
              const safePage = Math.min(auditPage, totalPages);
              const pagedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);

              return (
                <>
                  {filteredItems.length > pageSize && (
                    <ConsolePaginationBar
                      currentPage={safePage}
                      totalPages={totalPages}
                      onPageChange={setAuditPage}
                      totalItems={filteredItems.length}
                      pageSize={pageSize}
                    />
                  )}

                  {filteredItems.length === 0 ? (
                    <div className="text-center py-10 px-4 space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <Wand2 className="w-6 h-6 text-amber-400/60" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-arcade font-black text-slate-300 uppercase">
                        NO ITEMS IN TRANSLATION AUDIT
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                        Use <strong>Magic Inspect</strong> to tap untranslated text in-game, or open the{' '}
                        <strong>Export & Scan</strong> tab to scan known sections.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {pagedItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 font-arcade text-[10px] font-black uppercase">
                                {item.category}
                              </span>
                              <span className="text-xs font-mono text-slate-400 truncate">
                                📍 {item.screen}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                removeAuditItem(item.id);
                                loadItems();
                              }}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/60 border border-slate-800 rounded-xl cursor-pointer shrink-0"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-slate-100 break-words">
                              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                                Original English:
                              </span>
                              {item.englishText}
                            </div>

                            <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl font-mono text-emerald-300 break-words">
                              <span className="block text-[10px] text-emerald-400 uppercase tracking-wider mb-1">
                                Suggested Translation:
                              </span>
                              {item.suggestedTranslation || (
                                <span className="text-slate-500 italic">No translation entered yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </ConsoleModalShell>
    </div>
  );
};
