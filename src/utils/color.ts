/**
 * Color utility functions for OKLCH color space operations
 */

import type { OKLCH } from '../index';
import { OKLCH_LIMITS } from './constants';

/**
 * Normalize hue to 0-360 range
 * @param hue - The hue value to normalize
 * @returns The normalized hue value between 0 and 360
 */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/**
 * Clamp OKLCH values to valid ranges
 * @param l - Lightness value
 * @param c - Chroma value
 * @param h - Hue value
 * @returns A new OKLCH object with clamped values
 */
export function clampOKLCH(l: number, c: number, h: number): OKLCH {
  return {
    l: Math.max(OKLCH_LIMITS.l.min, Math.min(OKLCH_LIMITS.l.max, l)),
    c: Math.max(OKLCH_LIMITS.c.min, Math.min(OKLCH_LIMITS.c.max, c)),
    h,
  };
}


/**
 * Avoid muddy zones in the color space by shifting hue away from problematic areas
 * @param hue - The original hue
 * @param lightness - The lightness value
 * @param chroma - The chroma value
 * @returns A new OKLCH object with potentially adjusted hue
 */
export function avoidMuddyZones(hue: number, lightness: number, chroma: number): OKLCH {
  // Expanded zones for maximum beauty
  const mudZones = [
    { range: [25, 65], name: 'brown-olive' },
    { range: [100, 140], name: 'sick-green' },
    { range: [45, 55], name: 'dead-orange' },
    { range: [180, 200], name: 'corpse-cyan' },
  ];

  for (const zone of mudZones) {
    if (hue >= zone.range[0] && hue <= zone.range[1]) {
      // Push harder toward beautiful alternatives
      if (chroma < 0.15) {
        // Very muted: make it a sophisticated neutral
        return clampOKLCH(lightness, chroma * 0.5, hue);
      } else {
        // Push to nearest beautiful hue
        const pushDirection = hue > (zone.range[0] + zone.range[1]) / 2 ? 1 : -1;
        const newHue = (hue + pushDirection * 10 + 360) % 360;
        // Boost chroma to escape the mud
        return clampOKLCH(lightness, chroma * 1.1, newHue);
      }
    }
  }

  return clampOKLCH(lightness, chroma, hue);
}

/**
 * Builds a color from the given components, avoiding muddy zones when
 * enhanced mode is on. Unlike {@link safeHue}, the full adjusted color is
 * returned so the muddy-zone chroma corrections take effect as well.
 * @param hue - The target hue
 * @param lightness - The lightness value
 * @param chroma - The chroma value
 * @param enhanced - Whether to apply enhancement/correction logic
 * @returns The resulting OKLCH color
 */
export function safeColor(hue: number, lightness: number, chroma: number, enhanced: boolean): OKLCH {
  if (!enhanced) return { l: lightness, c: chroma, h: hue };
  return avoidMuddyZones(hue, lightness, chroma);
}

/**
 * Safely get a hue, avoiding muddy zones if enhanced mode is on
 * @deprecated Use {@link safeColor} instead — this discards the muddy-zone
 * chroma adjustments and only returns the hue.
 * @param hue - The target hue
 * @param lightness - The lightness context
 * @param chroma - The chroma context
 * @param enhanced - Whether to apply enhancement/correction logic
 * @returns The safe hue value
 */
export function safeHue(hue: number, lightness: number, chroma: number, enhanced: boolean): number {
  return safeColor(hue, lightness, chroma, enhanced).h;
}
