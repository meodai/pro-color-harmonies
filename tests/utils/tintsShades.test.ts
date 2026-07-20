import { describe, it, expect } from 'vitest';
import { generateTintsAndShades } from '../../src/utils/tintsShades';
import type { OKLCH } from '../../src/index';

describe('generateTintsAndShades', () => {
  const baseColor: OKLCH = { l: 0.5, c: 0.2, h: 180 };

  it('should generate 6 colors', () => {
    const result = generateTintsAndShades(baseColor, 'square');
    expect(result).toHaveLength(6);
  });

  it('should return colors ordered from dark to light', () => {
    const result = generateTintsAndShades(baseColor, 'square');
    // Check first and last lightness
    expect(result[0].l).toBeLessThan(result[result.length - 1].l);
    // Check that it's generally ascending
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].l).toBeLessThanOrEqual(result[i + 1].l);
    }
  });

  it('should respect the square style (constant hue)', () => {
    const result = generateTintsAndShades(baseColor, 'square');
    result.forEach(color => {
      expect(color.h).toBe(baseColor.h);
      expect(color.c).toBe(baseColor.c);
    });
  });

  it('should respect the triangle style (Bezold-Brücke shift)', () => {
    const result = generateTintsAndShades(baseColor, 'triangle');
    // In triangle style, hue shifts based on lightness
    // We just check that hues are not all identical to base hue if lightness varies
    const hues = result.map(c => c.h);
    const uniqueHues = new Set(hues);
    expect(uniqueHues.size).toBeGreaterThan(1);
  });

  it('should keep triangle hue drift within the perceptual caps', () => {
    // Bezold-Brücke is capped at ±4°, Abney at ±2°
    for (const h of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const result = generateTintsAndShades({ l: 0.5, c: 0.2, h }, 'triangle');
      result.forEach(color => {
        const diff = Math.abs(((color.h - h + 540) % 360) - 180);
        expect(diff).toBeLessThanOrEqual(6);
      });
    }
  });

  it('should respect the circle style (chroma curve)', () => {
    const result = generateTintsAndShades(baseColor, 'circle');
    // In circle style, chroma varies
    const chromas = result.map(c => c.c);
    const uniqueChromas = new Set(chromas);
    expect(uniqueChromas.size).toBeGreaterThan(1);
  });

  it('should respect the diamond style (mixing)', () => {
    const result = generateTintsAndShades(baseColor, 'diamond');
    // In diamond style, chroma drops off at extremes
    const lightest = result[0];
    const darkest = result[result.length - 1];
    
    // Chroma should be lower at extremes than the base chroma (if base is mid-tone)
    // Note: baseColor.c is 0.2. 
    expect(lightest.c).toBeLessThan(baseColor.c);
    expect(darkest.c).toBeLessThan(baseColor.c);
  });

  it('should clamp values to valid ranges', () => {
    const result = generateTintsAndShades(baseColor, 'square');
    result.forEach(color => {
      expect(color.l).toBeGreaterThanOrEqual(0);
      expect(color.l).toBeLessThanOrEqual(1);
      expect(color.c).toBeGreaterThanOrEqual(0);
      // Hue is circular, so just check it's a number
      expect(typeof color.h).toBe('number');
    });
  });
});
