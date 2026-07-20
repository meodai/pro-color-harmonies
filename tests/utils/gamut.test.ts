import { describe, it, expect } from 'vitest';
import { displayable, inGamut } from 'culori';
import { clampColorToGamut, clampPaletteToGamut } from '../../src/utils/gamut';
import { ColorPaletteGenerator } from '../../src/index';
import type { OKLCH } from '../../src/index';

const toCulori = (color: OKLCH) => ({ mode: 'oklch' as const, ...color });

describe('gamut utilities', () => {
  describe('clampColorToGamut', () => {
    it('should bring an out-of-gamut color into sRGB', () => {
      // Near-white with high chroma: far outside sRGB
      const color: OKLCH = { l: 0.97, c: 0.3, h: 150 };
      expect(displayable(toCulori(color))).toBe(false);

      const clamped = clampColorToGamut(color);
      expect(displayable(toCulori(clamped))).toBe(true);
    });

    it('should preserve lightness and hue while reducing chroma', () => {
      const color: OKLCH = { l: 0.97, c: 0.3, h: 150 };
      const clamped = clampColorToGamut(color);

      expect(clamped.l).toBeCloseTo(color.l, 2);
      expect(clamped.h).toBeCloseTo(color.h, 0);
      expect(clamped.c).toBeLessThan(color.c);
    });

    it('should leave in-gamut colors untouched', () => {
      const color: OKLCH = { l: 0.6, c: 0.1, h: 250 };
      expect(clampColorToGamut(color)).toEqual(color);
    });

    it('should support the P3 gamut target', () => {
      const color: OKLCH = { l: 0.7, c: 0.4, h: 30 };
      const clamped = clampColorToGamut(color, 'p3');
      expect(inGamut('p3')(toCulori(clamped))).toBe(true);
    });
  });

  describe('clampPaletteToGamut', () => {
    it('should clamp every color of a palette', () => {
      const palette: OKLCH[] = [
        { l: 0.97, c: 0.3, h: 150 },
        { l: 0.2, c: 0.35, h: 145 },
        { l: 0.6, c: 0.1, h: 250 },
      ];
      const clamped = clampPaletteToGamut(palette);
      clamped.forEach(color => {
        expect(displayable(toCulori(color))).toBe(true);
      });
    });
  });

  describe('clampToGamut generator option', () => {
    const baseColor: OKLCH = { l: 0.95, c: 0.25, h: 120 };

    it('should produce only displayable colors when enabled', () => {
      (['tintsShades', 'analogous', 'complementary', 'triadic', 'tetradic', 'splitComplementary'] as const).forEach(type => {
        const palette = ColorPaletteGenerator.generate(baseColor, type, {
          style: 'circle',
          clampToGamut: true,
        });
        palette.forEach(color => {
          expect(displayable(toCulori(color))).toBe(true);
        });
      });
    });

    it('should apply to all palettes from generateAll', () => {
      const all = ColorPaletteGenerator.generateAll(baseColor, {
        style: 'diamond',
        clampToGamut: 'rgb',
      });
      Object.values(all).forEach(palette => {
        palette.forEach(color => {
          expect(displayable(toCulori(color))).toBe(true);
        });
      });
    });

    it('should not clamp when the option is omitted', () => {
      const palette = ColorPaletteGenerator.generate(baseColor, 'tintsShades', { style: 'square' });
      const clamped = ColorPaletteGenerator.generate(baseColor, 'tintsShades', {
        style: 'square',
        clampToGamut: true,
      });
      expect(palette).not.toEqual(clamped);
    });
  });
});
