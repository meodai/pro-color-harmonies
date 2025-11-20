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
      return generatorFn(
        { l: baseColor.l, c: baseColor.c, h: baseColor.h || 0 },
        options,
        options.style !== 'square'
      );
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`);
    }
  };
}
