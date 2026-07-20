/**
 * Gamut mapping helpers.
 *
 * The library works in raw OKLCH values, where OKLCH_LIMITS caps chroma at a
 * flat 0.37. The real maximum displayable chroma depends strongly on lightness
 * and hue (near white, sRGB supports only ~0.03), so generated colors can sit
 * outside the target gamut. CSS `oklch()` gamut-maps automatically, but any
 * conversion to hex/rgb in JS clips channels and shifts hue. These helpers
 * reduce chroma (preserving lightness and hue) until the color fits.
 */

import { clampChroma } from 'culori';
import type { OKLCH, PaletteColor } from '../index';

/** Target gamut for clamping: 'rgb' is sRGB, 'p3' is Display P3. */
export type GamutTarget = 'rgb' | 'p3';

/**
 * Clamps a single OKLCH color into the target gamut by reducing chroma
 * while keeping lightness and hue intact.
 * @param color - The OKLCH color to clamp
 * @param gamut - The target gamut (default: sRGB)
 * @returns The gamut-mapped OKLCH color
 */
export function clampColorToGamut(color: OKLCH, gamut: GamutTarget = 'rgb'): OKLCH {
  const clamped = clampChroma(
    { mode: 'oklch' as const, l: color.l, c: color.c, h: color.h },
    'oklch',
    gamut
  );
  return {
    l: clamped.l ?? color.l,
    c: clamped.c ?? 0,
    h: clamped.h ?? color.h,
  };
}

/**
 * Clamps every color of a palette into the target gamut.
 * @param palette - The palette to clamp
 * @param gamut - The target gamut (default: sRGB)
 * @returns A new palette with all colors gamut-mapped
 */
export function clampPaletteToGamut(palette: PaletteColor[], gamut: GamutTarget = 'rgb'): PaletteColor[] {
  return palette.map(color => clampColorToGamut(color, gamut));
}
