import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.js'],
    // Source-only tests for now — reducers, helpers, config normalisation.
    // Component/integration tests can be added under src/**/__tests__ later.
    include: ['src/**/*.test.js', 'src/**/*.test.jsx', '*.test.js'],
  },
});
