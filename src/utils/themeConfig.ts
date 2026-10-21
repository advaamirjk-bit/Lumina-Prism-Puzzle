import { CrystalThemeConfig, CrystalThemeId, DailyRewardItem } from '../types/game';

export const CRYSTAL_THEMES: Record<CrystalThemeId, CrystalThemeConfig> = {
  default: {
    id: 'default',
    name: 'Prism Twilight',
    tagline: 'Deep astral obsidian and ethereal violet starlight',
    backdropImage: '/src/assets/images/game_gem_backdrop_1792428079106.jpg',
    gradientOverlay:
      'radial-gradient(ellipse at 50% 0%, rgba(30, 27, 75, 0.72) 0%, rgba(6, 8, 20, 0.98) 75%)',
    accentColor: '#818cf8',
    primaryGlow: 'rgba(99, 102, 241, 0.25)',
    badgeClass: 'from-indigo-600 to-purple-600',
  },
  cosmic_night: {
    id: 'cosmic_night',
    name: 'Cosmic Night',
    tagline: 'Midnight constellations, galactic nebulae, and royal amethyst',
    backdropImage: '/src/assets/images/theme_cosmic_night_1792428783147.jpg',
    gradientOverlay:
      'radial-gradient(ellipse at 50% 0%, rgba(46, 16, 101, 0.75) 0%, rgba(3, 7, 18, 0.98) 75%)',
    accentColor: '#c084fc',
    primaryGlow: 'rgba(168, 85, 247, 0.25)',
    badgeClass: 'from-purple-600 to-fuchsia-600',
  },
  ocean_deep: {
    id: 'ocean_deep',
    name: 'Ocean Deep',
    tagline: 'Bioluminescent reef crystals, sapphire trenches, and cyan caustics',
    backdropImage: '/src/assets/images/theme_ocean_deep_1792428784160.jpg',
    gradientOverlay:
      'radial-gradient(ellipse at 50% 0%, rgba(8, 51, 68, 0.78) 0%, rgba(2, 6, 23, 0.98) 75%)',
    accentColor: '#38bdf8',
    primaryGlow: 'rgba(56, 189, 248, 0.25)',
    badgeClass: 'from-cyan-600 to-blue-600',
  },
  volcanic: {
    id: 'volcanic',
    name: 'Volcanic',
    tagline: 'Molten magma cracks, fiery ruby geodes, and incandescent embers',
    backdropImage: '/src/assets/images/theme_volcanic_1792428784651.jpg',
    gradientOverlay:
      'radial-gradient(ellipse at 50% 0%, rgba(69, 10, 10, 0.8) 0%, rgba(12, 10, 9, 0.98) 75%)',
    accentColor: '#f97316',
    primaryGlow: 'rgba(249, 115, 22, 0.25)',
    badgeClass: 'from-amber-600 to-rose-600',
  },
};

export const DAILY_REWARDS_SCHEDULE: DailyRewardItem[] = [
  {
    day: 1,
    label: 'Novice Crystal Spark',
    hammers: 1,
    rerolls: 1,
  },
  {
    day: 2,
    label: 'Prism Duet',
    hammers: 1,
    rerolls: 2,
  },
  {
    day: 3,
    label: 'Crystalline Cache',
    hammers: 2,
    rerolls: 2,
  },
  {
    day: 4,
    label: 'Obsidian Smasher',
    hammers: 3,
    rerolls: 1,
  },
  {
    day: 5,
    label: 'Prism Weaver',
    hammers: 2,
    rerolls: 3,
  },
  {
    day: 6,
    label: 'Astral Reservoir',
    hammers: 3,
    rerolls: 3,
  },
  {
    day: 7,
    label: 'Celestial Sovereign Treasury',
    hammers: 5,
    rerolls: 5,
    bonusPoints: 1500,
  },
];
