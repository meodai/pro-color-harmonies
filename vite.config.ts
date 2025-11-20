import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ColorPaletteGenerator',
      fileName: (format) => `pro-color-harmonies.${format}.js`,
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
