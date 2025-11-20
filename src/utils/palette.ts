/**
 * Palette generation helper utilities
 */

import type { Color as CuloriColor } from 'culori';
import { parse, oklch } from 'culori';
import type { PaletteColor, PaletteType, GeneratorOptions } from '../color-palette-generator';
import { scaleSpreadArray, lerpColor, type FillFunction } from './interpolation';

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
  const extendedColors = scaleSpreadArray<CuloriColor>(
    basePalette.map(p => p.color as CuloriColor),
    targetCount,
    0,
    lerpColor as unknown as FillFunction<CuloriColor>
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
  base: string | CuloriColor,
  paletteType: string,
  idx: number = 0,
  isBase: boolean = false
): PaletteColor {
  const color: CuloriColor = typeof base === 'string' ? (parse(base) as CuloriColor) : base;

  return {
    code: `${paletteType}-${idx + 1}`,
    isBase,
    color,
  };
}

/**
 * Creates a palette generator function with common boilerplate
 */
export function createPaletteGenerator(
  paletteType: PaletteType,
  generatorFn: (
    base: { l: number; c: number; h: number; color: CuloriColor },
    options: GeneratorOptions,
    enhanced: boolean
  ) => CuloriColor[]
) {
  return (baseColor: string, options: GeneratorOptions): PaletteColor[] => {
    const { style, count = 5 } = options;
    const enhanced = style !== 'square';
    const targetCount = Math.max(1, count);

    try {
      const parsed = parse(baseColor);
      if (!parsed) throw new Error('Invalid base color');
      
      const baseColorObj = oklch(parsed);
      const base = {
        l: baseColorObj.l,
        c: baseColorObj.c,
        h: baseColorObj.h || 0,
        color: baseColorObj as CuloriColor
      };

      const colors = generatorFn(base, options, enhanced);

      const basePalette = colors.map((color, index) =>
        colorFactory(color, paletteType, index, index === 0)
      );

      return extendPalette(basePalette, targetCount, paletteType);
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`);
    }
  };
}
