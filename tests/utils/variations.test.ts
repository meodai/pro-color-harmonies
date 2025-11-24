import { describe, it, expect } from 'vitest';
import {
  getTriadicVariations,
  getComplementaryVariations,
  getAnalogousVariations,
  getTetradicVariations,
  getSplitComplementaryVariations,
} from '../../src/utils/variations';
import type { OKLCH, PaletteStyle } from '../../src/index';

describe('Variations Utils', () => {
  const baseColor: OKLCH = { l: 0.5, c: 0.2, h: 30 };
  const darkColor: OKLCH = { l: 0.2, c: 0.2, h: 30 };
  const lightColor: OKLCH = { l: 0.8, c: 0.2, h: 30 };
  const styles: PaletteStyle[] = ['square', 'triangle', 'circle', 'diamond'];

  describe('getTriadicVariations', () => {
    it('should return variations for base and triad', () => {
      const result = getTriadicVariations(baseColor, 'square');
      expect(result).toHaveProperty('base');
      expect(result).toHaveProperty('triad');
      expect(result.base).toHaveProperty('dark');
      expect(result.triad).toHaveProperty('first');
      expect(result.triad).toHaveProperty('second');
    });

    it('should adapt to dark base color', () => {
      const result = getTriadicVariations(darkColor, 'square');
      // Dark base should produce lighter variations or specific adjustments
      expect(result.base.dark.l).toBeDefined();
    });

    it('should adapt to light base color', () => {
      const result = getTriadicVariations(lightColor, 'square');
      // Light base should produce darker variations
      expect(result.base.dark.l).toBeLessThan(0);
    });

    it('should handle different styles', () => {
      styles.forEach(style => {
        const result = getTriadicVariations(baseColor, style);
        expect(result).toBeDefined();
      });
    });
  });

  describe('getComplementaryVariations', () => {
    it('should return variations for base and complement', () => {
      const result = getComplementaryVariations(baseColor, 'square');
      expect(result).toHaveProperty('base');
      expect(result).toHaveProperty('complement');
      expect(result.base).toHaveProperty('dark');
      expect(result.base).toHaveProperty('light');
      expect(result.complement).toHaveProperty('main');
      expect(result.complement).toHaveProperty('light');
      expect(result.complement).toHaveProperty('muted');
    });

    it('should adapt to dark base color', () => {
      const result = getComplementaryVariations(darkColor, 'square');
      expect(result.base.light.l).toBeGreaterThan(0);
    });

    it('should adapt to light base color', () => {
      const result = getComplementaryVariations(lightColor, 'square');
      expect(result.base.dark.l).toBeLessThan(0);
    });
  });

  describe('getAnalogousVariations', () => {
    it('should return an array of variations', () => {
      const result = getAnalogousVariations(baseColor, 'square');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(v => {
        expect(v).toHaveProperty('l');
        expect(v).toHaveProperty('c');
      });
    });

    it('should adapt to dark base color', () => {
      const result = getAnalogousVariations(darkColor, 'square');
      // Should have some positive lightness adjustments
      expect(result.some(v => v.l > 0)).toBe(true);
    });

    it('should adapt to light base color', () => {
      const result = getAnalogousVariations(lightColor, 'square');
      // Should have some negative lightness adjustments
      expect(result.some(v => v.l < 0)).toBe(true);
    });
  });

  describe('getTetradicVariations', () => {
    it('should return variations for all four colors', () => {
      const result = getTetradicVariations(baseColor, 'square');
      expect(result).toHaveProperty('first');
      expect(result).toHaveProperty('complement');
      expect(result).toHaveProperty('fourth');
    });

    it('should adapt to dark base color', () => {
      const result = getTetradicVariations(darkColor, 'square');
      expect(result.first.pure.l).toBeGreaterThan(0);
    });

    it('should adapt to light base color', () => {
      const result = getTetradicVariations(lightColor, 'square');
      expect(result.first.pure.l).toBeLessThan(0);
    });
  });

  describe('getSplitComplementaryVariations', () => {
    it('should return variations for base and split complements', () => {
      const result = getSplitComplementaryVariations(baseColor, 'square');
      expect(result).toHaveProperty('base');
      expect(result).toHaveProperty('complement');
      expect(result.complement).toHaveProperty('first');
      expect(result.complement).toHaveProperty('second');
    });

    it('should adapt to dark base color', () => {
      const result = getSplitComplementaryVariations(darkColor, 'square');
      expect(result.base.dark.l).toBeDefined();
    });

    it('should adapt to light base color', () => {
      const result = getSplitComplementaryVariations(lightColor, 'square');
      expect(result.base.dark.l).toBeLessThan(0);
    });
  });
});
