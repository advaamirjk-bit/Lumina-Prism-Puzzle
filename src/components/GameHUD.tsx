import React, { useState } from 'react';
import { GameMode, PowerUpType, QuestLevel } from '../types/game';
import {
  Hammer,
  Sparkles,
  Shuffle,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Flame,
  Zap,
  Gift,
  ChevronRight,
  Info,
  TrendingUp,
} from 'lucide-react';
import { GEM_META } from '../utils/puzzleBlocks';
import { getStreakTierInfo, getStreakMultiplier } from '../utils/streakMultiplier';

interface GameHUDProps {
  mode: GameMode;
  score: number;
  highScore: number;
  comboCount: number;
  frenzyMeter: number;
  frenzyActive: boolean;
  dailyStreak?: number;
  streakMultiplier?: number;
  canClaimDailyReward?: boolean;
  onOpenDailyReward?: () => void;
  movesLeft?: number;
  timeLeft?: number;
  decaySummary?: { totalDecaying: number; imminentDanger: number; stoneCount: number };
  decayTurnLimit?: number;
  currentLevel?: QuestLevel;
  levelObjectiveProgress?: {
    linesCleared: number;
    frozenCleared: number;
    gemCounts: Record<string, number>;
  };
  powerUps: Record<PowerUpType, number>;
  activePowerUp: PowerUpType | null;
  isMuted: boolean;
  onToggleMute: () => void;
  isSfxEnabled: boolean;
  onToggleSfx: () => void;
  onActivatePowerUp: (type: PowerUpType) => void;
  onResetGame: () => void;
  onOpenAchievements: () => void;
  onOpenLevelSelector: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  score,
  highScore,
  comboCount,
  frenzyMeter,
  frenzyActive,
  dailyStreak = 0,
  streakMultiplier,
  canClaimDailyReward = false,
  onOpenDailyReward,
  movesLeft,
  timeLeft,
  decaySummary,
  decayTurnLimit = 15,
  currentLevel,
  levelObjectiveProgress,
  powerUps,
  activePowerUp,
  isMuted,
  onToggleMute,
  isSfxEnabled,
  onToggleSfx,
  onActivatePowerUp,
  onResetGame,
  onOpenAchievements,
  onOpenLevelSelector,
}) => {
  const [showStreakDetails, setShowStreakDetails] = useState<boolean>(false);
  const activeMultiplier = streakMultiplier ?? getStreakMultiplier(dailyStreak);
  const tierInfo = getStreakTierInfo(dailyStreak);

  return (
    <div
      id="tutorial-target-hud"
      className="flex flex-col gap-2.5 w-full max-w-lg mx-auto px-2"
    >
      {/* Top Stats Strip */}
      <div className="flex items-center justify-between gap-3">
        {/* Score & High Score */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-nums text-3xl font-extrabold tracking-tight text-white">
              {score.toLocaleString()}
            </span>
            {comboCount > 1 && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 animate-pulse">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                x{comboCount} Combo
              </span>
            )}
          </div>
        </div>

        {/* Floating Quick SFX Toggle Button */}
        <button
          type="button"
          onClick={onToggleSfx}
          title={isSfxEnabled ? 'Quick Toggle: Turn Sound Effects OFF' : 'Quick Toggle: Turn Sound Effects ON'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md border cursor-pointer active:scale-95 ${
            isSfxEnabled
              ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border-indigo-500/40 shadow-indigo-500/15'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-700/60'
          }`}
        >
          {isSfxEnabled ? (
            <Volume2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          ) : (
            <VolumeX className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          )}
          <span className="text-[11px] font-mono-nums">
            SFX {isSfxEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* High Score / Best */}
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            Best
          </span>
          <span className="font-mono-nums text-xl font-bold text-slate-300">
            {highScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Dynamic Luminous Streak Multiplier Element */}
      <div
        className={`relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-500 ${tierInfo.containerClass} ${tierInfo.glowShadowClass}`}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          {/* Left: Streak tier icon & day counter */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Luminous Tier Emblem */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
                tierInfo.tier >= 4
                  ? 'border-pink-400/80 bg-pink-500/20 text-pink-300 animate-pulse'
                  : tierInfo.tier === 3
                  ? 'border-purple-400/70 bg-purple-500/20 text-purple-300'
                  : tierInfo.tier === 2
                  ? 'border-amber-400/60 bg-amber-500/20 text-amber-300'
                  : tierInfo.tier === 1
                  ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-800 bg-slate-800/80 text-slate-400'
              }`}
            >
              {tierInfo.tier >= 4 ? (
                <Sparkles className="h-4 w-4 text-pink-300 animate-spin" style={{ animationDuration: '6s' }} />
              ) : tierInfo.tier >= 2 ? (
                <Flame className={`h-4 w-4 fill-current ${tierInfo.tier === 3 ? 'text-purple-300' : 'text-amber-400'}`} />
              ) : tierInfo.tier === 1 ? (
                <Zap className="h-4 w-4 fill-current text-cyan-300" />
              ) : (
                <Flame className="h-4 w-4 text-slate-500" />
              )}
            </div>

            {/* Streak & Tier Label */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black tracking-wide text-white truncate">
                  {dailyStreak > 0 ? `${dailyStreak}-Day Streak` : 'Streak Multiplier'}
                </span>
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border ${tierInfo.badgeBg}`}
                >
                  {tierInfo.title}
                </span>
              </div>

              {/* 7-pip weekly streak progress dots */}
              <div className="flex items-center gap-1 mt-0.5" title="7-Day Check-in Streak Cycle">
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                  const dayInCycle = dailyStreak === 0 ? 0 : ((dailyStreak - 1) % 7) + 1;
                  const isAchieved = dailyStreak > 0 && (dayNum <= dayInCycle || dailyStreak >= 7);
                  return (
                    <div
                      key={dayNum}
                      className={`h-1.5 rounded-sm transition-all ${
                        isAchieved
                          ? dayNum === 7
                            ? 'w-3 bg-gradient-to-r from-pink-400 to-amber-400 shadow-[0_0_6px_#f43f5e]'
                            : 'w-2 bg-current shadow-[0_0_5px_currentColor]'
                          : 'w-2 bg-slate-800'
                      }`}
                      style={{ color: isAchieved ? tierInfo.glowColorHex : undefined }}
                    />
                  );
                })}
                <span className="text-[10px] font-mono-nums text-slate-400 ml-1">
                  {dailyStreak > 0 ? `Day ${((dailyStreak - 1) % 7) + 1}/7` : 'Day 0/7'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Luminous Multiplier Display & Info Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowStreakDetails((prev) => !prev)}
              title="Click to view Streak Multiplier breakdown"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-right transition-all cursor-pointer ${
                tierInfo.badgeBg
              } hover:brightness-110 active:scale-95`}
            >
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[9px] uppercase font-semibold text-slate-300">
                  Session Boost
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-nums text-sm font-extrabold text-white">
                    {activeMultiplier.toFixed(2)}x
                  </span>
                  {tierInfo.bonusPercent > 0 && (
                    <span className="text-[10px] font-bold text-emerald-300">
                      +{tierInfo.bonusPercent}%
                    </span>
                  )}
                </div>
              </div>
              <Info className="h-3.5 w-3.5 text-slate-300 opacity-80" />
            </button>
          </div>
        </div>

        {/* Expandable Explanation & Bonus Details Card */}
        {showStreakDetails && (
          <div className="border-t border-slate-800/80 bg-slate-950/90 p-3 flex flex-col gap-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <TrendingUp className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Daily Check-in Score Multiplier</span>
              </div>
              <span className="text-[11px] font-mono-nums font-bold text-emerald-400">
                Active: {activeMultiplier.toFixed(2)}x
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every consecutive daily check-in grants <span className="font-bold text-amber-300">+5% score boost</span> on all placed crystals and cleared lines for the active play session (up to <span className="font-bold text-pink-300">1.50x MAX at Day 10+</span>).
            </p>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-medium pt-1">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-2 flex flex-col">
                <span className="text-slate-400 uppercase text-[9px]">Current Streak</span>
                <span className="text-sm font-mono-nums font-bold text-white">
                  {dailyStreak} {dailyStreak === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-[9px] text-slate-400">Tier: {tierInfo.title}</span>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-2 flex flex-col">
                <span className="text-slate-400 uppercase text-[9px]">Score Gain</span>
                <span className="text-sm font-mono-nums font-bold text-emerald-400">
                  +{tierInfo.bonusPercent}% Extra Points
                </span>
                <span className="text-[9px] text-slate-400">
                  {tierInfo.nextTierStreak
                    ? `Next: Day ${tierInfo.nextTierStreak} (+${Math.round((getStreakMultiplier(tierInfo.nextTierStreak) - 1) * 100)}%)`
                    : 'Maximum Boost Reached!'}
                </span>
              </div>
            </div>

            {onOpenDailyReward && (
              <button
                type="button"
                onClick={() => {
                  setShowStreakDetails(false);
                  onOpenDailyReward();
                }}
                className={`mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  canClaimDailyReward
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 ring-1 ring-amber-400/50'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Gift className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {canClaimDailyReward
                    ? "Claim Today's Check-in (+5% Boost!)"
                    : 'View Streak Calendar & Rewards'}
                </span>
                <ChevronRight className="h-3 w-3 ml-auto opacity-70" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Crystal Decay Hazard Strip (Classic Endless Mode) */}
      {mode === 'CLASSIC_ENDLESS' && (
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Crystal Decay:</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Outer edge gems turn to stone in {decayTurnLimit} turns
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono-nums text-[11px]">
            {decaySummary && decaySummary.totalDecaying > 0 ? (
              <span
                className={`flex items-center gap-1 font-bold ${
                  decaySummary.imminentDanger > 0
                    ? 'text-rose-400 animate-pulse'
                    : 'text-amber-300'
                }`}
              >
                <span>⏳ {decaySummary.totalDecaying} Edge Gems</span>
                {decaySummary.imminentDanger > 0 && (
                  <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-500/40">
                    {decaySummary.imminentDanger} IMMINENT
                  </span>
                )}
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">Edges Safe</span>
            )}
            {decaySummary && decaySummary.stoneCount > 0 && (
              <span className="text-slate-400">
                • ▲ {decaySummary.stoneCount} Stone{decaySummary.stoneCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quest Objective or Time Blitz Counter */}
      {mode === 'LEVEL_QUEST' && currentLevel && levelObjectiveProgress && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-300">
              Level {currentLevel.id}: {currentLevel.title}
            </span>
            {movesLeft !== undefined && (
              <span className="font-mono-nums text-indigo-300 font-semibold">
                Moves: {movesLeft} left
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {currentLevel.objective.targetScore && (
              <div className="flex items-center gap-1.5">
                <span>Score:</span>
                <span className="font-mono-nums font-semibold text-white">
                  {Math.min(score, currentLevel.objective.targetScore)} / {currentLevel.objective.targetScore}
                </span>
              </div>
            )}
            {currentLevel.objective.targetLines && (
              <div className="flex items-center gap-1.5">
                <span>Lines:</span>
                <span className="font-mono-nums font-semibold text-white">
                  {Math.min(levelObjectiveProgress.linesCleared, currentLevel.objective.targetLines)} /{' '}
                  {currentLevel.objective.targetLines}
                </span>
              </div>
            )}
            {currentLevel.objective.clearFrozen && (
              <div className="flex items-center gap-1.5">
                <span>Frost:</span>
                <span className="font-mono-nums font-semibold text-cyan-300">
                  {Math.min(levelObjectiveProgress.frozenCleared, currentLevel.objective.clearFrozen)} /{' '}
                  {currentLevel.objective.clearFrozen}
                </span>
              </div>
            )}
            {currentLevel.objective.collectGems?.map((gem) => (
              <div key={gem.type} className="flex items-center gap-1">
                <span
                  className="h-2.5 w-2.5 rounded-full inline-block"
                  style={{ backgroundColor: GEM_META[gem.type].textHex }}
                />
                <span className="font-mono-nums font-semibold text-white">
                  {Math.min(levelObjectiveProgress.gemCounts[gem.type] || 0, gem.count)} / {gem.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'TIME_ATTACK' && timeLeft !== undefined && (
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
          <span className="text-xs font-medium text-slate-300">Blitz Countdown</span>
          <span
            className={`font-mono-nums text-2xl font-bold ${
              timeLeft <= 15 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
            }`}
          >
            {Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, '0')}
            :{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Frenzy Meter & Power-Ups Row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Frenzy Bar */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {frenzyActive ? 'FRENZY RUSH (2X SCORE)' : 'Prism Core'}
            </span>
            <span className="font-mono-nums">{frenzyActive ? 'ACTIVE' : `${frenzyMeter}%`}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                frenzyActive
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 animate-pulse'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${frenzyActive ? 100 : frenzyMeter}%` }}
            />
          </div>
        </div>

        {/* Tactical Power-Ups */}
        <div id="tutorial-target-powerups" className="flex items-center gap-1.5 shrink-0">
          {/* Hammer Power-Up */}
          <button
            id="powerup-btn-hammer"
            type="button"
            onClick={() => onActivatePowerUp('hammer')}
            title="Shatter any single cell"
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              activePowerUp === 'hammer'
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/50'
                : powerUps.hammer > 0
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                : 'border-slate-900 bg-slate-950/60 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Hammer className="h-4 w-4" />
            <span className="absolute -top-1.5 -right-1.5 rounded-full bg-slate-800 border border-slate-700 px-1 text-[9px] font-mono-nums text-slate-200">
              {powerUps.hammer}
            </span>
          </button>

          {/* Reroll Power-Up */}
          <button
            id="powerup-btn-reroll"
            type="button"
            onClick={() => onActivatePowerUp('reroll')}
            title="Reshuffle dock pieces"
            className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              powerUps.reroll > 0
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                : 'border-slate-900 bg-slate-950/60 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Shuffle className="h-4 w-4" />
            <span className="absolute -top-1.5 -right-1.5 rounded-full bg-slate-800 border border-slate-700 px-1 text-[9px] font-mono-nums text-slate-200">
              {powerUps.reroll}
            </span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white transition-all"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
