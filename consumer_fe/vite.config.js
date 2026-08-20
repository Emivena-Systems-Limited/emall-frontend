import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'API_'])
  const apiBaseUrl = env.API_BASE_URL ?? 'https://emall-backend-main-fnfxdk.laravel.cloud/api'

  return {
    envPrefix: ['VITE_', 'API_'],
    plugins: [
      react(),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['jspdf'],
    },
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl.replace(/\/api\/?$/, ''),
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
