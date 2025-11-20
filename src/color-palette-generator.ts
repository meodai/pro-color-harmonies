/**
 * Color Palette Generator Library
 * Generates harmonious color palettes from a single input color
 * Based on the color theory and perceptual color science
 */

import type { Color as CuloriColor } from 'culori';
import {
  formatRgb,
  formatCss,
  oklch,
  oklab,
  rgb,
  parse,
} from 'culori';

// ============= Type Definitions =============

export interface OKLCH {
  l: number;
  c: number;
  h: number;
}

export type ColorSpace = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'oklab' | 'lch' | 'lab' | 'p3';
export type PaletteStyle = 'square' | 'triangle' | 'circle' | 'diamond';
export type PaletteType = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary';

export interface PaletteColor {
  code: string;
  isBase: boolean;
  color: CuloriColor;
}

export interface GeneratorOptions {
  style: PaletteStyle;
  colorSpace: {
    space: ColorSpace;
  };
  chromaAdjust?: number;
  count?: number; // Number of colors to generate (minimum 5, default 5)
  modifiers?: [number, number, number, number]; // Optional palette modulation knobs (0-1)
}

// ============= Utility Functions =============

const OKLCH_LIMITS = {
  l: { min: 0.01, max: 0.99 },
  c: { min: 0, max: 0.37 },
  h: { min: 0, max: 360 },
};

function clampOKLCH(l: number, c: number, h: number): OKLCH {
  return {
    l: Math.max(OKLCH_LIMITS.l.min, Math.min(OKLCH_LIMITS.l.max, l)),
    c: Math.max(OKLCH_LIMITS.c.min, Math.min(OKLCH_LIMITS.c.max, c)),
    h: ((h % 360) + 360) % 360,
  };
}

// Note: original implementation had a detectFormat helper which
// is currently unused; it has been removed to satisfy TypeScript.

// ============= Interpolation Functions =============

type FillFunction<T> = T extends number
  ? (amt: number, from: T, to: T) => T
  : (amt: number, from: T | null, to: T | null) => T;

/**
 * Linearly interpolates between two values.
 */
const lerp: FillFunction<number> = (amt, from, to) =>
  from + amt * (to - from);

/**
 * Interpolates between two Color objects
 */
const lerpColor = (amt: number, from: CuloriColor, to: CuloriColor): CuloriColor => {
  const f = oklab(from);
  const t = oklab(to);
  return {
    mode: 'oklab',
    l: lerp(amt, f.l, t.l),
    a: lerp(amt, f.a, t.a),
    b: lerp(amt, f.b, t.b),
  } as CuloriColor;
};

/**
 * Scales and spreads an array to the target size using interpolation
 */
