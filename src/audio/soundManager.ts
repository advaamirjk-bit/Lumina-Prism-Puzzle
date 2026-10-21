/**
 * Procedural Web Audio API sound generator for crystal clear, juicy game sound effects
 * Requires zero external audio assets!
 * Supports dedicated SFX and BGM controls with separate volume sliders.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isSfxEnabled: boolean = true;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.5;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmOscs: OscillatorNode[] = [];
  private isBgmPlaying: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Dedicated SFX channel
      this.sfxGain = this.ctx.createGain();
      this.updateSfxGain();
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private updateSfxGain() {
    if (this.sfxGain && this.ctx) {
      const effectiveGain = this.isSfxEnabled ? 0.75 * this.sfxVolume : 0;
      this.sfxGain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
    }
  }

  private updateBgmGain() {
    if (this.bgmGain && this.ctx) {
      const effectiveGain = 0.08 * this.bgmVolume;
      this.bgmGain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1.0, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setSfxEnabled(enabled: boolean) {
    this.isSfxEnabled = enabled;
    this.updateSfxGain();
  }

  public getSfxEnabled(): boolean {
    return this.isSfxEnabled;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.updateSfxGain();
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    this.updateBgmGain();
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public canPlaySfx(): boolean {
    return this.isSfxEnabled && !this.isMuted;
  }

  private getSfxDest(): GainNode | null {
    this.initContext();
    return this.sfxGain || this.masterGain;
  }

  // Soft tactile click for UI buttons
  public playClick() {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Gem placement thud with crystal ring
  public playPlace() {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    // Resonant low click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(260, now);
    osc1.frequency.exponentialRampToValueAtTime(70, now + 0.09);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(dest);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // High crystalline tick
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, now);
    osc2.frequency.exponentialRampToValueAtTime(900, now + 0.05);
    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(now);
    osc2.stop(now + 0.05);
  }

  // Line / Box Clear chime with progressively higher-pitched tones as combo streak increases
  public playClear(comboCount: number = 1, lineCount: number = 1) {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    // Extended 4-octave crystalline pentatonic scale (C5 through C8)
    const PENTATONIC_NOTES = [
      523.25,  // C5 (index 0)
      587.33,  // D5
      659.25,  // E5
      783.99,  // G5
      880.00,  // A5
      1046.50, // C6 (index 5)
      1174.66, // D6
      1318.51, // E6
      1567.98, // G6
      1760.00, // A6
      2093.00, // C7 (index 10)
      2349.32, // D7
      2637.02, // E7
      3135.96, // G7
      3520.00, // A7
      4186.01, // C8 (index 15)
    ];

    // Compute progressive pitch base: moves up 2 scale steps per combo count
    // Plus a micro-pitch exponential multiplier so high combos (6+) continue ascending smoothly
    const comboLevel = Math.max(1, comboCount);
    const baseOffset = (comboLevel - 1) * 2;
    const microPitchFactor = Math.pow(1.03, Math.max(0, comboLevel - 4));

    // Number of ascending notes in cascade grows with combo (3 to 6 notes)
    const noteCount = Math.min(6, 3 + Math.floor((comboLevel - 1) / 2));

    const chords: number[] = [];
    for (let i = 0; i < noteCount; i++) {
      const targetIndex = baseOffset + i * 2;
      const octaveWraps = Math.floor(targetIndex / PENTATONIC_NOTES.length);
      const wrappedIndex = targetIndex % PENTATONIC_NOTES.length;
      const baseFreq = PENTATONIC_NOTES[wrappedIndex] * Math.pow(2, octaveWraps);
      chords.push(baseFreq * microPitchFactor);
    }

    const now = this.ctx.currentTime;
    const noteDelay = Math.max(0.035, 0.055 - comboLevel * 0.003);

    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const delay = idx * noteDelay;

      // Higher combos use brighter triangle wave, lower combos use warm sine
      osc.type = comboLevel >= 3 || lineCount > 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      // Subtle upward frequency shimmer
      osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + delay + 0.35);

      gain.gain.setValueAtTime(0.001, now + delay);
      // Volume balances naturally so high pitches remain pleasant and crisp
      const noteVol = Math.max(0.12, 0.26 - idx * 0.02);
      gain.gain.linearRampToValueAtTime(noteVol, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.42);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + delay);
      osc.stop(now + delay + 0.43);

      // For combo 3+ or multi-line, add sparkling octave overtone shimmer
      if (comboLevel >= 3 && idx >= 2) {
        const overtoneOsc = this.ctx!.createOscillator();
        const overtoneGain = this.ctx!.createGain();
        overtoneOsc.type = 'sine';
        overtoneOsc.frequency.setValueAtTime(freq * 2, now + delay);
        overtoneGain.gain.setValueAtTime(0.001, now + delay);
        overtoneGain.gain.linearRampToValueAtTime(0.07, now + delay + 0.015);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);
        overtoneOsc.connect(overtoneGain);
        overtoneGain.connect(dest);
        overtoneOsc.start(now + delay);
        overtoneOsc.stop(now + delay + 0.23);
      }
    });

    // Deep rewarding sub-gong for cascades (multi-line or combo >= 2)
    if (lineCount > 1 || comboLevel >= 2) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      // Sub gong frequency also subtly tunes with combo level
      const subFreq = Math.min(220, 130 + (comboLevel - 1) * 8);
      subOsc.frequency.setValueAtTime(subFreq, now);
      subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.55);
      const subVol = Math.min(0.42, 0.28 + comboLevel * 0.02);
      subGain.gain.setValueAtTime(subVol, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      subOsc.connect(subGain);
      subGain.connect(dest);
      subOsc.start(now);
      subOsc.stop(now + 0.6);
    }
  }

  // Frenzy Mode activation fanfare
  public playFrenzy() {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const freqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    const now = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const delay = idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + delay);
      osc.stop(now + delay + 0.4);
    });
  }

  // Power-up activation sound
  public playPowerUp() {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Hammer smash sound
  public playHammer() {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    // Heavy crash impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Epic high-difficulty victory fanfare
  public playEpicVictory() {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    // Triumphant orchestral crystal chord arpeggio
    const arpeggio = [
      { freq: 261.63, delay: 0.0, dur: 0.8 }, // C4
      { freq: 329.63, delay: 0.12, dur: 0.8 }, // E4
      { freq: 392.0, delay: 0.24, dur: 0.8 }, // G4
      { freq: 523.25, delay: 0.36, dur: 1.2 }, // C5
      { freq: 659.25, delay: 0.5, dur: 1.2 }, // E5
      { freq: 783.99, delay: 0.65, dur: 1.4 }, // G5
      { freq: 1046.5, delay: 0.8, dur: 1.8 }, // C6
    ];

    arpeggio.forEach(({ freq, delay, dur }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.005, now + delay + dur);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.28, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + delay);
      osc.stop(now + delay + dur);
    });

    // Sub resonant boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now + 0.3);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 1.2);
    subGain.gain.setValueAtTime(0.35, now + 0.3);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    subOsc.connect(subGain);
    subGain.connect(dest);
    subOsc.start(now + 0.3);
    subOsc.stop(now + 1.3);
  }

  // Terrifying and dramatic Game Over horror soundscape
  public playGameOver(isScary = true) {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    if (isScary) {
      // 1. Ominous sub-bass earthquake rumble
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(24, now + 1.8);
      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
      subOsc.connect(subGain);
      subGain.connect(dest);
      subOsc.start(now);
      subOsc.stop(now + 1.9);

      // 2. Chilling horror tritone sting (Dissonant devil's interval notes)
      const dissonantChords = [
        { f: 311.13, type: 'sawtooth' as const, d: 0.0, vol: 0.22 }, // Eb4
        { f: 220.0, type: 'sawtooth' as const, d: 0.05, vol: 0.25 }, // A3 (Tritone with Eb)
        { f: 155.56, type: 'triangle' as const, d: 0.12, vol: 0.3 }, // Eb3
        { f: 110.0, type: 'sawtooth' as const, d: 0.2, vol: 0.28 }, // A2
        { f: 55.0, type: 'sine' as const, d: 0.35, vol: 0.35 }, // A1 deep doom
      ];

      dissonantChords.forEach(({ f, type, d, vol }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f, now + d);
        osc.frequency.exponentialRampToValueAtTime(f * 0.94, now + d + 1.5);

        gain.gain.setValueAtTime(vol, now + d);
        gain.gain.exponentialRampToValueAtTime(0.001, now + d + 1.6);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + d);
        osc.stop(now + d + 1.6);
      });
    } else {
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const delay = idx * 0.15;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.2, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + delay);
        osc.stop(now + delay + 0.6);
      });
    }
  }

  // Generative relaxing ambient crystal drone BGM
  public toggleBgm(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public startBgm() {
    this.initContext();
    if (!this.ctx) return;
    this.stopBgm();

    const droneFreqs = [130.81, 196.0, 261.63, 329.63]; // C3, G3, C4, E4
    this.bgmGain = this.ctx.createGain();
    this.updateBgmGain();
    this.bgmGain.connect(this.masterGain || this.ctx.destination);

    this.bgmOscs = droneFreqs.map((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      // subtle detune for warm chorus pad
      osc.frequency.setValueAtTime(freq + (i % 2 === 0 ? 0.3 : -0.3), this.ctx!.currentTime);
      osc.connect(this.bgmGain!);
      osc.start();
      return osc;
    });

    this.isBgmPlaying = true;
  }

  // Crystal petrifies into a heavy stone blocker
  public playStonePetrify() {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;

    // Heavy low frequency thud
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.28);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(dest);
    osc1.start(now);
    osc1.stop(now + 0.28);

    // Crackle noise burst
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(320, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.22);
    gain2.gain.setValueAtTime(0.12, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.22);
  }

  // Stone blocker shattered
  public playStoneBreak() {
    if (!this.canPlaySfx()) return;
    this.initContext();
    const dest = this.getSfxDest();
    if (!this.ctx || !dest) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public stopBgm() {
    this.bgmOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.bgmOscs = [];
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch {
        // ignore
      }
      this.bgmGain = null;
    }
    this.isBgmPlaying = false;
  }
}

export const soundManager = new SoundManager();
