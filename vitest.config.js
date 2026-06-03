import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // jsdom only enables localStorage when the document has a real origin.
    // Override the default 'about:blank' so window.localStorage is defined.
    environmentOptions: {
      jsdom: { url: 'http://localhost/' },
    },
    globals: false,
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', '*.test.js'],
  },
});
