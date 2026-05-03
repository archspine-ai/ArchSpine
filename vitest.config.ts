import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.bench.ts'],
    exclude: ['tests/e2e/**'],
    testTimeout: 60000,
    hookTimeout: 20000,
  },
});
