import { normalizeHue, clampOKLCH } from './color';
import { OKLCH_LIMITS } from './constants';
import { lerp } from './interpolation';
import { resolvePaletteStyle } from './palette';
import type { OKLCH, PaletteStyle } from '../index';

/**
 * Generates a 6-step lightness scale (tints and shades) for a single color.
 * Applies different perceptual strategies based on the selected style.
 * The scale follows a fixed lightness progression from near black to near
 * white; the base color is snapped into its nearest slot (clamped between
 * the neighboring slots to keep the scale monotonic), so the input color
 * itself is part of the ramp.
 *
 * @param base - The base OKLCH color
 * @param style - The palette style (square, triangle, circle, diamond)
 * @returns Array of 6 OKLCH colors ranging from dark to light
 */
export const generateTintsAndShades = (base: OKLCH, style: PaletteStyle): OKLCH[] => {
  const resolvedStyle = resolvePaletteStyle(style);
  const { h: hue, c: chroma, l: lightness } = base;
  
  // Generate 6 lightness steps from near black to near white
  const steps = 6;
  const results: OKLCH[] = [];

  // Base progression (0.02 to 0.98)
  const lightnessProgression = [
    0.02, // Abyss
    0.25, // Shadow
    0.38, // Medium dark
    0.62, // Medium light
    0.84, // Bright
    0.98  // White
  ];

  // The slot whose lightness is closest to the base color carries the base
  // color itself, so the input is always part of the scale
  const baseSlotIndex = lightnessProgression.reduce(
    (best, l, i) => (Math.abs(l - lightness) < Math.abs(lightnessProgression[best] - lightness) ? i : best),
    0
  );

  for (let i = 0; i < steps; i++) {
    if (i === baseSlotIndex) {
      // Clamp between the neighboring slots so the ramp stays monotonic
      const lower = lightnessProgression[i - 1] ?? OKLCH_LIMITS.l.min;
      const upper = lightnessProgression[i + 1] ?? OKLCH_LIMITS.l.max;
      const snappedL = Math.min(Math.max(lightness, lower), upper);
      results.push(clampOKLCH(snappedL, chroma, hue));
      continue;
    }

    const targetL = lightnessProgression[i];
    let newColor: OKLCH = { l: targetL, c: chroma, h: hue };

    switch (resolvedStyle) {
      case 'square':
        // Pure numerical consistency
        // No extra adjustments
        break;

      case 'triangle': {
        const lDelta = targetL - lightness;

        // Adjust chroma: Darker colors can handle more chroma, lighter ones less
        let chromaMult = 1.0;
        if (targetL < lightness) {
          chromaMult = 1.0 + Math.abs(lDelta) * 0.4;
        } else {
          chromaMult = Math.max(0.2, 1.0 - Math.abs(lDelta) * 0.8);
        }

        // Perceptual hue-drift compensation, modeled as smooth sinusoids of
        // hue instead of hard hue-range brackets:
        // - Bezold-Brücke: hues appear to drift as lightness changes; the
        //   drift peaks around yellow (~90°) and reverses around blue (~270°).
        // - Abney: desaturating a color also shifts its apparent hue,
        //   strongest around the red/cyan axis.
        const bezoldBrucke = clampShift(lDelta * Math.cos(((hue - 90) * Math.PI) / 180) * 4, 4);
        const chromaReduction = Math.max(0, 1 - chromaMult);
        const abney = clampShift(chromaReduction * Math.sin(((hue - 30) * Math.PI) / 180) * 15, 2);

        newColor.h = normalizeHue(hue + bezoldBrucke + abney);
        newColor.c = chroma * chromaMult;
        break;
      }

      case 'circle':
        // Chroma storytelling - dark=rich, light=ethereal
        // Create a chroma curve that peaks in shadows/mids and valleys in highlights
        const darkness = 1 - targetL;
        const chromaBoost = Math.pow(darkness, 1.5) * 0.8 + 0.2;
        const targetChroma = chroma * chromaBoost * 1.2;
        
        newColor.c = Math.max(0, Math.min(0.37, targetChroma));
        
        // Minimal hue adjustment for cohesion
        const circleHueShift = (targetL - 0.5) * 10; 
        newColor.h = normalizeHue(hue + circleHueShift);
        break;

      case 'diamond':
        // Tonal variations using simulated mixing
        // Instead of just changing L, we mix with "Black" or "White"
        // Since we are in OKLCH, we simulate this by desaturating towards the extremes
        
        if (targetL < lightness) {
          // Mixing with black: maintain some chroma but it drops off
          const shadeFactor = (lightness - targetL) / lightness; // 0 to 1
          newColor.c = lerp(shadeFactor, chroma, chroma * 0.5);
        } else {
          // Mixing with white: chroma drops off significantly
          const tintFactor = (targetL - lightness) / (1 - lightness); // 0 to 1
          newColor.c = lerp(tintFactor, chroma, 0);
        }
        break;
    }

    results.push(clampOKLCH(newColor.l, newColor.c, newColor.h));
  }

  return results;
};

/** Clamps a hue shift to ±maxDegrees. */
function clampShift(shift: number, maxDegrees: number): number {
  return Math.max(-maxDegrees, Math.min(maxDegrees, shift));
}
