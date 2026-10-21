import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Star,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../audio/soundManager';

interface VideoAdModalProps {
  isOpen: boolean;
  onAdCompleted: () => void;
  onClose?: () => void;
  dailyStreak?: number;
}

export const VideoAdModal: React.FC<VideoAdModalProps> = ({
  isOpen,
  onAdCompleted,
  onClose,
  dailyStreak = 0,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [comboScore, setComboScore] = useState<number>(1200);
  const [multiplier, setMultiplier] = useState<number>(2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset state when opened
  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(5);
    setIsCompleted(false);

    // Audio chime on ad start
    soundManager.playPlace();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          try {
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#38bdf8', '#f59e0b', '#c084fc', '#10b981'],
            });
          } catch {}
          soundManager.playPowerUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Animated visual effects canvas for gameplay simulation
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f43f5e', '#f59e0b', '#10b981'];

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn ambient particles
      if (tick % 4 === 0 && particles.length < 50) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 2,
          vy: -(Math.random() * 2.5 + 1.5),
          size: Math.random() * 6 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.012;

        if (p.alpha <= 0 || p.y < -20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dynamic score & multiplier ticker
      if (tick % 30 === 0) {
        setComboScore((prev) => prev + Math.floor(Math.random() * 1200 + 800));
        setMultiplier((prev) => (prev >= 6 ? 2 : prev + 1));
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-3 sm:p-4 animate-pop-in">
      <div className="relative flex flex-col w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl overflow-hidden">
        {/* AdMob Video Ad Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/20 border border-amber-500/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
              Ad • 1 of 1
            </span>
            <span className="text-[11px] text-slate-400">
              Sponsored by <strong className="text-white">Google Play Games</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Countdown / Skip / Close */}
            {isCompleted ? (
              <button
                type="button"
                onClick={onAdCompleted}
                className="flex items-center gap-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 font-bold text-xs hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                <span>Claim</span>
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="rounded bg-slate-800 px-2 py-0.5 font-mono-nums font-bold text-slate-300 text-[11px]">
                Reward in {timeLeft}s
              </span>
            )}
          </div>
        </div>

        {/* Video Simulation Canvas Stage */}
        <div className="relative h-64 sm:h-72 w-full bg-gradient-to-b from-indigo-950/80 via-slate-950 to-purple-950/90 flex flex-col items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={380}
            height={280}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Simulated Video Ad Gameplay Showcase */}
          <div className="z-10 flex flex-col items-center text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/30 animate-pulse mb-3">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                <Sparkles className="h-7 w-7 text-cyan-300" />
              </div>
            </div>

            <h3 className="text-lg font-black tracking-wide text-white drop-shadow-md">
              Lumina: Prism Puzzle Odyssey
            </h3>

            {/* Live combo ticker */}
            <div className="mt-2 flex items-center gap-2 rounded-full bg-slate-900/90 border border-slate-700/80 px-3 py-1 shadow-inner">
              <span className="text-xs font-bold text-amber-400">
                Combo x{multiplier}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono-nums font-bold text-cyan-300">
                +{comboScore.toLocaleString()} PTS
              </span>
            </div>

            {/* Play Store ratings */}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white font-mono-nums">4.9</span>
              <span className="text-slate-400">• Editors' Choice</span>
            </div>
          </div>

          {/* 5-second countdown progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - timeLeft) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Ad Call to Action & Play Store Card */}
        <div className="p-3.5 bg-slate-900/95 border-t border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Google Play Free Download</span>
              <span className="text-[11px] text-slate-400">No Ads with Play Pass • 4.9 ★ Rating</span>
            </div>
            <a
              href="https://play.google.com/store/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Install Free</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Post-Ad Reward Unlock Status */}
          {isCompleted ? (
            <div className="flex flex-col gap-2 pt-1 animate-fade-in">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 p-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Ad Complete!</strong> Daily Streak & Reward Unlocked!
                </span>
              </div>

              <button
                type="button"
                onClick={onAdCompleted}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-amber-300 transition-all cursor-pointer"
              >
                <Flame className="h-4 w-4 fill-slate-950" />
                <span>Open Daily Streak & Claim Bounty</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Checking Daily Streak verification...</span>
              <span className="font-mono-nums font-bold text-amber-300">
                {timeLeft}s remaining
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
