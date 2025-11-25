import type { OKLCH, PaletteStyle } from '../index';
import { interpolateDeep } from './interpolation';

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
export const getTriadicVariations = (base: OKLCH, style: PaletteStyle, interpolate = false): TriadVariations => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  
  const getDefault = (l: number) => {
    const targetRange = { min: 0.15, max: 0.9 };
    let baseVariations: { dark: Variation };
    let triadVariations: {
      first: { pure: Variation; muted: Variation };
      second: { pure: Variation; muted: Variation };
    };

    if (l < 0.3) {
      baseVariations = { dark: { l: Math.max(-0.1, targetRange.min - l), c: 1.0 } };
      triadVariations = {
        first: { pure: { l: 0.2, c: 0.95 }, muted: { l: 0.35, c: 0.7 } },
        second: { pure: { l: 0.15, c: 0.95 }, muted: { l: 0.3, c: 0.7 } },
      };
    } else if (l > 0.7) {
      baseVariations = { dark: { l: Math.max(-0.4, targetRange.min - l), c: 1.1 } };
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
    return { base: baseVariations, triad: triadVariations };
  };

  if (style === 'triangle') {
    const getTriangle = (l: number) => {
      const mod = l < 0.4 ? 0.1 : l > 0.6 ? -0.1 : 0;
      return {
        base: { dark: { l: Math.max(-0.18 + mod, -0.3), c: 1.0 } },
        triad: {
          first: { pure: { l: 0.05 - mod, c: 0.9 }, muted: { l: 0.12 - mod, c: 0.65 } },
          second: { pure: { l: -0.02 - mod, c: 0.92 }, muted: { l: -0.08 - mod, c: 0.68 } },
        }
      };
    };

    if (interpolate) {
      const width = 0.1;
      if (baseLightness >= 0.4 - width/2 && baseLightness <= 0.4 + width/2) {
        const t = (baseLightness - (0.4 - width/2)) / width;
        return interpolateDeep(getTriangle(0.35), getTriangle(0.45), t);
      }
      if (baseLightness >= 0.6 - width/2 && baseLightness <= 0.6 + width/2) {
        const t = (baseLightness - (0.6 - width/2)) / width;
        return interpolateDeep(getTriangle(0.55), getTriangle(0.65), t);
      }
    }
    return getTriangle(baseLightness);
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      return {
        base: { dark: { l: Math.max(-0.25 + mod, -0.35), c: 1.2 } },
        triad: {
          first: { pure: { l: 0.08 - mod, c: 0.85 }, muted: { l: 0.15 - mod, c: 0.6 } },
          second: { pure: { l: 0.05 - mod, c: 0.9 }, muted: { l: -0.05 - mod, c: 0.65 } },
        }
      };
    } else if (baseHue >= 150 && baseHue < 210) {
      return {
        base: { dark: { l: Math.max(-0.15 + mod, -0.25), c: 0.9 } },
        triad: {
          first: { pure: { l: 0.1 - mod, c: 0.9 }, muted: { l: 0.18 - mod, c: 0.7 } },
          second: { pure: { l: 0.05 - mod, c: 0.85 }, muted: { l: -0.08 - mod, c: 0.6 } },
        }
      };
    }
  } else if (style === 'diamond') {
    if (baseLightness > 0.8 && baseChroma < 0.3) {
      return {
        base: { dark: { l: Math.max(-0.25, 0.15 - baseLightness), c: 1.0 } },
        triad: {
          first: { pure: { l: -0.05, c: 0.85 }, muted: { l: 0.1, c: 0.6 } },
          second: { pure: { l: -0.15, c: 0.8 }, muted: { l: -0.25, c: 0.5 } },
        }
      };
    } else if (baseChroma > 0.8 && baseLightness < 0.4) {
      return {
        base: { dark: { l: Math.max(-0.2, 0.15 - baseLightness), c: 1.3 } },
        triad: {
          first: { pure: { l: 0.25, c: 1.0 }, muted: { l: 0.15, c: 0.8 } },
          second: { pure: { l: 0.35, c: 1.1 }, muted: { l: 0.1, c: 0.75 } },
        }
      };
    }
  }

  if (interpolate) {
    const width = 0.1;
    if (baseLightness >= 0.3 - width/2 && baseLightness <= 0.3 + width/2) {
      const t = (baseLightness - (0.3 - width/2)) / width;
      return interpolateDeep(getDefault(0.25), getDefault(0.35), t);
    }
    if (baseLightness >= 0.7 - width/2 && baseLightness <= 0.7 + width/2) {
      const t = (baseLightness - (0.7 - width/2)) / width;
      return interpolateDeep(getDefault(0.65), getDefault(0.75), t);
    }
  }

  return getDefault(baseLightness);
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
export const getComplementaryVariations = (base: OKLCH, style: PaletteStyle, interpolate = false): ComplementaryVariations => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  
  const getDefault = (l: number) => {
    const targetRange = { min: 0.15, max: 0.9 };
    if (l < 0.3) {
      return {
        base: {
          dark: { l: Math.max(-0.1, targetRange.min - l), c: 1.0 },
          light: { l: Math.min(0.4, targetRange.max - l), c: 0.8 },
        },
        complement: {
          main: { l: 0.2, c: 1.0 },
          light: { l: 0.35, c: 0.7 },
          muted: { l: 0.1, c: 0.5 },
        }
      };
    } else if (l > 0.7) {
      return {
        base: {
          dark: { l: Math.max(-0.4, targetRange.min - l), c: 1.1 },
          light: { l: Math.min(0.1, targetRange.max - l), c: 0.8 },
        },
        complement: {
          main: { l: -0.2, c: 1.0 },
          light: { l: -0.1, c: 0.8 },
          muted: { l: -0.3, c: 0.6 },
        }
      };
    } else {
      return {
        base: {
          dark: { l: -0.2, c: 1.1 },
          light: { l: 0.2, c: 0.8 },
        },
        complement: {
          main: { l: 0.05, c: 1.0 },
          light: { l: 0.25, c: 0.7 },
          muted: { l: -0.15, c: 0.5 },
        }
      };
    }
  };

  if (style === 'triangle') {
    const getTriangle = (l: number) => {
      const mod = l < 0.4 ? 0.1 : l > 0.6 ? -0.1 : 0;
      return {
        base: {
          dark: { l: Math.max(-0.2 + mod, -0.3), c: 0.9 },
          light: { l: Math.min(0.15 + mod, 0.3), c: 0.7 },
        },
        complement: {
          main: { l: 0.05 - mod, c: 1.0 },
          light: { l: 0.2 - mod, c: 0.75 },
          muted: { l: -0.1 - mod, c: 0.5 },
        }
      };
    };

    if (interpolate) {
      const width = 0.1;
      if (baseLightness >= 0.4 - width/2 && baseLightness <= 0.4 + width/2) {
        const t = (baseLightness - (0.4 - width/2)) / width;
        return interpolateDeep(getTriangle(0.35), getTriangle(0.45), t);
      }
      if (baseLightness >= 0.6 - width/2 && baseLightness <= 0.6 + width/2) {
        const t = (baseLightness - (0.6 - width/2)) / width;
        return interpolateDeep(getTriangle(0.55), getTriangle(0.65), t);
      }
    }
    return getTriangle(baseLightness);
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      return {
        base: {
          dark: { l: Math.max(-0.25 + mod, -0.4), c: 1.2 },
          light: { l: Math.min(0.1 + mod, 0.3), c: 0.8 },
        },
        complement: {
          main: { l: 0.15 - mod, c: 0.9 },
          light: { l: 0.3 - mod, c: 0.6 },
          muted: { l: -0.05 - mod, c: 0.5 },
        }
      };
    } else if (baseHue >= 150 && baseHue < 210) {
      return {
        base: {
          dark: { l: Math.max(-0.15 + mod, -0.3), c: 0.8 },
          light: { l: Math.min(0.15 + mod, 0.25), c: 0.5 },
        },
        complement: {
          main: { l: 0.1 - mod, c: 1.0 },
          light: { l: 0.25 - mod, c: 0.85 },
          muted: { l: -0.05 - mod, c: 0.6 },
        }
      };
    }
  } else if (style === 'diamond') {
    if (baseLightness > 0.8 && baseChroma < 0.3) {
      return {
        base: {
          dark: { l: Math.max(-0.3, 0.15 - baseLightness), c: 1.0 },
          light: { l: Math.min(0.05, 0.9 - baseLightness), c: 0.7 },
        },
        complement: {
          main: { l: -0.1, c: 0.9 },
          light: { l: 0.05, c: 0.7 },
          muted: { l: -0.25, c: 0.4 },
        }
      };
    } else if (baseChroma > 0.8 && baseLightness < 0.4) {
      return {
        base: {
          dark: { l: Math.max(-0.25, 0.15 - baseLightness), c: 1.3 },
          light: { l: Math.min(0.3, 0.8 - baseLightness), c: 0.9 },
        },
        complement: {
          main: { l: 0.25, c: 1.2 },
          light: { l: 0.4, c: 0.9 },
          muted: { l: 0.1, c: 0.6 },
        }
      };
    }
  }

  if (interpolate) {
    const width = 0.1;
    if (baseLightness >= 0.3 - width/2 && baseLightness <= 0.3 + width/2) {
      const t = (baseLightness - (0.3 - width/2)) / width;
      return interpolateDeep(getDefault(0.25), getDefault(0.35), t);
    }
    if (baseLightness >= 0.7 - width/2 && baseLightness <= 0.7 + width/2) {
      const t = (baseLightness - (0.7 - width/2)) / width;
      return interpolateDeep(getDefault(0.65), getDefault(0.75), t);
    }
  }

  return getDefault(baseLightness);
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
export const getAnalogousVariations = (base: OKLCH, style: PaletteStyle, interpolate = false): AnalogousVariations => {
  const { l: baseLightness, h: baseHue } = base;
  
  const getDefault = (l: number) => {
    if (l < 0.3) {
      return [
        { l: 0, c: 1.0 },
        { l: 0.25, c: 0.8 },
        { l: 0.1, c: 0.9 },
        { l: 0.35, c: 0.85 },
        { l: 0.45, c: 0.7 },
        { l: 0.55, c: 0.6 },
      ];
    } else if (l > 0.7) {
      return [
        { l: 0, c: 1.0 },
        { l: -0.35, c: 0.8 },
        { l: -0.2, c: 0.9 },
        { l: -0.45, c: 0.85 },
        { l: -0.1, c: 0.7 },
        { l: 0.05, c: 0.6 },
      ];
    } else {
      return [
        { l: 0, c: 1.0 },
        { l: -0.2, c: 0.8 },
        { l: -0.1, c: 0.9 },
        { l: 0.15, c: 0.85 },
        { l: 0.25, c: 0.7 },
        { l: 0.35, c: 0.6 },
      ];
    }
  };

  if (style === 'triangle') {
    const getTriangle = (l: number) => {
      const mod = l < 0.4 ? 0.15 : l > 0.6 ? -0.15 : 0;
      return [
        { l: 0, c: 1.0 },
        { l: Math.max(-0.2 + mod, -0.35), c: 0.65 },
        { l: -0.08 + mod, c: 0.85 },
        { l: 0.06 + mod, c: 0.95 },
        { l: Math.min(0.18 + mod, 0.4), c: 0.75 },
        { l: Math.min(0.32 + mod, 0.5), c: 0.5 },
      ];
    };

    if (interpolate) {
      const width = 0.1;
      if (baseLightness >= 0.4 - width/2 && baseLightness <= 0.4 + width/2) {
        const t = (baseLightness - (0.4 - width/2)) / width;
        return interpolateDeep(getTriangle(0.35), getTriangle(0.45), t);
      }
      if (baseLightness >= 0.6 - width/2 && baseLightness <= 0.6 + width/2) {
        const t = (baseLightness - (0.6 - width/2)) / width;
        return interpolateDeep(getTriangle(0.55), getTriangle(0.65), t);
      }
    }
    return getTriangle(baseLightness);
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.2 : baseLightness > 0.6 ? -0.2 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      return [
        { l: 0, c: 1.0 },
        { l: Math.max(-0.25 + mod, -0.4), c: 1.1 },
        { l: -0.08 + mod, c: 1.0 },
        { l: 0.05 + mod, c: 0.95 },
        { l: Math.min(0.15 + mod, 0.35), c: 0.85 },
        { l: Math.min(0.3 + mod, 0.5), c: 0.6 },
      ];
    } else if (baseHue >= 150 && baseHue < 210) {
      return [
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
      return [
        { l: 0, c: 1.0 },
        { l: Math.max(-0.3, 0.15 - baseLightness), c: 0.6 },
        { l: -0.12, c: 0.8 },
        { l: Math.min(0.08, 0.85 - baseLightness), c: 1.05 },
        { l: Math.min(0.22, 0.9 - baseLightness), c: 0.95 },
        { l: Math.min(0.3, 0.9 - baseLightness), c: 0.75 },
      ];
    } else if (baseHue >= 180 && baseHue < 240 && baseLightness < 0.5) {
      return [
        { l: 0, c: 1.0 },
        { l: Math.max(-0.2, 0.15 - baseLightness), c: 0.5 },
        { l: -0.08, c: 0.7 },
        { l: 0.1, c: 0.85 },
        { l: 0.25, c: 0.65 },
        { l: 0.35, c: 0.45 },
      ];
    }
  }

  if (interpolate) {
    const width = 0.1;
    if (baseLightness >= 0.3 - width/2 && baseLightness <= 0.3 + width/2) {
      const t = (baseLightness - (0.3 - width/2)) / width;
      return interpolateDeep(getDefault(0.25), getDefault(0.35), t);
    }
    if (baseLightness >= 0.7 - width/2 && baseLightness <= 0.7 + width/2) {
      const t = (baseLightness - (0.7 - width/2)) / width;
      return interpolateDeep(getDefault(0.65), getDefault(0.75), t);
    }
  }

  return getDefault(baseLightness);
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
export const getTetradicVariations = (base: OKLCH, style: PaletteStyle, interpolate = false): TetradicVariations => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  
  const getDefault = (l: number) => {
    if (l < 0.3) {
      return {
        first: { pure: { l: 0.25, c: 0.9 }, muted: { l: 0.1, c: 0.6 } },
        complement: { l: 0.35, c: 0.95 },
        fourth: { light: { l: 0.45, c: 0.8 }, dark: { l: 0.15, c: 1.1 } },
      };
    } else if (l > 0.7) {
      return {
        first: { pure: { l: -0.25, c: 0.9 }, muted: { l: -0.4, c: 0.6 } },
        complement: { l: -0.35, c: 0.95 },
        fourth: { light: { l: -0.15, c: 0.8 }, dark: { l: -0.45, c: 1.1 } },
      };
    } else {
      return {
        first: { pure: { l: 0.1, c: 0.9 }, muted: { l: -0.15, c: 0.6 } },
        complement: { l: 0.05, c: 0.95 },
        fourth: { light: { l: 0.2, c: 0.8 }, dark: { l: -0.25, c: 1.1 } },
      };
    }
  };

  if (style === 'triangle') {
    const getTriangle = (l: number) => {
      const mod = l < 0.4 ? 0.1 : l > 0.6 ? -0.1 : 0;
      return {
        first: { pure: { l: 0.08 - mod, c: 0.85 }, muted: { l: -0.08 - mod, c: 0.65 } },
        complement: { l: 0.02 - mod, c: 0.9 },
        fourth: { light: { l: 0.12 - mod, c: 0.75 }, dark: { l: -0.12 - mod, c: 0.95 } },
      };
    };

    if (interpolate) {
      const width = 0.1;
      if (baseLightness >= 0.4 - width/2 && baseLightness <= 0.4 + width/2) {
        const t = (baseLightness - (0.4 - width/2)) / width;
        return interpolateDeep(getTriangle(0.35), getTriangle(0.45), t);
      }
      if (baseLightness >= 0.6 - width/2 && baseLightness <= 0.6 + width/2) {
        const t = (baseLightness - (0.6 - width/2)) / width;
        return interpolateDeep(getTriangle(0.55), getTriangle(0.65), t);
      }
    }
    return getTriangle(baseLightness);
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      return {
        first: { pure: { l: 0.1 - mod, c: 1.0 }, muted: { l: -0.05 - mod, c: 0.8 } },
        complement: { l: 0.15 - mod, c: 0.8 },
        fourth: { light: { l: 0.2 - mod, c: 0.7 }, dark: { l: -0.2 - mod, c: 1.2 } },
      };
    } else if (baseHue >= 150 && baseHue < 210) {
      return {
        first: { pure: { l: 0.06 - mod, c: 0.8 }, muted: { l: -0.12 - mod, c: 0.5 } },
        complement: { l: 0.08 - mod, c: 0.85 },
        fourth: { light: { l: 0.15 - mod, c: 0.75 }, dark: { l: -0.1 - mod, c: 0.9 } },
      };
    }
  } else if (style === 'diamond') {
    if (baseLightness > 0.8 && baseChroma < 0.3) {
      return {
        first: { pure: { l: -0.05, c: 0.8 }, muted: { l: -0.2, c: 0.5 } },
        complement: { l: -0.15, c: 0.85 },
        fourth: { light: { l: 0.05, c: 0.7 }, dark: { l: Math.max(-0.3, 0.15 - baseLightness), c: 0.9 } },
      };
    } else if (baseChroma > 0.8 && baseLightness < 0.4) {
      return {
        first: { pure: { l: 0.25, c: 1.1 }, muted: { l: 0.1, c: 0.8 } },
        complement: { l: 0.35, c: 1.0 },
        fourth: { light: { l: 0.4, c: 0.9 }, dark: { l: Math.max(-0.15, 0.15 - baseLightness), c: 1.3 } },
      };
    }
  }

  if (interpolate) {
    const width = 0.1;
    if (baseLightness >= 0.3 - width/2 && baseLightness <= 0.3 + width/2) {
      const t = (baseLightness - (0.3 - width/2)) / width;
      return interpolateDeep(getDefault(0.25), getDefault(0.35), t);
    }
    if (baseLightness >= 0.7 - width/2 && baseLightness <= 0.7 + width/2) {
      const t = (baseLightness - (0.7 - width/2)) / width;
      return interpolateDeep(getDefault(0.65), getDefault(0.75), t);
    }
  }

  return getDefault(baseLightness);
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
export const getSplitComplementaryVariations = (base: OKLCH, style: PaletteStyle, interpolate = false): SplitComplementaryVariations => {
  const { l: baseLightness, c: baseChroma, h: baseHue } = base;
  
  const getDefault = (l: number) => {
    const targetRange = { min: 0.15, max: 0.9 };
    if (l < 0.3) {
      return {
        base: { dark: { l: Math.max(-0.1, targetRange.min - l), c: 1.0 } },
        complement: {
          first: { pure: { l: 0.3, c: 0.9 }, muted: { l: 0.15, c: 0.7 } },
          second: { pure: { l: 0.2, c: 0.9 }, muted: { l: 0.4, c: 0.6 } },
        }
      };
    } else if (l > 0.7) {
      return {
        base: { dark: { l: Math.max(-0.4, targetRange.min - l), c: 1.1 } },
        complement: {
          first: { pure: { l: -0.2, c: 0.9 }, muted: { l: -0.35, c: 0.7 } },
          second: { pure: { l: -0.3, c: 0.9 }, muted: { l: -0.15, c: 0.7 } },
        }
      };
    } else {
      return {
        base: { dark: { l: -0.2, c: 1.1 } },
        complement: {
          first: { pure: { l: 0.15, c: 0.9 }, muted: { l: -0.15, c: 0.7 } },
          second: { pure: { l: -0.1, c: 0.9 }, muted: { l: 0.2, c: 0.7 } },
        }
      };
    }
  };

  if (style === 'triangle') {
    const getTriangle = (l: number) => {
      const mod = l < 0.4 ? 0.1 : l > 0.6 ? -0.1 : 0;
      return {
        base: { dark: { l: Math.max(-0.18 + mod, -0.3), c: 0.95 } },
        complement: {
          first: { pure: { l: 0.08 - mod, c: 0.85 }, muted: { l: -0.08 - mod, c: 0.65 } },
          second: { pure: { l: -0.02 - mod, c: 0.88 }, muted: { l: 0.12 - mod, c: 0.68 } },
        }
      };
    };

    if (interpolate) {
      const width = 0.1;
      if (baseLightness >= 0.4 - width/2 && baseLightness <= 0.4 + width/2) {
        const t = (baseLightness - (0.4 - width/2)) / width;
        return interpolateDeep(getTriangle(0.35), getTriangle(0.45), t);
      }
      if (baseLightness >= 0.6 - width/2 && baseLightness <= 0.6 + width/2) {
        const t = (baseLightness - (0.6 - width/2)) / width;
        return interpolateDeep(getTriangle(0.55), getTriangle(0.65), t);
      }
    }
    return getTriangle(baseLightness);
  } else if (style === 'circle') {
    const mod = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
    if (baseHue >= 345 || baseHue < 30) {
      return {
        base: { dark: { l: Math.max(-0.2 + mod, -0.35), c: 1.2 } },
        complement: {
          first: { pure: { l: 0.15 - mod, c: 0.8 }, muted: { l: -0.05 - mod, c: 0.6 } },
          second: { pure: { l: 0.1 - mod, c: 0.85 }, muted: { l: 0.2 - mod, c: 0.65 } },
        }
      };
    } else if (baseHue >= 150 && baseHue < 210) {
      return {
        base: { dark: { l: Math.max(-0.15 + mod, -0.25), c: 0.9 } },
        complement: {
          first: { pure: { l: 0.12 - mod, c: 0.95 }, muted: { l: -0.08 - mod, c: 0.75 } },
          second: { pure: { l: 0.08 - mod, c: 0.9 }, muted: { l: 0.18 - mod, c: 0.7 } },
        }
      };
    }
  } else if (style === 'diamond') {
    if (baseLightness > 0.8 && baseChroma < 0.3) {
      return {
        base: { dark: { l: Math.max(-0.25, 0.15 - baseLightness), c: 1.0 } },
        complement: {
          first: { pure: { l: -0.05, c: 0.8 }, muted: { l: -0.2, c: 0.5 } },
          second: { pure: { l: -0.08, c: 0.75 }, muted: { l: 0.05, c: 0.55 } },
        }
      };
    } else if (baseChroma > 0.8 && baseLightness < 0.4) {
      return {
        base: { dark: { l: Math.max(-0.2, 0.15 - baseLightness), c: 1.3 } },
        complement: {
          first: { pure: { l: 0.25, c: 1.1 }, muted: { l: 0.1, c: 0.8 } },
          second: { pure: { l: 0.35, c: 1.0 }, muted: { l: 0.15, c: 0.75 } },
        }
      };
    }
  }

  if (interpolate) {
    const width = 0.1;
    if (baseLightness >= 0.3 - width/2 && baseLightness <= 0.3 + width/2) {
      const t = (baseLightness - (0.3 - width/2)) / width;
      return interpolateDeep(getDefault(0.25), getDefault(0.35), t);
    }
    if (baseLightness >= 0.7 - width/2 && baseLightness <= 0.7 + width/2) {
      const t = (baseLightness - (0.7 - width/2)) / width;
      return interpolateDeep(getDefault(0.65), getDefault(0.75), t);
    }
  }

  return getDefault(baseLightness);
};

