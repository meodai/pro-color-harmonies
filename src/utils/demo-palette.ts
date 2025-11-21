import { oklch, oklab, interpolate } from 'culori';
import type { OKLCH, PaletteColor } from '../index';

/**
 * Extends a palette to the desired count using interpolation.
 * Demo-only helper: lives outside the core generator to keep it OKLCH-only.
 */
export function extendPalette(
  basePalette: PaletteColor[],
  targetCount: number
): PaletteColor[] {
  if (targetCount <= basePalette.length) {
    const step = basePalette.length / targetCount;
    return Array.from({ length: targetCount }, (_, i) => {
      const index = Math.min(Math.floor(i * step), basePalette.length - 1);
      return basePalette[index];
    });
  }

  // For larger palettes, interpolate in OKLAB via culori (demo concern).
  const baseColors = basePalette.map((p: OKLCH) => {
    const oklchColor = oklch({ mode: 'oklch', l: p.l, c: p.c, h: p.h });
    return oklch(oklchColor);
  });

  const interpolator = interpolate(baseColors, 'oklab');

  const result: PaletteColor[] = [];
  for (let i = 0; i < targetCount; i++) {
    const t = targetCount === 1 ? 0 : i / (targetCount - 1);
    const interpolatedColor = interpolator(t);
    const oklchColor = oklch(interpolatedColor);

    result.push({
      l: oklchColor.l,
      c: oklchColor.c,
      h: oklchColor.h || 0,
    });
  }

  return result;
}
