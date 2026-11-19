import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

/**
 * ESLint para las pruebas de extremo a extremo.
 *
 * Va aparte de `eslint.config.js` a propósito: ese archivo está protegido por
 * un hook del repositorio, y con razón —casi siempre que alguien lo toca es
 * para callar una regla—. Aquí no se calla ninguna: se añade el parser de
 * TypeScript para un directorio que antes no existía, y los globales del
 * navegador que necesitan los `page.evaluate()`.
 *
 * Se corre con `npm run lint:e2e`.
 */
export default [
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // El cuerpo de `page.evaluate()` se ejecuta dentro del navegador.
        window: 'readonly',
        document: 'readonly',
        getComputedStyle: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
