import './style.css';
import { formatHex, formatCss, oklch, oklab, interpolate } from 'culori';
import {
  ColorPaletteGenerator,
  type PaletteType,
  type PaletteStyle,
  type GeneratorOptions,
} from './color-palette-generator';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('#app container not found');
}

app.innerHTML = `
  <div class="demo">
    <h1 class="palette-title" id="paletteTitle"></h1>
    <section class="demo__controls">
      <div class="control control--combined">
        <!--header class="demo__header">
          <h1 class="demo__title">Pro Palette Demo</h1>
        </header-->

        <div class="control control--base-color">
          <label class="control">
            <span class="control__label">
              <span class="control__label-text">Base color</span>
              <span class="control__label-value" id="baseColorValue">#4c6fff</span>
            </span>
            <input id="baseColor" class="control__input control__input--color" type="color" value="#4c6fff" />
          </label>
          <button id="randomize" class="button" type="button">Random</button>
        </div>

        <label class="control control--small">
          <div class="range-wrapper">
            <input id="colorCount" class="control__input" type="range" min="3" max="24" value="6" />
            <i class="range-marker"></i>
          </div>
          <span class="control__label">
            <span class="control__label-text">Count</span>
            <span class="control__label-value" id="countValue">6</span>
          </span>
        </label>

        <div class="control control--palette-type">
          <span class="control__label">
            <span class="control__label-text">Palette type</span>
            <span class="control__label-value" id="paletteTypeLabel">Triadic</span>
          </span>
          <div class="palette-type-tabs">
            <label class="palette-type-tab">
              <input type="radio" name="paletteType" value="analogous" />
              <div class="palette-type-icon">
                <i style="--angle: 0deg"></i>
                <i style="--angle: 30deg"></i>
                <i style="--angle: 330deg"></i>
              </div>
              <span class="palette-type-name">Analogous</span>
            </label>

            <label class="palette-type-tab">
              <input type="radio" name="paletteType" value="complementary" />
              <div class="palette-type-icon">
                <i style="--angle: 0deg"></i>
                <i style="--angle: 180deg"></i>
              </div>
              <span class="palette-type-name">Complementary</span>
            </label>

            <label class="palette-type-tab">
              <input type="radio" name="paletteType" value="triadic" checked />
              <div class="palette-type-icon">
                <i style="--angle: 0deg"></i>
                <i style="--angle: 120deg"></i>
                <i style="--angle: 240deg"></i>
              </div>
              <span class="palette-type-name">Triadic</span>
            </label>

            <label class="palette-type-tab">
              <input type="radio" name="paletteType" value="tetradic" />
              <div class="palette-type-icon">
                <i style="--angle: 0deg"></i>
                <i style="--angle: 90deg"></i>
                <i style="--angle: 180deg"></i>
                <i style="--angle: 270deg"></i>
              </div>
              <span class="palette-type-name">Tetradic</span>
            </label>

            <label class="palette-type-tab">
              <input type="radio" name="paletteType" value="split-complementary" />
              <div class="palette-type-icon">
                <i style="--angle: 0deg"></i>
                <i style="--angle: 150deg"></i>
                <i style="--angle: 210deg"></i>
              </div>
              <span class="palette-type-name">Split Comp.</span>
            </label>
          </div>
        </div>

        <div class="control control--style">
          <div class="style-tabs">
            <label class="style-tab">
              <input type="radio" name="paletteStyle" value="square" />
              <div class="style-icon style-icon--square"></div>
              <span class="style-name">Square</span>
            </label>

            <label class="style-tab">
              <input type="radio" name="paletteStyle" value="triangle" checked />
              <div class="style-icon style-icon--triangle">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="50,20 85,80 15,80" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" />
                </svg>
              </div>
              <span class="style-name">Triangle</span>
            </label>

            <label class="style-tab">
              <input type="radio" name="paletteStyle" value="circle" />
              <div class="style-icon style-icon--circle"></div>
              <span class="style-name">Circle</span>
            </label>

            <label class="style-tab">
              <input type="radio" name="paletteStyle" value="diamond" />
              <div class="style-icon style-icon--diamond"></div>
              <span class="style-name">Diamond</span>
            </label>
          </div>
          <span class="control__label">
            <span class="control__label-text">Style</span>
            <span class="control__label-value" id="styleLabel">Triangle</span>
          </span>
        </div>


        <button id="randomizeSettings" class="button button--last" type="button">Random settings</button>
      </div>

      <div class="control control--grid">
        <span class="control__label">
          <span class="control__label-text">Sine / Zap</span>
          <span class="control__label-value"><span id="mod1Value">0</span> / <span id="mod3Value">0</span></span>
        </span>
        <div id="gridControl1" class="grid-control">
          <div id="gridDot1" class="grid-control__dot"></div>
        </div>
      </div>

      <div class="control control--grid">
        <span class="control__label">
          <span class="control__label-text">Wave / Block</span>
          <span class="control__label-value"><span id="mod2Value">0</span> / <span id="mod4Value">0</span></span>
        </span>
        <div id="gridControl2" class="grid-control">
          <div id="gridDot2" class="grid-control__dot"></div>
        </div>
      </div>
    </section>

    <section class="demo__palettes">
      <div id="palette" class="palette"></div>
    </section>
  </div>
`;

