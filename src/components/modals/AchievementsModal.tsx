import React from 'react';
import { Achievement } from '../../types/game';
import { Trophy, X, CheckCircle2 } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  achievements,
  onClose,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-md max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Achievements</h2>
            <span className="text-xs font-mono-nums text-slate-400">
              ({unlockedCount}/{achievements.length})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2.5 py-4 overflow-y-auto pr-1">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                item.unlocked
                  ? 'border-indigo-500/40 bg-indigo-950/20 shadow-sm'
                  : 'border-slate-800/80 bg-slate-950/50 opacity-60'
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold border ${
                  item.unlocked
                    ? 'border-amber-400/50 bg-amber-400/10 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
              >
                {item.icon}
              </div>

              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      item.unlocked ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.unlocked && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {item.description}
                </p>

                {/* Progress bar */}
                {!item.unlocked && item.maxProgress > 1 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-indigo-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((item.progress / item.maxProgress) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono-nums text-[10px] text-slate-500">
                      {item.progress}/{item.maxProgress}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
