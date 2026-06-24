import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  // ─── Optimización del Build (Clase 14 - Rendimiento) ─────────────────────
  build: {
    rollupOptions: {
      output: {
        // Code-splitting manual: separa dependencias de Vue en un chunk vendor.
        // Esto mejora el caching del navegador: el vendor solo se descarga
        // una vez y el navegador lo cachea entre actualizaciones del app.
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        },
      },
    },
    // Muestra advertencias para chunks > 500kB (buena práctica de rendimiento)
    chunkSizeWarningLimit: 500,
  },
  // ─── Vitest: Configuración de pruebas unitarias (Clase 14) ───────────────
  test: {
    // jsdom simula el entorno del navegador (DOM, localStorage, etc.)
    environment: 'jsdom',
    // Exponer globales de Vitest (describe, it, expect, vi) sin importarlos
    globals: true,
    // Archivo de setup que se ejecuta antes de todos los tests
    setupFiles: ['./src/__tests__/setup.js'],
    // Reporte de cobertura de código
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/models/**', 'src/services/**'],
      exclude: ['src/__tests__/**'],
    },
  },
})


