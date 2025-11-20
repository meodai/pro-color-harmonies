import type { PaletteColor, PaletteType, GeneratorOptions, OKLCH } from '../color-palette-generator';

/**
 * Creates a palette generator function with common boilerplate.
 * Note: this stays Culori-free; it operates purely on OKLCH.
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
