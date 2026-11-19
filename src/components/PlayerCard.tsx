import React, { useId, useMemo, useState } from 'react';
import {
  PlayerCardData,
} from '../types';
import {
  buildHairElements,
  computePlayerStrengthCalculations,
} from './playerFaceLayers';
import {
  computeKitStyles,
  PlayerBustLayers,
  renderKitEmblemSvg,
} from './playerKitLayers';
import { getCardTier } from '../constants';
import {
  t,
  translateNationality,
  translateFoot,
  translatePosition,
  translatePlaystyle,
  translateStatLabel,
  translateBio,
} from '../utils/localizationSystem';
import { getOfficialStatName } from '../utils/gameVocabulary';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  getSubPositionInfo,
  getEffectiveCategoryStats,
  getEffectivePlayerOvr,
  getEffectiveGkDetailed,
  getActiveBonusStats,
  getAttributeModifier,
} from '../utils/statCalculations';
import { ensurePlayerPerksSync, getActivePerks, CareerPerk } from '../utils/perksSystem';
import { resolvePlayerKitAndEmblem } from '../utils/kitResolutionSystem';
import { resolveEffectiveSponsor } from '../utils/uniformSponsorSystem';
import { isBiggerYouthClubActive } from '../utils/youthAdaptationSystem';
import { PerkIcon } from './PerkIcon';
import { Globe2, Lock, Sparkles } from 'lucide-react';
import { formatPersonName } from '../utils/originLastNameSystem';
import { haptics } from '../utils/hapticsSystem';
import { getChemistryInfo } from '../utils/chemistrySystem';
import { isHighQualityModeActive } from '../utils/graphicSettingsSystem';

interface PlayerCardProps {
  player: PlayerCardData;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
  id?: string;
  hideTeam?: boolean;
  hideNationality?: boolean;
  hidePosition?: boolean;
  hideStats?: boolean;
  hidePerks?: boolean;
  hideOvr?: boolean;
  onUpdatePlayer?: (updated: PlayerCardData) => void;
}

export function getTeamCountryCode(country: string): string {
  if (!country) return 'ENG';
  const c = country.trim().toUpperCase();

  const codeMap: Record<string, string> = {
    'GERMANY': 'DEU',
    'ENGLAND': 'ENG',
    'GREAT BRITAIN': 'ENG',
    'UNITED KINGDOM': 'ENG',
    'SOUTH AFRICA': 'SZA',
    'SPAIN': 'ESP',
    'ITALY': 'ITA',
    'FRANCE': 'FRA',
    'ARGENTINA': 'ARG',
    'BRAZIL': 'BRA',
    'PORTUGAL': 'POR',
    'NETHERLANDS': 'NED',
    'UNITED STATES': 'USA',
    'USA': 'USA',
    'US': 'USA',
    'SAUDI ARABIA': 'SAU',
    'KSA': 'SAU',
    'COLOMBIA': 'COL',
    'PARAGUAY': 'PRY',
    'URUGUAY': 'URU',
    'BELGIUM': 'BEL',
    'NORWAY': 'NOR',
    'MEXICO': 'MEX',
    'CROATIA': 'CRO',
    'JAPAN': 'JPN',
    'CHILE': 'CHI',
    'MOROCCO': 'MAR',
    'NIGERIA': 'NGA',
    'CAMEROON': 'CMR',
    'CANADA': 'CAN',
    'TURKEY': 'TUR',
    'EGYPT': 'EGY',
    'NEW ZEALAND': 'NZL',
    'SWITZERLAND': 'SUI',
    'DENMARK': 'DEN',
    'SWEDEN': 'SWE',
    'POLAND': 'POL',
    'AUSTRALIA': 'AUS',
    'KOREA': 'KOR',
    'SOUTH KOREA': 'KOR',
  };

  if (codeMap[c]) return codeMap[c];
  if (c.length === 3) return c;
  return c.slice(0, 3);
}

