import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { normaliseBase } from './vite-base.js';

// Narrow Sass loadPaths to `src/` so module SCSS files `@use 'theme' as *;`
// without granting them access to every file in the repo root. A repo-root
// loadPath would let any partial resolve any sibling (e.g. `@use 'package'`
// hitting `package.json`'s SCSS-name collisions), which we want to avoid.
const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  // VITE_BASE env var is the primary knob for sub-path deploys. Vite
  // rewrites absolute /foo paths in both HTML and CSS — including the
  // @font-face URLs in src/theme.scss — to include this prefix.
  //
  // normaliseBase() tolerates the common operator footguns: `/sub` (missing
  // trailing /), `sub/` (missing leading /), unset (defaults to `/`).
  //
  // The `vite build --base=/sub/` CLI flag still overrides this value after
  // defineConfig returns — Vite merges CLI args into the resolved config.
  base: normaliseBase(process.env.VITE_BASE),
  plugins: [react()],
  // SCSS files use `@use 'theme' as *;` — Sass resolves that via the
  // src-narrowed loadPaths set above.
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        loadPaths: [srcRoot],
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