const baseInput = document.querySelector<HTMLInputElement>('#baseColor')!;
const baseColorValue = document.querySelector<HTMLSpanElement>('#baseColorValue')!;
const paletteTypeRadios = document.querySelectorAll<HTMLInputElement>('input[name="paletteType"]')!;
const paletteTypeLabel = document.querySelector<HTMLSpanElement>('#paletteTypeLabel')!;

// Set random initial color
baseInput.value = randomHexColor();
const styleRadios = document.querySelectorAll<HTMLInputElement>('input[name="paletteStyle"]')!;
const styleLabel = document.querySelector<HTMLSpanElement>('#styleLabel')!;
const countInput = document.querySelector<HTMLInputElement>('#colorCount')!;
const countValue = document.querySelector<HTMLSpanElement>('#countValue')!;
const mod1Value = document.querySelector<HTMLSpanElement>('#mod1Value')!;
const mod2Value = document.querySelector<HTMLSpanElement>('#mod2Value')!;
const mod3Value = document.querySelector<HTMLSpanElement>('#mod3Value')!;
const mod4Value = document.querySelector<HTMLSpanElement>('#mod4Value')!;
const gridControl1 = document.querySelector<HTMLDivElement>('#gridControl1')!;
const gridDot1 = document.querySelector<HTMLDivElement>('#gridDot1')!;
const gridControl2 = document.querySelector<HTMLDivElement>('#gridControl2')!;
const gridDot2 = document.querySelector<HTMLDivElement>('#gridDot2')!;

let mod1 = 0;
let mod2 = 0;
let mod3 = 0;
let mod4 = 0;
const paletteContainer = document.querySelector<HTMLDivElement>('#palette')!;
const randomizeButton = document.querySelector<HTMLButtonElement>('#randomize')!;
const randomizeSettingsButton = document.querySelector<HTMLButtonElement>('#randomizeSettings')!;

let colorNameAbortController: AbortController | null = null;
let colorNameTimeout: number | null = null;

