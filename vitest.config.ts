import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.bench.ts'],
    testTimeout: 60000,
    hookTimeout: 20000,
  },
});