const scaleSpreadArray = <T>(
  valuesToFill: T[],
  targetSize: number,
  padding = 0,
  fillFunction: FillFunction<T> = lerp as unknown as FillFunction<T>
): T[] => {
  // Validation checks
  if (!valuesToFill || valuesToFill.length < 2) {
    throw new Error("valuesToFill array must have at least two values.");
  }
  if (targetSize < 1 && padding > 0) {
    throw new Error("Target size must be at least 1");
  }
  if (targetSize < valuesToFill.length && padding === 0) {
    throw new Error(
      "Target size must be greater than or equal to the valuesToFill array length."
    );
  }

  // For case without padding, use the original algorithm
  if (padding <= 0) {
    // Create a copy of the valuesToFill array and add null values to it if necessary
    const valuesToAdd = targetSize - valuesToFill.length;
    const chunkArray: T[][] = valuesToFill.map((value): T[] => [value]);

    for (let i = 0; i < valuesToAdd; i++) {
      const idx = i % (valuesToFill.length - 1);
      if (idx >= 0 && idx < chunkArray.length) {
        const chunk = chunkArray[idx];
        if (chunk) {
          chunk.push(null as unknown as T);
        }
      }
    }

    // Fill each chunk with interpolated values using the specified interpolation function
    for (let i = 0; i < chunkArray.length - 1; i++) {
      const currentChunk = chunkArray[i];
      const nextChunk = chunkArray[i + 1];

      if (!currentChunk || !nextChunk) {
        continue;
      }

      const currentValue = currentChunk[0];
      const nextValue = nextChunk[0];

      if (currentValue === undefined || nextValue === undefined) {
        continue;
      }

      for (let j = 1; j < currentChunk.length; j++) {
        const percent = j / currentChunk.length;
        currentChunk[j] = fillFunction(percent, currentValue, nextValue);
      }
    }

    return chunkArray.flat() as T[];
  }

  // Implement chroma.js style padding
  const result: T[] = [];

  // The padding essentially shifts the start and end of the normalized range
  const domainStart = padding;
  const domainEnd = 1 - padding;

  // Generate evenly spaced positions in the target array
  for (let i = 0; i < targetSize; i++) {
    // Generate normalized position (0-1)
    const t = targetSize === 1 ? 0.5 : i / (targetSize - 1);

    // Apply padding by adjusting t
    const adjustedT = domainStart + t * (domainEnd - domainStart);

    // Find the right segment for this position
    let segmentIndex = 0;
    const normalizedPositions: number[] = valuesToFill.map(
      (_, i) => i / (valuesToFill.length - 1)
    );

    for (let j = 1; j < normalizedPositions.length; j++) {
      const position = normalizedPositions[j];
      if (position !== undefined && adjustedT <= position) {
        segmentIndex = j - 1;
        break;
      }
      if (j === normalizedPositions.length - 1) {
        segmentIndex = j - 1;
      }
    }

    // Ensure segment index is valid
    segmentIndex = Math.min(Math.max(0, segmentIndex), valuesToFill.length - 2);

    // Get the segment boundaries in normalized space
    const segmentStart = normalizedPositions[segmentIndex] || 0;
    const segmentEnd = normalizedPositions[segmentIndex + 1] || 1;

    // Calculate relative position within segment (0-1)
    let segmentT = 0;
    if (segmentEnd > segmentStart) {
      segmentT = (adjustedT - segmentStart) / (segmentEnd - segmentStart);
    }

    // Get the values from the segments, with null checks
    const fromValue = valuesToFill[segmentIndex];
    const toValue = valuesToFill[segmentIndex + 1];

    if (fromValue === undefined || toValue === undefined) {
      throw new Error(`Invalid segment values at index ${segmentIndex}`);
    }

    // Get the interpolated value from the correct segment
    const value = fillFunction(segmentT, fromValue, toValue);

    result.push(value);
  }

  return result;
};

/**
 * Extends a palette to the desired count using interpolation
 */
function extendPalette(
  basePalette: PaletteColor[],
  targetCount: number,
  paletteType: string
): PaletteColor[] {
  if (targetCount <= basePalette.length) {
    // If target count is less than or equal to base palette, just return the base
    return basePalette.slice(0, targetCount);
  }

  // Use interpolation to extend the palette
  const extendedColors = scaleSpreadArray<CuloriColor>(
    basePalette.map(p => p.color as CuloriColor),
    targetCount,
    0,
    lerpColor as unknown as FillFunction<CuloriColor>
  );

  return extendedColors.map((color, index) => ({
    code: `${paletteType}-${index + 1}`,
    isBase: index === 0,
    color,
  }));
}

// ============= Generator Helpers =============

function createOklch(l: number, c: number, h: number): CuloriColor {
  return { mode: 'oklch', ...clampOKLCH(l, c, h) } as CuloriColor;
}

function createPaletteGenerator(
  paletteType: PaletteType,
  generatorFn: (
    base: { l: number; c: number; h: number; color: CuloriColor },
    options: GeneratorOptions,
    enhanced: boolean
  ) => CuloriColor[]
) {
  return (baseColor: string, options: GeneratorOptions): PaletteColor[] => {
    const { style, count = 5 } = options;
    const enhanced = style !== 'square';
    const targetCount = Math.max(1, count);

    try {
      const parsed = parse(baseColor);
      if (!parsed) throw new Error('Invalid base color');
      
      const baseColorObj = oklch(parsed);
      const base = {
        l: baseColorObj.l,
        c: baseColorObj.c,
        h: baseColorObj.h || 0,
        color: baseColorObj as CuloriColor
      };

      const colors = generatorFn(base, options, enhanced);

      const basePalette = colors.map((color, index) =>
        colorFactory(color, paletteType, index, index === 0)
      );

      return extendPalette(basePalette, targetCount, paletteType);
    } catch (error) {
      throw new Error(`Failed to generate ${paletteType} colors: ${error}`);
    }
  };
}

