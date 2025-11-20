# Pro Palette

A TypeScript color-harmony library and tiny demo built on top of [`culori`](https://github.com/Evercoder/culori). It generates perceptually-tuned OKLCH/OKLAB-based palettes from a single base color, with support for different harmony types, styles, interpolation, and four post-processing "modulator" knobs.

## Installation

```bash
npm install culori
```

This project is set up as a Vite+TS library; build output lives under `dist/` when you run `npm run build`.

## Library entry

Main entry point: `src/color-palette-generator.ts`.

The library is organized into modular utilities for better maintainability:

- `src/utils/color.ts` - OKLCH color space utilities (clamping, normalization, muddy zone avoidance)
- `src/utils/interpolation.ts` - Interpolation functions and array manipulation
- `src/utils/modifiers.ts` - Palette modifiers (sine, wave, zap, block)
- `src/utils/palette.ts` - Palette generation helpers and factory functions
- `src/utils/index.ts` - Central export point for all utilities

### Types

```ts
export type ColorSpace =
  | 'hex'
  | 'rgb'
  | 'hsl'
  | 'oklch'
  | 'oklab'
  | 'lch'
  | 'lab'
  | 'p3';

export type PaletteStyle = 'square' | 'triangle' | 'circle' | 'diamond';

export type PaletteType =
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary';

export interface PaletteColor {
  code: string;      // e.g. "triadic-1"
  isBase: boolean;   // true for the primary color
  color: CuloriColor;// culori Color object
}

export interface GeneratorOptions {
  style: PaletteStyle;
  colorSpace: { space: ColorSpace };
  chromaAdjust?: number;                  // fine-tune saturation response for some generators
  count?: number;                         // total colors requested (>= 5; extra colors are interpolated)
  modifiers?: [number, number, number, number]; // 4 modulation knobs, each 0–100
}
```

### Core class: `ColorPaletteGenerator`

#### `ColorPaletteGenerator.generate(baseColor, paletteType, options)`

Generate a single palette.

- **`baseColor`**: any culori-parsable color string (hex, `rgb(...)`, `oklch(...)`, etc.).
- **`paletteType`**: one of the five harmony types.
- **`options`**:
  - `style`: how the relationships are shaped perceptually:
    - `square` (mathematical): strict geometric relationships (e.g. exact +180° complements, +120°/+240° triads) with simple, symmetric lightness/chroma tweaks.
    - `triangle` (perceptual): bends angles and variations so the palette looks balanced, especially in tricky red/orange/yellow regions.
    - `circle` (emotional): uses hue bands and lightness bands to create more expressive, story-like shifts (fiery vs tranquil, etc.).
    - `diamond` (luminosity-aware): decisions are driven primarily by lightness + chroma so very light/dark bases still yield usable, UI-friendly palettes.
  - `colorSpace.space`: currently most generators work internally in OKLCH but you can request other output encodings via helper functions.
  - `count` (optional):
    - Generators always construct 5 base colors.
    - If `count > 5`, the library uses OKLAB interpolation to extend the palette smoothly with `scaleSpreadArray`/`extendPalette`.
  - `modifiers` (optional): `[sine, wave, zap, block]` (each `0–100`); see **Modifiers** below.

Returns: `PaletteColor[]`.

#### `ColorPaletteGenerator.generateAll(baseColor, options)`

Generate every palette type at once.

```ts
const all = ColorPaletteGenerator.generateAll('#4c6fff', {
  style: 'triangle',
  colorSpace: { space: 'oklch' },
  count: 9,
  modifiers: [10, 0, 0, 0],
});

// all.analogous, all.complementary, all.triadic, all.tetradic, all['split-complementary']
```

Each palette is run through the modifiers (if provided), just like `generate`.

#### `ColorPaletteGenerator.toCSS(palette, prefix?)`

Convert a palette to CSS custom properties.

- `prefix` default: `'color'`.
- Output example:

```css
--color-1: oklch(0.65 0.14 250);
--color-1-contrast: #000;
--color-2: oklch(0.52 0.18 260);
--color-2-contrast: #000;
/* ... */
```

#### `ColorPaletteGenerator.toHexArray(palette)`

Returns an array of sRGB hex values derived via `culori` (`rgb` + `formatRgb`).

#### `ColorPaletteGenerator.getPaletteInfo(palette)`

Returns:

```ts
{
  colors: string[];       // CSS color strings in OKLCH
  format: 'oklch';
  baseIndex: number;      // index of the base color in the palette
  contrastColors: string[];// currently '#000' placeholders
}
```

Useful for UI components that just need strings + a base-color index.

### Individual generators

All of these operate primarily in OKLCH, then wrap results into `PaletteColor[]`. They all respect `options.count` (>= 5) and use OKLAB interpolation for extra colors.

- `generateAnalogous(baseColor, options)`
  - Produces 5 base colors by walking the hue around the base within a band.
  - `style` affects the hue spread and how it avoids "muddy" zones in orange/yellow areas.

- `generateComplementary(baseColor, options)`
  - Calculates style-dependent complements (not just a rigid +180°), then builds 5 roles: base, main complement, dark base, light complement, muted complement.

- `generateTriadic(baseColor, options)`
  - Faithful port of the OG triadic logic.
  - Picks three hues based on style (mathematical, optical, adaptive, warm/cool).
  - Applies adaptive lightness/chroma variations so the three families balance even for very dark/light base colors.

- `generateTetradic(baseColor, options)`
  - 4-hue schemes (square, rectangle, adaptive, double-complement), expanded to 5 colors via light/dark variations.

- `generateSplitComplementary(baseColor, options)`
  - Base + two "split" complements around the opposite hue, plus extra dark/muted variants.

You can also import them via the `generators` export:

```ts
import { generators } from './src/color-palette-generator';

const tri = generators.triadic('#4c6fff', {
  style: 'triangle',
  colorSpace: { space: 'oklch' },
  count: 7,
});
```

### Modifiers (the four knobs)

These are post-processors that sculpt an existing palette. They work on `PaletteColor[]` and are controlled via the `modifiers` tuple in `GeneratorOptions`:

```ts
modifiers: [sine, wave, zap, block]; // each 0–100
```

Behind the scenes:

- `sineModifier` (knob 1 – "Sine")
  - Smooth sinusoidal pattern over index.
  - Shifts hue up to ~45° and lightness up to ~0.15.
  - Good for gentle, flowing variation.

- `waveModifier` (knob 2 – "Wave")
  - Uses a logistic (chaotic) map.
  - Produces irregular yet controlled changes to hue, lightness, and chroma.
  - Higher values = more complex, noisy structure.

- `zapModifier` (knob 3 – "Zap")
  - Walks colors along a spiral-like path, modulating hue (~90°), lightness, and chroma.
  - Feels more directional / energetic across the bar.

- `blockModifier` (knob 4 – "Block")
  - Soft triangular wave pattern.
  - Emphasizes stepped blocks of contrast in lightness and hue.

Ordering: modifiers are applied in sequence (`sine` → `wave` → `zap` → `block`), but any knob at `0` has no effect.

### Utility exports

- `isValidColor(color: string): boolean`
  - Thin wrapper around `culori.parse` to check parsability.

#### Internal utilities (src/utils/)

If you need direct access to the underlying utilities:

```ts
import { 
  normalizeHue, 
  createOklch, 
  avoidMuddyZones 
} from './src/utils/color';

import { 
  lerp, 
  lerpColor, 
  scaleSpreadArray 
} from './src/utils/interpolation';

import { 
  sineModifier, 
  waveModifier, 
  zapModifier, 
  blockModifier,
  applyModifiers 
} from './src/utils/modifiers';

import { 
  extendPalette, 
  colorFactory, 
  createPaletteGenerator 
} from './src/utils/palette';
```

These utilities are used internally by the generators but can be useful for custom palette generation or processing.

## Demo app

The demo lives in `src/main.ts` + `src/style.css` and is built with Vite.

- Start dev server:

```bash
cd /path/to/pro-palette
npm install
npm run dev
```

- Then open the printed `http://localhost:517x/` URL.

Controls:

- **Base color**: free text color input (hex, CSS color, etc.).
- **Palette type**: selects one of analogous / complementary / triadic / tetradic / split-complementary.
- **Style**: square / triangle / circle / diamond.
- **Count**: range 5–24; values > 5 use OKLAB interpolation between the 5 base colors.
- **Sine / Wave / Zap / Block**: the four 0–100 modulation sliders described above.
- **Random base**: chooses a random hex color.

The palette is displayed as a single flat bar of swatches with the base color outlined.

## Notes

- Generation logic operates mostly in OKLCH; interpolation for extended palettes is done in OKLAB for smoother transitions.
- The port is designed to be close to the original `color-palette-generator-main` behavior while exposing culori `Color` objects directly for integration into other tools.
