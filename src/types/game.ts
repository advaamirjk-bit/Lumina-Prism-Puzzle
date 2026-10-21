export type GameMode =
  | 'CLASSIC_ENDLESS'
  | 'LEVEL_QUEST'
  | 'TIME_ATTACK'
  | 'DAILY_CHALLENGE'
  | 'MULTIPLAYER_DUEL';

export type GemType =
  | 'ruby'
  | 'sapphire'
  | 'emerald'
  | 'amethyst'
  | 'amber'
  | 'diamond'
  | 'rose';

export type SpecialCellType = 'frozen' | 'stone' | 'normal';

export interface Cell {
  gemType: GemType | null;
  special?: SpecialCellType;
  frozenHits?: number; // 1 or 2 hits to break
  isClearing?: boolean;
  clearTimestamp?: number;
  highlighted?: boolean;
  decayTurns?: number; // Turns remaining before outer edge crystal petrifies to stone
  decayMaxTurns?: number; // Initial decay threshold (scales with endless score)
  isDecaying?: boolean; // Whether active decay countdown is happening
}

export type Grid = Cell[][]; // 9x9

export interface Piece {
  id: string;
  shape: number[][]; // e.g. [[1,1],[1,1]]
  gemType: GemType;
  name: string;
}

export interface FloatingScore {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  isCombo?: boolean;
}

export interface QuestObjective {
  targetScore?: number;
  targetLines?: number;
  targetCombos?: number;
  collectGems?: { type: GemType; count: number; current: number }[];
  clearFrozen?: number;
  maxMoves?: number;
}

export interface QuestLevel {
  id: number;
  title: string;
  description: string;
  objective: QuestObjective;
  starThresholds: [number, number, number]; // score for 1, 2, 3 stars
  initialBoard?: {
    r: number;
    c: number;
    gemType?: GemType | null;
    special?: SpecialCellType;
    frozenHits?: number;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface GameStats {
  gamesPlayed: number;
  highScoreClassic: number;
  highScoreBlitz: number;
  totalLinesCleared: number;
  maxCombo: number;
  levelsCompleted: number;
  totalStars: number;
  dailyStreak: number;
  lastDailyDate?: string;
}

export type PowerUpType = 'hammer' | 'bomb' | 'reroll' | 'rotate';

export type CrystalThemeId = 'default' | 'cosmic_night' | 'ocean_deep' | 'volcanic';

export interface CrystalThemeConfig {
  id: CrystalThemeId;
  name: string;
  tagline: string;
  backdropImage: string;
  gradientOverlay: string;
  accentColor: string;
  primaryGlow: string;
  badgeClass: string;
}

export interface DailyRewardItem {
  day: number;
  label: string;
  hammers: number;
  rerolls: number;
  bonusPoints?: number;
}
