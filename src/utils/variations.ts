import type { OKLCH, PaletteStyle } from '../index';

type Variation = { l: number; c: number };

/**
 * Structure for triadic palette variations.
 * Contains variations for the base color and two triad colors.
 */
export type TriadVariations = {
  base: { dark: Variation };
  triad: {
    first: { pure: Variation; muted: Variation };
    second: { pure: Variation; muted: Variation };
  };
};

/**
 * Structure for complementary palette variations.
 * Contains variations for the base color and its complement.
 */
export type ComplementaryVariations = {
  base: { dark: Variation; light: Variation };
  complement: { main: Variation; light: Variation; muted: Variation };
};

/**
 * Structure for analogous palette variations.
 * An array of variations to be applied to the analogous hues.
 */
export type AnalogousVariations = Variation[];

/**
 * Structure for tetradic palette variations.
 * Contains variations for the four colors in the tetradic scheme.
 */
export type TetradicVariations = {
  first: { pure: Variation; muted: Variation };
  complement: Variation;
  fourth: { light: Variation; dark: Variation };
};

/**
 * Structure for split-complementary palette variations.
 * Contains variations for the base color and the two split-complementary colors.
 */
export type SplitComplementaryVariations = {
  base: { dark: Variation };
  complement: {
    first: { pure: Variation; muted: Variation };
    second: { pure: Variation; muted: Variation };
  };
};

/**
 * Calculates adaptive lightness and chroma variations for triadic palettes.
 * These variations ensure the palette remains balanced even when the base color
 * is very dark, very light, or in a specific hue range.
 * 
 * @param base - The base OKLCH color
 * @param style - The palette style
 * @returns Object containing variation settings for the base and triad colors
 */
export const getTriadicVariations = (base: OKLCH, style: PaletteStyle): TriadVariations => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  
  let baseVariations: { dark: Variation };
  let triadVariations: {
    first: { pure: Variation; muted: Variation };
    second: { pure: Variation; muted: Variation };
  };

  // Default setup
  const targetRange = { min: 0.15, max: 0.9 };
  if (baseLightness < 0.3) {
    baseVariations = { dark: { l: Math.max(-0.1, targetRange.min - baseLightness), c: 1.0 } };
    triadVariations = {
      first: { pure: { l: 0.2, c: 0.95 }, muted: { l: 0.35, c: 0.7 } },
      second: { pure: { l: 0.15, c: 0.95 }, muted: { l: 0.3, c: 0.7 } },
    };
  } else if (baseLightness > 0.7) {
    baseVariations = { dark: { l: Math.max(-0.4, targetRange.min - baseLightness), c: 1.1 } };
    triadVariations = {
      first: { pure: { l: -0.2, c: 0.95 }, muted: { l: -0.35, c: 0.7 } },
      second: { pure: { l: -0.25, c: 0.95 }, muted: { l: -0.15, c: 0.7 } },
    };
  } else {
    baseVariations = { dark: { l: -0.2, c: 1.1 } };
    triadVariations = {
      first: { pure: { l: 0.1, c: 0.95 }, muted: { l: 0.2, c: 0.7 } },
      second: { pure: { l: -0.1, c: 0.95 }, muted: { l: -0.2, c: 0.7 } },
    };
  }

  // Style-specific overrides
  if (style === 'triangle') {
    const mod = baseLightness < 0.4 ? 0.1 : baseLightness > 0.6 ? -0.1 : 0;
    baseVariations = { dark: { l: Math.max(-0.18 + mod, -0.3), c: 1.0 } };
    triadVariations = {
      first: { pure: { l: 0.05 - mod, c: 0.9 }, muted: { l: 0.12 - mod, c: 0.65 } },
      second: { pure: { l: -0.02 - mod, c: 0.92 }, muted: { l: -0.08 - mod, c: 0.68 } },
    };
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      baseVariations = { dark: { l: Math.max(-0.25 + mod, -0.35), c: 1.2 } };
      triadVariations = {
        first: { pure: { l: 0.08 - mod, c: 0.85 }, muted: { l: 0.15 - mod, c: 0.6 } },
        second: { pure: { l: 0.05 - mod, c: 0.9 }, muted: { l: -0.05 - mod, c: 0.65 } },
      };
    } else if (baseHue >= 150 && baseHue < 210) {
      baseVariations = { dark: { l: Math.max(-0.15 + mod, -0.25), c: 0.9 } };
      triadVariations = {
        first: { pure: { l: 0.1 - mod, c: 0.9 }, muted: { l: 0.18 - mod, c: 0.7 } },
        second: { pure: { l: 0.05 - mod, c: 0.85 }, muted: { l: -0.08 - mod, c: 0.6 } },
      };
    }
  } else if (style === 'diamond') {
    if (baseLightness > 0.8 && baseChroma < 0.3) {
      baseVariations = { dark: { l: Math.max(-0.25, 0.15 - baseLightness), c: 1.0 } };
      triadVariations = {
        first: { pure: { l: -0.05, c: 0.85 }, muted: { l: 0.1, c: 0.6 } },
        second: { pure: { l: -0.15, c: 0.8 }, muted: { l: -0.25, c: 0.5 } },
      };
    } else if (baseChroma > 0.8 && baseLightness < 0.4) {
      baseVariations = { dark: { l: Math.max(-0.2, 0.15 - baseLightness), c: 1.3 } };
      triadVariations = {
        first: { pure: { l: 0.25, c: 1.0 }, muted: { l: 0.15, c: 0.8 } },
        second: { pure: { l: 0.35, c: 1.1 }, muted: { l: 0.1, c: 0.75 } },
      };
    }
  }

  return { base: baseVariations, triad: triadVariations };
};

