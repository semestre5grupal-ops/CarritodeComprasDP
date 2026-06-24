/**
 * jest.config.js — Configuración de Jest para el Backend (Node.js + Express)
 *
 * - testEnvironment: node → Usa el entorno de Node.js (no jsdom)
 * - setupFilesAfterFramework: Carga variables de entorno de .env.test antes de los tests
 * - coverageDirectory: Directorio donde se generan los reportes de cobertura
 * - collectCoverageFrom: Define qué archivos se incluyen en el análisis de cobertura
 */

module.exports = {
  testEnvironment: 'node',

  // Cargar configuración de entorno de prueba
  setupFiles: ['dotenv/config'],

  // Patrón para encontrar archivos de test
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/*.spec.js',
  ],

  // Variables de entorno para los tests (sobrescriben .env)
  testEnvironmentOptions: {
    env: {
      NODE_ENV: 'test',
    },
  },

  // Reporte de cobertura
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',      // Excluir el servidor principal
    '!src/config/**',     // Excluir configuración
  ],

  // Variables de entorno de proceso para tests
  setupFiles: ['<rootDir>/src/__tests__/setup.js'],

  // Timeout para pruebas de integración (en ms)
  testTimeout: 30000,

  // Mostrar nombre de cada test mientras corre
  verbose: true,
}
