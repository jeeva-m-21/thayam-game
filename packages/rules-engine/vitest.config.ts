import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 100,
        // Only enforce on moves.ts and engine.ts per AGENTS.md §4 Phase 1
      },
    },
  },
});
