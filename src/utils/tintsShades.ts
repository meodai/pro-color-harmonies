import { normalizeHue, clampOKLCH } from './color';
import { lerp } from './interpolation';
import type { OKLCH, PaletteStyle } from '../index';

/**
 * Generates a 12-step lightness scale (tints and shades) for a single color.
 * Applies different perceptual strategies based on the selected style.
 * 
 * @param base - The base OKLCH color
 * @param style - The palette style (square, triangle, circle, diamond)
 * @returns Array of 12 OKLCH colors ranging from dark to light
 */
export const generateTintsAndShades = (base: OKLCH, style: PaletteStyle): OKLCH[] => {
  const { h: hue, c: chroma, l: lightness } = base;
  
  // Generate 6 lightness steps from near black to near white
  // We ensure the base lightness is included or approximated in the scale
  const steps = 6;
  const results: OKLCH[] = [];
  
  // Base progression (0.02 to 0.98) - Reduced to 6 steps
  const lightnessProgression = [
    0.02, // Abyss
    0.25, // Shadow
    0.38, // Medium dark
    0.62, // Medium light
    0.84, // Bright
    0.98  // White
  ];

  // Find the closest step to the base lightness to potentially replace it
  // or adjust the curve to pass through it. For simplicity in this implementation,
  // we'll generate the scale and then ensure the base color is represented if needed,
  // but strictly following the progression often yields better scales.
  
  for (let i = 0; i < steps; i++) {
    const targetL = lightnessProgression[i];
    let newColor: OKLCH = { l: targetL, c: chroma, h: hue };

    switch (style) {
      case 'square':
        // Pure numerical consistency
        // No extra adjustments
        break;

      case 'triangle':
        // Perceptual compensation for Bezold-Brücke effect
        // Hues appear to shift as lightness changes
        const lDelta = targetL - lightness;
        const hueShift = getBezoldBruckeCompensation(hue, lDelta);
        
        // Adjust chroma: Darker colors can handle more chroma, lighter ones less
        let chromaMult = 1.0;
        if (targetL < lightness) {
          chromaMult = 1.0 + Math.abs(lDelta) * 0.4;
        } else {
          chromaMult = Math.max(0.2, 1.0 - Math.abs(lDelta) * 0.8);
        }
        
        newColor.h = normalizeHue(hue + hueShift);
        newColor.c = chroma * chromaMult;
        break;

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

/**
 * Calculates the Bezold-Brücke shift compensation.
 * Adjusts hue based on lightness changes to maintain perceptual hue constancy.
 */
function getBezoldBruckeCompensation(hue: number, lightnessDelta: number): number {
  let shift = 0;
  
  if (hue >= 220 && hue <= 280) {
    // Blues shift toward red when darker
    shift = lightnessDelta * -8;
  } else if (hue >= 60 && hue <= 90) {
    // Yellows shift toward green when darker
    shift = lightnessDelta * -5;
  } else if ((hue >= 0 && hue <= 30) || hue >= 330) {
    // Reds shift toward yellow when lighter
    shift = lightnessDelta * 3;
  } else if (hue >= 150 && hue <= 200) {
    // Cyans shift toward blue when darker
    shift = lightnessDelta * -4;
  }
  
  return shift;
}
