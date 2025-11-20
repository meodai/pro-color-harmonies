import type { OKLCH, PaletteStyle } from '../index';

type Variation = { l: number; c: number };
export type TriadVariations = {
  base: { dark: Variation };
  triad: {
    first: { pure: Variation; muted: Variation };
    second: { pure: Variation; muted: Variation };
  };
};

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