const getColorNames = async (colors: string[]) => {
  // Cancel any pending request
  if (colorNameAbortController) {
    colorNameAbortController.abort();
  }
  
  // Clear any pending timeout
  if (colorNameTimeout !== null) {
    clearTimeout(colorNameTimeout);
  }
  
  // Create new abort controller for this request
  colorNameAbortController = new AbortController();
  
  // Throttle the API call
  return new Promise<any>((resolve, reject) => {
    colorNameTimeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.color.pizza/v1/?values=${colors.map(color => color.replace('#', '')).join(',')}&list=bestOf&noduplicates=true`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ colors }),
            signal: colorNameAbortController!.signal,
          }
        );
        const data = await response.json();
        resolve(data);
      } catch (error) {
        // Don't reject on abort, just silently fail
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        reject(error);
      }
    }, 100); // 100ms throttle
  });
}

function randomHexColor(): string {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, '0')}`;
}

function paletteToGradientStops(colors: string[]): string {
  return colors.join(', ');
}

function paletteToHardStops(colors: string[]): string {
  const step = 100 / colors.length;
  return colors
    .map((color, index) => {
      const start = (index * step).toFixed(2);
      const end = ((index + 1) * step).toFixed(2);
      return `${color} ${start}%, ${color} ${end}%`;
    })
    .join(', ');
}

function colorsToHex(colors: string[]): string[] {
  return colors.map(color => formatHex(color) || color);
}

function updateGridDotPosition() {
  // Grid 1: Sine (X) / Zap (Y)
  const x1 = ((mod1 / 100 + 1) / 2) * 100;
  const y1 = ((1 - (mod3 / 100 + 1) / 2)) * 100;
  gridDot1.style.left = `${x1}%`;
  gridDot1.style.top = `${y1}%`;
  
  // Grid 2: Wave (X) / Block (Y)
  const x2 = ((mod2 / 100 + 1) / 2) * 100;
  const y2 = ((1 - (mod4 / 100 + 1) / 2)) * 100;
  gridDot2.style.left = `${x2}%`;
  gridDot2.style.top = `${y2}%`;
}

function handleGrid1Interaction(e: MouseEvent) {
  const rect = gridControl1.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
  
  mod1 = (x * 2 - 1) * 100;
  mod3 = ((1 - y) * 2 - 1) * 100;
  
  updateGridDotPosition();
  renderPalette();
}

function handleGrid2Interaction(e: MouseEvent) {
  const rect = gridControl2.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
  
  mod2 = (x * 2 - 1) * 100;
  mod4 = ((1 - y) * 2 - 1) * 100;
  
  updateGridDotPosition();
  renderPalette();
}

gridControl1.addEventListener('mousedown', (e) => {
  handleGrid1Interaction(e);
  
  const onMouseMove = (e: MouseEvent) => {
    handleGrid1Interaction(e);
  };
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

gridControl2.addEventListener('mousedown', (e) => {
  handleGrid2Interaction(e);
  
  const onMouseMove = (e: MouseEvent) => {
    handleGrid2Interaction(e);
  };
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function updateCountProgress() {
  const min = Number.parseInt(countInput.min, 10);
  const max = Number.parseInt(countInput.max, 10);
  const value = Number.parseInt(countInput.value, 10);
  const progress = (value - min) / (max - min);
  const rangeMarker = document.querySelector<HTMLElement>('.range-marker');
  if (rangeMarker) {
    rangeMarker.style.setProperty('--progress', String(progress));
  }
}

function updateBaseColorValue() {
  if (baseColorValue) {
    baseColorValue.textContent = baseInput.value.toUpperCase();
  }
}

function renderPalette() {
  const baseColor = baseInput.value.trim();
  updateBaseColorValue();
  const paletteType = (document.querySelector<HTMLInputElement>('input[name="paletteType"]:checked')?.value || 'triadic') as PaletteType;
  const style = (document.querySelector<HTMLInputElement>('input[name="paletteStyle"]:checked')?.value || 'triangle') as PaletteStyle;
  const count = Number.parseInt(countInput.value, 10) || 5;
  if (countValue) countValue.textContent = String(count);
  updateCountProgress();
  const modifiers: [number, number, number, number] = [
    mod1 / 100,
    mod2 / 100,
    mod3 / 100,
    mod4 / 100,
  ];

  if (mod1Value) mod1Value.textContent = String(modifiers[0].toFixed(2));
  if (mod2Value) mod2Value.textContent = String(modifiers[1].toFixed(2));
  if (mod3Value) mod3Value.textContent = String(modifiers[2].toFixed(2));
  if (mod4Value) mod4Value.textContent = String(modifiers[3].toFixed(2));
  
  updateGridDotPosition();

  const options: GeneratorOptions = {
    style,
    colorSpace: { space: 'oklch' },
    modifiers,
  };

  try {
    const basePalette = ColorPaletteGenerator.generate(baseColor, paletteType, options);
    
    // Spread or reduce palette to match desired count
    let palette: typeof basePalette;
    if (count <= basePalette.length) {
      // Remove colors: evenly distribute which ones to keep
      const step = basePalette.length / count;
      palette = Array.from({ length: count }, (_, i) => {
        const index = Math.min(Math.floor(i * step), basePalette.length - 1);
        return basePalette[index];
      });
    } else {
      // Spread colors: interpolate between existing colors using OKLAB
      palette = [];
      
      // Convert base palette OKLCH to culori OKLCH colors, then to OKLAB for interpolation
      const baseColors = basePalette.map(p => {
        const oklchColor = oklch({ mode: 'oklch', l: p.color.l, c: p.color.c, h: p.color.h });
        return oklab(oklchColor);
      });
      
      // Create interpolator in OKLAB space
      const interpolator = interpolate(baseColors, 'oklab');
      
      for (let i = 0; i < count; i++) {
        // Map index to 0-1 range across the palette
        const t = i / (count - 1);
        const interpolatedColor = interpolator(t);
        
        // Convert back to OKLCH for consistency
        const oklchColor = oklch(interpolatedColor);
        
        palette.push({
          code: `${paletteType}-${i + 1}`,
          isBase: i === 0 || i === count - 1,
          color: {
            l: oklchColor.l,
            c: oklchColor.c,
            h: oklchColor.h || 0,
          },
        });
      }
    }
    
    // Convert OKLCH to CSS format
    const colors = palette.map(c => {
      const { l, c: chroma, h } = c.color;
      // Convert to Culori OKLCH format for CSS output
      return formatCss(oklch({ mode: 'oklch', l, c: chroma, h }));
    });

    // Console log colors as hex
    console.log('Colors (hex):', colorsToHex(colors));

    // get names and update palette title
    getColorNames(colorsToHex(colors)).then(data => {
      if (data) {
        console.log('Color names:', data.paletteTitle);
        const paletteTitleElement = document.querySelector<HTMLHeadingElement>('#paletteTitle');
        if (paletteTitleElement) {
          paletteTitleElement.textContent = data.paletteTitle;
        }
      }
    }).catch(error => {
      // Silently handle errors (including aborted requests)
      console.debug('Color names request failed:', error);
    });

    // Set gradient custom properties on app element
    const appElement = document.querySelector<HTMLDivElement>('#app');
    if (appElement) {
      appElement.style.setProperty('--grad', paletteToGradientStops(colors));
      appElement.style.setProperty('--grad-stops', paletteToHardStops(colors));
    }

    paletteContainer.innerHTML = palette
      .map((p, index) => {
        const cssColor = colors[index];
        return `
          <div
            class="swatch${p.isBase ? ' swatch--base' : ''}"
            style="--color: ${cssColor}"
          >
            <div class="swatch__meta">
              <span class="swatch__index">${index + 1}</span>
              <span class="swatch__code">${p.code}</span>
              <span class="swatch__value">${cssColor}</span>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (error) {
    paletteContainer.innerHTML = `<div class="error">${String(error)}</div>`;
  }
}

baseInput.addEventListener('change', renderPalette);
baseInput.addEventListener('blur', renderPalette);
baseInput.addEventListener('input', renderPalette);
paletteTypeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const labels: Record<string, string> = {
      'analogous': 'Analogous',
      'complementary': 'Complementary',
      'triadic': 'Triadic',
      'tetradic': 'Tetradic',
      'split-complementary': 'Split Complementary'
    };
    paletteTypeLabel.textContent = labels[radio.value] || radio.value;
    renderPalette();
  });
});
styleRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const labels: Record<string, string> = {
      'square': 'Square',
      'triangle': 'Triangle',
      'circle': 'Circle',
      'diamond': 'Diamond'
    };
    styleLabel.textContent = labels[radio.value] || radio.value;
    renderPalette();
  });
});
countInput.addEventListener('change', renderPalette);
countInput.addEventListener('input', renderPalette);

randomizeButton.addEventListener('click', () => {
  const color = randomHexColor();
  baseInput.value = color;
  renderPalette();
});

randomizeSettingsButton.addEventListener('click', () => {
  // Randomize palette type
  const types = ['analogous', 'complementary', 'triadic', 'tetradic', 'split-complementary'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const radioToCheck = document.querySelector<HTMLInputElement>(`input[name="paletteType"][value="${randomType}"]`);
  if (radioToCheck) {
    radioToCheck.checked = true;
    const labels: Record<string, string> = {
      'analogous': 'Analogous',
      'complementary': 'Complementary',
      'triadic': 'Triadic',
      'tetradic': 'Tetradic',
      'split-complementary': 'Split Complementary'
    };
    paletteTypeLabel.textContent = labels[randomType] || randomType;
  }
  
  // Randomize style
  const styles = ['square', 'triangle', 'circle', 'diamond'];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const styleRadioToCheck = document.querySelector<HTMLInputElement>(`input[name="paletteStyle"][value="${randomStyle}"]`);
  if (styleRadioToCheck) {
    styleRadioToCheck.checked = true;
    const styleLabels: Record<string, string> = {
      'square': 'Square',
      'triangle': 'Triangle',
      'circle': 'Circle',
      'diamond': 'Diamond'
    };
    styleLabel.textContent = styleLabels[randomStyle] || randomStyle;
  }
  
  // Randomize modifiers (-100 to 100 for all grids)
  mod1 = Math.floor(Math.random() * 201) - 100;
  mod2 = Math.floor(Math.random() * 201) - 100;
  mod3 = Math.floor(Math.random() * 201) - 100;
  mod4 = Math.floor(Math.random() * 201) - 100;
  
  renderPalette();
});

renderPalette();
