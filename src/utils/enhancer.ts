import type { OKLCH, PaletteType, PaletteStyle } from '../index';
import { clampOKLCH } from './color';

/**
 * Defines the narrative structure for chroma distribution across the palette.
 * This helps create a sense of progression or rhythm in the color saturation.
 */
interface ChromaNarrative {
  /** Array of chroma multipliers (0-5) to shape the saturation curve */
  pattern: number[];
  /** Human-readable intent for this narrative */
  description: string;
  /** If true, applies alternating lightness shifts for better contrast/separation */
  breathingRoom: boolean;
}

/**
 * Defines the role of a color within the palette hierarchy.
 * This assigns semantic meaning and visual weight to each color position.
 */
interface ColorRole {
  /** The semantic role of the color */
  name: 'protagonist' | 'deuteragonist' | 'supporting' | 'accent' | 'background' | 'neutral';
  /** Multiplier applied to the base chroma */
  chromaMultiplier: number;
  /** Absolute shift applied to the lightness */
  lightnessShift: number;
  /** Approximate visual weight or intended usage frequency (0-1) */
  presence: number;
}

/**
 * Determines the narrative structure for chroma distribution across the palette.
 * 
 * @param paletteType - The type of harmony being generated
 * @param style - The style variant
 * @param _baseChroma - The chroma of the base color (currently unused but reserved for adaptive narratives)
 * @returns {ChromaNarrative}
 * - pattern: Array of chroma multipliers (0-5) to shape the saturation curve
 * - description: Human-readable intent for this narrative
 * - breathingRoom: If true, applies alternating lightness shifts for better contrast/separation
 */
function getChromaNarrative(
  paletteType: PaletteType,
  style: PaletteStyle,
  _baseChroma: number
): ChromaNarrative {
  if (paletteType === 'analogous') {
    switch (style) {
      case 'square':
        return {
          pattern: [0.8, 0.9, 1.0, 1.0, 0.9, 0.8],
          description: 'Mathematical harmony',
          breathingRoom: true,
        };
      case 'triangle':
        return {
          pattern: [0.7, 1.0, 0.85, 1.0, 0.75, 0.6],
          description: 'Natural visual rhythm',
          breathingRoom: true,
        };
      case 'circle':
        return {
          pattern: [0.6, 0.9, 1.0, 1.0, 1.1, 0.8],
          description: 'Emotional journey',
          breathingRoom: false,
        };
      case 'diamond':
        return {
          pattern: [0.8, 0.7, 1.0, 0.9, 1.1, 0.6],
          description: 'Luminosity dance',
          breathingRoom: true,
        };
    }
  }

  if (paletteType === 'complementary') {
    switch (style) {
      case 'square':
        return {
          pattern: [1.0, 0.9, 0.7, 0.6, 0.8, 0.5],
          description: 'Clear hierarchy',
          breathingRoom: true,
        };
      case 'triangle':
        return {
          pattern: [1.0, 0.85, 0.6, 0.5, 0.75, 0.4],
          description: 'Visual weight distribution',
          breathingRoom: true,
        };
      case 'circle':
        return {
          pattern: [1.0, 1.1, 0.8, 0.6, 0.9, 0.5],
          description: 'Emotional contrast',
          breathingRoom: false,
        };
      case 'diamond':
        return {
          pattern: [1.0, 0.9, 0.7, 0.5, 0.8, 0.4],
          description: 'Light temperature narrative',
          breathingRoom: true,
        };
    }
  }

  if (paletteType === 'splitComplementary') {
    switch (style) {
      case 'square':
        return {
          pattern: [1.0, 0.8, 0.9, 0.7, 0.85, 0.6],
          description: 'Balanced triad',
          breathingRoom: true,
        };
      case 'triangle':
        return {
          pattern: [1.0, 0.7, 0.95, 0.6, 0.8, 0.5],
          description: 'Perceptual triangle',
          breathingRoom: true,
        };
      case 'circle':
        return {
          pattern: [1.0, 0.9, 1.1, 0.8, 0.9, 0.7],
          description: 'Three-part emotional narrative',
          breathingRoom: false,
        };
      case 'diamond':
        return {
          pattern: [1.0, 0.8, 0.9, 0.7, 0.85, 0.65],
          description: 'Three-point lighting',
          breathingRoom: true,
        };
    }
  }

  if (paletteType === 'triadic') {
    switch (style) {
      case 'square':
        return {
          pattern: [1.0, 0.8, 0.9, 0.85, 0.9, 0.7],
          description: 'Triangular harmony',
          breathingRoom: true,
        };
      case 'triangle':
        return {
          pattern: [1.0, 0.75, 0.95, 0.7, 0.85, 0.6],
          description: 'Perceptual triangle',
          breathingRoom: true,
        };
      case 'circle':
        return {
          pattern: [1.0, 0.9, 1.1, 0.8, 0.95, 0.75],
          description: 'Three-part emotional story',
          breathingRoom: false,
        };
      case 'diamond':
        return {
          pattern: [1.0, 0.8, 0.9, 0.7, 0.85, 0.65],
          description: 'Three-source illumination',
          breathingRoom: true,
        };
    }
  }

  if (paletteType === 'tetradic') {
    switch (style) {
      case 'square':
        return {
          pattern: [1.0, 0.8, 0.7, 0.9, 0.75, 0.6],
          description: 'Quadratic harmony',
          breathingRoom: true,
        };
      case 'triangle':
        return {
          pattern: [1.0, 0.7, 0.6, 0.85, 0.65, 0.5],
          description: 'Perceptual quadrangle',
          breathingRoom: true,
        };
      case 'circle':
        return {
          pattern: [1.0, 0.9, 0.8, 1.0, 0.85, 0.7],
          description: 'Four-part epic',
          breathingRoom: false,
        };
      case 'diamond':
        return {
          pattern: [1.0, 0.8, 0.6, 0.9, 0.7, 0.5],
          description: 'Four-point lighting',
          breathingRoom: true,
        };
    }
  }

  // Default fallback
  return {
    pattern: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
    description: 'Standard decay',
    breathingRoom: true,
  };
}

