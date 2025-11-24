/**
 * Color Palette Generator Library
 * Generates harmonious color palettes from a single input color
 * Based on the color theory and perceptual color science
 */

// Utils
export * from './utils/color';
export * from './utils/modifiers';
export * from './utils/palette';
export * from './utils/variations';
export * from './utils/hue-strategies';
export * from './utils/interpolation';
export * from './utils/enhancer';

import { safeHue } from './utils/color';
import { applyModifiers } from './utils/modifiers';
import { createPaletteGenerator } from './utils/palette';
import { getTriadicVariations } from './utils/variations';
import {
  getComplementaryHue,
  getAnalogousHues,
  getTriadicHues,
  getTetradicHues,
  getSplitComplementaryHues
} from './utils/hue-strategies';

// ============= Type Definitions =============

/**
 * Represents a color in the OKLCH color space.
 * @property l - Lightness (0 to 1 usually, but can go higher for HDR)
 * @property c - Chroma (0 to ~0.4 usually)
 * @property h - Hue (0 to 360)
 */
export interface OKLCH {
  l: number;
  c: number;
  h: number;
}

/**
 * The geometric style used to calculate hue relationships.
 * - 'square': Standard geometric angles (90°, 180°, etc.)
 * - 'triangle': Adjusted for perceptual balance
 * - 'circle': Smooth, continuous variation
 * - 'diamond': Contrast-oriented variation
 */
export type PaletteStyle = 'square' | 'triangle' | 'circle' | 'diamond';

/**
 * The type of color harmony to generate.
 */
export type PaletteType = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'splitComplementary';

/**
 * Alias for OKLCH, representing a color in a palette.
 */
export type PaletteColor = OKLCH;

/**
 * Configuration for post-generation palette modifiers.
 * Values should be between 0 and 1.
 */
export interface PaletteModifiers {
  sine?: number;
  wave?: number;
  zap?: number;
  block?: number;
}

/**
 * Options for generating a palette.
 */
export interface GeneratorOptions {
  /** The geometric style to use for hue calculation */
  style: PaletteStyle;
  /** Optional modifiers to apply to the generated palette */
  modifiers?: PaletteModifiers; // Optional palette modulation knobs (0-1)
}

// ============= Generators =============

/**
 * Generates a complementary palette (base color + opposite hue).
 * Creates high contrast and visual tension.
 */
export const generateComplementary = createPaletteGenerator('complementary', (base, options, enhanced) => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  const chromaAdjust = 0.9;
  
  let complementHue = getComplementaryHue(base, options.style);
  complementHue = safeHue(complementHue, baseLightness, baseChroma * chromaAdjust, enhanced);

  return [
    { l: baseLightness, c: baseChroma, h: baseHue },
    { l: baseLightness + 0.05, c: baseChroma * chromaAdjust, h: complementHue },
    { l: baseLightness - 0.2, c: baseChroma * 1.1, h: baseHue },
    { l: baseLightness + 0.2, c: baseChroma * 0.8, h: baseHue },
    { l: baseLightness + 0.25, c: baseChroma * 0.7, h: complementHue },
    { l: baseLightness - 0.15, c: baseChroma * 0.5, h: complementHue },
  ];
});

/**
 * Generates an analogous palette (colors adjacent on the color wheel).
 * Creates harmonious, low-contrast designs.
 */
export const generateAnalogous = createPaletteGenerator('analogous', (base, options, enhanced) => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  const chromaAdjust = 0.9;
  
  const analogousHues = getAnalogousHues(base, options.style);

  const variations = [
    { l: 0, c: 1.0 },
    { l: -0.2, c: 0.8 },
    { l: -0.1, c: 0.9 },
    { l: 0.15, c: 0.85 },
    { l: 0.25, c: 0.7 },
    { l: 0.35, c: 0.6 },
  ];

  return analogousHues.map((hue, index) => {
    if (index === 0) return { l: baseLightness, c: baseChroma, h: baseHue };

    const v = variations[index];
    let finalL = baseLightness + v.l;
    let finalC = baseChroma * v.c * chromaAdjust;
    let finalHue = safeHue(hue, finalL, finalC, enhanced);

    return { l: finalL, c: finalC, h: finalHue };
  });
});

/**
 * Generates a triadic palette (three colors evenly spaced).
 * Balanced and vibrant.
 */
export const generateTriadic = createPaletteGenerator('triadic', (base, options, enhanced) => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  const triadicHues = getTriadicHues(base, options.style);
  const { base: baseVariations, triad: triadVariations } = getTriadicVariations(base, options.style);

  const colors: OKLCH[] = [];
  triadicHues.forEach((hue, idx) => {
    if (idx === 0) {
      colors.push({ l: baseLightness, c: baseChroma, h: baseHue });
      colors.push({ l: baseLightness + baseVariations.dark.l, c: baseChroma * baseVariations.dark.c, h: hue });
    } else {
      const v = idx === 1 ? triadVariations.first : triadVariations.second;
      let finalHue = safeHue(hue, baseLightness + v.pure.l, baseChroma * v.pure.c, enhanced);
      colors.push({ l: baseLightness + v.pure.l, c: baseChroma * v.pure.c, h: finalHue });
      colors.push({ l: baseLightness + v.muted.l, c: baseChroma * v.muted.c, h: finalHue });
    }
  });
  return colors;
});

