import React from 'react';
import { UserSettings, VibrationIntensity } from '../../utils/storage';
import { CrystalThemeId } from '../../types/game';
import { CRYSTAL_THEMES } from '../../utils/themeConfig';
import { X, Volume2, VolumeX, Music, Vibrate, Eye, Palette, Check, PlayCircle, Smartphone } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { vibratePreview } from '../../utils/vibration';

interface SettingsModalProps {
  isOpen: boolean;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onReplayTutorial?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onReplayTutorial,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentTheme = settings.crystalTheme || 'default';
  const sfxActive = settings.sfxEnabled ?? true;
  const sfxVolumeVal = settings.sfxVolume ?? 0.8;
  const bgmVolumeVal = settings.bgmVolume ?? 0.5;
  const currentVibration: VibrationIntensity = settings.vibrationIntensity || 'high';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-md max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-900/95 p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Settings & Themes</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-4 py-4 overflow-y-auto pr-0.5">
          {/* Section: Crystal Theme Picker */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Crystal Theme
              </span>
              <span className="text-xs font-medium text-indigo-400">
                {CRYSTAL_THEMES[currentTheme].name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(CRYSTAL_THEMES) as CrystalThemeId[]).map((themeKey) => {
                const theme = CRYSTAL_THEMES[themeKey];
                const isSelected = currentTheme === themeKey;

                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => onUpdateSettings({ crystalTheme: themeKey })}
                    className={`group relative flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-950/40 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-400/80'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1.5">
                      {/* Theme preview swatch */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-3 w-3 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <span className="text-xs font-bold text-white group-hover:text-indigo-200">
                          {theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {theme.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
              Preferences
            </span>

            {/* Toggles & Volume Controls */}
            <div className="flex flex-col gap-2.5">
              {/* Dedicated Sound Effects Toggle & SFX Volume */}
              <div className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {sfxActive ? (
                      <Volume2 className="h-4.5 w-4.5 text-indigo-400" />
                    ) : (
                      <VolumeX className="h-4.5 w-4.5 text-slate-500" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">Sound Effects</h4>
                        <span
                          className={`text-[9px] font-mono-nums font-bold px-1.5 py-0.2 rounded border ${
                            sfxActive
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {sfxActive ? `${Math.round(sfxVolumeVal * 100)}%` : 'OFF'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Tactile placement clicks & chimes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !sfxActive;
                      onUpdateSettings({ sfxEnabled: nextState });
                      if (nextState) {
                        soundManager.setSfxEnabled(true);
                        soundManager.playClick();
                      }
                    }}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                      sfxActive ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        sfxActive ? 'translate-x-5.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Dedicated SFX Volume Slider */}
                {sfxActive && (
                  <div className="pt-2 border-t border-slate-850 flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold w-16">
                      SFX Vol
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round(sfxVolumeVal * 100)}
                      onChange={(e) => {
                        const newVol = Number(e.target.value) / 100;
                        onUpdateSettings({ sfxVolume: newVol });
                        soundManager.setSfxVolume(newVol);
                      }}
                      onMouseUp={() => soundManager.playClick()}
                      onTouchEnd={() => soundManager.playClick()}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-[10px] font-mono-nums text-indigo-300 w-8 text-right font-bold">
                      {Math.round(sfxVolumeVal * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Ambient BGM Toggle & BGM Volume */}
              <div className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music
                      className={`h-4.5 w-4.5 ${settings.bgm ? 'text-purple-400' : 'text-slate-500'}`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">Cosmic Drone BGM</h4>
                        <span
                          className={`text-[9px] font-mono-nums font-bold px-1.5 py-0.2 rounded border ${
                            settings.bgm
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {settings.bgm ? `${Math.round(bgmVolumeVal * 100)}%` : 'OFF'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Harmonic synthesizer background pad</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ bgm: !settings.bgm })}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                      settings.bgm ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        settings.bgm ? 'translate-x-5.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Dedicated BGM Volume Slider */}
                {settings.bgm && (
                  <div className="pt-2 border-t border-slate-850 flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold w-16">
                      BGM Vol
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={Math.round(bgmVolumeVal * 100)}
                      onChange={(e) => {
                        const newVol = Number(e.target.value) / 100;
                        onUpdateSettings({ bgmVolume: newVol });
                        soundManager.setBgmVolume(newVol);
                      }}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-[10px] font-mono-nums text-purple-300 w-8 text-right font-bold">
                      {Math.round(bgmVolumeVal * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Screen Shake */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                <div className="flex items-center gap-3">
                  <Vibrate className="h-4.5 w-4.5 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Screen Shake</h4>
                    <p className="text-[11px] text-slate-400">Tactile impact on high combos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    settings.screenShake ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.screenShake ? 'translate-x-5.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Vibration Intensity 3-Way Toggle (Low, Medium, High) with High as default */}
              <div className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4.5 w-4.5 text-amber-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">Vibration Intensity</h4>
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/40 uppercase">
                          {currentVibration === 'high' ? 'High (Default)' : currentVibration}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Stone breaks, hammer hits & game over
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3-State Toggle Segment: Low | Medium | High */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  {(['low', 'medium', 'high'] as VibrationIntensity[]).map((level) => {
                    const isSelected = currentVibration === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ vibrationIntensity: level });
                          vibratePreview(level);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                        }`}
                      >
                        <span>{level}</span>
                        {level === 'high' && (
                          <span
                            className={`text-[8px] uppercase tracking-wider font-semibold opacity-80 ${
                              isSelected ? 'text-slate-900' : 'text-amber-400/80'
                            }`}
                          >
                            • Def
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colorblind Symbols */}
              <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                <div className="flex items-center gap-3">
                  <Eye className="h-4.5 w-4.5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Accessibility Runes</h4>
                    <p className="text-[11px] text-slate-400">Display distinct symbols on gems</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ colorblindSymbols: !settings.colorblindSymbols })}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                    settings.colorblindSymbols ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.colorblindSymbols ? 'translate-x-5.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Google Play Store / PWA Publication Card */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                ▶
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-white text-[11px]">Google Play Store Ready</span>
                <span className="text-[9px] text-slate-400 font-mono-nums">Package: com.luminaprism.puzzle • v1.2.0</span>
              </div>
            </div>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/40">
              TWA Verified
            </span>
          </div>

          {onReplayTutorial && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onReplayTutorial();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 py-2.5 text-xs font-bold text-indigo-300 shadow-sm transition-all cursor-pointer"
            >
              <PlayCircle className="h-4 w-4 text-indigo-400" />
              <span>Launch Interactive Tutorial</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