/**
 * Determines the color hierarchy and role assignments for a given palette type.
 * 
 * @param paletteType - The type of harmony being generated
 * @param _style - The style variant (currently unused but reserved for future style-specific hierarchies)
 * @returns Array of ColorRole objects defining the characteristics of each position
 */
function getColorHierarchy(
  paletteType: PaletteType,
  _style: PaletteStyle
): ColorRole[] {
  if (paletteType === 'analogous') {
    return [
      { name: 'supporting', chromaMultiplier: 0.8, lightnessShift: -0.05, presence: 0.15 },
      { name: 'accent', chromaMultiplier: 1.0, lightnessShift: 0.02, presence: 0.1 },
      { name: 'protagonist', chromaMultiplier: 1.0, lightnessShift: 0, presence: 0.4 },
      { name: 'protagonist', chromaMultiplier: 0.95, lightnessShift: 0, presence: 0.4 },
      { name: 'deuteragonist', chromaMultiplier: 0.9, lightnessShift: 0.03, presence: 0.2 },
      { name: 'background', chromaMultiplier: 0.6, lightnessShift: 0.08, presence: 0.25 },
    ];
  }

  if (paletteType === 'complementary') {
    return [
      { name: 'protagonist', chromaMultiplier: 1.0, lightnessShift: 0, presence: 0.6 },
      { name: 'deuteragonist', chromaMultiplier: 0.95, lightnessShift: 0.05, presence: 0.3 },
      { name: 'supporting', chromaMultiplier: 0.8, lightnessShift: -0.1, presence: 0.15 },
      { name: 'neutral', chromaMultiplier: 0.5, lightnessShift: -0.05, presence: 0.2 },
      { name: 'supporting', chromaMultiplier: 0.7, lightnessShift: 0.08, presence: 0.12 },
      { name: 'background', chromaMultiplier: 0.4, lightnessShift: -0.08, presence: 0.18 },
    ];
  }

  if (paletteType === 'splitComplementary') {
    return [
      { name: 'protagonist', chromaMultiplier: 1.0, lightnessShift: 0, presence: 0.5 },
      { name: 'supporting', chromaMultiplier: 0.9, lightnessShift: -0.08, presence: 0.2 },
      { name: 'deuteragonist', chromaMultiplier: 0.85, lightnessShift: 0.03, presence: 0.25 },
      { name: 'neutral', chromaMultiplier: 0.6, lightnessShift: -0.05, presence: 0.15 },
      { name: 'accent', chromaMultiplier: 0.8, lightnessShift: 0.05, presence: 0.15 },
      { name: 'background', chromaMultiplier: 0.5, lightnessShift: 0.08, presence: 0.12 },
    ];
  }

  if (paletteType === 'triadic') {
    return [
      { name: 'protagonist', chromaMultiplier: 1.0, lightnessShift: 0, presence: 0.5 },
      { name: 'supporting', chromaMultiplier: 0.9, lightnessShift: -0.1, presence: 0.2 },
      { name: 'deuteragonist', chromaMultiplier: 0.85, lightnessShift: 0.05, presence: 0.3 },
      { name: 'neutral', chromaMultiplier: 0.65, lightnessShift: 0.08, presence: 0.15 },
      { name: 'accent', chromaMultiplier: 0.8, lightnessShift: 0.02, presence: 0.25 },
      { name: 'background', chromaMultiplier: 0.6, lightnessShift: -0.05, presence: 0.12 },
    ];
  }

  if (paletteType === 'tetradic') {
    return [
      { name: 'protagonist', chromaMultiplier: 1.0, lightnessShift: 0, presence: 0.4 },
      { name: 'deuteragonist', chromaMultiplier: 0.85, lightnessShift: 0.02, presence: 0.25 },
      { name: 'neutral', chromaMultiplier: 0.6, lightnessShift: -0.05, presence: 0.15 },
      { name: 'supporting', chromaMultiplier: 0.8, lightnessShift: 0, presence: 0.2 },
      { name: 'accent', chromaMultiplier: 0.75, lightnessShift: 0.05, presence: 0.12 },
      { name: 'background', chromaMultiplier: 0.7, lightnessShift: -0.08, presence: 0.18 },
    ];
  }

  // Default fallback
  return Array(6).fill({
    name: 'neutral',
    chromaMultiplier: 1.0,
    lightnessShift: 0,
    presence: 0.16,
  });
}

