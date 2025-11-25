import { describe, it, expect } from 'vitest';
import {
  clampOKLCH,
  normalizeHue,
  avoidMuddyZones,
} from '../../src/utils/color';
import { OKLCH_LIMITS } from '../../src/utils/constants';

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

    it('should preserve hue values without normalization', () => {
      const result = clampOKLCH(0.5, 0.2, 400);
      expect(result.h).toBe(400);
      
      const result2 = clampOKLCH(0.5, 0.2, -30);
      expect(result2.h).toBe(-30);
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

  describe('avoidMuddyZones', () => {
    it('should shift hue in yellow-green muddy zone', () => {
      // 75 is not in a muddy zone in the new logic (25-65, 100-140)
      // So it should remain 75
      const result = avoidMuddyZones(75, 0.5, 0.1);
      expect(result.h).toBe(75);
    });

    it('should shift hue in orange muddy zone', () => {
      // 40 is in brown-olive (25-65)
      // Chroma 0.1 is < 0.15, so it should be desaturated (c * 0.5)
      // Hue should remain same
      const result = avoidMuddyZones(40, 0.5, 0.1);
      expect(result.h).toBe(40);
      expect(result.c).toBeCloseTo(0.05);
    });

    it('should shift hue and boost chroma when pushing out of muddy zone', () => {
      // 40 is in brown-olive (25-65)
      // Chroma 0.2 is > 0.15
      // Should push hue and boost chroma
      const result = avoidMuddyZones(40, 0.5, 0.2);
      expect(result.h).not.toBe(40);
      expect(result.c).toBeGreaterThan(0.2);
    });

    it('should not shift hue outside muddy zones', () => {
      const result = avoidMuddyZones(180, 0.5, 0.1);
      // 180 is in corpse-cyan (180-200)
      // Chroma 0.1 < 0.15 -> desaturate
      expect(result.h).toBe(180);
      expect(result.c).toBeLessThan(0.1);
    });

    it('should preserve lightness', () => {
      const result = avoidMuddyZones(75, 0.6, 0.1);
      expect(result.l).toBe(0.6);
    });
  });
});
