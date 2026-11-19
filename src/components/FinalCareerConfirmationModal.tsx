import React from 'react';
import { PlayerCardData } from '../types';
import { PlayerTypeDefinition } from '../data/playerTypes';
import { ParentCardInstance } from '../types/parentCards';
import { getRarityBadgeText } from '../utils/parentCardSystem';
import { useLanguage } from '../context/LanguageContext';
import {
  getOfficialPlayerTypeName,
  getOfficialPlayerTypeBadge,
  getOfficialPlayerTypeSubtitle,
  getOfficialPositionName,
  getOfficialStatName,
} from '../utils/gameVocabulary';
import {
  Sparkles,
  Award,
  MapPin,
  Compass,
  Footprints,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ConsoleModalShell } from './common/ConsolePager';

export interface FinalCareerConfirmationModalProps {
  isOpen?: boolean;
  player: PlayerCardData;
  playerType?: PlayerTypeDefinition;
  selectedPlayerType?: PlayerTypeDefinition;
  selectedParentCard?: ParentCardInstance | null;
  startingCityName?: string;
  onConfirm?: () => void;
  onStartCareer?: () => void;
  onBackToEdit?: () => void;
}

export const FinalCareerConfirmationModal: React.FC<FinalCareerConfirmationModalProps> = ({
  isOpen = true,
  player,
  playerType,
  selectedPlayerType,
  selectedParentCard = player.equippedParentCard,
  startingCityName = player.startingCity || player.city || 'Starting City',
  onConfirm,
  onStartCareer,
  onBackToEdit,
}) => {
  const { t, language } = useLanguage();
  const [mobilePage, setMobilePage] = React.useState<'blueprint' | 'bonuses'>('blueprint');
  if (!isOpen) return null;

  const activeType = selectedPlayerType || playerType;
  const handleStart = () => {
    if (onConfirm) onConfirm();
    if (onStartCareer) onStartCareer();
  };
  return (
    <ConsoleModalShell
      isOpen={isOpen}
      title="Confirm Character Blueprint"
      subtitle={`Age 10 Youth Prospect Ready • ${startingCityName}`}
      badge={t('FINAL_CONFIRMATION') || 'CONFIRMACIÓN FINAL'}
      icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
      accentColor="emerald"
      maxWidthClass="sm:max-w-3xl"
      showCloseButton={false}
      zIndexClass="z-[9999]"
      bodyClassName="p-3.5 sm:p-6 space-y-4"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {onBackToEdit && (
            <button
              type="button"
              onClick={onBackToEdit}
              className="min-h-[44px] text-xs font-bold text-slate-300 hover:text-white px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              {t('BTN_BACK') || 'Atrás'}
            </button>
          )}

          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto min-h-[48px] font-black px-8 py-3 rounded-xl text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:brightness-110 text-slate-950 shadow-emerald-500/25 active:scale-95 cursor-pointer sm:ml-auto"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>{t('CONFIRM_AND_START') || 'CONFIRMAR Y EMPEZAR'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      }
    >
      {/* Mobile Page Switcher (< sm) */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setMobilePage('blueprint')}
          className={`min-h-[44px] px-2 rounded-lg border text-xs font-arcade uppercase font-black transition-all cursor-pointer ${
            mobilePage === 'blueprint'
              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
              : 'bg-slate-950 text-slate-300 border-slate-700'
          }`}
        >
          1. BLUEPRINT
        </button>
        <button
          type="button"
          onClick={() => setMobilePage('bonuses')}
          className={`min-h-[44px] px-2 rounded-lg border text-xs font-arcade uppercase font-black transition-all cursor-pointer ${
            mobilePage === 'bonuses'
              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
              : 'bg-slate-950 text-slate-300 border-slate-700'
          }`}
        >
          2. ARCHETYPE & BONUS
        </button>
      </div>

          {/* PAGE 1 (MOBILE) / ALL (DESKTOP): Hero Card & Core Summary */}
          <div className={`${mobilePage === 'blueprint' ? 'block' : 'hidden sm:block'} space-y-4`}>
          {/* Main Hero Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-950/90 relative overflow-hidden shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-xs font-mono">
                  {player.position || 'ST'}
                </span>
                <span className="text-xs text-slate-300 font-mono">Age {player.age || 10}</span>
                <span className="text-xs text-slate-300 font-mono">• {player.country || 'International'}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {player.name || 'Pro Athlete'}
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-amber-400" />
                  {player.preferredFoot || 'Right'}-Footed
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {startingCityName}
                </span>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 sm:text-right shrink-0 w-full sm:w-auto flex sm:block items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Attributes</span>
              <span className="text-lg font-black text-amber-400 font-mono">725 PTS</span>
            </div>
          </div>

          {/* Configuration Breakdown Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Parent Card */}
            <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-3 h-3 text-amber-400" />
                Origin Heritage
              </div>
              <div className="font-bold text-white text-xs sm:text-sm truncate">
                {selectedParentCard
                  ? getRarityBadgeText(selectedParentCard.rarity, selectedParentCard.name)
                  : 'Modest Roots'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {t('RARITY') || 'Rareza'}: <span className="uppercase text-amber-300">{t(selectedParentCard?.rarity || 'Standard') || selectedParentCard?.rarity || 'Standard'}</span>
              </div>
            </div>

            {/* Starting City */}
            <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                {t('STARTING_ACADEMY_CITY') || 'Ciudad de la Academia Inicial'}
              </div>
              <div className="font-bold text-white text-xs sm:text-sm truncate">
                {startingCityName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {t('LOCAL_LEAGUE_SCOUTING') || 'Liga Local y Región de Ojeo'}
              </div>
            </div>

            {/* Player Type Archetype */}
            <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-purple-400" />
                {t('PLAYER_TYPE_ARCHETYPE') || 'Arquetipo de Jugador'}
              </div>
              <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                <span>{activeType ? getOfficialPlayerTypeName(activeType.id, language) : 'Speedster'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {activeType ? getOfficialPlayerTypeBadge(activeType.id, language) : '⚡ VELOCITY'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 leading-tight line-clamp-1">
                {activeType ? getOfficialPlayerTypeSubtitle(activeType.id, language) : 'Lightning Pace & Explosive Burst'}
              </div>
            </div>

            {/* Position & Role */}
            <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/70 space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-sky-400" />
                {t('POSITION_AND_ROLE') || 'Posición y Rol'}
              </div>
              <div className="font-bold text-white text-sm">
                {getOfficialPositionName(player.position || 'ATT', language)} ({player.subPosition || 'ST'})
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {t(player.preferredFoot || 'Right')} - {t('SYNERGY_ACTIVATED') || 'Sinergia Activada'}
              </div>
            </div>
          </div>
          </div>

          {/* Yearly Archetype Bonus Notification (Page 2 on Mobile) */}
          <div className={`${mobilePage === 'bonuses' ? 'block' : 'hidden sm:block'} p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-emerald-300">
                {t('YEARLY_ARCHETYPE_BONUS_TITLE') || 'Bonificación Anual de Arquetipo Garantizada (10–20 años)'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {t('YEARLY_ARCHETYPE_BONUS_DESC_1') || 'Al final de cada temporada, tu arquetipo otorga'} <strong className="text-white">+2 {t('PERMANENT_POINTS') || 'puntos permanentes'}</strong> {t('TO_MAIN_STRENGTHS') || 'a fortalezas principales'} (<strong className="text-emerald-300">{activeType?.primaryStrengths?.map(s => getOfficialStatName(s.key, language)).join(', ') || 'Atributos Principales'}</strong>){activeType?.secondaryStrengths && activeType.secondaryStrengths.length > 0 ? (
                  <> {t('AND') || 'y'} <strong className="text-white">+1 {t('PERMANENT_POINT') || 'punto permanente'}</strong> {t('TO_SECONDARY_STRENGTHS') || 'a fortalezas secundarias'} (<strong className="text-cyan-300">{activeType.secondaryStrengths.map(s => getOfficialStatName(s.key, language)).join(', ')}</strong>)</>
                ) : null}.
              </p>
            </div>
          </div>
    </ConsoleModalShell>
  );
};