// ============= Color Factory =============

function colorFactory(
  base: string | CuloriColor,
  paletteType: string,
  idx: number = 0,
  isBase: boolean = false
): PaletteColor {
  const color: CuloriColor = typeof base === 'string' ? (parse(base) as CuloriColor) : base;

  return {
    code: `${paletteType}-${idx + 1}`,
    isBase,
    color,
  };
}

// ============= Palette Modifiers (Knobs) =============

function sineModifier(palette: PaletteColor[], modifier: number): PaletteColor[] {
  const hueIntensity = modifier * 45;
  const lightnessIntensity = modifier * 0.15;

  return palette.map((entry, idx) => {
    const wavePosition = (idx / Math.max(1, palette.length - 1)) * Math.PI * 2;
    const fundamental = Math.sin(wavePosition + modifier * 1);
    const harmonic = Math.sin(wavePosition * 2 + modifier * 0.5) * 0.3;
    const sineValue = fundamental + harmonic;

    const hueShift = sineValue * hueIntensity;
    const lightnessShift = Math.sin(wavePosition * 1.5 + modifier * 0.8) * lightnessIntensity;

    const base = oklch(entry.color as CuloriColor);
    const currentHue = base.h || 0;
    const currentLightness = base.l || 0.5;

    return {
      ...entry,
      color: createOklch(
        currentLightness + lightnessShift,
        base.c,
        currentHue + hueShift,
      ),
    };
  });
}

function waveModifier(palette: PaletteColor[], modifier: number): PaletteColor[] {
  const chaosLevel = 2.0 + modifier * 1.2;
  const hueRange = modifier * 120;
  const lightnessRange = modifier * 0.35;

  return palette.map((entry, idx) => {
    let x = 0.2 + (idx / Math.max(1, palette.length)) * 0.6 + Math.sin(idx * 0.7) * 0.15;

    for (let i = 0; i < 8; i++) {
      x = chaosLevel * x * (1 - x);
    }

    const smoothedX = x * 0.85 + 0.5 * 0.15;

    const hueShift = (smoothedX - 0.5) * hueRange;
    const lightnessShift = (smoothedX - 0.5) * lightnessRange;
    const chromaMultiplier = 0.4 + smoothedX * 1.2;

    const base = oklch(entry.color as CuloriColor);
    const currentHue = base.h || 0;
    const currentLightness = base.l || 0.5;
    const currentChroma = base.c || 0;

    return {
      ...entry,
      color: createOklch(
        currentLightness + lightnessShift,
        currentChroma * chromaMultiplier,
        currentHue + hueShift,
      ),
    };
  });
}

function zapModifier(palette: PaletteColor[], modifier: number): PaletteColor[] {
  const spiralTightness = 0.2 + modifier * 1.0;
  const maxHueShift = modifier * 90;

  return palette.map((entry, idx) => {
    const normalizedPos = idx / Math.max(1, palette.length - 1);
    const angle = normalizedPos * spiralTightness * Math.PI * 2;
    const radius = Math.sqrt(normalizedPos) * 2;

    const spiralX = Math.cos(angle) * radius;
    const spiralY = Math.sin(angle) * radius;

    const hueShift = spiralX * maxHueShift;
    const lightnessShift = spiralY * 0.12;
    const chromaShift = Math.sin(angle * 1.5) * 0.08;

    const base = oklch(entry.color as CuloriColor);
    const currentHue = base.h || 0;
    const currentLightness = base.l || 0.5;
    const currentChroma = base.c || 0;

    return {
      ...entry,
      color: createOklch(
        currentLightness + lightnessShift,
        currentChroma + chromaShift,
        currentHue + hueShift,
      ),
    };
  });
}