/**
 * Generates a tetradic palette (two pairs of complementary colors).
 * Rich and complex, offers many possibilities for variation.
 */
export const generateTetradic = createPaletteGenerator('tetradic', (base, options, enhanced) => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  const tetradicHues = getTetradicHues(base, options.style);

  const colors: OKLCH[] = [];
  colors.push({ l: baseLightness, c: baseChroma, h: baseHue });

  tetradicHues.slice(1, 3).forEach((hue, idx) => {
    let finalHue = safeHue(hue, baseLightness, baseChroma, enhanced);
    const v = idx === 0 ? { l: 0.1, c: 0.9 } : { l: -0.15, c: 0.85 };
    colors.push({ l: baseLightness + v.l, c: baseChroma * v.c, h: finalHue });
  });

  const fourthHue = tetradicHues[3];
  const finalFourthHue = safeHue(fourthHue, baseLightness + 0.2, baseChroma * 0.7, enhanced);
  colors.push({ l: baseLightness + 0.2, c: baseChroma * 0.7, h: finalFourthHue });
  colors.push({ l: baseLightness - 0.25, c: baseChroma * 1.1, h: baseHue });
  colors.push({ l: baseLightness + 0.15, c: baseChroma * 0.8, h: baseHue });

  return colors;
});

/**
 * Generates a split-complementary palette (base + two colors adjacent to the complement).
 * High contrast like complementary, but less aggressive.
 */
export const generateSplitComplementary = createPaletteGenerator('splitComplementary', (base, options, enhanced) => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  const splitHues = getSplitComplementaryHues(base, options.style);

  const colors: OKLCH[] = [];
  colors.push({ l: baseLightness, c: baseChroma, h: baseHue });
  colors.push({ l: baseLightness - 0.18, c: baseChroma * 1.05, h: baseHue });
  colors.push({ l: baseLightness + 0.15, c: baseChroma * 0.85, h: baseHue });

  splitHues.slice(1).forEach((hue, idx) => {
    let finalHue = safeHue(hue, baseLightness, baseChroma, enhanced);
    const v = idx === 0 ? { l: 0.08, c: 0.9 } : { l: -0.08, c: 0.75 };
    colors.push({ l: baseLightness + v.l, c: baseChroma * v.c, h: finalHue });
  });

  const mutedHue = safeHue(splitHues[1], baseLightness + 0.2, baseChroma * 0.6, enhanced);
  colors.push({ l: baseLightness + 0.2, c: baseChroma * 0.6, h: mutedHue });

  return colors;
});

// ============= Main Palette Generator =============

/**
 * Main class for generating color palettes.
 * Provides static methods to generate specific or all palette types.
 */
export class ColorPaletteGenerator {
  /**
   * Generates a single palette of the specified type.
   * @param baseColor - The root color for the palette
   * @param paletteType - The type of harmony to generate
   * @param options - Configuration options
   * @returns Array of generated colors
   */
  static generate(baseColor: OKLCH, paletteType: PaletteType, options: GeneratorOptions): PaletteColor[] {
    const baseOptions = { ...options };
    const modifiers = baseOptions.modifiers;

    let palette: PaletteColor[];
    switch (paletteType) {
      case 'analogous': palette = generateAnalogous(baseColor, baseOptions); break;
      case 'complementary': palette = generateComplementary(baseColor, baseOptions); break;
      case 'triadic': palette = generateTriadic(baseColor, baseOptions); break;
      case 'tetradic': palette = generateTetradic(baseColor, baseOptions); break;
      case 'splitComplementary': palette = generateSplitComplementary(baseColor, baseOptions); break;
      default: throw new Error(`Unknown palette type: ${paletteType}`);
    }

    return applyModifiers(palette, modifiers);
  }

  /**
   * Generates all available palette types for a given base color.
   * @param baseColor - The root color
   * @param options - Configuration options
   * @returns Object containing all palette types
   */
  static generateAll(baseColor: OKLCH, options: GeneratorOptions): Record<PaletteType, PaletteColor[]> {
    return {
      analogous: applyModifiers(generateAnalogous(baseColor, options), options.modifiers),
      complementary: applyModifiers(generateComplementary(baseColor, options), options.modifiers),
      triadic: applyModifiers(generateTriadic(baseColor, options), options.modifiers),
      tetradic: applyModifiers(generateTetradic(baseColor, options), options.modifiers),
      splitComplementary: applyModifiers(generateSplitComplementary(baseColor, options), options.modifiers),
    };
  }
}

/**
 * Collection of individual generator functions.
 */
export const generators = {
  analogous: generateAnalogous,
  complementary: generateComplementary,
  triadic: generateTriadic,
  tetradic: generateTetradic,
  splitComplementary: generateSplitComplementary,
};


