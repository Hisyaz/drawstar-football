import React from 'react';
import { EmblemConfig, KitConfig, PlayerBiometrics, PlayerCardData, SponsorDesignConfig } from '../types';
import {
  HairElements,
  HeadwearOverlay,
  StrengthCalculations,
  renderArmTattoo,
  renderArmVeins,
  renderEarring,
  renderFaceTattoo,
  renderFacialHair,
  renderForeheadVeins,
  renderNeckTattoo,
  renderNeckVeins,
  renderNecklace,
} from './playerFaceLayers';

export interface ComputedKitStyles {
  chestStyle: React.CSSProperties;
  shoulderLStyle: React.CSSProperties;
  shoulderRStyle: React.CSSProperties;
}

export function computeKitStyles(
  activeKit: KitConfig,
  strengthCalculations: StrengthCalculations
): ComputedKitStyles {
  const { color1: kit1, color2: kit2, pattern } = activeKit;
  const { chestW, shoulderW, shoulderOuterRound, shoulderDrop, sleeveHeight, strengthTier, strength } =
    strengthCalculations;

  let chestTopRound = 0;
  if (strengthTier >= 5) {
    chestTopRound = 22;
  } else if (strengthTier === 4) {
    chestTopRound = 18;
  } else if (strengthTier === 3) {
    chestTopRound = 14;
  } else if (strength >= 80) {
    chestTopRound = Math.round(4 + ((strength - 80) / 9) * 6);
  } else {
    chestTopRound = 0;
  }

  const chestStyle: React.CSSProperties = {
    backgroundColor: kit1,
    backgroundImage: 'none',
    backgroundSize: 'auto',
    backgroundPosition: '0 0',
    borderRadius: `${chestTopRound}px ${chestTopRound}px 0 0`,
  };

  const shoulderLStyle: React.CSSProperties = {
    backgroundColor: kit1,
    backgroundImage: 'none',
    backgroundSize: 'auto',
    backgroundPosition: '0 0',
    borderRadius: `${shoulderOuterRound}px ${Math.min(8, chestTopRound)}px 0 0`,
    top: `${shoulderDrop}px`,
    height: `${sleeveHeight}px`,
  };

  const shoulderRStyle: React.CSSProperties = {
    backgroundColor: kit1,
    backgroundImage: 'none',
    backgroundSize: 'auto',
    backgroundPosition: '0 0',
    borderRadius: `${Math.min(8, chestTopRound)}px ${shoulderOuterRound}px 0 0`,
    top: `${shoulderDrop}px`,
    height: `${sleeveHeight}px`,
  };

  if (pattern === 'solid') {
    chestStyle.backgroundColor = kit1;
    chestStyle.backgroundImage = 'none';
    shoulderLStyle.backgroundColor = kit1;
    shoulderLStyle.backgroundImage = 'none';
    shoulderRStyle.backgroundColor = kit1;
    shoulderRStyle.backgroundImage = 'none';
  } else if (pattern === 'stripes') {
    const stripePattern = `repeating-linear-gradient(90deg, ${kit1}, ${kit1} 18px, ${kit2} 18px, ${kit2} 36px)`;
    chestStyle.backgroundImage = stripePattern;
    shoulderLStyle.backgroundImage = stripePattern;
    shoulderLStyle.backgroundPosition = `-${shoulderW}px 0`;
    shoulderRStyle.backgroundImage = stripePattern;
    shoulderRStyle.backgroundPosition = `-${chestW}px 0`;
  } else if (pattern === 'hoops') {
    const hoopPattern = `repeating-linear-gradient(180deg, ${kit1}, ${kit1} 14px, ${kit2} 14px, ${kit2} 28px)`;
    chestStyle.backgroundImage = hoopPattern;
    shoulderLStyle.backgroundImage = hoopPattern;
    shoulderRStyle.backgroundImage = hoopPattern;
  } else if (pattern === 'halves') {
    const halvePattern = `linear-gradient(90deg, ${kit1} 50%, ${kit2} 50%)`;
    chestStyle.backgroundImage = halvePattern;
    shoulderLStyle.backgroundColor = kit1;
    shoulderRStyle.backgroundColor = kit2;
  } else if (pattern === 'sash') {
    chestStyle.backgroundColor = kit1;
    chestStyle.backgroundImage = `linear-gradient(135deg, transparent 42%, ${kit2} 42%, ${kit2} 58%, transparent 58%)`;
    shoulderLStyle.backgroundColor = kit1;
    shoulderLStyle.backgroundImage = 'none';
    shoulderRStyle.backgroundColor = kit1;
    shoulderRStyle.backgroundImage = 'none';
  } else if (pattern === 'checkered') {
    const checkBg = `linear-gradient(45deg, ${kit2} 25%, transparent 25%, transparent 75%, ${kit2} 75%, ${kit2}), linear-gradient(45deg, ${kit2} 25%, transparent 25%, transparent 75%, ${kit2} 75%, ${kit2})`;
    chestStyle.backgroundColor = kit1;
    chestStyle.backgroundImage = checkBg;
    chestStyle.backgroundSize = `16px 16px`;
    chestStyle.backgroundPosition = `0 0, 8px 8px`;

    shoulderLStyle.backgroundColor = kit1;
    shoulderLStyle.backgroundImage = checkBg;
    shoulderLStyle.backgroundSize = `16px 16px`;
    shoulderLStyle.backgroundPosition = `0 0, 8px 8px`;

    shoulderRStyle.backgroundColor = kit1;
    shoulderRStyle.backgroundImage = checkBg;
    shoulderRStyle.backgroundSize = `16px 16px`;
    shoulderRStyle.backgroundPosition = `0 0, 8px 8px`;
  } else if (pattern === 'raglan-shoulders') {
    chestStyle.backgroundColor = kit1;
    chestStyle.backgroundImage = 'none';
    shoulderLStyle.backgroundColor = kit2;
    shoulderLStyle.backgroundImage = 'none';
    shoulderRStyle.backgroundColor = kit2;
    shoulderRStyle.backgroundImage = 'none';
  } else if (pattern === 'gradient') {
    const gradPattern = `linear-gradient(180deg, ${kit1} 0%, ${kit2} 100%)`;
    chestStyle.backgroundImage = gradPattern;
    shoulderLStyle.backgroundImage = gradPattern;
    shoulderRStyle.backgroundImage = gradPattern;
  } else if (pattern === 'diagonal') {
    const diagPattern = `linear-gradient(135deg, ${kit1} 50%, ${kit2} 50%)`;
    chestStyle.backgroundImage = diagPattern;
    shoulderLStyle.backgroundColor = kit1;
    shoulderRStyle.backgroundColor = kit2;
  } else if (pattern === 'solid-line') {
    const solidLinePattern = `linear-gradient(180deg, ${kit1} 0%, ${kit1} 36px, ${kit2} 36px, ${kit2} 48px, ${kit1} 48px, ${kit1} 100%)`;
    chestStyle.backgroundImage = solidLinePattern;
    shoulderLStyle.backgroundColor = kit1;
    shoulderRStyle.backgroundColor = kit1;
  } else if (pattern === 'two-colors') {
    const twoColorPattern = `linear-gradient(180deg, ${kit1} 50%, ${kit2} 50%)`;
    chestStyle.backgroundImage = twoColorPattern;
    shoulderLStyle.backgroundImage = twoColorPattern;
    shoulderRStyle.backgroundImage = twoColorPattern;
  } else if (pattern === 'horizontal-middle-strip') {
    const midStripPattern = `linear-gradient(180deg, ${kit1} 0%, ${kit1} 30px, ${kit2} 30px, ${kit2} 54px, ${kit1} 54px, ${kit1} 100%)`;
    chestStyle.backgroundImage = midStripPattern;
    shoulderLStyle.backgroundColor = kit1;
    shoulderRStyle.backgroundColor = kit1;
  }

  const fitStyle = activeKit.style || 'normal';
  if (fitStyle === 'tight') {
    shoulderLStyle.borderBottom = '2.5px solid rgba(0,0,0,0.42)';
    shoulderRStyle.borderBottom = '2.5px solid rgba(0,0,0,0.42)';
    shoulderLStyle.boxShadow =
      'inset 0 1px 2px rgba(255,255,255,0.22), inset 0 -1px 2px rgba(0,0,0,0.32)';
    shoulderRStyle.boxShadow =
      'inset 0 1px 2px rgba(255,255,255,0.22), inset 0 -1px 2px rgba(0,0,0,0.32)';
    chestStyle.boxShadow = 'inset 1px 0 2px rgba(0,0,0,0.18), inset -1px 0 2px rgba(0,0,0,0.18)';
  } else if (fitStyle === 'loose') {
    shoulderLStyle.borderBottom = '2.5px solid rgba(0,0,0,0.35)';
    shoulderRStyle.borderBottom = '2.5px solid rgba(0,0,0,0.35)';
    shoulderLStyle.boxShadow = 'inset 0 -3px 5px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.25)';
    shoulderRStyle.boxShadow = 'inset 0 -3px 5px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.25)';
    chestStyle.boxShadow = 'inset 0 -2px 3px rgba(0,0,0,0.15)';
  } else {
    shoulderLStyle.borderBottom = '1.5px solid rgba(0,0,0,0.22)';
    shoulderRStyle.borderBottom = '1.5px solid rgba(0,0,0,0.22)';
    shoulderLStyle.boxShadow = '0 1px 2px rgba(0,0,0,0.15)';
    shoulderRStyle.boxShadow = '0 1px 2px rgba(0,0,0,0.15)';
  }

  return { chestStyle, shoulderLStyle, shoulderRStyle };
}

