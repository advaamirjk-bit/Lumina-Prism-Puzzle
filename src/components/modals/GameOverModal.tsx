import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, QuestLevel } from '../../types/game';
import { Trophy, Star, RotateCcw, ArrowRight, Home, Skull, Flame, AlertTriangle } from 'lucide-react';
import { vibrateScaryGameOver } from '../../utils/vibration';
import { soundManager } from '../../audio/soundManager';

import { VibrationIntensity } from '../../utils/storage';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  mode: GameMode;
  score: number;
  highScore: number;
  linesCleared: number;
  maxCombo: number;
  currentLevel?: QuestLevel;
  earnedStars?: number;
  vibrationIntensity?: VibrationIntensity;
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  mode,
  score,
  highScore,
  linesCleared,
  maxCombo,
  currentLevel,
  earnedStars = 0,
  vibrationIntensity,
  onPlayAgain,
  onNextLevel,
  onGoHome,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    if (isVictory || score >= highScore) {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#38bdf8', '#f59e0b', '#10b981', '#f43f5e'],
        });
      } catch {
        // canvas-confetti fallback
      }
    } else {
      // SCARY GAME OVER TRIGGER: Terrifying haptic vibration and ominous audio
      vibrateScaryGameOver(vibrationIntensity);
      soundManager.playGameOver(true);
    }
  }, [isOpen, isVictory, score, highScore, vibrationIntensity]);

  if (!isOpen) return null;

  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        !isVictory
          ? 'bg-black/95 backdrop-blur-xl shadow-[inset_0_0_140px_rgba(225,29,72,0.65)]'
          : 'bg-black/80 backdrop-blur-md'
      }`}
    >
      {/* Scary Atmospheric Vignette & Pulsing Blood Mist for Defeat */}
      {!isVictory && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -inset-10 bg-radial-at-c from-rose-950/30 via-black/80 to-black opacity-80 animate-pulse" />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-600 to-transparent animate-pulse" />
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-600 to-transparent animate-pulse" />
        </div>
      )}

      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 sm:p-7 text-center transition-all duration-300 shadow-2xl ${
          !isVictory
            ? 'border-2 border-rose-600/80 bg-gradient-to-b from-stone-950 via-rose-950/60 to-black ring-4 ring-rose-600/30 shadow-[0_0_60px_rgba(225,29,72,0.5)] animate-pop-in'
            : 'border border-slate-800 bg-slate-900/95 shadow-2xl animate-pop-in'
        }`}
      >
        {/* Header Icon */}
        <div
          className={`mx-auto mb-3.5 flex items-center justify-center rounded-2xl transition-transform ${
            isVictory
              ? 'h-14 w-14 bg-indigo-500/10 border border-indigo-500/30 text-amber-400'
              : 'h-16 w-16 bg-rose-950/80 border-2 border-rose-500/60 text-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.7)] animate-bounce'
          }`}
        >
          {isVictory ? (
            <Trophy className="h-7 w-7 text-amber-400" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Skull className="h-9 w-9 text-rose-500 filter drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            </div>
          )}
        </div>

        {/* Terrifying or Triumphant Title */}
        {isVictory ? (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
              Level Complete!
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Congratulations! You mastered Level {currentLevel?.id}.
            </p>
          </>
        ) : (
          <div className="mb-4">
            {/* SCARY JAGGED GLITCH TITLE */}
            <h2 className="text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-rose-500 to-red-700 drop-shadow-[0_0_25px_rgba(225,29,72,0.95)] uppercase select-none animate-pulse">
              GAME OVER
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1.5 text-rose-400/90 text-xs font-bold tracking-wider uppercase">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>THE VOID HAS CLAIMED YOUR SOUL</span>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <p className="text-[11px] text-rose-300/70 mt-1">
              {mode === 'TIME_ATTACK'
                ? 'Blitz timer expired. Darkness enveloped the prism.'
                : 'No pieces fit the stone grid. Darkness consumed your light.'}
            </p>
          </div>
        )}

        {/* Stars earned for Quest mode */}
        {mode === 'LEVEL_QUEST' && isVictory && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {[1, 2, 3].map((starIndex) => (
              <div
                key={starIndex}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  earnedStars >= starIndex
                    ? 'border-amber-400/50 bg-amber-400/10 text-amber-400 shadow-lg shadow-amber-500/20'
                    : 'border-slate-800 bg-slate-950/60 text-slate-700'
                }`}
              >
                <Star
                  className={`h-5 w-5 ${
                    earnedStars >= starIndex ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Score Breakdown Box */}
        <div
          className={`rounded-2xl p-4 mb-5 border ${
            !isVictory
              ? 'border-rose-900/80 bg-black/80 shadow-inner'
              : 'border-slate-800 bg-slate-950/70'
          }`}
        >
          <div className="flex flex-col mb-3">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                !isVictory ? 'text-rose-400/80' : 'text-slate-400'
              }`}
            >
              Final Score
            </span>
            <span
              className={`font-mono-nums text-3xl font-black ${
                !isVictory ? 'text-rose-100 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'text-white'
              }`}
            >
              {score.toLocaleString()}
            </span>
            {isNewRecord && (
              <span className="text-xs font-semibold text-amber-400 mt-0.5">
                ✦ New Personal Record!
              </span>
            )}
          </div>

          <div
            className={`grid grid-cols-2 gap-2 border-t pt-3 text-xs ${
              !isVictory ? 'border-rose-950 text-rose-300/80' : 'border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex flex-col">
              <span>Lines Cleared</span>
              <span className="font-mono-nums font-bold text-white text-sm">{linesCleared}</span>
            </div>
            <div className="flex flex-col">
              <span>Max Combo</span>
              <span
                className={`font-mono-nums font-bold text-sm ${
                  !isVictory ? 'text-rose-400' : 'text-indigo-300'
                }`}
              >
                x{maxCombo}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {isVictory && onNextLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer"
            >
              <span>Next Level</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Primary Action Button: Scary Resurrect vs Normal Play Again */}
          <button
            type="button"
            onClick={onPlayAgain}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all cursor-pointer ${
              !isVictory
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-[0_0_25px_rgba(225,29,72,0.6)] hover:from-red-500 hover:to-rose-600 hover:scale-[1.02] ring-2 ring-rose-400/50'
                : 'border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {!isVictory ? (
              <>
                <Flame className="h-4 w-4 text-amber-300 fill-amber-300 animate-pulse" />
                <span>DEFY DEATH & RESURRECT</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                <span>Play Again</span>
              </>
            )}
          </button>

          {/* Secondary Action */}
          <button
            type="button"
            onClick={onGoHome}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
              !isVictory
                ? 'text-rose-400/80 hover:text-white hover:bg-rose-950/40 border border-rose-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Escape to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
