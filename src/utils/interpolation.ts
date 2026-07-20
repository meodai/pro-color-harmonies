/**
 * Interpolation and array manipulation utilities
 */

import type { Color as CuloriColor } from 'culori';
import { oklab } from 'culori';
import { normalizeHue } from './color';

export type FillFunction<T> = T extends number
  ? (amt: number, from: T, to: T) => T
  : (amt: number, from: T | null, to: T | null) => T;

/**
 * Linearly interpolates between two values.
 * @param amt - The interpolation amount (0-1)
 * @param from - The start value
 * @param to - The end value
 * @returns The interpolated value
 */
export const lerp: FillFunction<number> = (amt, from, to) =>
  from + amt * (to - from);

/**
 * Interpolates between two Color objects
 * @param amt - The interpolation amount (0-1)
 * @param from - The start color
 * @param to - The end color
 * @returns The interpolated color in OKLAB space
 */
export const lerpColor = (amt: number, from: CuloriColor, to: CuloriColor): CuloriColor => {
  const f = from.mode === 'oklab' ? from : oklab(from);
  const t = to.mode === 'oklab' ? to : oklab(to);
  return {
    mode: 'oklab',
    l: lerp(amt, f.l, t.l),
    a: lerp(amt, f.a, t.a),
    b: lerp(amt, f.b, t.b),
  } as CuloriColor;
};

/**
 * Interpolates between two OKLCH objects
 * @param amt - The interpolation amount (0-1)
 * @param from - The start OKLCH color
 * @param to - The end OKLCH color
 * @returns The interpolated OKLCH color
 */
export const lerpOKLCH = (amt: number, from: { l: number; c: number; h: number } | null, to: { l: number; c: number; h: number } | null): { l: number; c: number; h: number } => {
  // Handle null cases
  if (!from && !to) return { l: 0.5, c: 0, h: 0 };
  if (!from) return to!;
  if (!to) return from;
  
  // Handle hue interpolation (shortest path around the color wheel)
  let hDiff = to.h - from.h;
  if (hDiff > 180) hDiff -= 360;
  if (hDiff < -180) hDiff += 360;
  
  const h = from.h + amt * hDiff;
  
  return {
    l: lerp(amt, from.l, to.l),
    c: lerp(amt, from.c, to.c),
    h: normalizeHue(h),
  };
};

/**
 * Deeply interpolates between two objects or numbers.
 * @param start - The start value
 * @param end - The end value
 * @param amt - The interpolation amount (0-1)
 * @returns The interpolated value
 */
export const interpolateDeep = <T>(start: T, end: T, amt: number): T => {
  if (typeof start === 'number' && typeof end === 'number') {
    return lerp(amt, start, end) as unknown as T;
  }

  if (typeof start === 'object' && start !== null && typeof end === 'object' && end !== null) {
    if (Array.isArray(start) && Array.isArray(end)) {
      return start.map((val, i) => interpolateDeep(val, end[i], amt)) as unknown as T;
    }
    
    const result = {} as T;
    for (const key in start) {
      if (Object.prototype.hasOwnProperty.call(start, key)) {
        result[key] = interpolateDeep(start[key], end[key], amt);
      }
    }
    return result;
  }

  return start;
};

/**
 * Scales and spreads an array to the target size using interpolation
 * @param valuesToFill - The source array of values
 * @param targetSize - The desired length of the resulting array
 * @param padding - Optional padding to apply to the interpolation range (0-0.5)
 * @param fillFunction - The interpolation function to use
 * @returns The scaled array
 */
export const scaleSpreadArray = <T>(
  valuesToFill: T[],
  targetSize: number,
  padding = 0,
  fillFunction: FillFunction<T> = lerp as unknown as FillFunction<T>
): T[] => {
  // Validation checks
  if (!valuesToFill || valuesToFill.length < 2) {
    throw new Error("valuesToFill array must have at least two values.");
  }
  if (targetSize < 1) {
    throw new Error("Target size must be at least 1");
  }
  if (targetSize < valuesToFill.length && padding === 0) {
    throw new Error(
      "Target size must be greater than or equal to the valuesToFill array length."
    );
  }

  // For case without padding, use the original algorithm
  if (padding <= 0) {
    // Create a copy of the valuesToFill array and add null values to it if necessary
    const valuesToAdd = targetSize - valuesToFill.length;
    const chunkArray: T[][] = valuesToFill.map((value): T[] => [value]);

    for (let i = 0; i < valuesToAdd; i++) {
      const idx = i % (valuesToFill.length - 1);
      if (idx >= 0 && idx < chunkArray.length) {
        const chunk = chunkArray[idx];
        if (chunk) {
          chunk.push(null as unknown as T);
        }
      }
    }

    // Fill each chunk with interpolated values using the specified interpolation function
    for (let i = 0; i < chunkArray.length - 1; i++) {
      const currentChunk = chunkArray[i];
      const nextChunk = chunkArray[i + 1];

      if (!currentChunk || !nextChunk) {
        continue;
      }

      const currentValue = currentChunk[0];
      const nextValue = nextChunk[0];

      if (currentValue === undefined || nextValue === undefined) {
        continue;
      }

      for (let j = 1; j < currentChunk.length; j++) {
        const percent = j / currentChunk.length;
        currentChunk[j] = fillFunction(percent, currentValue, nextValue);
      }
    }

    return chunkArray.flat() as T[];
  }

  // Implement chroma.js style padding
  const result: T[] = [];

  // The padding essentially shifts the start and end of the normalized range
  const domainStart = padding;
  const domainEnd = 1 - padding;

  const normalizedPositions: number[] = valuesToFill.map(
    (_, i) => i / (valuesToFill.length - 1)
  );

  let lastSegmentIndex = 0;

  // Generate evenly spaced positions in the target array
  for (let i = 0; i < targetSize; i++) {
    // Generate normalized position (0-1)
    const t = targetSize === 1 ? 0.5 : i / (targetSize - 1);

    // Apply padding by adjusting t
    const adjustedT = domainStart + t * (domainEnd - domainStart);

    // Find the right segment for this position
    let segmentIndex = lastSegmentIndex;

    for (let j = lastSegmentIndex + 1; j < normalizedPositions.length; j++) {
      const position = normalizedPositions[j];
      if (position !== undefined && adjustedT <= position) {
        segmentIndex = j - 1;
        break;
      }
      if (j === normalizedPositions.length - 1) {
        segmentIndex = j - 1;
      }
    }
    
    lastSegmentIndex = segmentIndex;

    // Ensure segment index is valid
    segmentIndex = Math.min(Math.max(0, segmentIndex), valuesToFill.length - 2);

    // Get the segment boundaries in normalized space
    const segmentStart = normalizedPositions[segmentIndex] || 0;
    const segmentEnd = normalizedPositions[segmentIndex + 1] || 1;

    // Calculate relative position within segment (0-1)
    let segmentT = 0;
    if (segmentEnd > segmentStart) {
      segmentT = (adjustedT - segmentStart) / (segmentEnd - segmentStart);
    }

    // Get the values from the segments, with null checks
    const fromValue = valuesToFill[segmentIndex];
    const toValue = valuesToFill[segmentIndex + 1];

    if (fromValue === undefined || toValue === undefined) {
      throw new Error(`Invalid segment values at index ${segmentIndex}`);
    }

    // Get the interpolated value from the correct segment
    const value = fillFunction(segmentT, fromValue, toValue);

    result.push(value);
  }

  return result;
};