/**
 * Calculates adaptive lightness and chroma variations for complementary palettes.
 * Adjusts variations based on the base color's lightness and the selected style
 * to ensure contrast and visual harmony between the base and its complement.
 * 
 * @param base - The base OKLCH color
 * @param style - The palette style
 * @returns Object containing variation settings for the base and complement colors
 */
export const getComplementaryVariations = (base: OKLCH, style: PaletteStyle): ComplementaryVariations => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  const targetRange = { min: 0.15, max: 0.9 };

  let baseVariations: { dark: Variation; light: Variation };
  let complementVariations: { main: Variation; light: Variation; muted: Variation };

  if (baseLightness < 0.3) {
    baseVariations = {
      dark: { l: Math.max(-0.1, targetRange.min - baseLightness), c: 1.0 },
      light: { l: Math.min(0.4, targetRange.max - baseLightness), c: 0.8 },
    };
    complementVariations = {
      main: { l: 0.2, c: 1.0 },
      light: { l: 0.35, c: 0.7 },
      muted: { l: 0.1, c: 0.5 },
    };
  } else if (baseLightness > 0.7) {
    baseVariations = {
      dark: { l: Math.max(-0.4, targetRange.min - baseLightness), c: 1.1 },
      light: { l: Math.min(0.1, targetRange.max - baseLightness), c: 0.8 },
    };
    complementVariations = {
      main: { l: -0.2, c: 1.0 },
      light: { l: -0.1, c: 0.8 },
      muted: { l: -0.3, c: 0.6 },
    };
  } else {
    baseVariations = {
      dark: { l: -0.2, c: 1.1 },
      light: { l: 0.2, c: 0.8 },
    };
    complementVariations = {
      main: { l: 0.05, c: 1.0 },
      light: { l: 0.25, c: 0.7 },
      muted: { l: -0.15, c: 0.5 },
    };
  }

  if (style === 'triangle') {
    const mod = baseLightness < 0.4 ? 0.1 : baseLightness > 0.6 ? -0.1 : 0;
    baseVariations = {
      dark: { l: Math.max(-0.2 + mod, -0.3), c: 0.9 },
      light: { l: Math.min(0.15 + mod, 0.3), c: 0.7 },
    };
    complementVariations = {
      main: { l: 0.05 - mod, c: 1.0 },
      light: { l: 0.2 - mod, c: 0.75 },
      muted: { l: -0.1 - mod, c: 0.5 },
    };
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      baseVariations = {
        dark: { l: Math.max(-0.25 + mod, -0.4), c: 1.2 },
        light: { l: Math.min(0.1 + mod, 0.3), c: 0.8 },
      };
      complementVariations = {
        main: { l: 0.15 - mod, c: 0.9 },
        light: { l: 0.3 - mod, c: 0.6 },
        muted: { l: -0.05 - mod, c: 0.5 },
      };
    } else if (baseHue >= 150 && baseHue < 210) {
      baseVariations = {
        dark: { l: Math.max(-0.15 + mod, -0.3), c: 0.8 },
        light: { l: Math.min(0.15 + mod, 0.25), c: 0.5 },
      };
      complementVariations = {
        main: { l: 0.1 - mod, c: 1.0 },
        light: { l: 0.25 - mod, c: 0.85 },
        muted: { l: -0.05 - mod, c: 0.6 },
      };
    }
  } else if (style === 'diamond') {
    if (baseLightness > 0.8 && baseChroma < 0.3) {
      baseVariations = {
        dark: { l: Math.max(-0.3, 0.15 - baseLightness), c: 1.0 },
        light: { l: Math.min(0.05, 0.9 - baseLightness), c: 0.7 },
      };
      complementVariations = {
        main: { l: -0.1, c: 0.9 },
        light: { l: 0.05, c: 0.7 },
        muted: { l: -0.25, c: 0.4 },
      };
    } else if (baseChroma > 0.8 && baseLightness < 0.4) {
      baseVariations = {
        dark: { l: Math.max(-0.25, 0.15 - baseLightness), c: 1.3 },
        light: { l: Math.min(0.3, 0.8 - baseLightness), c: 0.9 },
      };
      complementVariations = {
        main: { l: 0.25, c: 1.2 },
        light: { l: 0.4, c: 0.9 },
        muted: { l: 0.1, c: 0.6 },
      };
    }
  }

  return { base: baseVariations, complement: complementVariations };
};

