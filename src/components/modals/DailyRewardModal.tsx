import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DAILY_REWARDS_SCHEDULE } from '../../utils/themeConfig';
import { soundManager } from '../../audio/soundManager';
import {
  getSevenDayStreakHistory,
  getThirtyDayStreakHistory,
  loadStreakShields,
  saveStreakShields,
} from '../../utils/storage';
import { StreakProgressBarChart } from '../StreakProgressBarChart';
import { StreakGrowthChart } from '../StreakGrowthChart';
import { loadPlayerXP, spendPlayerXP } from '../../utils/missionManager';
import {
  Flame,
  Check,
  Hammer,
  Shuffle,
  Gift,
  X,
  Sparkles,
  Shield,
  ShieldCheck,
  TrendingUp,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface DailyRewardModalProps {
  isOpen: boolean;
  canClaim: boolean;
  currentStreak: number;
  nextDayInCycle: number;
  lastClaimDate: string | null;
  shieldSavedStreak?: boolean;
  onClaimReward: () => void;
  onClose: () => void;
  onXpChange?: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  canClaim,
  currentStreak,
  nextDayInCycle,
  lastClaimDate,
  shieldSavedStreak,
  onClaimReward,
  onClose,
  onXpChange,
}) => {
  const [chartTab, setChartTab] = useState<'30day' | '7day'>('30day');
  const [streakShields, setStreakShields] = useState<number>(loadStreakShields);
  const [playerXpProfile, setPlayerXpProfile] = useState(loadPlayerXP);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const activeReward = DAILY_REWARDS_SCHEDULE[nextDayInCycle - 1];
  const streakHistory = getSevenDayStreakHistory(currentStreak, !canClaim);
  const thirtyDayHistory = getThirtyDayStreakHistory(currentStreak, !canClaim);

  const handleClaim = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#38bdf8', '#c084fc', '#10b981', '#f43f5e'],
      });
    } catch {
      // fallback
    }
    soundManager.playPowerUp();
    onClaimReward();
  };

  const handleBuyStreakShield = () => {
    const cost = 350;
    const result = spendPlayerXP(cost);
    if (!result.success) {
      soundManager.playClick();
      setFeedbackMsg({
        text: `Need ${cost} XP! Complete Daily Missions to earn XP. (Available: ${playerXpProfile.currentXp} XP)`,
        isError: true,
      });
      setTimeout(() => setFeedbackMsg(null), 3800);
      return;
    }

    const nextShieldCount = streakShields + 1;
    saveStreakShields(nextShieldCount);
    setStreakShields(nextShieldCount);
    setPlayerXpProfile(result.profile);

    soundManager.playPowerUp();
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#06b6d4', '#38bdf8', '#f59e0b'],
      });
    } catch {}

    setFeedbackMsg({
      text: `🛡️ Streak Shield Acquired! (${nextShieldCount} Active). Your daily streak is safe!`,
      isError: false,
    });
    setTimeout(() => setFeedbackMsg(null), 3800);

    if (onXpChange) onXpChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl border border-slate-800 bg-slate-900/95 p-4 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Daily Rewards & Streak</h2>
              <div className="flex items-center gap-2 text-xs text-amber-400 flex-wrap">
                <span className="flex items-center gap-1 font-semibold">
                  <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {currentStreak}-Day Streak
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/40">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  {(1 + Math.min(Math.max(currentStreak, 0), 10) * 0.05).toFixed(2)}x Score Boost
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-cyan-400 font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  {streakShields} Shield{streakShields !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shield Saved Notification Banner */}
        {shieldSavedStreak && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-2.5 text-xs text-cyan-200">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Streak Shield Activated!</strong> Your daily streak was preserved after missing a day.
            </span>
          </div>
        )}

        {/* Subtitle Message */}
        <p className="text-xs text-slate-400 mt-2 mb-2 leading-relaxed">
          {canClaim
            ? `Your Day ${nextDayInCycle} prismatic power-up cache is ready to harvest!`
            : 'You have claimed today’s reward! Check back tomorrow to maintain your daily streak.'}
        </p>

        {/* Chart View Switcher: 30-Day Growth vs 7-Day History */}
        <div className="flex items-center rounded-lg bg-slate-950/80 p-1 border border-slate-800 mb-3">
          <button
            type="button"
            onClick={() => setChartTab('30day')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              chartTab === '30day'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            <span>30-Day Growth Trend</span>
          </button>
          <button
            type="button"
            onClick={() => setChartTab('7day')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              chartTab === '7day'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            <span>7-Day History</span>
          </button>
        </div>

        {/* Scrollable middle container */}
        <div className="flex-1 overflow-y-auto pr-0.5 mb-3 max-h-[50vh]">
          {chartTab === '7day' ? (
            /* Visual 7-day streak history progress bar component using recharts */
            <StreakProgressBarChart
              history={streakHistory}
              currentStreak={currentStreak}
            />
          ) : (
            /* Visual 30-day streak growth trend component using recharts */
            <StreakGrowthChart
              growthData={thirtyDayHistory}
              currentStreak={currentStreak}
              streakShieldsCount={streakShields}
            />
          )}

          {/* 7-Day Reward Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
            {DAILY_REWARDS_SCHEDULE.map((item) => {
              const isToday = item.day === nextDayInCycle;
              const isCompleted = !canClaim
                ? item.day <= nextDayInCycle
                : item.day < nextDayInCycle;

              return (
                <div
                  key={item.day}
                  className={`relative flex flex-col items-center justify-between rounded-xl border p-2 text-center transition-all ${
                    isToday && canClaim
                      ? 'border-amber-400/80 bg-amber-500/15 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400 scale-105'
                      : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                      : 'border-slate-800 bg-slate-950/60 text-slate-500 opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Day {item.day}
                  </span>

                  <div className="my-1.5 flex flex-col items-center justify-center gap-1">
                    {isCompleted ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : item.day === 7 ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 text-xs text-slate-300 font-mono-nums">
                        <Hammer className="h-3 w-3 text-amber-400" />
                        <span>{item.hammers}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] font-mono-nums text-slate-400">
                    {item.day === 7 ? 'Grand' : `+${item.hammers + item.rerolls}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Highlighted Today Reward Card */}
          {activeReward && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 mb-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {canClaim ? "Today's Unlocked Bounty" : 'Last Claimed Cache'}
                </span>
                <span className="text-sm font-bold text-white mt-0.5">
                  Day {nextDayInCycle}: {activeReward.label}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1 font-mono-nums">
                    <Hammer className="h-3.5 w-3.5 text-amber-400" />
                    +{activeReward.hammers} Hammer{activeReward.hammers > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1 font-mono-nums">
                    <Shuffle className="h-3.5 w-3.5 text-indigo-400" />
                    +{activeReward.rerolls} Reroll{activeReward.rerolls > 1 ? 's' : ''}
                  </span>
                  {activeReward.bonusPoints && (
                    <span className="text-amber-300 font-semibold font-mono-nums">
                      +{activeReward.bonusPoints} Pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STREAK SHIELD POWER-UP PURCHASE CARD */}
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-950/60 to-indigo-950/30 p-3.5 mb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">
                      Streak Shield Power-Up
                    </span>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-mono-nums font-bold text-cyan-300 border border-cyan-500/40">
                      {streakShields} Owned
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Protects your streak from resetting if you miss one day of play! Consumed automatically if a day is skipped.
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Row */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400">
                <span>Available XP: </span>
                <span className="font-mono-nums font-bold text-amber-300">
                  {playerXpProfile.currentXp.toLocaleString()} XP
                </span>
              </div>
              <button
                type="button"
                onClick={handleBuyStreakShield}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 px-3 py-1.5 text-xs font-bold text-cyan-200 transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/20"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Buy Shield (350 XP)</span>
              </button>
            </div>

            {/* Purchase Feedback Banner */}
            {feedbackMsg && (
              <div
                className={`mt-2 rounded-lg p-2 text-xs flex items-center gap-1.5 ${
                  feedbackMsg.isError
                    ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                    : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Claim / Status Action Button */}
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
          {canClaim ? (
            <button
              type="button"
              onClick={handleClaim}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all cursor-pointer"
            >
              <Gift className="h-4 w-4" />
              <span>Claim Day {nextDayInCycle} Power-Ups</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
            >
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Reward Claimed for Today</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
