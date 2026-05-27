import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  // SCSS files use `@use 'src/theme' as *;` — make that resolve via Sass loadPaths.
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        loadPaths: [repoRoot],
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    // Keep CRA's output directory so existing infra (Dockerfile, static
    // host mount) doesn't need to change.
    outDir: 'build',
    sourcemap: false,
  },
});
