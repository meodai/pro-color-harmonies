import { enhancePalette, polishPalette } from './enhancer';
import type { PaletteColor, PaletteType, GeneratorOptions, OKLCH, PaletteStyle } from '../index';

/**
 * Resolves the effective palette style. 'default' is an alias for 'square',
 * so both produce identical palettes (no enhancement pass).
 */
export function resolvePaletteStyle(style: PaletteStyle): Exclude<PaletteStyle, 'default'> {
  return style === 'default' ? 'square' : style;
}

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
      const style = resolvePaletteStyle(options.style);
      const enhanced = style !== 'square';
      const colors = generatorFn(
        { l: baseColor.l, c: baseColor.c, h: baseColor.h || 0 },
        { ...options, style },
        enhanced
      );

      if (enhanced) {
        const enhancedColors = enhancePalette(colors, paletteType, style);
        return polishPalette(enhancedColors);
      }
      
      return colors;
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`);
    }
  };
}
