import React from 'react';
import { GameMode, PowerUpType, QuestLevel } from '../types/game';
import { Hammer, Sparkles, Shuffle, Volume2, VolumeX, RotateCcw, Trophy, Flame } from 'lucide-react';
import { GEM_META } from '../utils/puzzleBlocks';

interface GameHUDProps {
  mode: GameMode;
  score: number;
  highScore: number;
  comboCount: number;
  frenzyMeter: number;
  frenzyActive: boolean;
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
