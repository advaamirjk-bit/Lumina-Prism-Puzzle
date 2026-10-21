export interface GlobalRankTier {
  id: string;
  name: string;
  minXp: number;
  maxXp: number;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  glowClass: string;
  symbol: string;
  nextTierName?: string;
  tagline: string;
}

export const GLOBAL_RANK_TIERS: GlobalRankTier[] = [
  {
    id: 'novice',
    name: 'Novice',
    minXp: 0,
    maxXp: 499,
    badgeBg: 'bg-slate-800/90',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-700',
    glowClass: 'shadow-slate-500/10',
    symbol: '✦',
    nextTierName: 'Prism Adept',
    tagline: 'Beginning the Prismatic Journey',
  },
  {
    id: 'prism_adept',
    name: 'Prism Adept',
    minXp: 500,
    maxXp: 1999,
    badgeBg: 'bg-cyan-950/70',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-500/50',
    glowClass: 'shadow-cyan-500/20 ring-1 ring-cyan-500/30',
    symbol: '◆',
    nextTierName: 'Crystal Master',
    tagline: 'Mastering Geometric Lattice Alignments',
  },
  {
    id: 'crystal_master',
    name: 'Crystal Master',
    minXp: 2000,
    maxXp: 4999,
    badgeBg: 'bg-purple-950/70',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500/50',
    glowClass: 'shadow-purple-500/20 ring-1 ring-purple-500/30',
    symbol: '★',
    nextTierName: 'Astral Paragon',
    tagline: 'Commander of Cascading Light',
  },
  {
    id: 'astral_paragon',
    name: 'Astral Paragon',
    minXp: 5000,
    maxXp: 9999,
    badgeBg: 'bg-amber-950/70',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/60',
    glowClass: 'shadow-amber-500/30 ring-1 ring-amber-400/40',
    symbol: '✪',
    nextTierName: 'Lumina Legend',
    tagline: 'Transcendent Sovereign of Prisms',
  },
  {
    id: 'lumina_legend',
    name: 'Lumina Legend',
    minXp: 10000,
    maxXp: Infinity,
    badgeBg: 'bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-amber-950/80',
    textColor: 'text-rose-300',
    borderColor: 'border-rose-400/70',
    glowClass: 'shadow-rose-500/40 ring-1 ring-rose-400/60 animate-pulse',
    symbol: '👑',
    tagline: 'Immortal Lumina Luminary',
  },
];

/**
 * Returns the Player Global Rank Tier corresponding to total lifetime XP
 */
export function getPlayerGlobalRank(totalLifetimeXp: number): {
  tier: GlobalRankTier;
  progressPercent: number;
  xpToNextTier: number;
} {
  const xp = Math.max(0, totalLifetimeXp || 0);

  for (let i = GLOBAL_RANK_TIERS.length - 1; i >= 0; i--) {
    const tier = GLOBAL_RANK_TIERS[i];
    if (xp >= tier.minXp) {
      if (tier.maxXp === Infinity) {
        return { tier, progressPercent: 100, xpToNextTier: 0 };
      }
      const span = tier.maxXp - tier.minXp + 1;
      const progressInTier = xp - tier.minXp;
      const progressPercent = Math.min(100, Math.max(0, Math.round((progressInTier / span) * 100)));
      const xpToNextTier = Math.max(0, tier.maxXp + 1 - xp);
      return { tier, progressPercent, xpToNextTier };
    }
  }

  const defaultTier = GLOBAL_RANK_TIERS[0];
  return { tier: defaultTier, progressPercent: 0, xpToNextTier: defaultTier.maxXp + 1 };
}
