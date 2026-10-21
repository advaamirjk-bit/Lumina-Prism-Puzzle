import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../audio/soundManager';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Layers,
  RotateCw,
  Flame,
  Hammer,
  CheckCircle2,
  Move,
  Zap,
} from 'lucide-react';

export interface TutorialStep {
  id: string;
  targetId: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  actionPrompt: string;
  showDragVisual?: boolean;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'lattice',
    targetId: 'tutorial-target-board',
    title: 'The 9x9 Jewel Lattice & 3x3 Zones',
    badge: 'Step 1: The Board',
    description:
      'Lumina is played on a 9x9 crystal grid partitioned into nine 3x3 zones. Unlike classic line puzzles, you can clear full horizontal lines, full vertical lines, AND 3x3 square blocks!',
    icon: <Sparkles className="h-5 w-5 text-indigo-400" />,
    actionPrompt: 'Observe the 9x9 board and shaded 3x3 boundary zones',
  },
  {
    id: 'dock',
    targetId: 'tutorial-target-dock',
    title: 'The Piece Dock & Drag Controls',
    badge: 'Step 2: Controls',
    description:
      'Pieces appear in trios in your dock below. Drag any piece directly onto the board with your mouse or finger, OR click a piece to select it and tap a cell on the board. Tap the rotate icon on any piece to spin it 90°!',
    icon: <Move className="h-5 w-5 text-purple-400" />,
    actionPrompt: 'Drag or click-and-place polyominos from dock to lattice',
    showDragVisual: true,
  },
  {
    id: 'previews',
    targetId: 'tutorial-target-board',
    title: 'Electric Match Previews',
    badge: 'Step 3: Line Clears',
    description:
      'As you drag or hover a piece over the grid, matching rows, columns, or 3x3 blocks immediately ignite with an electric amber glow. Release to vaporize those lines in a burst of sparkling crystal shards!',
    icon: <Layers className="h-5 w-5 text-amber-400" />,
    actionPrompt: 'Watch for glowing amber cells before dropping your piece',
  },
  {
    id: 'combos',
    targetId: 'tutorial-target-hud',
    title: 'Combos & The Frenzy Core',
    badge: 'Step 4: Scoring',
    description:
      'Clear lines on consecutive moves to build your Combo streak (x2, x3, x4...) with harmonic chime chords! Clearing jewels also charges your Frenzy Core; reach 100% to unleash double score frenzy.',
    icon: <Flame className="h-5 w-5 text-rose-400" />,
    actionPrompt: 'Chain clears consecutively for maximum points',
  },
  {
    id: 'powerups',
    targetId: 'tutorial-target-powerups',
    title: 'Emergency Power-Ups',
    badge: 'Step 5: Tactical Tools',
    description:
      'Lattice getting crowded? Select the Prism Hammer to shatter any single obstructing cell, or tap Shuffle to redraw a fresh trio of dock pieces.',
    icon: <Hammer className="h-5 w-5 text-amber-400" />,
    actionPrompt: 'Keep hammers ready for difficult piece placements',
  },
];

