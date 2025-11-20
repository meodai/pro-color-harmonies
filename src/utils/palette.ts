/**
 * Palette generation helper utilities
 */

import { parse, oklch } from 'culori';
import type { PaletteColor, PaletteType, GeneratorOptions, OKLCH } from '../color-palette-generator';
import { scaleSpreadArray, lerpOKLCH } from './interpolation';

/**
 * Extends a palette to the desired count using interpolation
 */
export function extendPalette(
  basePalette: PaletteColor[],
  targetCount: number
): PaletteColor[] {
  if (targetCount <= basePalette.length) {
    // If target count is less than or equal to base palette, just return the base
    return basePalette.slice(0, targetCount);
  }

  // Use interpolation to extend the palette
  return scaleSpreadArray<OKLCH>(
    basePalette,
    targetCount,
    0,
    lerpOKLCH
  );
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
  return (baseColor: string, options: GeneratorOptions): PaletteColor[] => {
    const { style } = options;
    const enhanced = style !== 'square';

    try {
      const parsed = parse(baseColor);
      if (!parsed) throw new Error('Invalid base color');
      
      const baseColorObj = oklch(parsed);
      const base = {
        l: baseColorObj.l,
        c: baseColorObj.c,
        h: baseColorObj.h || 0,
      };

      return generatorFn(base, options, enhanced);
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`);
    }
  };
}
