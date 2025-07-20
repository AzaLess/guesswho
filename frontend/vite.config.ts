import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Добавляем типы Node для process
/// <reference types="node" />

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: isProd ? '/static/' : '/',
  plugins: [react()],
  server: {
    middlewareMode: false,
    proxy: {
      '/api': 'http://localhost:8000',
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        console.log(`[VITE] ${req.method} ${req.url}`)
        next()
      })
    }
  }
})
