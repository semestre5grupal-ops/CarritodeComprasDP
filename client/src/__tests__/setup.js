/**
 * setup.js — Configuración global para los tests de Vitest (Frontend)
 *
 * Este archivo se ejecuta ANTES de todos los tests del cliente.
 * Configura mocks globales necesarios para el entorno jsdom.
 */

// Mock de localStorage (jsdom lo provee, pero nos aseguramos)
// Mock de vue-router para tests que no usan el router completo
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    currentRoute: { value: { path: '/' } },
  })),
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {},
  })),
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
  RouterLink: { template: '<a><slot /></a>' },
  RouterView: { template: '<div><slot /></div>' },
}))

// Mock de los servicios de IndexedDB (db.js)
vi.mock('../services/db', () => ({
  addToQueue: vi.fn(),
  processQueue: vi.fn(),
}))

// Mock de la API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  getUser: vi.fn(() => null),
  setUser: vi.fn(),
  clearUser: vi.fn(),
}))

// Mock de useAuth
vi.mock('../models/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: { value: false },
    user: { value: null },
    login: vi.fn(),
    logout: vi.fn(),
  })),
}))
