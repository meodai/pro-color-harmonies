/**
 * Color Palette Generator Library
 * Generates harmonious color palettes from a single input color
 * Based on the color theory and perceptual color science
 */

// Utils
import { normalizeHue, avoidMuddyZones } from './utils/color';
import { applyModifiers } from './utils/modifiers';
import { createPaletteGenerator } from './utils/palette';

// ============= Type Definitions =============

export interface OKLCH {
  l: number;
  c: number;
  h: number;
}

export type PaletteStyle = 'square' | 'triangle' | 'circle' | 'diamond';
export type PaletteType = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary';

export type PaletteColor = OKLCH;

export interface GeneratorOptions {
  style: PaletteStyle;
  chromaAdjust?: number;
  modifiers?: [number, number, number, number]; // Optional palette modulation knobs (0-1)
}

// ============= Complementary Generator =============

export const generateComplementary = createPaletteGenerator(
  'complementary',
  (base, options, enhanced) => {
    const { style, chromaAdjust = 0.9 } = options;
    const { l: baseLightness, c: baseChroma, h: baseHue } = base;

    // Calculate complement hue based on style
    let complementHue: number;
    switch (style) {
      case 'square':
        // Pure mathematical - rigid 180° opposite
        complementHue = normalizeHue(baseHue + 180);
        break;
      case 'triangle':
        // Perceptual harmony - adjusted for human vision
        if (baseHue >= 0 && baseHue < 30) {
          complementHue = 170 + baseHue * 0.3; // Rich teals/cyans
        } else if (baseHue >= 30 && baseHue < 90) {
          complementHue = 240 + (baseHue - 30) * 0.5; // Blues to blue-purples
        } else if (baseHue >= 90 && baseHue < 150) {
          complementHue = 320 + (baseHue - 90) * 0.6; // Rich magentas to warm reds
        } else if (baseHue >= 150 && baseHue < 210) {
          complementHue = 20 + (baseHue - 150) * 0.4; // Warm reds to red-oranges
        } else if (baseHue >= 210 && baseHue < 270) {
          complementHue = 40 + (baseHue - 210) * 0.3; // Rich oranges
        } else {
          complementHue = 90 + (baseHue - 270) * 0.4; // Yellow-greens to greens
        }
        break;
      case 'circle':
        // Emotional resonance
        if (baseHue >= 345 || baseHue < 30) {
          complementHue = 180 + Math.sin((baseHue * Math.PI) / 180) * 20;
        } else if (baseHue >= 30 && baseHue < 90) {
          const intensity = baseChroma * baseLightness;
          complementHue = 240 + intensity * 30;
        } else if (baseHue >= 90 && baseHue < 150) {
          complementHue = 320 + (baseHue - 90) * 0.5;
        } else if (baseHue >= 150 && baseHue < 210) {
          complementHue = 30 + Math.cos((baseHue * Math.PI) / 180) * 15;
        } else if (baseHue >= 210 && baseHue < 270) {
          complementHue = 50 + (270 - baseHue) * 0.4;
        } else {
          complementHue = 100 + Math.sin(((baseHue - 270) * Math.PI) / 90) * 25;
        }
        break;
      case 'diamond':
        // Luminosity-based complements
        if (baseLightness > 0.8 && baseChroma < 0.3) {
          complementHue = normalizeHue(baseHue + 200);
        } else if (baseHue >= 30 && baseHue < 90 && baseLightness > 0.6) {
          complementHue = 240 + (baseHue - 30) * 0.3;
        } else {
          const lightInfluence = baseLightness * 20 - 10;
          complementHue = normalizeHue(baseHue + 180 + lightInfluence);
        }
        break;
      default:
        complementHue = normalizeHue(baseHue + 180);
    }

    // Apply muddy zone avoidance if enhanced
    if (enhanced) {
      const cleaned = avoidMuddyZones(complementHue, baseLightness, baseChroma * chromaAdjust);
      complementHue = cleaned.h;
    }

    // Generate 6 colors total
    return [
      // 1. Base color (preserved)
      { l: baseLightness, c: baseChroma, h: baseHue },
      
      // 2. Main complement
      { l: baseLightness + 0.05, c: baseChroma * chromaAdjust, h: complementHue },
      
      // 3. Dark base
      { l: baseLightness - 0.2, c: baseChroma * 1.1, h: baseHue },
      
      // 4. Light base
      { l: baseLightness + 0.2, c: baseChroma * 0.8, h: baseHue },
      
      // 5. Light complement
      { l: baseLightness + 0.25, c: baseChroma * 0.7, h: complementHue },
      
      // 6. Muted complement
      { l: baseLightness - 0.15, c: baseChroma * 0.5, h: complementHue },
    ];
  }
);

