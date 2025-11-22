import './style.css';
import { formatHex, formatCss, parse, oklch, interpolate } from 'culori';
import {
  ColorPaletteGenerator,
  type PaletteType,
  type PaletteStyle,
  type GeneratorOptions,
  type PaletteModifiers,
  type PaletteColor,
} from './index';
import { extendPalette, createPieChartSvg } from './utils/demo-palette';

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

        <label class="control control--small" style="--graduations: 8">
          <div class="range-wrapper">
            <input id="colorCount" class="control__input" type="range" min="3" max="24" value="6" />
            <i class="range-marker"></i>
          </div>
          <span class="control__label">
            <span class="control__label-text control__label-text--below">Color Count</span>
            <span class="control__label-value" id="countValue">6</span>
          </span>
        </label>

        <div class="control control--palette-type">
          <span class="control__label">
            <span class="control__label-text">Color Harmony</span>
            <span class="control__label-value" id="paletteTypeLabel">Triadic</span>
          </span>
          <div class="control control--small control--flip" style="--graduations: 5">
            <div class="range-wrapper range-wrapper--harmony" id="harmonyInterpolatorWrapper">
              <input id="harmonyInterpolator" class="control__input" type="range" min="0" max="100" value="50" step="0.1" />
              <i class="range-marker"></i>
            </div>
          </div>
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
              <input type="radio" name="paletteType" value="triadic" checked />
              <div class="palette-type-icon">
                <i style="--angle: 0deg"></i>
                <i style="--angle: 120deg"></i>
                <i style="--angle: 240deg"></i>
              </div>
              <span class="palette-type-name">Triadic</span>
            </label>

            <label class="palette-type-tab">
              <input type="radio" name="paletteType" value="splitComplementary" />
              <div class="palette-type-icon">
                <i style="--angle: 0deg"></i>
                <i style="--angle: 150deg"></i>
                <i style="--angle: 210deg"></i>
              </div>
              <span class="palette-type-name">Split Comp.</span>
            </label>

            <label class="palette-type-tab">
              <input type="radio" name="paletteType" value="complementary" />
              <div class="palette-type-icon">
                <i style="--angle: 0deg"></i>
                <i style="--angle: 180deg"></i>
              </div>
              <span class="palette-type-name">Complementary</span>
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
          <span class="control__label-text">
            Sine <svg class="control__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="M2 12c5-9 10-9 10 0s5 9 10 0" /></svg>
            /
            Zap <svg class="control__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="M4 12 l4 -6 l4 12 l4 -12 l4 6" /></svg>
          </span>
          <span class="control__label-value"><span id="mod1Value">0</span> / <span id="mod3Value">0</span></span>
        </span>
        <div id="gridControl1" class="grid-control">
          <div id="gridDot1" class="grid-control__dot"></div>
        </div>
      </div>

      <div class="control control--grid">
        <span class="control__label">
          <span class="control__label-text">
            Wave <svg class="control__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="M2 15c3-6 6-8 10-4s6 4 10-4" /></svg>
            /
            Block <svg class="control__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="M2 12 V5 H12 V19 H22 V12" /></svg>
          </span>
          <span class="control__label-value"><span id="mod2Value">0</span> / <span id="mod4Value">0</span></span>
        </span>
        <div id="gridControl2" class="grid-control">
          <div id="gridDot2" class="grid-control__dot"></div>
        </div>
      </div>
    </section>

    <section class="demo__palettes">
      <div id="palette" class="palette"></div>
      <div id="pieChart" class="pie-chart" style="width: 200px; height: 200px; margin: 2rem auto;"></div>
    </section>

    <div class="bg"></div>
  </div>