interface InteractiveTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  isOpen,
  onComplete,
  onSkip,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = TUTORIAL_STEPS[currentStepIndex];

  // Update spotlight bounding box based on current step target
  useEffect(() => {
    if (!isOpen || !step) return;

    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const handleEvents = () => updateRect();
    window.addEventListener('resize', handleEvents);
    window.addEventListener('scroll', handleEvents);

    const timer = setTimeout(updateRect, 100);

    return () => {
      window.removeEventListener('resize', handleEvents);
      window.removeEventListener('scroll', handleEvents);
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIndex, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    soundManager.playClick();
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      soundManager.playPowerUp();
      onComplete();
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    soundManager.playClick();
    onSkip();
  };

  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  // Decide whether guidance card should sit top or bottom based on target position
  const isTargetInUpperHalf = targetRect
    ? targetRect.top + targetRect.height / 2 < window.innerHeight / 2
    : false;

  const spotlightPadding = 10;
  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        left: `${Math.max(4, targetRect.left - spotlightPadding)}px`,
        top: `${Math.max(4, targetRect.top - spotlightPadding)}px`,
        width: `${targetRect.width + spotlightPadding * 2}px`,
        height: `${targetRect.height + spotlightPadding * 2}px`,
        borderRadius: '18px',
        boxShadow: '0 0 0 9999px rgba(3, 7, 18, 0.82)',
        pointerEvents: 'none',
        zIndex: 60,
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    : {};

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden">
      {/* Background Dimmer Fallback if no target element */}
      {!targetRect && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs" />
      )}

      {/* Spotlight cutout around the target UI element */}
      {targetRect && (
        <div
          style={spotlightStyle}
          className="border-2 border-indigo-400 ring-4 ring-indigo-500/25 shadow-2xl shadow-indigo-500/20"
        >
          {/* Animated corner accents on the spotlight */}
          <span className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-amber-400 rounded-tl-sm animate-pulse" />
          <span className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-amber-400 rounded-tr-sm animate-pulse" />
          <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-amber-400 rounded-bl-sm animate-pulse" />
          <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-amber-400 rounded-br-sm animate-pulse" />
        </div>
      )}

      {/* Animated Drag Demonstration Hint on Step 2 */}
      {step.showDragVisual && targetRect && (
        <div className="fixed inset-0 pointer-events-none z-65 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [120, 20, -140, -180],
              scale: [0.9, 1.05, 1.05, 0.9],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.2, 0.8, 1],
            }}
            className="flex flex-col items-center gap-2 rounded-2xl bg-indigo-600/90 text-white px-4 py-2.5 shadow-2xl border border-indigo-300/40 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <Move className="h-5 w-5 animate-pulse text-amber-300" />
              <span className="text-xs font-bold tracking-wide">Drag Piece Onto Grid</span>
            </div>
            {/* Visual Mini Piece Preview */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-lg">
              <div className="h-3 w-3 rounded-xs bg-amber-400" />
              <div className="h-3 w-3 rounded-xs bg-amber-400" />
              <div className="h-3 w-3 rounded-xs bg-amber-400" />
              <div className="h-3 w-3 rounded-xs bg-transparent" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Tutorial Guidance Card */}
      <div
        className={`fixed inset-x-0 z-70 flex justify-center px-4 pointer-events-none ${
          isTargetInUpperHalf ? 'bottom-6 sm:bottom-10' : 'top-16 sm:top-20'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: isTargetInUpperHalf ? 20 : -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isTargetInUpperHalf ? 20 : -20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto w-full max-w-lg rounded-2xl border border-indigo-500/40 bg-slate-900/95 p-5 shadow-2xl shadow-indigo-500/25 backdrop-blur-md"
          >
            {/* Step header */}
            <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 shadow-inner">
                  {step.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                    {step.badge} · {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white">{step.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                title="Skip tutorial"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              {step.description}
            </p>

            {/* Action prompt badge */}
            {step.actionPrompt && (
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-xl px-3 py-1.5 mb-4 shadow-xs">
                <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="font-semibold">{step.actionPrompt}</span>
              </div>
            )}

            {/* Step navigation & progress */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              {/* Dots Progress */}
              <div className="flex items-center gap-1.5">
                {TUTORIAL_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setCurrentStepIndex(idx);
                    }}
                    title={`Go to step ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentStepIndex
                        ? 'w-6 bg-gradient-to-r from-indigo-400 to-purple-400'
                        : idx < currentStepIndex
                        ? 'w-2 bg-indigo-600 hover:bg-indigo-500'
                        : 'w-2 bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Skip Tour
                </button>

                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 transition-all cursor-pointer"
                >
                  {isLastStep ? (
                    <>
                      <span>Start Playing</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    </>
                  ) : (
                    <>
                      <span>Next Step</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
