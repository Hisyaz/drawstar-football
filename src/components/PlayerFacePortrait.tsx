import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PlayerCardData } from '../types';
import {
  buildHairElements,
  computePlayerStrengthCalculations,
} from './playerFaceLayers';
import { computeKitStyles, PlayerBustLayers } from './playerKitLayers';
import { resolvePlayerKitAndEmblem } from '../utils/kitResolutionSystem';
import { resolveEffectiveSponsor } from '../utils/uniformSponsorSystem';

interface PlayerFacePortraitProps {
  player: PlayerCardData;
  className?: string;
  size?: number;
  hideTeam?: boolean;
}

export const PlayerFacePortrait: React.FC<PlayerFacePortraitProps> = ({
  player,
  className = '',
  size,
  hideTeam = false,
}) => {
  const reactId = useId();
  const idPrefix = useMemo(() => `portrait-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [reactId]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState<number>(size || 260);

  useEffect(() => {
    if (size) {
      setStageWidth(size);
      return;
    }
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setStageWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  const biometrics = useMemo(
    () =>
      player?.biometrics || {
        strength: 40,
        skinColor: '#f5d0b1',
        hairStyle: 'straight' as const,
        hairLength: 'short' as const,
        hairRoot: '#18181b',
        hairDye: 'none',
        facialHair: 'none' as const,
      },
    [player?.biometrics]
  );

  const accessories = useMemo<Partial<NonNullable<PlayerCardData['accessories']>>>(
    () => player?.accessories || {},
    [player?.accessories]
  );

  const resolvedKitData = useMemo(() => {
    return resolvePlayerKitAndEmblem(player);
  }, [
    player,
    player?.club,
    player?.clubId,
    player?.clubCountry,
    player?.activeInternationalDuty,
    player?.kit,
    player?.kit?.style,
    player?.kit?.color1,
    player?.kit?.color2,
    player?.kit?.pattern,
    player?.kit?.collar,
    player?.kit?.sponsor,
    (player as any)?.useDirectKit,
    (player as any)?.isKitPreview,
    (player as any)?._forceKit,
    player?.emblem,
  ]);

  const activeKit = resolvedKitData.kit;
  const activeEmblem = resolvedKitData.emblem;
  const activeClubName = resolvedKitData.teamName || player?.club || 'Club';

  const resolvedSponsor = useMemo(() => {
    return resolveEffectiveSponsor(activeKit, undefined, activeClubName);
  }, [activeKit, activeClubName]);

  const rawStrength = useMemo(() => {
    if (typeof player?.statBreakStats?.strength === 'number' && player.statBreakStats.strength > 0) {
      return player.statBreakStats.strength;
    }
    if (typeof player?.stats?.detailed?.strength === 'number' && player.stats.detailed.strength > 0) {
      return player.stats.detailed.strength;
    }
    if (typeof biometrics?.strength === 'number' && !isNaN(biometrics.strength) && biometrics.strength > 0) {
      return biometrics.strength;
    }
    if (typeof player?.stats?.phy === 'number' && !isNaN(player.stats.phy) && player.stats.phy > 0) {
      return player.stats.phy;
    }
    return 40;
  }, [
    player?.statBreakStats?.strength,
    player?.stats?.detailed?.strength,
    biometrics?.strength,
    player?.stats?.phy,
  ]);

  const strengthCalculations = useMemo(
    () =>
      computePlayerStrengthCalculations(
        rawStrength,
        player?.statBreakActive,
        player?.statBreakStats,
        player?.stats?.detailed,
        activeKit.style || 'normal',
        player?.appearanceV2?.physique
      ),
    [
      rawStrength,
      player?.statBreakActive,
      player?.statBreakStats,
      player?.stats?.detailed,
      activeKit.style,
      player?.appearanceV2?.physique?.neckWidth,
      player?.appearanceV2?.physique?.neckLength,
      player?.appearanceV2?.physique?.chest,
    ]
  );

  const hairElements = useMemo(() => buildHairElements(biometrics, idPrefix), [biometrics, idPrefix]);
  const kitStyles = useMemo(() => computeKitStyles(activeKit, strengthCalculations), [activeKit, strengthCalculations]);

  // Adaptive scale so full hair + head + neck + upper/mid shirt (cropped slightly higher at the bottom) frame cleanly
  const hairBaseScale = useMemo(() => {
    const spec = biometrics.specialHair;
    const isSpecial = biometrics.hairStyle === 'special' || biometrics.hairLength === 'special';
    if (isSpecial) {
      if (spec === 'el-shaarawy-spikes') return 0.88;
      if (spec === 'valderrama-afro' || spec === 'cucurella-afro') return 0.92;
      if (spec === 'taribo-west' || spec === 'neymar-mohawk' || spec === 'puyol-curly') return 0.98;
      return 1.02;
    }
    if (biometrics.hairLength === 'long') return 0.96;
    if (biometrics.hairLength === 'medium' && (biometrics.hairStyle === 'dreads' || biometrics.hairStyle === 'curly')) {
      return 0.98;
    }
    return 1.06;
  }, [biometrics.hairStyle, biometrics.hairLength, biometrics.specialHair]);

  const finalScale = hairBaseScale * (stageWidth / 260);
  // Crop ~22px off the bottom of the 248px card bust so slightly less shirt bottom is visible while keeping shirt flush to the bottom edge
  const bottomCropPx = 22 * finalScale;

  return (
    <div
      ref={stageRef}
      className={`relative aspect-square w-full overflow-hidden rounded-2xl border border-cyan-500/35 bg-[radial-gradient(ellipse_at_top,#334155_0%,#1e293b_60%,#0f172a_100%)] shadow-2xl select-none ${className}`}
      style={size ? { width: `${size}px`, height: `${size}px`, maxWidth: '100%' } : { maxWidth: '264px' }}
    >
      {/* Subtle studio vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,transparent_54%,rgba(2,6,23,0.58)_100%)] z-20" />

      {/* Card bust stage without card frame: identical 216x248 layout, cropped slightly higher at the bottom */}
      <div
        className="absolute left-1/2 w-[216px] h-[248px] pointer-events-none"
        style={{
          bottom: `-${bottomCropPx}px`,
          transformOrigin: '50% 100%',
          transform: `translateX(-50%) scale(${finalScale})`,
        }}
      >
        <PlayerBustLayers
          biometrics={biometrics}
          accessories={accessories}
          strengthCalculations={strengthCalculations}
          hairElements={hairElements}
          activeKit={activeKit}
          activeEmblem={activeEmblem}
          resolvedSponsor={resolvedSponsor}
          kitStyles={kitStyles}
          idPrefix={idPrefix}
          hideTeam={hideTeam}
        />
      </div>
    </div>
  );
};
