import React from 'react';
import { X, Layers, Flame, Sparkles, RotateCw, PlayCircle } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onStartInteractiveTutorial?: () => void;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onStartInteractiveTutorial,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-md max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">How to Play</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 py-3 overflow-y-auto pr-1 text-sm text-slate-300">
          <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <Layers className="h-6 w-6 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-0.5">Place Shapes & Clear Lines</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag pieces onto the 9x9 board. Complete any <strong>full horizontal row</strong>, <strong>full vertical column</strong>, or <strong>3x3 square zone</strong> to vaporize the gems and score points!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <Flame className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-0.5">Combos & Multi-Cascades</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear lines on consecutive turns to stack your <strong>Combo Multiplier</strong> (x2, x3, x4...). Clear multiple lines and zones in a single drop for explosive bonus points!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <Sparkles className="h-6 w-6 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-0.5">Prism Core & Frenzy Mode</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every gem clear feeds the <strong>Prism Core</strong>. Fill it to 100% to trigger <strong>Frenzy Rush</strong> for double points and sparkling cascade power!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <RotateCw className="h-6 w-6 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-0.5">Rotate & Power-Ups</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tap the rotate icon on any piece to spin it 90 degrees. Use the <strong>Prism Hammer</strong> to smash stubborn solitary tiles or <strong>Shuffle</strong> to redraw fresh pieces.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
          {onStartInteractiveTutorial && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartInteractiveTutorial();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 py-2.5 text-xs font-bold text-indigo-300 shadow-sm transition-all"
            >
              <PlayCircle className="h-4 w-4 text-indigo-400" />
              <span>Launch Interactive Visual Tutorial</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
