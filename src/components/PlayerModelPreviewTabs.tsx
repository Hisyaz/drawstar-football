import React, { useState } from 'react';
import { PlayerCardData } from '../types';
import { PlayerCard } from './PlayerCard';
import { PlayerFacePortrait } from './PlayerFacePortrait';
import { CaptainFullBodyPreview } from './CaptainFullBodyPreview';
import { InMatchSpritePreview } from './InMatchSpritePreview';
import { CreditCard, User, Accessibility, Gamepad2 } from 'lucide-react';

export type PlayerPreviewViewMode = 'card' | 'portrait' | 'full_body' | 'in_match';

interface PlayerModelPreviewTabsProps {
  player: PlayerCardData;
  id?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  hideTeam?: boolean;
  hideNationality?: boolean;
  hidePosition?: boolean;
  hideStats?: boolean;
  hidePerks?: boolean;
  hideOvr?: boolean;
  defaultView?: PlayerPreviewViewMode;
  className?: string;
}

export const PlayerModelPreviewTabs: React.FC<PlayerModelPreviewTabsProps> = ({
  player,
  id = 'character-creation-card-render',
  isFlipped = false,
  onFlip,
  hideTeam = false,
  hideNationality = false,
  hidePosition = false,
  hideStats = false,
  hidePerks = false,
  hideOvr = false,
  defaultView = 'card',
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<PlayerPreviewViewMode>(defaultView);

  const tabs: Array<{ id: PlayerPreviewViewMode; label: string; icon: React.FC<any> }> = [
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'portrait', label: 'Portrait', icon: User },
    { id: 'full_body', label: 'Full Body', icon: Accessibility },
    { id: 'in_match', label: 'In Match', icon: Gamepad2 },
  ];

  return (
    <div className={`w-full flex flex-col items-center space-y-2.5 ${className}`}>
      {/* 4-View Switcher Bar */}
      <div className="grid grid-cols-4 gap-1 bg-slate-900 border border-slate-700/80 rounded-xl p-1 shadow-inner w-full max-w-md justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              className={`min-h-[44px] px-1.5 sm:px-2.5 py-2 rounded-lg text-[10px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 transition-all cursor-pointer active:scale-95 min-w-0 ${
                active
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Preview Model Stage */}
      <div className="w-full flex justify-center py-1 overflow-visible">
        {viewMode === 'card' && (
          <div className="transform scale-[0.85] xs:scale-[0.92] sm:scale-100 origin-top transition-transform duration-200">
            <PlayerCard
              id={id}
              player={player}
              isFlipped={isFlipped}
              onFlip={onFlip}
              hideTeam={hideTeam}
              hideNationality={hideNationality}
              hidePosition={hidePosition}
              hideStats={hideStats}
              hidePerks={hidePerks}
              hideOvr={hideOvr}
            />
          </div>
        )}

        {viewMode === 'portrait' && (
          <div className="w-full max-w-[272px] flex flex-col items-center gap-2">
            <PlayerFacePortrait player={player} hideTeam={hideTeam} />
            <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-cyan-300 truncate">{player.name}</span>
              <span className="text-slate-400 shrink-0 ml-2">
                {player.heightCm || 178}cm · {player.weightKg || 74}kg
              </span>
            </div>
          </div>
        )}

        {viewMode === 'full_body' && (
          <CaptainFullBodyPreview player={player} scale={1.5} />
        )}

        {viewMode === 'in_match' && (
          <InMatchSpritePreview player={player} scale={2.0} />
        )}
      </div>
    </div>
  );
};
