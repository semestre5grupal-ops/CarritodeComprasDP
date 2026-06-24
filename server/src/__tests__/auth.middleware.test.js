/**
 * auth.middleware.test.js
 * ════════════════════════════════════════════════════════════════
 * Pruebas UNITARIAS del middleware de autenticación JWT.
 *
 * Tipo: Unitarias (no requieren base de datos)
 * Herramienta: Jest
 *
 * Cobertura:
 *   ✓ authenticate() - verifica tokens JWT válidos
 *   ✓ authenticate() - rechaza peticiones sin token
 *   ✓ authenticate() - rechaza tokens con formato inválido
 *   ✓ authenticate() - rechaza tokens expirados
 *   ✓ authenticate() - rechaza tokens con firma inválida
 *   ✓ requireAdmin() - permite acceso a usuarios admin
 *   ✓ requireAdmin() - deniega acceso a usuarios normales
 * ════════════════════════════════════════════════════════════════
 */
const jwt = require('jsonwebtoken')

// Mock del módulo de configuración para no depender de .env real
jest.mock('../config/env', () => ({
  JWT_SECRET: 'test_jwt_secret_key_para_pruebas_unitarias_2024',
  JWT_EXPIRES_IN: '1h',
}))

const { authenticate, requireAdmin } = require('../middleware/auth')

// ─── Helpers ────────────────────────────────────────────────────────────────
/**
 * Crea un mock de objeto Request de Express con el header dado
 */
function buildReq(authHeader = null) {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  }
}

/**
 * Crea un mock de objeto Response de Express
 */
function buildRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

/**
 * Genera un JWT válido de prueba con el payload dado
 */
function signToken(payload = {}, secret = 'test_jwt_secret_key_para_pruebas_unitarias_2024', options = {}) {
  return jwt.sign(
    { id: 1, username: 'testuser', email: 'test@test.com', role: 'user', ...payload },
    secret,
    { expiresIn: '1h', ...options }
  )
}

// ════════════════════════════════════════════════════════════════
// BLOQUE 1: Middleware authenticate()
// ════════════════════════════════════════════════════════════════
describe('Middleware authenticate()', () => {

  it('✓ Debe llamar a next() y adjuntar user al req con un token válido', () => {
    const token = signToken()
    const req = buildReq(`Bearer ${token}`)
    const res = buildRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeDefined()
    expect(req.user.id).toBe(1)
    expect(req.user.username).toBe('testuser')
    expect(req.user.email).toBe('test@test.com')
    expect(req.user.role).toBe('user')
  })

  it('✓ Debe retornar 401 si no hay header Authorization', () => {
    const req = buildReq()
    const res = buildRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'AUTH_REQUIRED' })
    )
  })

  it('✓ Debe retornar 401 si el formato del token es inválido (sin "Bearer")', () => {
    const token = signToken()
    const req = buildReq(token) // Sin "Bearer " al inicio
    const res = buildRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INVALID_TOKEN_FORMAT' })
    )
  })

  it('✓ Debe retornar 401 si el token está expirado', () => {
    // Genera un token que expira en -1 segundo (ya expirado)
    const token = signToken({}, 'test_jwt_secret_key_para_pruebas_unitarias_2024', { expiresIn: '-1s' })
    const req = buildReq(`Bearer ${token}`)
    const res = buildRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'TOKEN_EXPIRED' })
    )
  })

  it('✓ Debe retornar 401 si el token tiene una firma inválida', () => {
    const token = signToken({}, 'clave_incorrecta_para_forjar_token') // Firmado con otra clave
    const req = buildReq(`Bearer ${token}`)
    const res = buildRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'INVALID_TOKEN' })
    )
  })

  it('✓ Debe retornar 401 si el token es una cadena aleatoria (no JWT)', () => {
    const req = buildReq('Bearer esto_no_es_un_jwt_valido')
    const res = buildRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
  })
})

// ════════════════════════════════════════════════════════════════
// BLOQUE 2: Middleware requireAdmin()
// ════════════════════════════════════════════════════════════════
describe('Middleware requireAdmin()', () => {

  it('✓ Debe llamar a next() si el usuario tiene rol admin', () => {
    const req = { user: { id: 1, role: 'admin' } }
    const res = buildRes()
    const next = jest.fn()

    requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('✓ Debe retornar 403 si el usuario tiene rol user', () => {
    const req = { user: { id: 2, role: 'user' } }
    const res = buildRes()
    const next = jest.fn()

    requireAdmin(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'FORBIDDEN' })
    )
  })

  it('✓ Debe retornar 403 si no hay usuario en req', () => {
    const req = {}
    const res = buildRes()
    const next = jest.fn()

    requireAdmin(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
  })
})
