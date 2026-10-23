import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameMode,
  Grid,
  Piece,
  FloatingScore,
  PowerUpType,
  QuestLevel,
} from './types/game';
import {
  createEmptyGrid,
  generatePieceTrio,
  canPlacePiece,
  canPlacePieceAnywhere,
  findClearedMatches,
  rotatePiece,
  GEM_META,
} from './utils/puzzleBlocks';
import { QUEST_LEVELS } from './utils/questLevels';
import {
  processCrystalDecayOnMove,
  getDecayThresholdForScore,
  getDecayingCellsSummary,
} from './utils/crystalDecay';
import {
  loadGameStats,
  saveGameStats,
  loadLevelStars,
  saveLevelStars,
  loadAchievements,
  saveAchievements,
  loadSettings,
  saveSettings,
  UserSettings,
  checkDailyRewardStatus,
  saveDailyRewardState,
  getTodayDateString,
  recordDailyActivity,
} from './utils/storage';
import {
  testConnection,
  fetchDailyTopScores,
  subscribeToDailyTopScores,
  submitDailyScore,
  LeaderboardEntry,
  MultiplayerRoom,
  subscribeToMultiplayerRoom,
  updateMultiplayerRoomState,
} from './firebase/firebaseConfig';
import { CRYSTAL_THEMES, DAILY_REWARDS_SCHEDULE } from './utils/themeConfig';
import { soundManager } from './audio/soundManager';
import { ParticleCanvas, ParticleCanvasRef } from './components/ParticleCanvas';
import { GameBoard } from './components/GameBoard';
import { PieceDock } from './components/PieceDock';
import { GameHUD } from './components/GameHUD';
import { TopBar } from './components/TopBar';
import { GameOverModal } from './components/modals/GameOverModal';
import { LevelSelectModal } from './components/modals/LevelSelectModal';
import { AchievementsModal } from './components/modals/AchievementsModal';
import { HowToPlayModal } from './components/modals/HowToPlayModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { DailyRewardModal } from './components/modals/DailyRewardModal';
import { DailyLeaderboardModal } from './components/modals/DailyLeaderboardModal';
import { DailyChatModal } from './components/modals/DailyChatModal';
import { MultiplayerLobbyModal } from './components/modals/MultiplayerLobbyModal';
import { MultiplayerDuelHUD } from './components/MultiplayerDuelHUD';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { triggerPowerUpAnimation, animateCellShatter } from './utils/gsapAnimations';
import {
  loadDailyMissions,
  saveDailyMissions,
  processMissionProgress,
  claimDailyMissionReward,
  loadPlayerXP,
} from './utils/missionManager';
import { DailyMission, PlayerProfileXP } from './types/missions';
import { DailyMissionsModal } from './components/modals/DailyMissionsModal';
import { vibrateStoneBreak, vibrateScaryGameOver } from './utils/vibration';
import { Trophy, MessageSquare, HelpCircle, Sparkles } from 'lucide-react';
import { BannerAd } from './components/ads/BannerAd';
import { VideoAdModal } from './components/ads/VideoAdModal';
import { getStreakMultiplier } from './utils/streakMultiplier';

