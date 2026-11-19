import React, { useState, useEffect } from 'react';
import { PlayerCardData } from '../types';
import {
  getEffectivePlayerNickname,
  calculateEmbracedFullName,
  applyPlayerNickname,
  rejectPlayerNickname,
  applyStartingTypeNickname,
  rejectStartingTypeNickname,
  applyFeatNickname,
  rejectFeatNickname,
  extractPlayerFirstName,
  extractPlayerLastName,
  getPlayerHeightCm,
  isCurrentClubInBrazil,
  FeatNicknameConfig,
} from '../utils/nicknameSystem';
import { getStoredLanguage } from '../utils/localizationSystem';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, CheckCircle, XCircle, Trophy, User, ArrowRight } from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText } from './common/ConsolePager';

export interface NicknameEventModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onAcceptNickname: (updatedPlayer: PlayerCardData) => void;
  onDeclineNickname: (updatedPlayer: PlayerCardData) => void;
  isExProTrigger?: boolean;
  featConfig?: FeatNicknameConfig | null;
  isStartingTypeTrigger?: boolean;
  startingNickname?: string | null;
  startingTypeName?: string | null;
  startingCityName?: string | null;
}

export const NicknameEventModal: React.FC<NicknameEventModalProps> = ({
  isOpen,
  player,
  onAcceptNickname,
  onDeclineNickname,
  isExProTrigger = false,
  featConfig = null,
  isStartingTypeTrigger = false,
  startingNickname = null,
  startingTypeName = null,
  startingCityName = null,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'story' | 'decision'>('story');
  const currentLang = getStoredLanguage();

  useEffect(() => {
    if (isOpen) setActiveTab('story');
  }, [isOpen, startingNickname, featConfig]);

  if (!isOpen) return null;

  const currentSub = player.subPosition || player.position || 'ST';
  const currentStyle = player.playStyle || 'Poacher';
  const heightCm = getPlayerHeightCm(player);
  const isClubInBrazil = isCurrentClubInBrazil(player);

  const isStarting = Boolean(isStartingTypeTrigger && startingNickname);
  const isFeat = Boolean(featConfig);
  const nickname =
    isStarting && startingNickname
      ? startingNickname
      : isFeat && featConfig
      ? featConfig.nickname
      : getEffectivePlayerNickname(player, currentLang);

  const newFullName = calculateEmbracedFullName(player, nickname);
  const firstName = extractPlayerFirstName(player);
  const lastName = extractPlayerLastName(player);
  const currentFullName = player.name || `${firstName} ${lastName}`.trim() || 'Prodigy';

  const hasActiveNickname = Boolean(
    player.nickname && player.nicknameAccepted && player.nickname.trim() !== ''
  );
  const activeNickname = player.nickname || '';

  const handleAccept = () => {
    if (isStarting && startingNickname) {
      onAcceptNickname(applyStartingTypeNickname(player, startingNickname));
    } else if (isFeat && featConfig) {
      onAcceptNickname(applyFeatNickname(player, featConfig));
    } else {
      onAcceptNickname(applyPlayerNickname(player, nickname));
    }
  };

  const handleDecline = () => {
    if (isStarting && startingNickname) {
      onDeclineNickname(rejectStartingTypeNickname(player, startingNickname));
    } else if (isFeat && featConfig) {
      onDeclineNickname(rejectFeatNickname(player, featConfig));
    } else {
      onDeclineNickname(rejectPlayerNickname(player, nickname));
    }
  };

  const headlineText =
    isStarting && startingNickname
      ? (
          t('NICKNAME_STARTING_HEADLINE', { nickname: startingNickname }) ||
          t(`Fans are calling you "${startingNickname}"`) ||
          `Fans are calling you "${startingNickname}"`
        ).replace('{nickname}', startingNickname)
      : isFeat && featConfig
      ? `You've earned a new nickname: "${featConfig.nickname}"`
      : (t('NICKNAME_EVENT_HEADLINE') || 'Fans are calling you "{nickname}"').replace(
          '{nickname}',
          nickname
        );

  const subtitleText =
    isStarting && startingNickname
      ? (
          t('NICKNAME_STARTING_SUBTITLE', {
            archetype: t(startingTypeName || 'Player') || startingTypeName || 'Player',
            city: startingCityName || 'the academy',
            nickname: startingNickname,
          }) ||
          t(
            `Based on your chosen ${startingTypeName || 'Player'} archetype in ${startingCityName || 'the academy'}, the local supporters and scouts have already given you a signature nickname!`
          ) ||
          `Based on your chosen ${startingTypeName || 'Player'} archetype in ${startingCityName || 'the academy'}, the local supporters and scouts have already given you a signature nickname!`
        )
          .replace('{archetype}', t(startingTypeName || 'Player') || startingTypeName || 'Player')
          .replace('{city}', startingCityName || 'the academy')
          .replace('{nickname}', startingNickname)
      : isFeat && featConfig
      ? featConfig.achievementDescription
      : t('NICKNAME_EVENT_SUBTITLE') ||
        "Your signature playstyle and unforgettable matches have ignited the stadium's imagination!";

  const badgeText = isStarting
    ? `Archetype • ${startingCityName || 'Academy'}`
    : isFeat
    ? 'Feat Milestone'
    : isExProTrigger
    ? 'Heritage Chants'
    : t('NICKNAME_EVENT_TITLE') || 'Nickname Event';

  const contextTag = isStarting
    ? `${startingTypeName || 'Archetype'} • ${startingCityName || 'Academy'}`
    : isFeat && featConfig
    ? featConfig.title
    : isClubInBrazil
    ? heightCm < 175
      ? `${heightCm} cm • Diminutivo (-inho)`
      : heightCm > 185
      ? `${heightCm} cm • Aumentativo (-ão)`
      : `${currentSub} • ${currentStyle}`
    : `${currentSub} • ${currentStyle}`;

  const embraceDesc = isStarting
    ? `Replace your first name with "${nickname}". Your last name ("${lastName || ''}") remains preserved. Saved to your Customization library.`
    : hasActiveNickname
    ? `Replace your active nickname ("${activeNickname}") with "${nickname}". Your last name ("${lastName || ''}") remains preserved.`
    : t('NICKNAME_EMBRACE_DESC') ||
      'Replace your first name with this nickname for your career. Your last name remains unchanged.';

  const declineDesc = isStarting
    ? (
        t('NICKNAME_STARTING_DISCARD_DESC', { nickname }) ||
        t(
          `Discard "${nickname}" and retain your birth name. Saved to Customization so you can add it back later if you want.`
        ) ||
        `Discard "${nickname}" and retain your birth name. Saved to Customization so you can add it back later if you want.`
      ).replace('{nickname}', nickname)
    : hasActiveNickname
    ? `Keep your current active nickname ("${activeNickname}"). Decline "${nickname}".`
    : isFeat
    ? `Decline "${nickname}" and retain your current name.`
    : t('NICKNAME_IGNORE_DESC') ||
      'Keep your original name permanently. You will not receive another regular nickname event.';

  const noticeText = isStarting
    ? 'Notice: Discarded nicknames are stored in Customization and can be re-equipped at any time.'
    : isFeat
    ? 'Feat Nicknames can be earned upon fulfilling legendary career achievements.'
    : t('NICKNAME_ONCE_PER_CAREER_NOTICE') ||
      'Notice: The regular nickname event can happen only once per career.';

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      title={headlineText}
      subtitle={contextTag}
      badge={badgeText}
      icon={<Trophy className="w-5 h-5 text-amber-300" />}
      accentColor="amber"
      maxWidthClass="sm:max-w-xl"
      showCloseButton={false}
      tabs={[
        { id: 'story', label: 'Identity & Story' },
        { id: 'decision', label: 'Choice Effects' },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'story' | 'decision')}
      bodyClassName="p-4 sm:p-5 space-y-4"
      footer={
        <div id="nickname-event-modal-container" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            id="nickname-accept-btn"
            type="button"
            onClick={handleAccept}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg border border-emerald-300/60 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>
              {hasActiveNickname ? 'REPLACE' : t('NICKNAME_EMBRACE_BTN') || 'Embrace'}: {nickname}
            </span>
          </button>

          <button
            id="nickname-decline-btn"
            type="button"
            onClick={handleDecline}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-600 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <XCircle className="w-4 h-4 shrink-0" />
            <span>
              {isStarting
                ? t('NICKNAME_DISCARD_KEEP_BIRTH_NAME') || 'KEEP BIRTH NAME'
                : hasActiveNickname
                ? 'KEEP CURRENT'
                : t('NICKNAME_IGNORE_BTN') || 'Ignore It'}
            </span>
          </button>
        </div>
      }
    >
      {activeTab === 'story' ? (
        <div className="space-y-4">
          <ConsolePagedText paragraphs={[subtitleText]} resetKey={`nick-story-${nickname}`} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {hasActiveNickname ? 'Active Identity' : t('NICKNAME_CURRENT_NAME') || 'Current Identity'}
              </div>
              <div className="text-base font-bold text-slate-200 truncate">{currentFullName}</div>
              {hasActiveNickname && (
                <div className="text-xs text-amber-400 font-semibold mt-0.5">
                  Current: &ldquo;{activeNickname}&rdquo;
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/60 to-yellow-950/40 border border-amber-500/60">
              <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t('NICKNAME_PROPOSED_NAME') || 'New Matchday Name'}
              </div>
              <div className="text-base font-black text-amber-200 truncate flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 sm:hidden" />
                <span>{newFullName}</span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                New Nickname: &ldquo;{nickname}&rdquo;
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ConsolePagedText
          heading="Nickname Decision Details"
          bullets={[
            `${hasActiveNickname ? 'REPLACE' : t('NICKNAME_EMBRACE_BTN') || 'Embrace It'}: ${embraceDesc}`,
            `${isStarting ? 'KEEP BIRTH NAME' : hasActiveNickname ? 'KEEP CURRENT' : t('NICKNAME_IGNORE_BTN') || 'Ignore It'}: ${declineDesc}`,
            noticeText,
          ]}
          maxBulletsPerPage={2}
          resetKey={`nick-details-${nickname}`}
        />
      )}
    </ConsoleModalShell>
  );
};