/**
 * Calculates adaptive lightness and chroma variations for analogous palettes.
 * Generates a sequence of variations to create a smooth transition or interesting
 * contrast across the analogous hues, adapting to the base color's characteristics.
 * 
 * @param base - The base OKLCH color
 * @param style - The palette style
 * @returns Array of variation settings for the analogous colors
 */
export const getAnalogousVariations = (base: OKLCH, style: PaletteStyle): AnalogousVariations => {
  const { l: baseLightness, h: baseHue } = base;
  let variations: AnalogousVariations;

  if (baseLightness < 0.3) {
    variations = [
      { l: 0, c: 1.0 },
      { l: 0.25, c: 0.8 },
      { l: 0.1, c: 0.9 },
      { l: 0.35, c: 0.85 },
      { l: 0.45, c: 0.7 },
      { l: 0.55, c: 0.6 },
    ];
  } else if (baseLightness > 0.7) {
    variations = [
      { l: 0, c: 1.0 },
      { l: -0.35, c: 0.8 },
      { l: -0.2, c: 0.9 },
      { l: -0.45, c: 0.85 },
      { l: -0.1, c: 0.7 },
      { l: 0.05, c: 0.6 },
    ];
  } else {
    variations = [
      { l: 0, c: 1.0 },
      { l: -0.2, c: 0.8 },
      { l: -0.1, c: 0.9 },
      { l: 0.15, c: 0.85 },
      { l: 0.25, c: 0.7 },
      { l: 0.35, c: 0.6 },
    ];
  }

  if (style === 'triangle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    variations = [
      { l: 0, c: 1.0 },
      { l: Math.max(-0.2 + mod, -0.35), c: 0.65 },
      { l: -0.08 + mod, c: 0.85 },
      { l: 0.06 + mod, c: 0.95 },
      { l: Math.min(0.18 + mod, 0.4), c: 0.75 },
      { l: Math.min(0.32 + mod, 0.5), c: 0.5 },
    ];
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.2 : baseLightness > 0.6 ? -0.2 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      variations = [
        { l: 0, c: 1.0 },
        { l: Math.max(-0.25 + mod, -0.4), c: 1.1 },
        { l: -0.08 + mod, c: 1.0 },
        { l: 0.05 + mod, c: 0.95 },
        { l: Math.min(0.15 + mod, 0.35), c: 0.85 },
        { l: Math.min(0.3 + mod, 0.5), c: 0.6 },
      ];
    } else if (baseHue >= 150 && baseHue < 210) {
      variations = [
        { l: 0, c: 1.0 },
        { l: Math.max(-0.18 + mod, -0.35), c: 0.7 },
        { l: -0.06 + mod, c: 0.85 },
        { l: 0.08 + mod, c: 0.9 },
        { l: Math.min(0.2 + mod, 0.4), c: 0.7 },
        { l: Math.min(0.35 + mod, 0.55), c: 0.45 },
      ];
    }
  } else if (style === 'diamond') {
    if (baseHue >= 30 && baseHue < 90 && baseLightness > 0.6) {
      variations = [
        { l: 0, c: 1.0 },
        { l: Math.max(-0.3, 0.15 - baseLightness), c: 0.6 },
        { l: -0.12, c: 0.8 },
        { l: Math.min(0.08, 0.85 - baseLightness), c: 1.05 },
        { l: Math.min(0.22, 0.9 - baseLightness), c: 0.95 },
        { l: Math.min(0.3, 0.9 - baseLightness), c: 0.75 },
      ];
    } else if (baseHue >= 180 && baseHue < 240 && baseLightness < 0.5) {
      variations = [
        { l: 0, c: 1.0 },
        { l: Math.max(-0.2, 0.15 - baseLightness), c: 0.5 },
        { l: -0.08, c: 0.7 },
        { l: 0.1, c: 0.85 },
        { l: 0.25, c: 0.65 },
        { l: 0.35, c: 0.45 },
      ];
    }
  }

  return variations;
};

