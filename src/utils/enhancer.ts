import type { OKLCH, PaletteType, PaletteStyle } from '../index';
import { clampOKLCH } from './color';

interface ChromaNarrative {
  pattern: number[];
  description: string;
  breathingRoom: boolean;
}

interface ColorRole {
  name: 'protagonist' | 'deuteragonist' | 'supporting' | 'accent' | 'background' | 'neutral';
  chromaMultiplier: number;
  lightnessShift: number;
  presence: number;
}

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
          pattern: [1.0, 0.9, 1.1, 0.8, 0.95, 0.75],
          description: 'Three-act drama',
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

  if (paletteType === 'tetradic') {
    switch (style) {
      case 'square':
        return {
          pattern: [1.0, 0.9, 0.9, 0.9, 0.9, 0.9],
          description: 'Balanced square',
          breathingRoom: true,
        };
      case 'triangle':
        return {
          pattern: [1.0, 0.8, 0.9, 0.7, 0.85, 0.75],
          description: 'Dynamic tension',
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
          pattern: [1.0, 0.8, 0.9, 0.6, 0.85, 0.5],
          description: 'Multi-source lighting',
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

function getColorHierarchy(
  paletteType: PaletteType,
  _style: PaletteStyle
): ColorRole[] {
  if (paletteType === 'analogous') {
    return [
      { name: 'protagonist', chromaMultiplier: 1.0, lightnessShift: 0, presence: 0.4 },
      { name: 'supporting', chromaMultiplier: 0.8, lightnessShift: -0.05, presence: 0.15 },
      { name: 'accent', chromaMultiplier: 1.0, lightnessShift: 0.02, presence: 0.1 },
      { name: 'deuteragonist', chromaMultiplier: 0.9, lightnessShift: 0.03, presence: 0.2 },
      { name: 'background', chromaMultiplier: 0.6, lightnessShift: 0.08, presence: 0.25 },
      { name: 'neutral', chromaMultiplier: 0.5, lightnessShift: -0.1, presence: 0.1 },
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
      { name: 'accent', chromaMultiplier: 0.8, lightnessShift: -0.05, presence: 0.15 },
      { name: 'background', chromaMultiplier: 0.5, lightnessShift: 0.1, presence: 0.1 },
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
