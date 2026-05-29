import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { normaliseBase } from './vite-base.js';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // Override at build time with `vite build --base=/sub/` (or set the
  // VITE_BASE env var, honoured below) for sub-path deploys. Vite rewrites
  // absolute /foo paths in both HTML and CSS — including the @font-face URLs
  // in src/theme.scss — to include this prefix.
  //
  // normaliseBase() tolerates the common operator footguns: `/sub` (missing
  // trailing /), `sub/` (missing leading /), unset (defaults to `/`).
  base: normaliseBase(process.env.VITE_BASE),
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
    // Vite defaults to esbuild for minification. Terser is slower but a
    // bit more aggressive on JS — saves ~1 kB gzipped on this bundle.
    minify: 'terser',
  },
});
