import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    target: 'esnext',
    outDir: 'dist'
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['maia-chess-frontend.onrender.com']
  }
})