import { defineConfig, globalIgnores } from 'eslint/config';

import js from '@eslint/js';
import { plugin as tsPlugin } from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import prettierPlugin from 'eslint-plugin-prettier';

import globals from 'globals';

export default defineConfig([
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha
      }
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      js,
      prettier: prettierPlugin
    },

    extends: [
      'js/recommended',
      '@typescript-eslint/recommended',
      '@typescript-eslint/eslint-recommended',
    ],

    rules: {
      'max-len': [
        'error',
        {
          code: 117
        }
      ],

      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true
        }
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],

      '@typescript-eslint/no-explicit-any': 'off',
    }
  },
  globalIgnores(['**/node_modules', '**/dist', '**/resources', '**/coverage'])
]);
