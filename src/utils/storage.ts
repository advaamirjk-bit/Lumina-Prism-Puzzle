import { Achievement, CrystalThemeId, GameStats } from '../types/game';
import { DAILY_REWARDS_SCHEDULE } from './themeConfig';

const STATS_KEY = 'lumina_game_stats_v1';
const STARS_KEY = 'lumina_level_stars_v1';
const ACHIEVEMENTS_KEY = 'lumina_achievements_v1';
const SETTINGS_KEY = 'lumina_settings_v1';
const DAILY_REWARDS_KEY = 'lumina_daily_rewards_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_clear',
    title: 'First Sparks',
    description: 'Clear your first row, column, or 3x3 square zone',
    icon: '✦',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'double_cascade',
    title: 'Prism Cascade',
    description: 'Clear 2 or more lines/zones simultaneously in a single drop',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'triple_cascade',
    title: 'Hyper Harmonic',
    description: 'Clear 3 or more lines/zones at once',
    icon: '☄',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'combo_streak_3',
    title: 'Flow State',
    description: 'Reach a consecutive turn Combo multiplier of x3 or higher',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'combo_streak_5',
    title: 'Combo Deity',
    description: 'Reach a legendary x5 Combo streak',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'frenzy_igniter',
    title: 'Frenzy Reactor',
    description: 'Fill the Frenzy Core to 100% and activate Frenzy Rush',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'score_5000',
    title: 'High Adept',
    description: 'Score 5,000 points in a single Endless game',
    icon: '💠',
    unlocked: false,
    progress: 0,
    maxProgress: 5000,
  },
  {
    id: 'score_15000',
    title: 'Grand Luminary',
    description: 'Surpass 15,000 points in Endless mode',
    icon: '💎',
    unlocked: false,
    progress: 0,
    maxProgress: 15000,
  },
  {
    id: 'lines_100',
    title: 'Lattice Architect',
    description: 'Clear 100 total lines across all game sessions',
    icon: '📐',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'quest_star_12',
    title: 'Constellation Seeker',
    description: 'Earn 12 total stars in Level Quest mode',
    icon: '★',
    unlocked: false,
    progress: 0,
    maxProgress: 12,
  },
  {
    id: 'daily_champion',
    title: 'Daily Devotee',
    description: 'Complete a Daily Challenge puzzle',
    icon: '📅',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'frost_breaker',
    title: 'Absolute Zero',
    description: 'Shatter 20 frozen crystal cells in Quest mode',
    icon: '❄',
    unlocked: false,
    progress: 0,
    maxProgress: 20,
  },
];

export type VibrationIntensity = 'low' | 'medium' | 'high';

export interface UserSettings {
  muted: boolean;
  sfxEnabled: boolean;
  sfxVolume: number; // 0.0 to 1.0
  bgm: boolean;
  bgmVolume: number; // 0.0 to 1.0
  screenShake: boolean;
  colorblindSymbols: boolean;
  crystalTheme: CrystalThemeId;
  playerName?: string;
  vibrationIntensity: VibrationIntensity;
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        muted: false,
        sfxEnabled: true,
        sfxVolume: 0.8,
        bgm: false,
        bgmVolume: 0.5,
        screenShake: true,
        colorblindSymbols: false,
        crystalTheme: 'default',
        vibrationIntensity: 'high',
        playerName: localStorage.getItem('lumina_player_name') || 'PrismSeeker',
        ...parsed,
      };
    }
  } catch {
    // fallback
  }
  return {
    muted: false,
    sfxEnabled: true,
    sfxVolume: 0.8,
    bgm: false,
    bgmVolume: 0.5,
    screenShake: true,
    colorblindSymbols: false,
    crystalTheme: 'default',
    vibrationIntensity: 'high',
    playerName: localStorage.getItem('lumina_player_name') || 'PrismSeeker',
  };
}

export function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    gamesPlayed: 0,
    highScoreClassic: 0,
    highScoreBlitz: 0,
    totalLinesCleared: 0,
    maxCombo: 0,
    levelsCompleted: 0,
    totalStars: 0,
    dailyStreak: 0,
  };
}