// ============= Analogous Generator =============

export const generateAnalogous = createPaletteGenerator(
  'analogous',
  (base, options, enhanced) => {
    const { style, chromaAdjust = 0.9 } = options;
    const { l: baseLightness, c: baseChroma, h: baseHue } = base;

    let analogousHues: number[];
    
    switch (style) {
      case 'square':
        // Pure mathematical - traditional 60° total spread
        analogousHues = [
          baseHue,
          normalizeHue(baseHue - 30),
          normalizeHue(baseHue - 20),
          normalizeHue(baseHue - 10),
          normalizeHue(baseHue + 15),
          normalizeHue(baseHue + 30),
        ];
        break;
      case 'triangle':
        // Perceptual harmony - tighter spreads in problem areas
        if (baseHue >= 0 && baseHue < 30) {
          // Deep reds: avoid muddy browns
          analogousHues = [
            baseHue,
            normalizeHue(baseHue - 15),
            normalizeHue(baseHue - 8),
            normalizeHue(baseHue + 8),
            normalizeHue(baseHue + 20),
            normalizeHue(baseHue + 35),
          ];
        } else if (baseHue >= 30 && baseHue < 90) {
          // Orange-yellow: avoid muddy zones
          analogousHues = [
            baseHue,
            normalizeHue(baseHue - 25),
            normalizeHue(baseHue - 12),
            normalizeHue(baseHue + 10),
            normalizeHue(baseHue + 20),
            normalizeHue(baseHue + 30),
          ];
        } else {
          // Default spread
          analogousHues = [
            baseHue,
            normalizeHue(baseHue - 25),
            normalizeHue(baseHue - 12),
            normalizeHue(baseHue + 10),
            normalizeHue(baseHue + 20),
            normalizeHue(baseHue + 35),
          ];
        }
        break;
      case 'circle':
        // Emotional storytelling
        if (baseHue >= 345 || baseHue < 30) {
          // Passionate: ember to flame
          analogousHues = [
            baseHue,
            normalizeHue(baseHue - 20),
            normalizeHue(baseHue - 10),
            normalizeHue(baseHue + 8),
            normalizeHue(baseHue + 18),
            normalizeHue(baseHue + 30),
          ];
        } else if (baseHue >= 150 && baseHue < 210) {
          // Tranquil: water to sky
          analogousHues = [
            baseHue,
            normalizeHue(baseHue - 20),
            normalizeHue(baseHue - 10),
            normalizeHue(baseHue + 8),
            normalizeHue(baseHue + 18),
            normalizeHue(baseHue + 30),
          ];
        } else {
          // Default emotional spread
          analogousHues = [
            baseHue,
            normalizeHue(baseHue - 22),
            normalizeHue(baseHue - 10),
            normalizeHue(baseHue + 10),
            normalizeHue(baseHue + 20),
            normalizeHue(baseHue + 35),
          ];
        }
        break;
      case 'diamond':
        // Luminosity-based spreads
        if (baseLightness > 0.6 && baseHue >= 30 && baseHue < 90) {
          // Golden hour
          analogousHues = [
            baseHue,
            normalizeHue(baseHue - 20),
            normalizeHue(baseHue - 10),
            normalizeHue(baseHue + 8),
            normalizeHue(baseHue + 18),
            normalizeHue(baseHue + 30),
          ];
        } else {
          // Natural daylight
          analogousHues = [
            baseHue,
            normalizeHue(baseHue - 22),
            normalizeHue(baseHue - 10),
            normalizeHue(baseHue + 8),
            normalizeHue(baseHue + 18),
            normalizeHue(baseHue + 30),
          ];
        }
        break;
      default:
        analogousHues = [
          baseHue,
          normalizeHue(baseHue - 30),
          normalizeHue(baseHue - 20),
          normalizeHue(baseHue - 10),
          normalizeHue(baseHue + 15),
          normalizeHue(baseHue + 30),
        ];
    }

    // Create lightness and chroma variations
    const variations = [
      { l: 0, c: 1.0 },        // Base
      { l: -0.2, c: 0.8 },     // Darker, less saturated
      { l: -0.1, c: 0.9 },     // Slightly darker
      { l: 0.15, c: 0.85 },    // Lighter
      { l: 0.25, c: 0.7 },     // Much lighter, less saturated
      { l: 0.35, c: 0.6 },     // Very light, muted
    ];

    // Generate colors
    return analogousHues.map((hue, index) => {
      if (index === 0) {
        return { l: baseLightness, c: baseChroma, h: baseHue };
      }

      const variation = variations[index];
      let finalHue = hue;
      let finalLightness = baseLightness + variation.l;
      let finalChroma = baseChroma * variation.c * chromaAdjust;

      if (enhanced) {
        const cleaned = avoidMuddyZones(finalHue, finalLightness, finalChroma);
        finalHue = cleaned.h;
        finalLightness = cleaned.l;
        finalChroma = cleaned.c;
      }

      return { l: finalLightness, c: finalChroma, h: finalHue };
    });
  }
);

