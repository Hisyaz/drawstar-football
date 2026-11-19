import React, { useState, useEffect } from 'react';
import { PlayerCardData } from '../types';
import { NATIONALITIES } from '../constants';
import {
  getValidSubPositionsForCategory,
  getValidPlayStylesForSubPosition,
  sanitizeAndRepairPlayerIdentity,
} from '../utils/playerIdentitySystem';
import { CheckCircle2, Sparkles } from 'lucide-react';

import { isUniqueElitePlayer, applyGlobalOvrCap } from '../utils/uniquePlayerRegistry';

import { CaptainFullBodyPreview } from './CaptainFullBodyPreview';
import { ConsoleModalShell } from './common/ConsolePager';

interface TeamPlayerEditorModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  slotNumber: number;
  groupLabel: string;
  occupiedNumbers?: Map<number, string>;
  onSave: (updated: PlayerCardData) => void;
  onClose: () => void;
  onEditAppearancePortrait?: (currentForm: PlayerCardData) => void;
}

export const TeamPlayerEditorModal: React.FC<TeamPlayerEditorModalProps> = ({
  isOpen,
  player,
  slotNumber,
  groupLabel,
  occupiedNumbers,
  onSave,
  onClose,
  onEditAppearancePortrait,
}) => {
  const [formData, setFormData] = useState<PlayerCardData>(player);
  const [shirtNumber, setShirtNumber] = useState<number>(player?.number ?? player?.shirtNumber ?? slotNumber);
  const [numberError, setNumberError] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setFormData(sanitizeAndRepairPlayerIdentity(player) as PlayerCardData);
      setShirtNumber(player.number ?? player.shirtNumber ?? slotNumber);
      setNumberError(null);
    }
  }, [player, slotNumber]);

  if (!isOpen) return null;

  const currentCategory = (formData.position || 'ATT').toUpperCase() as 'ATT' | 'MID' | 'DEF' | 'GK';
  const availableSubPositions = getValidSubPositionsForCategory(currentCategory);
  const currentSubPos = availableSubPositions.includes(formData.subPosition || '')
    ? formData.subPosition!
    : availableSubPositions[0] || 'ST';
  const availablePlaystyles = getValidPlayStylesForSubPosition(currentSubPos);

  const validateShirtNumber = (num: number): string | null => {
    if (isNaN(num) || num < 1 || num > 999) {
      return 'Shirt number must be between 1 and 999.';
    }
    if (occupiedNumbers) {
      const occupiedBy = occupiedNumbers.get(num);
      if (occupiedBy) {
        return `Shirt #${num} is already taken by ${occupiedBy}.`;
      }
    }
    return null;
  };

  const handleCategoryChange = (newCat: 'ATT' | 'MID' | 'DEF' | 'GK') => {
    const newSubs = getValidSubPositionsForCategory(newCat);
    const newSub = newSubs[0] || (newCat === 'GK' ? 'GK' : 'ST');
    const newStyles = getValidPlayStylesForSubPosition(newSub);
    const newStyle = newStyles[0] || 'Balanced';

    setFormData((prev) =>
      sanitizeAndRepairPlayerIdentity({
        ...prev,
        position: newCat,
        subPosition: newSub,
        playStyle: newStyle,
      }) as PlayerCardData
    );
  };

  const handleSubPosChange = (newSub: string) => {
    const newStyles = getValidPlayStylesForSubPosition(newSub);
    const newStyle = newStyles.includes(formData.playStyle || '')
      ? formData.playStyle!
      : newStyles[0] || 'Balanced';

    setFormData((prev) =>
      sanitizeAndRepairPlayerIdentity({
        ...prev,
        subPosition: newSub,
        playStyle: newStyle,
      }) as PlayerCardData
    );
  };

  const handleOvrChange = (newOvr: number) => {
    const maxAllowed = isUniqueElitePlayer(formData) ? 99 : 96;
    const ovr = Math.min(maxAllowed, Math.max(40, newOvr));
    setFormData((prev) => ({
      ...prev,
      ovr,
      stats: {
        ...prev.stats,
        pro: ovr,
        def: prev.position === 'GK' ? ovr : Math.max(30, ovr - 10),
        cre: Math.max(30, ovr - 5),
        men: ovr,
        goa: prev.position === 'GK' ? 20 : Math.max(30, ovr - 5),
        phy: ovr,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateShirtNumber(shirtNumber);
    if (err) {
      setNumberError(err);
      return;
    }

    const updatedWithNumber: PlayerCardData = {
      ...formData,
      number: shirtNumber,
      shirtNumber: shirtNumber,
    };

    const sanitized = sanitizeAndRepairPlayerIdentity(updatedWithNumber) as PlayerCardData;
    const finalPlayer = applyGlobalOvrCap(sanitized);
    onSave(finalPlayer);
    onClose();
  };

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="PLAYER EDITOR"
      subtitle={`Slot #${slotNumber} • Shirt #${shirtNumber} • Team Squad Save File`}
      badge={groupLabel}
      maxWidthClass="sm:max-w-2xl"
      accentColor="blue"
      icon={
        <span className="font-mono font-black text-xs text-indigo-300">
          #{shirtNumber || slotNumber}
        </span>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="team-player-editor-form"
            className="min-h-[44px] flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Save Changes
          </button>
        </div>
      }
    >
      <form id="team-player-editor-form" onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Basic Identity & Shirt Number */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Player Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-300 mb-1 flex items-center justify-between">
              <span>Shirt # (1-999) *</span>
            </label>
            <input
              type="number"
              min={1}
              max={999}
              required
              value={shirtNumber}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setShirtNumber(val);
                setNumberError(validateShirtNumber(val));
              }}
              className={`w-full min-h-[44px] bg-slate-950 border ${
                numberError ? 'border-red-500 text-red-300' : 'border-indigo-500/50 text-indigo-200'
              } rounded-xl px-3 py-2 text-xs font-mono font-black focus:border-indigo-400`}
            />
            {numberError && (
              <p className="text-[10px] text-red-400 font-bold mt-1 leading-tight">
                {numberError}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Nationality *</label>
          <select
            value={formData.nationality?.code || 'ENG'}
            onChange={(e) => {
              const selCode = e.target.value;
              const natObj = NATIONALITIES.find((n) => n.code === selCode) || {
                code: selCode,
                iso: selCode,
                name: selCode,
              };
              setFormData({ ...formData, nationality: natObj });
            }}
            className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-indigo-500 cursor-pointer"
          >
            {NATIONALITIES.map((n) => (
              <option key={n.code} value={n.code}>
                {n.name} ({n.code})
              </option>
            ))}
          </select>
        </div>

        {/* Age, Foot & Overall */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Age</label>
            <input
              type="number"
              min={15}
              max={42}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
              className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Foot</label>
            <select
              value={formData.preferredFoot || 'Right'}
              onChange={(e) => setFormData({ ...formData, preferredFoot: e.target.value as 'Left' | 'Right' })}
              className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white cursor-pointer"
            >
              <option value="Right">Right Foot</option>
              <option value="Left">Left Foot</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-amber-400 mb-1">Overall OVR</label>
            <input
              type="number"
              min={40}
              max={99}
              value={formData.ovr}
              onChange={(e) => handleOvrChange(parseInt(e.target.value) || 70)}
              className="w-full min-h-[44px] bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-black text-amber-300 focus:border-amber-400"
            />
          </div>
        </div>

        {/* Position Taxonomy System */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
          <span className="text-xs font-black text-indigo-400 uppercase tracking-wider block">
            Positional &amp; Tactical Setup
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">1. Category</label>
              <select
                value={currentCategory}
                onChange={(e) => handleCategoryChange(e.target.value as 'ATT' | 'MID' | 'DEF' | 'GK')}
                className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-bold text-white cursor-pointer"
              >
                <option value="ATT">ATT (Attacker)</option>
                <option value="MID">MID (Midfielder)</option>
                <option value="DEF">DEF (Defender)</option>
                <option value="GK">GK (Goalkeeper)</option>
              </select>
            </div>

            {/* Sub Position */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">2. Sub-Position</label>
              <select
                value={currentSubPos}
                onChange={(e) => handleSubPosChange(e.target.value)}
                className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-bold text-white cursor-pointer"
              >
                {availableSubPositions.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            {/* Playstyle */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">3. Playstyle</label>
              <select
                value={formData.playStyle || availablePlaystyles[0] || 'Balanced'}
                onChange={(e) => setFormData({ ...formData, playStyle: e.target.value })}
                className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-bold text-white cursor-pointer"
              >
                {availablePlaystyles.map((ps) => (
                  <option key={ps} value={ps}>
                    {ps}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Appearance Preview & Portrait Creator Launch */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <CaptainFullBodyPreview player={formData} width={72} height={92} scale={1.1} allowFlip={false} className="!p-1.5 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                Appearance &amp; Portrait Model
              </span>
              <span className="text-xs text-slate-300 leading-relaxed block mt-0.5">
                Open in full Portrait Creator to customize hair, skin, tattoos, accessories &amp; 32-bit gear.
              </span>
            </div>
          </div>
          {onEditAppearancePortrait && (
            <button
              type="button"
              onClick={() => onEditAppearancePortrait({ ...formData, number: shirtNumber, shirtNumber })}
              className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Edit Appearance
            </button>
          )}
        </div>
      </form>
    </ConsoleModalShell>
  );
};
