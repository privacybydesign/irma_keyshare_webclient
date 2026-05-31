// ESLint 10 flat config. `eslint-plugin-react@7.37` doesn't support eslint
// 10 at runtime (the peer dep cap is real — the version-detection helper
// breaks), so this config uses the modular successor
// `@eslint-react/eslint-plugin`. The bundle's `recommended` preset works
// for plain JSX without requiring TypeScript type-checking.
//
// Layers, top-down:
//   - eslint:recommended baseline
//   - @eslint-react/eslint-plugin recommended (React + JSX rules)
//   - eslint-config-prettier to disable formatting rules that conflict
//     with prettier-as-a-rule below
//   - eslint-plugin-prettier as an actual lint rule so `yarn lint` fails
//     on formatting drift
//   - The project-specific code-style rules

import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  { ignores: ['build/**', 'node_modules/**', '.yarn/**', '.pnp.*'] },
  js.configs.recommended,
  eslintReact.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: { prettier: prettierPlugin },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'block-scoped-var': 'error',
      'consistent-return': 'error',
      'no-implicit-globals': 'error',
      'no-promise-executor-return': 'error',
      'no-script-url': 'error',
      'no-shadow': ['error', { builtinGlobals: true }],
      'no-unsafe-optional-chaining': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-var': 'error',
      'prefer-arrow-callback': ['error', { allowUnboundThis: false }],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'prettier/prettier': ['error', { singleQuote: true, printWidth: 120 }],
    },
  },
  {
    // Test files may import names that collide with browser globals
    // (testing-library exports `screen`, which shadows `window.screen`).
    files: ['**/*.test.js', '**/*.test.jsx', 'vitest.setup.js', 'vite-base.test.js'],
    rules: {
      'no-shadow': ['error', { builtinGlobals: false }],
    },
  },
];
