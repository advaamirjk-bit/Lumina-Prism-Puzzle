import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId as specified in SKILL.md
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test as required by SKILL.md
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, local cache active.');
    }
    return false;
  }
}

export interface LeaderboardEntry {
  id: string;
  date: string;
  playerName: string;
  score: number;
  linesCleared?: number;
  maxCombo?: number;
  mode?: string;
  createdAt?: unknown;
}

/**
 * Fetch top 5 daily high scores from Firestore for a given calendar date
 */
export async function fetchDailyTopScores(dateStr: string): Promise<LeaderboardEntry[]> {
  const path = `daily_leaderboards/${dateStr}/scores`;
  try {
    const scoresRef = collection(db, 'daily_leaderboards', dateStr, 'scores');
    const q = query(scoresRef, orderBy('score', 'desc'), limit(5));
    const snapshot = await getDocs(q);

    const scores: LeaderboardEntry[] = [];
    snapshot.forEach((d) => {
      scores.push({
        id: d.id,
        ...(d.data() as Omit<LeaderboardEntry, 'id'>),
      });
    });

    return scores;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Real-time listener for top 5 daily scores
 */
export function subscribeToDailyTopScores(
  dateStr: string,
  onUpdate: (scores: LeaderboardEntry[]) => void
): () => void {
  const path = `daily_leaderboards/${dateStr}/scores`;
  const scoresRef = collection(db, 'daily_leaderboards', dateStr, 'scores');
  const q = query(scoresRef, orderBy('score', 'desc'), limit(5));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const results: LeaderboardEntry[] = [];
      snapshot.forEach((d) => {
        results.push({
          id: d.id,
          ...(d.data() as Omit<LeaderboardEntry, 'id'>),
        });
      });
      onUpdate(results);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Submit player score to Firestore daily leaderboard
 */
export async function submitDailyScore(
  dateStr: string,
  playerName: string,
  score: number,
  linesCleared: number,
  maxCombo: number,
  mode: string
): Promise<boolean> {
  if (score <= 0) return false;
  const path = `daily_leaderboards/${dateStr}/scores`;
  const cleanId = `score_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    const docRef = doc(db, 'daily_leaderboards', dateStr, 'scores', cleanId);
    await setDoc(docRef, {
      id: cleanId,
      date: dateStr,
      playerName: playerName.slice(0, 32) || 'Prism Seeker',
      score: Math.floor(score),
      linesCleared: Math.floor(linesCleared),
      maxCombo: Math.floor(maxCombo),
      mode: mode.slice(0, 32),
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

/* ====================================================================
   DAILY CHALLENGE REAL-TIME CHAT
   ==================================================================== */

export interface DailyChatMessage {
  id: string;
  date: string;
  playerName: string;
  text: string;
  scoreBadge?: number;
  createdAt?: unknown;
}

export function subscribeToDailyChat(
  dateStr: string,
  onUpdate: (messages: DailyChatMessage[]) => void
): () => void {
  const path = `daily_chat/${dateStr}/messages`;
  const chatRef = collection(db, 'daily_chat', dateStr, 'messages');
  const q = query(chatRef, orderBy('createdAt', 'asc'), limit(50));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const msgs: DailyChatMessage[] = [];
      snapshot.forEach((d) => {
        msgs.push({
          id: d.id,
          ...(d.data() as Omit<DailyChatMessage, 'id'>),
        });
      });
      onUpdate(msgs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

export async function sendDailyChatMessage(
  dateStr: string,
  playerName: string,
  text: string,
  scoreBadge?: number
): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const path = `daily_chat/${dateStr}/messages`;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const docRef = doc(db, 'daily_chat', dateStr, 'messages', messageId);
    await setDoc(docRef, {
      id: messageId,
      date: dateStr,
      playerName: playerName.slice(0, 32) || 'Prism Seeker',
      text: trimmed.slice(0, 280),
      ...(scoreBadge ? { scoreBadge } : {}),
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

/* ====================================================================
   REAL-TIME 1v1 MULTIPLAYER DUEL
   ==================================================================== */

export interface MultiplayerRoom {
  roomId: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'in_progress' | 'finished';
  hostScore: number;
  hostHp: number; // 0 to 100
  hostLines: number;
  hostCombo: number;
  hostGridSummary: string; // concise 81-char string representation of filled cells
  guestId?: string;
  guestName?: string;
  guestScore?: number;
  guestHp?: number; // 0 to 100
  guestLines?: number;
  guestCombo?: number;
  guestGridSummary?: string;
  lastAttackText?: string;
  winnerId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function createMultiplayerRoom(
  roomId: string,
  hostName: string,
  hostId: string
): Promise<boolean> {
  const path = `multiplayer_rooms/${roomId}`;
  try {
    const docRef = doc(db, 'multiplayer_rooms', roomId);
    await setDoc(docRef, {
      roomId,
      hostId,
      hostName: hostName.slice(0, 32),
      status: 'waiting',
      hostScore: 0,
      hostHp: 100,
      hostLines: 0,
      hostCombo: 1,
      hostGridSummary: '0'.repeat(81),
      lastAttackText: 'Waiting for challenger to join...',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

export async function joinMultiplayerRoom(
  roomId: string,
  guestName: string,
  guestId: string
): Promise<boolean> {
  const path = `multiplayer_rooms/${roomId}`;
  try {
    const docRef = doc(db, 'multiplayer_rooms', roomId);
    await setDoc(
      docRef,
      {
        guestId,
        guestName: guestName.slice(0, 32),
        guestScore: 0,
        guestHp: 100,
        guestLines: 0,
        guestCombo: 1,
        guestGridSummary: '0'.repeat(81),
        status: 'in_progress',
        lastAttackText: `${guestName} joined the arena! Duel begun!`,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

export function subscribeToMultiplayerRoom(
  roomId: string,
  onUpdate: (room: MultiplayerRoom | null) => void
): () => void {
  const path = `multiplayer_rooms/${roomId}`;
  const docRef = doc(db, 'multiplayer_rooms', roomId);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as MultiplayerRoom);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function updateMultiplayerRoomState(
  roomId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const path = `multiplayer_rooms/${roomId}`;
  try {
    const docRef = doc(db, 'multiplayer_rooms', roomId);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchOpenMultiplayerRooms(): Promise<MultiplayerRoom[]> {
  const path = 'multiplayer_rooms';
  try {
    const roomsRef = collection(db, 'multiplayer_rooms');
    const q = query(roomsRef, limit(10));
    const snapshot = await getDocs(q);
    const rooms: MultiplayerRoom[] = [];
    snapshot.forEach((d) => {
      rooms.push(d.data() as MultiplayerRoom);
    });
    return rooms;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/* ====================================================================
   LIFETIME XP LEADERBOARD (FROM DAILY MISSIONS)
   ==================================================================== */

export interface LifetimeXpEntry {
  id: string;
  playerId: string;
  playerName: string;
  totalXp: number;
  level: number;
  title: string;
  missionsCompleted: number;
  updatedAt?: unknown;
}

/**
 * Fetch top lifetime XP leaderboard records from Firestore
 */
export async function fetchLifetimeXpLeaderboard(limitCount: number = 10): Promise<LifetimeXpEntry[]> {
  const path = 'lifetime_xp_leaderboard';
  try {
    const xpRef = collection(db, 'lifetime_xp_leaderboard');
    const q = query(xpRef, orderBy('totalXp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    const entries: LifetimeXpEntry[] = [];
    snapshot.forEach((d) => {
      entries.push({
        id: d.id,
        ...(d.data() as Omit<LifetimeXpEntry, 'id'>),
      });
    });

    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Real-time listener for Lifetime XP Leaderboard
 */
export function subscribeToLifetimeXpLeaderboard(
  onUpdate: (entries: LifetimeXpEntry[]) => void,
  limitCount: number = 10
): () => void {
  const path = 'lifetime_xp_leaderboard';
  const xpRef = collection(db, 'lifetime_xp_leaderboard');
  const q = query(xpRef, orderBy('totalXp', 'desc'), limit(limitCount));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const results: LifetimeXpEntry[] = [];
      snapshot.forEach((d) => {
        results.push({
          id: d.id,
          ...(d.data() as Omit<LifetimeXpEntry, 'id'>),
        });
      });
      onUpdate(results);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Submit or sync player lifetime XP to the Firestore collection
 */
export async function syncPlayerLifetimeXP(data: {
  playerId: string;
  playerName: string;
  totalXp: number;
  level: number;
  title: string;
  missionsCompleted: number;
}): Promise<boolean> {
  const { playerId, playerName, totalXp, level, title, missionsCompleted } = data;
  if (!playerId) return false;
  const path = `lifetime_xp_leaderboard/${playerId}`;

  try {
    const docRef = doc(db, 'lifetime_xp_leaderboard', playerId);
    await setDoc(
      docRef,
      {
        id: playerId,
        playerId,
        playerName: (playerName.trim() || 'Prism Seeker').slice(0, 32),
        totalXp: Math.floor(Math.max(0, totalXp)),
        level: Math.floor(Math.max(1, level)),
        title: (title || 'Prism Initiate').slice(0, 32),
        missionsCompleted: Math.floor(Math.max(0, missionsCompleted)),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}
