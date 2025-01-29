/// <reference types="vitest/config" />

import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      /* Resolve path './app/hooks/useResize.ts' becomes '@/hooks/useResize.ts' */
      "@": path.resolve(__dirname, "./app"),
    },
  },
  // vitest configs
  test: {
    workspace: [{
      test: {
        name: 'browser',
        include: [
          '**/*.browser.test.{ts,tsx}',
          'tests/browser/**/*.{test,spec}.ts'
        ],
        browser: {
          enabled: true,
          // headless: true,
          provider: 'playwright',
          instances: [
            { browser: 'chromium' },
          ],
        },
      }
    },
    {
      test: {
        name: 'unit',
        include: [
          '**/*.unit.test.ts',
          'tests/unit/**/*.{test,spec}.ts'
        ],
        includeSource: ['**/*.{js,ts}'],
      }
    }],
    reporters: ['default', 'html'],
  },
  define: {
    // dead code elimination
    // https://vitest.dev/guide/in-source#production-build
    'import.meta.vitest': 'undefined',
  },
})