/**
 * Enhances a raw palette by applying chroma narratives and color hierarchy roles.
 * This post-processing step adds depth, rhythm, and balance to the mathematically generated colors.
 * 
 * @param colors - The raw array of OKLCH colors
 * @param paletteType - The type of harmony
 * @param style - The style variant
 * @param baseColorIndex - The index of the base color (which should remain relatively unchanged)
 * @returns A new array of enhanced OKLCH colors
 */
export function enhancePalette(
  colors: OKLCH[],
  paletteType: PaletteType,
  style: PaletteStyle,
  baseColorIndex: number = 0
): OKLCH[] {
  const baseColor = colors[baseColorIndex];
  const baseChroma = baseColor.c;

  const narrative = getChromaNarrative(paletteType, style, baseChroma);
  const hierarchy = getColorHierarchy(paletteType, style);

  return colors.map((color, index) => {
    // Skip base color - keep it unchanged
    if (index === baseColorIndex) {
      return color;
    }

    const role = hierarchy[index] || hierarchy[0];
    const narrativeFactor = narrative.pattern[index] || 1.0;

    // Apply hierarchy and narrative
    let newL = color.l + role.lightnessShift;
    let newC = color.c * role.chromaMultiplier * narrativeFactor;

    // Breathing room (slight lightness adjustment for contrast if needed)
    if (narrative.breathingRoom && index % 2 !== 0) {
       newL += (newL > 0.5 ? -0.05 : 0.05);
    }

    return clampOKLCH(newL, newC, color.h);
  });
}

/**
 * Polishes the palette to ensure all colors are visually interesting.
 * Prevents dead grays and adds subtle tints to very light colors.
 * 
 * @param colors - The palette to polish
 * @param baseColorIndex - The index of the base color to preserve
 * @returns The polished palette
 */
export function polishPalette(colors: OKLCH[], baseColorIndex: number = 0): OKLCH[] {
  return colors.map((color, index) => {
    if (index === baseColorIndex) {
      return color;
    }

    const polished = { ...color };

    // 1. Prevent "dead" grays in mid-tones
    if (polished.c < 0.05 && polished.l > 0.2 && polished.l < 0.8) {
      polished.c = Math.max(0.08, polished.c * 2); // Minimum life
    }

    // 2. Make very light colors more interesting
    if (polished.l > 0.85) {
      // Add subtle tint based on the hue
      if (polished.c < 0.04) {
        polished.c = 0.04; // Minimum tint
      }
      
      // Slight warm shift for most hues (except already warm ones)
      if (polished.h < 30 || polished.h > 330) {
        // Already warm
      } else {
        // Nudge towards warmth for better UI feel
        // This is a subtle "sunlight" effect
      }
    }

    return clampOKLCH(polished.l, polished.c, polished.h);
  });
}
