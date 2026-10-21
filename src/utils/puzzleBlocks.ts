import { GemType, Grid, Piece } from '../types/game';

export const GEM_PALETTE: GemType[] = [
  'ruby',
  'sapphire',
  'emerald',
  'amethyst',
  'amber',
  'diamond',
  'rose',
];

// Color descriptions & accessibility runes
export const GEM_META: Record<
  GemType,
  { name: string; bgClass: string; glowColor: string; symbol: string; textHex: string }
> = {
  ruby: {
    name: 'Ruby',
    bgClass: 'gem-facet-ruby',
    glowColor: 'rgba(225, 29, 72, 0.7)',
    symbol: '◆',
    textHex: '#f43f5e',
  },
  sapphire: {
    name: 'Sapphire',
    bgClass: 'gem-facet-sapphire',
    glowColor: 'rgba(2, 132, 199, 0.7)',
    symbol: '▲',
    textHex: '#38bdf8',
  },
  emerald: {
    name: 'Emerald',
    bgClass: 'gem-facet-emerald',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    symbol: '■',
    textHex: '#34d399',
  },
  amethyst: {
    name: 'Amethyst',
    bgClass: 'gem-facet-amethyst',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    symbol: '★',
    textHex: '#c084fc',
  },
  amber: {
    name: 'Amber',
    bgClass: 'gem-facet-amber',
    glowColor: 'rgba(245, 158, 11, 0.7)',
    symbol: '●',
    textHex: '#fbbf24',
  },
  diamond: {
    name: 'Diamond',
    bgClass: 'gem-facet-diamond',
    glowColor: 'rgba(56, 189, 248, 0.7)',
    symbol: '✦',
    textHex: '#7dd3fc',
  },
  rose: {
    name: 'Rose',
    bgClass: 'gem-facet-rose',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    symbol: '♥',
    textHex: '#f472b6',
  },
};

