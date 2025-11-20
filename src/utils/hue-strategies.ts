import { normalizeHue } from './color';
import type { OKLCH, PaletteStyle } from '../index';

// ============= Complementary Strategies =============

export const getComplementaryHue = (base: OKLCH, style: PaletteStyle): number => {
  const { h: hue, l: lightness, c: chroma } = base;
  
  switch (style) {
    case 'square':
      return normalizeHue(hue + 180);
    case 'triangle':
      if (hue < 30) return 170 + hue * 0.3;
      if (hue < 90) return 240 + (hue - 30) * 0.5;
      if (hue < 150) return 320 + (hue - 90) * 0.6;
      if (hue < 210) return 20 + (hue - 150) * 0.4;
      if (hue < 270) return 40 + (hue - 210) * 0.3;
      return 90 + (hue - 270) * 0.4;
    case 'circle':
      if (hue >= 345 || hue < 30) return 180 + Math.sin((hue * Math.PI) / 180) * 20;
      if (hue < 90) return 240 + (chroma * lightness) * 30;
      if (hue < 150) return 320 + (hue - 90) * 0.5;
      if (hue < 210) return 30 + Math.cos((hue * Math.PI) / 180) * 15;
      if (hue < 270) return 50 + (270 - hue) * 0.4;
      return 100 + Math.sin(((hue - 270) * Math.PI) / 90) * 25;
    case 'diamond':
      if (lightness > 0.8 && chroma < 0.3) return normalizeHue(hue + 200);
      if (hue >= 30 && hue < 90 && lightness > 0.6) return 240 + (hue - 30) * 0.3;
      return normalizeHue(hue + 180 + (lightness * 20 - 10));
    default:
      return normalizeHue(hue + 180);
  }
};

// ============= Analogous Strategies =============

export const getAnalogousHues = (base: OKLCH, style: PaletteStyle): number[] => {
  const { h: hue, l: lightness } = base;
  
  switch (style) {
    case 'square':
      return [0, -30, -20, -10, 15, 30].map(d => normalizeHue(hue + d));
    case 'triangle':
      if (hue < 30) return [0, -15, -8, 8, 20, 35].map(d => normalizeHue(hue + d));
      if (hue < 90) return [0, -25, -12, 10, 20, 30].map(d => normalizeHue(hue + d));
      return [0, -25, -12, 10, 20, 35].map(d => normalizeHue(hue + d));
    case 'circle':
      if (hue >= 345 || hue < 30) return [0, -20, -10, 8, 18, 30].map(d => normalizeHue(hue + d));
      if (hue >= 150 && hue < 210) return [0, -20, -10, 8, 18, 30].map(d => normalizeHue(hue + d));
      return [0, -22, -10, 10, 20, 35].map(d => normalizeHue(hue + d));
    case 'diamond':
      if (lightness > 0.6 && hue >= 30 && hue < 90) return [0, -20, -10, 8, 18, 30].map(d => normalizeHue(hue + d));
      return [0, -22, -10, 8, 18, 30].map(d => normalizeHue(hue + d));
    default:
      return [0, -30, -20, -10, 15, 30].map(d => normalizeHue(hue + d));
  }
};

// ============= Triadic Strategies =============

