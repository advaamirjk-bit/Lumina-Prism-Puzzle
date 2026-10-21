import React from 'react';
import { QUEST_LEVELS } from '../../utils/questLevels';
import { Star, Lock, X } from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  levelStars: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  levelStars,
  onSelectLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  // Level is unlocked if level 1, or previous level has >= 1 star
  const isUnlocked = (lvlId: number) => {
    if (lvlId === 1) return true;
    return (levelStars[lvlId - 1] ?? 0) >= 1;
  };

  const totalStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-md max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Constellation Quest</h2>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-0.5">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{totalStars} / 36 Stars Earned</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-4 overflow-y-auto pr-1">
          {QUEST_LEVELS.map((level) => {
            const unlocked = isUnlocked(level.id);
            const stars = levelStars[level.id] || 0;

            return (
              <button
                key={level.id}
                type="button"
                disabled={!unlocked}
                onClick={() => {
                  if (unlocked) {
                    onSelectLevel(level.id);
                    onClose();
                  }
                }}
                className={`relative flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                  unlocked
                    ? 'border-slate-800 bg-slate-950/80 hover:border-indigo-500 hover:bg-indigo-950/30 hover:scale-105 cursor-pointer'
                    : 'border-slate-900 bg-slate-950/40 opacity-40 cursor-not-allowed'
                }`}
              >
                {unlocked ? (
                  <>
                    <span className="font-mono-nums text-lg font-bold text-white mb-1">
                      {level.id}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`h-3 w-3 ${
                            stars >= starIdx ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <Lock className="h-5 w-5 text-slate-600 my-2" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Earn stars by clearing level objectives and hitting high score targets.
          </p>
        </div>
      </div>
    </div>
  );
};
