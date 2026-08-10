import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

/**
 * ESLint del backend.
 *
 * No existia ninguna configuracion propia, asi que ESLint subia hasta la raiz
 * del repositorio, encontraba alli el `eslint.config.js` del frontend --que
 * ignora `backend/**`-- y terminaba con "all of the files matching the glob
 * pattern are ignored". El script `npm run lint` nunca analizo una sola linea,
 * y el CI lo ocultaba ejecutandolo con `|| true`.
 */
export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'prisma/**', 'eslint.config.js'],
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      // `any` se usa a proposito en los DTO dinamicos y en los adaptadores de
      // Prisma; marcarlo como error enterraria los avisos que si importan.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
];
