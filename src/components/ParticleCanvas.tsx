import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticleCanvasRef {
  burst: (x: number, y: number, colorHex: string, count?: number, isSuper?: boolean) => void;
  shockwave: (x: number, y: number, colorHex: string) => void;
  epicVictorySequence: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  isStar?: boolean;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const ParticleCanvas = forwardRef<ParticleCanvasRef, { frenzyActive?: boolean }>(
  ({ frenzyActive }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const shockwavesRef = useRef<Shockwave[]>([]);
    const animFrameRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      burst: (x: number, y: number, colorHex: string, count = 20, isSuper = false) => {
        const pList = particlesRef.current;
        const total = isSuper ? count * 1.8 : count;

        for (let i = 0; i < total; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 5 + 2) * (isSuper ? 1.5 : 1);
          pList.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 5 + 3,
            alpha: 1,
            color: colorHex,
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.2,
            life: 0,
            maxLife: Math.random() * 25 + 25,
            isStar: Math.random() > 0.4,
          });
        }
      },
      shockwave: (x: number, y: number, colorHex: string) => {
        shockwavesRef.current.push({
          x,
          y,
          radius: 10,
          maxRadius: 180,
          alpha: 0.9,
          color: colorHex,
        });
      },
      epicVictorySequence: () => {
        const canvas = canvasRef.current;
        const w = canvas ? canvas.width : window.innerWidth;
        const h = canvas ? canvas.height : window.innerHeight;
        const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#10b981', '#ffffff'];

        // Staggered firework bursts
        const burstPoints = [
          { x: w * 0.5, y: h * 0.35, delay: 0 },
          { x: w * 0.25, y: h * 0.45, delay: 250 },
          { x: w * 0.75, y: h * 0.4, delay: 500 },
          { x: w * 0.38, y: h * 0.25, delay: 800 },
          { x: w * 0.62, y: h * 0.3, delay: 1100 },
          { x: w * 0.5, y: h * 0.45, delay: 1400 },
        ];

        burstPoints.forEach(({ x, y, delay }, idx) => {
          setTimeout(() => {
            const pList = particlesRef.current;
            const color = colors[idx % colors.length];

            // Emits grand celebration shards
            for (let i = 0; i < 45; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 8 + 3;
              pList.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 4,
                alpha: 1,
                color,
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.3,
                life: 0,
                maxLife: Math.random() * 40 + 45,
                isStar: true,
              });
            }

            shockwavesRef.current.push({
              x,
              y,
              radius: 12,
              maxRadius: 240,
              alpha: 0.95,
              color,
            });
          }, delay);
        });
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      };

      resize();
      window.addEventListener('resize', resize);

      let lastFrenzySpawn = 0;

      const loop = (timestamp: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ambient Frenzy stardust
        if (frenzyActive && timestamp - lastFrenzySpawn > 120) {
          lastFrenzySpawn = timestamp;
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2.5 - 1.5,
            size: Math.random() * 3.5 + 2,
            alpha: 0.8,
            color: '#fbbf24',
            rotation: 0,
            vRot: 0.05,
            life: 0,
            maxLife: 60,
            isStar: true,
          });
        }

        // Render Shockwaves
        for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
          const sw = shockwavesRef.current[i];
          sw.radius += 6;
          sw.alpha *= 0.93;

          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = 4 * sw.alpha;
          ctx.globalAlpha = sw.alpha;
          ctx.shadowBlur = 15;
          ctx.shadowColor = sw.color;
          ctx.stroke();
          ctx.restore();

          if (sw.radius >= sw.maxRadius || sw.alpha <= 0.03) {
            shockwavesRef.current.splice(i, 1);
          }
        }

        // Render Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy = p.vy * 0.95 + 0.12; // gentle stardust gravity
          p.rotation += p.vRot;
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;

          if (p.isStar) {
            // Draw four-pointed diamond star
            ctx.beginPath();
            const s = p.size;
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.3, -s * 0.3);
            ctx.lineTo(s, 0);
            ctx.lineTo(s * 0.3, s * 0.3);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.3, s * 0.3);
            ctx.lineTo(-s, 0);
            ctx.lineTo(-s * 0.3, -s * 0.3);
            ctx.closePath();
            ctx.fill();
          } else {
            // Hexagon jewel shard
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          if (p.life >= p.maxLife || p.alpha <= 0.02) {
            particlesRef.current.splice(i, 1);
          }
        }

        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);

      return () => {
        window.removeEventListener('resize', resize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, [frenzyActive]);

    return (
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      />
    );
  }
);

ParticleCanvas.displayName = 'ParticleCanvas';
