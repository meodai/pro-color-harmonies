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
  targetCount: number,
  paletteType: string
): PaletteColor[] {
  if (targetCount <= basePalette.length) {
    // If target count is less than or equal to base palette, just return the base
    return basePalette.slice(0, targetCount);
  }

  // Use interpolation to extend the palette
  const extendedColors = scaleSpreadArray<OKLCH>(
    basePalette.map(p => p.color),
    targetCount,
    0,
    lerpOKLCH
  );

  return extendedColors.map((color, index) => ({
    code: `${paletteType}-${index + 1}`,
    isBase: index === 0,
    color,
  }));
}

/**
 * Factory function to create a palette color entry
 */
export function colorFactory(
  base: OKLCH,
  paletteType: string,
  idx: number = 0,
  isBase: boolean = false
): PaletteColor {
  return {
    code: `${paletteType}-${idx + 1}`,
    isBase,
    color: base,
  };
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

      const colors = generatorFn(base, options, enhanced);

      return colors.map((color, index) =>
        colorFactory(color, paletteType, index, index === 0)
      );
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`);
    }
  };
}
