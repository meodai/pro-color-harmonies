import { enhancePalette, polishPalette } from './enhancer';
import type { PaletteColor, PaletteType, GeneratorOptions, OKLCH, PaletteStyle } from '../index';

/**
 * Resolves the effective palette style. 'default' is an alias for 'square',
 * so both produce identical palettes (no enhancement pass).
 */
export function resolvePaletteStyle(style: PaletteStyle): Exclude<PaletteStyle, 'default'> {
  return style === 'default' ? 'square' : style;
}

/** Chroma below this value is treated as achromatic (gray) input. */
export const ACHROMATIC_CHROMA_THRESHOLD = 0.002;

/**
 * Whether a color is effectively achromatic (a gray).
 * Hue is meaningless for such colors, so harmony math cannot apply.
 */
export function isAchromatic(color: OKLCH): boolean {
  return color.c < ACHROMATIC_CHROMA_THRESHOLD;
}

/**
 * Builds a neutral lightness ramp for achromatic input. Hue offsets are
 * meaningless on grays, and the enhancement passes would re-tint them
 * (polishPalette enforces a minimum chroma), so grays get a dedicated
 * grayscale palette instead: the base color first, then a lightness ramp
 * with the slot closest to the base lightness dropped.
 */
export function generateNeutralPalette(base: OKLCH): PaletteColor[] {
  const ramp = [0.2, 0.35, 0.5, 0.65, 0.8, 0.95];

  const nearestIndex = ramp.reduce(
    (best, l, i) => (Math.abs(l - base.l) < Math.abs(ramp[best] - base.l) ? i : best),
    0
  );

  return [
    { l: base.l, c: base.c, h: base.h },
    ...ramp
      .filter((_, i) => i !== nearestIndex)
      .map(l => ({ l, c: base.c, h: base.h })),
  ];
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
      const base = { l: baseColor.l, c: baseColor.c, h: baseColor.h || 0 };

      if (isAchromatic(base)) {
        return generateNeutralPalette(base);
      }

      const style = resolvePaletteStyle(options.style);
      const enhanced = style !== 'square';
      const colors = generatorFn(base, { ...options, style }, enhanced);

      if (enhanced) {
        const enhancedColors = enhancePalette(colors, paletteType, style);
        return polishPalette(enhancedColors);
      }
      
      return colors;
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`, { cause: error });
    }
  };
}
