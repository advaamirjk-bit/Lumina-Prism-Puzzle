import { DailyMission, MissionType, PlayerProfileXP } from '../types/missions';
import { GemType, PowerUpType } from '../types/game';
import { getTodayDateString } from './storage';
import { syncPlayerLifetimeXP } from '../firebase/firebaseConfig';

const MISSIONS_STORAGE_KEY = 'lumina_daily_missions_v2';
const PLAYER_XP_STORAGE_KEY = 'lumina_player_xp_v2';

// Level title ladder
const LEVEL_TITLES = [
  'Prism Initiate',
  'Crystal Novice',
  'Lumina Adept',
  'Astral Weaver',
  'Starlight Master',
  'Cosmic Architect',
  'Eternal Sovereign',
];

export function calculateXpForLevel(level: number): number {
  return 300 + (level - 1) * 250;
}

export function computeCumulativeXpForLevel(level: number): number {
  let sum = 0;
  for (let i = 1; i < level; i++) {
    sum += calculateXpForLevel(i);
  }
  return sum;
}

export function getLevelTitle(level: number): string {
  const index = Math.min(level - 1, LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[Math.max(0, index)];
}

export function getOrCreatePlayerId(): string {
  let id = localStorage.getItem('lumina_player_uid');
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('lumina_player_uid', id);
  }
  return id;
}

export function loadPlayerXP(): PlayerProfileXP {
  try {
    const raw = localStorage.getItem(PLAYER_XP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const level = parsed.level || 1;
      const currentXp = parsed.currentXp || 0;
      const nextLevelXp = parsed.nextLevelXp || calculateXpForLevel(level);
      const totalLifetimeXp =
        typeof parsed.totalLifetimeXp === 'number'
          ? parsed.totalLifetimeXp
          : computeCumulativeXpForLevel(level) + currentXp;

      return {
        level,
        currentXp,
        nextLevelXp,
        totalLifetimeXp,
        title: parsed.title || getLevelTitle(level),
        totalMissionsCompleted: parsed.totalMissionsCompleted || 0,
      };
    }
  } catch (e) {
    console.error('Failed to load player XP', e);
  }

  return {
    level: 1,
    currentXp: 0,
    nextLevelXp: calculateXpForLevel(1),
    totalLifetimeXp: 0,
    title: getLevelTitle(1),
    totalMissionsCompleted: 0,
  };
}

export function savePlayerXP(profile: PlayerProfileXP): void {
  try {
    localStorage.setItem(PLAYER_XP_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save player XP', e);
  }
}

export function addPlayerXP(amount: number): {
  profile: PlayerProfileXP;
  leveledUp: boolean;
  newLevel: number;
} {
  const profile = loadPlayerXP();
  let xp = profile.currentXp + amount;
  let lvl = profile.level;
  let req = profile.nextLevelXp;
  let leveledUp = false;

  while (xp >= req) {
    xp -= req;
    lvl += 1;
    req = calculateXpForLevel(lvl);
    leveledUp = true;
  }

  const updated: PlayerProfileXP = {
    level: lvl,
    currentXp: xp,
    nextLevelXp: req,
    totalLifetimeXp: (profile.totalLifetimeXp || 0) + amount,
    title: getLevelTitle(lvl),
    totalMissionsCompleted: profile.totalMissionsCompleted + 1,
  };

  savePlayerXP(updated);
  return { profile: updated, leveledUp, newLevel: lvl };
}

/**
 * Deduct available XP to purchase items like Streak Shield without diminishing totalLifetimeXp
 */
export function spendPlayerXP(amount: number): {
  success: boolean;
  profile: PlayerProfileXP;
  error?: string;
} {
  const profile = loadPlayerXP();
  if (profile.currentXp < amount) {
    return {
      success: false,
      profile,
      error: `Need ${amount} XP, but only have ${profile.currentXp} XP available`,
    };
  }

  const updated: PlayerProfileXP = {
    ...profile,
    currentXp: profile.currentXp - amount,
  };

  savePlayerXP(updated);
  return {
    success: true,
    profile: updated,
  };
}

/**
 * Generate fresh missions list for a specific date
 */
export function generateDailyMissions(dateStr: string): DailyMission[] {
  // Simple deterministic hash based on date string
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) & 0xffffffff;
  }

  // 4 curated daily missions with dynamic targets
  const missions: DailyMission[] = [
    {
      id: `m1_${dateStr}`,
      type: 'clear_ruby',
      title: 'Ruby Radiance',
      description: 'Clear 5 Ruby gems from the 9x9 lattice',
      current: 0,
      target: 5,
      rewardXp: 150,
      rewardPowerUp: 'hammer',
      rewardPowerUpCount: 1,
      isCompleted: false,
      isClaimed: false,
      accentColor: '#f43f5e',
      gemType: 'ruby',
    },
    {
      id: `m2_${dateStr}`,
      type: 'combo',
      title: 'Harmonic Resonance',
      description: 'Achieve a 3x combo or higher',
      current: 0,
      target: 3,
      rewardXp: 200,
      rewardPowerUp: 'reroll',
      rewardPowerUpCount: 1,
      isCompleted: false,
      isClaimed: false,
      accentColor: '#8b5cf6',
    },
    {
      id: `m3_${dateStr}`,
      type: 'cascade',
      title: 'Prism Cascade',
      description: 'Trigger a double cascade (clear 2+ lines or zones at once)',
      current: 0,
      target: 2,
      rewardXp: 250,
      rewardPowerUp: 'hammer',
      rewardPowerUpCount: 1,
      accentColor: '#f59e0b',
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: `m4_${dateStr}`,
      type: 'score',
      title: 'Lattice High Flyer',
      description: 'Reach 2,500 score points in a session',
      current: 0,
      target: 2500,
      rewardXp: 300,
      rewardPowerUp: 'reroll',
      rewardPowerUpCount: 2,
      accentColor: '#06b6d4',
      isCompleted: false,
      isClaimed: false,
    },
  ];

  return missions;
}

