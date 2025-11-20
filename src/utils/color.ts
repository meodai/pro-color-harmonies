/**
 * Color utility functions for OKLCH color space operations
 */

import type { OKLCH } from '../index';

export const OKLCH_LIMITS = {
  l: { min: 0.01, max: 0.99 },
  c: { min: 0, max: 0.37 },
  h: { min: 0, max: 360 },
};


/**
 * Normalize hue to 0-360 range
 */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/**
 * Clamp OKLCH values to valid ranges
 */
export function clampOKLCH(l: number, c: number, h: number): OKLCH {
  return {
    l: Math.max(OKLCH_LIMITS.l.min, Math.min(OKLCH_LIMITS.l.max, l)),
    c: Math.max(OKLCH_LIMITS.c.min, Math.min(OKLCH_LIMITS.c.max, c)),
    h,
  };
}


/**
 * Avoid muddy zones in the color space
 */
export function avoidMuddyZones(hue: number, lightness: number, chroma: number): OKLCH {
  const muddyZones = [
    { start: 60, end: 90, shift: -10 },   // Yellow-green (tends toward brown)
    { start: 30, end: 50, shift: 15 },    // Orange (can become muddy)
  ];

  let adjustedHue = hue;
  for (const zone of muddyZones) {
    if (hue >= zone.start && hue <= zone.end && chroma < 0.15) {
      adjustedHue = (hue + zone.shift + 360) % 360;
      break;
    }
  }

  return clampOKLCH(lightness, chroma, adjustedHue);
}