export function renderKitEmblemSvg(cfg: EmblemConfig, clipPrefix: string) {
  const { shape, mode, color1, color2 } = cfg;
  const color3 = cfg.color3 || '#facc15';

  let pathD = 'M 50 4 L 92 18 L 84 64 L 50 98 L 16 64 L 8 18 Z';

  if (shape === 'square') {
    pathD = 'M 10 10 L 90 10 Q 95 10 95 15 L 95 85 Q 95 90 90 90 L 10 90 Q 5 90 5 85 L 5 15 Q 5 10 10 10 Z';
  } else if (shape === 'circle') {
    pathD = 'M 50 5 A 45 45 0 1 1 49.9 5 Z';
  } else if (shape === 'diamond') {
    pathD = 'M 50 5 L 95 50 L 50 95 L 5 50 Z';
  } else if (shape === 'arrow') {
    pathD = 'M 5 5 L 95 5 L 95 65 L 50 95 L 5 65 Z';
  } else if (shape === 'barcelona' || shape === 'crested-shield') {
    pathD =
      'M 10 6 C 24 2, 76 2, 90 6 C 98 8, 98 22, 94 36 C 90 52, 90 70, 50 98 C 10 70, 10 52, 6 36 C 2 22, 2 8, 10 6 Z';
  } else if (shape === 'real-madrid' || shape === 'crown-shield') {
    pathD =
      'M 35 18 C 35 6, 65 6, 65 18 C 82 18, 94 35, 94 60 C 94 82, 74 96, 50 96 C 26 96, 6 82, 6 60 C 6 35, 18 18, 35 18 Z';
  } else if (shape === 'liverpool' || shape === 'flame-shield') {
    pathD =
      'M 14 16 C 4 6, 26 10, 50 4 C 74 10, 96 6, 86 16 L 86 54 C 86 78, 70 92, 50 98 C 30 92, 14 78, 14 54 Z';
  } else if (shape === 'star-shield') {
    pathD = 'M 50 4 L 92 18 L 84 64 L 50 98 L 16 64 L 8 18 Z';
  }

  const clipId = `emblem-clip-${clipPrefix}-${shape}`;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible block">
      {mode === '2' && <path d={pathD} fill={color2} stroke="rgba(0,0,0,0.4)" strokeWidth="3" />}
      {mode === '3' && <path d={pathD} fill={color3} stroke="rgba(0,0,0,0.5)" strokeWidth="4" />}
      {mode === '1' && <path d={pathD} fill={color1} stroke="rgba(0,0,0,0.4)" strokeWidth="3" />}
      {mode === '2' && (
        <g transform="scale(0.84) translate(9.5, 9.5)">
          <path d={pathD} fill={color1} />
        </g>
      )}
      {mode === '3' && (
        <g transform="scale(0.82) translate(11, 11)">
          <clipPath id={clipId}>
            <path d={pathD} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <rect x="0" y="0" width="34" height="100" fill={color1} />
            <rect x="34" y="0" width="32" height="100" fill={color2} />
            <rect x="66" y="0" width="34" height="100" fill={color1} />
            <polygon
              points="50,22 56,36 71,36 59,45 63,60 50,50 37,60 41,45 29,36 44,36"
              fill={color3}
              opacity="0.95"
            />
          </g>
        </g>
      )}
      {mode === '2' && (
        <g transform="scale(0.84) translate(9.5, 9.5)">
          <clipPath id={`${clipId}-m2`}>
            <path d={pathD} />
          </clipPath>
          <rect x="42" y="0" width="16" height="100" fill={color2} opacity="0.85" clipPath={`url(#${clipId}-m2)`} />
        </g>
      )}
      {shape === 'real-madrid' && (
        <path
          d="M 38 16 Q 50 6 62 16 M 44 10 L 50 4 L 56 10"
          fill="none"
          stroke={mode === '3' ? color3 : color2}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {shape === 'barcelona' && (
        <path
          d="M 18 24 L 82 24 M 50 6 L 50 42"
          fill="none"
          stroke={mode === '3' ? color3 : color2}
          strokeWidth="3.5"
          opacity="0.85"
        />
      )}
    </svg>
  );
}

interface PlayerBustLayersProps {
  biometrics: PlayerBiometrics;
  accessories: Partial<NonNullable<PlayerCardData['accessories']>>;
  strengthCalculations: StrengthCalculations;
  hairElements: HairElements;
  activeKit: KitConfig;
  activeEmblem: EmblemConfig;
  resolvedSponsor?: SponsorDesignConfig | null;
  kitStyles: ComputedKitStyles;
  idPrefix: string;
  hideTeam?: boolean;
}

/**
 * Shared 216x248 bust coordinate stack (used identically in PlayerCard and PlayerFacePortrait).
 */
export const PlayerBustLayers: React.FC<PlayerBustLayersProps> = ({
  biometrics,
  accessories,
  strengthCalculations,
  hairElements,
  activeKit,
  activeEmblem,
  resolvedSponsor,
  kitStyles,
  idPrefix,
  hideTeam = false,
}) => {
  const skinColor = biometrics.skinColor || '#f5d0b1';

  return (
    <>
      {/* 0. BACK HAIR LAYER (Z-1 - Strictly behind neck, shirt, and chest) */}
      {hairElements.backHair && (
        <div
          className="absolute w-[216px] h-[260px] top-0 left-0 z-[1] transition-transform duration-200 pointer-events-none"
          style={{
            transformOrigin: '108px 105px',
            transform: `scale(${strengthCalculations.headScale})`,
          }}
        >
          {hairElements.backHair}
        </div>
      )}

      {/* 1. ARMS & ARM TATTOOS & VEINS (Z-2) */}
      <div
        className="absolute bottom-0 z-[2] transition-all duration-200 rounded-t-[4px] overflow-hidden"
        style={{
          width: `${strengthCalculations.armW}px`,
          height: `${strengthCalculations.armH}px`,
          backgroundColor: skinColor,
          left: `${strengthCalculations.armLeftPos}px`,
        }}
      >
        {renderArmTattoo(accessories.tattooArmL, idPrefix)}
        {renderArmVeins(strengthCalculations.strengthTier, false, skinColor)}
      </div>

      <div
        className="absolute bottom-0 z-[2] transition-all duration-200 rounded-t-[4px] overflow-hidden"
        style={{
          width: `${strengthCalculations.armW}px`,
          height: `${strengthCalculations.armH}px`,
          backgroundColor: skinColor,
          left: `${strengthCalculations.armRightPos}px`,
        }}
      >
        {renderArmTattoo(accessories.tattooArmR, idPrefix)}
        {renderArmVeins(strengthCalculations.strengthTier, true, skinColor)}
      </div>

      {/* 2. SHIRT & SHOULDER ASSEMBLY (Z-3 - Torso & Shoulders Base) */}
      <div
        className="absolute bottom-0 z-[3] pointer-events-none transition-all duration-200"
        style={{
          left: `${strengthCalculations.chestLeft}px`,
          width: `${strengthCalculations.chestW}px`,
          height: '84px',
        }}
      >
        {/* Left Shoulder Sleeve */}
        <div
          className="absolute top-0 z-[3] transition-all duration-200 overflow-hidden"
          style={{
            left: `-${strengthCalculations.shoulderW - 2}px`,
            width: `${strengthCalculations.shoulderW}px`,
            ...kitStyles.shoulderLStyle,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)',
            }}
          />
          {activeKit.style === 'tight' && (
            <>
              <div className="absolute top-0 left-[2px] w-[1px] h-full bg-black/25 opacity-70 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/35 border-t border-white/20 pointer-events-none" />
            </>
          )}
          {activeKit.style === 'loose' && (
            <>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
                preserveAspectRatio="none"
                viewBox="0 0 30 60"
              >
                <path d="M 4 10 Q 14 24 6 42" stroke="rgba(0,0,0,0.28)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M 12 8 Q 20 28 14 52" stroke="rgba(0,0,0,0.18)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
            </>
          )}
          {(!activeKit.style || activeKit.style === 'normal') && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/20 pointer-events-none" />
          )}
        </div>

        {/* Right Shoulder Sleeve */}
        <div
          className="absolute top-0 z-[3] transition-all duration-200 overflow-hidden"
          style={{
            right: `-${strengthCalculations.shoulderW - 2}px`,
            width: `${strengthCalculations.shoulderW}px`,
            ...kitStyles.shoulderRStyle,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)',
            }}
          />
          {activeKit.style === 'tight' && (
            <>
              <div className="absolute top-0 right-[2px] w-[1px] h-full bg-black/25 opacity-70 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/35 border-t border-white/20 pointer-events-none" />
            </>
          )}
          {activeKit.style === 'loose' && (
            <>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
                preserveAspectRatio="none"
                viewBox="0 0 30 60"
              >
                <path d="M 26 10 Q 16 24 24 42" stroke="rgba(0,0,0,0.28)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M 18 8 Q 10 28 16 52" stroke="rgba(0,0,0,0.18)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
            </>
          )}
          {(!activeKit.style || activeKit.style === 'normal') && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/20 pointer-events-none" />
          )}
        </div>

        {/* Chest Body */}
        <div
          className={`absolute left-0 top-0 w-full h-[84px] pointer-events-auto z-[3] shirt-chest-${activeKit.collar} overflow-hidden`}
          style={{
            ...kitStyles.chestStyle,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.3) 100%),
                repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px),
                repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)
              `,
            }}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-black/25 opacity-70" />

          {activeKit.style === 'tight' && (
            <>
              <div className="absolute top-0 left-[6px] w-[1px] h-full bg-black/20 opacity-60 pointer-events-none" />
              <div className="absolute top-0 right-[6px] w-[1px] h-full bg-black/20 opacity-60 pointer-events-none" />
            </>
          )}
          {activeKit.style === 'loose' && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-75"
              preserveAspectRatio="none"
              viewBox="0 0 100 84"
            >
              <path d="M 6 36 Q 16 54 8 80" stroke="rgba(0,0,0,0.2)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M 94 36 Q 84 54 92 80" stroke="rgba(0,0,0,0.2)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Shirt Emblem */}
        {!hideTeam && (
          <div
            className="absolute w-[20px] h-[20px] top-[26px] z-[4] box-border transition-all duration-200"
            style={{
              left: `${strengthCalculations.emblemLeftPos}px`,
            }}
          >
            {renderKitEmblemSvg(activeEmblem, `${idPrefix}-shirt`)}
          </div>
        )}

        {/* Chest Sponsor Print */}
        {resolvedSponsor && resolvedSponsor.name && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-[46px] z-[4] w-[88%] text-center pointer-events-none select-none overflow-hidden"
            style={{
              color: resolvedSponsor.letterColor || '#ffffff',
              fontFamily:
                resolvedSponsor.writingStyle === 'classic'
                  ? 'Georgia, serif'
                  : resolvedSponsor.writingStyle === 'bold'
                  ? 'Impact, "Arial Black", sans-serif'
                  : 'system-ui, sans-serif',
              fontWeight: resolvedSponsor.writingStyle === 'bold' ? 900 : 700,
              textShadow:
                resolvedSponsor.borderStyle !== 'none'
                  ? `0 0 2px ${resolvedSponsor.borderColor || '#000'}`
                  : '0 1px 2px rgba(0,0,0,0.7)',
              letterSpacing: '0.8px',
            }}
          >
            <span className="text-[7.5px] uppercase tracking-wider block truncate opacity-90">
              {resolvedSponsor.name}
            </span>
          </div>
        )}
      </div>

      {/* 3. NECK & NECK TATTOOS & VEINS (Z-5 - Extends from chin over shirt collar line) */}
      <div
        className="absolute w-[216px] h-[260px] top-0 left-0 z-[5] transition-transform duration-200 pointer-events-none"
        style={{
          transformOrigin: '108px 105px',
          transform: `scale(${strengthCalculations.headScale})`,
        }}
      >
        <div
          className="absolute z-[5] transition-all duration-200 rounded-b-[16px] shadow-sm overflow-hidden"
          style={{
            width: `${strengthCalculations.neckW}px`,
            height: `${strengthCalculations.neckH}px`,
            left: `${strengthCalculations.neckLeft}px`,
            top: '124px',
            backgroundColor: skinColor,
          }}
        >
          {renderNeckTattoo(accessories.tattooNeck)}
          {renderNeckVeins(strengthCalculations.strengthTier, skinColor)}
        </div>
      </div>

      {/* 4. SHIRT COLLAR DETAILS (Z-6 - Crew / V-Neck / Polo Accents) */}
      {activeKit.collar === 'crew' && (
        <div
          className="absolute top-[162px] z-[6] box-border pointer-events-none transition-all duration-200"
          style={{
            left: `${strengthCalculations.chestLeft + strengthCalculations.cLeft}px`,
            width: `${strengthCalculations.neckW}px`,
            height: '14px',
            borderRadius: '0 0 14px 14px',
            borderBottom: `2.5px solid ${activeKit.color2 || activeKit.color1}`,
            backgroundColor: 'transparent',
            boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
          }}
        />
      )}

      {activeKit.collar === 'v-neck' && (
        <div
          className="absolute top-[158px] z-[6] pointer-events-none transition-all duration-200"
          style={{
            left: `${strengthCalculations.chestLeft + strengthCalculations.cLeft - 4}px`,
            width: `${strengthCalculations.neckW + 8}px`,
            height: '28px',
          }}
        >
          <svg className="w-full h-full drop-shadow-md overflow-visible" viewBox="0 0 100 85" preserveAspectRatio="none">
            <polygon points="14,0 50,68 86,0" fill={skinColor} />
            <ellipse cx="50" cy="28" rx="14" ry="10" fill="rgba(0,0,0,0.12)" />
            <polygon
              points="0,0 50,85 50,68 14,0"
              fill={activeKit.color2 || activeKit.color1}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="0.8"
            />
            <polygon
              points="100,0 48,85 50,68 86,0"
              fill={activeKit.color2 || activeKit.color1}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="0.8"
            />
            <line x1="8" y1="0" x2="49" y2="76" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
            <line x1="92" y1="0" x2="51" y2="76" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
            <line x1="49" y1="68" x2="49" y2="85" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />
            <line x1="50" y1="68" x2="50" y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
          </svg>
        </div>
      )}

      {activeKit.collar === 'polo' && (
        <div
          className="absolute top-[156px] z-[6] box-border pointer-events-none transition-all duration-200"
          style={{
            left: `${strengthCalculations.chestLeft + strengthCalculations.cLeft - 8}px`,
            width: `${strengthCalculations.neckW + 16}px`,
            height: '38px',
          }}
        >
          <svg
            className="absolute top-0 left-0 w-full h-[22px] pointer-events-none"
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
          >
            <polygon points="24,0 50,56 76,0" fill={skinColor} />
            <ellipse cx="50" cy="24" rx="12" ry="7" fill="rgba(0,0,0,0.12)" />
          </svg>

          <div
            className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[14px] h-[20px] rounded-b-[3px] border-x border-b border-black/35 shadow-md flex flex-col items-center justify-evenly py-0.5 overflow-hidden"
            style={{
              backgroundColor: activeKit.color2 || activeKit.color1,
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.12), transparent 40%, rgba(255,255,255,0.15) 60%, rgba(0,0,0,0.12))',
            }}
          >
            <div className="absolute top-0 left-[7px] w-[1px] h-full bg-black/20 pointer-events-none" />
            <div className="relative z-[1] w-[4px] h-[4px] rounded-full bg-gradient-to-br from-white via-slate-200 to-slate-400 border border-slate-600 shadow-sm flex items-center justify-center">
              <div className="w-[1.5px] h-[1.5px] rounded-full bg-slate-700 opacity-60" />
            </div>
            <div className="relative z-[1] w-[4px] h-[4px] rounded-full bg-gradient-to-br from-white via-slate-200 to-slate-400 border border-slate-600 shadow-sm flex items-center justify-center">
              <div className="w-[1.5px] h-[1.5px] rounded-full bg-slate-700 opacity-60" />
            </div>
          </div>

          <div
            className="absolute top-[1px] left-[2px] w-[44%] h-[22px] drop-shadow-md transition-all duration-200"
            style={{
              backgroundColor: activeKit.color2 || activeKit.color1,
              clipPath: 'polygon(0% 0%, 55% 0%, 100% 75%, 25% 100%, 0% 50%)',
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none border-b border-l border-black/35"
              style={{
                boxShadow: `inset 0 -1.5px 0 ${
                  activeKit.color1 !== activeKit.color2 ? activeKit.color1 : 'rgba(255,255,255,0.4)'
                }`,
              }}
            />
          </div>

          <div
            className="absolute top-[1px] right-[2px] w-[44%] h-[22px] drop-shadow-md transition-all duration-200"
            style={{
              backgroundColor: activeKit.color2 || activeKit.color1,
              clipPath: 'polygon(45% 0%, 100% 0%, 100% 50%, 75% 100%, 0% 75%)',
              backgroundImage:
                'repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none border-b border-r border-black/35"
              style={{
                boxShadow: `inset 0 -1.5px 0 ${
                  activeKit.color1 !== activeKit.color2 ? activeKit.color1 : 'rgba(255,255,255,0.4)'
                }`,
              }}
            />
          </div>
        </div>
      )}

      {/* 5. HEAD ASSEMBLY (Z-8) */}
      <div
        className="absolute w-[216px] h-[260px] top-0 left-0 z-[8] transition-transform duration-200 pointer-events-none"
        style={{
          transformOrigin: '108px 105px',
          transform: `scale(${strengthCalculations.headScale})`,
        }}
      >
        <div
          className="absolute w-[12px] h-[32px] top-[90px] left-[50px] rounded-l-full z-[3]"
          style={{ backgroundColor: skinColor }}
        />
        <div
          className="absolute w-[12px] h-[32px] top-[90px] right-[50px] rounded-r-full z-[3]"
          style={{ backgroundColor: skinColor }}
        />

        <div
          className="absolute w-[98px] h-[122px] top-[40px] left-[59px] rounded-t-[49px] rounded-b-[58px] z-[5] shadow-sm"
          style={{ backgroundColor: skinColor }}
        />

        {renderFaceTattoo(accessories.tattooFace)}
        {renderForeheadVeins(strengthCalculations.strengthTier, skinColor)}

        {renderEarring(
          (accessories as any).earring || accessories.earringL,
          'left',
          accessories.earringMaterial || (accessories as any).earringMaterialL,
          accessories.earringGemColor || (accessories as any).earringGemL
        )}
        {renderEarring(
          (accessories as any).earring || accessories.earringR,
          'right',
          accessories.earringMaterial || (accessories as any).earringMaterialR,
          accessories.earringGemColor || (accessories as any).earringGemR
        )}

        {renderFacialHair(
          (biometrics as any).facialHair || biometrics.facialHairStyle || 'none',
          biometrics.facialHairColor || biometrics.hairRoot
        )}

        {hairElements.topHair}

        <HeadwearOverlay biometrics={biometrics} accessories={accessories} />
      </div>

      {/* 6. NECKLACE OVERLAY (Z-12) */}
      {renderNecklace(
        accessories.necklace,
        strengthCalculations.neckW,
        strengthCalculations.neckLeft,
        strengthCalculations.headScale,
        idPrefix
      )}
    </>
  );
};
