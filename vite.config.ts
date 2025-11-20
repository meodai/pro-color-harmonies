import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ColorPaletteGenerator',
      fileName: (format) => `color-palette-generator.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Do not bundle culori; keep it as peer/extern if desired later
      external: ['culori'],
      output: {
        globals: {
          culori: 'culori',
        },
      },
    },
  },
});
