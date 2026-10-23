/**
 * Streak Multiplier Engine & Visual Luminescence Helpers
 * Calculates gameplay score multipliers based on consecutive daily check-ins
 * and provides tiered crystal luminescence styles.
 */

export interface StreakTierInfo {
  tier: number; // 0 to 4
  title: string;
  subTitle: string;
  multiplier: number;
  bonusPercent: number;
  glowColorHex: string;
  containerClass: string;
  glowShadowClass: string;
  badgeBg: string;
  textColor: string;
  borderClass: string;
  nextTierStreak: number | null;
  daysToNextTier: number;
}

/**
 * Calculates the score multiplier for an active play session based on daily streak count.
 * Streak 0  -> 1.00x (+0%)
 * Streak 1  -> 1.05x (+5%)
 * Streak 2  -> 1.10x (+10%)
 * Streak 3  -> 1.15x (+15%)
 * Streak 4  -> 1.20x (+20%)
 * Streak 5  -> 1.25x (+25%)
 * Streak 6  -> 1.30x (+30%)
 * Streak 7  -> 1.35x (+35%)
 * Streak 8  -> 1.40x (+40%)
 * Streak 9  -> 1.45x (+45%)
 * Streak 10+ -> 1.50x (+50% MAX SURGE)
 */
export function getStreakMultiplier(streak: number): number {
  if (streak <= 0) return 1.0;
  const clampedStreak = Math.min(Math.max(streak, 0), 10);
  const bonus = clampedStreak * 0.05;
  return Number((1.0 + bonus).toFixed(2));
}

export function getStreakBonusPercent(streak: number): number {
  const mult = getStreakMultiplier(streak);
  return Math.round((mult - 1.0) * 100);
}

/**
 * Returns complete visual tier styling, radiance effects, and progression details.
 */
export function getStreakTierInfo(streak: number): StreakTierInfo {
  const multiplier = getStreakMultiplier(streak);
  const bonusPercent = getStreakBonusPercent(streak);

  if (streak <= 0) {
    return {
      tier: 0,
      title: 'Prism Spark',
      subTitle: 'Check in daily to ignite score multiplier',
      multiplier,
      bonusPercent,
      glowColorHex: '#64748b',
      containerClass: 'bg-slate-900/85 border-slate-800 text-slate-400',
      glowShadowClass: 'shadow-[0_0_10px_rgba(100,116,139,0.15)]',
      badgeBg: 'bg-slate-800/80 text-slate-400 border-slate-700',
      textColor: 'text-slate-400',
      borderClass: 'border-slate-800',
      nextTierStreak: 1,
      daysToNextTier: 1,
    };
  }

  if (streak <= 2) {
    return {
      tier: 1,
      title: 'Azure Flame',
      subTitle: 'Consecutive check-in spark (+5% to +10%)',
      multiplier,
      bonusPercent,
      glowColorHex: '#38bdf8',
      containerClass: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200',
      glowShadowClass: 'shadow-[0_0_14px_rgba(56,189,248,0.4)]',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
      textColor: 'text-cyan-300',
      borderClass: 'border-cyan-500/50',
      nextTierStreak: 3,
      daysToNextTier: 3 - streak,
    };
  }

  if (streak <= 4) {
    return {
      tier: 2,
      title: 'Solar Radiance',
      subTitle: 'Blazing daily momentum (+15% to +20%)',
      multiplier,
      bonusPercent,
      glowColorHex: '#f59e0b',
      containerClass: 'bg-amber-950/40 border-amber-500/50 text-amber-200',
      glowShadowClass: 'shadow-[0_0_18px_rgba(245,158,11,0.55)]',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/60',
      textColor: 'text-amber-300',
      borderClass: 'border-amber-400/60',
      nextTierStreak: 5,
      daysToNextTier: 5 - streak,
    };
  }

  if (streak <= 6) {
    return {
      tier: 3,
      title: 'Amethyst Blaze',
      subTitle: 'Electrified crystalline overdrive (+25% to +30%)',
      multiplier,
      bonusPercent,
      glowColorHex: '#c084fc',
      containerClass: 'bg-purple-950/50 border-purple-500/60 text-purple-200',
      glowShadowClass: 'shadow-[0_0_22px_rgba(192,132,252,0.65)]',
      badgeBg: 'bg-purple-500/25 text-purple-300 border-purple-400/70',
      textColor: 'text-purple-300',
      borderClass: 'border-purple-400/70',
      nextTierStreak: 7,
      daysToNextTier: 7 - streak,
    };
  }

  // Tier 4: Day 7+ Prismatic Supernova
  return {
    tier: 4,
    title: 'Prismatic Supernova',
    subTitle: 'Peak cosmic surge (+35% to +50% MAX)',
    multiplier,
    bonusPercent,
    glowColorHex: '#ec4899',
    containerClass: 'bg-gradient-to-r from-rose-950/50 via-purple-950/50 to-indigo-950/50 border-pink-500/70 text-pink-200',
    glowShadowClass: 'shadow-[0_0_28px_rgba(236,72,153,0.7),0_0_14px_rgba(99,102,241,0.5)]',
    badgeBg: 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-200 border-pink-400/80',
    textColor: 'text-pink-300',
    borderClass: 'border-pink-500/70',
    nextTierStreak: streak < 10 ? streak + 1 : null,
    daysToNextTier: streak < 10 ? 1 : 0,
  };
}