// ============= Triadic Generator =============

export const generateTriadic = createPaletteGenerator(
  'triadic',
  (base, options, enhanced) => {
    const { style } = options;
    const { l: baseLightness, c: baseChroma, h: baseHue } = base;

    // --- Hue selection per style (ported from OG) ---
    let triadicHues: number[];

    const getMathematicalTriadic = (hue: number): number[] => [
      hue,
      normalizeHue(hue + 120),
      normalizeHue(hue + 240),
    ];

    const getOpticalTriadic = (): number[] => {
      const hue = baseHue;
      if (hue >= 0 && hue < 60) {
        return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
      }
      if (hue >= 60 && hue < 120) {
        return [hue, normalizeHue(hue + 135), normalizeHue(hue + 225)];
      }
      if (hue >= 120 && hue < 180) {
        return [hue, normalizeHue(hue + 115), normalizeHue(hue + 245)];
      }
      if (hue >= 180 && hue < 240) {
        return [hue, normalizeHue(hue + 120), normalizeHue(hue + 240)];
      }
      if (hue >= 240 && hue < 300) {
        return [hue, normalizeHue(hue + 115), normalizeHue(hue + 245)];
      }
      return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
    };

    const getAdaptiveTriadic = (): number[] => {
      const hue = baseHue;
      const chroma = baseChroma;
      const lightness = baseLightness;
      if (hue >= 345 || hue < 30) {
        return [hue, normalizeHue(hue + 130), normalizeHue(hue + 230)];
      }
      if (hue >= 30 && hue < 90) {
        const intensity = chroma * lightness;
        return [
          hue,
          normalizeHue(hue + 120 + intensity * 15),
          normalizeHue(hue + 240 - intensity * 10),
        ];
      }
      if (hue >= 90 && hue < 150) {
        return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
      }
      if (hue >= 150 && hue < 210) {
        return [hue, normalizeHue(hue + 115), normalizeHue(hue + 245)];
      }
      if (hue >= 210 && hue < 270) {
        return [hue, normalizeHue(hue + 130), normalizeHue(hue + 230)];
      }
      return [hue, normalizeHue(hue + 120), normalizeHue(hue + 240)];
    };

    const getWarmCoolTriadic = (): number[] => {
      const hue = baseHue;
      const chroma = baseChroma;
      const lightness = baseLightness;

      if (lightness > 0.8 && chroma < 0.3) {
        return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
      }
      if (hue >= 30 && hue < 90 && lightness > 0.6) {
        return [hue, normalizeHue(hue + 110), normalizeHue(hue + 250)];
      }
      if (hue >= 180 && hue < 240 && lightness < 0.5) {
        return [hue, normalizeHue(hue + 130), normalizeHue(hue + 230)];
      }
      if (chroma > 0.8 && lightness < 0.4) {
        const isWarm = hue < 180;
        if (isWarm) {
          return [hue, normalizeHue(hue + 115), normalizeHue(hue + 245)];
        }
        return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
      }
      if (hue >= 270 && hue < 330) {
        return [hue, normalizeHue(hue + 135), normalizeHue(hue + 225)];
      }
      const lightInfluence = (lightness - 0.5) * 15;
      return [
        hue,
        normalizeHue(hue + 120 + lightInfluence),
        normalizeHue(hue + 240 - lightInfluence),
      ];
    };

    switch (style) {
      case 'square':
        triadicHues = getMathematicalTriadic(baseHue);
        break;
      case 'triangle':
        triadicHues = getOpticalTriadic();
        break;
      case 'circle':
        triadicHues = getAdaptiveTriadic();
        break;
      case 'diamond':
        triadicHues = getWarmCoolTriadic();
        break;
      default:
        triadicHues = getMathematicalTriadic(baseHue);
    }

    // --- Adaptive lightness/chroma adjustments (ported from OG) ---
    type Variation = { l: number; c: number };
    type TriadVariations = {
      first: { pure: Variation; muted: Variation };
      second: { pure: Variation; muted: Variation };
    };

    let baseVariations: { dark: Variation };
    let triadVariations: TriadVariations;

    const setupAdaptiveVariations = () => {
      const targetRange = { min: 0.15, max: 0.9 };
      if (baseLightness < 0.3) {
        baseVariations = {
          dark: { l: Math.max(-0.1, targetRange.min - baseLightness), c: 1.0 },
        };
        triadVariations = {
          first: { pure: { l: 0.2, c: 0.95 }, muted: { l: 0.35, c: 0.7 } },
          second: { pure: { l: 0.15, c: 0.95 }, muted: { l: 0.3, c: 0.7 } },
        };
      } else if (baseLightness > 0.7) {
        baseVariations = {
          dark: { l: Math.max(-0.4, targetRange.min - baseLightness), c: 1.1 },
        };
        triadVariations = {
          first: { pure: { l: -0.2, c: 0.95 }, muted: { l: -0.35, c: 0.7 } },
          second: { pure: { l: -0.25, c: 0.95 }, muted: { l: -0.15, c: 0.7 } },
        };
      } else {
        baseVariations = {
          dark: { l: -0.2, c: 1.1 },
        };
        triadVariations = {
          first: { pure: { l: 0.1, c: 0.95 }, muted: { l: 0.2, c: 0.7 } },
          second: { pure: { l: -0.1, c: 0.95 }, muted: { l: -0.2, c: 0.7 } },
        };
      }
    };

    setupAdaptiveVariations();

    if (style === 'triangle') {
      const lightnessModifier = baseLightness < 0.4 ? 0.1 : baseLightness > 0.6 ? -0.1 : 0;
      baseVariations = {
        dark: { l: Math.max(-0.18 + lightnessModifier, -0.3), c: 1.0 },
      };
      triadVariations = {
        first: {
          pure: { l: 0.05 - lightnessModifier, c: 0.9 },
          muted: { l: 0.12 - lightnessModifier, c: 0.65 },
        },
        second: {
          pure: { l: -0.02 - lightnessModifier, c: 0.92 },
          muted: { l: -0.08 - lightnessModifier, c: 0.68 },
        },
      };
    } else if (style === 'circle') {
      const hue = baseHue;
      const lightnessAdaptation = baseLightness < 0.4 ? 0.15 : baseLightness > 0.6 ? -0.15 : 0;
      if (hue >= 345 || hue < 30) {
        baseVariations = {
          dark: { l: Math.max(-0.25 + lightnessAdaptation, -0.35), c: 1.2 },
        };
        triadVariations = {
          first: {
            pure: { l: 0.08 - lightnessAdaptation, c: 0.85 },
            muted: { l: 0.15 - lightnessAdaptation, c: 0.6 },
          },
          second: {
            pure: { l: 0.05 - lightnessAdaptation, c: 0.9 },
            muted: { l: -0.05 - lightnessAdaptation, c: 0.65 },
          },
        };
      } else if (hue >= 150 && hue < 210) {
        baseVariations = {
          dark: { l: Math.max(-0.15 + lightnessAdaptation, -0.25), c: 0.9 },
        };
        triadVariations = {
          first: {
            pure: { l: 0.1 - lightnessAdaptation, c: 0.9 },
            muted: { l: 0.18 - lightnessAdaptation, c: 0.7 },
          },
          second: {
            pure: { l: 0.05 - lightnessAdaptation, c: 0.85 },
            muted: { l: -0.08 - lightnessAdaptation, c: 0.6 },
          },
        };
      }
    } else if (style === 'diamond') {
      const lightness = baseLightness;
      const chroma = baseChroma;
      if (lightness > 0.8 && chroma < 0.3) {
        baseVariations = {
          dark: { l: Math.max(-0.25, 0.15 - lightness), c: 1.0 },
        };
        triadVariations = {
          first: {
            pure: { l: -0.05, c: 0.85 },
            muted: { l: 0.1, c: 0.6 },
          },
          second: {
            pure: { l: -0.15, c: 0.8 },
            muted: { l: -0.25, c: 0.5 },
          },
        };
      } else if (chroma > 0.8 && lightness < 0.4) {
        baseVariations = {
          dark: { l: Math.max(-0.2, 0.15 - lightness), c: 1.3 },
        };
        triadVariations = {
          first: {
            pure: { l: 0.25, c: 1.0 },
            muted: { l: 0.15, c: 0.8 },
          },
          second: {
            pure: { l: 0.35, c: 1.1 },
            muted: { l: 0.1, c: 0.75 },
          },
        };
      }
    }

    // Create 6 colors from 3 hues
    const colors: OKLCH[] = [];

    triadicHues.forEach((hue, triadIndex) => {
      if (triadIndex === 0) {
        // Base color (preserved)
        colors.push({ l: baseLightness, c: baseChroma, h: baseHue });

        // Dark base variation
        const dark = baseVariations.dark;
        colors.push({
          l: baseLightness + dark.l,
          c: baseChroma * dark.c,
          h: hue,
        });
      } else {
        // Other triadic families: pure + muted
        const isFirstTriad = triadIndex === 1;
        const v = isFirstTriad ? triadVariations.first : triadVariations.second;

        let finalHue = hue;
        if (enhanced) {
          const cleaned = avoidMuddyZones(
            hue,
            baseLightness + v.pure.l,
            baseChroma * v.pure.c,
          );
          finalHue = cleaned.h;
        }

        colors.push({
          l: baseLightness + v.pure.l,
          c: baseChroma * v.pure.c,
          h: finalHue,
        });

        colors.push({
          l: baseLightness + v.muted.l,
          c: baseChroma * v.muted.c,
          h: finalHue,
        });
      }
    });

    return colors;
  }
);