/**
 * Calculates adaptive lightness and chroma variations for tetradic palettes.
 * Provides specific variations for each of the four colors in the tetradic scheme,
 * ensuring balance and avoiding overwhelming combinations, especially for extreme base colors.
 * 
 * @param base - The base OKLCH color
 * @param style - The palette style
 * @returns Object containing variation settings for the tetradic colors
 */
export const getTetradicVariations = (base: OKLCH, style: PaletteStyle): TetradicVariations => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  let variations: TetradicVariations;

  if (baseLightness < 0.3) {
    variations = {
      first: { pure: { l: 0.25, c: 0.9 }, muted: { l: 0.1, c: 0.6 } },
      complement: { l: 0.35, c: 0.95 },
      fourth: { light: { l: 0.45, c: 0.8 }, dark: { l: 0.15, c: 1.1 } },
    };
  } else if (baseLightness > 0.7) {
    variations = {
      first: { pure: { l: -0.25, c: 0.9 }, muted: { l: -0.4, c: 0.6 } },
      complement: { l: -0.35, c: 0.95 },
      fourth: { light: { l: -0.15, c: 0.8 }, dark: { l: -0.45, c: 1.1 } },
    };
  } else {
    variations = {
      first: { pure: { l: 0.1, c: 0.9 }, muted: { l: -0.15, c: 0.6 } },
      complement: { l: 0.05, c: 0.95 },
      fourth: { light: { l: 0.2, c: 0.8 }, dark: { l: -0.25, c: 1.1 } },
    };
  }

  if (style === 'triangle') {
    const mod = baseLightness < 0.4 ? 0.1 : baseLightness > 0.6 ? -0.1 : 0;
    variations = {
      first: { pure: { l: 0.08 - mod, c: 0.85 }, muted: { l: -0.08 - mod, c: 0.65 } },
      complement: { l: 0.02 - mod, c: 0.9 },
      fourth: { light: { l: 0.12 - mod, c: 0.75 }, dark: { l: -0.12 - mod, c: 0.95 } },
    };
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      variations = {
        first: { pure: { l: 0.1 - mod, c: 1.0 }, muted: { l: -0.05 - mod, c: 0.8 } },
        complement: { l: 0.15 - mod, c: 0.8 },
        fourth: { light: { l: 0.2 - mod, c: 0.7 }, dark: { l: -0.2 - mod, c: 1.2 } },
      };
    } else if (baseHue >= 150 && baseHue < 210) {
      variations = {
        first: { pure: { l: 0.06 - mod, c: 0.8 }, muted: { l: -0.12 - mod, c: 0.5 } },
        complement: { l: 0.08 - mod, c: 0.85 },
        fourth: { light: { l: 0.15 - mod, c: 0.75 }, dark: { l: -0.1 - mod, c: 0.9 } },
      };
    }
  } else if (style === 'diamond') {
    if (baseLightness > 0.8 && baseChroma < 0.3) {
      variations = {
        first: { pure: { l: -0.05, c: 0.8 }, muted: { l: -0.2, c: 0.5 } },
        complement: { l: -0.15, c: 0.85 },
        fourth: { light: { l: 0.05, c: 0.7 }, dark: { l: Math.max(-0.3, 0.15 - baseLightness), c: 0.9 } },
      };
    } else if (baseChroma > 0.8 && baseLightness < 0.4) {
      variations = {
        first: { pure: { l: 0.25, c: 1.1 }, muted: { l: 0.1, c: 0.8 } },
        complement: { l: 0.35, c: 1.0 },
        fourth: { light: { l: 0.4, c: 0.9 }, dark: { l: Math.max(-0.15, 0.15 - baseLightness), c: 1.3 } },
      };
    }
  }

  return variations;
};

