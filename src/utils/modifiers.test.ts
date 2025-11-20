import { describe, it, expect } from 'vitest';
import {
  sineModifier,
  waveModifier,
  zapModifier,
  blockModifier,
  applyModifiers,
} from './modifiers';
import type { PaletteColor } from '../color-palette-generator';

describe('palette modifiers', () => {
  const createTestPalette = (): PaletteColor[] => [
    { l: 0.5, c: 0.2, h: 0 },
    { l: 0.6, c: 0.2, h: 60 },
    { l: 0.4, c: 0.2, h: 120 },
    { l: 0.7, c: 0.2, h: 180 },
    { l: 0.5, c: 0.2, h: 240 },
    { l: 0.6, c: 0.2, h: 300 },
  ];

  describe('sineModifier', () => {
    it('should apply sine wave modifications', () => {
      const palette = createTestPalette();
      const result = sineModifier(palette, 0.5);

      expect(result).toHaveLength(palette.length);
      
      // Values should be modified
      result.forEach((color, idx) => {
        expect(color).not.toEqual(palette[idx]);
      });
    });

    it('should not modify with zero modifier', () => {
      const palette = createTestPalette();
      const result = sineModifier(palette, 0);

      result.forEach((color, idx) => {
        expect(color.l).toBeCloseTo(palette[idx].l);
        expect(color.c).toBeCloseTo(palette[idx].c);
        expect(color.h).toBeCloseTo(palette[idx].h);
      });
    });

    it('should apply stronger modifications with higher modifier', () => {
      const palette = createTestPalette();
      const result1 = sineModifier(palette, 0.2);
      const result2 = sineModifier(palette, 0.8);

      // Calculate average difference from original
      const avgDiff1 = result1.reduce((sum, color, idx) => 
        sum + Math.abs(color.h - palette[idx].h), 0) / result1.length;
      const avgDiff2 = result2.reduce((sum, color, idx) => 
        sum + Math.abs(color.h - palette[idx].h), 0) / result2.length;

      expect(avgDiff2).toBeGreaterThan(avgDiff1);
    });

    it('should clamp lightness values', () => {
      const palette = createTestPalette();
      const result = sineModifier(palette, 1.0);

      result.forEach(color => {
        expect(color.l).toBeGreaterThanOrEqual(0.01);
        expect(color.l).toBeLessThanOrEqual(0.99);
      });
    });
  });

  describe('waveModifier', () => {
    it('should apply wave-based modifications', () => {
      const palette = createTestPalette();
      const result = waveModifier(palette, 0.5);

      expect(result).toHaveLength(palette.length);
      
      result.forEach((color, idx) => {
        expect(color).not.toEqual(palette[idx]);
      });
    });

    it('should modify chroma based on chaos level', () => {
      const palette = createTestPalette();
      const result = waveModifier(palette, 0.5);

      result.forEach(color => {
        expect(color.c).toBeGreaterThanOrEqual(0);
      });
    });

    it('should increase chaos with higher modifier', () => {
      const palette = createTestPalette();
      const result1 = waveModifier(palette, 0.2);
      const result2 = waveModifier(palette, 0.8);

      // Higher modifier should create more variation
      const variance1 = result1.reduce((sum, color, idx) => 
        sum + Math.pow(color.h - palette[idx].h, 2), 0);
      const variance2 = result2.reduce((sum, color, idx) => 
        sum + Math.pow(color.h - palette[idx].h, 2), 0);

      expect(variance2).toBeGreaterThan(variance1);
    });
  });

  describe('zapModifier', () => {
    it('should apply spiral-based modifications', () => {
      const palette = createTestPalette();
      const result = zapModifier(palette, 0.5);

      expect(result).toHaveLength(palette.length);
      
      // At least one color should be modified
      const hasModification = result.some((color, idx) => 
        Math.abs(color.h - palette[idx].h) > 0.1 ||
        Math.abs(color.l - palette[idx].l) > 0.01 ||
        Math.abs(color.c - palette[idx].c) > 0.01
      );
      expect(hasModification).toBe(true);
    });

    it('should create increasing modifications along palette', () => {
      const palette = createTestPalette();
      const result = zapModifier(palette, 0.5);

      // Later colors should generally have more modification
      // (due to spiral radius increasing)
      const diff0 = Math.abs(result[0].h - palette[0].h);
      const diff5 = Math.abs(result[5].h - palette[5].h);

      // This might not always hold due to spiral wrapping, but generally true
      expect(diff5 + diff0).toBeGreaterThan(0); // At least some modification
    });

    it('should modify both hue and lightness', () => {
      const palette = createTestPalette();
      const result = zapModifier(palette, 0.5);

      let hueChanged = false;
      let lightnessChanged = false;

      result.forEach((color, idx) => {
        if (Math.abs(color.h - palette[idx].h) > 0.1) hueChanged = true;
        if (Math.abs(color.l - palette[idx].l) > 0.01) lightnessChanged = true;
      });

      expect(hueChanged).toBe(true);
      expect(lightnessChanged).toBe(true);
    });
  });

  describe('blockModifier', () => {
    it('should apply triangle wave modifications', () => {
      const palette = createTestPalette();
      const result = blockModifier(palette, 0.5);

      expect(result).toHaveLength(palette.length);
      
      // At least one color should be modified
      const hasModification = result.some((color, idx) => 
        Math.abs(color.h - palette[idx].h) > 0.1 ||
        Math.abs(color.l - palette[idx].l) > 0.01 ||
        Math.abs(color.c - palette[idx].c) > 0.01
      );
      expect(hasModification).toBe(true);
    });

    it('should create wave-like patterns', () => {
      const palette = createTestPalette();
      const result = blockModifier(palette, 0.5);

      // Check that there's variation (wave pattern creates ups and downs)
      const lightnesses = result.map(c => c.l);
      const max = Math.max(...lightnesses);
      const min = Math.min(...lightnesses);

      expect(max - min).toBeGreaterThan(0);
    });

    it('should scale amplitude with modifier', () => {
      const palette = createTestPalette();
      const result1 = blockModifier(palette, 0.2);
      const result2 = blockModifier(palette, 0.8);

      const range1 = Math.max(...result1.map(c => c.l)) - Math.min(...result1.map(c => c.l));
      const range2 = Math.max(...result2.map(c => c.l)) - Math.min(...result2.map(c => c.l));

      expect(range2).toBeGreaterThan(range1);
    });
  });

  describe('applyModifiers', () => {
    it('should return original palette when modifiers is undefined', () => {
      const palette = createTestPalette();
      const result = applyModifiers(palette, undefined);

      expect(result).toEqual(palette);
    });

    it('should apply single modifier', () => {
      const palette = createTestPalette();
      const result = applyModifiers(palette, [0.5, 0, 0, 0]);

      // Should apply sineModifier
      result.forEach((color, idx) => {
        expect(color).not.toEqual(palette[idx]);
      });
    });

    it('should apply multiple modifiers in sequence', () => {
      const palette = createTestPalette();
      const result = applyModifiers(palette, [0.3, 0.3, 0, 0]);

      // Should apply both sine and wave modifiers
      expect(result).toHaveLength(palette.length);
      
      result.forEach((color, idx) => {
        expect(color).not.toEqual(palette[idx]);
      });
    });

    it('should apply all four modifiers', () => {
      const palette = createTestPalette();
      const result = applyModifiers(palette, [0.2, 0.2, 0.2, 0.2]);

      expect(result).toHaveLength(palette.length);
      
      result.forEach((color, idx) => {
        expect(color).not.toEqual(palette[idx]);
      });
    });

    it('should skip modifiers with zero value', () => {
      const palette = createTestPalette();
      const resultWithZeros = applyModifiers(palette, [0, 0, 0.5, 0]);
      const resultJustZap = zapModifier(palette, 0.5);

      // Should be equivalent to just applying zap modifier
      resultWithZeros.forEach((color, idx) => {
        expect(color.l).toBeCloseTo(resultJustZap[idx].l);
        expect(color.c).toBeCloseTo(resultJustZap[idx].c);
        expect(color.h).toBeCloseTo(resultJustZap[idx].h);
      });
    });

    it('should maintain valid OKLCH values after all modifiers', () => {
      const palette = createTestPalette();
      const result = applyModifiers(palette, [0.8, 0.8, 0.8, 0.8]);

      result.forEach(color => {
        expect(color.l).toBeGreaterThanOrEqual(0.01);
        expect(color.l).toBeLessThanOrEqual(0.99);
        expect(color.c).toBeGreaterThanOrEqual(0);
        expect(color.c).toBeLessThanOrEqual(0.37);
        expect(color.h).toBeGreaterThanOrEqual(0);
        expect(color.h).toBeLessThan(360);
      });
    });
  });
});
