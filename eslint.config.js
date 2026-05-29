// ESLint 9 flat config. Replaces the previous .eslintrc.json (which
// chained through prettier-standard → eslint-config-standard, a dead
// upstream that pinned us to ESLint 8). Layers, top-down:
//   - eslint:recommended baseline
//   - eslint-plugin-react recommended + new-JSX-transform (React 17+)
//   - eslint-config-prettier to disable formatting rules that would
//     conflict with prettier-as-a-rule below
//   - eslint-plugin-prettier as an actual lint rule so `yarn lint` fails
//     on formatting drift (same behaviour as before the migration)
//   - The project-specific code-style rules from the old .eslintrc.json

import js from '@eslint/js';
import react from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  { ignores: ['build/**', 'node_modules/**', '.yarn/**', '.pnp.*'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
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
    settings: { react: { version: 'detect' } },
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
      'react/prop-types': 'off',
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
