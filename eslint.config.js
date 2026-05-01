import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: [
      'src/services/**/*.ts',
      'src/tasks/**/*.ts',
      'src/infra/**/*.ts',
      'src/engines/**/*.ts',
      'src/utils/**/*.ts',
      'src/ast/**/*.ts',
      'src/core/**/*.ts',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrors: 'none', destructuredArrayIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrors: 'none', destructuredArrayIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'no-console': 'warn',
    },
  },
  {
    files: ['tests/**/*.ts', 'scripts/**/*.mjs', 'src/cli/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '.spine/', '*.js', '*.cjs'],
  },
);
