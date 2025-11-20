# Test Suite for Pro Palette

This directory contains comprehensive test coverage for the Pro Palette color palette generator library.

## Overview

The test suite covers:
- **Color Utilities** - OKLCH color space operations, clamping, normalization
- **Interpolation** - Linear interpolation, color interpolation, array spreading
- **Modifiers** - Sine, wave, zap, and block modifiers for palette variations
- **Palette Generators** - All 5 palette types across 4 style variations

## Test Files

### `src/utils/color.test.ts`
Tests for OKLCH color space utilities:
- `clampOKLCH()` - Clamping lightness, chroma, and hue values
- `normalizeHue()` - Hue normalization to 0-360 range
- `avoidMuddyZones()` - Muddy color zone avoidance

### `src/utils/interpolation.test.ts`
Tests for interpolation functions:
- `lerp()` - Linear interpolation between numbers
- `lerpOKLCH()` - OKLCH color interpolation with hue wrapping
- `scaleSpreadArray()` - Array spreading with custom fill functions

### `src/utils/modifiers.test.ts`
Tests for palette modification functions:
- `sineModifier()` - Sine wave-based modifications
- `waveModifier()` - Chaos-based wave modifications
- `zapModifier()` - Spiral-based modifications
- `blockModifier()` - Triangle wave modifications
- `applyModifiers()` - Sequential modifier application

### `src/color-palette-generator.test.ts`
Tests for the main palette generator:
- All 5 palette types (analogous, complementary, triadic, tetradic, splitComplementary)
- All 4 style variations (square, triangle, circle, diamond)
- Edge cases (extreme lightness, zero chroma, high chroma)
- All hue ranges (0-360°)
- Modifier application
- Option handling (chromaAdjust)

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite includes **81 tests** covering:
- ✅ Color space operations and clamping
- ✅ Interpolation and array manipulation
- ✅ All palette modifiers
- ✅ All 5 palette types × 4 styles = 20 combinations
- ✅ Edge cases and boundary conditions
- ✅ Option and modifier handling

## Key Test Patterns

### Testing Color Output
```typescript
const result = ColorPaletteGenerator.generate(baseColor, 'analogous', { style: 'square' });

expect(result).toHaveLength(6);
result.forEach(color => {
  expect(color).toHaveProperty('l');
  expect(color).toHaveProperty('c');
  expect(color).toHaveProperty('h');
});
```

### Testing Valid OKLCH Ranges
```typescript
result.forEach(color => {
  expect(color.l).toBeGreaterThanOrEqual(0);
  expect(color.l).toBeLessThanOrEqual(1);
  expect(color.c).toBeGreaterThanOrEqual(0);
  expect(color.h).toBeGreaterThanOrEqual(0);
  expect(color.h).toBeLessThan(360);
});
```

### Testing Style Variations
```typescript
styles.forEach(style => {
  const result = ColorPaletteGenerator.generate(baseColor, 'analogous', { style });
  expect(result).toHaveLength(6);
});
```

## Configuration

Tests are configured in `vitest.config.ts`:
- Node environment
- V8 coverage provider
- Text, JSON, and HTML coverage reports
- Excludes demo files and configs from coverage

## Notes

- Tests verify that the base color is preserved as the first color in all palettes
- Hue wrapping is tested to ensure shortest path interpolation
- Modifier tests verify that transformations maintain valid OKLCH values
- Edge cases test extreme lightness values and their handling
- Style variation tests ensure different styles produce different results
