import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Добавляем типы Node для process
/// <reference types="node" />

const isProd = process.env.NODE_ENV === 'production';

// https://vite.dev/config/
export default defineConfig({
  base: isProd ? '/static/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