/**
 * Calculates adaptive lightness and chroma variations for split-complementary palettes.
 * Creates variations that balance the base color with the two split-complementary colors,
 * adjusting for lightness extremes and specific style requirements.
 * 
 * @param base - The base OKLCH color
 * @param style - The palette style
 * @returns Object containing variation settings for the base and split-complementary colors
 */
export const getSplitComplementaryVariations = (base: OKLCH, style: PaletteStyle): SplitComplementaryVariations => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  const targetRange = { min: 0.15, max: 0.9 };

  let baseVariations: { dark: Variation };
  let complementVariations: {
    first: { pure: Variation; muted: Variation };
    second: { pure: Variation; muted: Variation };
  };

  if (baseLightness < 0.3) {
    baseVariations = { dark: { l: Math.max(-0.1, targetRange.min - baseLightness), c: 1.0 } };
    complementVariations = {
      first: { pure: { l: 0.3, c: 0.9 }, muted: { l: 0.15, c: 0.7 } },
      second: { pure: { l: 0.2, c: 0.9 }, muted: { l: 0.4, c: 0.6 } },
    };
  } else if (baseLightness > 0.7) {
    baseVariations = { dark: { l: Math.max(-0.4, targetRange.min - baseLightness), c: 1.1 } };
    complementVariations = {
      first: { pure: { l: -0.2, c: 0.9 }, muted: { l: -0.35, c: 0.7 } },
      second: { pure: { l: -0.3, c: 0.9 }, muted: { l: -0.15, c: 0.7 } },
    };
  } else {
    baseVariations = { dark: { l: -0.2, c: 1.1 } };
    complementVariations = {
      first: { pure: { l: 0.15, c: 0.9 }, muted: { l: -0.15, c: 0.7 } },
      second: { pure: { l: -0.1, c: 0.9 }, muted: { l: 0.2, c: 0.7 } },
    };
  }

  if (style === 'triangle') {
    const mod = baseLightness < 0.4 ? 0.1 : baseLightness > 0.6 ? -0.1 : 0;
    baseVariations = { dark: { l: Math.max(-0.18 + mod, -0.3), c: 0.95 } };
    complementVariations = {
      first: { pure: { l: 0.08 - mod, c: 0.85 }, muted: { l: -0.08 - mod, c: 0.65 } },
      second: { pure: { l: -0.02 - mod, c: 0.88 }, muted: { l: 0.12 - mod, c: 0.68 } },
    };
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      baseVariations = { dark: { l: Math.max(-0.2 + mod, -0.35), c: 1.2 } };
      complementVariations = {
        first: { pure: { l: 0.15 - mod, c: 0.8 }, muted: { l: -0.05 - mod, c: 0.6 } },
        second: { pure: { l: 0.1 - mod, c: 0.85 }, muted: { l: 0.2 - mod, c: 0.65 } },
      };
    } else if (baseHue >= 150 && baseHue < 210) {
      baseVariations = { dark: { l: Math.max(-0.15 + mod, -0.25), c: 0.9 } };
      complementVariations = {
        first: { pure: { l: 0.12 - mod, c: 0.95 }, muted: { l: -0.08 - mod, c: 0.75 } },
        second: { pure: { l: 0.08 - mod, c: 0.9 }, muted: { l: 0.18 - mod, c: 0.7 } },
      };
    }
  } else if (style === 'diamond') {
    if (baseLightness > 0.8 && baseChroma < 0.3) {
      baseVariations = { dark: { l: Math.max(-0.25, 0.15 - baseLightness), c: 1.0 } };
      complementVariations = {
        first: { pure: { l: -0.05, c: 0.8 }, muted: { l: -0.2, c: 0.5 } },
        second: { pure: { l: -0.08, c: 0.75 }, muted: { l: 0.05, c: 0.55 } },
      };
    } else if (baseChroma > 0.8 && baseLightness < 0.4) {
      baseVariations = { dark: { l: Math.max(-0.2, 0.15 - baseLightness), c: 1.3 } };
      complementVariations = {
        first: { pure: { l: 0.25, c: 1.1 }, muted: { l: 0.1, c: 0.8 } },
        second: { pure: { l: 0.35, c: 1.0 }, muted: { l: 0.15, c: 0.75 } },
      };
    }
  }

  return { base: baseVariations, complement: complementVariations };
};

