import React, { useMemo, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { PlayerCardData } from '../types';
import { TeamKit } from '../gameplay/types';
import { CaptainHeroCanvas } from '../gameplay/components/CaptainHeroCanvas';
import { extractPlayerRenderExtras, playerCardToAppearanceV2 } from '../utils/gameplayAdapter';

interface CaptainFullBodyPreviewProps {
  player: PlayerCardData;
  kitOverride?: Partial<TeamKit>;
  scale?: number;
  width?: number;
  height?: number;
  allowFlip?: boolean;
  className?: string;
}

const FACING_ORDER: Array<'right' | 'left' | 'back'> = ['right', 'left', 'back'];

export const CaptainFullBodyPreview: React.FC<CaptainFullBodyPreviewProps> = ({
  player,
  kitOverride,
  scale = 1.65,
  width = 112,
  height = 192,
  allowFlip = true,
  className = '',
}) => {
  const [facing, setFacing] = useState<'right' | 'left' | 'back'>('right');

  const appearanceV2 = useMemo(() => playerCardToAppearanceV2(player), [player]);
  const extras = useMemo(() => extractPlayerRenderExtras(player, kitOverride), [player, kitOverride]);

  const activeKit: TeamKit = useMemo(
    () => ({
      name: player.club || 'Club Kit',
      shortName: (player.club || 'CLB').slice(0, 3).toUpperCase(),
      primaryColor: kitOverride?.primaryColor || player.kit?.color1 || '#0284c7',
      secondaryColor: kitOverride?.secondaryColor || player.kit?.color2 || '#ffffff',
      shortsColor: kitOverride?.shortsColor || player.kit?.color2 || '#0f172a',
      socksColor: kitOverride?.socksColor || player.kit?.color1 || '#0284c7',
      gkColor: kitOverride?.gkColor || '#eab308',
    }),
    [player.club, player.kit, kitOverride]
  );

  const cycleFacing = () => {
    setFacing((prev) => {
      const idx = FACING_ORDER.indexOf(prev);
      return FACING_ORDER[(idx + 1) % FACING_ORDER.length];
    });
  };

  return (
    <div className={`flex flex-col items-center gap-2 select-none ${className}`}>
      <div className="relative rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 py-3 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.14),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between w-full mb-1 gap-3">
          <span className="text-[9px] font-['Press_Start_2P'] text-amber-400 uppercase tracking-wider">
            32-BIT BODY SPEC
          </span>
          {allowFlip && (
            <div className="flex items-center gap-1">
              {(['right', 'left', 'back'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setFacing(dir)}
                  className={`px-2 py-1 rounded text-[9px] font-mono uppercase cursor-pointer transition ${
                    facing === dir
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
                  }`}
                >
                  {dir === 'right' ? 'R→' : dir === 'left' ? '←L' : 'BACK'}
                </button>
              ))}
              <button
                type="button"
                onClick={cycleFacing}
                aria-label="Rotate full body model"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <CaptainHeroCanvas
          appearance={appearanceV2}
          kit={activeKit}
          facing={facing}
          width={width}
          height={height}
          scale={scale}
          extras={extras}
          className="relative z-10 my-1"
        />
        <div className="relative z-10 mt-1 text-[10px] font-mono text-slate-400 flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-white font-bold">{player.name.toUpperCase()}</span>
          <span>·</span>
          <span className="text-amber-300">
            #{extras.shirtNumber} {player.subPosition || player.position || 'ST'}
          </span>
          <span>·</span>
          <span>
            {appearanceV2.physique.heightCm}cm/{appearanceV2.physique.weightKg}kg
          </span>
        </div>
      </div>
    </div>
  );
};
