import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this project at /Big-Picture/, not the domain root.
  // Local dev keeps serving from / so nothing changes day-to-day.
  base: process.env.GITHUB_PAGES ? '/Big-Picture/' : '/',
  server: {
    host: true,
    port: 5173,
  },
})
