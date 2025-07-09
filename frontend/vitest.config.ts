import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    css: true,
    reporter: ['verbose'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '*.config.*',
        'dist/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})