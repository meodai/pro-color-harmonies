import { describe, it, expect } from 'vitest';
import { lerp, lerpOKLCH, scaleSpreadArray } from './interpolation';

describe('interpolation utilities', () => {
  describe('lerp', () => {
    it('should interpolate between two numbers', () => {
      expect(lerp(0, 0, 10)).toBe(0);
      expect(lerp(0.5, 0, 10)).toBe(5);
      expect(lerp(1, 0, 10)).toBe(10);
    });

    it('should handle negative values', () => {
      expect(lerp(0.5, -10, 10)).toBe(0);
      expect(lerp(0.25, -10, 10)).toBe(-5);
    });

    it('should handle values outside 0-1 range', () => {
      expect(lerp(1.5, 0, 10)).toBe(15);
      expect(lerp(-0.5, 0, 10)).toBe(-5);
    });
  });

  describe('lerpOKLCH', () => {
    it('should interpolate OKLCH values', () => {
      const from = { l: 0.3, c: 0.1, h: 0 };
      const to = { l: 0.7, c: 0.3, h: 180 };
      const result = lerpOKLCH(0.5, from, to);

      expect(result.l).toBeCloseTo(0.5);
      expect(result.c).toBeCloseTo(0.2);
      expect(result.h).toBeCloseTo(90);
    });

    it('should handle hue wrapping (shortest path)', () => {
      const from = { l: 0.5, c: 0.2, h: 10 };
      const to = { l: 0.5, c: 0.2, h: 350 };
      const result = lerpOKLCH(0.5, from, to);

      // Should go the short way around (through 0/360)
      expect(result.h).toBeCloseTo(0);
    });

    it('should handle hue wrapping in opposite direction', () => {
      const from = { l: 0.5, c: 0.2, h: 350 };
      const to = { l: 0.5, c: 0.2, h: 10 };
      const result = lerpOKLCH(0.5, from, to);

      // Should go the short way around (through 360/0)
      expect(result.h).toBeCloseTo(0);
    });

    it('should handle null from value', () => {
      const to = { l: 0.7, c: 0.3, h: 180 };
      const result = lerpOKLCH(0.5, null, to);
      expect(result).toEqual(to);
    });

    it('should handle null to value', () => {
      const from = { l: 0.3, c: 0.1, h: 0 };
      const result = lerpOKLCH(0.5, from, null);
      expect(result).toEqual(from);
    });

    it('should handle both null values', () => {
      const result = lerpOKLCH(0.5, null, null);
      expect(result).toEqual({ l: 0.5, c: 0, h: 0 });
    });

    it('should normalize hue results', () => {
      const from = { l: 0.5, c: 0.2, h: 340 };
      const to = { l: 0.5, c: 0.2, h: 20 };
      const result = lerpOKLCH(0.5, from, to);

      expect(result.h).toBeGreaterThanOrEqual(0);
      expect(result.h).toBeLessThan(360);
    });
  });

  describe('scaleSpreadArray', () => {
    it('should spread array to target size', () => {
      const values = [1, 5];
      const result = scaleSpreadArray(values, 5);

      expect(result).toHaveLength(5);
      expect(result[0]).toBe(1);
      expect(result[4]).toBe(5);
      expect(result[2]).toBeCloseTo(3);
    });

    it('should handle larger arrays', () => {
      const values = [0, 5, 10];
      const result = scaleSpreadArray(values, 5);

      expect(result).toHaveLength(5);
      expect(result[0]).toBe(0);
      expect(result[2]).toBe(5);
      expect(result[4]).toBe(10);
    });

    it('should throw error for arrays with less than 2 values', () => {
      expect(() => scaleSpreadArray([1], 5)).toThrow();
      expect(() => scaleSpreadArray([], 5)).toThrow();
    });

    it('should throw error when target size is less than array length without padding', () => {
      const values = [1, 2, 3, 4, 5];
      expect(() => scaleSpreadArray(values, 3, 0)).toThrow();
    });

    it('should handle padding parameter', () => {
      const values = [0, 10];
      const result = scaleSpreadArray(values, 5, 0.1);

      expect(result).toHaveLength(5);
      // With padding, endpoints should not reach exact values
      expect(result[0]).toBeGreaterThan(0);
      expect(result[4]).toBeLessThan(10);
    });

    it('should use custom fill function', () => {
      const values = [1, 5];
      const customFill = (amt: number, from: number, to: number) => {
        // Square root interpolation
        return from + Math.sqrt(amt) * (to - from);
      };
      const result = scaleSpreadArray(values, 5, 0, customFill);

      expect(result).toHaveLength(5);
      expect(result[0]).toBe(1);
      expect(result[4]).toBe(5);
      // Middle values should follow square root curve
      expect(result[1]).toBeGreaterThan(lerp(0.25, 1, 5));
    });

    it('should handle single target size with padding', () => {
      const values = [0, 10];
      const result = scaleSpreadArray(values, 1, 0.1);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeCloseTo(5);
    });

    it('should distribute nulls evenly when expanding', () => {
      const values = [1, 2, 3];
      const result = scaleSpreadArray(values, 7);

      expect(result).toHaveLength(7);
      expect(result[0]).toBe(1);
      expect(result[3]).toBe(2);
      expect(result[6]).toBe(3);
    });
  });
});