export function loadDailyMissions(dateStr: string = getTodayDateString()): DailyMission[] {
  try {
    const raw = localStorage.getItem(`${MISSIONS_STORAGE_KEY}_${dateStr}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load daily missions', e);
  }

  // Initialize fresh missions
  const fresh = generateDailyMissions(dateStr);
  saveDailyMissions(fresh, dateStr);
  return fresh;
}

export function saveDailyMissions(
  missions: DailyMission[],
  dateStr: string = getTodayDateString()
): void {
  try {
    localStorage.setItem(`${MISSIONS_STORAGE_KEY}_${dateStr}`, JSON.stringify(missions));
  } catch (e) {
    console.error('Failed to save daily missions', e);
  }
}

export interface MissionUpdateEvent {
  gemClears?: Record<GemType | string, number>;
  combo?: number;
  totalLinesAndBoxes?: number;
  sessionScore?: number;
}

/**
 * Update mission progress based on turn gameplay events
 */
export function processMissionProgress(
  missions: DailyMission[],
  event: MissionUpdateEvent
): { updatedMissions: DailyMission[]; newlyCompleted: DailyMission[] } {
  const newlyCompleted: DailyMission[] = [];

  const updatedMissions = missions.map((mission) => {
    if (mission.isCompleted) return mission;

    let nextCurrent = mission.current;

    switch (mission.type) {
      case 'clear_ruby':
        if (event.gemClears && event.gemClears['ruby']) {
          nextCurrent += event.gemClears['ruby'];
        }
        break;

      case 'clear_sapphire':
        if (event.gemClears && event.gemClears['sapphire']) {
          nextCurrent += event.gemClears['sapphire'];
        }
        break;

      case 'combo':
        if (event.combo && event.combo >= mission.target) {
          nextCurrent = Math.max(nextCurrent, event.combo);
        }
        break;

      case 'cascade':
        if (event.totalLinesAndBoxes && event.totalLinesAndBoxes >= mission.target) {
          nextCurrent = Math.max(nextCurrent, event.totalLinesAndBoxes);
        }
        break;

      case 'score':
        if (event.sessionScore && event.sessionScore > nextCurrent) {
          nextCurrent = event.sessionScore;
        }
        break;

      case 'clear_lines':
        if (event.totalLinesAndBoxes) {
          nextCurrent += event.totalLinesAndBoxes;
        }
        break;
    }

    const completed = nextCurrent >= mission.target;
    if (completed && !mission.isCompleted) {
      newlyCompleted.push({
        ...mission,
        current: nextCurrent,
        isCompleted: true,
      });
    }

    return {
      ...mission,
      current: nextCurrent,
      isCompleted: completed,
    };
  });

  return { updatedMissions, newlyCompleted };
}

/**
 * Claim a completed mission's reward
 */
export function claimDailyMissionReward(
  missions: DailyMission[],
  missionId: string,
  dateStr: string = getTodayDateString()
): {
  updatedMissions: DailyMission[];
  claimedMission: DailyMission | null;
  xpAwarded: number;
  powerUpAwarded: { type: PowerUpType; count: number } | null;
} {
  let claimedMission: DailyMission | null = null;
  let xpAwarded = 0;
  let powerUpAwarded: { type: PowerUpType; count: number } | null = null;

  const updatedMissions = missions.map((m) => {
    if (m.id === missionId && m.isCompleted && !m.isClaimed) {
      claimedMission = m;
      xpAwarded = m.rewardXp;
      powerUpAwarded = { type: m.rewardPowerUp, count: m.rewardPowerUpCount };
      return { ...m, isClaimed: true };
    }
    return m;
  });

  if (claimedMission) {
    saveDailyMissions(updatedMissions, dateStr);
    const { profile } = addPlayerXP(xpAwarded);
    try {
      const playerName = localStorage.getItem('lumina_player_name') || 'PrismSeeker';
      const playerId = getOrCreatePlayerId();
      syncPlayerLifetimeXP({
        playerId,
        playerName,
        totalXp: profile.totalLifetimeXp,
        level: profile.level,
        title: profile.title,
        missionsCompleted: profile.totalMissionsCompleted,
      }).catch((e) => console.warn('Background XP sync warning:', e));
    } catch {
      // fallback
    }
  }

  return { updatedMissions, claimedMission, xpAwarded, powerUpAwarded };
}
