import { GemType, PowerUpType } from './game';

export type MissionType =
  | 'clear_ruby'
  | 'clear_sapphire'
  | 'clear_emerald'
  | 'clear_amethyst'
  | 'combo'
  | 'cascade'
  | 'score'
  | 'clear_lines';

export interface DailyMission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardXp: number;
  rewardPowerUp: PowerUpType;
  rewardPowerUpCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  accentColor: string;
  gemType?: GemType;
}

export interface PlayerProfileXP {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalLifetimeXp: number;
  title: string;
  totalMissionsCompleted: number;
}
