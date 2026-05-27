import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // The codebase predates the .jsx convention — JSX lives in plain .js files,
  // both during build (esbuild) and dep pre-bundling (optimizeDeps).
  plugins: [
    react({
      include: /\.(js|jsx)$/,
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(js|jsx)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  // SCSS uses `@import 'src/theme';` — make that resolve via Sass loadPaths.
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
    // Keep CRA's output directory so existing infra (Dockerfile, static host
    // mount) doesn't need to change.
    outDir: 'build',
    sourcemap: false,
  },
});
