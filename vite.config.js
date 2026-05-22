import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, '/v1/messages'),
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/analyse': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