// ============= Tetradic Generator =============

export const generateTetradic = createPaletteGenerator(
  'tetradic',
  (base, options, enhanced) => {
    const { style } = options;
    const { l: baseLightness, c: baseChroma, h: baseHue } = base;

    let tetradicHues: number[];

    switch (style) {
      case 'square':
        // Pure square - 90° intervals
        tetradicHues = [
          baseHue,
          normalizeHue(baseHue + 90),
          normalizeHue(baseHue + 180),
          normalizeHue(baseHue + 270),
        ];
        break;
      case 'triangle':
        // Rectangle - two complementary pairs
        tetradicHues = [
          baseHue,
          normalizeHue(baseHue + 60),
          normalizeHue(baseHue + 180),
          normalizeHue(baseHue + 240),
        ];
        break;
      case 'circle':
        // Adaptive based on base color
        if (baseHue >= 0 && baseHue < 90) {
          tetradicHues = [
            baseHue,
            normalizeHue(baseHue + 85),
            normalizeHue(baseHue + 180),
            normalizeHue(baseHue + 265),
          ];
        } else {
          tetradicHues = [
            baseHue,
            normalizeHue(baseHue + 95),
            normalizeHue(baseHue + 180),
            normalizeHue(baseHue + 275),
          ];
        }
        break;
      case 'diamond':
        // Double complementary
        const spread = 30;
        tetradicHues = [
          baseHue,
          normalizeHue(baseHue + spread),
          normalizeHue(baseHue + 180),
          normalizeHue(baseHue + 180 + spread),
        ];
        break;
      default:
        tetradicHues = [
          baseHue,
          normalizeHue(baseHue + 90),
          normalizeHue(baseHue + 180),
          normalizeHue(baseHue + 270),
        ];
    }

    // Generate 6 colors from 4 hues
    const colors: OKLCH[] = [];

    // Base color
    colors.push({ l: baseLightness, c: baseChroma, h: baseHue });
    
    // Create variations for other hues
    tetradicHues.slice(1, 3).forEach((hue, index) => {
      let finalHue = hue;
      if (enhanced) {
        const cleaned = avoidMuddyZones(hue, baseLightness, baseChroma);
        finalHue = cleaned.h;
      }

      // Vary lightness and chroma for each
      const variations = [
        { l: 0.1, c: 0.9 },   // Slightly lighter
        { l: -0.15, c: 0.85 }, // Darker
      ];
      
      const variation = variations[index];
      colors.push({
        l: baseLightness + variation.l,
        c: baseChroma * variation.c,
        h: finalHue
      });
    });

    // Add fourth tetradic color
    const fourthHue = tetradicHues[3];
    let finalFourthHue = fourthHue;
    if (enhanced) {
      const cleaned = avoidMuddyZones(fourthHue, baseLightness + 0.2, baseChroma * 0.7);
      finalFourthHue = cleaned.h;
    }
    colors.push({ l: baseLightness + 0.2, c: baseChroma * 0.7, h: finalFourthHue });

    // Add a darker base variation
    colors.push({ l: baseLightness - 0.25, c: baseChroma * 1.1, h: baseHue });
    
    // Add a lighter base variation
    colors.push({ l: baseLightness + 0.15, c: baseChroma * 0.8, h: baseHue });

    return colors;
  }
);