`;

const baseInput = document.querySelector<HTMLInputElement>('#baseColor')!;
const baseColorValue = document.querySelector<HTMLSpanElement>('#baseColorValue')!;
const paletteTypeRadios = document.querySelectorAll<HTMLInputElement>('input[name="paletteType"]')!;
const paletteTypeLabel = document.querySelector<HTMLSpanElement>('#paletteTypeLabel')!;
const harmonyInterpolator = document.querySelector<HTMLInputElement>('#harmonyInterpolator')!;

const PALETTE_TYPE_LABELS: Record<PaletteType, string> = {
  analogous: 'Analogous',
  complementary: 'Complementary',
  triadic: 'Triadic',
  tetradic: 'Tetradic',
  splitComplementary: 'Split Complementary',
};

const HARMONY_ORDER: PaletteType[] = [
  'analogous',
  'tetradic',
  'triadic',
  'splitComplementary',
  'complementary'
];

// Set random initial color
baseInput.value = randomHexColor();
const styleRadios = document.querySelectorAll<HTMLInputElement>('input[name="paletteStyle"]')!;
const styleLabel = document.querySelector<HTMLSpanElement>('#styleLabel')!;
const PALETTE_STYLE_LABELS: Record<PaletteStyle, string> = {
  square: 'Square',
  triangle: 'Triangle',
  circle: 'Circle',
  diamond: 'Diamond',
};
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
const pieChartContainer = document.querySelector<HTMLDivElement>('#pieChart')!;
const randomizeButton = document.querySelector<HTMLButtonElement>('#randomize')!;
const randomizeSettingsButton = document.querySelector<HTMLButtonElement>('#randomizeSettings')!;

let colorNameAbortController: AbortController | null = null;
let colorNameTimeout: number | null = null;

let faviconTimeout: number | null = null;
let nextFaviconSvg: string | null = null;

function updateFavicon(svg: string) {
  nextFaviconSvg = svg;
  if (faviconTimeout) return;
  
  faviconTimeout = window.setTimeout(() => {
    if (nextFaviconSvg) {
      const favicon = document.querySelector<HTMLLinkElement>('#favicon');
      if (favicon) {
        const encoded = encodeURIComponent(nextFaviconSvg);
        favicon.href = `data:image/svg+xml;charset=utf-8,${encoded}`;
      }
      nextFaviconSvg = null;
    }
    faviconTimeout = null;
  }, 500);
}

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
              'X-Referrer': 'pro-color-harmonies-demo',
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

function createGridInteractionHandler(
  gridElement: HTMLDivElement,
  updateModifiers: (x: number, y: number) => void,
) {
  const handleInteraction = (e: MouseEvent) => {
    const rect = gridElement.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    updateModifiers(x, y);
    updateGridDotPosition();
    renderPalette();
  };

  gridElement.addEventListener('mousedown', (e) => {
    handleInteraction(e);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleInteraction(moveEvent);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

createGridInteractionHandler(gridControl1, (x, y) => {
  mod1 = (x * 2 - 1) * 100;
  mod3 = ((1 - y) * 2 - 1) * 100;
});

createGridInteractionHandler(gridControl2, (x, y) => {
  mod2 = (x * 2 - 1) * 100;
  mod4 = ((1 - y) * 2 - 1) * 100;
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

function updateHarmonyProgress() {
  const min = Number.parseFloat(harmonyInterpolator.min);
  const max = Number.parseFloat(harmonyInterpolator.max);
  const value = Number.parseFloat(harmonyInterpolator.value);
  const progress = (value - min) / (max - min);
  const wrapper = document.querySelector('#harmonyInterpolatorWrapper');
  const marker = wrapper?.querySelector('.range-marker') as HTMLElement;
  if (marker) {
    marker.style.setProperty('--progress', String(progress));
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
  
  // Get interpolation value (0-1)
  const t = Number.parseFloat(harmonyInterpolator.value) / 100;
  
  // Determine active harmony for label and radio
  const segment = t * (HARMONY_ORDER.length - 1);
  const index = Math.round(segment);
  const activeHarmony = HARMONY_ORDER[index];
  
  // Update UI to reflect active harmony (without triggering events)
  const radioToCheck = document.querySelector<HTMLInputElement>(`input[name="paletteType"][value="${activeHarmony}"]`);
  if (radioToCheck && !radioToCheck.checked) {
    radioToCheck.checked = true;
    paletteTypeLabel.textContent = PALETTE_TYPE_LABELS[activeHarmony] || activeHarmony;
  }

  const style = (document.querySelector<HTMLInputElement>('input[name="paletteStyle"]:checked')?.value || 'triangle') as PaletteStyle;
  const count = Number.parseInt(countInput.value, 10) || 5;
  if (countValue) countValue.textContent = String(count);
  updateCountProgress();
  updateHarmonyProgress();
  const modifiers: PaletteModifiers = {
    sine: mod1 / 100,
    wave: mod2 / 100,
    zap: mod3 / 100,
    block: mod4 / 100,
  };

  if (mod1Value) mod1Value.textContent = String(modifiers.sine?.toFixed(2));
  if (mod2Value) mod2Value.textContent = String(modifiers.wave?.toFixed(2));
  if (mod3Value) mod3Value.textContent = String(modifiers.zap?.toFixed(2));
  if (mod4Value) mod4Value.textContent = String(modifiers.block?.toFixed(2));
  
  updateGridDotPosition();

  const options: GeneratorOptions = {
    style,
    modifiers,
  };

  try {
    const parsed = parse(baseColor);
    if (!parsed) {
      throw new Error('Invalid base color');
    }

    const baseOklch = oklch(parsed);
    const baseColorOKLCH = {
      l: baseOklch.l,
      c: baseOklch.c,
      h: baseOklch.h || 0,
    };

    // Generate all palettes
    const allPalettes = ColorPaletteGenerator.generateAll(baseColorOKLCH, options);
    
    // Interpolate between palettes
    const lowerIndex = Math.floor(segment);
    const upperIndex = Math.min(lowerIndex + 1, HARMONY_ORDER.length - 1);
    const remainder = segment - lowerIndex;
    
    const palette1 = allPalettes[HARMONY_ORDER[lowerIndex]];
    const palette2 = allPalettes[HARMONY_ORDER[upperIndex]];
    
    const interpolatedPalette: PaletteColor[] = palette1.map((c1, i) => {
      const c2 = palette2[i];
      const color1 = { mode: 'oklch' as const, ...c1 };
      const color2 = { mode: 'oklch' as const, ...c2 };
      const interpolator = interpolate([color1, color2], 'oklch');
      const result = interpolator(remainder);
      return { l: result.l, c: result.c, h: result.h || 0 };
    });

    const palette = extendPalette(interpolatedPalette, count);
    
    // Convert OKLCH to CSS format
    const colors = palette.map(c => {
      const { l, c: chroma, h } = c;
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
      appElement.style.setProperty('--length', String(colors.length));
    }

    paletteContainer.innerHTML = palette
      .map((_, index) => {
        const cssColor = colors[index];
        return `
          <div
            class="swatch"
            style="--color: ${cssColor}"
          >
            <div class="swatch__meta">
              <span class="swatch__index">${index + 1}</span>
              <span class="swatch__value">${cssColor}</span>
            </div>
          </div>
        `;
      })
      .join('');

    if (pieChartContainer) {
      const svg = createPieChartSvg(colors);
      pieChartContainer.innerHTML = svg;
      updateFavicon(svg);
    }

    const codeExample = document.querySelector<HTMLElement>('#codeexample');
    if (codeExample) {
      const modifiersString = Object.entries(modifiers)
        .filter(([_, value]) => value !== 0)
        .map(([key, value]) => `      ${key}: ${value?.toFixed(2)}`)
        .join(',\n');

      const modifiersSection = modifiersString 
        ? `,\n    modifiers: {\n${modifiersString}\n    }` 
        : '';

      codeExample.textContent = `import { ColorPaletteGenerator } from 'pro-color-harmonies';

