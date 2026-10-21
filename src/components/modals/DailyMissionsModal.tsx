import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DailyMission, PlayerProfileXP } from '../../types/missions';
import { soundManager } from '../../audio/soundManager';
import {
  X,
  Target,
  Sparkles,
  Trophy,
  Hammer,
  Shuffle,
  Flame,
  CheckCircle2,
  Gift,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DailyMissionsModalProps {
  isOpen: boolean;
  missions: DailyMission[];
  playerProfile: PlayerProfileXP;
  onClaimReward: (missionId: string) => void;
  onClaimAll: () => void;
  onClose: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  missions,
  playerProfile,
  onClaimReward,
  onClaimAll,
  onClose,
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  // Calculate time remaining until midnight local time
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeftStr(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const unclaimedCount = missions.filter((m) => m.isCompleted && !m.isClaimed).length;

  const xpPercent = Math.min(
    100,
    Math.round((playerProfile.currentXp / playerProfile.nextLevelXp) * 100)
  );

  const handleClaim = (missionId: string) => {
    soundManager.playPowerUp();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4'],
    });
    onClaimReward(missionId);
  };

  const handleClaimAll = () => {
    soundManager.playPowerUp();
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981'],
    });
    onClaimAll();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-lg max-h-[90vh] rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-5 sm:p-6 shadow-2xl shadow-indigo-500/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Daily Missions</h2>
                <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  <span>Resets in {timeLeftStr}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete daily tasks to earn bonus XP and power-ups
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-col gap-4 py-4 overflow-y-auto pr-1">
          {/* Player Level & XP Card */}
          <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs">
                  {playerProfile.level}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Level {playerProfile.level} · {playerProfile.title}
                  </span>
                  <span className="text-[10px] text-indigo-300">
                    {playerProfile.totalMissionsCompleted} Missions Mastered
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-200">
                {playerProfile.currentXp} / {playerProfile.nextLevelXp} XP
              </span>
            </div>

            {/* XP Bar */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Missions Progress Summary Bar & Claim All */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-300">
              Completed {completedCount} of {missions.length} Tasks
            </span>
            {unclaimedCount > 1 && (
              <button
                type="button"
                onClick={handleClaimAll}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
              >
                <Gift className="h-3.5 w-3.5" />
                <span>Claim All ({unclaimedCount})</span>
              </button>
            )}
          </div>

          {/* Mission Cards List */}
          <div className="flex flex-col gap-2.5">
            {missions.map((mission) => {
              const progressRatio = Math.min(1, mission.current / mission.target);
              const percent = Math.round(progressRatio * 100);

              return (
                <div
                  key={mission.id}
                  className={`relative flex flex-col gap-2 rounded-xl border p-3.5 transition-all ${
                    mission.isClaimed
                      ? 'border-slate-800 bg-slate-950/40 opacity-70'
                      : mission.isCompleted
                      ? 'border-amber-400/60 bg-amber-950/20 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Jewel or Icon */}
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg shadow-inner shrink-0"
                        style={{
                          backgroundColor: `${mission.accentColor}25`,
                          border: `1px solid ${mission.accentColor}50`,
                          color: mission.accentColor,
                        }}
                      >
                        {mission.type === 'clear_ruby' ? (
                          <div className="h-3.5 w-3.5 rotate-45 rounded-xs bg-rose-500" />
                        ) : mission.type === 'combo' ? (
                          <Flame className="h-4 w-4 text-purple-400" />
                        ) : mission.type === 'cascade' ? (
                          <Sparkles className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Trophy className="h-4 w-4 text-cyan-400" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {mission.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-snug mt-0.5">
                          {mission.description}
                        </p>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0">
                      {mission.isClaimed ? (
                        <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Claimed</span>
                        </span>
                      ) : mission.isCompleted ? (
                        <button
                          type="button"
                          onClick={() => handleClaim(mission.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/30 hover:brightness-110 transition-all cursor-pointer animate-pulse"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          <span>Claim</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono font-medium text-slate-500">
                          {mission.current} / {mission.target}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-mono">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: mission.accentColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Rewards preview pill */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-900/80">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Reward:
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                      <Sparkles className="h-3 w-3 text-indigo-400" />
                      +{mission.rewardXp} XP
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                      {mission.rewardPowerUp === 'hammer' ? (
                        <Hammer className="h-3 w-3 text-amber-400" />
                      ) : (
                        <Shuffle className="h-3 w-3 text-purple-400" />
                      )}
                      +{mission.rewardPowerUpCount}{' '}
                      {mission.rewardPowerUp === 'hammer' ? 'Hammer' : 'Shuffle'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
