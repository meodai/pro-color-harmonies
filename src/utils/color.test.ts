import { describe, it, expect } from 'vitest';
import {
  OKLCH_LIMITS,
  clampOKLCH,
  normalizeHue,
  extractOKLCH,
  createOklch,
  avoidMuddyZones,
} from './color';

describe('color utilities', () => {
  describe('clampOKLCH', () => {
    it('should clamp lightness values to valid range', () => {
      const result = clampOKLCH(1.5, 0.2, 180);
      expect(result.l).toBe(OKLCH_LIMITS.l.max);
      
      const result2 = clampOKLCH(-0.5, 0.2, 180);
      expect(result2.l).toBe(OKLCH_LIMITS.l.min);
    });

    it('should clamp chroma values to valid range', () => {
      const result = clampOKLCH(0.5, 1.0, 180);
      expect(result.c).toBe(OKLCH_LIMITS.c.max);
      
      const result2 = clampOKLCH(0.5, -0.1, 180);
      expect(result2.c).toBe(OKLCH_LIMITS.c.min);
    });

    it('should normalize hue values', () => {
      const result = clampOKLCH(0.5, 0.2, 400);
      expect(result.h).toBe(40);
      
      const result2 = clampOKLCH(0.5, 0.2, -30);
      expect(result2.h).toBe(330);
    });

    it('should preserve valid values', () => {
      const result = clampOKLCH(0.5, 0.2, 180);
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 180 });
    });
  });

  describe('normalizeHue', () => {
    it('should normalize hue to 0-360 range', () => {
      expect(normalizeHue(400)).toBe(40);
      expect(normalizeHue(-30)).toBe(330);
      expect(normalizeHue(720)).toBe(0);
      expect(normalizeHue(180)).toBe(180);
    });

    it('should handle edge cases', () => {
      expect(normalizeHue(0)).toBe(0);
      expect(normalizeHue(360)).toBe(0);
      expect(normalizeHue(-360)).toBe(0);
    });
  });

  describe('extractOKLCH', () => {
    it('should extract OKLCH values from color object', () => {
      const color = { mode: 'oklch' as const, l: 0.6, c: 0.15, h: 120 };
      const result = extractOKLCH(color);
      expect(result).toEqual({ l: 0.6, c: 0.15, h: 120 });
    });

    it('should provide safe defaults for missing values', () => {
      const color = { mode: 'oklch' as const, l: 0, c: 0 };
      const result = extractOKLCH(color);
      expect(result.l).toBe(0.5);
      expect(result.c).toBe(0);
      expect(result.h).toBe(0);
    });

    it('should handle undefined hue', () => {
      const color = { mode: 'oklch' as const, l: 0.5, c: 0 };
      const result = extractOKLCH(color);
      expect(result.h).toBe(0);
    });
  });

  describe('createOklch', () => {
    it('should create OKLCH color object', () => {
      const result = createOklch(0.5, 0.2, 180);
      expect(result).toEqual({
        mode: 'oklch',
        l: 0.5,
        c: 0.2,
        h: 180,
      });
    });

    it('should clamp values when creating', () => {
      const result = createOklch(1.5, 0.5, 400);
      const oklchResult = result as { l: number; c: number; h: number };
      expect(oklchResult.l).toBe(OKLCH_LIMITS.l.max);
      expect(oklchResult.c).toBe(OKLCH_LIMITS.c.max);
      expect(oklchResult.h).toBe(40);
    });
  });

  describe('avoidMuddyZones', () => {
    it('should shift hue in yellow-green muddy zone', () => {
      const result = avoidMuddyZones(75, 0.5, 0.1);
      expect(result.h).not.toBe(75);
      expect(result.h).toBe(normalizeHue(75 - 10));
    });

    it('should shift hue in orange muddy zone', () => {
      const result = avoidMuddyZones(40, 0.5, 0.1);
      expect(result.h).not.toBe(40);
      expect(result.h).toBe(normalizeHue(40 + 15));
    });

    it('should not shift hue when chroma is high enough', () => {
      const result = avoidMuddyZones(75, 0.5, 0.2);
      expect(result.h).toBe(75);
    });

    it('should not shift hue outside muddy zones', () => {
      const result = avoidMuddyZones(180, 0.5, 0.1);
      expect(result.h).toBe(180);
    });

    it('should preserve lightness and chroma', () => {
      const result = avoidMuddyZones(75, 0.6, 0.1);
      expect(result.l).toBe(0.6);
      expect(result.c).toBe(0.1);
    });
  });
});
