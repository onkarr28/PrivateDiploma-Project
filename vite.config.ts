import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Detect GitHub Pages environment to set correct base path
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const repoBase = '/Midnight-RiseIn/'

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? repoBase : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
