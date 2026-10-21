import React, { useState, useEffect } from 'react';
import {
  LeaderboardEntry,
  LifetimeXpEntry,
  fetchLifetimeXpLeaderboard,
  subscribeToLifetimeXpLeaderboard,
  syncPlayerLifetimeXP,
} from '../../firebase/firebaseConfig';
import {
  loadPlayerXP,
  getOrCreatePlayerId,
} from '../../utils/missionManager';
import {
  Trophy,
  Crown,
  Medal,
  X,
  RefreshCw,
  Send,
  Check,
  Sparkles,
  Zap,
  Target,
  Shield,
  Star,
  Share2,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface DailyLeaderboardModalProps {
  isOpen: boolean;
  dateStr: string;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  userScore: number;
  onRefresh: () => void;
  onSubmitScore: (playerName: string) => Promise<boolean>;
  onClose: () => void;
}

export const DailyLeaderboardModal: React.FC<DailyLeaderboardModalProps> = ({
  isOpen,
  dateStr,
  leaderboard,
  isLoading,
  userScore,
  onRefresh,
  onSubmitScore,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'lifetime'>('daily');
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('lumina_player_name') || 'PrismSeeker';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Lifetime XP Leaderboard state
  const [lifetimeEntries, setLifetimeEntries] = useState<LifetimeXpEntry[]>([]);
  const [isLifetimeLoading, setIsLifetimeLoading] = useState(false);
  const [isSyncingXp, setIsSyncingXp] = useState(false);
  const [xpSynced, setXpSynced] = useState(false);
  const [playerXpProfile, setPlayerXpProfile] = useState(() => loadPlayerXP());

  const handleShareScore = async () => {
    soundManager.playClick();
    const gameUrl = typeof window !== 'undefined' ? window.location.href : 'https://lumina-prism.app';
    const currentScore = userScore > 0 ? userScore : (leaderboard[0]?.score || 0);
    const scoreText = `${currentScore.toLocaleString()} points`;
    const shareTitle = 'Lumina: Prism Puzzle Odyssey';
    const shareMessage = `💎 I scored ${scoreText} on today's Lumina Prism Daily Leaderboard (${dateStr})! Can you beat my high score? Play here:`;

    // 1. Check if Web Share API is available (iOS Safari, Android Chrome, etc.)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
          url: gameUrl,
        });
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(null), 3500);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // User dismissed share sheet
        }
        // Fallback to clipboard on error
      }
    }

    // 2. Clipboard copy fallback
    try {
      const payload = `${shareMessage} ${gameUrl}`;
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = payload;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setShareFeedback('Score & Link copied to clipboard!');
      setTimeout(() => setShareFeedback(null), 3500);
    } catch (_) {
      setShareFeedback('Copied to clipboard!');
      setTimeout(() => setShareFeedback(null), 3500);
    }
  };

  // Subscribe to Lifetime XP Leaderboard when modal is open
  useEffect(() => {
    if (!isOpen) return;
    setPlayerXpProfile(loadPlayerXP());
    setIsLifetimeLoading(true);

    const unsubscribe = subscribeToLifetimeXpLeaderboard((entries) => {
      setLifetimeEntries(entries);
      setIsLifetimeLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitDailyScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    localStorage.setItem('lumina_player_name', playerName.trim());
    const ok = await onSubmitScore(playerName.trim());
    setIsSubmitting(false);
    if (ok) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const handleSyncLifetimeXp = async () => {
    if (isSyncingXp) return;
    setIsSyncingXp(true);
    const currentName = playerName.trim() || 'PrismSeeker';
    localStorage.setItem('lumina_player_name', currentName);
    const profile = loadPlayerXP();
    setPlayerXpProfile(profile);

    const playerId = getOrCreatePlayerId();
    const ok = await syncPlayerLifetimeXP({
      playerId,
      playerName: currentName,
      totalXp: profile.totalLifetimeXp,
      level: profile.level,
      title: profile.title,
      missionsCompleted: profile.totalMissionsCompleted,
    });

    setIsSyncingXp(false);
    if (ok) {
      setXpSynced(true);
      setTimeout(() => setXpSynced(false), 3000);
      // Immediately refresh entries
      const updated = await fetchLifetimeXpLeaderboard();
      if (updated.length > 0) setLifetimeEntries(updated);
    }
  };

  const handleRefreshClick = async () => {
    if (activeTab === 'daily') {
      onRefresh();
    } else {
      setIsLifetimeLoading(true);
      const res = await fetchLifetimeXpLeaderboard();
      setLifetimeEntries(res);
      setPlayerXpProfile(loadPlayerXP());
      setIsLifetimeLoading(false);
    }
  };

  const rankIcons = [
    <Crown key="1" className="h-4 w-4 text-amber-400 fill-amber-400" />,
    <Medal key="2" className="h-4 w-4 text-slate-300" />,
    <Medal key="3" className="h-4 w-4 text-amber-600" />,
  ];

  const currentLoading = activeTab === 'daily' ? isLoading : isLifetimeLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-md max-h-[92vh] rounded-2xl border border-slate-800 bg-slate-900/95 p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                activeTab === 'daily'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
              }`}
            >
              {activeTab === 'daily' ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {activeTab === 'daily' ? 'Daily High Scores' : 'Lifetime XP Hall'}
              </h2>
              <span className="text-xs text-slate-400 font-mono-nums">
                {activeTab === 'daily'
                  ? `Date: ${dateStr}`
                  : 'Global Mission XP Leaderboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShareScore}
              title="Share Score & Game Link"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRefreshClick}
              title="Refresh from Firebase Firestore"
              disabled={currentLoading}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${currentLoading ? 'animate-spin text-indigo-400' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Daily Score vs Lifetime XP Leaderboard */}
        <div className="mt-3.5 mb-2.5 flex rounded-xl border border-slate-800 bg-slate-950/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Daily Score</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lifetime')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === 'lifetime'
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Lifetime XP Leaderboard</span>
          </button>
        </div>

        {/* Subtitle / Description */}
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          {activeTab === 'daily'
            ? 'Real-time global top 5 scores achieved today worldwide on Firestore.'
            : 'Total accumulated XP from all daily missions completed by players across Firestore.'}
        </p>

        {/* ===================== TAB 1: DAILY SCORE ===================== */}
        {activeTab === 'daily' && (
          <>
            <div className="flex flex-col gap-2 my-1 overflow-y-auto max-h-[44vh] pr-0.5">
              {isLoading && leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-xs gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                  <span>Querying Firebase Firestore...</span>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4">
                  <Trophy className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="text-sm font-semibold text-slate-300">
                    Be the First on the Board!
                  </span>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    No scores recorded yet today. Play a session and submit your score below.
                  </p>
                </div>
              ) : (
                leaderboard.slice(0, 5).map((entry, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <div
                      key={entry.id || idx}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                        idx === 0
                          ? 'border-amber-400/50 bg-amber-500/10 shadow-md shadow-amber-500/10'
                          : idx === 1
                          ? 'border-slate-700/80 bg-slate-800/40'
                          : idx === 2
                          ? 'border-amber-800/60 bg-amber-950/20'
                          : 'border-slate-800/80 bg-slate-950/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono-nums font-bold text-xs ${
                            idx === 0
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : isTop3
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {idx < 3 ? rankIcons[idx] : `#${idx + 1}`}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white tracking-wide">
                            {entry.playerName}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono-nums">
                            {entry.linesCleared !== undefined && (
                              <span>{entry.linesCleared} lines</span>
                            )}
                            {entry.maxCombo !== undefined && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>x{entry.maxCombo} combo</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="font-mono-nums text-lg font-extrabold text-amber-300">
                          {entry.score.toLocaleString()}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">
                          points
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Submit Current Score to Daily Leaderboard */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">Your Current Session:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono-nums font-bold text-white text-sm">
                    {userScore.toLocaleString()} pts
                  </span>
                  <button
                    type="button"
                    onClick={handleShareScore}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Share your score and invite friends via Web Share API or Clipboard"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Share Score</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitDailyScore} className="flex gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your player handle"
                  maxLength={24}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || userScore <= 0}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    submitted
                      ? 'bg-emerald-600 text-white'
                      : userScore > 0
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {submitted ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Posted!</span>
                    </>
                  ) : isSubmitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Post Score</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        {/* ===================== TAB 2: LIFETIME XP LEADERBOARD ===================== */}
        {activeTab === 'lifetime' && (
          <>
            <div className="flex flex-col gap-2 my-1 overflow-y-auto max-h-[44vh] pr-0.5">
              {isLifetimeLoading && lifetimeEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-xs gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                  <span>Querying Lifetime XP from Firestore...</span>
                </div>
              ) : lifetimeEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4">
                  <Sparkles className="h-8 w-8 text-indigo-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-300">
                    No XP Records Yet
                  </span>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Complete daily missions and click &quot;Sync My XP&quot; below to record your lifetime accumulated XP.
                  </p>
                </div>
              ) : (
                lifetimeEntries.map((entry, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <div
                      key={entry.id || entry.playerId || idx}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                        idx === 0
                          ? 'border-indigo-500/50 bg-indigo-500/10 shadow-md shadow-indigo-500/10'
                          : idx === 1
                          ? 'border-purple-500/40 bg-purple-950/20'
                          : idx === 2
                          ? 'border-slate-700/80 bg-slate-800/40'
                          : 'border-slate-800/80 bg-slate-950/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono-nums font-bold text-xs ${
                            idx === 0
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : isTop3
                              ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/50'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {idx < 3 ? rankIcons[idx] : `#${idx + 1}`}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white tracking-wide">
                              {entry.playerName}
                            </span>
                            <span className="rounded-md border border-indigo-500/30 bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-mono-nums font-bold text-indigo-300">
                              Lv.{entry.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono-nums">
                            <span className="text-slate-300 font-medium">
                              {entry.title || 'Prism Adept'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{entry.missionsCompleted || 0} missions</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 font-mono-nums text-lg font-extrabold text-indigo-300">
                          <Zap className="h-3.5 w-3.5 text-amber-400" />
                          <span>{(entry.totalXp || 0).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">
                          Lifetime XP
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Player's Own Lifetime XP Card & Sync to Leaderboard */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-2.5 mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold font-mono-nums text-xs">
                    Lv.{playerXpProfile.level}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">
                      {playerXpProfile.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-nums">
                      {playerXpProfile.totalMissionsCompleted} Missions Completed
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono-nums font-extrabold text-amber-300">
                    {(playerXpProfile.totalLifetimeXp || 0).toLocaleString()} XP
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">
                    Total Earned
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your player handle"
                  maxLength={24}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSyncLifetimeXp}
                  disabled={isSyncingXp}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    xpSynced
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-md shadow-indigo-500/20 cursor-pointer'
                  }`}
                >
                  {xpSynced ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Synced!</span>
                    </>
                  ) : isSyncingXp ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Sync My XP</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Global Share Feedback Toast */}
        {shareFeedback && (
          <div className="mt-2.5 flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/80 px-3.5 py-2 text-xs font-semibold text-indigo-200 animate-fade-in shadow-lg">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{shareFeedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
