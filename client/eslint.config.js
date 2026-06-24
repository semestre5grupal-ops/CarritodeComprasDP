// eslint.config.js — Frontend (Vue 3 + ES Modules)
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  // Configuración base JS recomendada
  js.configs.recommended,

  // 'flat/essential' verifica SOLO errores reales de Vue 3
  // (en vez de 'flat/recommended' que incluye 1000+ reglas cosméticas de HTML)
  ...pluginVue.configs['flat/essential'],

  {
    files: ['**/*.{js,mjs,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // ── Calidad de código JavaScript ──────────────────────────────────────
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',

      // ── Reglas Vue esenciales ─────────────────────────────────────────────
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'vue/component-api-style': ['error', ['script-setup', 'composition']],

      // ── Desactivar reglas cosméticas de formato HTML ──────────────────────
      // (No son errores funcionales; son preferencias de estilo)
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/first-attribute-newline': 'off',
    },
  },

  // ── Configuración específica para archivos de TEST (Vitest) ───────────────
  {
    files: ['src/__tests__/**/*.{js,ts}', '**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Globals de Vitest (describe, it, expect, vi, beforeEach, afterEach)
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },

  // Excluir archivos generados
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]