// Interpolated palette (approximate)
const palette = ColorPaletteGenerator.generate(
  { l: ${Number(baseColorOKLCH.l).toFixed(3)}, c: ${Number(baseColorOKLCH.c).toFixed(3)}, h: ${Number(baseColorOKLCH.h).toFixed(3)} },
  '${activeHarmony}',
  {
    style: '${style}'${modifiersSection}
  }
);`;
    }
  } catch (error) {
    paletteContainer.innerHTML = `<div class="error">${String(error)}</div>`;
  }
}

baseInput.addEventListener('change', renderPalette);
baseInput.addEventListener('blur', renderPalette);
baseInput.addEventListener('input', renderPalette);
harmonyInterpolator.addEventListener('input', renderPalette);

paletteTypeRadios.forEach(radio => {
  const updateHarmony = () => {
    const type = radio.value as PaletteType;
    const index = HARMONY_ORDER.indexOf(type);
    if (index !== -1) {
      const value = (index / (HARMONY_ORDER.length - 1)) * 100;
      // Only update if the value is different (allows snapping back if slightly off)
      if (Math.abs(Number(harmonyInterpolator.value) - value) > 0.01) {
        harmonyInterpolator.value = String(value);
        paletteTypeLabel.textContent = PALETTE_TYPE_LABELS[type] || type;
        renderPalette();
      }
    }
  };

  radio.addEventListener('change', updateHarmony);
  radio.addEventListener('click', updateHarmony);
});
styleRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    styleLabel.textContent = PALETTE_STYLE_LABELS[radio.value as PaletteStyle] || radio.value;
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
  // Randomize palette type (via slider)
  const randomValue = Math.floor(Math.random() * 101);
  harmonyInterpolator.value = String(randomValue);
  
  // Randomize style
  const styles = ['square', 'triangle', 'circle', 'diamond'];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)] as PaletteStyle;
  const styleRadioToCheck = document.querySelector<HTMLInputElement>(`input[name="paletteStyle"][value="${randomStyle}"]`);
  if (styleRadioToCheck) {
    styleRadioToCheck.checked = true;
    styleLabel.textContent = PALETTE_STYLE_LABELS[randomStyle] || randomStyle;
  }
  
  // Randomize modifiers (-100 to 100 for all grids)
  mod1 = Math.floor(Math.random() * 201) - 100;
  mod2 = Math.floor(Math.random() * 201) - 100;
  mod3 = Math.floor(Math.random() * 201) - 100;
  mod4 = Math.floor(Math.random() * 201) - 100;
  
  renderPalette();
});

renderPalette();
