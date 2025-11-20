/**
 * Constants used across the library
 */

export const OKLCH_LIMITS = {
  l: { min: 0.01, max: 0.99 },
  c: { min: 0, max: 0.37 },
  h: { min: 0, max: 360 },
};

export const MUDDY_ZONES = [
  { start: 60, end: 90, shift: -10 },   // Yellow-green (tends toward brown)
  { start: 30, end: 50, shift: 15 },    // Orange (can become muddy)
];