// ============= Split Complementary Generator =============

export const generateSplitComplementary = createPaletteGenerator(
  'split-complementary',
  (base, options, enhanced) => {
    const { style } = options;
    const { l: baseLightness, c: baseChroma, h: baseHue } = base;

    let splitHues: number[];

    switch (style) {
      case 'square':
        // Pure mathematical - complement ±30°
        const complement = normalizeHue(baseHue + 180);
        splitHues = [
          baseHue,
          normalizeHue(complement - 30),
          normalizeHue(complement + 30),
        ];
        break;
      case 'triangle':
        // Perceptual harmony
        if (baseHue >= 0 && baseHue < 45) {
          splitHues = [
            baseHue,
            normalizeHue(baseHue + 155),
            normalizeHue(baseHue + 185),
          ];
        } else if (baseHue >= 45 && baseHue < 90) {
          splitHues = [
            baseHue,
            normalizeHue(baseHue + 165),
            normalizeHue(baseHue + 205),
          ];
        } else {
          splitHues = [
            baseHue,
            normalizeHue(baseHue + 150),
            normalizeHue(baseHue + 210),
          ];
        }
        break;
      case 'circle':
        // Emotional resonance
        if (baseHue >= 345 || baseHue < 30) {
          splitHues = [
            baseHue,
            normalizeHue(baseHue + 165),
            normalizeHue(baseHue + 195),
          ];
        } else if (baseHue >= 30 && baseHue < 90) {
          const intensity = baseChroma * baseLightness;
          splitHues = [
            baseHue,
            normalizeHue(baseHue + 160 + intensity * 15),
            normalizeHue(baseHue + 200 + intensity * 10),
          ];
        } else {
          splitHues = [
            baseHue,
            normalizeHue(baseHue + 170),
            normalizeHue(baseHue + 210),
          ];
        }
        break;
      case 'diamond':
        // Luminosity-based splits
        const lightInfluence = baseLightness * 15 - 7.5;
        splitHues = [
          baseHue,
          normalizeHue(baseHue + 165 + lightInfluence),
          normalizeHue(baseHue + 195 - lightInfluence),
        ];
        break;
      default:
        const comp = normalizeHue(baseHue + 180);
        splitHues = [
          baseHue,
          normalizeHue(comp - 30),
          normalizeHue(comp + 30),
        ];
    }

    // Generate 6 colors
    const colors: OKLCH[] = [];

    // Base color
    colors.push({ l: baseLightness, c: baseChroma, h: baseHue });
    
    // Dark base variation
    colors.push({ l: baseLightness - 0.18, c: baseChroma * 1.05, h: baseHue });
    
    // Light base variation
    colors.push({ l: baseLightness + 0.15, c: baseChroma * 0.85, h: baseHue });
    
    // Split complement colors
    splitHues.slice(1).forEach((hue, index) => {
      let finalHue = hue;
      if (enhanced) {
        const cleaned = avoidMuddyZones(hue, baseLightness, baseChroma);
        finalHue = cleaned.h;
      }

      // Vary for each split
      const variations = [
        { l: 0.08, c: 0.9 },   // First split - lighter
        { l: -0.08, c: 0.75 }, // Second split - darker, less saturated
      ];
      
      const variation = variations[index];
      colors.push({
        l: baseLightness + variation.l,
        c: baseChroma * variation.c,
        h: finalHue
      });
    });

    // Add a muted variation of first split
    const mutedHue = enhanced ? 
      avoidMuddyZones(splitHues[1], baseLightness + 0.2, baseChroma * 0.6).h : 
      splitHues[1];
    colors.push({ l: baseLightness + 0.2, c: baseChroma * 0.6, h: mutedHue });

    return colors;
  }
);

