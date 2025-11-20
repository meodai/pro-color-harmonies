import { describe, it, expect } from 'vitest';
import * as utils from './index';

describe('utils index', () => {
  it('should export color utilities', () => {
    expect(utils.clampOKLCH).toBeDefined();
    expect(utils.normalizeHue).toBeDefined();
    expect(utils.extractOKLCH).toBeDefined();
    expect(utils.createOklch).toBeDefined();
    expect(utils.avoidMuddyZones).toBeDefined();
    expect(utils.OKLCH_LIMITS).toBeDefined();
  });

  it('should export interpolation utilities', () => {
    expect(utils.lerp).toBeDefined();
    expect(utils.lerpOKLCH).toBeDefined();
    expect(utils.lerpColor).toBeDefined();
    expect(utils.scaleSpreadArray).toBeDefined();
  });

  it('should export modifier utilities', () => {
    expect(utils.sineModifier).toBeDefined();
    expect(utils.waveModifier).toBeDefined();
    expect(utils.zapModifier).toBeDefined();
    expect(utils.blockModifier).toBeDefined();
    expect(utils.applyModifiers).toBeDefined();
  });

  it('should export palette utilities', () => {
    expect(utils.createPaletteGenerator).toBeDefined();
  });

  it('should have working exports', () => {
    // Test a simple function call
    const hue = utils.normalizeHue(400);
    expect(hue).toBe(40);

    const lerped = utils.lerp(0.5, 0, 10);
    expect(lerped).toBe(5);
  });
});
