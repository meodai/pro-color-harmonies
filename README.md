# Pro Color Harmonies

[![Tests](https://github.com/meodai/pro-color-harmonies/actions/workflows/test.yml/badge.svg)](https://github.com/meodai/pro-color-harmonies/actions/workflows/test.yml)
[![Deploy Demo](https://github.com/meodai/pro-color-harmonies/actions/workflows/deploy.yml/badge.svg)](https://github.com/meodai/pro-color-harmonies/actions/workflows/deploy.yml)

A dependency free TypeScript color-harmony library and tiny demo. The **core library** works purely in OKLCH data and generates perceptually-tuned palettes from a single base color, with support for different harmony types, styles, and four post-processing "modulator" knobs.

**[View Live Demo](https://meodai.github.io/pro-color-harmonies/)**

## Difference from Mathematical Color Harmonies

Standard color harmony libraries often rely on simple mathematical hue rotations in HSL or HSV space (e.g., Complementary = H + 180°, Triadic = H + 120°/240°). While mathematically correct, these often produce results that feel unbalanced or "muddy" to the human eye, especially in the yellow/orange/green regions.

Pro Palette takes a different approach, heavily leaning on the research and "magic numbers" developed by **@royalfig** (Ryan Feigenbaum) for [color-palette-generator](https://github.com/royalfig/color-palette-generator)

Key differences:

- **Perceptual Space**: All calculations happen in **OKLCH**, ensuring that changes in lightness and chroma are perceptually uniform.
- **Adaptive Variations**: Unlike static formulas (e.g., always keeping the same lightness), this library analyzes the base color (is it dark? light? vibrant?) and applies different strategies to ensure the resulting palette maintains usable contrast and harmony.
- **Muddy Zone Avoidance**: The library actively steers hues away from known "muddy" or unappealing zones (like certain dark yellows/browns) to ensure cleaner results.
- **Style-Based Logic**: Instead of just one "Triadic" formula, you get four distinct interpretations (`square`, `triangle`, `circle`, `diamond`), each with its own logic for balancing visual weight and emotional feel.
- **Narrative & Hierarchy**: It applies concepts like "Chroma Narratives" and "Color Hierarchy" to assign roles (protagonist, supporting, etc.) to colors, rather than treating them as equal data points.
- **Polishing**: A final pass ensures no color feels "dead" or "washed out" by subtly boosting chroma in mid-tones and warming up highlights, mimicking how painters adjust colors for vibrancy.
- **Modifiers**: It includes four unique post-processing algorithms (Sine, Wave, Zap, Block) that add organic variation and texture to the palette, simulating natural lighting or artistic shifts.

### Adaptive Variations & Thresholds

One of the biggest flaws in standard color generation is that a formula that works for a mid-tone red often fails for a dark navy blue.

Pro Palette solves this by using **threshold-based logic**. It checks if your base color falls into specific ranges (e.g., "Dark" if Lightness < 0.3, "Light" if Lightness > 0.7) and changes the generation strategy accordingly.

- **Dark Base**: The library might generate lighter variations to ensure visibility.
- **Light Base**: It might generate darker, richer variations to provide grounding.

**Smooth Interpolation**:
Traditionally, threshold-based systems suffer from "jumps"—as you drag a lightness slider from 0.29 to 0.31, the entire palette might snap to a new configuration. Pro Palette solves this with **interpolation**. When your color is near a threshold, the library calculates both strategies and smoothly blends them. This gives you the best of both worlds: adaptive, intelligent palettes with buttery-smooth transitions.

## Installation

```bash
npm install pro-color-harmonies
```

## Quick Start

Works in both Node.js and browsers (core has no DOM dependencies).

```ts
import { ColorPaletteGenerator } from 'pro-color-harmonies';

const palette = ColorPaletteGenerator.generate(
  { l: 0.7, c: 0.12, h: 200 }, // Base color (OKLCH)
  'triadic',
  { style: 'triangle' }
);

console.log(palette); 
// Returns array of 6 OKLCH colors: [{ l: ..., c: ..., h: ... }, ...]
```

## Usage via CDN / UMD

If you are using the library via a script tag (e.g. from a CDN like jsDelivr or unpkg), the library exposes a global variable `ColorPaletteGenerator`.

**Note:** The global variable contains all named exports. To access the main class, you need to access the `ColorPaletteGenerator` property *on* the global object.

```html
<script src="https://cdn.jsdelivr.net/npm/pro-color-harmonies/dist/pro-color-harmonies.umd.js"></script>
<script>
  // Access the class from the global namespace
  const Generator = window.ColorPaletteGenerator.ColorPaletteGenerator;
  
  const palette = Generator.generate(
    { l: 0.7, c: 0.12, h: 200 },
    'triadic',
    { style: 'triangle' }
  );
  
  console.log(palette);
</script>
```

## Library entry

Main entry point: `src/index.ts`.

The library is organized into modular utilities for better maintainability:

- `src/utils/color.ts` - OKLCH color space utilities (clamping, normalization, muddy zone avoidance)
- `src/utils/hue-strategies.ts` - Hue calculation strategies for different palette styles
- `src/utils/interpolation.ts` - Interpolation functions and array manipulation
- `src/utils/modifiers.ts` - Palette modifiers (sine, wave, zap, block)
- `src/utils/enhancer.ts` - Post-processing logic for chroma narratives and color hierarchy
- `src/utils/palette.ts` - Palette generation helpers and factory functions (no `culori`)
- `src/utils/variations.ts` - Adaptive variation logic for Triadic palettes
- `src/utils/demo-palette.ts` - Demo-only helpers that use `culori` for interpolation (`extendPalette`)
- `src/utils/index.ts` - Central export point for all **core** utilities

### Types

```ts
export type PaletteStyle = 'default' | 'square' | 'triangle' | 'circle' | 'diamond';

export type PaletteType =
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'splitComplementary'
  | 'tintsShades';

export interface OKLCH {
  l: number;  // Lightness (0-1)
  c: number;  // Chroma (0-0.37)
  h: number;  // Hue (0-360)
}

export type PaletteColor = OKLCH;

export interface PaletteModifiers {
  sine?: number;
  wave?: number;
  zap?: number;
  block?: number;
}

export interface GeneratorOptions {
  style: PaletteStyle;
  modifiers?: PaletteModifiers;           // 4 modulation knobs, each 0–1
  interpolation?: boolean;                // Smooth transitions (default: true)
}
```

### Core class: `ColorPaletteGenerator`

#### `ColorPaletteGenerator.generate(baseColor, paletteType, options)`

Generate a single palette.

- **`baseColor`**: an `OKLCH` object `{ l, c, h }`.
- **`paletteType`**: one of the five harmony types.
- **`options`**:
  - `style`: how the relationships are shaped perceptually:
    - `default` (square alias): behaves identically to `square` style.
    - `square` (mathematical): strict geometric relationships (e.g. exact +180° complements, +120°/+240° triads) with simple, symmetric lightness/chroma tweaks.
    - `triangle` (perceptual): bends angles and variations so the palette looks balanced, especially in tricky red/orange/yellow regions. Applies **Chroma Narratives** to create visual weight distribution.
    - `circle` (emotional): uses hue bands and lightness bands to create more expressive, story-like shifts (fiery vs tranquil, etc.). Applies **Color Hierarchy** to assign roles like "protagonist" or "supporting".
    - `diamond` (luminosity-aware): decisions are driven primarily by lightness + chroma so very light/dark bases still yield usable, UI-friendly palettes.
  - `interpolation` (optional, default: `true`): whether to smooth out transitions between different variation states (e.g. lightness thresholds). When enabled, prevents abrupt jumps in the palette as the base color changes.
  - **Note**: Generators always construct **6 base colors** internally. To create palettes with different counts, you can:
    - For fewer colors (< 6): sample evenly from the base palette.
    - For more colors (> 6): interpolate between the 6 OKLCH colors (the demo shows one approach using `culori` in `utils/demo-palette.ts`).
  - `modifiers` (optional): `{ sine, wave, zap, block }` (each `0–1`); see **Modifiers** below.

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
  modifiers: { sine: 0.1 },
});

// all.analogous, all.complementary, all.triadic, all.tetradic, all.splitComplementary, all.tintsShades
```

Each palette is run through the modifiers (if provided), just like `generate`.

### Individual generators

All of these operate in OKLCH and return `OKLCH[]`. Each generator produces exactly **6 base colors**.

```ts
import { generateAnalogous } from './src/index';

const palette = generateAnalogous({
  l: 0.7,
  c: 0.13,
  h: 260,
}, {
  style: 'triangle',
  modifiers: { sine: 0.1 },
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

- `generateTintsAndShades(baseColor, style)`
  - Generates a 6-step lightness scale (tints and shades) for a single color.
  - Applies different perceptual strategies based on the selected style (e.g., Bezold-Brücke shift for 'triangle', chroma curve for 'circle').
  - Returns 6 colors ranging from dark to light.

You can also import them via the `generators` export:

```ts
import { generators } from './src/index';

const tri = generators.triadic({
  l: 0.7,
  c: 0.13,
  h: 260,
}, {
  style: 'triangle',
});
```

### Modifiers (the four knobs)

These are post-processors that sculpt an existing palette. They work on `OKLCH[]` and are controlled via the `modifiers` object in `GeneratorOptions`:

```ts
modifiers: { sine: 0.5, wave: 0.2 }; // each 0–1
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

The library exposes all its internal utilities for custom palette generation. You can import them directly from the main package:

#### Color utilities

```ts
import { 
  OKLCH_LIMITS,        // Constants for valid OKLCH ranges
  clampOKLCH,          // Clamp OKLCH values to valid ranges
  normalizeHue,        // Normalize hue to 0-360 range
  avoidMuddyZones      // Adjust hues to avoid muddy color zones
} from 'pro-color-harmonies';
```

#### Hue strategy utilities

```ts
import { 
  getComplementaryHue,
  getAnalogousHues,
  getTriadicHues,
  getTetradicHues,
  getSplitComplementaryHues
} from 'pro-color-harmonies';
```

#### Interpolation utilities

```ts
import { 
  lerp,                // Linear interpolation between numbers
  lerpColor,           // Interpolate between culori colors in OKLAB
  lerpOKLCH,           // Interpolate between OKLCH colors
  scaleSpreadArray     // Spread/interpolate array to target size
} from 'pro-color-harmonies';
```

#### Modifiers

```ts
import { 
  sineModifier,        // Sine wave modulation
  waveModifier,        // Chaotic wave modulation
  zapModifier,         // Spiral modulation
  blockModifier,       // Triangle wave modulation
  applyModifiers       // Apply all modifiers in sequence
} from 'pro-color-harmonies';
```

#### Enhancer utilities

```ts
import { 
  enhancePalette,      // Apply chroma narratives and color hierarchy
  polishPalette        // Post-processing to prevent dead grays and boost vibrancy
} from 'pro-color-harmonies';
```

#### Palette utilities

```ts
import { 
  createPaletteGenerator   // Factory for creating palette generators (OKLCH in/out only)
} from 'pro-color-harmonies';
```

#### Variation utilities

```ts
import { 
  getTriadicVariations     // Adaptive variation logic for Triadic palettes
} from 'pro-color-harmonies';
```

#### Tints & Shades

```ts
import { 
  generateTintsAndShades   // Generate 6-step lightness scales
} from 'pro-color-harmonies';
```

## Development

### Demo App

The demo lives in `src/demo.ts` + `src/style.css` and is built with Vite. It wires the core OKLCH-based generator to real-world usage via `culori`.

**[View Live Demo](https://meodai.github.io/procolorharmonies/)**

To run locally:

```bash
npm install
npm run dev
```

Then open the printed `http://localhost:517x/` URL.

### Testing

The project includes comprehensive testing using Vitest:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

Tests are located in the `tests/` directory and cover:

- All 5 palette types (analogous, complementary, triadic, tetradic, splitComplementary)
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
- **Palette type**: selects one of analogous / complementary / triadic / tetradic / splitComplementary / tintsShades.
- **Style**: default / square / triangle / circle / diamond.
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
- This project heavily leans on the logic of [royalfig/color-palette-generator](https://github.com/royalfig/color-palette-generator) (the source for [colorpalette.pro](https://colorpalette.pro)). The codebase has been completely rewritten, modularized, and simplified to serve as a standalone, framework-agnostic library.
- **Why this library?** This version was created to make it easy to integrate Ryan's color logic into other tools, libraries, or generative art projects without dragging in heavy dependencies or UI-specific code.
- **Divergence**: While staying true to the original "magic numbers", this version introduces new features like **smooth interpolation** and **adaptive thresholds** to make the palettes more robust for programmatic use cases where inputs might vary continuously (e.g., generative art or interactive UIs).
