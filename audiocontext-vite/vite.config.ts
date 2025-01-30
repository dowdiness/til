/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  // vitest configs
  test: {
    css: true,
    reporters: ['default', 'html'],
    workspace: [
      {
        optimizeDeps: {
          include: ['react/jsx-dev-runtime'],
        },
        test: {
          name: 'browser',
          setupFiles: ['./tests/setup.browser.tsx'],
          include: ['!./**/*.server.test.{ts,tsx}', './**/*.browser.test.{ts,tsx}', './**/*.test.{ts,tsx}'],
          // includeSource: ['**/*.{js,ts}'],
          browser: {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['./**/*.server.test.{ts,tsx}', '!./**/*.browser.test.{ts,tsx}', './**/*.test.{ts,tsx}'],
          includeSource: ['**/*.{js,ts}'],
        },
      },
    ],
  },
  define: {
    // dead code elimination
    // https://vitest.dev/guide/in-source#production-build
    'import.meta.vitest': 'undefined',
  },
})
