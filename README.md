# Pro Palette

[![Tests](https://github.com/meodai/procolorharmonies/actions/workflows/test.yml/badge.svg)](https://github.com/meodai/procolorharmonies/actions/workflows/test.yml)
[![Deploy Demo](https://github.com/meodai/procolorharmonies/actions/workflows/deploy.yml/badge.svg)](https://github.com/meodai/procolorharmonies/actions/workflows/deploy.yml)

A TypeScript color-harmony library and tiny demo. The **core library** works purely in OKLCH data and generates perceptually-tuned palettes from a single base color, with support for different harmony types, styles, and four post-processing "modulator" knobs. The **demo app** uses [`culori`](https://github.com/Evercoder/culori) for parsing, interpolation, and CSS/hex formatting.

**[View Live Demo](https://meodai.github.io/procolorharmonies/)**

## Installation

```bash
npm install pro-palette culori
```

The library has `culori` as a peer dependency for OKLCH color space operations.

This project is set up as a Vite+TS library; build output lives under `dist/` when you run `npm run build`.

## Library entry

Main entry point: `src/color-palette-generator.ts`.

The library is organized into modular utilities for better maintainability:

- `src/utils/color.ts` - OKLCH color space utilities (clamping, normalization, muddy zone avoidance)
- `src/utils/interpolation.ts` - Interpolation functions and array manipulation
- `src/utils/modifiers.ts` - Palette modifiers (sine, wave, zap, block)
- `src/utils/palette.ts` - Palette generation helpers and factory functions (no `culori`)
- `src/utils/demo-palette.ts` - Demo-only helpers that use `culori` for interpolation (`extendPalette`)
- `src/utils/index.ts` - Central export point for all **core** utilities

### Types

```ts
export type PaletteStyle = 'square' | 'triangle' | 'circle' | 'diamond';

export type PaletteType =
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary';

export interface OKLCH {
  l: number;  // Lightness (0-1)
  c: number;  // Chroma (0-0.37)
  h: number;  // Hue (0-360)
}

export type PaletteColor = OKLCH;

export interface GeneratorOptions {
  style: PaletteStyle;
  chromaAdjust?: number;                  // fine-tune saturation response for some generators
  modifiers?: [number, number, number, number]; // 4 modulation knobs, each 0–1
}
```

### Core class: `ColorPaletteGenerator`

#### `ColorPaletteGenerator.generate(baseColor, paletteType, options)`

Generate a single palette.

- **`baseColor`**: an `OKLCH` object `{ l, c, h }`.
- **`paletteType`**: one of the five harmony types.
- **`options`**:
  - `style`: how the relationships are shaped perceptually:
    - `square` (mathematical): strict geometric relationships (e.g. exact +180° complements, +120°/+240° triads) with simple, symmetric lightness/chroma tweaks.
    - `triangle` (perceptual): bends angles and variations so the palette looks balanced, especially in tricky red/orange/yellow regions.
    - `circle` (emotional): uses hue bands and lightness bands to create more expressive, story-like shifts (fiery vs tranquil, etc.).
    - `diamond` (luminosity-aware): decisions are driven primarily by lightness + chroma so very light/dark bases still yield usable, UI-friendly palettes.
  - `chromaAdjust` (optional): fine-tune saturation response for some generators (default varies by generator).
  - **Note**: Generators always construct **6 base colors** internally. To create palettes with different counts, you can:
    - For fewer colors (< 6): sample evenly from the base palette.
    - For more colors (> 6): interpolate between the 6 OKLCH colors (the demo shows one approach using `culori` in `utils/demo-palette.ts`).
  - `modifiers` (optional): `[sine, wave, zap, block]` (each `0–1`); see **Modifiers** below.

Returns: `OKLCH[]` (array of OKLCH color objects with `{ l, c, h }` properties).

#### `ColorPaletteGenerator.generateAll(baseColor, options)`

Generate every palette type at once.

```ts
const all = ColorPaletteGenerator.generateAll({
  l: 0.7,
  c: 0.13,
  h: 260,
}, {
  style: 'triangle',
  modifiers: [0.1, 0, 0, 0],
});

// all.analogous, all.complementary, all.triadic, all.tetradic, all['split-complementary']
```

Each palette is run through the modifiers (if provided), just like `generate`.

### Individual generators

All of these operate in OKLCH and return `OKLCH[]`. Each generator produces exactly **6 base colors**.

```ts
import { generateAnalogous } from './src/color-palette-generator';

const palette = generateAnalogous({
  l: 0.7,
  c: 0.13,
  h: 260,
}, {
  style: 'triangle',
  modifiers: [0.1, 0, 0, 0],
});
// Returns: OKLCH[] with 6 colors
```

- `generateAnalogous(baseColor, options)`
  - Produces 6 base colors by walking the hue around the base within a band.
  - `style` affects the hue spread and how it avoids "muddy" zones in orange/yellow areas.

- `generateComplementary(baseColor, options)`
  - Calculates style-dependent complements (not just a rigid +180°), then builds 6 roles: base, main complement, dark base, light base, light complement, muted complement.

- `generateTriadic(baseColor, options)`
  - Faithful port of the OG triadic logic.
  - Picks three hues based on style (mathematical, optical, adaptive, warm/cool).
  - Applies adaptive lightness/chroma variations so the three families balance even for very dark/light base colors.
  - Produces 6 colors from the 3 triadic hues (2 base variations + 4 from the other triadic families).

- `generateTetradic(baseColor, options)`
  - 4-hue schemes (square, rectangle, adaptive, double-complement), expanded to 6 colors via light/dark variations.

- `generateSplitComplementary(baseColor, options)`
  - Base + two "split" complements around the opposite hue, plus extra dark/light/muted variants for a total of 6 colors.

You can also import them via the `generators` export:

```ts
import { generators } from './src/color-palette-generator';

const tri = generators.triadic({
  l: 0.7,
  c: 0.13,
  h: 260,
}, {
  style: 'triangle',
});
```

### Modifiers (the four knobs)

These are post-processors that sculpt an existing palette. They work on `OKLCH[]` and are controlled via the `modifiers` tuple in `GeneratorOptions`:

```ts
modifiers: [sine, wave, zap, block]; // each 0–1
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

The library exposes all its internal utilities for custom palette generation:

#### Color utilities (`src/utils/color.ts`)

```ts
import { 
  OKLCH_LIMITS,        // Constants for valid OKLCH ranges
  clampOKLCH,          // Clamp OKLCH values to valid ranges
  normalizeHue,        // Normalize hue to 0-360 range
  extractOKLCH,        // Extract OKLCH from culori color
  createOklch,         // Create culori OKLCH color with clamping
  avoidMuddyZones      // Adjust hues to avoid muddy color zones
} from './src/utils/color';
```

#### Interpolation utilities (`src/utils/interpolation.ts`)

```ts
import { 
  lerp,                // Linear interpolation between numbers
  lerpColor,           // Interpolate between culori colors in OKLAB
  lerpOKLCH,           // Interpolate between OKLCH colors
  scaleSpreadArray     // Spread/interpolate array to target size
} from './src/utils/interpolation';
```

#### Modifier utilities (`src/utils/modifiers.ts`)

```ts
import { 
  sineModifier,        // Sine wave modulation
  waveModifier,        // Chaotic wave modulation
  zapModifier,         // Spiral modulation
  blockModifier,       // Triangle wave modulation
  applyModifiers       // Apply all modifiers in sequence
} from './src/utils/modifiers';
```

#### Palette utilities (`src/utils/palette.ts`)

```ts
import { 
  createPaletteGenerator   // Factory for creating palette generators (OKLCH in/out only)
} from './src/utils/palette';
```

All utilities are also available via a single import:

```ts
import * as utils from './src/utils';
```

## Development

### Demo App

The demo lives in `src/main.ts` + `src/style.css` and is built with Vite. It wires the core OKLCH-based generator to real-world usage via `culori`.

**[View Live Demo](https://meodai.github.io/procolorharmonies/)**

To run locally:

```bash
npm install
npm run dev
```

Then open the printed `http://localhost:517x/` URL.

### Testing

The project includes comprehensive test coverage (88%+) using Vitest:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

Tests are located in the `tests/` directory and cover:
- All 5 palette types (analogous, complementary, triadic, tetradic, split-complementary)
- All 4 styles (square, triangle, circle, diamond)
- Color utilities and interpolation functions
- All palette modifiers
- Edge cases and boundary conditions

### Building

```bash
# Build the library
npm run build:lib

# Build the demo
npm run build:demo
```

Controls:

- **Base color**: free text color input (hex, CSS color, etc.).
- **Palette type**: selects one of analogous / complementary / triadic / tetradic / split-complementary.
- **Style**: square / triangle / circle / diamond.
- **Count**: range 3–24; the library generates 6 base OKLCH colors, then the demo:
  - For values < 6: evenly samples from the base palette
  - For values > 6: uses OKLAB interpolation (via `culori` in `src/utils/demo-palette.ts`) between the 6 base colors for smooth color transitions
- **Sine / Wave / Zap / Block**: the four 0–1 modulation sliders described above.
- **Random base**: chooses a random hex color.

The palette is displayed as a single flat bar of swatches.

## CI/CD

The project includes GitHub Actions workflows:

- **Tests**: Runs on every push and pull request, executes the test suite and generates coverage reports
- **Deploy Demo**: Automatically deploys the demo to GitHub Pages on every push to main

## Notes

- All palette generators produce exactly **6 base colors** internally.
- Generation logic operates in OKLCH for perceptually uniform color harmony.
- Palette colors are simple OKLCH objects (`{ l, c, h }`) without metadata like `code` or `isBase`.
- For extended palettes (> 6 colors), interpolate between OKLCH colors yourself, or reuse the demo's `extendPalette` (which uses `culori` and lives in `src/utils/demo-palette.ts`).
- For reduced palettes (< 6 colors), sample evenly from the base palette or use your own selection logic.
- The port is designed to be close to the original `color-palette-generator-main` behavior while exposing OKLCH colors directly for integration into other tools, with the core kept free of parsing/formatting concerns.
