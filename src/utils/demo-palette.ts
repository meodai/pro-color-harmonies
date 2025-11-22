import { oklch, interpolate } from 'culori';
import type { OKLCH, PaletteColor } from '../index';

/**
 * Extends a palette to the desired count using interpolation.
 * Demo-only helper: lives outside the core generator to keep it OKLCH-only.
 */
export function extendPalette(
  basePalette: PaletteColor[],
  targetCount: number
): PaletteColor[] {
  if (targetCount <= basePalette.length) {
    const step = basePalette.length / targetCount;
    return Array.from({ length: targetCount }, (_, i) => {
      const index = Math.min(Math.floor(i * step), basePalette.length - 1);
      return basePalette[index];
    });
  }

  // For larger palettes, interpolate in OKLAB via culori (demo concern).
  const baseColors = basePalette.map((p: OKLCH) => {
    const oklchColor = oklch({ mode: 'oklch', l: p.l, c: p.c, h: p.h });
    return oklch(oklchColor);
  });

  const interpolator = interpolate(baseColors, 'oklab');

  const result: PaletteColor[] = [];
  for (let i = 0; i < targetCount; i++) {
    const t = targetCount === 1 ? 0 : i / (targetCount - 1);
    const interpolatedColor = interpolator(t);
    const oklchColor = oklch(interpolatedColor);

    result.push({
      l: oklchColor.l,
      c: oklchColor.c,
      h: oklchColor.h || 0,
    });
  }

  return result;
}

export function createPieChartSvg(colors: string[]): string {
  const radius = 50;
  const center = 50;
  const total = colors.length;
  const sliceAngle = (2 * Math.PI) / total;

  const paths = colors.map((color, index) => {
    // For a single color, return a full circle
    if (total === 1) {
      return `<circle cx="${center}" cy="${center}" r="${radius}" fill="${color}" />`;
    }

    const startAngle = index * sliceAngle - Math.PI / 2;
    const endAngle = (index + 1) * sliceAngle - Math.PI / 2;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    const d = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return `<path d="${d}" fill="${color}" stroke="none" /><circle cx="${center}" cy="${center}" r="${radius * 0.5}" fill="#fff" stroke-width="3" stroke="#000"/>`;
  });

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${paths.join('')}</svg>`;
}
