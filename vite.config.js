import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        // Запрещаем Service Worker перехватывать навигацию по путям, которые не имеют точек (короткие ссылки)
        navigateFallbackDenylist: [/^\/[^.]+$/],
      },
      manifest: {
        name: 'Шорти.рф - Красивые короткие ссылки',
        short_name: 'Шорти.рф',
        description: 'Быстрый, современный и безопасный сервис для сокращения ссылок без рекламы.',
        theme_color: '#070709',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/short_url': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
