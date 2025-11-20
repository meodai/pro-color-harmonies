/**
 * Color utility functions for OKLCH color space operations
 */

import type { OKLCH } from '../index';
import { OKLCH_LIMITS, MUDDY_ZONES } from './constants';

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
  let adjustedHue = hue;
  for (const zone of MUDDY_ZONES) {
    if (hue >= zone.start && hue <= zone.end && chroma < 0.15) {
      adjustedHue = (hue + zone.shift + 360) % 360;
      break;
    }
  }

  return clampOKLCH(lightness, chroma, adjustedHue);
}

/**
 * Safely get a hue, avoiding muddy zones if enhanced mode is on
 */
export function safeHue(hue: number, lightness: number, chroma: number, enhanced: boolean): number {
  if (!enhanced) return hue;
  return avoidMuddyZones(hue, lightness, chroma).h;
}
