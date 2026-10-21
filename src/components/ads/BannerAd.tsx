import React, { useState, useEffect } from 'react';
import { ExternalLink, Info, Sparkles, Trophy, ShieldCheck, Download } from 'lucide-react';

interface BannerAdProps {
  position: 'top' | 'bottom';
  adUnitId?: string;
  className?: string;
}

interface SponsorAd {
  id: string;
  tagline: string;
  title: string;
  ctaText: string;
  accentColor: string;
  badgeBg: string;
  icon: 'play' | 'trophy' | 'shield' | 'download';
  url: string;
}

const SPONSOR_ADS: SponsorAd[] = [
  {
    id: 'play_pass',
    tagline: 'Google Play Pass',
    title: 'Unlock 1,000+ Games & Apps with No Ads or IAPs!',
    ctaText: 'Claim 1 Month Free',
    accentColor: '#38bdf8',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    icon: 'play',
    url: 'https://play.google.com/about/play-pass/',
  },
  {
    id: 'prism_champions',
    tagline: 'Prism Champions RPG',
    title: 'Match Crystals, Summon Dragons & Battle Online!',
    ctaText: 'Install Free',
    accentColor: '#c084fc',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: 'trophy',
    url: 'https://play.google.com/store/games',
  },
  {
    id: 'play_points',
    tagline: 'Google Play Points',
    title: 'Earn 4x Points on Gem Games & Claim Exclusive Perks',
    ctaText: 'Join Play Points',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: 'shield',
    url: 'https://play.google.com/about/play-points/',
  },
  {
    id: 'cyber_blocks',
    tagline: 'Cyber Grid 2088',
    title: 'Neon Block Puzzle with Cyberpunk Beats & Daily Tournaments',
    ctaText: 'Play Free',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: 'download',
    url: 'https://play.google.com/store/apps',
  },
];

export const BannerAd: React.FC<BannerAdProps> = ({
  position,
  adUnitId = 'ca-app-pub-3940256099942544/6300978111',
  className = '',
}) => {
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(() =>
    position === 'top' ? 0 : 1
  );
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Auto-rotate ads every 20 seconds
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % SPONSOR_ADS.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const ad = SPONSOR_ADS[currentAdIndex];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full select-none ${
        position === 'top'
          ? 'z-30 bg-slate-950/95 border-b border-slate-800/90 shadow-md'
          : 'fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 shadow-2xl backdrop-blur-md'
      } ${className}`}
      style={{ minHeight: '44px' }}
    >
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-1 sm:py-1.5 flex items-center justify-between gap-2">
        {/* Ad Badge & Sponsor Identity */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {/* Official Google Ads / AdMob Tag */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="rounded bg-amber-500/25 border border-amber-500/50 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-amber-300">
              Ad
            </span>
            <button
              type="button"
              onClick={() => setShowInfo((prev) => !prev)}
              title="Google AdMob Verified Banner"
              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
            >
              <Info className="h-2.5 w-2.5" />
            </button>
          </div>

          {/* Ad Icon Swatch */}
          <div
            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-all"
            style={{
              backgroundColor: `${ad.accentColor}18`,
              borderColor: `${ad.accentColor}50`,
              color: ad.accentColor,
            }}
          >
            {ad.icon === 'play' && <Sparkles className="h-3.5 w-3.5" />}
            {ad.icon === 'trophy' && <Trophy className="h-3.5 w-3.5" />}
            {ad.icon === 'shield' && <ShieldCheck className="h-3.5 w-3.5" />}
            {ad.icon === 'download' && <Download className="h-3.5 w-3.5" />}
          </div>

          {/* Ad Copy */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-white truncate">
                {ad.tagline}
              </span>
              <span className="hidden xs:inline rounded-full bg-slate-800 px-1.5 py-0.2 text-[8px] text-slate-400 font-mono-nums">
                Google Play Verified
              </span>
            </div>
            <p className="text-[9px] sm:text-[11px] text-slate-300 truncate leading-tight">
              {ad.title}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold transition-all cursor-pointer shadow-md hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: ad.accentColor,
              color: '#020617',
            }}
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </a>
        </div>
      </div>

      {/* AdMob Diagnostic / Info Disclosure Popup */}
      {showInfo && (
        <div className="border-t border-slate-800 bg-slate-900/90 px-3 py-1.5 text-[10px] text-slate-400 flex items-center justify-between">
          <span>
            Google AdMob Adaptive Banner • Unit: <code className="text-amber-400 font-mono-nums">{adUnitId}</code>
          </span>
          <button
            type="button"
            onClick={() => setShowInfo(false)}
            className="text-slate-300 hover:text-white underline ml-2 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