export function saveGameStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function loadLevelStars(): Record<number, number> {
  try {
    const raw = localStorage.getItem(STARS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function saveLevelStars(stars: Record<number, number>) {
  try {
    localStorage.setItem(STARS_KEY, JSON.stringify(stars));
  } catch {
    // ignore
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (raw) {
      const saved: Achievement[] = JSON.parse(raw);
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = saved.find(s => s.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    }
  } catch {
    // fallback
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveAchievements(achievements: Achievement[]) {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch {
    // ignore
  }
}

export interface DailyRewardState {
  currentStreak: number;
  lastClaimDate: string | null;
  totalClaimsCount: number;
}

export function loadDailyRewardState(): DailyRewardState {
  try {
    const raw = localStorage.getItem(DAILY_REWARDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    currentStreak: 0,
    lastClaimDate: null,
    totalClaimsCount: 0,
  };
}

export function saveDailyRewardState(state: DailyRewardState) {
  try {
    localStorage.setItem(DAILY_REWARDS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// Helpers for calculating current calendar day string YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ====================================================================
   STREAK SHIELD POWER-UP STORAGE & CONSUMPTION
   ==================================================================== */

const STREAK_SHIELDS_KEY = 'lumina_streak_shields_v1';

export function loadStreakShields(): number {
  try {
    const raw = localStorage.getItem(STREAK_SHIELDS_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch {
    // fallback
  }
  return 1; // 1 free starter Streak Shield for every player
}

export function saveStreakShields(count: number): void {
  try {
    localStorage.setItem(STREAK_SHIELDS_KEY, Math.max(0, Math.floor(count)).toString());
  } catch {
    // fallback
  }
}

export function checkDailyRewardStatus(): {
  canClaim: boolean;
  currentStreak: number;
  nextDayInCycle: number;
  isStreakActive: boolean;
  lastClaimDate: string | null;
  shieldSavedStreak: boolean;
  streakShields: number;
} {
  const state = loadDailyRewardState();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const currentShields = loadStreakShields();
  let shieldSavedStreak = false;

  if (state.lastClaimDate === today) {
    // Already claimed today!
    const dayInCycle = ((state.currentStreak - 1) % 7) + 1;
    return {
      canClaim: false,
      currentStreak: state.currentStreak,
      nextDayInCycle: dayInCycle,
      isStreakActive: true,
      lastClaimDate: state.lastClaimDate,
      shieldSavedStreak: false,
      streakShields: currentShields,
    };
  }

  // Not claimed today yet
  let streak = state.currentStreak;
  if (state.lastClaimDate === yesterday) {
    // Consecutive day! Streak continues
  } else if (!state.lastClaimDate) {
    // Brand new player, starting at 0
    streak = 0;
  } else {
    // Missed a day! Check if Streak Shield can protect against reset
    const lastDate = new Date(state.lastClaimDate);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 2 && currentShields > 0 && streak > 0) {
      // Consume 1 Streak Shield and preserve the daily streak
      saveStreakShields(currentShields - 1);
      shieldSavedStreak = true;
    } else {
      // Missed more than 1 day or no shield available
      streak = 0;
    }
  }

  const nextDay = (streak % 7) + 1;

  return {
    canClaim: true,
    currentStreak: streak,
    nextDayInCycle: nextDay,
    isStreakActive: streak > 0,
    lastClaimDate: state.lastClaimDate,
    shieldSavedStreak,
    streakShields: loadStreakShields(),
  };
}

/* ====================================================================
   DAILY LOGIN & PLAY ACTIVITY HISTORY (7-DAY STREAK TRACKING)
   ==================================================================== */

const ACTIVITY_HISTORY_KEY = 'lumina_activity_history_v1';

export interface DailyActivityRecord {
  date: string;
  loggedIn: boolean;
  played: boolean;
  claimed: boolean;
}

export function loadActivityHistory(): Record<string, DailyActivityRecord> {
  try {
    const raw = localStorage.getItem(ACTIVITY_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {};
}

export function recordDailyActivity(action: 'login' | 'play' | 'claim'): void {
  try {
    const today = getTodayDateString();
    const history = loadActivityHistory();
    const existing = history[today] || {
      date: today,
      loggedIn: false,
      played: false,
      claimed: false,
    };

    if (action === 'login') existing.loggedIn = true;
    if (action === 'play') {
      existing.played = true;
      existing.loggedIn = true;
    }
    if (action === 'claim') {
      existing.claimed = true;
      existing.loggedIn = true;
    }

    history[today] = existing;
    localStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export interface DayStreakHistoryItem {
  dateStr: string;
  dayLabel: string;
  dayOfMonth: string;
  isToday: boolean;
  played: boolean;
  loggedIn: boolean;
  claimed: boolean;
  progress: number;
  statusText: string;
}

/**
 * Returns the 7-day streak history window ending today
 */
export function getSevenDayStreakHistory(currentStreak: number, isTodayClaimed: boolean): DayStreakHistoryItem[] {
  const history = loadActivityHistory();
  const todayStr = getTodayDateString();
  const items: DayStreakHistoryItem[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayLabel = dayNames[d.getDay()];
    const dayOfMonth = `${d.getMonth() + 1}/${d.getDate()}`;
    const isToday = i === 0;

    const record = history[dateStr];
    // Fallback based on streak continuity:
    // If within currentStreak days prior to today, they logged in and played!
    const withinStreakWindow = i < currentStreak || (isToday && (currentStreak > 0 || isTodayClaimed));

    const loggedIn = Boolean(record?.loggedIn || (isToday ? true : withinStreakWindow));
    const played = Boolean(record?.played || (isToday ? record?.played : withinStreakWindow));
    const claimed = Boolean(record?.claimed || (isToday ? isTodayClaimed : withinStreakWindow));

    let progress = 10;
    let statusText = 'Inactive';

    if (claimed && played) {
      progress = 100;
      statusText = isToday ? 'Harvested & Played' : 'Played & Claimed';
    } else if (played) {
      progress = 85;
      statusText = 'Played Today';
    } else if (claimed) {
      progress = 80;
      statusText = 'Reward Claimed';
    } else if (loggedIn) {
      progress = 55;
      statusText = 'Logged In';
    } else if (isToday) {
      progress = 40;
      statusText = 'Active Today';
    }

    items.push({
      dateStr,
      dayLabel,
      dayOfMonth,
      isToday,
      played,
      loggedIn,
      claimed,
      progress,
      statusText,
    });
  }

  return items;
}

/* ====================================================================
   30-DAY ACTIVITY TREND & STREAK GROWTH DATA GENERATOR
   ==================================================================== */

export interface ThirtyDayStreakGrowthItem {
  dateStr: string;
  dayIndex: number; // 1 to 30
  dateLabel: string; // "10/18"
  dayName: string; // "Mon"
  isToday: boolean;
  streak: number; // cumulative streak progression
  activityScore: number; // 0 to 100 for Recharts curve
  status: 'harvested' | 'played' | 'login' | 'missed' | 'today';
  statusText: string;
  xpBonus: number;
}

/**
 * Computes 30-day streak growth trend and activity curve for Recharts visualization
 */
export function getThirtyDayStreakHistory(
  currentStreak: number,
  isTodayClaimed: boolean
): ThirtyDayStreakGrowthItem[] {
  const history = loadActivityHistory();
  const items: ThirtyDayStreakGrowthItem[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = dayNames[d.getDay()];
    const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    const isToday = i === 0;

    const record = history[dateStr];
    const withinStreakWindow = i < currentStreak || (isToday && (currentStreak > 0 || isTodayClaimed));

    const loggedIn = Boolean(record?.loggedIn || (isToday ? true : withinStreakWindow));
    const played = Boolean(record?.played || (isToday ? record?.played : withinStreakWindow));
    const claimed = Boolean(record?.claimed || (isToday ? isTodayClaimed : withinStreakWindow));

    let status: ThirtyDayStreakGrowthItem['status'] = 'missed';
    let activityScore = 15;
    let statusText = 'Rest Day';

    if (claimed && played) {
      status = 'harvested';
      activityScore = 100;
      statusText = isToday ? 'Harvested & Played' : 'Harvested & Played';
    } else if (played) {
      status = 'played';
      activityScore = 80;
      statusText = 'Session Played';
    } else if (claimed) {
      status = 'harvested';
      activityScore = 75;
      statusText = 'Daily Bounty Claimed';
    } else if (loggedIn) {
      status = 'login';
      activityScore = 50;
      statusText = 'Check-in Login';
    } else if (isToday) {
      status = 'today';
      activityScore = 40;
      statusText = 'Active Today';
    }

    // Dynamic streak calculation: climbs up naturally to currentStreak
    let dayStreak = 0;
    if (i < currentStreak) {
      dayStreak = currentStreak - i;
    } else if (isToday && (currentStreak > 0 || isTodayClaimed)) {
      dayStreak = currentStreak;
    } else if (activityScore >= 50) {
      // Historical engagement
      dayStreak = Math.min(currentStreak, Math.max(1, 30 - i));
    }

    const xpBonus = 50 + dayStreak * 25;

    items.push({
      dateStr,
      dayIndex: 30 - i,
      dateLabel,
      dayName,
      isToday,
      streak: dayStreak,
      activityScore,
      status,
      statusText,
      xpBonus,
    });
  }

  return items;
}
