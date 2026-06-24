// eslint.config.cjs — Backend (Node.js CommonJS)
const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  // Configuración base JS recomendada
  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },
    rules: {
      // ── Calidad de código ──────────────────────────────────────────────────
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^next$' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',

      // ── Seguridad ──────────────────────────────────────────────────────────
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // ── Buenas prácticas ───────────────────────────────────────────────────
      'curly': ['error', 'all'],
      'no-throw-literal': 'error',
    },
  },

  // ── Configuración específica para archivos de TEST (Jest) ──────────────────
  // Los archivos de test usan globals propios de Jest/Supertest que ESLint
  // no conoce a menos que se declaren explícitamente aquí.
  {
    files: ['src/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,      // describe, it, test, expect, beforeEach, afterEach, etc.
      },
    },
    rules: {
      // En tests se permiten sentencias if de una línea sin llaves (common pattern)
      'curly': 'off',
      // En tests es normal tener variables que solo se usan en assertions
      'no-unused-vars': 'warn',
    },
  },

  // Excluir archivos generados
  {
    ignores: ['node_modules/**', 'prisma/migrations/**'],
  },
]