export default function App() {
  // Persistence & Settings
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [stats, setStats] = useState(loadGameStats);
  const [levelStars, setLevelStars] = useState(loadLevelStars);
  const [achievements, setAchievements] = useState(loadAchievements);
  const [dailyRewardStatus, setDailyRewardStatus] = useState(checkDailyRewardStatus);

  // Active Play Session Streak Multiplier (grows with daily check-ins)
  const streakMultiplier = getStreakMultiplier(dailyRewardStatus.currentStreak);

  // Player Identity (Persistent for Multiplayer and Chat)
  const [playerId] = useState<string>(() => {
    let stored = localStorage.getItem('lumina_player_id');
    if (!stored) {
      stored = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('lumina_player_id', stored);
    }
    return stored;
  });

  // Core Game State
  const [mode, setMode] = useState<GameMode>('CLASSIC_ENDLESS');
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [pieces, setPieces] = useState<(Piece | null)[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [draggedPieceIndex, setDraggedPieceIndex] = useState<number | null>(null);

  // Scores & Counters
  const [score, setScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(1);
  const [maxComboThisSession, setMaxComboThisSession] = useState<number>(1);
  const [sessionLinesCleared, setSessionLinesCleared] = useState<number>(0);
  const [frenzyMeter, setFrenzyMeter] = useState<number>(0);
  const [frenzyActive, setFrenzyActive] = useState<boolean>(false);

  // Quest / Blitz state
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [movesLeft, setMovesLeft] = useState<number | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
  const [levelProgress, setLevelProgress] = useState<{
    linesCleared: number;
    frozenCleared: number;
    gemCounts: Record<string, number>;
  }>({
    linesCleared: 0,
    frozenCleared: 0,
    gemCounts: {},
  });

  // Multiplayer Duel State
  const [multiplayerRoomId, setMultiplayerRoomId] = useState<string | null>(null);
  const [isMultiplayerHost, setIsMultiplayerHost] = useState<boolean>(false);
  const [multiplayerRoom, setMultiplayerRoom] = useState<MultiplayerRoom | null>(null);

  // Power-ups
  const [powerUps, setPowerUps] = useState<Record<PowerUpType, number>>({
    hammer: 3,
    bomb: 2,
    reroll: 3,
    rotate: 999,
  });
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);

  // FX & Highlights
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [previewHover, setPreviewHover] = useState<{ r: number; c: number } | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Firebase Global Daily High Score Leaderboard State
  const todayDateStr = getTodayDateString();
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(true);

  // Daily Missions & XP State
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() =>
    loadDailyMissions(todayDateStr)
  );
  const [playerProfile, setPlayerProfile] = useState<PlayerProfileXP>(loadPlayerXP);
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState<boolean>(false);
  const [missionNotification, setMissionNotification] = useState<string | null>(null);

  const handleClaimMission = (missionId: string) => {
    const { updatedMissions, powerUpAwarded } = claimDailyMissionReward(
      dailyMissions,
      missionId,
      todayDateStr
    );
    setDailyMissions(updatedMissions);
    setPlayerProfile(loadPlayerXP());

    if (powerUpAwarded) {
      setPowerUps((prev) => ({
        ...prev,
        [powerUpAwarded.type]: prev[powerUpAwarded.type] + powerUpAwarded.count,
      }));
    }
  };

  const handleClaimAllMissions = () => {
    let currentMissions = [...dailyMissions];
    const powerUpsToAdd: Record<PowerUpType, number> = { hammer: 0, bomb: 0, reroll: 0, rotate: 0 };

    currentMissions.forEach((m) => {
      if (m.isCompleted && !m.isClaimed) {
        const res = claimDailyMissionReward(currentMissions, m.id, todayDateStr);
        currentMissions = res.updatedMissions;
        if (res.powerUpAwarded) {
          powerUpsToAdd[res.powerUpAwarded.type] += res.powerUpAwarded.count;
        }
      }
    });

    setDailyMissions(currentMissions);
    setPlayerProfile(loadPlayerXP());
    setPowerUps((prev) => ({
      ...prev,
      hammer: prev.hammer + powerUpsToAdd.hammer,
      reroll: prev.reroll + powerUpsToAdd.reroll,
      bomb: prev.bomb + powerUpsToAdd.bomb,
    }));
  };

  // Modals
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isDailyRewardModalOpen, setIsDailyRewardModalOpen] = useState<boolean>(false);
  const [isVideoAdOpen, setIsVideoAdOpen] = useState<boolean>(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isMultiplayerLobbyOpen, setIsMultiplayerLobbyOpen] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    return localStorage.getItem('lumina_tutorial_completed') !== 'true';
  });

  // Interstitial/Rewarded Video Ad Flow when checking Daily Streak
  const handleOpenDailyStreakWithAd = () => {
    soundManager.playClick();
    setIsVideoAdOpen(true);
  };

  const handleVideoAdComplete = () => {
    setIsVideoAdOpen(false);
    setIsDailyRewardModalOpen(true);
  };

  const handleCompleteTutorial = () => {
    localStorage.setItem('lumina_tutorial_completed', 'true');
    setIsTutorialOpen(false);
  };

  const handleSkipTutorial = () => {
    localStorage.setItem('lumina_tutorial_completed', 'true');
    setIsTutorialOpen(false);
  };

  const particleCanvasRef = useRef<ParticleCanvasRef | null>(null);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  // Check validity of each piece in the dock
  const pieceValidity = pieces.map((p) => (p ? canPlacePieceAnywhere(grid, p) : false));

  // Active theme configuration
  const activeTheme =
    CRYSTAL_THEMES[settings.crystalTheme || 'default'] || CRYSTAL_THEMES.default;

  // Validate Firestore Connection & Setup Realtime Leaderboard Listener
  useEffect(() => {
    testConnection();

    // Attach realtime Firestore listener for today's top 5
    const unsubscribe = subscribeToDailyTopScores(todayDateStr, (scores) => {
      setDailyLeaderboard(scores);
      setIsLeaderboardLoading(false);
    });

    fetchDailyTopScores(todayDateStr).then((scores) => {
      if (scores.length > 0) {
        setDailyLeaderboard(scores);
      } else {
        const seedScores = [
          { name: 'AetheriaMaster', score: 14200, lines: 18, combo: 4 },
          { name: 'CrystalSage', score: 11850, lines: 15, combo: 3 },
          { name: 'PrismValkyrie', score: 9400, lines: 12, combo: 3 },
          { name: 'LuminaNovice', score: 6800, lines: 9, combo: 2 },
          { name: 'StardustKnight', score: 4500, lines: 6, combo: 2 },
        ];
        Promise.all(
          seedScores.map((s) =>
            submitDailyScore(todayDateStr, s.name, s.score, s.lines, s.combo, 'CLASSIC_ENDLESS')
          )
        ).then(() => {
          fetchDailyTopScores(todayDateStr).then((res) => {
            if (res.length > 0) setDailyLeaderboard(res);
          });
        });
      }
      setIsLeaderboardLoading(false);
    });

    return () => unsubscribe();
  }, [todayDateStr]);

  // Subscribe to real-time Multiplayer Duel Room updates
  useEffect(() => {
    if (!multiplayerRoomId) return;

    const unsubscribe = subscribeToMultiplayerRoom(multiplayerRoomId, (room) => {
      if (!room) {
        setMultiplayerRoom(null);
        return;
      }
      setMultiplayerRoom(room);

      // Check if duel completed by opponent damage
      if (room.status === 'in_progress') {
        const myHp = isMultiplayerHost ? room.hostHp : room.guestHp || 0;
        const oppHp = isMultiplayerHost ? room.guestHp ?? 100 : room.hostHp;

        if (oppHp <= 0) {
          // You won the duel!
          updateMultiplayerRoomState(multiplayerRoomId, {
            status: 'finished',
            winnerId: playerId,
            lastAttackText: '🏆 VICTORY! Opponent lattice shattered!',
          });
          soundManager.playEpicVictory();
          particleCanvasRef.current?.epicVictorySequence();
          setIsVictory(true);
          setIsGameOverModalOpen(true);
        } else if (myHp <= 0) {
          // Defeat
          soundManager.playGameOver();
          setIsVictory(false);
          setIsGameOverModalOpen(true);
        }
      }
    });

    return () => unsubscribe();
  }, [multiplayerRoomId, isMultiplayerHost, playerId]);

  // Initialize Sound Settings with separate SFX and BGM controls
  useEffect(() => {
    soundManager.setMuted(settings.muted);
    soundManager.setSfxEnabled(settings.sfxEnabled ?? true);
    soundManager.setSfxVolume(settings.sfxVolume ?? 0.8);
    soundManager.setBgmVolume(settings.bgmVolume ?? 0.5);

    if (settings.bgm && !soundManager.getIsBgmPlaying()) {
      soundManager.startBgm();
    } else if (!settings.bgm && soundManager.getIsBgmPlaying()) {
      soundManager.stopBgm();
    }
  }, [
    settings.muted,
    settings.sfxEnabled,
    settings.sfxVolume,
    settings.bgm,
    settings.bgmVolume,
  ]);

  // Achievement unlock helper
  const updateAchievement = useCallback((id: string, deltaProgress: number) => {
    setAchievements((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const newProgress = Math.min(item.maxProgress, item.progress + deltaProgress);
          const wasUnlocked = item.unlocked;
          const nowUnlocked = newProgress >= item.maxProgress;
          if (!wasUnlocked && nowUnlocked) {
            soundManager.playPowerUp();
          }
          return { ...item, progress: newProgress, unlocked: nowUnlocked };
        }
        return item;
      });
      saveAchievements(updated);
      return updated;
    });
  }, []);

  // Initialize a new game based on current mode & level
  const initGame = useCallback((targetMode: GameMode, levelId = 1) => {
    const freshGrid = createEmptyGrid();
    let initialMoves: number | undefined = undefined;
    let initialTime: number | undefined = undefined;

    if (targetMode === 'LEVEL_QUEST') {
      const level = QUEST_LEVELS.find((l) => l.id === levelId) || QUEST_LEVELS[0];
      if (level.initialBoard) {
        level.initialBoard.forEach((item) => {
          freshGrid[item.r][item.c] = {
            gemType: item.gemType || null,
            special: item.special || 'normal',
            frozenHits: item.frozenHits || 1,
          };
        });
      }
      initialMoves = level.objective.maxMoves || 25;
      setLevelProgress({
        linesCleared: 0,
        frozenCleared: 0,
        gemCounts: {},
      });
    } else if (targetMode === 'TIME_ATTACK') {
      initialTime = 90;
    } else if (targetMode === 'DAILY_CHALLENGE') {
      freshGrid[3][3] = { gemType: 'amethyst', special: 'normal' };
      freshGrid[3][5] = { gemType: 'ruby', special: 'normal' };
      freshGrid[5][3] = { gemType: 'sapphire', special: 'normal' };
      freshGrid[5][5] = { gemType: 'amber', special: 'normal' };
    }

    setGrid(freshGrid);
    setPieces(generatePieceTrio());
    setSelectedPieceIndex(null);
    setDraggedPieceIndex(null);
    setScore(0);
    setComboCount(1);
    setMaxComboThisSession(1);
    setSessionLinesCleared(0);
    setFrenzyMeter(0);
    setFrenzyActive(false);
    setMovesLeft(initialMoves);
    setTimeLeft(initialTime);
    setActivePowerUp(null);
    setFloatingScores([]);
    setIsGameOverModalOpen(false);
    setIsVictory(false);
    setEarnedStars(0);

    setStats((prev) => {
      const next = { ...prev, gamesPlayed: prev.gamesPlayed + 1 };
      saveGameStats(next);
      return next;
    });
  }, []);

  // Start initial game on mount
  useEffect(() => {
    initGame('CLASSIC_ENDLESS');
  }, [initGame]);

  // Blitz Countdown Timer
  useEffect(() => {
    if (mode !== 'TIME_ATTACK' || isGameOverModalOpen || timeLeft === undefined) return;

    if (timeLeft <= 0) {
      handleGameOver(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== undefined && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, timeLeft, isGameOverModalOpen]);

  // Handle Game Over / Victory
  const handleGameOver = useCallback(
    (victory: boolean) => {
      setIsVictory(victory);

      if (victory) {
        // High-difficulty level clear check (Level 4+ or 3 stars or Duel win)
        const isHighDifficulty =
          (mode === 'LEVEL_QUEST' && currentLevelId >= 4) ||
          mode === 'MULTIPLAYER_DUEL' ||
          score >= 8000;

        if (isHighDifficulty) {
          soundManager.playEpicVictory();
          particleCanvasRef.current?.epicVictorySequence();
        } else {
          soundManager.playPowerUp();
        }
      } else {
        soundManager.playGameOver(true);
        vibrateScaryGameOver(settings.vibrationIntensity);
        triggerScreenShake();
      }

      if (mode === 'LEVEL_QUEST') {
        const level = QUEST_LEVELS.find((l) => l.id === currentLevelId) || QUEST_LEVELS[0];
        let stars = 0;
        if (victory) {
          if (score >= level.starThresholds[2]) stars = 3;
          else if (score >= level.starThresholds[1]) stars = 2;
          else stars = 1;

          setLevelStars((prev) => {
            const updated = { ...prev, [currentLevelId]: Math.max(prev[currentLevelId] || 0, stars) };
            saveLevelStars(updated);
            return updated;
          });
          setEarnedStars(stars);
        }
      }

      setStats((prev) => {
        const next = {
          ...prev,
          highScoreClassic:
            mode === 'CLASSIC_ENDLESS' ? Math.max(prev.highScoreClassic, score) : prev.highScoreClassic,
          highScoreBlitz:
            mode === 'TIME_ATTACK' ? Math.max(prev.highScoreBlitz, score) : prev.highScoreBlitz,
          totalLinesCleared: prev.totalLinesCleared + sessionLinesCleared,
          maxCombo: Math.max(prev.maxCombo, maxComboThisSession),
        };
        saveGameStats(next);
        return next;
      });

      setIsGameOverModalOpen(true);
    },
    [mode, currentLevelId, score, sessionLinesCleared, maxComboThisSession]
  );

  // Trigger screen shake
  const triggerScreenShake = () => {
    if (!settings.screenShake) return;
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 300);
  };

  // Add floating point popup on board
  const addFloatingScore = (x: number, y: number, text: string, color: string, isCombo = false) => {
    const id = `score_${Date.now()}_${Math.random()}`;
    setFloatingScores((prev) => [...prev, { id, x, y, text, color, isCombo }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((s) => s.id !== id));
    }, 900);
  };

  // Check if Quest objective is completed
  const checkQuestCompletion = (
    newScore: number,
    lines: number,
    frozen: number,
    gemCounts: Record<string, number>
  ) => {
    const level = QUEST_LEVELS.find((l) => l.id === currentLevelId);
    if (!level) return false;

    const { targetScore, targetLines, targetCombos, clearFrozen, collectGems } = level.objective;

    if (targetScore && newScore < targetScore) return false;
    if (targetLines && lines < targetLines) return false;
    if (clearFrozen && frozen < clearFrozen) return false;
    if (targetCombos && maxComboThisSession < targetCombos) return false;
    if (collectGems) {
      for (const req of collectGems) {
        if ((gemCounts[req.type] || 0) < req.count) return false;
      }
    }
    return true;
  };

  // Claim Daily Reward Handler
  const handleClaimDailyReward = () => {
    if (!dailyRewardStatus.canClaim) return;

    const rewardItem = DAILY_REWARDS_SCHEDULE[dailyRewardStatus.nextDayInCycle - 1];
    if (!rewardItem) return;

    setPowerUps((prev) => ({
      ...prev,
      hammer: prev.hammer + rewardItem.hammers,
      reroll: prev.reroll + rewardItem.rerolls,
    }));

    if (rewardItem.bonusPoints) {
      setScore((prev) => prev + rewardItem.bonusPoints!);
      addFloatingScore(50, 40, `+${rewardItem.bonusPoints} DAILY BONUS!`, '#fbbf24', true);
    }

    const today = getTodayDateString();
    const newStreak = dailyRewardStatus.currentStreak + 1;
    saveDailyRewardState({
      currentStreak: newStreak,
      lastClaimDate: today,
      totalClaimsCount: newStreak,
    });

    setStats((prev) => {
      const next = { ...prev, dailyStreak: newStreak, lastDailyDate: today };
      saveGameStats(next);
      return next;
    });
    updateAchievement('daily_champion', 1);
    setDailyRewardStatus(checkDailyRewardStatus());
  };

  // Submit Score to Firestore Leaderboard
  const handleSubmitDailyScore = async (playerName: string): Promise<boolean> => {
    const ok = await submitDailyScore(
      todayDateStr,
      playerName,
      score,
      sessionLinesCleared,
      maxComboThisSession,
      mode
    );
    if (ok) {
      soundManager.playPowerUp();
      const updated = await fetchDailyTopScores(todayDateStr);
      setDailyLeaderboard(updated);
    }
    return ok;
  };

  // Execute Piece Placement on Grid at (startRow, startCol)
  const placePieceOnBoard = (pieceIdx: number, startRow: number, startCol: number) => {
    const piece = pieces[pieceIdx];
    if (!piece) return;

    if (!canPlacePiece(grid, piece, startRow, startCol)) {
      return;
    }

    soundManager.playPlace();

    let newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const shape = piece.shape;
    let placedCellCount = 0;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c] === 1) {
          newGrid[startRow + r][startCol + c] = {
            gemType: piece.gemType,
            special: 'normal',
          };
          placedCellCount++;
        }
      }
    }

    const dropPoints = placedCellCount * 10;
    let turnScore = dropPoints;

    const newPieces = [...pieces];
    newPieces[pieceIdx] = null;

    const clearResult = findClearedMatches(newGrid);
    const totalLinesAndBoxes =
      clearResult.clearedRows.length +
      clearResult.clearedCols.length +
      clearResult.clearedBoxes.length;

    let newCombo = comboCount;
    let newFrenzy = frenzyMeter;
    let nextLinesCleared = levelProgress.linesCleared;
    let nextFrozenCleared = levelProgress.frozenCleared;
    const nextGemCounts = { ...levelProgress.gemCounts };

    if (totalLinesAndBoxes > 0) {
      newCombo = comboCount + 1;
      setMaxComboThisSession((prev) => Math.max(prev, newCombo));
      setSessionLinesCleared((prev) => prev + totalLinesAndBoxes);
      nextLinesCleared += totalLinesAndBoxes;

      newFrenzy = Math.min(100, frenzyMeter + totalLinesAndBoxes * 15);
      if (newFrenzy >= 100 && !frenzyActive) {
        setFrenzyActive(true);
        soundManager.playFrenzy();
        updateAchievement('frenzy_igniter', 1);
        setTimeout(() => setFrenzyActive(false), 12000);
      }

      const multiplier = newCombo * (frenzyActive ? 2 : 1);
      const clearBasePoints = clearResult.cellsToClear.length * 30 * totalLinesAndBoxes;
      turnScore += clearBasePoints * multiplier;

      soundManager.playClear(newCombo, totalLinesAndBoxes);

      if (totalLinesAndBoxes >= 2) {
        triggerScreenShake();
      }

      let stonesShatteredInClear = 0;
      clearResult.cellsToClear.forEach(({ r, c }) => {
        newGrid[r][c].isClearing = true;
        const cellGem = newGrid[r][c].gemType;
        if (cellGem) {
          nextGemCounts[cellGem] = (nextGemCounts[cellGem] || 0) + 1;
        }
        if (newGrid[r][c].special === 'frozen') {
          nextFrozenCleared++;
          updateAchievement('frost_breaker', 1);
        }
        if (newGrid[r][c].special === 'stone') {
          stonesShatteredInClear++;
        }
      });

      if (stonesShatteredInClear > 0) {
        soundManager.playStoneBreak();
        vibrateStoneBreak(settings.vibrationIntensity);
        turnScore += stonesShatteredInClear * 100;
        addFloatingScore(50, 42, `+${stonesShatteredInClear * 100} STONE SHATTER!`, '#94a3b8');
      }

      clearResult.cellsToClear.forEach(({ r, c }) => {
        const xPercent = (c + 0.5) / 9;
        const yPercent = (r + 0.5) / 9;
        if (boardContainerRef.current) {
          const rect = boardContainerRef.current.getBoundingClientRect();
          const canvasX = xPercent * rect.width;
          const canvasY = yPercent * rect.height;
          particleCanvasRef.current?.burst(
            canvasX,
            canvasY,
            GEM_META[piece.gemType].textHex,
            15,
            totalLinesAndBoxes >= 2
          );
        }
      });

      if (totalLinesAndBoxes >= 2) {
        particleCanvasRef.current?.shockwave(220, 220, activeTheme.accentColor);
      }

      // Apply Streak Multiplier for active play session
      if (streakMultiplier > 1) {
        turnScore = Math.round(turnScore * streakMultiplier);
      }

      addFloatingScore(
        50,
        35,
        `+${turnScore.toLocaleString()}${newCombo > 1 ? ` · x${newCombo} COMBO!` : ''}${
          streakMultiplier > 1 ? ` (⚡${streakMultiplier.toFixed(2)}x)` : ''
        }`,
        totalLinesAndBoxes >= 2 ? '#f59e0b' : activeTheme.accentColor,
        newCombo > 1 || streakMultiplier > 1
      );

      if (mode === 'TIME_ATTACK') {
        setTimeLeft((prev) => (prev !== undefined ? Math.min(180, prev + totalLinesAndBoxes * 3) : 0));
      }

      updateAchievement('first_clear', 1);
      updateAchievement('lines_100', totalLinesAndBoxes);
      if (totalLinesAndBoxes >= 2) updateAchievement('double_cascade', 1);
      if (totalLinesAndBoxes >= 3) updateAchievement('triple_cascade', 1);
      if (newCombo >= 3) updateAchievement('combo_streak_3', 1);
      if (newCombo >= 5) updateAchievement('combo_streak_5', 1);
    } else {
      newCombo = 1;
      if (streakMultiplier > 1) {
        turnScore = Math.round(turnScore * streakMultiplier);
      }
    }

    setComboCount(newCombo);
    setFrenzyMeter(newFrenzy);
    const finalScore = score + turnScore;
    setScore(finalScore);

    if (finalScore >= 5000) updateAchievement('score_5000', finalScore);
    if (finalScore >= 15000) updateAchievement('score_15000', finalScore);

    // Process Daily Missions progress on turn events
    const { updatedMissions, newlyCompleted } = processMissionProgress(dailyMissions, {
      gemClears: nextGemCounts,
      combo: newCombo,
      totalLinesAndBoxes,
      sessionScore: finalScore,
    });

    if (updatedMissions !== dailyMissions) {
      setDailyMissions(updatedMissions);
      saveDailyMissions(updatedMissions, todayDateStr);
    }

    if (newlyCompleted.length > 0) {
      soundManager.playPowerUp();
      setMissionNotification(
        `🎯 Mission Complete: ${newlyCompleted[0].title}! (+${newlyCompleted[0].rewardXp} XP)`
      );
      setTimeout(() => setMissionNotification(null), 3500);
    }

    // Multiplayer Duel State Sync to Firestore
    if (mode === 'MULTIPLAYER_DUEL' && multiplayerRoomId && multiplayerRoom) {
      // 81-char grid representation
      const gridSummary = newGrid
        .map((row) => row.map((cell) => (cell.gemType ? '1' : '0')).join(''))
        .join('');

      let attackDamage = 0;
      let attackDesc = '';

      if (totalLinesAndBoxes > 0) {
        attackDamage = totalLinesAndBoxes * 12 + newCombo * 5;
        const myName = isMultiplayerHost ? multiplayerRoom.hostName : multiplayerRoom.guestName || 'Player';
        attackDesc = `⚔ ${myName} hit with ${totalLinesAndBoxes}-line blast! (-${attackDamage} HP)`;
      }

      if (isMultiplayerHost) {
        const nextGuestHp = Math.max(0, (multiplayerRoom.guestHp ?? 100) - attackDamage);
        updateMultiplayerRoomState(multiplayerRoomId, {
          hostScore: finalScore,
          hostLines: sessionLinesCleared + totalLinesAndBoxes,
          hostCombo: newCombo,
          hostGridSummary: gridSummary,
          ...(attackDamage > 0 ? { guestHp: nextGuestHp, lastAttackText: attackDesc } : {}),
        });
      } else {
        const nextHostHp = Math.max(0, (multiplayerRoom.hostHp ?? 100) - attackDamage);
        updateMultiplayerRoomState(multiplayerRoomId, {
          guestScore: finalScore,
          guestLines: sessionLinesCleared + totalLinesAndBoxes,
          guestCombo: newCombo,
          guestGridSummary: gridSummary,
          ...(attackDamage > 0 ? { hostHp: nextHostHp, lastAttackText: attackDesc } : {}),
        });
      }
    }

    let updatedMoves = movesLeft;
    if (mode === 'LEVEL_QUEST' && movesLeft !== undefined) {
      updatedMoves = movesLeft - 1;
      setMovesLeft(updatedMoves);
    }

    setLevelProgress({
      linesCleared: nextLinesCleared,
      frozenCleared: nextFrozenCleared,
      gemCounts: nextGemCounts,
    });

    if (mode === 'LEVEL_QUEST') {
      const isWon = checkQuestCompletion(finalScore, nextLinesCleared, nextFrozenCleared, nextGemCounts);
      if (isWon) {
        setTimeout(() => handleGameOver(true), 400);
        return;
      } else if (updatedMoves !== undefined && updatedMoves <= 0) {
        setTimeout(() => handleGameOver(false), 400);
        return;
      }
    }

    // Process Crystal Decay progression for Classic Endless Mode
    if (mode === 'CLASSIC_ENDLESS') {
      const decayResult = processCrystalDecayOnMove(newGrid, mode, finalScore);
      newGrid = decayResult.nextGrid;

      if (decayResult.newlyTurnedToStoneCount > 0) {
        soundManager.playStonePetrify();
        triggerScreenShake();
        decayResult.stoneCoords.forEach(({ r, c }) => {
          if (boardContainerRef.current) {
            const rect = boardContainerRef.current.getBoundingClientRect();
            particleCanvasRef.current?.burst(
              ((c + 0.5) / 9) * rect.width,
              ((r + 0.5) / 9) * rect.height,
              '#64748b',
              22
            );
          }
        });
        addFloatingScore(
          50,
          42,
          `⚠️ ${decayResult.newlyTurnedToStoneCount} GEM${decayResult.newlyTurnedToStoneCount > 1 ? 'S' : ''} PETRIFIED!`,
          '#f43f5e',
          true
        );
      }
    }

    setGrid(newGrid);

    setTimeout(() => {
      setGrid((prevGrid) => {
        const cleaned = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
        clearResult.cellsToClear.forEach(({ r, c }) => {
          cleaned[r][c] = {
            gemType: null,
            special: 'normal',
            isClearing: false,
            decayTurns: undefined,
            isDecaying: false,
          };
        });
        return cleaned;
      });
    }, 280);

    const remainingPieces = newPieces.filter(Boolean);
    let finalPieces = newPieces;
    if (remainingPieces.length === 0) {
      finalPieces = generatePieceTrio();
    }
    setPieces(finalPieces);
    setSelectedPieceIndex(null);
    setDraggedPieceIndex(null);
    setPreviewHover(null);

    setTimeout(() => {
      setGrid((currentG) => {
        const hasMoves = finalPieces.some((p) => p && canPlacePieceAnywhere(currentG, p));
        if (!hasMoves) {
          handleGameOver(false);
        }
        return currentG;
      });
    }, 350);
  };

  // Cell Click / Placement Handler
  const handleCellClick = (r: number, c: number) => {
    if (activePowerUp === 'hammer') {
      const cell = grid[r][c];
      if (cell.gemType !== null || cell.special === 'stone' || cell.special === 'frozen') {
        if (cell.special === 'stone') {
          soundManager.playStoneBreak();
          vibrateStoneBreak(settings.vibrationIntensity);
        } else {
          soundManager.playHammer();
        }
        animateCellShatter(r, c);
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[r][c] = {
            gemType: null,
            special: 'normal',
            decayTurns: undefined,
            isDecaying: false,
          };
          return next;
        });
        setPowerUps((prev) => ({ ...prev, hammer: Math.max(0, prev.hammer - 1) }));
        setActivePowerUp(null);

        if (boardContainerRef.current) {
          const rect = boardContainerRef.current.getBoundingClientRect();
          particleCanvasRef.current?.burst(((c + 0.5) / 9) * rect.width, ((r + 0.5) / 9) * rect.height, '#f59e0b', 25);
        }
      }
      return;
    }

    if (selectedPieceIndex !== null) {
      const piece = pieces[selectedPieceIndex];
      if (piece && canPlacePiece(grid, piece, r, c)) {
        placePieceOnBoard(selectedPieceIndex, r, c);
      } else {
        soundManager.playClick();
      }
    }
  };

  // Cell Hover Preview
  const handleCellMouseEnter = (r: number, c: number) => {
    const activeIndex = draggedPieceIndex !== null ? draggedPieceIndex : selectedPieceIndex;
    if (activeIndex !== null && pieces[activeIndex]) {
      setPreviewHover({ r, c });
    }
  };

  // Dock Piece Selection
  const handleSelectPiece = (index: number) => {
    soundManager.playClick();
    if (selectedPieceIndex === index) {
      setSelectedPieceIndex(null);
      setPreviewHover(null);
    } else {
      setSelectedPieceIndex(index);
    }
  };

  // Rotate Piece
  const handleRotatePiece = (index: number) => {
    soundManager.playClick();
    setPieces((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = rotatePiece(updated[index]!);
      }
      return updated;
    });
  };

  // Drag & Drop Start
  const handleDragStartPiece = (index: number, e: React.DragEvent) => {
    setDraggedPieceIndex(index);
    setSelectedPieceIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  // Power-Up Trigger with GSAP Animation
  const handleActivatePowerUp = (type: PowerUpType) => {
    if (powerUps[type] <= 0) return;

    const btnEl = document.getElementById(`powerup-btn-${type}`);
    triggerPowerUpAnimation(type, btnEl);

    if (type === 'reroll') {
      soundManager.playPowerUp();
      setPieces(generatePieceTrio());
      setSelectedPieceIndex(null);
      setPowerUps((prev) => ({ ...prev, reroll: Math.max(0, prev.reroll - 1) }));
      return;
    }

    if (type === 'hammer') {
      soundManager.playClick();
      setActivePowerUp(activePowerUp === 'hammer' ? null : 'hammer');
    }
  };

  // Compute what rows/cols/boxes will clear if preview piece is placed
  const computeHighlightedClears = () => {
    const activeIndex = draggedPieceIndex !== null ? draggedPieceIndex : selectedPieceIndex;
    if (activeIndex === null || !previewHover || !pieces[activeIndex]) {
      return { rows: [], cols: [], boxes: [] };
    }

    const piece = pieces[activeIndex]!;
    if (!canPlacePiece(grid, piece, previewHover.r, previewHover.c)) {
      return { rows: [], cols: [], boxes: [] };
    }

    const simGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[0].length; c++) {
        if (piece.shape[r][c] === 1) {
          simGrid[previewHover.r + r][previewHover.c + c] = {
            gemType: piece.gemType,
            special: 'normal',
          };
        }
      }
    }

    const matches = findClearedMatches(simGrid);
    return {
      rows: matches.clearedRows,
      cols: matches.clearedCols,
      boxes: matches.clearedBoxes,
    };
  };

  const previewPlacement = (() => {
    const activeIndex = draggedPieceIndex !== null ? draggedPieceIndex : selectedPieceIndex;
    if (activeIndex !== null && previewHover && pieces[activeIndex]) {
      return {
        r: previewHover.r,
        c: previewHover.c,
        shape: pieces[activeIndex]!.shape,
        gemType: pieces[activeIndex]!.gemType,
      };
    }
    return null;
  })();

  const currentLevel = QUEST_LEVELS.find((l) => l.id === currentLevelId);
  const highScore =
    mode === 'CLASSIC_ENDLESS'
      ? stats.highScoreClassic
      : mode === 'TIME_ATTACK'
      ? stats.highScoreBlitz
      : currentLevel?.starThresholds[2] || 0;

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-between overflow-x-hidden transition-all duration-700 pb-16 sm:pb-20 ${
        isScreenShaking ? 'shake-screen' : ''
      }`}
      style={{
        backgroundImage: `${activeTheme.gradientOverlay}, url('${activeTheme.backdropImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 60fps Particle Canvas Overlay with Epic Victory Sequence */}
      <ParticleCanvas ref={particleCanvasRef} frenzyActive={frenzyActive} />

      {/* Floating Mission Completion Toast */}
      {missionNotification && (
        <div className="fixed top-14 sm:top-16 z-50 flex items-center justify-center w-full px-4 pointer-events-none animate-bounce">
          <div className="flex items-center gap-2 rounded-xl border border-amber-400 bg-slate-900/95 px-4 py-2 text-xs font-bold text-amber-300 shadow-xl shadow-amber-500/20 backdrop-blur-md">
            <span>{missionNotification}</span>
          </div>
        </div>
      )}

      {/* Google AdMob Always-On Top Screen Banner Ad */}
      <BannerAd position="top" />

      {/* Top Bar adhering to Universal Design 3-Zone Contract with Daily Reward, Missions, Leaderboard & Duel Navigation */}
      <TopBar
        currentMode={mode}
        dailyStreak={dailyRewardStatus.currentStreak}
        canClaimDailyReward={dailyRewardStatus.canClaim}
        dailyMissionsCompleted={dailyMissions.filter((m) => m.isCompleted).length}
        dailyMissionsTotal={dailyMissions.length}
        hasUnclaimedMissions={dailyMissions.some((m) => m.isCompleted && !m.isClaimed)}
        playerName={settings.playerName || 'PrismSeeker'}
        totalLifetimeXp={playerProfile.totalLifetimeXp || 0}
        topScoreToday={dailyLeaderboard[0]?.score}
        onSelectMode={(newMode) => {
          soundManager.playClick();
          setMode(newMode);
          if (newMode === 'LEVEL_QUEST') {
            setIsLevelModalOpen(true);
          } else if (newMode === 'MULTIPLAYER_DUEL') {
            setIsMultiplayerLobbyOpen(true);
          } else {
            initGame(newMode);
          }
        }}
        onOpenDailyReward={handleOpenDailyStreakWithAd}
        onOpenDailyMissions={() => {
          soundManager.playClick();
          setIsDailyMissionsOpen(true);
        }}
        onOpenLeaderboard={() => {
          soundManager.playClick();
          setIsLeaderboardModalOpen(true);
        }}
        onOpenChat={() => {
          soundManager.playClick();
          setIsChatModalOpen(true);
        }}
        onOpenAchievements={() => {
          soundManager.playClick();
          setIsAchievementsModalOpen(true);
        }}
        onOpenHowToPlay={() => {
          soundManager.playClick();
          setIsHowToPlayModalOpen(true);
        }}
        onOpenTutorial={() => {
          soundManager.playClick();
          setIsTutorialOpen(true);
        }}
        onOpenSettings={() => {
          soundManager.playClick();
          setIsSettingsModalOpen(true);
        }}
      />

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4 z-10 w-full max-w-4xl mx-auto">
        {/* Real-time Multiplayer Duel HUD (Active during 1v1 Room Battle) */}
        {mode === 'MULTIPLAYER_DUEL' && multiplayerRoom && (
          <MultiplayerDuelHUD
            room={multiplayerRoom}
            isHost={isMultiplayerHost}
            onLeaveDuel={() => {
              setMultiplayerRoomId(null);
              setMultiplayerRoom(null);
              setMode('CLASSIC_ENDLESS');
              initGame('CLASSIC_ENDLESS');
            }}
          />
        )}

        {/* HUD: Scores, Combo Streak, Frenzy Core, Power-ups */}
        <GameHUD
          mode={mode}
          score={score}
          highScore={highScore}
          comboCount={comboCount}
          frenzyMeter={frenzyMeter}
          frenzyActive={frenzyActive}
          dailyStreak={dailyRewardStatus.currentStreak}
          streakMultiplier={streakMultiplier}
          canClaimDailyReward={dailyRewardStatus.canClaim}
          onOpenDailyReward={handleOpenDailyStreakWithAd}
          movesLeft={movesLeft}
          timeLeft={timeLeft}
          decaySummary={getDecayingCellsSummary(grid)}
          decayTurnLimit={getDecayThresholdForScore(score)}
          currentLevel={currentLevel}
          levelObjectiveProgress={levelProgress}
          powerUps={powerUps}
          activePowerUp={activePowerUp}
          isMuted={settings.muted}
          onToggleMute={() => {
            const nextMuted = !settings.muted;
            setSettings((prev) => ({ ...prev, muted: nextMuted }));
            saveSettings({ ...settings, muted: nextMuted });
            soundManager.setMuted(nextMuted);
          }}
          isSfxEnabled={settings.sfxEnabled ?? true}
          onToggleSfx={() => {
            const nextSfx = !(settings.sfxEnabled ?? true);
            const nextSettings = { ...settings, sfxEnabled: nextSfx };
            setSettings(nextSettings);
            saveSettings(nextSettings);
            soundManager.setSfxEnabled(nextSfx);
            if (nextSfx) {
              soundManager.playClick();
            }
          }}
          onActivatePowerUp={handleActivatePowerUp}
          onResetGame={() => initGame(mode, currentLevelId)}
          onOpenAchievements={() => setIsAchievementsModalOpen(true)}
          onOpenLevelSelector={() => setIsLevelModalOpen(true)}
        />

        {/* 9x9 Jewel Grid */}
        <div ref={boardContainerRef} className="w-full flex justify-center">
          <GameBoard
            grid={grid}
            previewPlacement={previewPlacement}
            highlightedClears={computeHighlightedClears()}
            floatingScores={floatingScores}
            colorblindMode={settings.colorblindSymbols}
            activePowerUp={activePowerUp}
            onCellClick={handleCellClick}
            onCellMouseEnter={handleCellMouseEnter}
          />
        </div>

        {/* Piece Selection Dock */}
        <PieceDock
          pieces={pieces}
          selectedPieceIndex={selectedPieceIndex}
          validityMap={pieceValidity}
          colorblindMode={settings.colorblindSymbols}
          onSelectPiece={handleSelectPiece}
          onRotatePiece={handleRotatePiece}
          onDragStartPiece={handleDragStartPiece}
        />
      </main>

      {/* Mobile-fitted bottom options bar & footer */}
      <footer className="py-2.5 px-3 sm:px-4 border-t border-slate-900/80 bg-slate-950/70 backdrop-blur-sm z-10 w-full select-none">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-2">
          {/* Row 1: Bottom quick action buttons fitted in a 4-col responsive grid with zero swiping */}
          <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 gap-1.5 w-full">
            <button
              type="button"
              onClick={() => setIsLeaderboardModalOpen(true)}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition-all cursor-pointer"
            >
              <Trophy className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="truncate">Daily Top 5</span>
            </button>
            <button
              type="button"
              onClick={() => setIsChatModalOpen(true)}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-all cursor-pointer"
            >
              <MessageSquare className="h-3 w-3 text-indigo-400 shrink-0" />
              <span className="truncate">Tips Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHowToPlayModalOpen(true)}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all cursor-pointer"
            >
              <HelpCircle className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">Rules Guide</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTutorialOpen(true)}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />
              <span className="truncate">Tutorial</span>
            </button>
          </div>

          {/* Row 2: Status & Theme Info */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400">Lumina Prism</span>
            <span aria-hidden="true">·</span>
            <span>Theme: {activeTheme.name}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        isVictory={isVictory}
        mode={mode}
        score={score}
        highScore={highScore}
        linesCleared={sessionLinesCleared}
        maxCombo={maxComboThisSession}
        currentLevel={currentLevel}
        earnedStars={earnedStars}
        vibrationIntensity={settings.vibrationIntensity}
        onPlayAgain={() => initGame(mode, currentLevelId)}
        onNextLevel={() => {
          const nextLvl = currentLevelId + 1;
          setCurrentLevelId(nextLvl);
          initGame('LEVEL_QUEST', nextLvl);
        }}
        onGoHome={() => {
          setMode('CLASSIC_ENDLESS');
          initGame('CLASSIC_ENDLESS');
        }}
      />

      <LevelSelectModal
        isOpen={isLevelModalOpen}
        levelStars={levelStars}
        onSelectLevel={(lvlId) => {
          setCurrentLevelId(lvlId);
          setMode('LEVEL_QUEST');
          initGame('LEVEL_QUEST', lvlId);
        }}
        onClose={() => setIsLevelModalOpen(false)}
      />

      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        achievements={achievements}
        onClose={() => setIsAchievementsModalOpen(false)}
      />

      <HowToPlayModal
        isOpen={isHowToPlayModalOpen}
        onStartInteractiveTutorial={() => {
          setIsHowToPlayModalOpen(false);
          setIsTutorialOpen(true);
        }}
        onClose={() => setIsHowToPlayModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        onUpdateSettings={(updated) => {
          const next = { ...settings, ...updated };
          setSettings(next);
          saveSettings(next);
        }}
        onReplayTutorial={() => {
          setIsSettingsModalOpen(false);
          setIsTutorialOpen(true);
        }}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <DailyRewardModal
        isOpen={isDailyRewardModalOpen}
        canClaim={dailyRewardStatus.canClaim}
        currentStreak={dailyRewardStatus.currentStreak}
        nextDayInCycle={dailyRewardStatus.nextDayInCycle}
        lastClaimDate={dailyRewardStatus.lastClaimDate}
        shieldSavedStreak={dailyRewardStatus.shieldSavedStreak}
        onClaimReward={handleClaimDailyReward}
        onXpChange={() => setPlayerProfile(loadPlayerXP())}
        onClose={() => setIsDailyRewardModalOpen(false)}
      />

      <DailyLeaderboardModal
        isOpen={isLeaderboardModalOpen}
        dateStr={todayDateStr}
        leaderboard={dailyLeaderboard}
        isLoading={isLeaderboardLoading}
        userScore={score}
        onRefresh={async () => {
          setIsLeaderboardLoading(true);
          const res = await fetchDailyTopScores(todayDateStr);
          setDailyLeaderboard(res);
          setIsLeaderboardLoading(false);
        }}
        onSubmitScore={handleSubmitDailyScore}
        onClose={() => setIsLeaderboardModalOpen(false)}
      />

      <DailyChatModal
        isOpen={isChatModalOpen}
        dateStr={todayDateStr}
        userScore={score}
        onClose={() => setIsChatModalOpen(false)}
      />

      <MultiplayerLobbyModal
        isOpen={isMultiplayerLobbyOpen}
        currentRoom={multiplayerRoom}
        playerId={playerId}
        onEnterRoom={(roomId, isHost) => {
          setMultiplayerRoomId(roomId);
          setIsMultiplayerHost(isHost);
          setMode('MULTIPLAYER_DUEL');
          initGame('MULTIPLAYER_DUEL');
          setIsMultiplayerLobbyOpen(false);
        }}
        onClose={() => setIsMultiplayerLobbyOpen(false)}
      />

      {/* Interactive Step-by-Step Visual Overlay Tutorial */}
      <InteractiveTutorial
        isOpen={isTutorialOpen}
        onComplete={handleCompleteTutorial}
        onSkip={handleSkipTutorial}
      />

      {/* Daily Missions & XP Dashboard Modal */}
      <DailyMissionsModal
        isOpen={isDailyMissionsOpen}
        missions={dailyMissions}
        playerProfile={playerProfile}
        onClaimReward={handleClaimMission}
        onClaimAll={handleClaimAllMissions}
        onClose={() => setIsDailyMissionsOpen(false)}
      />

      {/* Rewarded Video Ad Modal displayed before viewing daily streak */}
      <VideoAdModal
        isOpen={isVideoAdOpen}
        dailyStreak={dailyRewardStatus.currentStreak}
        onAdCompleted={handleVideoAdComplete}
        onClose={() => {
          setIsVideoAdOpen(false);
          setIsDailyRewardModalOpen(true);
        }}
      />

      {/* Google AdMob Always-On Bottom Screen Banner Ad */}
      <BannerAd position="bottom" />
    </div>
  );
}