function blockModifier(palette: PaletteColor[], modifier: number): PaletteColor[] {
  const lightnessAmplitude = modifier * 0.25;
  const hueAmplitude = modifier * 30;
  const chromaAmplitude = modifier * 0.1;

  return palette.map((entry, idx) => {
    const frequency = Math.max(1, Math.floor(palette.length / 8));
    const wavePosition = (idx / Math.max(1, palette.length - 1)) * Math.PI * frequency;

    const rawTriangle = (2 / Math.PI) * Math.asin(Math.sin(wavePosition));
    const softTriangle = rawTriangle * (1 - Math.abs(rawTriangle) * 0.3);

    const lightnessShift = softTriangle * lightnessAmplitude;
    const hueShift = Math.sin(wavePosition + Math.PI * 0.25) * rawTriangle * hueAmplitude;
    const chromaShift = Math.cos(wavePosition + Math.PI * 0.5) * rawTriangle * chromaAmplitude;

    const base = oklch(entry.color as CuloriColor);
    const currentHue = base.h || 0;
    const currentLightness = base.l || 0.5;
    const currentChroma = base.c || 0;

    return {
      ...entry,
      color: createOklch(
        currentLightness + lightnessShift,
        currentChroma + chromaShift,
        currentHue + hueShift,
      ),
    };
  });
}

export function applyModifiers(
  palette: PaletteColor[],
  modifiers: [number, number, number, number] | undefined,
): PaletteColor[] {
  if (!modifiers) return palette;

  const [m1, m2, m3, m4] = modifiers;
  let result = [...palette];

  if (m1) result = sineModifier(result, m1);
  if (m2) result = waveModifier(result, m2);
  if (m3) result = zapModifier(result, m3);
  if (m4) result = blockModifier(result, m4);

  return result;
}

// ============= Enhancement Functions =============

