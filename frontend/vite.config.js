import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { routeRedirects } from './vite-plugin-routes.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Generate redirect HTML files for routes (production only)
    ...(mode === 'production' ? [routeRedirects()] : [])
  ],
  // GitHub Pages 部署在子路径 /Database_Final/ 下
  base: mode === 'production' ? '/Database_Final/' : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
}))