const PlayerCardComponent: React.FC<PlayerCardProps> = ({
  player,
  isFlipped = false,
  onFlip,
  className = '',
  id = 'player-card-render',
  hideTeam = false,
  hideNationality = false,
  hidePosition = false,
  hideStats = false,
  hidePerks = false,
  hideOvr = false,
  onUpdatePlayer,
}) => {
  const reactId = useId();
  const idPrefix = useMemo(() => `card-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [reactId]);
  const syncedPlayer = useMemo(() => ensurePlayerPerksSync(player), [player]);
  const activePerks = useMemo(() => getActivePerks(syncedPlayer), [syncedPlayer]);
  const [selectedPerkTooltip, setSelectedPerkTooltip] = useState<CareerPerk | null>(null);

  // 3D Tilt & Specular Light System (GPU-accelerated via CSS custom properties to avoid React state re-renders on mousemove)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normY = (y / rect.height - 0.5) * 2; // -1 to 1
    const rotX = -normY * 12;
    const rotY = normX * 12;
    el.style.setProperty('--card-rot-x', `${rotX.toFixed(2)}deg`);
    el.style.setProperty('--card-rot-y', `${rotY.toFixed(2)}deg`);
    el.style.setProperty('--card-scale', '1.02');
    el.style.setProperty('--card-trans-dur', '80ms');
    el.style.setProperty('--glare-opacity', '1');
    el.style.setProperty('--glare-x', `${((rotY / 12 + 1) * 50).toFixed(1)}%`);
    el.style.setProperty('--glare-y', `${((-rotX / 12 + 1) * 50).toFixed(1)}%`);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--card-rot-x', '0deg');
    el.style.setProperty('--card-rot-y', '0deg');
    el.style.setProperty('--card-scale', '1');
    el.style.setProperty('--card-trans-dur', '400ms');
    el.style.setProperty('--glare-opacity', '0');
  };

  const handleCardClick = () => {
    haptics.lightTap();
    if (onFlip) onFlip();
  };

  const {
    name = 'PLAYER',
    ovr = 40,
    age = 18,
    club = 'Club',
    nationality = { code: 'ARG', iso: 'ar', name: 'Argentina' },
    otherNationalities = player?.otherNationalities || [],
    stats = { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 },
    biometrics = {
      strength: 40,
      skinColor: '#f5d0b1',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#111111',
      hairDye: 'none',
    },
    accessories = {
      accessory: 'none',
      headbandColor: '#ffffff',
    },
  } = player || {};

  // Dynamically resolve the active Kit and Emblem based on the Kit Priority Rules:
  // 1. National Team Representation -> National Team Kit (from National Team Info -> Kits)
  // 2. Club Representation -> Club Kit (from Team Info -> Kits in leagueDb)
  // 3. No current team -> player.kit and player.emblem (default/creation behavior)
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
  const activeClubName = resolvedKitData.teamName || club;
  const activeClubCountry = resolvedKitData.teamCountryCode || player?.clubCountry || nationality?.name || '';

  const resolvedSponsor = useMemo(() => {
    return resolveEffectiveSponsor(activeKit, undefined, activeClubName);
  }, [activeKit, activeClubName]);

  let position = player?.position !== undefined ? player.position : '';
  let subPosition = player?.subPosition || '';
  let playStyle = player?.playStyle || '';
  let customBio = player?.customBio;
  let preferredFoot = player?.preferredFoot || 'Right';
  let weakFootStars = typeof player?.weakFootStars === 'number' && !isNaN(player.weakFootStars) ? player.weakFootStars : 4;
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
  let heightCm = player?.heightCm && !isNaN(player.heightCm) ? player.heightCm : (170 + Math.round((rawStrength - 40) * 0.35));
  let weightKg = player?.weightKg && !isNaN(player.weightKg) ? player.weightKg : (65 + Math.round((rawStrength - 40) * 0.4));

  const tier = useMemo(() => getCardTier(ovr), [ovr]);

  // --- STRENGTH & BODYBUILDER SCALING CALCULATIONS ---
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

  // --- HAIR STYLING CALCULATIONS (Shared with PlayerFacePortrait) ---
  const hairElements = useMemo(
    () => buildHairElements(biometrics, idPrefix),
    [
      biometrics.hairRoot,
      biometrics.hairDye,
      biometrics.hairLength,
      biometrics.hairStyle,
      biometrics.specialHair,
      biometrics.skinColor,
      idPrefix,
    ]
  );

  // --- KIT & SHOULDER CALCULATIONS ---
  const kitStyles = useMemo(() => computeKitStyles(activeKit, strengthCalculations), [activeKit, strengthCalculations]);
  // Kit styles & emblem rendering moved to shared ./playerKitLayers.tsx

  // Tier class name mapping
  const tierContainerClass = useMemo(() => {
    const ovrInfo = getEffectivePlayerOvr(player);
    const isBoosted = ovrInfo.bonusOvr > 0;
    const isPenalized = ovrInfo.bonusOvr < 0;

    switch (tier) {
      case 'white':
        if (isBoosted) return 'bg-white border-4 border-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.35)]';
        if (isPenalized) return 'bg-white border-4 border-rose-500 text-slate-900 shadow-[0_0_20px_rgba(244,63,94,0.35)]';
        return 'bg-white border-4 border-slate-300 text-slate-900 shadow-md';
      case 'bronze':
        if (isBoosted) return 'bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] border-4 border-emerald-400 text-amber-50 shadow-[0_0_22px_rgba(16,185,129,0.4)]';
        if (isPenalized) return 'bg-gradient-to-br from-[#7f1d1d] via-[#b45309] to-[#78350f] border-4 border-rose-500 text-amber-50 shadow-[0_0_22px_rgba(244,63,94,0.4)]';
        return 'bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] border-4 border-[#92400e] text-amber-50 shadow-lg';
      case 'silver':
        if (isBoosted) return 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border-4 border-emerald-400 text-slate-900 shadow-[0_0_22px_rgba(16,185,129,0.4)]';
        if (isPenalized) return 'bg-gradient-to-br from-slate-100 via-slate-300 to-rose-300 border-4 border-rose-500 text-slate-900 shadow-[0_0_22px_rgba(244,63,94,0.4)]';
        return 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border-4 border-slate-500 text-slate-900 shadow-lg';
      case 'gold':
        if (isBoosted) return 'bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#ca8a04] border-4 border-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)]';
        if (isPenalized) return 'bg-gradient-to-br from-[#fef08a] via-[#b91c1c] to-[#7f1d1d] border-4 border-rose-500 text-amber-100 shadow-[0_0_25px_rgba(244,63,94,0.5)]';
        return 'bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#ca8a04] border-4 border-[#a16207] text-slate-950 shadow-xl';
      case 'legendary':
        if (isBoosted) return 'legendary-green-shine-pattern border-4 border-emerald-400 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.6)]';
        if (isPenalized) return 'legendary-red-shine-pattern border-4 border-rose-500 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.6)]';
        return 'legendary-shine-pattern border-4 border-[#eab308] text-[#fef08a] shadow-2xl';
      case 'goat':
        if (isBoosted) return 'goat-emerald-pattern border-4 border-emerald-300 text-white shadow-[0_0_35px_rgba(52,211,153,0.7)]';
        if (isPenalized) return 'goat-ruby-pattern border-4 border-rose-400 text-white shadow-[0_0_35px_rgba(244,63,94,0.7)]';
        return 'goat-diamond-pattern border-4 border-cyan-200 text-white shadow-[0_0_25px_rgba(14,165,233,0.5)]';
      default:
        return 'bg-white border-4 border-slate-300 text-slate-900';
    }
  }, [tier, player]);

  const portraitBorderColor = useMemo(() => {
    const ovrInfo = getEffectivePlayerOvr(player);
    if (ovrInfo.bonusOvr > 0) return '#34d399';
    if (ovrInfo.bonusOvr < 0) return '#f43f5e';

    switch (tier) {
      case 'white':
        return '#cbd5e1';
      case 'bronze':
        return '#92400e';
      case 'silver':
        return '#64748b';
      case 'gold':
        return '#a16207';
      case 'legendary':
        return '#eab308';
      case 'goat':
        return '#38bdf8';
      default:
        return '#cbd5e1';
    }
  }, [tier, player]);

  const effectiveSubPos = (subPosition || position || '').toUpperCase();
  const subPosInfo = useMemo(() => getSubPositionInfo(effectiveSubPos), [effectiveSubPos]);
  const categoryCode = subPosInfo.category;

  const { categoryLabel, categoryBadgeClass } = useMemo(() => {
    switch (categoryCode) {
      case 'ATT':
        return {
          categoryLabel: 'ATT',
          categoryBadgeClass: 'bg-red-600 text-white border border-red-400/60 shadow-sm',
        };
      case 'MID':
        return {
          categoryLabel: 'MID',
          categoryBadgeClass: 'bg-emerald-600 text-white border border-emerald-400/60 shadow-sm',
        };
      case 'DEF':
        return {
          categoryLabel: 'DEF',
          categoryBadgeClass: 'bg-blue-600 text-white border border-blue-400/60 shadow-sm',
        };
      case 'GK':
        return {
          categoryLabel: 'GK',
          categoryBadgeClass: 'bg-yellow-400 text-gray-950 font-black border border-yellow-200 shadow-sm',
        };
      default:
        return {
          categoryLabel: 'UNASSIGNED',
          categoryBadgeClass: 'bg-slate-800 text-slate-200 border border-slate-600 shadow-sm',
        };
    }
  }, [categoryCode]);

  const primaryNat = useMemo(() => {
    return nationality || player?.nationality || { code: 'ARG', iso: 'ar', name: 'Argentina' };
  }, [nationality, player?.nationality]);

  const otherNats = useMemo(() => {
    const combined = [
      ...(player?.otherNationalities || []),
      ...(player?.extraNationalities || []),
      ...(otherNationalities || []),
    ];
    const mainCode = primaryNat?.code;
    return combined.filter(
      (nat, index, self) =>
        nat &&
        nat.code &&
        nat.code !== mainCode &&
        index === self.findIndex((n) => n && n.code === nat.code)
    );
  }, [player?.otherNationalities, player?.extraNationalities, otherNationalities, primaryNat?.code]);

  const isSeniorLocked = Boolean(player?.isSeniorLocked || player?.seniorNationalTeamLocked);

  const handleSwitchPrimaryNationality = (targetNat: any) => {
    if (isSeniorLocked || !onUpdatePlayer || !player) return;
    const currentActiveNat = primaryNat;
    const currentOthers = [
      ...(player.otherNationalities || []),
      ...(player.extraNationalities || []),
    ];
    const updatedOthersList = [...currentOthers];
    if (currentActiveNat.code !== targetNat.code) {
      if (!updatedOthersList.some((n) => n.code === currentActiveNat.code)) {
        updatedOthersList.push(currentActiveNat);
      }
    }
    const cleanOthers = updatedOthersList.filter((n) => n.code !== targetNat.code);
    const updated: PlayerCardData = {
      ...player,
      nationality: targetNat,
      otherNationalities: cleanOthers,
      extraNationalities: cleanOthers,
    };
    onUpdatePlayer(updated);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[348px] perspective-1000 px-0.5 sm:px-1">
      <div
        id={id}
        onClick={handleCardClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`relative w-full max-w-[348px] rounded-[16px] p-2 sm:p-[14px] cursor-pointer select-none box-border overflow-hidden transition-transform ease-out will-change-transform ${tierContainerClass} ${className}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(var(--card-rot-x, 0deg)) rotateY(var(--card-rot-y, 0deg)) scale3d(var(--card-scale, 1), var(--card-scale, 1), var(--card-scale, 1))',
          transitionDuration: 'var(--card-trans-dur, 400ms)',
        }}
      >
        {/* Holographic Specular Glare Overlay (GPU accelerated opacity & position) */}
        <div
          className="absolute inset-0 pointer-events-none z-30 rounded-[16px] mix-blend-overlay transition-opacity duration-150"
          style={{
            opacity: 'var(--glare-opacity, 0)',
            background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)',
          }}
        />
        {/* Holographic Foil Shimmer Layer (High Quality Mode for Gold, Legendary, GOAT & Legend cards) */}
        {isHighQualityModeActive() && (tier === 'gold' || tier === 'legendary' || tier === 'goat' || Boolean(player?.isLegend)) && (
          <div className="holo-foil-shimmer" style={{ zIndex: 28, borderRadius: '16px' }} />
        )}
      {!isFlipped ? (
        /* FRONT SIDE OF CARD */
        <div>
          {/* Card Body Section: Left Column + Right Area */}
          <div className="flex gap-[6px] items-start mb-[8px]">
            {/* Left Column */}
            <div className="w-[62px] h-[276px] flex flex-col items-center justify-between py-[2px] shrink-0 text-center box-border select-none">
              {/* Card Tier Indicator & OVR directly underneath */}
              <div className="flex flex-col items-center w-full">
                {!hideOvr ? (
                  <>
                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase shadow-sm border ${
                      tier === 'goat'
                        ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400/50'
                        : tier === 'legendary'
                        ? 'bg-amber-950/90 text-amber-300 border-amber-400/50'
                        : tier === 'gold'
                        ? 'bg-slate-950/90 text-yellow-300 border-yellow-500/50'
                        : 'bg-slate-900/90 text-white border-slate-700'
                    }`}>
                      {tier.toUpperCase()}
                    </span>
                    {(() => {
                      const ovrInfo = getEffectivePlayerOvr(player);
                      const displayOvr = ovrInfo.effectiveOvr;
                      const hasBonus = ovrInfo.bonusOvr > 0;
                      const hasPenalty = ovrInfo.bonusOvr < 0;
                      const hasModifier = hasBonus || hasPenalty;
                      return (
                        <div className={`flex items-center justify-center ${hasModifier ? 'gap-0.5' : 'gap-1'} w-full max-w-full px-0.5`}>
                          <div
                            className={`font-black leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                              hasModifier
                                ? 'text-[22px] mt-[3px]'
                                : 'text-[32px] mt-[3px]'
                            } ${
                              hasBonus
                                ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                : hasPenalty
                                ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                                : 'text-white'
                            }`}
                          >
                            {displayOvr}
                          </div>
                          {hasBonus && (
                            <span className="px-1 py-0.5 rounded bg-emerald-500 text-white font-black text-[9px] shadow-sm leading-none border border-emerald-300 shrink-0">
                              +{ovrInfo.bonusOvr}
                            </span>
                          )}
                          {hasPenalty && (
                            <span className="px-1 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] shadow-sm leading-none border border-rose-300 shrink-0">
                              {ovrInfo.bonusOvr}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    {/* Potential OVR in prominent style */}
                    <div className="flex flex-col items-center mt-[2px] leading-none">
                      <div className={`font-black tracking-tight text-slate-400 drop-shadow-sm ${
                        (() => {
                          const ovrInfo = getEffectivePlayerOvr(player);
                          return (ovrInfo.bonusOvr !== 0) ? 'text-[22px]' : 'text-[28px]';
                        })()
                      }`}>
                        {player.potentialOvr ?? Math.min(99, Math.max(ovr, ovr + 4))}
                      </div>
                      <div className="text-[7.5px] font-extrabold uppercase tracking-widest text-slate-400 opacity-90">
                        POT
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-[8px] px-1.5 py-0.5 mt-1 rounded font-black tracking-wider uppercase shadow-sm border bg-emerald-950/90 text-emerald-300 border-emerald-500/50">
                    WONDERKID
                  </span>
                )}
              </div>

              {/* Club Emblem / Shield Section (MOVED HIGHER) */}
              {!hideTeam && (
                <div className="flex flex-col items-center gap-[1px] w-full px-0.5 mt-1">
                  <div className="w-[30px] h-[30px] box-border shrink-0">
                    {renderKitEmblemSvg(activeEmblem, `${idPrefix}-card`)}
                  </div>
                  <span className="text-[9px] font-black tracking-tight uppercase opacity-95 truncate max-w-full leading-tight text-white drop-shadow-sm">
                    {activeClubName}
                  </span>
                  {/* Team Country (3-letter Code) & Placeholder White League Emblem */}
                  <div className="flex items-center justify-center gap-[3px] mt-[2px] leading-none">
                    <span className="text-[8px] font-black tracking-wider uppercase opacity-90 text-slate-200 drop-shadow-sm">
                      {getTeamCountryCode(activeClubCountry || player.clubCountry || nationality?.name || '')}
                    </span>
                    <svg className="w-[10px] h-[10px] text-white opacity-95 drop-shadow-sm shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z" fill="white" opacity="0.95" />
                      <path d="M12 6L13.3 9.2L16.8 9.5L14.2 11.8L15 15.2L12 13.3L9 15.2L9.8 11.8L7.2 9.5L10.7 9.2L12 6Z" fill="#0f172a" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Primary Nationality: Single Flag & Country Code (Strictly primary flag only on the card face; no dual nationality) */}
              {!hideNationality && primaryNat && primaryNat.code && primaryNat.name ? (
                <div className="flex flex-col items-center gap-[2px] mt-1">
                  <div className="w-[30px] h-[20px] rounded-[3px] overflow-hidden shadow-md border border-black/20" title={primaryNat.name}>
                    <img
                      src={`https://flagcdn.com/w40/${(primaryNat.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={primaryNat.code}
                      className="w-full h-full object-cover block"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect width="40" height="20" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="8" font-weight="bold">FLAG</text></svg>';
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase opacity-90 leading-tight">
                    {primaryNat.code}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Right Area: Top Header Bar + (Portrait Box + Right GOAT Slot) */}
            <div className="flex flex-col w-[244px] shrink-0">
              {/* Top Header Bar OUTSIDE and ABOVE Portrait */}
              <div className="w-full mb-[6px] px-[2px] flex items-center justify-between select-none min-h-[24px]">
                {/* Combined Position & Sub-Position Badge Box (e.g., MID: CAM) */}
                {!hidePosition && (
                  <div className="flex items-center gap-[4px]">
                    <span className={`text-[12px] font-black tracking-wide uppercase px-[8px] py-[3px] rounded-md shadow-md ${categoryBadgeClass}`}>
                      {categoryCode === 'UNASSIGNED' || !effectiveSubPos ? 'Unassigned' : `${categoryCode}: ${effectiveSubPos}`}
                    </span>
                  </div>
                )}

                {/* Playstyle at the right */}
                {!hidePosition && playStyle && (
                  <div className="bg-slate-950/90 border border-yellow-500/50 text-yellow-300 text-[8.5px] font-extrabold px-[6px] py-[3px] rounded-md uppercase tracking-wider shadow-md truncate max-w-[125px] text-center ml-auto">
                    {translatePlaystyle(playStyle)}
                  </div>
                )}
              </div>

              {/* Row containing Portrait Box (216px wide, perfectly centered) + Right Slot (18px) */}
              <div className="flex items-center gap-[6px]">
                {/* Enlarged Centered Portrait Box with Dark Studio Background */}
                <div
                  className="w-[216px] h-[248px] relative bg-[#1a202c] bg-[radial-gradient(ellipse_at_top,#334155_0%,#1e293b_60%,#0f172a_100%)] rounded-[10px] overflow-hidden flex-shrink-0 box-border shadow-inner"
                  style={{ border: `4px solid ${portraitBorderColor}` }}
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

                {/* Right Side Vertical Slot */}
                <div className={`w-[18px] h-[248px] flex flex-col items-center justify-center rounded-[8px] shrink-0 select-none ${
                  tier === 'goat'
                    ? 'bg-cyan-950/90 backdrop-blur-sm border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.35)] py-2'
                    : 'bg-slate-950/30 border border-white/10 py-2'
                }`}>
                  {tier === 'goat' ? (
                    <span className="font-black text-[11px] leading-[1.3] tracking-[1px] text-cyan-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] text-center">
                      G<br />O<br />A<br />T
                    </span>
                  ) : (
                    <div className="w-[2px] h-[160px] bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full opacity-50" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PLAYER NAME BELOW THE PORTRAIT */}
          <div className="text-center py-0.5">
            <h2 className="m-0 text-[20px] font-black tracking-wide truncate leading-tight drop-shadow-sm">
              {formatPersonName(name)}
            </h2>
          </div>

          {/* PLAYER DETAILS STRIP (Foot, Weak Foot, Age, Height, Weight, Market Value) */}
          <div className="flex items-center justify-between text-[10px] font-bold border-y-2 border-current/20 px-1 py-[4px] my-[6px] opacity-90 uppercase">
            <div>
              <span className="opacity-70 mr-0.5">{t('CARD_FOOT')}</span>
              <span className="font-black">{translateFoot(preferredFoot).toUpperCase()}</span>
            </div>
            <div>
              <span className="opacity-70 mr-0.5">{t('CARD_WF')}</span>
              <span className="font-black">{weakFootStars}★</span>
            </div>
            <div>
              <span className="opacity-70 mr-0.5">{t('CARD_AGE')}</span>
              <span className="font-black">{age}</span>
            </div>
            <div>
              <span className="opacity-70 mr-0.5">{t('CARD_VAL')}</span>
              <span className="font-black font-mono text-amber-300">
                {player.marketValue
                  ? player.marketValue >= 1000000
                    ? `€${(player.marketValue / 1000000).toFixed(1)}M`
                    : `€${(player.marketValue / 1000).toFixed(0)}K`
                  : '€500K'}
              </span>
            </div>
          </div>

          {/* Stats Grid & Active Perks */}
          {!hideStats && (
            <>
              {(() => {
                const isGk = (subPosition || position || '').toUpperCase() === 'GK';
                const catInfo = getEffectiveCategoryStats(player);
                if (isGk) {
                  const gk = getOrCreateGkDetailed(stats);
                  const gkGrid = [
                    { val: gk.saving, delta: getAttributeModifier(player, 'saving', gk.saving).delta, label: translateStatLabel('SAV') },
                    { val: gk.reflexes, delta: getAttributeModifier(player, 'reflexes', gk.reflexes).delta, label: translateStatLabel('REF') },
                    { val: gk.handling, delta: getAttributeModifier(player, 'handling', gk.handling).delta, label: translateStatLabel('HAN') },
                    { val: gk.positioning, delta: getAttributeModifier(player, 'positioning', gk.positioning).delta, label: translateStatLabel('POS') },
                    { val: gk.aerialReach, delta: getAttributeModifier(player, 'aerialReach', gk.aerialReach).delta, label: translateStatLabel('AER') },
                    { val: gk.oneOnOne, delta: getAttributeModifier(player, 'oneOnOne', gk.oneOnOne).delta, label: translateStatLabel('ONE') },
                  ];
                  return (
                    <div className="grid grid-cols-2 gap-[6px] font-bold text-[14px] border-t-2 border-current/20 pt-[8px]">
                      {gkGrid.map((item) => (
                        <div key={item.label} className="flex items-center">
                          <span className={`text-[16px] mr-[3px] font-black ${item.delta > 0 ? 'text-emerald-400' : item.delta < 0 ? 'text-rose-400' : ''}`}>
                            {item.val}
                          </span>
                          {item.delta > 0 && item.val < 100 && (
                            <span className="text-[11px] font-black text-emerald-400 mr-[4px]">+{item.delta}</span>
                          )}
                          {item.delta < 0 && item.val < 100 && (
                            <span className="text-[11px] font-black text-rose-400 mr-[4px]">{item.delta}</span>
                          )}
                          <span className="opacity-80 text-[11px]">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                const outfieldGrid = [
                  { val: stats.pro, bonus: catInfo.categoryBonuses.PRO, label: translateStatLabel('PRO') },
                  { val: stats.def, bonus: catInfo.categoryBonuses.DEF, label: translateStatLabel('DEF') },
                  { val: stats.cre, bonus: catInfo.categoryBonuses.CRE, label: translateStatLabel('CRE') },
                  { val: stats.men, bonus: catInfo.categoryBonuses.MEN, label: translateStatLabel('MEN') },
                  { val: stats.goa, bonus: catInfo.categoryBonuses.SCO, label: translateStatLabel('SCO') },
                  { val: stats.phy, bonus: catInfo.categoryBonuses.PHY, label: translateStatLabel('PHY') },
                ];
                return (
                  <div className="grid grid-cols-2 gap-[6px] font-bold text-[14px] border-t-2 border-current/20 pt-[8px]">
                    {outfieldGrid.map((item) => {
                      const isMastery = item.val >= 117;
                      const isBreak = item.val >= 100;
                      return (
                        <div key={item.label} className="flex items-center">
                          <span
                            className={`text-[16px] mr-[3px] font-black ${
                              isMastery
                                ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                                : isBreak
                                ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                : item.bonus > 0
                                ? 'text-emerald-400'
                                : item.bonus < 0
                                ? 'text-rose-400'
                                : ''
                            }`}
                          >
                            {isMastery ? `👑 ${item.val}` : isBreak ? `⭐ ${item.val}` : item.val}
                          </span>
                          {!isBreak && item.bonus > 0 && (
                            <span className="text-[11px] font-black text-emerald-400 mr-[4px]">+{item.bonus}</span>
                          )}
                          {!isBreak && item.bonus < 0 && (
                            <span className="text-[11px] font-black text-rose-400 mr-[4px]">{item.bonus}</span>
                          )}
                          <span className="opacity-80 text-[11px]">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ACTIVE PERKS SECTION (5 SLOTS AT BOTTOM OF PLAYER CARD) */}
              {!hidePerks && (
                <div className="mt-2 pt-1.5 border-t-2 border-current/20">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider opacity-85 mb-1">
                    <span>{t('CARD_ACTIVE_PERKS')}</span>
                    <span>{activePerks.length} / 5</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                      const perk = activePerks[slotIdx];
                      if (perk) {
                        return (
                          <div
                            key={perk.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPerkTooltip(selectedPerkTooltip?.id === perk.id ? null : perk);
                            }}
                            title={`${perk.name} (${perk.category}): ${perk.effect}`}
                            className="w-7 h-7 rounded-lg bg-black/40 border border-current/50 flex items-center justify-center cursor-pointer hover:bg-black/70 hover:scale-110 transition-all relative group shadow-sm"
                          >
                            <PerkIcon iconName={perk.iconName} className="w-3.5 h-3.5" />
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`empty-slot-${slotIdx}`}
                          title={t('CARD_EMPTY_SLOT')}
                          className="w-7 h-7 rounded-lg border border-dashed border-current/30 flex items-center justify-center opacity-40 text-[9px] font-black"
                        >
                          •
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Click Tooltip */}
                  {selectedPerkTooltip && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPerkTooltip(null);
                      }}
                      className="mt-1.5 p-2 rounded-xl bg-slate-950/95 text-white text-[10px] border border-amber-400/60 shadow-2xl animate-fadeIn relative z-30"
                    >
                      <div className="flex items-center justify-between font-black text-amber-300">
                        <span className="uppercase">{selectedPerkTooltip.name}</span>
                        <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 uppercase">
                          {selectedPerkTooltip.category}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-200 mt-0.5 leading-snug">
                        {selectedPerkTooltip.effect}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* BACK SIDE OF CARD */
        <div className="min-h-[360px] flex flex-col justify-between p-2">
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-3 border-current/20">
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-75 block font-bold">
                  {t('CARD_CAREER_PROFILE')}
                </span>
                <h3 className="text-lg font-black tracking-tight">
                  {formatPersonName(name)}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold block opacity-75">OVR</span>
                {(() => {
                  const ovrInfo = getEffectivePlayerOvr(player);
                  return (
                    <span className={`text-2xl font-black ${
                      ovrInfo.bonusOvr > 0 ? 'text-emerald-400' : ovrInfo.bonusOvr < 0 ? 'text-rose-400' : ''
                    }`}>
                      {ovrInfo.effectiveOvr}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs opacity-90 leading-relaxed mb-4 italic">
              "{translateBio(customBio, name, hidePosition ? '' : (subPosition || position), hideTeam ? '' : activeClubName)}"
            </p>

            {/* Detailed Stats Bars */}
            <div className="space-y-2 mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1">
                {t('CARD_ATTR_DISTRIBUTION')}
              </div>
              {(() => {
                const isGk = (subPosition || position || '').toUpperCase() === 'GK';
                if (isGk) {
                  const gk = getOrCreateGkDetailed(stats);
                  const gkBars = [
                    { label: `${translateStatLabel('SAV')} (${t('ATTR_SAVING') || 'Saving'})`, val: gk.saving },
                    { label: `${translateStatLabel('REF')} (${t('ATTR_REFLEXES') || 'Reflexes'})`, val: gk.reflexes },
                    { label: `${translateStatLabel('HAN')} (${t('ATTR_HANDLING') || 'Handling'})`, val: gk.handling },
                    { label: `${translateStatLabel('POS')} (${t('ATTR_POSITIONING') || 'Positioning'})`, val: gk.positioning },
                    { label: `${translateStatLabel('AER')} (${t('ATTR_AERIAL_REACH') || 'Aerial Reach'})`, val: gk.aerialReach },
                    { label: `${translateStatLabel('ONE')} (${t('ATTR_ONE_ON_ONE') || 'One-on-One'})`, val: gk.oneOnOne },
                    { label: `${translateStatLabel('DIS')} (${t('ATTR_DISTRIBUTION') || 'Distribution'})`, val: gk.distribution },
                  ];
                  return gkBars.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="text-[10px] w-28 truncate font-medium">
                        {s.label}
                      </span>
                      <div className="flex-1 bg-black/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-current rounded-full"
                          style={{ width: `${Math.min(100, s.val)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold w-6 text-right">
                        {s.val}
                      </span>
                    </div>
                  ));
                }

                const bars = [
                  { label: `${translateStatLabel('PRO')} (${getOfficialStatName('PRO')})`, val: stats.pro },
                  { label: `${translateStatLabel('DEF')} (${getOfficialStatName('DEF')})`, val: stats.def },
                  { label: `${translateStatLabel('CRE')} (${getOfficialStatName('CRE')})`, val: stats.cre },
                  { label: `${translateStatLabel('MEN')} (${getOfficialStatName('MEN')})`, val: stats.men },
                  { label: `${translateStatLabel('SCO')} (${getOfficialStatName('SCO')})`, val: stats.goa },
                  { label: `${translateStatLabel('PHY')} (${getOfficialStatName('PHY')})`, val: stats.phy },
                ];
                return bars.map((s) => {
                  const isMastery = s.val >= 117;
                  const isBreak = s.val >= 100;
                  return (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className={`text-[10px] w-28 truncate font-medium ${isBreak ? 'text-amber-300 font-bold' : ''}`}>
                        {s.label}
                      </span>
                      <div className="flex-1 bg-black/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isBreak
                              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                              : 'bg-current'
                          }`}
                          style={{ width: `${Math.min(100, isMastery ? 100 : s.val)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-bold w-7 text-right ${
                          isMastery
                            ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                            : isBreak
                            ? 'text-amber-300'
                            : ''
                        }`}
                      >
                        {isMastery ? `👑${s.val}` : isBreak ? `⭐${s.val}` : s.val}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Footer info */}
          <div className="border-t border-current/20 pt-2 text-center text-[10px] opacity-75">
            <div>{t('CARD_ID')} {player.id.toUpperCase()} • {t('CARD_TIER')} {tier.toUpperCase()}</div>
            <div className="mt-0.5 font-medium">{t('CARD_FLIP_BACK')}</div>
          </div>
        </div>
      )}
      </div>

      {/* Senior International Lock Status Banner */}
      {!hideNationality && (player?.isSeniorLocked || player?.seniorNationalTeamLocked) && (
        <div className="mt-2.5 w-full bg-gradient-to-r from-rose-950/95 via-slate-900 to-rose-950/95 border border-rose-500/60 rounded-2xl p-2.5 shadow-xl flex items-center justify-between text-left animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0 text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9.5px] font-black uppercase text-rose-300 tracking-wider">
                {t('SENIOR_INTERNATIONAL_NATION') || 'Senior International Nation'}: {player.seniorNation || nationality?.name || (t('COMMITTED') || 'Committed')}
              </div>
              <div className="text-[11px] font-black text-white flex items-center gap-1">
                {t('NATIONALITY_LOCKED') || 'NATIONALITY LOCKED'} 🔒
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Nationalities Menu Below Card */}
      {!hideNationality && otherNats.length > 0 && (
        <div className="mt-2.5 w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col gap-2 text-left animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              {t('OTHER_NATIONALITIES') || 'Other Nationalities'}
            </span>
            <span className="px-2 py-0.5 bg-slate-800 text-sky-300 rounded-full text-[10px] font-mono font-bold border border-sky-500/20">
              {otherNats.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {otherNats.map((nat, idx) => {
              const canSwitch = !isSeniorLocked && Boolean(onUpdatePlayer);
              return (
                <div
                  key={`${nat.code}-${idx}`}
                  onClick={() => {
                    if (canSwitch) handleSwitchPrimaryNationality(nat);
                  }}
                  title={canSwitch ? `${t('SWITCH_PRIMARY_NATION') || 'Make Primary Nation'}: ${nat.name}` : nat.name}
                  className={`inline-flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 shadow-sm ${
                    canSwitch ? 'cursor-pointer hover:border-amber-400/80 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition' : ''
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/w40/${(nat.iso || 'gb-eng').toLowerCase()}.png`}
                    alt={nat.code}
                    className="w-4 h-3 object-cover rounded-[2px] shadow-xs border border-black/20 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="0 0 20 12"><rect width="20" height="12" fill="%23334155"/></svg>';
                    }}
                  />
                  <span className="text-[11px] text-white font-black">{nat.name}</span>
                  <span className="text-[9.5px] text-sky-400 font-mono font-bold">({nat.code})</span>
                  {canSwitch && (
                    <span className="text-[9px] px-1 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 uppercase font-black tracking-tight">
                      {t('SWITCH_PRIMARY_NATION') || 'Make Primary'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const PlayerCard = React.memo(PlayerCardComponent);
