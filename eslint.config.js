// ESLint configuration for atlas-frontend (migrated to flat config for ESLint v9+)
import js from '@eslint/js';
import next from 'eslint-config-next';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  ...next,
  {
    ignores: [
      'node_modules/',
      '.next/',
      'dist/',
    ],
    rules: {
      // Add project-specific rules here
    },
  },
];
