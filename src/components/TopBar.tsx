import React from 'react';
import { GameMode } from '../types/game';
import {
  Settings,
  HelpCircle,
  Gift,
  Flame,
  Trophy,
  Swords,
  MessageSquare,
  Sparkles,
  Target,
  Award,
} from 'lucide-react';
import { getPlayerGlobalRank } from '../utils/playerRanks';

interface TopBarProps {
  currentMode: GameMode;
  dailyStreak: number;
  canClaimDailyReward: boolean;
  dailyMissionsCompleted: number;
  dailyMissionsTotal: number;
  hasUnclaimedMissions: boolean;
  playerName?: string;
  totalLifetimeXp?: number;
  topScoreToday?: number;
  onSelectMode: (mode: GameMode) => void;
  onOpenDailyReward: () => void;
  onOpenDailyMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenChat: () => void;
  onOpenAchievements: () => void;
  onOpenHowToPlay: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  dailyStreak,
  canClaimDailyReward,
  dailyMissionsCompleted,
  dailyMissionsTotal,
  hasUnclaimedMissions,
  playerName = 'PrismSeeker',
  totalLifetimeXp = 0,
  topScoreToday,
  onSelectMode,
  onOpenDailyReward,
  onOpenDailyMissions,
  onOpenLeaderboard,
  onOpenChat,
  onOpenAchievements,
  onOpenHowToPlay,
  onOpenTutorial,
  onOpenSettings,
}) => {
  const rankInfo = getPlayerGlobalRank(totalLifetimeXp);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-2 sm:px-4 py-1.5 sm:py-2 transition-all">
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5 sm:gap-2">
        {/* ====================================================================
            ROW 1: BRAND & GLOBAL RANK (LEFT) + CORE UTILITIES (RIGHT)
            Guaranteed 100% visible on every mobile portrait screen (width < 380px)
            Includes: Interactive Tutorial, Game Rules, Settings, and Chat
            ==================================================================== */}
        <div className="flex items-center justify-between gap-1 w-full">
          {/* Brand Wordmark & Clickable Player Global Rank Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-base sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent select-none">
              Lumina
            </span>

            {/* Global Rank Badge */}
            <button
              type="button"
              onClick={onOpenLeaderboard}
              title={`Rank: ${rankInfo.tier.name} • ${totalLifetimeXp.toLocaleString()} Lifetime XP • Click for Leaderboard`}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold transition-all cursor-pointer shadow-sm group"
            >
              <span className="hidden sm:inline text-slate-300 max-w-[80px] truncate">
                {playerName}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 rounded px-1 py-0.2 font-mono-nums border ${rankInfo.tier.badgeBg} ${rankInfo.tier.textColor} ${rankInfo.tier.borderColor} ${rankInfo.tier.glowClass}`}
              >
                <span>{rankInfo.tier.symbol}</span>
                <span className="truncate max-w-[65px] sm:max-w-none">{rankInfo.tier.name}</span>
              </span>
            </button>
          </div>

          {/* Quick Utility Icons: Tutorial, Rules, Settings, Chat */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Interactive Tutorial Button */}
            <button
              type="button"
              onClick={onOpenTutorial}
              title="Interactive Tutorial"
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span className="text-[10px] sm:text-xs">Tutorial</span>
            </button>

            {/* Game Rules / How To Play Button */}
            <button
              type="button"
              onClick={onOpenHowToPlay}
              title="Game Rules & Guide"
              className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {/* Settings Modal Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings, Sound & Themes"
              className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {/* Community Tips Chat Button */}
            <button
              type="button"
              onClick={onOpenChat}
              title="Community Tips & Chat"
              className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ====================================================================
            ROW 2: DAILY STREAK, REWARDS, MISSIONS & TOP 5 LEADERBOARD
            Dedicated full-width row with ample space for touch and badges
            ==================================================================== */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {/* 1. Daily Streak & Reward (Video Ad Enabled) */}
          <button
            type="button"
            onClick={onOpenDailyReward}
            title="Daily Streak & Rewards (Watch Video Ad to View Streak)"
            className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              canClaimDailyReward
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50 shadow-amber-500/20'
                : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Gift
              className={`h-3.5 w-3.5 shrink-0 ${
                canClaimDailyReward ? 'text-amber-400 animate-bounce' : 'text-slate-400'
              }`}
            />
            <span className="truncate text-[11px] font-bold">
              {dailyStreak > 0 ? `${dailyStreak}d Streak` : 'Streak'}
            </span>
            {dailyStreak > 0 && (
              <Flame className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
            )}
            {canClaimDailyReward && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            )}
          </button>

          {/* 2. Daily Missions */}
          <button
            type="button"
            onClick={onOpenDailyMissions}
            title="Daily Missions & XP Tasks"
            className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              hasUnclaimedMissions
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50 shadow-amber-500/20'
                : 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300'
            }`}
          >
            <Target
              className={`h-3.5 w-3.5 shrink-0 ${
                hasUnclaimedMissions ? 'text-amber-400 animate-pulse' : 'text-indigo-400'
              }`}
            />
            <span className="truncate text-[11px] font-bold">Missions</span>
            <span className="text-[10px] font-mono-nums font-bold text-slate-200">
              {dailyMissionsCompleted}/{dailyMissionsTotal}
            </span>
            {hasUnclaimedMissions && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            )}
          </button>

          {/* 3. Daily Top 5 Leaderboard */}
          <button
            type="button"
            onClick={onOpenLeaderboard}
            title="Global Daily Top 5 & Lifetime XP"
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate text-[11px] font-bold">Top 5</span>
            {topScoreToday !== undefined && topScoreToday > 0 && (
              <span className="hidden xs:inline text-[9px] text-amber-200 font-mono-nums font-bold">
                {topScoreToday.toLocaleString()}
              </span>
            )}
          </button>
        </div>

        {/* ====================================================================
            ROW 3: GAME MODE SWITCHER
            Clean 6-column grid spanning 100% of the mobile screen
            ==================================================================== */}
        <nav className="w-full grid grid-cols-6 gap-1 bg-slate-900/95 p-1 rounded-xl border border-slate-800/90 shadow-sm text-center select-none">
          {/* 1. Endless */}
          <button
            type="button"
            onClick={() => onSelectMode('CLASSIC_ENDLESS')}
            className={`py-1.5 px-0.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all truncate cursor-pointer ${
              currentMode === 'CLASSIC_ENDLESS'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Endless
          </button>

          {/* 2. Quests */}
          <button
            type="button"
            onClick={() => onSelectMode('LEVEL_QUEST')}
            className={`py-1.5 px-0.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all truncate cursor-pointer ${
              currentMode === 'LEVEL_QUEST'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Quests
          </button>

          {/* 3. Blitz */}
          <button
            type="button"
            onClick={() => onSelectMode('TIME_ATTACK')}
            className={`py-1.5 px-0.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all truncate cursor-pointer ${
              currentMode === 'TIME_ATTACK'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Blitz
          </button>

          {/* 4. Daily */}
          <button
            type="button"
            onClick={() => onSelectMode('DAILY_CHALLENGE')}
            className={`py-1.5 px-0.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all truncate cursor-pointer ${
              currentMode === 'DAILY_CHALLENGE'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 ring-1 ring-indigo-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Daily
          </button>

          {/* 5. 1v1 Duel */}
          <button
            type="button"
            onClick={() => onSelectMode('MULTIPLAYER_DUEL')}
            className={`py-1.5 px-0.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all truncate cursor-pointer flex items-center justify-center gap-0.5 ${
              currentMode === 'MULTIPLAYER_DUEL'
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm ring-1 ring-rose-400/50'
                : 'text-rose-400 hover:text-rose-300 hover:bg-slate-800/50'
            }`}
          >
            <Swords className="h-3 w-3 shrink-0" />
            <span className="truncate">1v1</span>
          </button>

          {/* 6. Trophies */}
          <button
            type="button"
            onClick={onOpenAchievements}
            className="py-1.5 px-0.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all truncate cursor-pointer text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/50 flex items-center justify-center gap-0.5"
          >
            <Award className="h-3 w-3 shrink-0" />
            <span className="truncate">Badges</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
