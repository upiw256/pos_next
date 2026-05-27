import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      'next/server': path.resolve(__dirname, './test/mocks/next-server.ts'),
    },
    server: {
      deps: {
        inline: ['next-auth', 'mongoose'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', '.next/', 'vitest.config.ts', 'vitest.setup.ts'],
    },
  },
});
