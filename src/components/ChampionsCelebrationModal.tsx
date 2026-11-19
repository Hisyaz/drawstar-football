import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';
import { PlayerConfig, TrophyItem } from '../types';
import { ContinentalFinalVenue } from '../types/continentalCompetitions';
import { useLanguage } from '../context/LanguageContext';
import {
  Trophy,
  Flame,
  Share2,
  Heart,
  Repeat2,
  CheckCircle2,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { ConsoleModalShell, ConsolePagedText, ConsolePaginationBar } from './common/ConsolePager';

export interface ChampionTitleData {
  titleName: string;
  trophyType?: 'league' | 'cup' | 'ucl' | 'world_cup' | 'youth' | 'super_cup';
  seasonYear?: string | number;
  clubName?: string;
  isYouth?: boolean;
  legendaryTitle?: string;
  finalVenue?: ContinentalFinalVenue;
  isDouble?: boolean;
  isTriple?: boolean;
  isTreble?: boolean;
  isWorldCup?: boolean;
  isUcl?: boolean;
  finalScore?: string;
  opponentName?: string;
  goalscorers?: { name: string; goals: number; isPlayer?: boolean }[];
  mvp?: { name: string; club: string; rating?: string | number; isPlayer?: boolean };
  manOfTournament?: { name: string; club: string; isPlayer?: boolean };
  topGoalscorer?: { name: string; club: string; goals: number; isPlayer?: boolean };
  topAssistProvider?: { name: string; club: string; assists: number; isPlayer?: boolean };
  playerPerformance?: {
    name: string;
    position?: string;
    ovr?: number;
    matchesPlayed: number;
    goals: number;
    assists: number;
    avgRating: number | string;
    keyContributionText?: string;
  };
  newsArticle?: {
    headline: string;
    content: string;
  };
  socialComments?: {
    username: string;
    handle: string;
    avatar: string;
    comment: string;
    likes: string;
    verified?: boolean;
  }[];
  seasonTrophiesList?: string[];
}

interface ChampionsCelebrationModalProps {
  isOpen: boolean;
  data: ChampionTitleData;
  player: PlayerConfig;
  onClose: () => void;
  onClaimTrophy?: (trophy: TrophyItem) => void;
}

export const ChampionsCelebrationModal: React.FC<ChampionsCelebrationModalProps> = ({
  isOpen,
  data,
  player,
  onClose,
  onClaimTrophy,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'press' | 'honors' | 'spotlight' | 'social'>('press');
  const [commentIdx, setCommentIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('press');
    setCommentIdx(0);

    const fireConfetti = () => {
      if (shouldDisableParticles()) return;
      try {
        const count = 200;
        const defaults = { origin: { y: 0.6 } };
        function fire(particleRatio: number, opts: confetti.Options) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    };

    fireConfetti();
    const timer = setTimeout(fireConfetti, 400);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const clubName = data.clubName || player.club || (player as any).nationalTeam || 'Kensington United';
  const playerName = player.name || 'Your Player';
  const seasonYear = data.seasonYear || new Date().getFullYear();
  const lowerTitle = (data.titleName || '').toLowerCase();

  const isWorldCup = Boolean(
    data.isWorldCup ||
      data.trophyType === 'world_cup' ||
      lowerTitle.includes('world cup') ||
      lowerTitle.includes('mundial')
  );
  const isUcl = Boolean(
    data.isUcl ||
      data.trophyType === 'ucl' ||
      lowerTitle.includes('champions league') ||
      lowerTitle.includes('ucl') ||
      lowerTitle.includes('libertadores')
  );
  const isTreble = Boolean(
    data.isTreble ||
      (data.seasonTrophiesList &&
        data.seasonTrophiesList.length >= 3 &&
        data.seasonTrophiesList.some(
          (tName) =>
            tName.toLowerCase().includes('champions league') ||
            tName.toLowerCase().includes('european winners league') ||
            tName.toLowerCase().includes('ucl') ||
            tName.toLowerCase().includes('ewl')
        ))
  );
  const isTriple = Boolean(data.isTriple || (data.seasonTrophiesList && data.seasonTrophiesList.length >= 3));
  const isDouble = Boolean(data.isDouble || (data.seasonTrophiesList && data.seasonTrophiesList.length === 2));
  const isYouth = Boolean(
    data.isYouth ||
      data.trophyType === 'youth' ||
      lowerTitle.includes('youth') ||
      lowerTitle.includes('u16') ||
      lowerTitle.includes('academy')
  );

  let headerBadgeText = t('CHAMPIONS OF {title}', { title: data.titleName.toUpperCase() });
  let accentColor: 'amber' | 'emerald' | 'cyan' | 'sky' | 'rose' | 'purple' | 'blue' = 'amber';
  if (isTreble) {
    headerBadgeText = t('👑 THE TREBLE KINGS • HISTORIC TRIPLE CROWN!');
    accentColor = 'purple';
  } else if (isWorldCup) {
    headerBadgeText = t('🌍 WORLD CHAMPIONS • WORLD CHAMPIONSHIP WINNERS!');
    accentColor = 'sky';
  } else if (isUcl) {
    headerBadgeText = t('⭐ CHAMPIONS OF EUROPE • EUROPEAN WINNERS LEAGUE');
    accentColor = 'blue';
  } else if (isTriple) {
    headerBadgeText = t('⚡ TRIPLE CHAMPIONS • 3 MAJOR TITLES IN ONE SEASON!');
    accentColor = 'rose';
  } else if (isDouble) {
    headerBadgeText = t('✨ DOUBLE CHAMPIONS • DUAL TROPHY DOMINANCE!');
    accentColor = 'emerald';
  } else if (isYouth) {
    headerBadgeText = t('🥇 YOUTH ACADEMY CHAMPIONS!');
    accentColor = 'cyan';
  }

  const articleHeadline =
    data.newsArticle?.headline ||
    (isTreble
      ? t('{club} REWRITE HISTORY WITH IMMORTAL TREBLE GLORY!', { club: clubName.toUpperCase() })
      : isWorldCup
      ? t('{club} CROWNED WORLD CHAMPIONS IN UNFORGETTABLE FINAL!', { club: clubName.toUpperCase() })
      : isUcl
      ? t('KINGS OF EUROPE! {club} WIN THE EUROPEAN WINNERS LEAGUE!', { club: clubName.toUpperCase() })
      : isTriple
      ? t('TRIPLE CROWN! {club} SWEEP THREE TITLES THIS SEASON!', { club: clubName.toUpperCase() })
      : isDouble
      ? t('DOUBLE CELEBRATION! {club} SECURE DUAL TROPHY SWEEP!', { club: clubName.toUpperCase() })
      : isYouth
      ? t('ACADEMY TRIUMPH! {club} FINISH #1 TO WIN {title}!', {
          club: clubName.toUpperCase(),
          title: data.titleName.toUpperCase(),
        })
      : t('CHAMPIONS! {club} LIFT THE {title} TROPHY!', {
          club: clubName.toUpperCase(),
          title: data.titleName.toUpperCase(),
        }));

  const articleContent =
    data.newsArticle?.content ||
    (isTreble
      ? t(
          'In an unprecedented campaign that will echo through football history forever, {club} completed the ultimate Treble. Guided by an extraordinary series of performances from {player}, the squad conquered their Domestic League, Domestic Cup, and the European Winners League in a single majestic sweep. Supporters spilled onto the streets in celebration of a feat reserved only for the absolute gods of the sport.',
          { club: clubName, player: playerName }
        )
      : isWorldCup
      ? t(
          "Before a global audience of billions, {club} reached the absolute pinnacle of international football by lifting the World Championship. Spearheaded by {player}'s composure and game-changing brilliance under maximum pressure, the team battled through a dramatic tournament run to secure global immortality.",
          { club: clubName, player: playerName }
        )
      : isUcl
      ? t(
          "Under the iconic European floodlights, {club} put on a masterclass of tactical discipline and lethal attack to lift the European Winners League trophy. {player} proved to be the decisive factor in the knockout stages and grand final, cementing their reputation among Europe's elite.",
          { club: clubName, player: playerName }
        )
      : isTriple
      ? t(
          'An astounding season has ended in total supremacy for {club}, who successfully claimed three distinct trophies this year. With {player} delivering relentless goal contributions and match-winning displays week after week, the team proved untouchable on all fronts.',
          { club: clubName, player: playerName }
        )
      : isDouble
      ? t(
          'Sensational scenes erupted at the final whistle as {club} officially wrapped up a brilliant Double trophy haul. Demonstrating deep squad rotation and high tactical consistency, {player} played an indispensable role in securing both major honors.',
          { club: clubName, player: playerName }
        )
      : isYouth
      ? t(
          "The hard work at the youth academy has paid off in gold! {club} finished at the top of the standings to claim the {title} title. {player}'s leadership, scoring output, and tactical maturity stood out as the defining catalyst behind this championship run.",
          { club: clubName, title: data.titleName, player: playerName }
        )
      : t(
          'An incredible season came to a triumphant conclusion as {club} officially lifted the {title}. Through tactical grit and magic moments from {player}, the squad overcame every challenge to stand victorious as undisputed champions.',
          { club: clubName, title: data.titleName, player: playerName }
        ));

  const playerGoals = data.playerPerformance?.goals ?? 12;
  const playerAssists = data.playerPerformance?.assists ?? 7;
  const playerRating = data.playerPerformance?.avgRating ?? 8.4;
  const playerMatches = data.playerPerformance?.matchesPlayed ?? 18;

  const goalscorersList = data.goalscorers || [
    { name: playerName, goals: Math.max(1, Math.min(3, playerGoals)), isPlayer: true },
    { name: 'Lucas Silva', goals: 1 },
    { name: 'Mateo Rossi', goals: 1 },
  ];

  const mvpInfo = data.mvp || {
    name: playerName,
    club: clubName,
    rating: playerRating,
    isPlayer: true,
  };
  const manOfTournament = data.manOfTournament || {
    name: playerName,
    club: clubName,
    isPlayer: true,
  };
  const topScorer = data.topGoalscorer || {
    name: playerName,
    club: clubName,
    goals: playerGoals,
    isPlayer: true,
  };
  const topAssister = data.topAssistProvider || {
    name: playerName,
    club: clubName,
    assists: playerAssists,
    isPlayer: true,
  };

  const commentsList = data.socialComments || [
    {
      username: 'FutbolFanatic_99',
      handle: '@futbol_fanatic99',
      avatar: '⚽',
      comment: isTreble
        ? t('TREBLE WINNERS IS CRAZY!! 😭😭🏆🏆🏆 {player} IS LITERALLY THE GOAT OF THIS GENERATION!! BUILD THE STATUE TODAY!!', { player: playerName })
        : isWorldCup
        ? t("WORLD CHAMPIONS!! 🌍🏆 I'm crying real tears, {player} just played the match of his life on the biggest stage imaginable! 🔥", { player: playerName })
        : isUcl
        ? t('CHAMPIONS LEAGUE WINNERS BABY!! ⭐️⭐️ {player} cooked in the final like it was a casual park kickabout! Unbelievable scenes!', { player: playerName })
        : t('NO WAY WE ACTUALLY WON THE {title}!! {player} MVP ALL DAY EVERY DAY 🔥🔥🔥🏆', { title: data.titleName.toUpperCase(), player: playerName }),
      likes: '48.2K',
      verified: true,
    },
    {
      username: 'TacticsInsider',
      handle: '@tactics_daily',
      avatar: '📊',
      comment: t("Absolute masterclass performance from {club}. {player}'s positioning and decision making under press was 10/10. Pure football art.", { club: clubName, player: playerName }),
      likes: '22.5K',
      verified: true,
    },
    {
      username: 'UltraSupporter',
      handle: '@club_ultras',
      avatar: '🔥',
      comment: t('WE ARE THE CHAMPIONS!! Nobody can touch us this season! Unstoppable energy from start to finish! 👑👑'),
      likes: '14.8K',
      verified: false,
    },
  ];

  const handleClaim = () => {
    if (onClaimTrophy) {
      let iconType: TrophyItem['iconType'] = 'league';
      let category: TrophyItem['category'] = 'national';

      if (isWorldCup) {
        iconType = 'world-cup';
        category = 'international';
      } else if (isUcl) {
        iconType = 'champions-league';
        category = 'continental';
      } else if (isYouth) {
        iconType = 'youth-trophy';
        category = 'youth';
      } else if (lowerTitle.includes('cup')) {
        iconType = 'cup';
        category = 'national';
      } else if (lowerTitle.includes('super')) {
        iconType = 'super-cup';
        category = 'national';
      }

      const trophyItem: TrophyItem = {
        id: `trophy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: data.titleName,
        category,
        year: String(seasonYear),
        count: 1,
        prestige: isTreble ? 100 : isWorldCup ? 100 : isUcl ? 95 : isTriple ? 90 : isDouble ? 85 : 75,
        iconType,
      };
      onClaimTrophy(trophyItem);
    }
    onClose();
  };

  const subtitle = `${clubName} • ${t('Season {season}', { season: seasonYear })}${
    data.finalScore ? ` • ${data.finalScore}` : ''
  }${data.finalVenue ? ` • ${data.finalVenue.stadium}` : ''}`;

  const contributionQuote =
    data.playerPerformance?.keyContributionText ||
    t(
      'An extraordinary season by {player}. Serving as the main engine of the squad, delivering clutch moments when the pressure was highest to capture the {title}.',
      { player: playerName, title: data.titleName }
    );

  const safeCommentIdx = Math.min(commentIdx, Math.max(0, commentsList.length - 1));
  const currentComment = commentsList[safeCommentIdx];

  return (
    <ConsoleModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('CHAMPIONS OF')} ${data.titleName}`}
      subtitle={subtitle}
      badge={data.legendaryTitle || headerBadgeText}
      icon={<Trophy className="w-5 h-5 text-amber-300" />}
      accentColor={accentColor}
      maxWidthClass="sm:max-w-3xl"
      zIndexClass="z-[120]"
      tabs={[
        { id: 'press', label: t('Press Release') || 'Press Release' },
        { id: 'honors', label: t('Honors') || 'Awards' },
        { id: 'spotlight', label: t('Spotlight') || 'Player' },
        { id: 'social', label: t('Fan Buzz') || 'Reactions', badge: commentsList.length },
      ]}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as 'press' | 'honors' | 'spotlight' | 'social')}
      bodyClassName="p-4 sm:p-6 space-y-4"
      footer={
        <button
          type="button"
          onClick={handleClaim}
          className="w-full min-h-[48px] py-3.5 px-6 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-2xl shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2.5 uppercase tracking-wider active:scale-95"
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 shrink-0" />
          <span>{t('CLAIM TROPHY & CELEBRATE 🏆')}</span>
          <ChevronRight className="w-4 h-4 stroke-[3] shrink-0" />
        </button>
      }
    >
      {activeTab === 'press' && (
        <div className="space-y-4">
          {data.seasonTrophiesList && data.seasonTrophiesList.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800">
              <span className="text-xs uppercase font-black text-slate-300 mr-1">
                {t('Season Trophies ({count}):', { count: data.seasonTrophiesList.length })}
              </span>
              {data.seasonTrophiesList.map((tName, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-amber-400/40 text-xs font-extrabold uppercase flex items-center gap-1"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {tName}
                </span>
              ))}
            </div>
          )}

          <ConsolePagedText
            heading={articleHeadline}
            paragraphs={[
              articleContent,
              t(
                'Winning {title} adds an official trophy to your personal Trophy Cabinet, raises your player Fame, and boosts your market valuation globally!',
                { title: data.titleName }
              ),
            ]}
            maxCharsPerPage={360}
            resetKey={`champ-press-${data.titleName}`}
          />
        </div>
      )}

      {activeTab === 'honors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-black uppercase text-slate-400">{t('⚽ Match Goalscorers')}</div>
            <div className="space-y-1.5 font-bold text-slate-200">
              {goalscorersList.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className={g.isPlayer ? 'text-amber-300 font-extrabold' : ''}>
                    {g.name} {g.isPlayer ? t('(YOU)') : ''}
                  </span>
                  <span className="font-mono text-amber-400">
                    {g.goals} {g.goals > 1 ? t('Goals') : t('Goal')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-black uppercase text-slate-400">{t('⭐ Man of the Match (MVP)')}</div>
            <div className="text-sm font-black text-amber-300 flex items-center justify-between gap-2">
              <span>
                {mvpInfo.name} {mvpInfo.isPlayer ? t('(YOU)') : ''}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs shrink-0">
                {t('Rating: {rating}', { rating: mvpInfo.rating || playerRating })}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('Dominant individual impact in key championship moments.')}
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-black uppercase text-slate-400">{t('🏆 Player of the Tournament')}</div>
            <div className="text-sm font-black text-emerald-400">
              {manOfTournament.name} {manOfTournament.isPlayer ? t('(YOU)') : ''}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('Awarded for highest overall match ratings throughout the competition.')}
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-black uppercase text-slate-400">{t('👟 Golden Boot & Playmaker')}</div>
            <div className="text-xs sm:text-sm font-bold space-y-1.5">
              <div className="flex justify-between gap-2">
                <span className="text-slate-300">{t('Top Scorer:')}</span>
                <span className="text-amber-300">
                  {topScorer.name} ({topScorer.goals} G)
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-300">{t('Top Assister:')}</span>
                <span className="text-sky-300">
                  {topAssister.name} ({topAssister.assists} A)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'spotlight' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-lg border-2 border-white/20">
              {player.shirtNumber || player.number || (player as any).kitNumber || '10'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-lg font-black text-white flex items-center gap-2 truncate">
                <span className="truncate">{playerName}</span>
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              </h4>
              <span className="text-xs font-bold text-amber-400">
                {player.position || 'ST'} • OVR {player.ovr || 70}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">{t('Matches')}</div>
              <div className="text-lg font-black text-white">{playerMatches}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">{t('Goals')}</div>
              <div className="text-lg font-black text-emerald-400">{playerGoals}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">{t('Assists')}</div>
              <div className="text-lg font-black text-sky-400">{playerAssists}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">{t('Rating')}</div>
              <div className="text-lg font-black text-amber-300">{playerRating}</div>
            </div>
          </div>

          <ConsolePagedText paragraphs={[contributionQuote]} resetKey={`champ-spot-${playerName}`} />
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase text-sky-400 border-b border-slate-800 pb-2">
            <span>{t('Social Media Buzz & Fan Reaction')}</span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {t('#1 Trending')}
            </span>
          </div>

          {currentComment && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0">
                    {currentComment.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-white flex items-center gap-1 truncate">
                      <span className="truncate">{currentComment.username}</span>
                      {currentComment.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">{currentComment.handle}</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono shrink-0">{t('1m ago')}</span>
              </div>

              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                {currentComment.comment}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono border-t border-slate-800/60">
                <span className="flex items-center gap-1 text-rose-400">
                  <Heart className="w-3.5 h-3.5" /> {currentComment.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="w-3.5 h-3.5" /> {t('Retweet')}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" /> {t('Share')}
                </span>
              </div>
            </div>
          )}

          {commentsList.length > 1 && (
            <ConsolePaginationBar
              currentPage={safeCommentIdx + 1}
              totalPages={commentsList.length}
              onPageChange={(p) => setCommentIdx(p - 1)}
              label="POST"
            />
          )}
        </div>
      )}
    </ConsoleModalShell>
  );
};