function avoidMuddyZones(hue: number, lightness: number, chroma: number): OKLCH {
  // Avoid muddy zones in the color space
  const muddyZones = [
    { start: 60, end: 90, shift: -10 },   // Yellow-green (tends toward brown)
    { start: 30, end: 50, shift: 15 },    // Orange (can become muddy)
  ];

  let adjustedHue = hue;
  for (const zone of muddyZones) {
    if (hue >= zone.start && hue <= zone.end && chroma < 0.15) {
      adjustedHue = (hue + zone.shift + 360) % 360;
      break;
    }
  }

  return clampOKLCH(lightness, chroma, adjustedHue);
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
        complementHue = (baseHue + 180) % 360;
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
          complementHue = (baseHue + 200) % 360;
        } else if (baseHue >= 30 && baseHue < 90 && baseLightness > 0.6) {
          complementHue = 240 + (baseHue - 30) * 0.3;
        } else {
          const lightInfluence = baseLightness * 20 - 10;
          complementHue = (baseHue + 180 + lightInfluence) % 360;
        }
        break;
      default:
        complementHue = (baseHue + 180) % 360;
    }

    // Apply muddy zone avoidance if enhanced
    if (enhanced) {
      const cleaned = avoidMuddyZones(complementHue, baseLightness, baseChroma * chromaAdjust);
      complementHue = cleaned.h;
    }

    // Generate 5 colors total
    return [
      // 1. Base color (preserved)
      base.color,
      
      // 2. Main complement
      createOklch(baseLightness + 0.05, baseChroma * chromaAdjust, complementHue),
      
      // 3. Dark base
      createOklch(baseLightness - 0.2, baseChroma * 1.1, baseHue),
      
      // 4. Light complement
      createOklch(baseLightness + 0.25, baseChroma * 0.7, complementHue),
      
      // 5. Muted complement
      createOklch(baseLightness - 0.15, baseChroma * 0.5, complementHue),
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
          (baseHue - 30 + 360) % 360,
          (baseHue - 15 + 360) % 360,
          (baseHue + 15) % 360,
          (baseHue + 30) % 360,
        ];
        break;
      case 'triangle':
        // Perceptual harmony - tighter spreads in problem areas
        if (baseHue >= 0 && baseHue < 30) {
          // Deep reds: avoid muddy browns
          analogousHues = [
            baseHue,
            (baseHue - 15 + 360) % 360,
            (baseHue - 8 + 360) % 360,
            (baseHue + 8) % 360,
            (baseHue + 20) % 360,
          ];
        } else if (baseHue >= 30 && baseHue < 90) {
          // Orange-yellow: avoid muddy zones
          analogousHues = [
            baseHue,
            (baseHue - 20 + 360) % 360,
            (baseHue - 10 + 360) % 360,
            (baseHue + 10) % 360,
            (baseHue + 20) % 360,
          ];
        } else {
          // Default spread
          analogousHues = [
            baseHue,
            (baseHue - 25 + 360) % 360,
            (baseHue - 12 + 360) % 360,
            (baseHue + 12) % 360,
            (baseHue + 25) % 360,
          ];
        }
        break;
      case 'circle':
        // Emotional storytelling
        if (baseHue >= 345 || baseHue < 30) {
          // Passionate: ember to flame
          analogousHues = [
            baseHue,
            (baseHue - 20 + 360) % 360,
            (baseHue - 10 + 360) % 360,
            (baseHue + 10) % 360,
            (baseHue + 20) % 360,
          ];
        } else if (baseHue >= 150 && baseHue < 210) {
          // Tranquil: water to sky
          analogousHues = [
            baseHue,
            (baseHue - 18 + 360) % 360,
            (baseHue - 8 + 360) % 360,
            (baseHue + 8) % 360,
            (baseHue + 18) % 360,
          ];
        } else {
          // Default emotional spread
          analogousHues = [
            baseHue,
            (baseHue - 22 + 360) % 360,
            (baseHue - 10 + 360) % 360,
            (baseHue + 10) % 360,
            (baseHue + 22) % 360,
          ];
        }
        break;
      case 'diamond':
        // Luminosity-based spreads
        if (baseLightness > 0.6 && baseHue >= 30 && baseHue < 90) {
          // Golden hour
          analogousHues = [
            baseHue,
            (baseHue - 18 + 360) % 360,
            (baseHue - 8 + 360) % 360,
            (baseHue + 8) % 360,
            (baseHue + 18) % 360,
          ];
        } else {
          // Natural daylight
          analogousHues = [
            baseHue,
            (baseHue - 20 + 360) % 360,
            (baseHue - 10 + 360) % 360,
            (baseHue + 10) % 360,
            (baseHue + 20) % 360,
          ];
        }
        break;
      default:
        analogousHues = [
          baseHue,
          (baseHue - 30 + 360) % 360,
          (baseHue - 15 + 360) % 360,
          (baseHue + 15) % 360,
          (baseHue + 30) % 360,
        ];
    }

    // Create lightness and chroma variations
    const variations = [
      { l: 0, c: 1.0 },        // Base
      { l: -0.15, c: 0.85 },   // Darker, less saturated
      { l: -0.08, c: 0.95 },   // Slightly darker
      { l: 0.12, c: 0.9 },     // Lighter
      { l: 0.25, c: 0.75 },    // Much lighter, less saturated
    ];

    // Generate colors
    return analogousHues.map((hue, index) => {
      if (index === 0) {
        return base.color;
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

      return createOklch(finalLightness, finalChroma, finalHue);
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
      (hue + 120) % 360,
      (hue + 240) % 360,
    ];

    const getOpticalTriadic = (): number[] => {
      const hue = baseHue;
      if (hue >= 0 && hue < 60) {
        return [hue, (hue + 125) % 360, (hue + 235) % 360];
      }
      if (hue >= 60 && hue < 120) {
        return [hue, (hue + 135) % 360, (hue + 225) % 360];
      }
      if (hue >= 120 && hue < 180) {
        return [hue, (hue + 115) % 360, (hue + 245) % 360];
      }
      if (hue >= 180 && hue < 240) {
        return [hue, (hue + 120) % 360, (hue + 240) % 360];
      }
      if (hue >= 240 && hue < 300) {
        return [hue, (hue + 115) % 360, (hue + 245) % 360];
      }
      return [hue, (hue + 125) % 360, (hue + 235) % 360];
    };

    const getAdaptiveTriadic = (): number[] => {
      const hue = baseHue;
      const chroma = baseChroma;
      const lightness = baseLightness;
      if (hue >= 345 || hue < 30) {
        return [hue, (hue + 130) % 360, (hue + 230) % 360];
      }
      if (hue >= 30 && hue < 90) {
        const intensity = chroma * lightness;
        return [
          hue,
          (hue + 120 + intensity * 15) % 360,
          (hue + 240 - intensity * 10) % 360,
        ];
      }
      if (hue >= 90 && hue < 150) {
        return [hue, (hue + 125) % 360, (hue + 235) % 360];
      }
      if (hue >= 150 && hue < 210) {
        return [hue, (hue + 115) % 360, (hue + 245) % 360];
      }
      if (hue >= 210 && hue < 270) {
        return [hue, (hue + 130) % 360, (hue + 230) % 360];
      }
      return [hue, (hue + 120) % 360, (hue + 240) % 360];
    };

    const getWarmCoolTriadic = (): number[] => {
      const hue = baseHue;
      const chroma = baseChroma;
      const lightness = baseLightness;

      if (lightness > 0.8 && chroma < 0.3) {
        return [hue, (hue + 125) % 360, (hue + 235) % 360];
      }
      if (hue >= 30 && hue < 90 && lightness > 0.6) {
        return [hue, (hue + 110) % 360, (hue + 250) % 360];
      }
      if (hue >= 180 && hue < 240 && lightness < 0.5) {
        return [hue, (hue + 130) % 360, (hue + 230) % 360];
      }
      if (chroma > 0.8 && lightness < 0.4) {
        const isWarm = hue < 180;
        if (isWarm) {
          return [hue, (hue + 115) % 360, (hue + 245) % 360];
        }
        return [hue, (hue + 125) % 360, (hue + 235) % 360];
      }
      if (hue >= 270 && hue < 330) {
        return [hue, (hue + 135) % 360, (hue + 225) % 360];
      }
      const lightInfluence = (lightness - 0.5) * 15;
      return [
        hue,
        (hue + 120 + lightInfluence) % 360,
        (hue + 240 - lightInfluence) % 360,
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

    // Create 5 colors from 3 hues
    const colors: CuloriColor[] = [];

    triadicHues.forEach((hue, triadIndex) => {
      if (triadIndex === 0) {
        // Base color (preserved)
        colors.push(base.color);

        // Dark base variation
        const dark = baseVariations.dark;
        colors.push(createOklch(
          baseLightness + dark.l,
          baseChroma * dark.c,
          hue,
        ));
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

        colors.push(createOklch(
          baseLightness + v.pure.l,
          baseChroma * v.pure.c,
          finalHue,
        ));

        colors.push(createOklch(
          baseLightness + v.muted.l,
          baseChroma * v.muted.c,
          finalHue,
        ));
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
          (baseHue + 90) % 360,
          (baseHue + 180) % 360,
          (baseHue + 270) % 360,
        ];
        break;
      case 'triangle':
        // Rectangle - two complementary pairs
        tetradicHues = [
          baseHue,
          (baseHue + 60) % 360,
          (baseHue + 180) % 360,
          (baseHue + 240) % 360,
        ];
        break;
      case 'circle':
        // Adaptive based on base color
        if (baseHue >= 0 && baseHue < 90) {
          tetradicHues = [
            baseHue,
            (baseHue + 85) % 360,
            (baseHue + 180) % 360,
            (baseHue + 265) % 360,
          ];
        } else {
          tetradicHues = [
            baseHue,
            (baseHue + 95) % 360,
            (baseHue + 180) % 360,
            (baseHue + 275) % 360,
          ];
        }
        break;
      case 'diamond':
        // Double complementary
        const spread = 30;
        tetradicHues = [
          baseHue,
          (baseHue + spread) % 360,
          (baseHue + 180) % 360,
          (baseHue + 180 + spread) % 360,
        ];
        break;
      default:
        tetradicHues = [
          baseHue,
          (baseHue + 90) % 360,
          (baseHue + 180) % 360,
          (baseHue + 270) % 360,
        ];
    }

    // Generate 5 colors from 4 hues
    const colors: CuloriColor[] = [];

    // Base color
    colors.push(base.color);
    
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
      colors.push(createOklch(
        baseLightness + variation.l,
        baseChroma * variation.c,
        finalHue
      ));
    });

    // Add fourth tetradic color
    const fourthHue = tetradicHues[3];
    let finalFourthHue = fourthHue;
    if (enhanced) {
      const cleaned = avoidMuddyZones(fourthHue, baseLightness + 0.2, baseChroma * 0.7);
      finalFourthHue = cleaned.h;
    }
    colors.push(createOklch(baseLightness + 0.2, baseChroma * 0.7, finalFourthHue));

    // Add a darker base variation
    colors.push(createOklch(baseLightness - 0.25, baseChroma * 1.1, baseHue));

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
        const complement = (baseHue + 180) % 360;
        splitHues = [
          baseHue,
          (complement - 30 + 360) % 360,
          (complement + 30) % 360,
        ];
        break;
      case 'triangle':
        // Perceptual harmony
        if (baseHue >= 0 && baseHue < 45) {
          splitHues = [
            baseHue,
            (baseHue + 155) % 360,
            (baseHue + 185) % 360,
          ];
        } else if (baseHue >= 45 && baseHue < 90) {
          splitHues = [
            baseHue,
            (baseHue + 165) % 360,
            (baseHue + 205) % 360,
          ];
        } else {
          splitHues = [
            baseHue,
            (baseHue + 150) % 360,
            (baseHue + 210) % 360,
          ];
        }
        break;
      case 'circle':
        // Emotional resonance
        if (baseHue >= 345 || baseHue < 30) {
          splitHues = [
            baseHue,
            (baseHue + 165) % 360,
            (baseHue + 195) % 360,
          ];
        } else if (baseHue >= 30 && baseHue < 90) {
          const intensity = baseChroma * baseLightness;
          splitHues = [
            baseHue,
            (baseHue + 160 + intensity * 15) % 360,
            (baseHue + 200 + intensity * 10) % 360,
          ];
        } else {
          splitHues = [
            baseHue,
            (baseHue + 170) % 360,
            (baseHue + 210) % 360,
          ];
        }
        break;
      case 'diamond':
        // Luminosity-based splits
        const lightInfluence = baseLightness * 15 - 7.5;
        splitHues = [
          baseHue,
          (baseHue + 165 + lightInfluence) % 360,
          (baseHue + 195 - lightInfluence) % 360,
        ];
        break;
      default:
        const comp = (baseHue + 180) % 360;
        splitHues = [
          baseHue,
          (comp - 30 + 360) % 360,
          (comp + 30) % 360,
        ];
    }

    // Generate 5 colors
    const colors: CuloriColor[] = [];

    // Base color
    colors.push(base.color);
    
    // Dark base variation
    colors.push(createOklch(baseLightness - 0.18, baseChroma * 1.05, baseHue));
    
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
      colors.push(createOklch(
        baseLightness + variation.l,
        baseChroma * variation.c,
        finalHue
      ));
    });

    // Add a muted variation of first split
    const mutedHue = enhanced ? 
      avoidMuddyZones(splitHues[1], baseLightness + 0.2, baseChroma * 0.6).h : 
      splitHues[1];
    colors.push(createOklch(baseLightness + 0.2, baseChroma * 0.6, mutedHue));

    return colors;
  }
);

