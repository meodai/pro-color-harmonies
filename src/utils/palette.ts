import { enhancePalette } from './enhancer';
import type { PaletteColor, PaletteType, GeneratorOptions, OKLCH } from '../index';

/**
 * Creates a palette generator function with common boilerplate.
 * Note: this stays Culori-free; it operates purely on OKLCH.
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
