import { enhancePalette } from './enhancer';
import type { PaletteColor, PaletteType, GeneratorOptions, OKLCH } from '../index';

/**
 * Creates a palette generator function with common boilerplate.
 * Handles the enhanced mode logic and error wrapping.
 * 
 * @param paletteType - The type of palette to generate
 * @param generatorFn - The core generation logic function
 * @returns A function that takes a base color and options to produce a palette
 */
export function createPaletteGenerator(
  paletteType: PaletteType,
  generatorFn: (base: OKLCH, options: GeneratorOptions, enhanced: boolean) => OKLCH[]
) {
  return (baseColor: OKLCH, options: GeneratorOptions): PaletteColor[] => {
    try {
      const enhanced = options.style !== 'square';
      const colors = generatorFn(
        { l: baseColor.l, c: baseColor.c, h: baseColor.h || 0 },
        options,
        enhanced
      );
      
      if (enhanced) {
        return enhancePalette(colors, paletteType, options.style);
      }
      
      return colors;
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`);
    }
  };
}
