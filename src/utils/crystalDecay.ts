import { Grid, GameMode } from '../types/game';

export interface CrystalDecayTurnResult {
  nextGrid: Grid;
  newlyDecayedCount: number;
  newlyTurnedToStoneCount: number;
  stoneCoords: { r: number; c: number }[];
  activeDecayingCount: number;
  currentDecayLimit: number;
}

/**
 * An outer edge cell is along the perimeter of the 9x9 board (rows 0 and 8, or columns 0 and 8).
 */
export function isOuterEdgeCell(r: number, c: number): boolean {
  return r === 0 || r === 8 || c === 0 || c === 8;
}

/**
 * Returns the maximum turns before outer edge gems petrify into stone.
 * Scales down with score to increase difficulty as the endless run progresses.
 * Base: 15 turns.
 */
export function getDecayThresholdForScore(score: number): number {
  if (score < 4000) return 15;
  if (score < 10000) return 13;
  if (score < 20000) return 11;
  if (score < 35000) return 9;
  return 8;
}

/**
 * Evaluates Crystal Decay progression for all outer edge cells when a move is completed in Classic Endless mode.
 */
export function processCrystalDecayOnMove(
  grid: Grid,
  mode: GameMode,
  score: number
): CrystalDecayTurnResult {
  const threshold = getDecayThresholdForScore(score);
  let activeDecayingCount = 0;
  let newlyDecayedCount = 0;
  let newlyTurnedToStoneCount = 0;
  const stoneCoords: { r: number; c: number }[] = [];

  const nextGrid: Grid = grid.map((row, r) =>
    row.map((cell, c) => {
      // Crystal decay only operates in Classic Endless mode
      if (mode !== 'CLASSIC_ENDLESS') {
        return { ...cell, isDecaying: false, decayTurns: undefined };
      }

      // Check if it's an outer perimeter cell
      const isEdge = isOuterEdgeCell(r, c);

      // If already a stone blocker, preserve stone state
      if (cell.special === 'stone') {
        return {
          ...cell,
          special: 'stone',
          decayTurns: undefined,
          isDecaying: false,
        };
      }

      // If empty cell, reset any decay state
      if (cell.gemType === null) {
        return {
          ...cell,
          decayTurns: undefined,
          isDecaying: false,
        };
      }

      // Interior gems (not on perimeter) do not decay
      if (!isEdge) {
        return {
          ...cell,
          decayTurns: undefined,
          isDecaying: false,
        };
      }

      // Outer edge gem!
      const currentMax = cell.decayMaxTurns || threshold;
      let remainingTurns = cell.decayTurns;

      if (remainingTurns === undefined) {
        // Newly placed edge gem gets initialized to current decay threshold
        remainingTurns = threshold;
        newlyDecayedCount++;
      } else {
        remainingTurns -= 1;
      }

      if (remainingTurns <= 0) {
        // Gem petrifies into an inert stone obstacle!
        newlyTurnedToStoneCount++;
        stoneCoords.push({ r, c });
        return {
          ...cell,
          gemType: null,
          special: 'stone',
          decayTurns: undefined,
          isDecaying: false,
          decayMaxTurns: undefined,
        };
      }

      // Still decaying
      activeDecayingCount++;
      return {
        ...cell,
        decayTurns: remainingTurns,
        decayMaxTurns: currentMax,
        isDecaying: true,
      };
    })
  );

  return {
    nextGrid,
    newlyDecayedCount,
    newlyTurnedToStoneCount,
    stoneCoords,
    activeDecayingCount,
    currentDecayLimit: threshold,
  };
}

/**
 * Returns a summary of current decay state across the grid for HUD display and warnings
 */
export function getDecayingCellsSummary(grid: Grid): {
  totalDecaying: number;
  imminentDanger: number; // turns <= 3
  stoneCount: number;
} {
  let totalDecaying = 0;
  let imminentDanger = 0;
  let stoneCount = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = grid[r]?.[c];
      if (!cell) continue;
      if (cell.special === 'stone') {
        stoneCount++;
      } else if (cell.isDecaying && cell.decayTurns !== undefined) {
        totalDecaying++;
        if (cell.decayTurns <= 3) {
          imminentDanger++;
        }
      }
    }
  }

  return { totalDecaying, imminentDanger, stoneCount };
}
