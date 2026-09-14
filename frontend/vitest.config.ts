import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Standalone config: the unit tests cover pure TypeScript modules, so they do
// not need the SvelteKit plugin or the dev-bridge middleware from vite.config.ts.
export default defineConfig({
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', '*.test.ts'],
  },
});
