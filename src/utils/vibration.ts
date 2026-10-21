/**
 * Haptic Vibration Controller for Lumina Prism
 * Supports configurable Vibration Intensity (Low, Medium, High)
 * for game events like stone breaks, power-up impacts, and scary Game Over tremors.
 * Default intensity is HIGH.
 */

import { loadSettings, VibrationIntensity } from './storage';

function resolveIntensity(override?: VibrationIntensity): VibrationIntensity {
  if (override) return override;
  try {
    const settings = loadSettings();
    return settings.vibrationIntensity || 'high';
  } catch {
    return 'high';
  }
}

/**
 * Tactile vibration for stone blockers shattering / hammer smashes
 */
export function vibrateStoneBreak(overrideIntensity?: VibrationIntensity) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

  const intensity = resolveIntensity(overrideIntensity);

  try {
    switch (intensity) {
      case 'low':
        // Subtle micro pulse
        navigator.vibrate([15]);
        break;
      case 'medium':
        // Balanced double tap
        navigator.vibrate([25, 20, 25]);
        break;
      case 'high':
      default:
        // High intensity: crisp, scarce, tactile stone fracture burst
        navigator.vibrate([45, 25, 55]);
        break;
    }
  } catch (_) {
    // Ignore vibration errors if disabled by browser permissions
  }
}

/**
 * Jarring, scary, ominous tremor pattern simulating dread and fading heartbeat
 */
export function vibrateScaryGameOver(overrideIntensity?: VibrationIntensity) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

  const intensity = resolveIntensity(overrideIntensity);

  try {
    switch (intensity) {
      case 'low':
        // Light alert buzz
        navigator.vibrate([40, 35, 60]);
        break;
      case 'medium':
        // Moderate shudder sequence
        navigator.vibrate([75, 45, 110, 55, 240]);
        break;
      case 'high':
      default:
        // High intensity: dramatic multi-beat ominous tremor
        navigator.vibrate([120, 60, 180, 80, 400, 120, 650]);
        break;
    }
  } catch (_) {
    // Ignore vibration errors
  }
}

/**
 * Instant haptic preview feedback when player changes intensity in SettingsModal
 */
export function vibratePreview(intensity: VibrationIntensity) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

  try {
    switch (intensity) {
      case 'low':
        navigator.vibrate([18]);
        break;
      case 'medium':
        navigator.vibrate([35, 25, 35]);
        break;
      case 'high':
      default:
        navigator.vibrate([60, 30, 80]);
        break;
    }
  } catch (_) {
    // Ignore
  }
}
