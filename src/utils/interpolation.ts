/**
 * Interpolation and array manipulation utilities
 */

import type { Color as CuloriColor } from 'culori';
import { oklab } from 'culori';

export type FillFunction<T> = T extends number
  ? (amt: number, from: T, to: T) => T
  : (amt: number, from: T | null, to: T | null) => T;

/**
 * Linearly interpolates between two values.
 */
export const lerp: FillFunction<number> = (amt, from, to) =>
  from + amt * (to - from);

/**
 * Interpolates between two Color objects
 */
export const lerpColor = (amt: number, from: CuloriColor, to: CuloriColor): CuloriColor => {
  const f = oklab(from);
  const t = oklab(to);
  return {
    mode: 'oklab',
    l: lerp(amt, f.l, t.l),
    a: lerp(amt, f.a, t.a),
    b: lerp(amt, f.b, t.b),
  } as CuloriColor;
};

/**
 * Scales and spreads an array to the target size using interpolation
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
  if (targetSize < 1 && padding > 0) {
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

  // Generate evenly spaced positions in the target array
  for (let i = 0; i < targetSize; i++) {
    // Generate normalized position (0-1)
    const t = targetSize === 1 ? 0.5 : i / (targetSize - 1);

    // Apply padding by adjusting t
    const adjustedT = domainStart + t * (domainEnd - domainStart);

    // Find the right segment for this position
    let segmentIndex = 0;
    const normalizedPositions: number[] = valuesToFill.map(
      (_, i) => i / (valuesToFill.length - 1)
    );

    for (let j = 1; j < normalizedPositions.length; j++) {
      const position = normalizedPositions[j];
      if (position !== undefined && adjustedT <= position) {
        segmentIndex = j - 1;
        break;
      }
      if (j === normalizedPositions.length - 1) {
        segmentIndex = j - 1;
      }
    }

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
