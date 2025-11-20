/**
 * Palette generation helper utilities
 */

import { oklch, oklab, interpolate } from 'culori';
import type { PaletteColor, PaletteType, GeneratorOptions, OKLCH } from '../color-palette-generator';

/**
 * Extends a palette to the desired count using interpolation
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

  // For larger palettes, mirror main.ts: interpolate in OKLAB via culori
  const baseColors = basePalette.map(p => {
    const oklchColor = oklch({ mode: 'oklch', l: p.l, c: p.c, h: p.h });
    return oklab(oklchColor);
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



/**
 * Creates a palette generator function with common boilerplate
 */
export function createPaletteGenerator(
  paletteType: PaletteType,
  generatorFn: (
    base: { l: number; c: number; h: number },
    options: GeneratorOptions,
    enhanced: boolean
  ) => OKLCH[]
) {
  return (baseColor: OKLCH, options: GeneratorOptions): PaletteColor[] => {
    const { style } = options;
    const enhanced = style !== 'square';

    try {
      const base = {
        l: baseColor.l,
        c: baseColor.c,
        h: baseColor.h || 0,
      };

      return generatorFn(base, options, enhanced);
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`);
    }
  };
}
