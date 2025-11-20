/**
 * Palette modifiers that apply transformations to color palettes
 */

import type { PaletteColor } from '../color-palette-generator';
import { clampOKLCH } from './color';

export function sineModifier(palette: PaletteColor[], modifier: number): PaletteColor[] {
  const hueIntensity = modifier * 45;
  const lightnessIntensity = modifier * 0.15;

  return palette.map((color, idx) => {
    const wavePosition = (idx / Math.max(1, palette.length - 1)) * Math.PI * 2;
    const fundamental = Math.sin(wavePosition + modifier * 1);
    const harmonic = Math.sin(wavePosition * 2 + modifier * 0.5) * 0.3;
    const sineValue = fundamental + harmonic;

    const hueShift = sineValue * hueIntensity;
    const lightnessShift = Math.sin(wavePosition * 1.5 + modifier * 0.8) * lightnessIntensity;

    const { l, c, h } = color;

    return clampOKLCH(l + lightnessShift, c, h + hueShift);
  });
}

export function waveModifier(palette: PaletteColor[], modifier: number): PaletteColor[] {
  const chaosLevel = 2.0 + modifier * 1.2;
  const hueRange = modifier * 120;
  const lightnessRange = modifier * 0.35;

  return palette.map((color, idx) => {
    let x = 0.2 + (idx / Math.max(1, palette.length)) * 0.6 + Math.sin(idx * 0.7) * 0.15;

    for (let i = 0; i < 8; i++) {
      x = chaosLevel * x * (1 - x);
    }

    const smoothedX = x * 0.85 + 0.5 * 0.15;

    const hueShift = (smoothedX - 0.5) * hueRange;
    const lightnessShift = (smoothedX - 0.5) * lightnessRange;
    const chromaMultiplier = 0.4 + smoothedX * 1.2;

    const { l, c, h } = color;

    return clampOKLCH(l + lightnessShift, c * chromaMultiplier, h + hueShift);
  });
}

export function zapModifier(palette: PaletteColor[], modifier: number): PaletteColor[] {
  const spiralTightness = 0.2 + modifier * 1.0;
  const maxHueShift = modifier * 90;

  return palette.map((color, idx) => {
    const normalizedPos = idx / Math.max(1, palette.length - 1);
    const angle = normalizedPos * spiralTightness * Math.PI * 2;
    const radius = Math.sqrt(normalizedPos) * 2;

    const spiralX = Math.cos(angle) * radius;
    const spiralY = Math.sin(angle) * radius;

    const hueShift = spiralX * maxHueShift;
    const lightnessShift = spiralY * 0.12;
    const chromaShift = Math.sin(angle * 1.5) * 0.08;

    const { l, c, h } = color;

    return clampOKLCH(l + lightnessShift, c + chromaShift, h + hueShift);
  });
}

export function blockModifier(palette: PaletteColor[], modifier: number): PaletteColor[] {
  const lightnessAmplitude = modifier * 0.25;
  const hueAmplitude = modifier * 30;
  const chromaAmplitude = modifier * 0.1;

  return palette.map((color, idx) => {
    const frequency = Math.max(1, Math.floor(palette.length / 8));
    const wavePosition = (idx / Math.max(1, palette.length - 1)) * Math.PI * frequency;

    const rawTriangle = (2 / Math.PI) * Math.asin(Math.sin(wavePosition));
    const softTriangle = rawTriangle * (1 - Math.abs(rawTriangle) * 0.3);

    const lightnessShift = softTriangle * lightnessAmplitude;
    const hueShift = Math.sin(wavePosition + Math.PI * 0.25) * rawTriangle * hueAmplitude;
    const chromaShift = Math.cos(wavePosition + Math.PI * 0.5) * rawTriangle * chromaAmplitude;

    const { l, c, h } = color;

    return clampOKLCH(l + lightnessShift, c + chromaShift, h + hueShift);
  });
}

/**
 * Apply a series of modifiers to a palette
 */
export function applyModifiers(
  palette: PaletteColor[],
  modifiers: [number, number, number, number] | undefined,
): PaletteColor[] {
  if (!modifiers) return palette;

  const [m1, m2, m3, m4] = modifiers;
  let result = [...palette];

  if (m1) result = sineModifier(result, m1);
  if (m2) result = waveModifier(result, m2);
  if (m3) result = zapModifier(result, m3);
  if (m4) result = blockModifier(result, m4);

  return result;
}