const SHAPES_LIBRARY: { name: string; shape: number[][] }[] = [
  // 1-dot
  { name: 'Mono Dot', shape: [[1]] },

  // 2-bars
  { name: 'Duet Bar H', shape: [[1, 1]] },
  { name: 'Duet Bar V', shape: [[1], [1]] },

  // 3-bars
  { name: 'Trio Bar H', shape: [[1, 1, 1]] },
  { name: 'Trio Bar V', shape: [[1], [1], [1]] },

  // 4-bars
  { name: 'Tetra Bar H', shape: [[1, 1, 1, 1]] },
  { name: 'Tetra Bar V', shape: [[1], [1], [1], [1]] },

  // 5-bars
  { name: 'Penta Bar H', shape: [[1, 1, 1, 1, 1]] },
  { name: 'Penta Bar V', shape: [[1], [1], [1], [1], [1]] },

  // 2x2 Square
  { name: 'Quad Core', shape: [[1, 1], [1, 1]] },

  // 3x3 Big Square
  { name: 'Grand Prism', shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },

  // Small L
  { name: 'Mini L 1', shape: [[1, 0], [1, 1]] },
  { name: 'Mini L 2', shape: [[0, 1], [1, 1]] },
  { name: 'Mini L 3', shape: [[1, 1], [1, 0]] },
  { name: 'Mini L 4', shape: [[1, 1], [0, 1]] },

  // Standard 3x2 L
  { name: 'L Trio 1', shape: [[1, 0], [1, 0], [1, 1]] },
  { name: 'L Trio 2', shape: [[0, 1], [0, 1], [1, 1]] },
  { name: 'L Trio 3', shape: [[1, 1], [1, 0], [1, 0]] },
  { name: 'L Trio 4', shape: [[1, 1], [0, 1], [0, 1]] },
  { name: 'L Wide 1', shape: [[1, 1, 1], [1, 0, 0]] },
  { name: 'L Wide 2', shape: [[1, 1, 1], [0, 0, 1]] },
  { name: 'L Wide 3', shape: [[1, 0, 0], [1, 1, 1]] },
  { name: 'L Wide 4', shape: [[0, 0, 1], [1, 1, 1]] },

  // Big Corner (3x3)
  { name: 'Grand Corner 1', shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
  { name: 'Grand Corner 2', shape: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },
  { name: 'Grand Corner 3', shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
  { name: 'Grand Corner 4', shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },

  // T-shapes
  { name: 'Tee Down', shape: [[1, 1, 1], [0, 1, 0]] },
  { name: 'Tee Up', shape: [[0, 1, 0], [1, 1, 1]] },
  { name: 'Tee Right', shape: [[1, 0], [1, 1], [1, 0]] },
  { name: 'Tee Left', shape: [[0, 1], [1, 1], [0, 1]] },

  // Z / S shapes
  { name: 'Zee H', shape: [[1, 1, 0], [0, 1, 1]] },
  { name: 'Ess H', shape: [[0, 1, 1], [1, 1, 0]] },
  { name: 'Zee V', shape: [[1, 0], [1, 1], [0, 1]] },
  { name: 'Ess V', shape: [[0, 1], [1, 1], [1, 0]] },

  // Cross
  { name: 'Solar Cross', shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] },

  // 2-dot diagonal
  { name: 'Twin Spark 1', shape: [[1, 0], [0, 1]] },
  { name: 'Twin Spark 2', shape: [[0, 1], [1, 0]] },
];

let pieceIdCounter = 0;

export function getRandomPiece(preferredGem?: GemType): Piece {
  const item = SHAPES_LIBRARY[Math.floor(Math.random() * SHAPES_LIBRARY.length)];
  const gemType = preferredGem || GEM_PALETTE[Math.floor(Math.random() * GEM_PALETTE.length)];
  pieceIdCounter++;
  return {
    id: `piece_${pieceIdCounter}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    shape: item.shape,
    gemType,
    name: item.name,
  };
}

export function generatePieceTrio(preferredGems?: GemType[]): Piece[] {
  return [
    getRandomPiece(preferredGems?.[0]),
    getRandomPiece(preferredGems?.[1]),
    getRandomPiece(preferredGems?.[2]),
  ];
}

// Rotate shape 90 degrees clockwise
export function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = [];

  for (let c = 0; c < cols; c++) {
    const newRow: number[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(matrix[r][c]);
    }
    result.push(newRow);
  }
  return result;
}

// Rotate a Piece clockwise
export function rotatePiece(piece: Piece): Piece {
  return {
    ...piece,
    shape: rotateMatrix(piece.shape),
  };
}

// Check if a piece can fit at (row, col)
export function canPlacePiece(grid: Grid, piece: Piece, startRow: number, startCol: number): boolean {
  const shape = piece.shape;
  const pRows = shape.length;
  const pCols = shape[0].length;

  if (startRow + pRows > 9 || startCol + pCols > 9 || startRow < 0 || startCol < 0) {
    return false;
  }

  for (let r = 0; r < pRows; r++) {
    for (let c = 0; c < pCols; c++) {
      if (shape[r][c] === 1) {
        const cell = grid[startRow + r][startCol + c];
        if (cell.gemType !== null || cell.special === 'stone') {
          return false;
        }
      }
    }
  }
  return true;
}

// Check if a piece can fit anywhere on the entire grid
export function canPlacePieceAnywhere(grid: Grid, piece: Piece): boolean {
  for (let r = 0; r <= 9 - piece.shape.length; r++) {
    for (let c = 0; c <= 9 - piece.shape[0].length; c++) {
      if (canPlacePiece(grid, piece, r, c)) {
        return true;
      }
    }
  }
  return false;
}

// Check if player has any moves remaining
export function hasAnyValidMove(grid: Grid, pieces: (Piece | null)[]): boolean {
  for (const piece of pieces) {
    if (piece && canPlacePieceAnywhere(grid, piece)) {
      return true;
    }
  }
  return false;
}

export interface ClearMatchResult {
  clearedRows: number[];
  clearedCols: number[];
  clearedBoxes: { boxRow: number; boxCol: number }[];
  cellsToClear: { r: number; c: number }[];
}

// Find all full rows, full columns, and full 3x3 blocks that will be cleared
export function findClearedMatches(grid: Grid): ClearMatchResult {
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];
  const clearedBoxes: { boxRow: number; boxCol: number }[] = [];
  const cellSet = new Set<string>();

  // Check rows
  for (let r = 0; r < 9; r++) {
    let full = true;
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].gemType === null && grid[r][c].special !== 'stone') {
        full = false;
        break;
      }
    }
    if (full) {
      clearedRows.push(r);
      for (let c = 0; c < 9; c++) {
        cellSet.add(`${r},${c}`);
      }
    }
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    let full = true;
    for (let r = 0; r < 9; r++) {
      if (grid[r][c].gemType === null && grid[r][c].special !== 'stone') {
        full = false;
        break;
      }
    }
    if (full) {
      clearedCols.push(c);
      for (let r = 0; r < 9; r++) {
        cellSet.add(`${r},${c}`);
      }
    }
  }

  // Check 3x3 boxes (9 boxes in total)
  for (let bRow = 0; bRow < 3; bRow++) {
    for (let bCol = 0; bCol < 3; bCol++) {
      let full = true;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = bRow * 3 + r;
          const col = bCol * 3 + c;
          if (grid[row][col].gemType === null && grid[row][col].special !== 'stone') {
            full = false;
            break;
          }
        }
        if (!full) break;
      }
      if (full) {
        clearedBoxes.push({ boxRow: bRow, boxCol: bCol });
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            cellSet.add(`${bRow * 3 + r},${bCol * 3 + c}`);
          }
        }
      }
    }
  }

  const cellsToClear: { r: number; c: number }[] = Array.from(cellSet).map(s => {
    const [r, c] = s.split(',').map(Number);
    return { r, c };
  });

  return {
    clearedRows,
    clearedCols,
    clearedBoxes,
    cellsToClear,
  };
}

export function createEmptyGrid(): Grid {
  const grid: Grid = [];
  for (let r = 0; r < 9; r++) {
    const row: Grid[0] = [];
    for (let c = 0; c < 9; c++) {
      row.push({
        gemType: null,
        special: 'normal',
      });
    }
    grid.push(row);
  }
  return grid;
}
