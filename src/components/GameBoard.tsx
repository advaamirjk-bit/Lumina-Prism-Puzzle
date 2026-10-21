import React from 'react';
import { Cell, FloatingScore, GemType, Grid } from '../types/game';
import { GEM_META } from '../utils/puzzleBlocks';
import { motion, AnimatePresence } from 'motion/react';

interface GameBoardProps {
  grid: Grid;
  previewPlacement: { r: number; c: number; shape: number[][]; gemType: GemType } | null;
  highlightedClears: { rows: number[]; cols: number[]; boxes: { boxRow: number; boxCol: number }[] };
  floatingScores: FloatingScore[];
  colorblindMode: boolean;
  activePowerUp: string | null;
  onCellClick: (row: number, col: number) => void;
  onCellMouseEnter: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  previewPlacement,
  highlightedClears,
  floatingScores,
  colorblindMode,
  activePowerUp,
  onCellClick,
  onCellMouseEnter,
}) => {
  // Compute ghost cells from previewPlacement
  const ghostCells = new Map<string, GemType>();
  if (previewPlacement) {
    const { r: startR, c: startC, shape, gemType } = previewPlacement;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c] === 1) {
          const targetR = startR + r;
          const targetC = startC + c;
          if (targetR >= 0 && targetR < 9 && targetC >= 0 && targetC < 9) {
            ghostCells.set(`${targetR},${targetC}`, gemType);
          }
        }
      }
    }
  }

  // Pre-calculate which cells are in will-clear rows, cols, or 3x3 boxes
  const willClearCells = new Set<string>();
  highlightedClears.rows.forEach(r => {
    for (let c = 0; c < 9; c++) willClearCells.add(`${r},${c}`);
  });
  highlightedClears.cols.forEach(c => {
    for (let r = 0; r < 9; r++) willClearCells.add(`${r},${c}`);
  });
  highlightedClears.boxes.forEach(({ boxRow, boxCol }) => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        willClearCells.add(`${boxRow * 3 + r},${boxCol * 3 + c}`);
      }
    }
  });

  return (
    <div className="relative flex items-center justify-center p-2 sm:p-4">
      {/* Outer decorative bezel */}
      <div
        id="tutorial-target-board"
        className="relative rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-black/95 p-3 sm:p-4.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
      >
        {/* Glowing border accents */}
        <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-amber-500/15 opacity-60 blur-sm" />

        {/* Floating Scores Overlay */}
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          <AnimatePresence>
            {floatingScores.map(score => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: -45, scale: score.isCombo ? 1.3 : 1.05 }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: `${score.x}%`,
                  top: `${score.y}%`,
                  color: score.color,
                  textShadow: `0 0 14px ${score.color}, 0 2px 4px rgba(0,0,0,0.9)`,
                }}
                className={`font-mono-nums font-black tracking-wider ${
                  score.isCombo ? 'text-lg sm:text-xl font-extrabold' : 'text-sm sm:text-base'
                }`}
              >
                {score.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 9x9 Grid Table */}
        <div
          className="relative grid grid-cols-9 gap-1 sm:gap-1.5 rounded-xl bg-slate-950/90 p-2 sm:p-2.5 shadow-inner"
          style={{ width: 'min(88vw, 440px)', height: 'min(88vw, 440px)' }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const cellKey = `${r},${c}`;
              const ghostGem = ghostCells.get(cellKey);
              const willClear = willClearCells.has(cellKey);

              // 3x3 block visual borders
              const isBorderRight = (c + 1) % 3 === 0 && c !== 8;
              const isBorderBottom = (r + 1) % 3 === 0 && r !== 8;

              return (
                <div
                  key={cellKey}
                  data-cell-row={r}
                  data-cell-col={c}
                  onClick={() => onCellClick(r, c)}
                  onMouseEnter={() => onCellMouseEnter(r, c)}
                  className={`grid-cell-tile group relative flex items-center justify-center rounded-lg transition-all duration-150 select-none ${
                    isBorderRight ? 'mr-1 sm:mr-1.5' : ''
                  } ${isBorderBottom ? 'mb-1 sm:mb-1.5' : ''} ${
                    activePowerUp === 'hammer'
                      ? 'cursor-crosshair ring-1 hover:ring-amber-400'
                      : activePowerUp === 'bomb'
                      ? 'cursor-crosshair ring-1 hover:ring-rose-400'
                      : 'cursor-pointer'
                  }`}
                  style={{
                    backgroundColor:
                      cell.gemType === null && !ghostGem
                        ? 'rgba(15, 23, 42, 0.75)'
                        : undefined,
                  }}
                >
                  {/* Empty cell inset indentation */}
                  {cell.gemType === null && !ghostGem && (
                    <div className="absolute inset-0.5 rounded-md border border-slate-800/80 shadow-inner group-hover:border-slate-700/80 transition-colors" />
                  )}

                  {/* Will clear electric glow indicator */}
                  {willClear && (
                    <div className="pointer-events-none absolute -inset-0.5 rounded-lg bg-amber-400/30 ring-2 ring-amber-300 animate-pulse z-20" />
                  )}

                  {/* Ghost piece preview */}
                  {ghostGem && cell.gemType === null && (
                    <div
                      className={`h-full w-full rounded-md opacity-55 scale-95 ring-2 ring-white/60 transition-transform ${
                        GEM_META[ghostGem].bgClass
                      }`}
                    >
                      {colorblindMode && (
                        <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/90">
                          {GEM_META[ghostGem].symbol}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Filled Gemstone */}
                  {cell.gemType !== null && (
                    <div
                      style={{
                        filter: cell.isDecaying && cell.decayTurns !== undefined
                          ? `brightness(${Math.max(0.38, 1 - (1 - cell.decayTurns / (cell.decayMaxTurns || 15)) * 0.62)}) saturate(${Math.max(0.35, 1 - (1 - cell.decayTurns / (cell.decayMaxTurns || 15)) * 0.65)})`
                          : undefined,
                      }}
                      className={`relative flex h-full w-full items-center justify-center rounded-md text-white transition-all ${
                        cell.isClearing
                          ? 'animate-clear-dissolve'
                          : 'animate-pop-in'
                      } ${GEM_META[cell.gemType].bgClass}`}
                    >
                      {/* Top bevel gloss highlight */}
                      <div className="pointer-events-none absolute inset-x-1 top-0.5 h-1/3 rounded-t-sm bg-gradient-to-b from-white/50 to-transparent" />

                      {/* Bottom refraction shade */}
                      <div className="pointer-events-none absolute inset-x-0.5 bottom-0.5 h-1/4 rounded-b-sm bg-black/25" />

                      {/* Crystal Decay: creeping fissures & stone calcification */}
                      {cell.isDecaying && (
                        <div
                          className="pointer-events-none absolute inset-0 rounded-md bg-slate-900/40 mix-blend-multiply border border-slate-700/50"
                          style={{
                            opacity: Math.min(0.85, (1 - (cell.decayTurns ?? 15) / (cell.decayMaxTurns || 15)) * 0.9),
                          }}
                        />
                      )}

                      {/* Colorblind symbol / Jewel facet rune */}
                      {colorblindMode ? (
                        <span className="z-10 text-[11px] font-bold text-white drop-shadow-md">
                          {GEM_META[cell.gemType].symbol}
                        </span>
                      ) : (
                        <div className="z-10 h-1.5 w-1.5 rounded-full bg-white/40 shadow-sm" />
                      )}

                      {/* Frozen Ice Coating Overlay */}
                      {cell.special === 'frozen' && (
                        <div className="absolute inset-0 rounded-md border-2 border-cyan-200/90 bg-cyan-400/35 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="text-[12px] text-cyan-100 drop-shadow">❄</span>
                        </div>
                      )}

                      {/* Crystal Decay: Turns countdown badge */}
                      {cell.isDecaying && cell.decayTurns !== undefined && (
                        <div
                          className={`pointer-events-none absolute -top-1 -right-1 z-30 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[8.5px] font-mono-nums font-black shadow-md ${
                            cell.decayTurns <= 3
                              ? 'bg-rose-500 text-white animate-pulse ring-1 ring-white shadow-rose-500/60'
                              : cell.decayTurns <= 7
                              ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-300 shadow-amber-500/40 font-bold'
                              : 'bg-slate-900/95 text-cyan-200 border border-slate-700 shadow-black/60'
                          }`}
                        >
                          {cell.decayTurns}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stone Obstacle */}
                  {cell.special === 'stone' && (
                    <div className="gem-facet-stone relative flex h-full w-full items-center justify-center rounded-md text-slate-300 shadow-inner group-hover:brightness-110 transition-all">
                      <div className="pointer-events-none absolute inset-x-1 top-0.5 h-1/4 rounded-t-sm bg-white/10" />
                      <span className="text-[10px] font-black tracking-tighter text-slate-400 select-none drop-shadow">
                        ▲
                      </span>
                      <div className="pointer-events-none absolute bottom-0.5 inset-x-0.5 flex justify-center">
                        <span className="text-[7px] font-mono-nums text-slate-400 font-semibold tracking-wider">
                          STONE
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
