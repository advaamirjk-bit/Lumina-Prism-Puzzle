import React from 'react';
import { Piece } from '../types/game';
import { GEM_META } from '../utils/puzzleBlocks';
import { RotateCw } from 'lucide-react';

interface PieceDockProps {
  pieces: (Piece | null)[];
  selectedPieceIndex: number | null;
  validityMap: boolean[]; // whether piece[i] can fit on grid
  colorblindMode: boolean;
  onSelectPiece: (index: number) => void;
  onRotatePiece: (index: number) => void;
  onDragStartPiece: (index: number, e: React.DragEvent) => void;
}

export const PieceDock: React.FC<PieceDockProps> = ({
  pieces,
  selectedPieceIndex,
  validityMap,
  colorblindMode,
  onSelectPiece,
  onRotatePiece,
  onDragStartPiece,
}) => {
  return (
    <div
      id="tutorial-target-dock"
      className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 w-full max-w-lg mx-auto px-1 sm:px-2"
    >
      {/* 3 Pieces Grid - Cleanly scaled for mobile viewports */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5 w-full">
        {pieces.map((piece, idx) => {
          if (!piece) {
            return (
              <div
                key={`empty-slot-${idx}`}
                className="flex h-24 sm:h-28 md:h-32 items-center justify-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/40 select-none"
              >
                <span className="text-[11px] text-slate-700 font-medium">Empty</span>
              </div>
            );
          }

          const isSelected = selectedPieceIndex === idx;
          const canFit = validityMap[idx] ?? true;
          const rows = piece.shape.length;
          const cols = piece.shape[0].length;

          return (
            <div
              key={piece.id}
              onClick={() => onSelectPiece(idx)}
              draggable={canFit}
              onDragStart={(e) => onDragStartPiece(idx, e)}
              className={`dock-piece-card group relative flex h-24 sm:h-28 md:h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border p-1.5 sm:p-2 transition-all duration-200 select-none touch-manipulation ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-950/50 shadow-lg shadow-indigo-500/25 scale-[1.03] ring-1 ring-indigo-400/40'
                  : 'border-slate-800/90 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900/95'
              } ${!canFit ? 'opacity-40 grayscale-[40%]' : 'hover:scale-[1.02]'}`}
            >
              {/* Piece Matrix */}
              <div
                className="grid gap-0.5 sm:gap-1 items-center justify-center"
                style={{
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {piece.shape.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`piece-${piece.id}-${r}-${c}`}
                      className={`h-4.5 w-4.5 sm:h-5 sm:w-5 md:h-6 md:w-6 rounded-md transition-transform ${
                        cell === 1
                          ? `${GEM_META[piece.gemType].bgClass} relative flex items-center justify-center text-white shadow-sm`
                          : 'invisible'
                      }`}
                    >
                      {cell === 1 && (
                        <>
                          <div className="pointer-events-none absolute inset-x-0.5 top-0.5 h-1/3 rounded-t-sm bg-gradient-to-b from-white/50 to-transparent" />
                          {colorblindMode && (
                            <span className="text-[8px] sm:text-[9px] font-bold text-white/90">
                              {GEM_META[piece.gemType].symbol}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Mobile-Friendly Rotate Button (Visible on mobile or hover/selection) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRotatePiece(idx);
                }}
                title="Rotate piece 90°"
                className={`absolute top-1.5 right-1.5 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-all ${
                  isSelected
                    ? 'opacity-100 bg-indigo-900/80 text-indigo-200 ring-1 ring-indigo-400/40'
                    : 'opacity-80 sm:opacity-0 group-hover:opacity-100 bg-slate-800/60'
                }`}
              >
                <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>

              {/* Unfit warning subtle chip */}
              {!canFit && (
                <span className="absolute bottom-1 text-[9px] sm:text-[10px] text-rose-400 font-bold tracking-tight">
                  No Fit
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Touch-Friendly Compact Tip */}
      <div className="flex items-center justify-center text-[10px] sm:text-xs text-slate-400 gap-1.5 select-none">
        <span>Tap to pick & place</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>Tap ↻ to rotate</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>Drag to drop</span>
      </div>
    </div>
  );
};