export const getTriadicHues = (base: OKLCH, style: PaletteStyle): number[] => {
  const { h: hue, l: lightness, c: chroma } = base;

  switch (style) {
    case 'square':
      return [hue, normalizeHue(hue + 120), normalizeHue(hue + 240)];
    case 'triangle':
      if (hue < 60) return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
      if (hue < 120) return [hue, normalizeHue(hue + 135), normalizeHue(hue + 225)];
      if (hue < 180) return [hue, normalizeHue(hue + 115), normalizeHue(hue + 245)];
      if (hue < 240) return [hue, normalizeHue(hue + 120), normalizeHue(hue + 240)];
      if (hue < 300) return [hue, normalizeHue(hue + 115), normalizeHue(hue + 245)];
      return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
    case 'circle':
      if (hue >= 345 || hue < 30) return [hue, normalizeHue(hue + 130), normalizeHue(hue + 230)];
      if (hue >= 30 && hue < 90) {
        const i = chroma * lightness;
        return [hue, normalizeHue(hue + 120 + i * 15), normalizeHue(hue + 240 - i * 10)];
      }
      if (hue >= 90 && hue < 150) return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
      if (hue >= 150 && hue < 210) return [hue, normalizeHue(hue + 115), normalizeHue(hue + 245)];
      if (hue >= 210 && hue < 270) return [hue, normalizeHue(hue + 130), normalizeHue(hue + 230)];
      return [hue, normalizeHue(hue + 120), normalizeHue(hue + 240)];
    case 'diamond':
      if (lightness > 0.8 && chroma < 0.3) return [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
      if (hue >= 30 && hue < 90 && lightness > 0.6) return [hue, normalizeHue(hue + 110), normalizeHue(hue + 250)];
      if (hue >= 180 && hue < 240 && lightness < 0.5) return [hue, normalizeHue(hue + 130), normalizeHue(hue + 230)];
      if (chroma > 0.8 && lightness < 0.4) {
        return hue < 180 
          ? [hue, normalizeHue(hue + 115), normalizeHue(hue + 245)]
          : [hue, normalizeHue(hue + 125), normalizeHue(hue + 235)];
      }
      if (hue >= 270 && hue < 330) return [hue, normalizeHue(hue + 135), normalizeHue(hue + 225)];
      const inf = (lightness - 0.5) * 15;
      return [hue, normalizeHue(hue + 120 + inf), normalizeHue(hue + 240 - inf)];
    default:
      return [hue, normalizeHue(hue + 120), normalizeHue(hue + 240)];
  }
};

// ============= Tetradic Strategies =============

export const getTetradicHues = (base: OKLCH, style: PaletteStyle): number[] => {
  const { h: hue } = base;
  
  switch (style) {
    case 'square':
      return [0, 90, 180, 270].map(d => normalizeHue(hue + d));
    case 'triangle':
      return [0, 60, 180, 240].map(d => normalizeHue(hue + d));
    case 'circle':
      if (hue < 90) return [0, 85, 180, 265].map(d => normalizeHue(hue + d));
      return [0, 95, 180, 275].map(d => normalizeHue(hue + d));
    case 'diamond':
      return [0, 30, 180, 210].map(d => normalizeHue(hue + d));
    default:
      return [0, 90, 180, 270].map(d => normalizeHue(hue + d));
  }
};

// ============= Split Complementary Strategies =============

export const getSplitComplementaryHues = (base: OKLCH, style: PaletteStyle): number[] => {
  const { h: hue, l: lightness, c: chroma } = base;
  
  switch (style) {
    case 'square': {
      const c = normalizeHue(hue + 180);
      return [hue, normalizeHue(c - 30), normalizeHue(c + 30)];
    }
    case 'triangle':
      if (hue < 45) return [hue, normalizeHue(hue + 155), normalizeHue(hue + 185)];
      if (hue < 90) return [hue, normalizeHue(hue + 165), normalizeHue(hue + 205)];
      return [hue, normalizeHue(hue + 150), normalizeHue(hue + 210)];
    case 'circle':
      if (hue >= 345 || hue < 30) return [hue, normalizeHue(hue + 165), normalizeHue(hue + 195)];
      if (hue >= 30 && hue < 90) {
        const i = chroma * lightness;
        return [hue, normalizeHue(hue + 160 + i * 15), normalizeHue(hue + 200 + i * 10)];
      }
      return [hue, normalizeHue(hue + 170), normalizeHue(hue + 210)];
    case 'diamond': {
      const inf = lightness * 15 - 7.5;
      return [hue, normalizeHue(hue + 165 + inf), normalizeHue(hue + 195 - inf)];
    }
    default: {
      const c = normalizeHue(hue + 180);
      return [hue, normalizeHue(c - 30), normalizeHue(c + 30)];
    }
  }
};