// ============= Main Palette Generator =============

export class ColorPaletteGenerator {
  /**
   * Generate a color palette based on the specified type and options
   * Returns exactly 6 colors as designed by each palette type
   */
  static generate(
    baseColor: string,
    paletteType: PaletteType,
    options: GeneratorOptions
  ): PaletteColor[] {
    const baseOptions = { ...options };
    const modifiers = baseOptions.modifiers;

    let palette: PaletteColor[];

    switch (paletteType) {
      case 'analogous':
        palette = generateAnalogous(baseColor, baseOptions);
        break;
      case 'complementary':
        palette = generateComplementary(baseColor, baseOptions);
        break;
      case 'triadic':
        palette = generateTriadic(baseColor, baseOptions);
        break;
      case 'tetradic':
        palette = generateTetradic(baseColor, baseOptions);
        break;
      case 'split-complementary':
        palette = generateSplitComplementary(baseColor, baseOptions);
        break;
      default:
        throw new Error(`Unknown palette type: ${paletteType}`);
    }

    return applyModifiers(palette, modifiers);
  }

  /**
   * Generate all palette types for a given color
   */
  static generateAll(
    baseColor: string,
    options: GeneratorOptions
  ): Record<PaletteType, PaletteColor[]> {
    return {
      analogous: applyModifiers(generateAnalogous(baseColor, options), options.modifiers),
      complementary: applyModifiers(generateComplementary(baseColor, options), options.modifiers),
      triadic: applyModifiers(generateTriadic(baseColor, options), options.modifiers),
      tetradic: applyModifiers(generateTetradic(baseColor, options), options.modifiers),
      'split-complementary': applyModifiers(generateSplitComplementary(baseColor, options), options.modifiers),
    };
  }
}

// ============= Export convenience functions =============

// Export individual generators for direct use
export const generators = {
  analogous: generateAnalogous,
  complementary: generateComplementary,
  triadic: generateTriadic,
  tetradic: generateTetradic,
  splitComplementary: generateSplitComplementary,
};