// ============= Main Palette Generator =============

export class ColorPaletteGenerator {
  /**
   * Generate a color palette based on the specified type and options
   * Returns exactly 5 colors for each palette type
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

  /**
   * Convert a palette to CSS custom properties
   */
  static toCSS(palette: PaletteColor[], prefix: string = 'color'): string {
    return palette
      .map((color, index) => {
        const varName = `--${prefix}-${index + 1}`;
        const contrastVar = `--${prefix}-${index + 1}-contrast`;
        const cssValue = formatCss(oklch(color.color));
        return `${varName}: ${cssValue};\n${contrastVar}: #000;`;
      })
      .join('\n');
  }

  /**
   * Get palette as an array of hex values
   */
  static toHexArray(palette: PaletteColor[]): string[] {
    return palette.map(color => formatRgb(rgb(color.color)));
  }

  /**
   * Get palette info including color values and metadata
   */
  static getPaletteInfo(palette: PaletteColor[]): {
    colors: string[];
    format: string;
    baseIndex: number;
    contrastColors: string[];
  } {
    return {
      colors: palette.map(c => formatCss(oklch(c.color))),
      format: 'oklch',
      baseIndex: palette.findIndex(c => c.isBase),
      contrastColors: palette.map(() => '#000'),
    };
  }
}

// ============= Export convenience functions =============

export default ColorPaletteGenerator;

// Export individual generators for direct use
export const generators = {
  analogous: generateAnalogous,
  complementary: generateComplementary,
  triadic: generateTriadic,
  tetradic: generateTetradic,
  splitComplementary: generateSplitComplementary,
};

// Export utility for validating colors
export function isValidColor(color: string): boolean {
  try {
    return !!parse(color);
  } catch {
    return false;
  }
}
