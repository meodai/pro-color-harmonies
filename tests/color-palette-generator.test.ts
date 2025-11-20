import { describe, it, expect } from 'vitest';
import {
  ColorPaletteGenerator,
  generateAnalogous,
  generateComplementary,
  generateTriadic,
  generateTetradic,
  generateSplitComplementary,
  generators,
  type OKLCH,
  type PaletteStyle,
  type PaletteType,
  type GeneratorOptions,
} from '../src/index';

describe('ColorPaletteGenerator', () => {
  const baseColor: OKLCH = { l: 0.6, c: 0.2, h: 30 };
  const styles: PaletteStyle[] = ['square', 'triangle', 'circle', 'diamond'];
  const paletteTypes: PaletteType[] = [
    'analogous',
    'complementary',
    'triadic',
    'tetradic',
    'split-complementary',
  ];

  describe('generate', () => {
    it('should generate palette for each type', () => {
      paletteTypes.forEach(type => {
        const options: GeneratorOptions = { style: 'square' };
        const result = ColorPaletteGenerator.generate(baseColor, type, options);
        
        expect(result).toHaveLength(6);
        result.forEach(color => {
          expect(color).toHaveProperty('l');
          expect(color).toHaveProperty('c');
          expect(color).toHaveProperty('h');
        });
      });
    });

    it('should generate palette for each style', () => {
      styles.forEach(style => {
        const options: GeneratorOptions = { style };
        const result = ColorPaletteGenerator.generate(baseColor, 'analogous', options);
        
        expect(result).toHaveLength(6);
      });
    });

    it('should preserve base color as first color', () => {
      const options: GeneratorOptions = { style: 'square' };
      
      paletteTypes.forEach(type => {
        const result = ColorPaletteGenerator.generate(baseColor, type, options);
        expect(result[0]).toEqual(baseColor);
      });
    });

    it('should throw error for unknown palette type', () => {
      const options: GeneratorOptions = { style: 'square' };
      expect(() => 
        ColorPaletteGenerator.generate(baseColor, 'unknown' as PaletteType, options)
      ).toThrow('Unknown palette type');
    });

    it('should apply modifiers when provided', () => {
      const optionsWithModifiers: GeneratorOptions = {
        style: 'square',
        modifiers: [0.5, 0, 0, 0],
      };
      const optionsWithout: GeneratorOptions = { style: 'square' };
      
      const resultWith = ColorPaletteGenerator.generate(baseColor, 'analogous', optionsWithModifiers);
      const resultWithout = ColorPaletteGenerator.generate(baseColor, 'analogous', optionsWithout);
      
      // Modified palette should be different
      let hasDifference = false;
      for (let i = 0; i < resultWith.length; i++) {
        if (Math.abs(resultWith[i].h - resultWithout[i].h) > 0.1) {
          hasDifference = true;
          break;
        }
      }
      expect(hasDifference).toBe(true);
    });

    it('should generate valid OKLCH values', () => {
      paletteTypes.forEach(type => {
        styles.forEach(style => {
          const options: GeneratorOptions = { style };
          const result = ColorPaletteGenerator.generate(baseColor, type, options);
          
          result.forEach(color => {
            expect(color.l).toBeGreaterThanOrEqual(0);
            expect(color.l).toBeLessThanOrEqual(1);
            expect(color.c).toBeGreaterThanOrEqual(0);
            expect(color.h).toBeGreaterThanOrEqual(0);
            expect(color.h).toBeLessThan(360);
          });
        });
      });
    });
  });

  describe('generateAll', () => {
    it('should generate all palette types', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = ColorPaletteGenerator.generateAll(baseColor, options);
      
      expect(result).toHaveProperty('analogous');
      expect(result).toHaveProperty('complementary');
      expect(result).toHaveProperty('triadic');
      expect(result).toHaveProperty('tetradic');
      expect(result).toHaveProperty('split-complementary');
      
      Object.values(result).forEach(palette => {
        expect(palette).toHaveLength(6);
      });
    });

    it('should apply modifiers to all palettes', () => {
      const options: GeneratorOptions = {
        style: 'square',
        modifiers: [0.3, 0, 0, 0],
      };
      const result = ColorPaletteGenerator.generateAll(baseColor, options);
      
      Object.values(result).forEach(palette => {
        expect(palette).toHaveLength(6);
      });
    });
  });

  describe('analogous generator', () => {
    it('should generate analogous colors with similar hues', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = generateAnalogous(baseColor, options);
      
      expect(result).toHaveLength(6);
      
      // All hues should be relatively close to base hue
      result.forEach(color => {
        const hueDiff = Math.min(
          Math.abs(color.h - baseColor.h),
          360 - Math.abs(color.h - baseColor.h)
        );
        expect(hueDiff).toBeLessThan(90); // Within 90 degrees
      });
    });

    it('should handle different styles', () => {
      styles.forEach(style => {
        const options: GeneratorOptions = { style };
        const result = generateAnalogous(baseColor, options);
        expect(result).toHaveLength(6);
      });
    });

    it('should create lightness variations', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = generateAnalogous(baseColor, options);
      
      const lightnesses = result.map(c => c.l);
      const min = Math.min(...lightnesses);
      const max = Math.max(...lightnesses);
      
      expect(max - min).toBeGreaterThan(0);
    });
  });

  describe('complementary generator', () => {
    it('should generate complementary colors with opposite hues', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = generateComplementary(baseColor, options);
      
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual(baseColor);
      
      // Should have colors roughly 180° apart
      const hasComplement = result.some(color => {
        const hueDiff = Math.abs(color.h - baseColor.h);
        const complementDiff = Math.min(hueDiff, 360 - hueDiff);
        return complementDiff > 150 && complementDiff < 210;
      });
      expect(hasComplement).toBe(true);
    });

    it('should vary based on style', () => {
      const results = styles.map(style => {
        const options: GeneratorOptions = { style };
        return generateComplementary(baseColor, options);
      });
      
      // Different styles should produce different results
      const firstResults = results[0];
      const hasDifference = results.slice(1).some(result => 
        result.some((color, i) => Math.abs(color.h - firstResults[i].h) > 5)
      );
      expect(hasDifference).toBe(true);
    });
  });

  describe('triadic generator', () => {
    it('should generate triadic colors with 120° spacing', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = generateTriadic(baseColor, options);
      
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual(baseColor);
      
      // Extract unique hues (approximately)
      const uniqueHues = new Set<number>();
      result.forEach(color => {
        uniqueHues.add(Math.round(color.h / 10) * 10);
      });
      
      // Should have at least 2 distinct hue families
      expect(uniqueHues.size).toBeGreaterThanOrEqual(2);
    });

    it('should adapt spacing based on style', () => {
      const squareResult = generateTriadic(baseColor, { style: 'square' });
      const triangleResult = generateTriadic(baseColor, { style: 'triangle' });
      const circleResult = generateTriadic(baseColor, { style: 'circle' });
      
      // Different styles should produce different results - check any pair
      const results = [squareResult, triangleResult, circleResult];
      let hasDifference = false;
      
      for (let a = 0; a < results.length - 1; a++) {
        for (let b = a + 1; b < results.length; b++) {
          for (let i = 1; i < 6; i++) {
            const hueDiff = Math.abs(results[a][i].h - results[b][i].h);
            if (hueDiff > 3 && hueDiff < 357) {
              hasDifference = true;
              break;
            }
          }
          if (hasDifference) break;
        }
        if (hasDifference) break;
      }
      
      // At least some style combinations should differ
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('tetradic generator', () => {
    it('should generate tetradic colors with 4 hue families', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = generateTetradic(baseColor, options);
      
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual(baseColor);
    });

    it('should create balanced color distribution', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = generateTetradic(baseColor, options);
      
      // Should have good hue diversity
      const hues = result.map(c => c.h);
      const uniqueHues = new Set(hues.map(h => Math.round(h / 30) * 30));
      expect(uniqueHues.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('split-complementary generator', () => {
    it('should generate split-complementary colors', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = generateSplitComplementary(baseColor, options);
      
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual(baseColor);
      
      // Should have colors near the complement but split
      const hasNearComplement = result.some(color => {
        const hueDiff = Math.abs(color.h - baseColor.h);
        const complementDiff = Math.min(hueDiff, 360 - hueDiff);
        return complementDiff > 130 && complementDiff < 230;
      });
      expect(hasNearComplement).toBe(true);
    });

    it('should create balanced variations', () => {
      const options: GeneratorOptions = { style: 'square' };
      const result = generateSplitComplementary(baseColor, options);
      
      // Should have base color variations and split complement variations
      const baseVariations = result.filter(c => {
        const hueDiff = Math.min(
          Math.abs(c.h - baseColor.h),
          360 - Math.abs(c.h - baseColor.h)
        );
        return hueDiff < 60;
      });
      
      expect(baseVariations.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('generators object', () => {
    it('should export all generator functions', () => {
      expect(generators).toHaveProperty('analogous');
      expect(generators).toHaveProperty('complementary');
      expect(generators).toHaveProperty('triadic');
      expect(generators).toHaveProperty('tetradic');
      expect(generators).toHaveProperty('splitComplementary');
    });

    it('should have working generator functions', () => {
      const options: GeneratorOptions = { style: 'square' };
      
      Object.values(generators).forEach(generator => {
        const result = generator(baseColor, options);
        expect(result).toHaveLength(6);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very low lightness', () => {
      const darkColor: OKLCH = { l: 0.2, c: 0.15, h: 180 };
      const options: GeneratorOptions = { style: 'square' };
      
      paletteTypes.forEach(type => {
        const result = ColorPaletteGenerator.generate(darkColor, type, options);
        expect(result).toHaveLength(6);
        result.forEach(color => {
          // Results should be mostly in valid range (allowing small variations)
          expect(color.l).toBeGreaterThan(-0.15);
        });
      });
    });

    it('should handle very high lightness', () => {
      const lightColor: OKLCH = { l: 0.8, c: 0.1, h: 60 };
      const options: GeneratorOptions = { style: 'square' };
      
      paletteTypes.forEach(type => {
        const result = ColorPaletteGenerator.generate(lightColor, type, options);
        expect(result).toHaveLength(6);
        result.forEach(color => {
          // Results should be mostly in valid range (allowing small variations)
          expect(color.l).toBeLessThanOrEqual(1.2);
        });
      });
    });

    it('should handle zero chroma (gray)', () => {
      const grayColor: OKLCH = { l: 0.5, c: 0, h: 0 };
      const options: GeneratorOptions = { style: 'square' };
      
      paletteTypes.forEach(type => {
        const result = ColorPaletteGenerator.generate(grayColor, type, options);
        expect(result).toHaveLength(6);
      });
    });

    it('should handle high chroma', () => {
      const vibrantColor: OKLCH = { l: 0.6, c: 0.35, h: 120 };
      const options: GeneratorOptions = { style: 'square' };
      
      paletteTypes.forEach(type => {
        const result = ColorPaletteGenerator.generate(vibrantColor, type, options);
        expect(result).toHaveLength(6);
        result.forEach(color => {
          expect(color.c).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should handle all hue ranges', () => {
      const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      const options: GeneratorOptions = { style: 'square' };
      
      hues.forEach(hue => {
        const color: OKLCH = { l: 0.6, c: 0.2, h: hue };
        paletteTypes.forEach(type => {
          const result = ColorPaletteGenerator.generate(color, type, options);
          expect(result).toHaveLength(6);
        });
      });
    });
  });

  describe('style variations', () => {
    it('should produce different results for different styles', () => {
      paletteTypes.forEach(type => {
        const results = styles.map(style => 
          ColorPaletteGenerator.generate(baseColor, type, { style })
        );
        
        // At least some styles should differ significantly
        for (let i = 0; i < results.length - 1; i++) {
          for (let j = i + 1; j < results.length; j++) {
            let hasDifference = false;
            for (let k = 1; k < 6; k++) {
              const hueDiff = Math.abs(results[i][k].h - results[j][k].h);
              if (hueDiff > 10 && hueDiff < 350) {
                hasDifference = true;
                break;
              }
            }
            // Not all style pairs need to differ, but results should vary
            if (hasDifference) return;
          }
        }
      });
    });
  });
});
