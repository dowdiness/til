import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      /* Resolve path './src/hooks/useResize.ts' becomes '@/hooks/useResize.ts' */
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
